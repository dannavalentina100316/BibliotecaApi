import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('biblioteca_access_token')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('biblioteca_access_token')
      localStorage.removeItem('biblioteca_refresh_token')
      localStorage.removeItem('biblioteca_user')
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error, fallback = 'No fue posible completar la solicitud.') {
  return error.response?.data?.detail || error.message || fallback
}

export default api
