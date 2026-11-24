<script setup>
import { categoriasService } from '../../services/modules.service'
import DataCrud from '../../components/common/DataCrud.vue'

const columns = [{key:'id',label:'ID'}, {key:'nombre',label:'Nombre'}, {key:'descripcion',label:'Descripción'}]
const fields = [{key:'nombre',label:'Nombre',required:true,full:true}, {key:'descripcion',label:'Descripción',type:'textarea',full:true}]
</script>

<template>
  <DataCrud title="Categorías" description="Organiza el catálogo por colecciones temáticas."
    :columns="columns" :fields="fields" search-param="nombre"
    :fetch-page="categoriasService.list" :create-item="categoriasService.create"
    :update-item="categoriasService.update" :remove-item="categoriasService.remove" />
</template>
