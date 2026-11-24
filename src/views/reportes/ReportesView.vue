<script setup>
import { onMounted, ref } from 'vue'
import { reportesService } from '../../services/modules.service'
import { errorMessage } from '../../services/api'

const loading = ref(true)
const error = ref('')
const summary = ref(null)
const topBooks = ref([])
const categories = ref([])
const overdue = ref([])
const fines = ref([])
const authors = ref([])

onMounted(async () => {
  try {
    const [summaryRes, booksRes, categoriesRes, overdueRes, finesRes, authorsRes] = await Promise.all([
      reportesService.summary(),
      reportesService.topBooks({ limite:8, skip:0 }),
      reportesService.categories({ limit:8, skip:0 }),
      reportesService.overdue({ limit:8, skip:0 }),
      reportesService.fines({ limit:8, skip:0 }),
      reportesService.authors({ limit:8, skip:0 }),
    ])
    summary.value = summaryRes.data
    topBooks.value = booksRes.data.items || []
    categories.value = categoriesRes.data.items || []
    overdue.value = overdueRes.data.items || []
    fines.value = finesRes.data.items || []
    authors.value = authorsRes.data.items || []
  } catch (err) { error.value = errorMessage(err, 'No fue posible cargar los reportes.') }
  finally { loading.value = false }
})
</script>

<template>
  <div class="page">
    <div class="page-heading"><div><span class="eyebrow">Análisis</span><h1>Reportes</h1></div></div>
    <div v-if="loading" class="loading-state"><span class="spinner dark"></span> Cargando reportes...</div>
    <div v-else-if="error" class="alert error">{{ error }}</div>
    <template v-else>
      <section class="stats-grid">
        <article class="stat-card"><div><span>Total de libros</span><strong>{{ summary?.total_libros || 0 }}</strong></div></article>
        <article class="stat-card"><div><span>Ejemplares</span><strong>{{ summary?.total_ejemplares || 0 }}</strong></div></article>
        <article class="stat-card"><div><span>Préstamos vencidos</span><strong>{{ summary?.total_vencidos || 0 }}</strong></div></article>
        <article class="stat-card"><div><span>Multas recaudadas</span><strong>{{ (summary?.total_multas_recaudadas || 0).toLocaleString('es-CO') }}</strong></div></article>
      </section>
      <section class="report-grid" style="margin-top:14px">
        <article class="report-card"><h2>Libros más prestados</h2><div v-for="(row,i) in topBooks" :key="i" class="report-row"><span>{{ row.titulo_libro }} · {{ row.nombre_autor }}</span><strong>{{ row.total_prestamos }}</strong></div><div v-if="!topBooks.length" class="empty-state">Sin datos.</div></article>
        <article class="report-card"><h2>Libros por categoría</h2><div v-for="(row,i) in categories" :key="i" class="report-row"><span>{{ row.nombre_categoria }}</span><strong>{{ row.total_libros }}</strong></div><div v-if="!categories.length" class="empty-state">Sin datos.</div></article>
        <article class="report-card"><h2>Préstamos vencidos</h2><div v-for="(row,i) in overdue" :key="i" class="report-row"><span>{{ row.titulo_libro }} · {{ row.nombre_socio }}</span><strong>{{ row.dias_retraso }} días</strong></div><div v-if="!overdue.length" class="empty-state">Sin datos.</div></article>
        <article class="report-card"><h2>Socios con multas</h2><div v-for="(row,i) in fines" :key="i" class="report-row"><span>{{ row.nombre_socio }}</span><strong>{{ row.total_multas }}</strong></div><div v-if="!fines.length" class="empty-state">Sin datos.</div></article>
        <article class="report-card" style="grid-column:1/-1"><h2>Estadísticas por autor</h2><div v-for="(row,i) in authors" :key="i" class="report-row"><span>{{ row.nombre_autor }} · {{ row.total_libros }} libros · {{ row.total_ejemplares }} ejemplares</span><strong>{{ row.total_prestamos }} préstamos</strong></div><div v-if="!authors.length" class="empty-state">Sin datos.</div></article>
      </section>
    </template>
  </div>
</template>
