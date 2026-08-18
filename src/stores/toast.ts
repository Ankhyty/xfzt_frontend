import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([])

  function show(toast: Omit<ToastMessage, 'id'>) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const duration = toast.duration ?? 4000
    const newToast: ToastMessage = { ...toast, id }
    toasts.value.push(newToast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  function success(message: string, title = '操作成功') {
    show({ type: 'success', title, message })
  }

  function error(message: string, title = '发生错误') {
    show({ type: 'error', title, message, duration: 6000 })
  }

  function warning(message: string, title = '提示') {
    show({ type: 'warning', title, message })
  }

  function info(message: string, title = '信息') {
    show({ type: 'info', title, message })
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove
  }
})
