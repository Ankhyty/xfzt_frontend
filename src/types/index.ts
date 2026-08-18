// Common API Response wrapper
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

// User & Auth
export type UserRole = 'guest' | 'author' | 'admin'

export interface UserInfo {
  user_id: number
  username: string
  nickname: string
  role?: UserRole
}

export interface LoginResponseData {
  token: string
  user_info: UserInfo
}

// Gallery & Card Models
export interface ImageAssetItem {
  relative_path: string
  url: string
  sha256?: string
}

export interface ContentAssets {
  text_url: string
  text_sha256: string
  images: ImageAssetItem[]
  images_thumb: ImageAssetItem[]
}

export interface CardOwner {
  user_id: number
  username: string
  nickname: string
}

export interface CardItem {
  card_id: string
  anime_name: string
  season_tag: string // e.g. "2026-07"
  owner: CardOwner
  editable: boolean
  current_version: string // e.g. "v1", "v2"
  all_version: string[] // e.g. ["v1", "v2"]
  updated_at: string
  created_at?: string
  content_assets: ContentAssets
  
  // Extra loaded payload for display (fetched from text_url or local cache)
  articleContent?: ArticleContent
}

export interface ArticleContent {
  summary: string // 一句话简评
  score: number // 0 ~ 10, e.g. 9.5
  content: string // 正文 markdown
}

// Season Models
export interface SeasonItem {
  season_id: number
  name: string // "YYYY-MM" (Month in 01, 04, 07, 10)
  deadline: number | null // Unix timestamp in seconds, null for infinite
  animes: string[]
  created_at: string
}

// OBS Upload Models
export interface UploadTicket {
  relative_path: string
  upload_url: string
  http_method: 'PUT'
  headers: Record<string, string>
}

export interface PresignUploadResponseData {
  card_id: string
  version: string
  upload_tickets: UploadTicket[]
}

export interface PresignFileRequest {
  relative_path: string
  content_type: string
  sha256?: string
  fileObj?: File | Blob
}

export interface CommitFileItem {
  relative_path: string
  content_type: string
  sha256: string
}

// Season Export Manifest
export interface SeasonExportCard {
  card_id: string
  owner: CardOwner
  current_version: string
  files: {
    relative_path: string
    url: string
    sha256: string
  }[]
}

export interface SeasonExportData {
  season: string
  total_cards: number
  bucket_base: string
  cards: SeasonExportCard[]
  generated_at: string
}
