import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: any
  login: (token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  
  login: (token: string) => {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('token', token)
    set({ token })
  },
  
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },
  
  isAuthenticated: () => {
    const state = get()
    return !!state.token
  }
}))

