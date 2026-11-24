<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Search, Plus, Pencil, Trash2, Eye, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { errorMessage } from '../../services/api'

const props = defineProps({
  title: String,
  description: String,
  columns: Array,
  fields: Array,
  fetchPage: Function,
  createItem: Function,
  updateItem: Function,
  removeItem: Function,
  getItemLabel: { type: Function, default: (row) => row.nombre || row.titulo || `Registro #${row.id}` },
  allowCreate: { type: Boolean, default: true },
  allowEdit: { type: Boolean, default: true },
  allowDelete: { type: Boolean, default: true },
  searchParam: { type: String, default: 'buscar' },
  extraParams: { type: Object, default: () => ({}) },
})

const items = ref([])
const total = ref(0)
const skip = ref(0)
const limit = ref(10)
const search = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const success = ref('')
const modal = ref(false)
const editing = ref(null)
const form = reactive({})
const confirmDelete = ref(null)

const pages = computed(() => Math.ceil(total.value / limit.value))
const page = computed(() => Math.floor(skip.value / limit.value) + 1)

function resetForm(row = null) {
  props.fields.forEach((field) => {
    if (field.type === 'checkbox') form[field.key] = row ? Boolean(row[field.key]) : (field.default ?? false)
    else form[field.key] = row ? (row[field.key] ?? '') : (field.default ?? '')
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = { skip: skip.value, limit: limit.value, ...props.extraParams }
    if (search.value.trim()) params[props.searchParam] = search.value.trim()
    const { data } = await props.fetchPage(params)
    items.value = data.items || []
    total.value = data.total || 0
  } catch (err) {
    error.value = errorMessage(err, 'No fue posible cargar los registros.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  resetForm()
  modal.value = true
  success.value = ''
}

function openEdit(row) {
  editing.value = row
  resetForm(row)
  modal.value = true
}

async function submit() {
  submitting.value = true
  error.value = ''
  const payload = {}
  props.fields.forEach((field) => {
    if (form[field.key] !== '' && form[field.key] != null) {
      const value = field.type === 'number' ? Number(form[field.key]) : form[field.key]
      payload[field.key] = field.transform ? field.transform(value) : value
    }
  })
  try {
    if (editing.value) await props.updateItem(editing.value.id, payload)
    else await props.createItem(payload)
    modal.value = false
    success.value = editing.value ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.'
    await load()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function remove() {
  submitting.value = true
  error.value = ''
  try {
    await props.removeItem(confirmDelete.value.id)
    confirmDelete.value = null
    success.value = 'Registro eliminado correctamente.'
    await load()
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    submitting.value = false
  }
}

function valueFor(row, column) {
  if (column.format) return column.format(row)
  const value = row[column.key]
  if (value === null || value === undefined || value === '') return '—'
  return value
}

let timer
watch(search, () => {
  clearTimeout(timer)
  timer = setTimeout(() => { skip.value = 0; load() }, 350)
})

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div><span class="eyebrow">Gestión</span><h1>{{ title }}</h1><p style="margin:6px 0 0;color:var(--muted);font-size:12px">{{ description }}</p></div>
      <button v-if="allowCreate" class="primary-button compact" @click="openCreate"><Plus :size="17" /> Agregar</button>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert" style="background:var(--lavender);border-left:3px solid var(--violet)">{{ success }}</div>

    <div class="module-toolbar">
      <div class="filter-box"><Search :size="16" /><input v-model="search" :placeholder="`Buscar ${title.toLowerCase()}...`" :aria-label="`Buscar ${title}`" /></div>
    </div>

    <section class="table-panel">
      <div v-if="loading" class="loading-state"><span class="spinner dark"></span> Cargando registros...</div>
      <template v-else>
        <table class="data-table">
          <thead><tr><th v-for="column in columns" :key="column.key">{{ column.label }}</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="row in items" :key="row.id">
              <td v-for="column in columns" :key="column.key">
                <span v-if="column.status" :class="['status', !valueFor(row,column) ? 'inactive' : '']">{{ valueFor(row,column) }}</span>
                <template v-else>{{ valueFor(row,column) }}</template>
              </td>
              <td><div class="actions">
                <button v-if="allowEdit" class="icon-button" @click="openEdit(row)" :aria-label="`Editar ${getItemLabel(row)}`"><Pencil :size="16" /></button>
                <button v-if="allowDelete" class="icon-button danger" @click="confirmDelete=row" :aria-label="`Eliminar ${getItemLabel(row)}`"><Trash2 :size="16" /></button>
              </div></td>
            </tr>
            <tr v-if="!items.length"><td :colspan="columns.length + 1"><div class="empty-state">No hay registros disponibles.</div></td></tr>
          </tbody>
        </table>
        <div class="pagination">
          <span>{{ total }} registros · Página {{ page }} de {{ Math.max(pages, 1) }}</span>
          <div class="pagination-controls">
            <button class="icon-button" :disabled="skip === 0" @click="skip=Math.max(0,skip-limit);load()" aria-label="Página anterior"><ChevronLeft :size="16" /></button>
            <button class="icon-button" :disabled="skip + limit >= total" @click="skip=skip+limit;load()" aria-label="Página siguiente"><ChevronRight :size="16" /></button>
          </div>
        </div>
      </template>
    </section>

    <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
      <section class="modal" role="dialog" aria-modal="true">
        <header class="modal-header"><h2>{{ editing ? 'Editar registro' : 'Agregar registro' }}</h2><button class="icon-button" @click="modal=false" aria-label="Cerrar"><X :size="18" /></button></header>
        <form class="modal-body" @submit.prevent="submit">
          <div class="form-grid">
            <div v-for="field in fields" :key="field.key" :class="['form-group', { full: field.full }]">
              <label :for="`field-${field.key}`">{{ field.label }}</label>
              <select v-if="field.type==='select'" :id="`field-${field.key}`" v-model="form[field.key]" :required="field.required">
                <option value="">Selecciona una opción</option>
                <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <label v-else-if="field.type==='checkbox'" style="display:flex;align-items:center;gap:8px">
                <input :id="`field-${field.key}`" v-model="form[field.key]" type="checkbox" style="width:18px;min-height:18px" /> {{ field.checkboxLabel || field.label }}
              </label>
              <textarea v-else-if="field.type==='textarea'" :id="`field-${field.key}`" v-model="form[field.key]" :required="field.required"></textarea>
              <input v-else :id="`field-${field.key}`" v-model="form[field.key]" :type="field.type || 'text'" :required="field.required" :min="field.min" :max="field.max" />
            </div>
          </div>
          <div class="modal-actions"><button type="button" class="secondary-button" @click="modal=false">Cancelar</button><button class="primary-button" :disabled="submitting" type="submit"><span v-if="submitting" class="spinner"></span><span v-else>{{ editing ? 'Guardar cambios' : 'Crear registro' }}</span></button></div>
        </form>
      </section>
    </div>

    <div v-if="confirmDelete" class="modal-backdrop" @click.self="confirmDelete=null">
      <section class="modal" style="max-width:420px">
        <header class="modal-header"><h2>Confirmar eliminación</h2></header>
        <div class="modal-body"><p>¿Eliminar <strong>{{ getItemLabel(confirmDelete) }}</strong>? Esta acción no se puede deshacer.</p><div class="modal-actions"><button class="secondary-button" @click="confirmDelete=null">Cancelar</button><button class="primary-button" :disabled="submitting" @click="remove">Eliminar</button></div></div>
      </section>
    </div>
  </div>
</template>
