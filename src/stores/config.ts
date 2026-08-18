import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  // Use mock mode by default when running standalone, but easily toggleable
  const isMockMode = ref<boolean>(
    localStorage.getItem('xfzt_is_mock_mode') === null 
      ? true 
      : localStorage.getItem('xfzt_is_mock_mode') === 'true'
  )

  const apiBaseUrl = ref<string>(
    localStorage.getItem('xfzt_api_base_url') || 'http://localhost:8080'
  )

  function setMockMode(val: boolean) {
    isMockMode.value = val
    localStorage.setItem('xfzt_is_mock_mode', String(val))
  }

  function setApiBaseUrl(url: string) {
    apiBaseUrl.value = url.replace(/\/$/, '')
    localStorage.setItem('xfzt_api_base_url', apiBaseUrl.value)
  }

  return {
    isMockMode,
    apiBaseUrl,
    setMockMode,
    setApiBaseUrl
  }
})
