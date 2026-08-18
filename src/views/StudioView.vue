<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudioStore } from '../stores/studio'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { getCardDetailApi, rollbackCardApi } from '../api/cards'
import CardForm from '../components/studio/CardForm.vue'
import ImageUploader from '../components/studio/ImageUploader.vue'
import UploadProgressModal from '../components/studio/UploadProgressModal.vue'
import {
  PenTool,
  UploadCloud,
  RotateCcw,
  Layers,
  ShieldAlert,
  ArrowLeft,
  History,
  CheckCircle2,
  Download
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const route = useRoute()
const router = useRouter()
const studioStore = useStudioStore()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoadingCard = ref(false)
const editingCardAllVersions = ref<string[]>([])
const selectedHistoryVersion = ref<string>('')
const isRollingBack = ref<boolean>(false)

onMounted(async () => {
  await galleryStore.fetchSeasons()
  const latestSeason = galleryStore.seasons[0]?.name || ''

  const editCardId = route.query.editCardId as string
  if (editCardId) {
    isLoadingCard.value = true
    try {
      const card = await getCardDetailApi(editCardId)
      studioStore.cardId = card.card_id
      studioStore.animeName = card.anime_name
      studioStore.seasonTag = card.season_tag
      studioStore.currentVersion = card.current_version
      studioStore.score = card.articleContent?.score ?? 9.0
      studioStore.summary = card.articleContent?.summary ?? ''
      studioStore.content = card.articleContent?.content ?? ''
      studioStore.commitMessage = ''
      
      editingCardAllVersions.value = card.all_version || [card.current_version]
      selectedHistoryVersion.value = card.current_version
      
      toastStore.info(`已载入卡片「${card.anime_name}」的数据`)
    } catch (err: any) {
      toastStore.error('无法载入待编辑卡片')
    } finally {
      isLoadingCard.value = false
    }
  } else {
    studioStore.resetForm(latestSeason)
    editingCardAllVersions.value = []
  }
})

function handleResetForm() {
  const latestSeason = galleryStore.seasons[0]?.name || ''
  studioStore.resetForm(latestSeason)
}

async function handleLoadHistoricalVersion() {
  if (!studioStore.cardId || !selectedHistoryVersion.value) return
  try {
    const cardVer = await getCardDetailApi(studioStore.cardId, selectedHistoryVersion.value)
    studioStore.score = cardVer.articleContent?.score ?? 9.0
    studioStore.summary = cardVer.articleContent?.summary ?? ''
    studioStore.content = cardVer.articleContent?.content ?? ''
    toastStore.success(`已载入版本 ${selectedHistoryVersion.value} 的正文与评分至编辑区`)
  } catch (e) {
    toastStore.error('载入该版本数据失败')
  }
}

async function handleRollbackVersion() {
  if (!studioStore.cardId || !selectedHistoryVersion.value) return
  if (selectedHistoryVersion.value === studioStore.currentVersion) {
    toastStore.info('当前已生效此版本')
    return
  }

  isRollingBack.value = true
  try {
    const res = await rollbackCardApi(studioStore.cardId, selectedHistoryVersion.value)
    const card = await getCardDetailApi(studioStore.cardId)
    studioStore.currentVersion = card.current_version
    studioStore.score = card.articleContent?.score ?? 9.0
    studioStore.summary = card.articleContent?.summary ?? ''
    studioStore.content = card.articleContent?.content ?? ''
    toastStore.success(`卡片已成功回滚生效版本 ${res.current_version}`)
    await galleryStore.fetchGallery()
  } catch (err: any) {
    console.error(err)
  } finally {
    isRollingBack.value = false
  }
}

async function handlePublish() {
  if (!authStore.isLoggedIn) {
    emit('open-auth')
    return
  }

  try {
    await studioStore.executeUploadPipeline()
    await galleryStore.fetchGallery()
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="studio-page container">
    <!-- Non-logged in banner -->
    <div v-if="!authStore.isLoggedIn" class="login-prompt-banner glass-panel animate-fade-in">
      <ShieldAlert :size="24" class="text-amber" />
      <div>
        <h4>您当前处于游客浏览模式</h4>
        <p>创建卡片与提交发布评测需要登录作者或管理员账号。</p>
      </div>
      <button class="btn btn-primary btn-sm" @click="emit('open-auth')">
        立即登录 / 注册
      </button>
    </div>

    <!-- Top Studio Header -->
    <div class="studio-header">
      <div class="header-titles">
        <router-link to="/" class="back-link">
          <ArrowLeft :size="16" />
          <span>返回画廊</span>
        </router-link>
        <h2 class="page-title">
          <PenTool class="title-icon" :size="24" />
          <span>{{ studioStore.cardId ? '编辑新番评测' : '撰写新番评测' }}</span>
        </h2>
        <p class="page-subtitle">
          撰写当季新番深度长评，上传精选剧照与封面。
        </p>
      </div>

      <div class="version-target-pill glass-panel">
        <Layers :size="16" class="text-indigo" />
        <span class="v-label">目标发布版本：</span>
        <span class="v-tag">{{ studioStore.nextVersion }}</span>
      </div>
    </div>

    <!-- Main Studio Workspace Grid -->
    <div class="studio-layout-grid">
      <!-- Left / Main: Article Writing Form -->
      <div class="main-form-column glass-panel-strong">
        <CardForm />
      </div>

      <!-- Right / Side: Media Assets, Version History Management & Submit Action -->
      <div class="side-panel-column">
        <!-- Media Assets Card -->
        <div class="side-card glass-panel-strong">
          <ImageUploader />
        </div>

        <!-- Integrated Version Management Card (Only in Editing Mode) -->
        <div v-if="studioStore.cardId && editingCardAllVersions.length > 0" class="side-card version-mgmt-card glass-panel-strong animate-fade-in">
          <div class="section-title-box">
            <History :size="16" class="text-indigo" />
            <h4 class="card-section-title">卡片版本管理</h4>
          </div>
          <p class="version-tips">
            当前线上版本：<strong class="text-indigo">{{ studioStore.currentVersion }}</strong>。可切换历史版本载入内容或一键执行回滚。
          </p>

          <div class="version-select-row">
            <select v-model="selectedHistoryVersion" class="form-select version-select">
              <option v-for="ver in editingCardAllVersions" :key="ver" :value="ver">
                版本 {{ ver }} {{ ver === studioStore.currentVersion ? '(当前生效)' : '' }}
              </option>
            </select>
          </div>

          <div class="version-action-buttons">
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              title="将选中的历史版本文字与评分载入到当前编辑表单"
              @click="handleLoadHistoricalVersion"
            >
              <Download :size="14" />
              <span>载入该版本内容</span>
            </button>

            <button
              v-if="selectedHistoryVersion !== studioStore.currentVersion"
              type="button"
              class="btn btn-secondary btn-sm rollback-btn"
              :disabled="isRollingBack"
              @click="handleRollbackVersion"
            >
              <RotateCcw :size="14" />
              <span>{{ isRollingBack ? '回滚中...' : `回滚生效 ${selectedHistoryVersion}` }}</span>
            </button>
          </div>
        </div>

        <!-- Publish Action Card -->
        <div class="side-card publish-card glass-panel-strong">
          <h4 class="card-section-title">发布评测</h4>
          <p class="publish-tips">
            请确认番剧选择、评分、简评及正文无误后，点击下方按钮完成发布。
          </p>

          <div class="publish-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="handleResetForm"
            >
              <RotateCcw :size="16" />
              <span>清空重置</span>
            </button>
            <button
              type="button"
              class="btn btn-primary submit-publish-btn"
              :disabled="studioStore.isUploading"
              @click="handlePublish"
            >
              <UploadCloud :size="18" />
              <span>{{ studioStore.cardId ? `提交新版本 (${studioStore.nextVersion})` : '立即发布评测' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Progress Modal -->
    <UploadProgressModal />
  </div>
</template>

<style scoped>
.studio-page {
  padding: 2.5rem 1.5rem 5rem 1.5rem;
}

.login-prompt-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.75rem;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent-amber);
  margin-bottom: 2rem;
}

.login-prompt-banner h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.login-prompt-banner p {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.studio-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--accent-primary);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
}

.title-icon {
  color: var(--accent-primary);
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.35rem;
}

.version-target-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-full);
}

.v-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.v-tag {
  font-size: 0.95rem;
  font-weight: 800;
  color: #a5b4fc;
  font-family: var(--font-display);
}

.studio-layout-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 2rem;
  align-items: start;
}

.main-form-column {
  padding: 2rem;
  border-radius: var(--radius-lg);
}

.side-panel-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.side-card {
  padding: 1.75rem;
  border-radius: var(--radius-lg);
}

.section-title-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.35rem;
}

.card-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.version-tips {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.version-select-row {
  margin-bottom: 0.75rem;
}

.version-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rollback-btn {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.rollback-btn:hover {
  background: rgba(239, 68, 68, 0.25);
}

.publish-tips {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.publish-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.submit-publish-btn {
  flex: 1;
  padding: 0.85rem 1.25rem;
  font-size: 0.95rem;
}

.text-amber { color: var(--accent-amber); }
.text-indigo { color: var(--accent-primary); }

@media (max-width: 992px) {
  .studio-layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
