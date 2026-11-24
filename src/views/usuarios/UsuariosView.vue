<script setup>
import { computed, ref } from 'vue'
import { usuariosService } from '../../services/modules.service'
import DataCrud from '../../components/common/DataCrud.vue'

const columns = [
  {key:'id',label:'ID'}, {key:'nombre',label:'Nombre'}, {key:'email',label:'Correo'},
  {key:'rol',label:'Rol'}, {key:'activo',label:'Estado',status:true,format:(r)=>r.activo?'Activo':'Inactivo'},
]
const fields = [
  {key:'nombre',label:'Nombre',required:true},
  {key:'email',label:'Correo',type:'email',required:true},
  {key:'password',label:'Contraseña',type:'password',required:true},
  {key:'rol',label:'Rol',type:'select',required:true,options:[{value:'admin',label:'Administrador'},{value:'bibliotecario',label:'Bibliotecario'}]},
]
</script>

<template>
  <DataCrud title="Usuarios" description="Gestiona cuentas administrativas y roles."
    :columns="columns" :fields="fields" search-param="email"
    :fetch-page="usuariosService.list" :create-item="usuariosService.create"
    :allow-edit="false" :allow-delete="false" />
</template>
