import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMeApi } from '../api/auth'
import type { UserInfo, UserRole } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('xfzt_token') || null)
  
  let initialUser: UserInfo | null = null
  try {
    const raw = localStorage.getItem('xfzt_user_info')
    if (raw && raw !== 'undefined' && raw !== 'null') {
      initialUser = JSON.parse(raw)
    }
  } catch (e) {
    localStorage.removeItem('xfzt_user_info')
  }

  const userInfo = ref<UserInfo | null>(initialUser)

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
    try {
      localStorage.setItem('xfzt_token', newToken)
      localStorage.setItem('xfzt_user_info', JSON.stringify(user))
    } catch (e) {}
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

  async function fetchCurrentUser(): Promise<UserInfo | null> {
    if (!token.value) return null
    try {
      const res = await getMeApi()
      if (res && res.user_info) {
        userInfo.value = res.user_info
        try {
          localStorage.setItem('xfzt_user_info', JSON.stringify(res.user_info))
        } catch (e) {}
        return res.user_info
      }
    } catch (e) {
      console.warn('Failed to refresh user info via /auth/me', e)
    }
    return null
  }

  function logout() {
    token.value = null
    userInfo.value = null
    try {
      localStorage.removeItem('xfzt_token')
      localStorage.removeItem('xfzt_user_info')
    } catch (e) {}
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
    fetchCurrentUser,
    logout
  }
})
