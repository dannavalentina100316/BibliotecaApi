import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        { path: '', redirect: '/dashboard' },
        { path: 'dashboard', name: 'dashboard', component: () => import('../views/dashboard/DashboardView.vue') },
        { path: 'libros', name: 'libros', component: () => import('../views/libros/LibrosView.vue') },
        { path: 'autores', name: 'autores', component: () => import('../views/autores/AutoresView.vue') },
        { path: 'socios', name: 'socios', component: () => import('../views/socios/SociosView.vue') },
        { path: 'prestamos', name: 'prestamos', component: () => import('../views/prestamos/PrestamosView.vue') },
        { path: 'usuarios', name: 'usuarios', component: () => import('../views/usuarios/UsuariosView.vue') },
        { path: 'reportes', name: 'reportes', component: () => import('../views/reportes/ReportesView.vue') },
        { path: 'categorias', name: 'categorias', component: () => import('../views/categorias/CategoriasView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return { name: 'login' }
  if (to.meta.public && auth.isAuthenticated) return { name: 'dashboard' }
})

export default router
