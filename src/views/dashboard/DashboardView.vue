<script setup>
import { onMounted, ref } from 'vue'
import { reportesService, prestamosService } from '../../services/modules.service'
import { errorMessage } from '../../services/api'
import { BookOpen, Users, RefreshCcw, TriangleAlert, ArrowUpRight, Library } from 'lucide-vue-next'

const summary = ref(null)
const topBooks = ref([])
const overdue = ref([])
const recentLoans = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [summaryRes, booksRes, overdueRes, loansRes] = await Promise.all([
      reportesService.summary(),
      reportesService.topBooks({ limite: 5, skip: 0 }),
      reportesService.overdue({ limit: 5, skip: 0 }),
      prestamosService.list({ limit: 6, skip: 0 }),
    ])
    summary.value = summaryRes.data
    topBooks.value = booksRes.data.items || []
    overdue.value = overdueRes.data.items || []
    recentLoans.value = loansRes.data.items || []
  } catch (err) {
    error.value = errorMessage(err, 'No fue posible cargar la información del dashboard.')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page dashboard-page">
    <div class="page-heading">
      <div><span class="eyebrow">Panel administrativo</span><h1>Resumen general</h1></div>
      <button class="primary-button compact" @click="load">Actualizar</button>
    </div>

    <div v-if="loading" class="loading-state"><span class="spinner dark"></span> Cargando información...</div>
    <div v-else-if="error" class="alert error">{{ error }}</div>

    <template v-else>
      <section class="stats-grid" aria-label="Estadísticas generales">
        <article class="stat-card"><div class="stat-icon"><Library :size="22" /></div><div><span>Libros registrados</span><strong>{{ summary?.total_libros ?? 0 }}</strong></div></article>
        <article class="stat-card"><div class="stat-icon"><BookOpen :size="22" /></div><div><span>Ejemplares</span><strong>{{ summary?.total_ejemplares ?? 0 }}</strong></div></article>
        <article class="stat-card"><div class="stat-icon"><RefreshCcw :size="22" /></div><div><span>Préstamos activos</span><strong>{{ summary?.total_prestados ?? 0 }}</strong></div></article>
        <article class="stat-card"><div class="stat-icon"><Users :size="22" /></div><div><span>Socios activos</span><strong>{{ summary?.total_socios_activos ?? 0 }}</strong></div></article>
      </section>

      <section class="dashboard-grid">
        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">Actividad</span><h2>Préstamos recientes</h2></div><RouterLink to="/prestamos" class="text-link">Ver todos <ArrowUpRight :size="16" /></RouterLink></div>
          <div v-if="recentLoans.length" class="loan-list">
            <div v-for="loan in recentLoans" :key="loan.id" class="loan-row">
              <div class="book-avatar"><BookOpen :size="18" /></div>
              <div><strong>{{ loan.libro?.titulo || `Préstamo #${loan.id}` }}</strong><span>{{ loan.socio?.nombre || 'Socio registrado' }}</span></div>
              <time>{{ loan.fecha_limite }}</time>
            </div>
          </div>
          <div v-else class="empty-state">No hay préstamos registrados.</div>
        </article>

        <article class="panel">
          <div class="panel-heading"><div><span class="eyebrow">Destacados</span><h2>Libros más prestados</h2></div></div>
          <div v-if="topBooks.length" class="ranking-list">
            <div v-for="(book, index) in topBooks" :key="`${book.titulo_libro}-${index}`" class="ranking-row">
              <span class="rank">{{ index + 1 }}</span>
              <div><strong>{{ book.titulo_libro }}</strong><span>{{ book.nombre_autor }}</span></div>
              <b>{{ book.total_prestamos }}</b>
            </div>
          </div>
          <div v-else class="empty-state">Aún no hay datos de préstamos.</div>
        </article>
      </section>

      <section class="notice-grid">
        <article class="notice-card"><TriangleAlert :size="20" /><div><span>Préstamos vencidos</span><strong>{{ summary?.total_vencidos ?? overdue.length }}</strong></div></article>
        <article class="notice-card"><RefreshCcw :size="20" /><div><span>Multas acumuladas</span><strong>{{ (summary?.total_multas_recaudadas ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }) }}</strong></div></article>
      </section>
    </template>
  </div>
</template>
