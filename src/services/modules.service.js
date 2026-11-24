import api from './api'

export const usuariosService = {
  list: (params) => api.get('/usuarios', { params }),
  create: (data) => api.post('/usuarios', data),
  role: (id, rol) => api.patch(`/usuarios/${id}/rol`, { rol }),
  active: (id, activo) => api.patch(`/usuarios/${id}/activo`, { activo }),
}

export const autoresService = {
  list: (params) => api.get('/autores', { params }),
  get: (id) => api.get(`/autores/${id}`),
  create: (data) => api.post('/autores', data),
  update: (id, data) => api.patch(`/autores/${id}`, data),
  remove: (id) => api.delete(`/autores/${id}`),
}

export const librosService = {
  list: (params) => api.get('/libros', { params }),
  get: (id) => api.get(`/libros/${id}`),
  create: (data) => api.post('/libros', data),
  update: (id, data) => api.patch(`/libros/${id}`, data),
  remove: (id) => api.delete(`/libros/${id}`),
}

export const categoriasService = {
  list: (params) => api.get('/categorias', { params }),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.patch(`/categorias/${id}`, data),
  remove: (id) => api.delete(`/categorias/${id}`),
}

export const sociosService = {
  list: (params) => api.get('/socios', { params }),
  get: (id) => api.get(`/socios/${id}`),
  create: (data) => api.post('/socios', data),
  update: (id, data) => api.patch(`/socios/${id}`, data),
  remove: (id) => api.delete(`/socios/${id}`),
  loans: (id, params) => api.get(`/socios/${id}/prestamos`, { params }),
}

export const prestamosService = {
  list: (params) => api.get('/prestamos', { params }),
  get: (id) => api.get(`/prestamos/${id}`),
  create: (data) => api.post('/prestamos', data),
  returnLoan: (id, data) => api.post(`/prestamos/${id}/devolucion`, data),
  payFine: (id) => api.post(`/prestamos/${id}/pago-multa`),
}

export const reportesService = {
  summary: () => api.get('/reportes/resumen'),
  topBooks: (params) => api.get('/reportes/libros-mas-prestados', { params }),
  categories: (params) => api.get('/reportes/categorias', { params }),
  overdue: (params) => api.get('/reportes/prestamos-vencidos', { params }),
  fines: (params) => api.get('/reportes/socios-con-multas', { params }),
  authors: (params) => api.get('/reportes/autores', { params }),
}
