<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { errorMessage } from '../../services/api'
import { BookOpen, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ username: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.username || !form.password) {
    error.value = 'Ingresa tu usuario o correo y contraseña.'
    return
  }
  loading.value = true
  try {
    await auth.login(form.username.trim(), form.password)
    router.replace('/dashboard')
  } catch (err) {
    error.value = errorMessage(err, 'Usuario o contraseña incorrectos.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-visual" aria-label="Biblioteca Segura">
      <div class="login-brand">
        <div class="brand-mark"><BookOpen :size="24" /></div>
        <div><strong>Biblioteca</strong><span>SEGURA</span></div>
      </div>
      <div class="shelf-art" aria-hidden="true">
        <div class="arch"></div>
        <div class="book-stack">
          <span v-for="n in 7" :key="n" :class="`book book-${n}`"></span>
        </div>
        <div class="plant"><i></i><i></i><i></i><b></b></div>
      </div>
      <div class="login-quote">
        <ShieldCheck :size="22" />
        <p>Gestiona el conocimiento con seguridad y claridad.</p>
      </div>
    </section>

    <section class="login-panel">
      <form class="login-form" @submit.prevent="submit" novalidate>
        <span class="eyebrow">Portal administrativo</span>
        <h1>Bienvenido de nuevo</h1>
        <p class="login-subtitle">Ingresa tus credenciales para continuar.</p>

        <div v-if="error" class="alert error" role="alert">{{ error }}</div>

        <label for="username">Usuario o correo</label>
        <div class="field">
          <input id="username" v-model="form.username" autocomplete="username" placeholder="nombre@biblioteca.com" />
        </div>

        <label for="password">Contraseña</label>
        <div class="field password-field">
          <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="Ingresa tu contraseña" />
          <button type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
            <EyeOff v-if="showPassword" :size="18" />
            <Eye v-else :size="18" />
          </button>
        </div>

        <button class="primary-button login-button" :disabled="loading" type="submit">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Iniciar sesión</span>
          <ArrowRight v-if="!loading" :size="18" />
        </button>
      </form>
    </section>
  </main>
</template>
