<script setup>
import { autoresService } from '../../services/modules.service'
import DataCrud from '../../components/common/DataCrud.vue'

const columns = [
  { key:'id', label:'ID' },
  { key:'nombre', label:'Nombre' },
  { key:'nacionalidad', label:'Nacionalidad' },
  { key:'anio_naci', label:'Año de nacimiento' },
]
const fields = [
  { key:'nombre', label:'Nombre', required:true, full:true },
  { key:'nacionalidad', label:'Nacionalidad' },
  { key:'anio_naci', label:'Año de nacimiento', type:'number', min:1000, max:2026 },
]
</script>

<template>
  <DataCrud title="Autores" description="Administra los autores registrados en la biblioteca."
    :columns="columns" :fields="fields" search-param="nacionalidad"
    :fetch-page="autoresService.list" :create-item="autoresService.create"
    :update-item="autoresService.update" :remove-item="autoresService.remove" />
</template>
