import { calculateSha256 } from './crypto'

export interface ProcessedImageResult {
  originalName: string
  baseName: string // e.g. "cover" from "cover.png"
  originalFile: {
    blob: Blob
    relativePath: string // "images/cover.webp"
    contentType: string // "image/webp"
    sha256: string
    previewUrl: string
  }
  thumbFile: {
    blob: Blob
    relativePath: string // "images_thumb/cover_thumb.webp"
    contentType: string // "image/webp"
    sha256: string
    previewUrl: string
  }
}

/**
 * Load a File/Blob into an HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(new Error('无法解析图片文件'))
    }
    img.src = url
  })
}

/**
 * Draw image to Canvas and export as WebP Blob
 */
function canvasToWebpBlob(canvas: HTMLCanvasElement, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas WebP 导出失败'))
      },
      'image/webp',
      quality
    )
  })
}

/**
 * Process uploaded image file:
 * 1. Convert original to WebP
 * 2. Generate downscaled thumbnail WebP (max 480px width/height)
 * 3. Calculate SHA-256 for both
 */
export async function processImageFile(file: File): Promise<ProcessedImageResult> {
  const img = await loadImage(file)
  
  // Extract filename without extension, sanitize special chars
  const rawBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
  const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() || `image_${Date.now()}`

  // 1. Original Image Canvas (Keep full resolution or cap at 2560px for sanity)
  const maxOriginalDim = 2560
  let origWidth = img.naturalWidth || img.width
  let origHeight = img.naturalHeight || img.height

  if (origWidth > maxOriginalDim || origHeight > maxOriginalDim) {
    if (origWidth > origHeight) {
      origHeight = Math.round((origHeight * maxOriginalDim) / origWidth)
      origWidth = maxOriginalDim
    } else {
      origWidth = Math.round((origWidth * maxOriginalDim) / origHeight)
      origHeight = maxOriginalDim
    }
  }

  const origCanvas = document.createElement('canvas')
  origCanvas.width = origWidth
  origCanvas.height = origHeight
  const origCtx = origCanvas.getContext('2d')
  if (!origCtx) throw new Error('无法创建 2D 上下文')
  origCtx.drawImage(img, 0, 0, origWidth, origHeight)
  const origBlob = await canvasToWebpBlob(origCanvas, 0.88)
  const origSha256 = await calculateSha256(origBlob)
  const origPreview = URL.createObjectURL(origBlob)

  // 2. Thumbnail Canvas (Max 480px)
  const maxThumbDim = 480
  let thumbWidth = img.naturalWidth || img.width
  let thumbHeight = img.naturalHeight || img.height

  if (thumbWidth > maxThumbDim || thumbHeight > maxThumbDim) {
    if (thumbWidth > thumbHeight) {
      thumbHeight = Math.round((thumbHeight * maxThumbDim) / thumbWidth)
      thumbWidth = maxThumbDim
    } else {
      thumbWidth = Math.round((thumbWidth * maxThumbDim) / thumbHeight)
      thumbHeight = maxThumbDim
    }
  }

  const thumbCanvas = document.createElement('canvas')
  thumbCanvas.width = thumbWidth
  thumbCanvas.height = thumbHeight
  const thumbCtx = thumbCanvas.getContext('2d')
  if (!thumbCtx) throw new Error('无法创建 2D 缩略图上下文')
  thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight)
  const thumbBlob = await canvasToWebpBlob(thumbCanvas, 0.8)
  const thumbSha256 = await calculateSha256(thumbBlob)
  const thumbPreview = URL.createObjectURL(thumbBlob)

  return {
    originalName: file.name,
    baseName: safeBaseName,
    originalFile: {
      blob: origBlob,
      relativePath: `images/${safeBaseName}.webp`,
      contentType: 'image/webp',
      sha256: origSha256,
      previewUrl: origPreview
    },
    thumbFile: {
      blob: thumbBlob,
      relativePath: `images_thumb/${safeBaseName}_thumb.webp`,
      contentType: 'image/webp',
      sha256: thumbSha256,
      previewUrl: thumbPreview
    }
  }
}
