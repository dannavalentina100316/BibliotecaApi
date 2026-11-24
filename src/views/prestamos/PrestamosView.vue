<script setup>
import { onMounted, reactive, ref } from 'vue'
import { prestamosService, librosService, sociosService } from '../../services/modules.service'
import { errorMessage } from '../../services/api'
import { Plus, Search, RefreshCcw, CircleDollarSign, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const items = ref([])
const total = ref(0)
const skip = ref(0)
const limit = ref(10)
const estado = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const success = ref('')
const modal = ref(false)
const form = reactive({ libro_id:'', socio_id:'', fecha_prestamo:'', dias:14 })
const books = ref([])
const socios = ref([])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = { skip:skip.value, limit:limit.value }
    if (estado.value) params.estado = estado.value
    const { data } = await prestamosService.list(params)
    items.value = data.items || []
    total.value = data.total || 0
  } catch (err) { error.value = errorMessage(err, 'No fue posible cargar los préstamos.') }
  finally { loading.value = false }
}

async function openCreate() {
  try {
    const [booksRes, sociosRes] = await Promise.all([
      librosService.list({ limit:100, skip:0 }),
      sociosService.list({ limit:100, skip:0 }),
    ])
    books.value = (booksRes.data.items || []).filter((book)=>book.disponibles > 0)
    socios.value = sociosRes.data.items || []
  } catch (err) { error.value = errorMessage(err); return }
  modal.value = true
}

async function create() {
  submitting.value = true
  error.value = ''
  try {
    const payload = { libro_id:Number(form.libro_id), socio_id:Number(form.socio_id), dias:Number(form.dias) }
    if (form.fecha_prestamo) payload.fecha_prestamo = form.fecha_prestamo
    await prestamosService.create(payload)
    modal.value = false
    success.value = 'Préstamo registrado correctamente.'
    await load()
  } catch (err) { error.value = errorMessage(err) }
  finally { submitting.value = false }
}

async function returnLoan(item) {
  if (!window.confirm(`¿Registrar la devolución del préstamo #${item.id}?`)) return
  try {
    await prestamosService.returnLoan(item.id, {})
    success.value = 'Devolución registrada correctamente.'
    await load()
  } catch (err) { error.value = errorMessage(err) }
}

async function payFine(item) {
  if (!window.confirm(`¿Registrar el pago de la multa del préstamo #${item.id}?`)) return
  try {
    await prestamosService.payFine(item.id)
    success.value = 'Pago de multa registrado correctamente.'
    await load()
  } catch (err) { error.value = errorMessage(err) }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <div class="page-heading">
      <div><span class="eyebrow">Circulación</span><h1>Préstamos</h1><p style="margin:6px 0 0;color:var(--muted);font-size:12px">Controla préstamos, devoluciones y pagos de multas.</p></div>
      <button class="primary-button compact" @click="openCreate"><Plus :size="17" /> Nuevo préstamo</button>
    </div>
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert" style="background:var(--lavender);border-left:3px solid var(--violet)">{{ success }}</div>
    <div class="module-toolbar">
      <div class="filter-box"><Search :size="16" /><select v-model="estado" @change="skip=0;load()" style="width:100%;border:0;outline:0">
        <option value="">Todos los estados</option><option value="activo">Activos</option><option value="devuelto">Devueltos</option><option value="vencido">Vencidos</option>
      </select></div>
    </div>
    <section class="table-panel">
      <div v-if="loading" class="loading-state"><span class="spinner dark"></span> Cargando préstamos...</div>
      <template v-else>
        <table class="data-table">
          <thead><tr><th>ID</th><th>Libro</th><th>Socio</th><th>Préstamo</th><th>Vencimiento</th><th>Devolución</th><th>Multa</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>#{{ item.id }}</td>
              <td>{{ item.libro?.titulo || `Libro ${item.libro_id}` }}</td>
              <td>{{ item.socio?.nombre || `Socio ${item.socio_id}` }}</td>
              <td>{{ item.fecha_prestamo }}</td>
              <td>{{ item.fecha_limite }}</td>
              <td><span :class="['status', item.fecha_devolucion ? '' : 'inactive']">{{ item.fecha_devolucion || 'Pendiente' }}</span></td>
              <td>{{ item.multa ? item.multa.toLocaleString('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }) : '—' }}</td>
              <td><div class="actions">
                <button v-if="!item.fecha_devolucion" class="icon-button" @click="returnLoan(item)" title="Registrar devolución"><RefreshCcw :size="16" /></button>
                <button v-if="item.multa && !item.multa_pagada" class="icon-button" @click="payFine(item)" title="Registrar pago de multa"><CircleDollarSign :size="16" /></button>
              </div></td>
            </tr>
            <tr v-if="!items.length"><td colspan="8"><div class="empty-state">No hay préstamos disponibles.</div></td></tr>
          </tbody>
        </table>
        <div class="pagination"><span>{{ total }} registros</span><div class="pagination-controls">
          <button class="icon-button" :disabled="skip===0" @click="skip=Math.max(0,skip-limit);load()"><ChevronLeft :size="16" /></button>
          <button class="icon-button" :disabled="skip+limit>=total" @click="skip+=limit;load()"><ChevronRight :size="16" /></button>
        </div></div>
      </template>
    </section>

    <div v-if="modal" class="modal-backdrop" @click.self="modal=false">
      <section class="modal">
        <header class="modal-header"><h2>Registrar préstamo</h2><button class="icon-button" @click="modal=false"><X :size="18" /></button></header>
        <form class="modal-body" @submit.prevent="create">
          <div class="form-grid">
            <div class="form-group full"><label>Libro</label><select v-model="form.libro_id" required><option value="">Selecciona un libro disponible</option><option v-for="book in books" :key="book.id" :value="book.id">{{ book.titulo }} ({{ book.disponibles }} disponible)</option></select></div>
            <div class="form-group full"><label>Socio</label><select v-model="form.socio_id" required><option value="">Selecciona un socio</option><option v-for="socio in socios" :key="socio.id" :value="socio.id">{{ socio.nombre }}</option></select></div>
            <div class="form-group"><label>Fecha de préstamo</label><input v-model="form.fecha_prestamo" type="date" /></div>
            <div class="form-group"><label>Días de préstamo</label><input v-model="form.dias" type="number" min="1" max="30" required /></div>
          </div>
          <div class="modal-actions"><button type="button" class="secondary-button" @click="modal=false">Cancelar</button><button class="primary-button" :disabled="submitting" type="submit"><span v-if="submitting" class="spinner"></span><span v-else>Registrar</span></button></div>
        </form>
      </section>
    </div>
  </div>
</template>
