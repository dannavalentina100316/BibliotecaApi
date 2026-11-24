<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  BookOpen, LayoutDashboard, Users, PenTool, Library, Handshake,
  RefreshCcw, BarChart3, LogOut, Search, Menu, X, Tags,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const open = ref(false)

const allItems = [
  { label: 'Resumen', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Libros', to: '/libros', icon: Library },
  { label: 'Autores', to: '/autores', icon: PenTool },
  { label: 'Categorías', to: '/categorias', icon: Tags },
  { label: 'Socios', to: '/socios', icon: Handshake },
  { label: 'Préstamos', to: '/prestamos', icon: RefreshCcw },
  { label: 'Usuarios', to: '/usuarios', icon: Users, staffOnly: true },
  { label: 'Reportes', to: '/reportes', icon: BarChart3, staffOnly: true },
]
const items = allItems.filter((item) => !item.staffOnly || auth.user?.rol !== 'socio')

async function logout() {
  await auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open }">
      <div class="brand">
        <div class="brand-mark"><BookOpen :size="22" /></div>
        <div><strong>Biblioteca</strong><span>SEGURA</span></div>
        <button class="sidebar-close" @click="open = false" aria-label="Cerrar menú"><X :size="20" /></button>
      </div>
      <nav class="nav-list" aria-label="Navegación principal">
        <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-item" :class="{ active: route.path === item.to }" @click="open = false">
          <component :is="item.icon" :size="19" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <button class="logout-button" @click="logout"><LogOut :size="18" /> Cerrar sesión</button>
    </aside>

    <div v-if="open" class="sidebar-overlay" @click="open = false"></div>

    <main class="main-area">
      <header class="topbar">
        <button class="menu-button" @click="open = true" aria-label="Abrir menú"><Menu :size="22" /></button>
        <div class="topbar-search">
          <Search :size="17" />
          <input aria-label="Buscar" placeholder="Buscar en la biblioteca..." />
        </div>
        <div class="user-chip">
          <div class="avatar">{{ auth.user?.nombre?.charAt(0) || 'U' }}</div>
          <div><strong>{{ auth.user?.nombre || 'Usuario' }}</strong><span>{{ auth.user?.rol || 'Sin rol' }}</span></div>
        </div>
      </header>
      <div class="content"><RouterView /></div>
    </main>
  </div>
</template>
