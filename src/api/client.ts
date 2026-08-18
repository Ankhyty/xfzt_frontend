import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import { useToastStore } from '../stores/toast'
import { etagCache } from '../services/cache'
import type { ApiResponse } from '../types'

const axiosInstance = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: Base URL, Auth Header, ETag Header
axiosInstance.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const configStore = useConfigStore()

  if (config.url && !config.url.startsWith('http')) {
    config.baseURL = configStore.apiBaseUrl
  }

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }

  // Check if ETag exists in cache for GET requests
  if (config.method?.toLowerCase() === 'get' && config.url) {
    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`
    const cachedEtag = etagCache.getEtag(cacheKey)
    if (cachedEtag) {
      config.headers['If-None-Match'] = cachedEtag
    }
  }

  return config
})

// Response interceptor: ETag Cache Storage, 304 Handling, Error Toast
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Check if response has ETag
    const etag = response.headers['etag'] || response.headers['ETag']
    if (etag && response.config.method?.toLowerCase() === 'get' && response.config.url) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`
      etagCache.set(cacheKey, etag, response.data)
    }
    return response
  },
  (error) => {
    const toastStore = useToastStore()

    // 304 Not Modified: Return cached response!
    if (error.response?.status === 304) {
      const cacheKey = `${error.config?.url}_${JSON.stringify(error.config?.params || {})}`
      const cached = etagCache.get(cacheKey)
      if (cached) {
        toastStore.info('内容未变更，已为您呈现本地最新缓存数据', 'ETag 校验命中')
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK (304 Cache Hit)',
          headers: error.response.headers,
          config: error.config
        })
      }
    }

    // 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.data?.retry_after || 60
      const retryMinutes = Math.ceil(retryAfter / 60)
      toastStore.warning(
        error.response.data?.message || `操作过于频繁，请 ${retryMinutes} 分钟后再试`,
        '触发访问频次限制 (429)'
      )
      return Promise.reject(error)
    }

    // 401 Unauthorized
    if (error.response?.status === 401) {
      toastStore.error(error.response.data?.message || '登录已过期或未授权，请重新登录', '认证失败')
      return Promise.reject(error)
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      toastStore.error(error.response.data?.message || '您没有执行该操作的权限', '权限拒绝')
      return Promise.reject(error)
    }

    // 400 Bad Request & others
    const msg = error.response?.data?.message || error.message || '网络请求发生异常'
    toastStore.error(msg, '请求失败')
    return Promise.reject(error)
  }
)

export { axiosInstance }
