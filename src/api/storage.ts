import axios from 'axios'
import { axiosInstance } from './client'
import { useConfigStore } from '../stores/config'
import { useAuthStore } from '../stores/auth'
import { mockDataService } from '../services/mock'
import type { ApiResponse, PresignUploadResponseData, PresignFileRequest } from '../types'

export async function requestPresignUploadApi(
  card_id: string,
  next_version: string,
  files: PresignFileRequest[]
): Promise<PresignUploadResponseData> {
  const configStore = useConfigStore()
  const authStore = useAuthStore()

  if (configStore.isMockMode) {
    await new Promise((r) => setTimeout(r, 300))
    if (!authStore.userInfo) throw new Error('请先登录')
    return mockDataService.generatePresignTickets(
      card_id,
      next_version,
      files.map((f) => ({
        relative_path: f.relative_path,
        content_type: f.content_type,
        sha256: f.sha256
      })),
      authStore.userInfo
    )
  }

  const payload = {
    card_id,
    next_version,
    files: files.map((f) => ({
      relative_path: f.relative_path,
      content_type: f.content_type,
      sha256: f.sha256
    }))
  }

  const res = await axiosInstance.post<ApiResponse<PresignUploadResponseData>>(
    '/api/v1/storage/presign-upload',
    payload
  )
  return res.data.data!
}

/**
 * Direct PUT upload to Huawei Cloud OBS / S3 with progress tracking
 */
export async function directUploadToObs(
  uploadUrl: string,
  fileData: Blob | File | string,
  contentType: string,
  onProgress?: (progressEvent: { loaded: number; total: number; percentage: number }) => void
): Promise<void> {
  // If mock mode, simulate realistic chunked upload progress
  if (uploadUrl.startsWith('mock://')) {
    const totalSteps = 10
    const totalSize = typeof fileData === 'string' ? fileData.length : fileData.size
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 60))
      const loaded = Math.round((totalSize * i) / totalSteps)
      onProgress?.({
        loaded,
        total: totalSize,
        percentage: Math.round((i / totalSteps) * 100)
      })
    }
    return
  }

  // Real OBS PUT request (Direct to OBS bucket, no backend proxy)
  await axios.put(uploadUrl, fileData, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
    onUploadProgress: (evt) => {
      if (evt.total) {
        onProgress?.({
          loaded: evt.loaded,
          total: evt.total,
          percentage: Math.round((evt.loaded * 100) / evt.total)
        })
      }
    }
  })
}
