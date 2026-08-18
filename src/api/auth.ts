import { axiosInstance } from './client'
import { useConfigStore } from '../stores/config'
import type { ApiResponse, LoginResponseData, UserInfo } from '../types'

export async function loginApi(username: string, password: string): Promise<LoginResponseData> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 400))
    const isAdmin = username.toLowerCase() === 'admin'
    return {
      token: isAdmin ? 'mock_admin_token' : 'mock_author_token',
      user_info: {
        user_id: isAdmin ? 3 : 1,
        username,
        nickname: isAdmin ? '管理员晴天' : (username === 'writer_a' ? '阿莉' : '新番作者'),
        role: isAdmin ? 'admin' : 'author'
      }
    }
  }

  const res = await axiosInstance.post<ApiResponse<LoginResponseData>>('/api/v1/auth/login', {
    username,
    password
  })
  return res.data.data!
}

export async function registerApi(username: string, password: string, nickname?: string): Promise<{ user_id: number }> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 400))
    return { user_id: Date.now() }
  }

  const res = await axiosInstance.post<ApiResponse<{ user_id: number }>>('/api/v1/auth/register', {
    username,
    password,
    nickname
  })
  return res.data.data!
}

export async function getMeApi(): Promise<{ user_info: UserInfo }> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    return {
      user_info: {
        user_id: 1,
        username: 'writer_a',
        nickname: '阿莉',
        role: 'author'
      }
    }
  }

  const res = await axiosInstance.get<ApiResponse<{ user_info: UserInfo }>>('/api/v1/auth/me')
  return res.data.data!
}
