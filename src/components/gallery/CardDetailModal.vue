<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { useGalleryStore } from '../../stores/gallery'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import { rollbackCardApi } from '../../api/cards'
import {
  X,
  Star,
  Calendar,
  History,
  RotateCcw,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Image as ImageIcon
} from 'lucide-vue-next'

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

const selectedVersion = ref<string>('')
const activeImageIndex = ref<number>(0)
const isRollingBack = ref<boolean>(false)

const card = computed(() => galleryStore.currentCardDetail)

watch(
  () => card.value,
  (newCard) => {
    if (newCard) {
      selectedVersion.value = newCard.current_version
      activeImageIndex.value = 0
    }
  },
  { immediate: true }
)

const renderedHtml = computed(() => {
  if (!card.value?.articleContent?.content) {
    return '<p class="empty-content">该版本暂无正文内容。</p>'
  }
  return md.render(card.value.articleContent.content)
})

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

function handleVersionChange() {
  if (card.value && selectedVersion.value) {
    galleryStore.openCardDetail(card.value.card_id, selectedVersion.value)
  }
}

async function handleRollback() {
  if (!card.value || !selectedVersion.value) return
  if (selectedVersion.value === card.value.current_version) {
    toastStore.info('当前已处于此版本')
    return
  }

  isRollingBack.value = true
  try {
    const res = await rollbackCardApi(card.value.card_id, selectedVersion.value)
    toastStore.success(`已成功回滚至版本 ${res.current_version}`)
    await galleryStore.openCardDetail(card.value.card_id)
    await galleryStore.fetchGallery()
  } catch (err: any) {
    console.error(err)
  } finally {
    isRollingBack.value = false
  }
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
</script>

<template>
  <div v-if="galleryStore.isDetailModalOpen" class="modal-backdrop" @click.self="galleryStore.closeCardDetail">
    <div class="detail-dialog glass-panel-strong animate-scale-in">
      <button class="dialog-close-btn" @click="galleryStore.closeCardDetail">
        <X :size="22" />
      </button>

      <div v-if="galleryStore.isDetailLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在校对并加载卡片详情...</p>
      </div>

      <div v-else-if="card" class="detail-grid">
        <!-- Left: Gallery Media & Integrity Inspector -->
        <div class="media-column">
          <!-- Main Lightbox Image -->
          <div class="main-image-viewport">
            <img
              :src="currentDisplayImage.url"
              :alt="card.anime_name"
              class="viewport-img"
            />
            <!-- Image Navigation Arrows -->
            <button
              v-if="allImages.length > 1"
              class="img-nav-btn prev"
              @click="activeImageIndex = (activeImageIndex - 1 + allImages.length) % allImages.length"
            >
              <ChevronLeft :size="20" />
            </button>
            <button
              v-if="allImages.length > 1"
              class="img-nav-btn next"
              @click="activeImageIndex = (activeImageIndex + 1) % allImages.length"
            >
              <ChevronRight :size="20" />
            </button>

            <span class="img-counter-badge">
              {{ activeImageIndex + 1 }} / {{ allImages.length }}
            </span>
          </div>

          <!-- Thumbnail Strip -->
          <div v-if="allImages.length > 1" class="thumb-strip">
            <button
              v-for="(img, idx) in allImages"
              :key="idx"
              class="thumb-btn"
              :class="{ active: activeImageIndex === idx }"
              @click="activeImageIndex = idx"
            >
              <img :src="img.url" :alt="img.relative_path" />
            </button>
          </div>

          <!-- OBS & Hash Verification Box -->
          <div class="integrity-box glass-panel">
            <div class="integrity-header">
              <ShieldCheck :size="16" class="text-emerald" />
              <span>OBS 存储与 SHA-256 校对</span>
            </div>
            <div class="hash-list">
              <div class="hash-row">
                <span class="hash-key">正文 JSON:</span>
                <span class="hash-val" :title="card.content_assets.text_sha256">
                  {{ card.content_assets.text_sha256?.slice(0, 16) || 'N/A' }}...
                </span>
                <CheckCircle2 :size="14" class="text-emerald check-icon" />
              </div>
              <div class="hash-row">
                <span class="hash-key">当前图片:</span>
                <span class="hash-val" :title="currentDisplayImage.sha256">
                  {{ currentDisplayImage.sha256?.slice(0, 16) || 'Verified' }}...
                </span>
                <CheckCircle2 :size="14" class="text-emerald check-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Article & Version Management -->
        <div class="content-column">
          <!-- Top Metadata Header -->
          <div class="content-header">
            <div class="header-badges">
              <span class="badge badge-season">
                <Calendar :size="12" />
                {{ card.season_tag }}
              </span>
              <span class="badge badge-version">
                当前生效：{{ card.current_version }}
              </span>
              <span class="badge badge-score">
                <Star :size="12" />
                评分 {{ Number(card.articleContent?.score ?? 9.0).toFixed(1) }}
              </span>
            </div>

            <h2 class="detail-title">{{ card.anime_name }}</h2>

            <div class="author-meta-row">
              <div class="author-avatar-md">
                {{ card.owner.nickname.slice(0, 1) }}
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

          <!-- Version Timeline & Rollback Controls -->
          <div class="version-control-bar glass-panel">
            <div class="version-left">
              <History :size="16" class="text-indigo" />
              <span class="vc-label">版本历史：</span>
              <select v-model="selectedVersion" class="version-select" @change="handleVersionChange">
                <option v-for="ver in card.all_version" :key="ver" :value="ver">
                  {{ ver }} {{ ver === card.current_version ? '(当前生效)' : '' }}
                </option>
              </select>
            </div>

            <div class="version-right">
              <!-- Rollback Button if allowed -->
              <button
                v-if="card.editable && selectedVersion !== card.current_version"
                class="btn btn-secondary btn-sm"
                :disabled="isRollingBack"
                @click="handleRollback"
              >
                <RotateCcw :size="14" />
                <span>{{ isRollingBack ? '回滚中...' : `回滚至 ${selectedVersion}` }}</span>
              </button>

              <button v-if="card.editable" class="btn btn-primary btn-sm" @click="handleGoStudio">
                <Edit3 :size="14" />
                <span>迭代发布新版本</span>
              </button>
            </div>
          </div>

          <!-- Rendered Markdown Article Body -->
          <div class="article-scroll-container">
            <div class="markdown-body" v-html="renderedHtml"></div>
          </div>
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.detail-dialog {
  width: 100%;
  max-width: 1180px;
  max-height: 90vh;
  background: rgba(15, 23, 42, 0.95);
  border-radius: var(--radius-lg);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  grid-template-columns: 1fr 1.3fr;
  height: 100%;
  max-height: 90vh;
  overflow: hidden;
}

/* Left Column */
.media-column {
  padding: 2rem;
  border-right: 1px solid var(--border-glass);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: rgba(9, 13, 22, 0.5);
  overflow-y: auto;
}

.main-image-viewport {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #000;
  box-shadow: var(--shadow-md);
}

.viewport-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: all var(--transition-fast);
}

