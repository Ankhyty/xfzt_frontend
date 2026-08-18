<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'
import {
  X,
  Star,
  Calendar,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn
} from 'lucide-vue-next'
import { deleteCardApi } from '../../api/cards'
import { useToastStore } from '../../stores/toast'

const router = useRouter()
const galleryStore = useGalleryStore()
const toastStore = useToastStore()

const activeImageIndex = ref<number>(0)
const isLightboxOpen = ref<boolean>(false)

const card = computed(() => galleryStore.currentCardDetail)

watch(
  () => card.value,
  (newCard) => {
    if (newCard) {
      activeImageIndex.value = 0
      isLightboxOpen.value = false
    }
  },
  { immediate: true }
)

const allImages = computed(() => {
  if (!card.value?.content_assets?.images?.length) {
    return [
      {
        relative_path: 'images/default_cover.webp',
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
        sha256: '4e0cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
      }
    ]
  }
  return card.value.content_assets.images
})

const currentDisplayImage = computed(() => {
  return allImages.value[activeImageIndex.value] || allImages.value[0]
})

function prevImage() {
  activeImageIndex.value = (activeImageIndex.value - 1 + allImages.value.length) % allImages.value.length
}

function nextImage() {
  activeImageIndex.value = (activeImageIndex.value + 1) % allImages.value.length
}

function openLightbox() {
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}

function handleKeyDown(e: KeyboardEvent) {
  if (!galleryStore.isDetailModalOpen) return
  if (e.key === 'Escape') {
    if (isLightboxOpen.value) {
      closeLightbox()
    } else {
      galleryStore.closeCardDetail()
    }
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

function handleFilterByAnime(animeName: string) {
  galleryStore.closeCardDetail()
  galleryStore.searchQuery = animeName
  router.push('/')
}

function handleGoStudio() {
  if (!card.value) return
  const id = card.value.card_id
  galleryStore.closeCardDetail()
  router.push({
    path: '/studio',
    query: { editCardId: id }
  })
}

async function handleDeleteCurrentCard() {
  if (!card.value) return
  const name = card.value.anime_name
  if (!confirm(`确定要删除评测卡片「${name}」吗？\n\n该操作将永久移除该卡片的所有版本与图片档案，不可撤销！`)) {
    return
  }
  try {
    await deleteCardApi(card.value.card_id)
    galleryStore.closeCardDetail()
    toastStore.success(`已删除评测卡片「${name}」`)
    await galleryStore.fetchGallery()
  } catch (err: any) {
    toastStore.error(err.message || '删除卡片失败')
  }
}
</script>

<template>
  <div v-if="galleryStore.isDetailModalOpen" class="modal-backdrop" @click.self="galleryStore.closeCardDetail">
    <div class="detail-dialog glass-panel-strong animate-scale-in">
      <button class="dialog-close-btn" title="关闭详情 (Esc)" @click="galleryStore.closeCardDetail">
        <X :size="22" />
      </button>

      <div v-if="galleryStore.isDetailLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在载入卡片详情...</p>
      </div>

      <div v-else-if="card" class="detail-grid">
        <!-- Left: Gallery Media Images (Handles 3+ images with thumbnail ribbon & Lightbox zoom) -->
        <div class="media-column">
          <!-- Main Lightbox Image Viewport -->
          <div class="main-image-viewport" @click="openLightbox">
            <img
              :src="currentDisplayImage.url"
              :alt="card.anime_name"
              class="viewport-img"
            />

            <div class="zoom-hover-overlay">
              <ZoomIn :size="22" />
              <span>点击查看高清大图</span>
            </div>

            <!-- Image Navigation Arrows -->
            <button
              v-if="allImages.length > 1"
              class="img-nav-btn prev"
              title="上一张 (←)"
              @click.stop="prevImage"
            >
              <ChevronLeft :size="20" />
            </button>
            <button
              v-if="allImages.length > 1"
              class="img-nav-btn next"
              title="下一张 (→)"
              @click.stop="nextImage"
            >
              <ChevronRight :size="20" />
            </button>

            <span class="img-counter-badge">
              {{ activeImageIndex + 1 }} / {{ allImages.length }}
            </span>
          </div>

          <!-- Thumbnail Strip for Multi-image navigation (3+ images) -->
          <div v-if="allImages.length > 1" class="thumb-strip-container">
            <span class="thumb-strip-hint">精选剧照 (共 {{ allImages.length }} 张)：</span>
            <div class="thumb-strip">
              <button
                v-for="(img, idx) in allImages"
                :key="idx"
                class="thumb-btn"
                :class="{ active: activeImageIndex === idx }"
                @click="activeImageIndex = idx"
              >
                <img :src="img.url" :alt="img.relative_path" loading="lazy" />
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Long Article Content Body (Designed for 500+ words) -->
        <div class="content-column">
          <!-- Top Metadata Header -->
          <div class="content-header">
            <div class="header-badges">
              <span class="badge badge-season">
                <Calendar :size="12" />
                {{ card.season_tag }}
              </span>
              <span class="badge badge-version">
                版本：{{ card.current_version }}
              </span>
              <span class="badge badge-score">
                <Star :size="12" />
                评分 {{ Number(card.articleContent?.score ?? 9.0).toFixed(1) }}
              </span>
            </div>

            <h2
              class="detail-title clickable-title"
              title="点击在画廊中聚合筛选该番剧的所有评测"
              @click="handleFilterByAnime(card.anime_name)"
            >
              <span>{{ card.anime_name }}</span>
              <span class="filter-action-tag">聚合查看</span>
            </h2>

            <div class="author-meta-row">
              <div class="author-avatar-md">
                {{ (card?.owner?.nickname || card?.owner?.username || 'U').slice(0, 1) }}
              </div>
              <div>
                <span class="author-name-text">{{ card.owner.nickname }}</span>
                <span class="author-username">(@{{ card.owner.username }})</span>
              </div>
              <span class="time-text">更新于 {{ new Date(card.updated_at).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Highlight Summary Blockquote -->
          <div class="highlight-summary">
            <p>"{{ card.articleContent?.summary || '暂无一句话简评' }}"</p>
          </div>

          <!-- Pure Text Article Body (Plain Text with rich paragraphs, smooth scroll for 500+ words) -->
          <div class="article-scroll-container">
            <div class="article-plain-content">
              {{ card.articleContent?.content || '该版本暂无正文评测内容。' }}
            </div>
          </div>

          <!-- Footer Action: If editable, direct button to studio for version iteration or delete -->
          <div v-if="card.editable" class="modal-footer-actions">
            <button class="btn btn-primary btn-edit-action" @click="handleGoStudio">
              <Edit3 :size="15" />
              <span>进入创作台迭代编辑版本</span>
            </button>
            <button class="btn btn-secondary btn-delete-action" title="删除该评测卡片" @click="handleDeleteCurrentCard">
              <Trash2 :size="15" />
              <span>删除卡片</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Lightbox Modal for HD Image Viewing -->
    <div v-if="isLightboxOpen" class="lightbox-overlay animate-fade-in" @click="closeLightbox">
      <button class="lightbox-close-btn" title="关闭大图 (Esc)" @click="closeLightbox">
        <X :size="26" />
      </button>

      <div class="lightbox-content-box" @click.stop>
        <img
          :src="currentDisplayImage.url"
          :alt="card?.anime_name"
          class="lightbox-full-img"
        />

        <div class="lightbox-controls-bar">
          <button v-if="allImages.length > 1" class="lb-nav-btn" @click="prevImage">
            <ChevronLeft :size="24" />
          </button>
          <span class="lb-counter">{{ activeImageIndex + 1 }} / {{ allImages.length }}</span>
          <button v-if="allImages.length > 1" class="lb-nav-btn" @click="nextImage">
            <ChevronRight :size="24" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.detail-dialog {
  width: 100%;
  max-width: 1140px;
  max-height: 90vh;
  background: rgba(15, 23, 42, 0.96);
  border-radius: var(--radius-lg);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-glass);
}

.dialog-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 10;
  color: var(--text-muted);
  padding: 0.4rem;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  transition: all var(--transition-fast);
}

.dialog-close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--accent-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  height: 100%;
  max-height: 90vh;
  overflow: hidden;
}

/* Left Column: Media */
.media-column {
  padding: 2.25rem;
  border-right: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(9, 13, 22, 0.6);
  overflow-y: auto;
}

.main-image-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  cursor: zoom-in;
}

