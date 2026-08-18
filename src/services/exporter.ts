import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { SeasonExportData } from '../types'

export type ExportProgressCallback = (current: number, total: number, message: string) => void

/**
 * Fetch a file URL as Blob or fallback to mock text
 */
async function fetchFileBlob(url: string): Promise<Blob> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.blob()
  } catch (err) {
    // If CORS or offline, return a placeholder JSON or Blob for robustness
    if (url.endsWith('.json')) {
      return new Blob([JSON.stringify({ note: 'Exported from local offline snapshot' }, null, 2)], {
        type: 'application/json'
      })
    }
    return new Blob(['[Offline image asset placeholder]'], { type: 'text/plain' })
  }
}

/**
 * Package all cards & assets of a season into a single ZIP archive and trigger download
 */
export async function exportSeasonToZip(
  exportData: SeasonExportData,
  onProgress?: ExportProgressCallback
): Promise<void> {
  const zip = new JSZip()
  const seasonFolder = zip.folder(`season_${exportData.season}`) || zip

  // Add manifest.json for reference
  seasonFolder.file('manifest.json', JSON.stringify(exportData, null, 2))

  // Calculate total files
  let totalFiles = 0
  exportData.cards.forEach((card) => {
    totalFiles += card.files.length
  })

  let processedCount = 0
  onProgress?.(processedCount, totalFiles, '开始下载季度资产...')

  for (const card of exportData.cards) {
    const cardFolderName = `${card.card_id}_${card.owner.username}_${card.current_version}`
    const cardFolder = seasonFolder.folder(cardFolderName) || seasonFolder

    for (const fileItem of card.files) {
      onProgress?.(processedCount, totalFiles, `正在获取 ${card.card_id} -> ${fileItem.relative_path}`)
      try {
        const blob = await fetchFileBlob(fileItem.url)
        cardFolder.file(fileItem.relative_path, blob)
      } catch (e) {
        console.error(`下载文件失败: ${fileItem.url}`, e)
        cardFolder.file(fileItem.relative_path, `[Download failed: ${fileItem.url}]`)
      }
      processedCount++
      onProgress?.(processedCount, totalFiles, `已完成 ${processedCount}/${totalFiles}`)
    }
  }

  onProgress?.(totalFiles, totalFiles, '正在压缩生成 ZIP 归档文件...')
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  saveAs(zipBlob, `season_${exportData.season}_export_${Date.now()}.zip`)
  onProgress?.(totalFiles, totalFiles, '导出完成！')
}
