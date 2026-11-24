import { defineStore } from 'pinia'
import { authService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('biblioteca_access_token'),
    refreshToken: localStorage.getItem('biblioteca_refresh_token'),
    user: JSON.parse(localStorage.getItem('biblioteca_user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
  },
  actions: {
    async login(username, password) {
      const { data } = await authService.login(username, password)
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token
      localStorage.setItem('biblioteca_access_token', data.access_token)
      localStorage.setItem('biblioteca_refresh_token', data.refresh_token)
      await this.loadUser()
    },
    async loadUser() {
      const { data } = await authService.me()
      this.user = data
      localStorage.setItem('biblioteca_user', JSON.stringify(data))
    },
    async logout() {
      try {
        if (this.refreshToken) await authService.logout(this.refreshToken)
      } finally {
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        localStorage.removeItem('biblioteca_access_token')
        localStorage.removeItem('biblioteca_refresh_token')
        localStorage.removeItem('biblioteca_user')
      }
    },
  },
})
