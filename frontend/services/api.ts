import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
}

export const papersAPI = {
  search: (query: string, filters?: any) =>
    api.get('/papers/search', { params: { query, ...filters } }),
  
  getById: (id: string) =>
    api.get(`/papers/${id}`),
}

export const workspaceAPI = {
  getAll: () =>
    api.get('/workspaces'),
  
  create: (data: any) =>
    api.post('/workspaces', data),
  
  getById: (id: string) =>
    api.get(`/workspaces/${id}`),
  
  getPapers: (id: string) =>
    api.get(`/workspaces/${id}/papers`),
  
  addPaper: (workspaceId: string, paperData: any) =>
    api.post(`/workspaces/${workspaceId}/papers`, paperData),
  
  removePaperFromWorkspace: (workspaceId: string, paperId: string) =>
    api.delete(`/workspaces/${workspaceId}/papers/${paperId}`),
  
  delete: (id: string) =>
    api.delete(`/workspaces/${id}`),
}

export const aiAPI = {
  chat: (data: any) =>
    api.post('/ai/chat', data),
  
  generateReview: (paperIds: string[]) =>
    api.post('/ai/literature-review', { paper_ids: paperIds }),
  
  // ADD THESE NEW METHODS:
  summarize: (paperId: string) =>
    api.post(`/ai/summarize/${paperId}`),
  
  getSummaries: (paperIds: string[]) =>
    api.post('/ai/summaries', { paper_ids: paperIds }),
  
  insights: (paperIds: string[]) =>
    api.post('/ai/insights', { paper_ids: paperIds }),
}

export default api



