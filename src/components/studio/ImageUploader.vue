<script setup lang="ts">
import { ref } from 'vue'
import { useStudioStore } from '../../stores/studio'
import { useToastStore } from '../../stores/toast'
import { processImageFile } from '../../services/image'
import { UploadCloud, Trash2, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-vue-next'

const studioStore = useStudioStore()
const toastStore = useToastStore()

const isDragging = ref(false)
const isProcessing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

async function handleFiles(files: FileList | File[]) {
  const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
  if (imageFiles.length === 0) {
    toastStore.warning('请选择有效的图片文件 (JPG / PNG / WebP)')
    return
  }

  isProcessing.value = true
  try {
    for (const file of imageFiles) {
      const result = await processImageFile(file)
      studioStore.addProcessedImage(result)
    }
    toastStore.success(`已成功转换并生成 ${imageFiles.length} 张图片的 WebP 格式与对应缩略图`)
  } catch (err: any) {
    toastStore.error(err.message || '图片处理失败')
  } finally {
    isProcessing.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    handleFiles(target.files)
  }
}
</script>

<template>
  <div class="image-uploader-section">
    <div class="uploader-header">
      <div class="header-left">
        <ImageIcon class="header-icon" :size="20" />
        <div>
          <h4 class="section-title">新番剧照与封面素材</h4>
          <p class="section-desc">首张图片将自动作为画廊封面。上传后浏览器将自动转换为 WebP 并生成对应 `images_thumb` 缩略图。</p>
        </div>
      </div>
      <span class="img-count-badge">已添加 {{ studioStore.processedImages.length }} 张</span>
    </div>

    <!-- Drag & Drop Zone -->
    <div
      class="dropzone-area"
      :class="{ dragging: isDragging, processing: isProcessing }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInputRef?.click()"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*"
        class="hidden-file-input"
        @change="onFileSelect"
      />

      <div class="dropzone-content">
        <div class="upload-icon-circle">
          <UploadCloud :size="28" />
        </div>
        <p class="drop-main-text">
          {{ isProcessing ? '正在自动转换 WebP 并生成缩略图...' : '点击或将剧照 / 封面拖拽至此处' }}
        </p>
        <p class="drop-sub-text">支持 JPG, PNG, WebP (自动等比缩放与 SHA-256 哈希计算)</p>
      </div>
    </div>

    <!-- Preview Grid -->
    <div v-if="studioStore.processedImages.length > 0" class="preview-grid">
      <div
        v-for="(img, idx) in studioStore.processedImages"
        :key="idx"
        class="preview-card glass-panel"
      >
        <div class="preview-img-box">
          <img :src="img.originalFile.previewUrl" :alt="img.originalName" />
          <span v-if="idx === 0" class="cover-tag">封面图</span>
          <button
            class="delete-btn"
            title="移除图片"
            @click="studioStore.removeProcessedImage(idx)"
          >
            <Trash2 :size="14" />
          </button>
        </div>

        <div class="preview-info">
          <div class="info-row">
            <span class="file-name" :title="img.originalName">{{ img.originalName }}</span>
            <span class="badge badge-webp">WebP</span>
          </div>
          <div class="hash-preview">
            <span class="hash-label">SHA256:</span>
            <span class="hash-code" :title="img.originalFile.sha256">{{ img.originalFile.sha256.slice(0, 12) }}...</span>
          </div>
          <div class="thumb-hint">
            <CheckCircle2 :size="12" class="text-emerald" />
            <span>已生成 {{ img.thumbFile.relativePath }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-uploader-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.uploader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.header-icon {
  color: var(--accent-secondary);
  margin-top: 0.2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.section-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.img-count-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
  border-radius: var(--radius-full);
}

.dropzone-area {
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  padding: 2.25rem 1.5rem;
  text-align: center;
  background: rgba(15, 23, 42, 0.4);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropzone-area:hover,
.dropzone-area.dragging {
  border-color: var(--accent-primary);
  background: rgba(99, 102, 241, 0.08);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.hidden-file-input {
  display: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon-circle {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.drop-main-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.drop-sub-text {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.preview-card {
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-img-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #000;
}

.preview-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: var(--gradient-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.65);
  color: #f87171;
  padding: 0.35rem;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.preview-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.file-name {
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-webp {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.hash-preview {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-muted);
}

.hash-code {
  font-family: monospace;
  color: #94a3b8;
}

.thumb-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.7rem;
}

.text-emerald {
  color: var(--accent-emerald);
}
</style>
