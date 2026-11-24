<script setup>
import { onMounted, ref } from 'vue'
import { autoresService, categoriasService, librosService } from '../../services/modules.service'
import DataCrud from '../../components/common/DataCrud.vue'

const authorOptions = ref([])
const categoryOptions = ref([])
const fields = ref([])

const columns = [
  { key:'id', label:'ID' },
  { key:'titulo', label:'Título' },
  { key:'isbn', label:'ISBN' },
  { key:'autor', label:'Autor', format:(row)=>row.autor?.nombre || '—' },
  { key:'anio_publicacion', label:'Año' },
  { key:'ejemplares', label:'Ejemplares' },
  { key:'disponibles', label:'Disponibles', status:true, format:(row)=>row.disponibles > 0 ? `${row.disponibles} disponibles` : 'No disponible' },
]

onMounted(async () => {
  try {
    const [authors, categories] = await Promise.all([
      autoresService.list({ limit:100, skip:0 }),
      categoriasService.list({ limit:100, skip:0 }),
    ])
    authorOptions.value = (authors.data.items || []).map((item)=>({ value:item.id, label:item.nombre }))
    categoryOptions.value = (categories.data.items || []).map((item)=>({ value:item.id, label:item.nombre }))
  } finally {
    fields.value = [
      { key:'titulo', label:'Título', required:true, full:true },
      { key:'isbn', label:'ISBN', required:true, full:true, min:1000000000000 },
      { key:'anio_publicacion', label:'Año de publicación', type:'number', required:true, min:1450, max:2026 },
      { key:'ejemplares', label:'Ejemplares', type:'number', required:true, min:1, max:50 },
      { key:'autor_id', label:'Autor', type:'select', required:true, options:authorOptions.value },
      { key:'categoria_ids', label:'Categorías (IDs separados por coma)', required:true, transform:(value)=>value.split(',').map((id)=>Number(id.trim())).filter(Boolean) },
    ]
  }
})
</script>

<template>
  <DataCrud v-if="fields.length" title="Libros" description="Administra el catálogo, autores y disponibilidad."
    :columns="columns" :fields="fields" search-param="buscar"
    :fetch-page="librosService.list" :create-item="librosService.create"
    :update-item="librosService.update" :remove-item="librosService.remove" />
</template>