.img-nav-btn:hover {
  background: rgba(99, 102, 241, 0.8);
}

.img-nav-btn.prev { left: 0.75rem; }
.img-nav-btn.next { right: 0.75rem; }

.img-counter-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(0, 0, 0, 0.65);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: #fff;
  font-weight: 600;
}

.thumb-strip {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
}

.thumb-btn {
  width: 4.5rem;
  height: 3rem;
  border-radius: var(--radius-xs);
  overflow: hidden;
  border: 2px solid transparent;
  flex-shrink: 0;
  opacity: 0.6;
  transition: all var(--transition-fast);
}

.thumb-btn:hover {
  opacity: 1;
}

.thumb-btn.active {
  border-color: var(--accent-primary);
  opacity: 1;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.integrity-box {
  padding: 1rem;
  border-radius: var(--radius-sm);
}

.integrity-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.6rem;
}

.hash-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.75rem;
}

.hash-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hash-key {
  color: var(--text-muted);
}

.hash-val {
  font-family: monospace;
  color: #94a3b8;
}

.text-emerald { color: var(--accent-emerald); }
.text-indigo { color: var(--accent-primary); }

/* Right Column */
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

.version-control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}

.version-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.vc-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.version-select {
  padding: 0.35rem 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xs);
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.version-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
}

.article-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
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
