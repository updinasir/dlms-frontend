import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Concurrency control for token refresh
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb)
}

const onRefreshed = () => {
  const subscribers = [...refreshSubscribers]
  refreshSubscribers = []
  subscribers.forEach((cb) => cb())
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error || {}
    if (!response) return Promise.reject(error)

    // Only handle 401 once per request
    if (response.status === 401) {
      const originalRequest = config || {}

      // Do not attempt refresh for login/register so UI can surface errors
      const url = (originalRequest.url || '').toString()
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return Promise.reject(error)
      }
      // For refresh endpoint failure, force logout
      if (url.includes('/auth/refresh')) {
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (originalRequest._retry) {
        localStorage.removeItem('user')
        localStorage.removeItem('permissions')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        api
          .post('/auth/refresh')
          .then(() => {
            isRefreshing = false
            onRefreshed()
          })
          .catch((err) => {
            isRefreshing = false
            refreshSubscribers = []
            localStorage.removeItem('user')
            localStorage.removeItem('permissions')
            window.location.href = '/login'
          })
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(api(originalRequest))
        })
      })
    }

    return Promise.reject(error)
  }
)

export default api