.viewport-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.main-image-viewport:hover .viewport-img {
  transform: scale(1.03);
}

.zoom-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity var(--transition-fast);
  pointer-events: none;
}

.main-image-viewport:hover .zoom-hover-overlay {
  opacity: 1;
}

.img-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.4rem;
  height: 2.4rem;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.65);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.img-nav-btn:hover {
  background: var(--accent-primary);
  transform: translateY(-50%) scale(1.1);
}

.img-nav-btn.prev { left: 0.75rem; }
.img-nav-btn.next { right: 0.75rem; }

.img-counter-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.75);
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: #fff;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.thumb-strip-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thumb-strip-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.thumb-strip {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding-bottom: 0.35rem;
}

.thumb-btn {
  width: 4.8rem;
  height: 3.2rem;
  border-radius: var(--radius-xs);
  overflow: hidden;
  border: 2px solid transparent;
  flex-shrink: 0;
  opacity: 0.6;
  transition: all var(--transition-fast);
  cursor: pointer;
  background: #000;
}

.thumb-btn:hover {
  opacity: 1;
}

.thumb-btn.active {
  border-color: var(--accent-primary);
  opacity: 1;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
  transform: translateY(-2px);
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Right Column: Long Content Body */
.content-column {
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.75rem;
}

.clickable-title {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  transition: all var(--transition-fast);
}

.clickable-title:hover {
  color: var(--accent-primary);
}

.filter-action-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #a5b4fc;
  border-radius: var(--radius-full);
  vertical-align: middle;
  transition: all var(--transition-fast);
}

.clickable-title:hover .filter-action-tag {
  background: var(--accent-primary);
  color: white;
}

.author-meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.author-avatar-md {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.author-name-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.author-username {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-left: 0.25rem;
}

.time-text {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-left: auto;
}

.highlight-summary {
  background: rgba(99, 102, 241, 0.08);
  border-left: 3px solid var(--accent-primary);
  padding: 0.85rem 1.25rem;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: 1.25rem;
  font-style: italic;
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.article-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.65rem;
  margin-bottom: 1rem;
}

.article-plain-content {
  color: #cbd5e1;
  line-height: 1.85;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer-actions {
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-edit-action {
  flex: 1;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
}

.btn-delete-action {
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-delete-action:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
}

/* Fullscreen Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.94);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 10;
}

.lightbox-close-btn:hover {
  background: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  transform: scale(1.1);
}

.lightbox-content-box {
  position: relative;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-full-img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
}

.lightbox-controls-bar {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-top: 1.25rem;
  background: rgba(15, 23, 42, 0.8);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-glass);
}

.lb-nav-btn {
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
}

.lb-nav-btn:hover {
  color: var(--accent-primary);
  transform: scale(1.2);
}

.lb-counter {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
    max-height: none;
    overflow-y: auto;
  }
  .media-column {
    border-right: none;
    border-bottom: 1px solid var(--border-glass);
  }
}
</style>
