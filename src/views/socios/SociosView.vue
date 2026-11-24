<script setup>
import { sociosService } from '../../services/modules.service'
import DataCrud from '../../components/common/DataCrud.vue'

const columns = [
  {key:'id',label:'ID'}, {key:'nombre',label:'Nombre'}, {key:'email',label:'Correo'},
  {key:'telefono',label:'Teléfono'}, {key:'activo',label:'Estado',status:true,format:(r)=>r.activo?'Activo':'Inactivo'},
  {key:'fecha_alta',label:'Fecha de afiliación'},
]
const fields = [
  {key:'nombre',label:'Nombre',required:true},
  {key:'email',label:'Correo',type:'email',required:true},
  {key:'telefono',label:'Teléfono'},
  {key:'activo',label:'Estado',type:'checkbox',checkboxLabel:'Socio activo',default:true},
]
</script>

<template>
  <DataCrud title="Socios" description="Gestiona los datos y el estado de los miembros."
    :columns="columns" :fields="fields" search-param="nombre"
    :fetch-page="sociosService.list" :create-item="sociosService.create"
    :update-item="sociosService.update" :remove-item="sociosService.remove" />
</template>
