import { axiosInstance } from './client'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import { mockDataService } from '../services/mock'
import type { ApiResponse, CardItem, CommitFileItem } from '../types'

export async function getCardDetailApi(card_id: string, version?: string): Promise<CardItem> {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 200))
    const { card } = mockDataService.getCardDetail(card_id, version, authStore.userInfo)
    return card
  }

  const params: Record<string, string> = {}
  if (version) params.version = version

  const res = await axiosInstance.get<ApiResponse<{ total: number; items: CardItem[] }>>(
    `/api/v1/cards/${card_id}`,
    { params }
  )
  return res.data.data!.items[0]
}

export async function createCardApi(anime_name: string, season_tag: string): Promise<CardItem> {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 300))
    if (!authStore.userInfo) throw new Error('请先登录')
    return mockDataService.createCard(anime_name, season_tag, authStore.userInfo)
  }

  const res = await axiosInstance.post<ApiResponse<CardItem>>('/api/v1/cards', {
    anime_name,
    season_tag
  })
  return res.data.data!
}

export async function commitCardVersionApi(
  card_id: string,
  version: string,
  commit_message?: string,
  files?: CommitFileItem[]
): Promise<{ current_version: string }> {
  const configStore = useConfigStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 400))
    return { current_version: version }
  }

  const res = await axiosInstance.post<ApiResponse<{ current_version: string }>>(
    `/api/v1/cards/${card_id}/commit`,
    {
      version,
      commit_message: commit_message || '',
      files: files || []
    }
  )
  return res.data.data!
}

export async function rollbackCardApi(card_id: string, target_version: string): Promise<{ current_version: string }> {
  const configStore = useConfigStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 300))
    const updated = mockDataService.rollbackCard(card_id, target_version)
    return { current_version: updated.current_version }
  }

  const res = await axiosInstance.post<ApiResponse<{ current_version: string }>>(
    `/api/v1/cards/${card_id}/rollback`,
    {
      target_version
    }
  )
  return res.data.data!
}

export async function deleteCardApi(card_id: string): Promise<{ card_id: string }> {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 300))
    if (!authStore.userInfo) throw new Error('请先登录')
    return mockDataService.deleteCard(card_id, authStore.userInfo)
  }

  const res = await axiosInstance.delete<ApiResponse<{ card_id: string }>>(`/api/v1/cards/${card_id}`)
  return res.data.data!
}

