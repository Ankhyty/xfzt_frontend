import { axiosInstance } from './client'
import { useConfigStore } from '../stores/config'
import { mockDataService } from '../services/mock'
import type { ApiResponse, SeasonItem, SeasonExportData } from '../types'

export async function getSeasonsApi(): Promise<SeasonItem[]> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 150))
    return mockDataService.getSeasons()
  }

  const res = await axiosInstance.get<ApiResponse<{ total: number; items: SeasonItem[] }>>('/api/v1/seasons')
  return res.data.data!.items
}

export async function createSeasonApi(
  name: string,
  deadline?: number | null,
  animes: string[] = []
): Promise<SeasonItem> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 300))
    return mockDataService.createSeason(name, deadline, animes)
  }

  const res = await axiosInstance.post<ApiResponse<SeasonItem>>('/api/v1/seasons', {
    name,
    deadline,
    animes
  })
  return res.data.data!
}

export async function updateSeasonDeadlineApi(
  season_id: number,
  deadline: number | null
): Promise<void> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 200))
    mockDataService.updateDeadline(season_id, deadline)
    return
  }

  await axiosInstance.put<ApiResponse<null>>(`/api/v1/seasons/${season_id}/deadline`, {
    deadline
  })
}

export async function updateSeasonAnimesApi(
  season_id: number,
  animes: string[]
): Promise<string[]> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 200))
    return mockDataService.updateAnimes(season_id, animes)
  }

  const res = await axiosInstance.put<ApiResponse<{ animes: string[] }>>(
    `/api/v1/seasons/${season_id}/animes`,
    { animes }
  )
  return res.data.data!.animes
}

export async function addAnimeToSeasonApi(
  season_id: number,
  anime_name: string
): Promise<SeasonItem> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 200))
    return mockDataService.addAnimeToSeason(season_id, anime_name)
  }

  const res = await axiosInstance.post<ApiResponse<SeasonItem>>(
    `/api/v1/seasons/${season_id}/animes`,
    { anime_name }
  )
  return res.data.data!
}

export async function getSeasonExportApi(season_id: number): Promise<SeasonExportData> {
  const configStore = useConfigStore()
  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 350))
    return mockDataService.getSeasonExport(season_id)
  }

  const res = await axiosInstance.get<ApiResponse<SeasonExportData>>(
    `/api/v1/seasons/${season_id}/export`
  )
  return res.data.data!
}
