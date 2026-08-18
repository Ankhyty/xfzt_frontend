import { axiosInstance } from './client'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import { mockDataService } from '../services/mock'
import type { ApiResponse, CardItem } from '../types'

export interface GalleryItemsResponse {
  items: CardItem[]
  total: number
}

export async function getGalleryItemsApi(season?: string): Promise<GalleryItemsResponse> {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 200))
    const mockRes = mockDataService.getGalleryItems(season, authStore.userInfo)
    return {
      items: mockRes.items,
      total: mockRes.total
    }
  }

  const params: Record<string, string> = {}
  if (season && season !== 'ALL') {
    params.season = season
  }

  const res = await axiosInstance.get<ApiResponse<GalleryItemsResponse>>('/api/v1/gallery/items', {
    params
  })
  return res.data.data!
}
