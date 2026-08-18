import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, UserRole } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('xfzt_token') || null)
  
  const userInfo = ref<UserInfo | null>(
    localStorage.getItem('xfzt_user_info')
      ? JSON.parse(localStorage.getItem('xfzt_user_info')!)
      : null
  )

  const isLoggedIn = computed(() => Boolean(token.value && userInfo.value))
  
  const role = computed<UserRole>(() => {
    if (!isLoggedIn.value || !userInfo.value) return 'guest'
    if (userInfo.value.role) return userInfo.value.role
    if (userInfo.value.username === 'admin') return 'admin'
    return 'author'
  })

  const isAuthor = computed(() => role.value === 'author' || role.value === 'admin')
  const isAdmin = computed(() => role.value === 'admin')

  function setAuth(newToken: string, user: UserInfo) {
    token.value = newToken
    userInfo.value = user
    localStorage.setItem('xfzt_token', newToken)
    localStorage.setItem('xfzt_user_info', JSON.stringify(user))
  }

  function switchMockRole(newRole: UserRole) {
    if (newRole === 'guest') {
      logout()
      return
    }
    if (newRole === 'admin') {
      setAuth('mock_admin_token', {
        user_id: 3,
        username: 'admin',
        nickname: '管理员晴天',
        role: 'admin'
      })
    } else {
      setAuth('mock_author_token', {
        user_id: 1,
        username: 'writer_a',
        nickname: '阿莉',
        role: 'author'
      })
    }
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('xfzt_token')
    localStorage.removeItem('xfzt_user_info')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    role,
    isAuthor,
    isAdmin,
    setAuth,
    switchMockRole,
    logout
  }
})
