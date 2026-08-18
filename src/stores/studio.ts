import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProcessedImageResult } from '../services/image'
import { calculateSha256 } from '../services/crypto'
import {
  createCardApi,
  requestPresignUploadApi,
  directUploadToObs,
  commitCardVersionApi
} from '../api/index'
import { useToastStore } from './toast'
import confetti from 'canvas-confetti'

export interface UploadFileProgressItem {
  relativePath: string
  percentage: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

export const useStudioStore = defineStore('studio', () => {
  const toastStore = useToastStore()

  // Form State
  const cardId = ref<string>('')
  const animeName = ref<string>('')
  const seasonTag = ref<string>('')
  const currentVersion = ref<string>('v1')
  const commitMessage = ref<string>('完成撰稿与素材上传')
  
  const score = ref<number>(9.0)
  const summary = ref<string>('')
  const content = ref<string>('')
  
  const processedImages = ref<ProcessedImageResult[]>([])

  // Upload Progress Modal State
  const isUploading = ref<boolean>(false)
  const uploadStep = ref<'idle' | 'preparing' | 'presigning' | 'uploading' | 'committing' | 'done' | 'error'>('idle')
  const uploadStepDescription = ref<string>('')
  const fileProgressList = ref<UploadFileProgressItem[]>([])

  const overallPercentage = computed(() => {
    if (fileProgressList.value.length === 0) return 0
    const sum = fileProgressList.value.reduce((acc, item) => acc + item.percentage, 0)
    return Math.round(sum / fileProgressList.value.length)
  })

  const nextVersion = computed(() => {
    if (!currentVersion.value) return 'v1'
    const num = parseInt(currentVersion.value.replace(/[^0-9]/g, '') || '1', 10)
    return cardId.value ? `v${num + 1}` : 'v1'
  })

  function resetForm() {
    cardId.value = ''
    animeName.value = ''
    seasonTag.value = ''
    currentVersion.value = 'v1'
    commitMessage.value = '初次成稿提交'
    score.value = 9.0
    summary.value = ''
    content.value = ''
    processedImages.value = []
    isUploading.value = false
    uploadStep.value = 'idle'
    fileProgressList.value = []
  }

  function addProcessedImage(img: ProcessedImageResult) {
    processedImages.value.push(img)
  }

  function removeProcessedImage(index: number) {
    processedImages.value.splice(index, 1)
  }

  async function executeUploadPipeline(): Promise<string> {
    // 1. Validation
    if (!animeName.value.trim()) throw new Error('请选择或填写番剧名')
    if (!seasonTag.value.trim()) throw new Error('请选择所属季度')
    if (!summary.value.trim()) throw new Error('请填写一句话简评')
    if (!content.value.trim()) throw new Error('请填写评测正文内容')

    isUploading.value = true
    uploadStep.value = 'preparing'
    uploadStepDescription.value = '正在封装文字 JSON 并计算资产哈希...'

    try {
      // 2. Prepare text/article.json
      const articleJsonObj = {
        summary: summary.value.trim(),
        score: Number(score.value),
        content: content.value.trim()
      }
      const articleJsonString = JSON.stringify(articleJsonObj, null, 2)
      const textSha256 = await calculateSha256(articleJsonString)
      const textBlob = new Blob([articleJsonString], { type: 'application/json' })

      // 3. Collect files list
      const filesToUpload: {
        relativePath: string
        contentType: string
        sha256: string
        data: Blob
      }[] = [
        {
          relativePath: 'text/article.json',
          contentType: 'application/json',
          sha256: textSha256,
          data: textBlob
        }
      ]

      processedImages.value.forEach((img) => {
        filesToUpload.push({
          relativePath: img.originalFile.relativePath,
          contentType: img.originalFile.contentType,
          sha256: img.originalFile.sha256,
          data: img.originalFile.blob
        })
        filesToUpload.push({
          relativePath: img.thumbFile.relativePath,
          contentType: img.thumbFile.contentType,
          sha256: img.thumbFile.sha256,
          data: img.thumbFile.blob
        })
      })

      // Setup file progress trackers
      fileProgressList.value = filesToUpload.map((f) => ({
        relativePath: f.relativePath,
        percentage: 0,
        status: 'pending'
      }))

      // 4. Create Card if not exists yet
      let activeCardId = cardId.value
      const targetVersion = activeCardId ? nextVersion.value : 'v1'

      if (!activeCardId) {
        uploadStepDescription.value = '正在创建卡片档案...'
        const newCard = await createCardApi(animeName.value, seasonTag.value)
        activeCardId = newCard.card_id
        cardId.value = activeCardId
      }

      // 5. Request Presign Upload URLs
      uploadStep.value = 'presigning'
      uploadStepDescription.value = '正在申请 OBS 直传凭证通行证...'
      const presignRes = await requestPresignUploadApi(
        activeCardId,
        targetVersion,
        filesToUpload.map((f) => ({
          relative_path: f.relativePath,
          content_type: f.contentType,
          sha256: f.sha256
        }))
      )

      // 6. Execute Direct OBS Uploads
      uploadStep.value = 'uploading'
      uploadStepDescription.value = '正在将文件直传至对象存储 (OBS)...'

      for (let i = 0; i < filesToUpload.length; i++) {
        const fileItem = filesToUpload[i]
        const ticket = presignRes.upload_tickets.find((t) => t.relative_path === fileItem.relativePath)
        if (!ticket) {
          throw new Error(`缺少上传通行证: ${fileItem.relativePath}`)
        }

        const progressItem = fileProgressList.value[i]
        progressItem.status = 'uploading'

        await directUploadToObs(
          ticket.upload_url,
          fileItem.data,
          fileItem.contentType,
          (progress) => {
            progressItem.percentage = progress.percentage
          }
        )

        progressItem.percentage = 100
        progressItem.status = 'completed'
      }

      // 7. Commit Version
      uploadStep.value = 'committing'
      uploadStepDescription.value = '正在提交版本登记与文件清单...'
      await commitCardVersionApi(
        activeCardId,
        targetVersion,
        commitMessage.value || '版本更新',
        filesToUpload.map((f) => ({
          relative_path: f.relativePath,
          content_type: f.contentType,
          sha256: f.sha256
        }))
      )

      uploadStep.value = 'done'
      uploadStepDescription.value = '发布成功！版本已生效。'

      // Trigger Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (e) {}

      toastStore.success(`卡片已成功发布 (版本 ${targetVersion})`)
      return activeCardId
    } catch (err: any) {
      uploadStep.value = 'error'
      uploadStepDescription.value = err.message || '上传或提交过程中遇到错误'
      toastStore.error(err.message || '发布失败')
      throw err
    }
  }

  return {
    cardId,
    animeName,
    seasonTag,
    currentVersion,
    commitMessage,
    score,
    summary,
    content,
    processedImages,
    isUploading,
    uploadStep,
    uploadStepDescription,
    fileProgressList,
    overallPercentage,
    nextVersion,
    resetForm,
    addProcessedImage,
    removeProcessedImage,
    executeUploadPipeline
  }
})
