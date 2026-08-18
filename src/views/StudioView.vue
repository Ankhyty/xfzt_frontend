<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudioStore } from '../stores/studio'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { getCardDetailApi } from '../api/cards'
import CardForm from '../components/studio/CardForm.vue'
import ImageUploader from '../components/studio/ImageUploader.vue'
import UploadProgressModal from '../components/studio/UploadProgressModal.vue'
import {
  PenTool,
  UploadCloud,
  RotateCcw,
  Sparkles,
  Layers,
  ShieldAlert,
  ArrowLeft
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

onMounted(async () => {
  await galleryStore.fetchSeasons()

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
      studioStore.commitMessage = `迭代版本 (基于 ${card.current_version})`
      toastStore.info(`已载入卡片「${card.anime_name}」的 ${card.current_version} 历史数据`)
    } catch (err: any) {
      toastStore.error('无法载入待编辑卡片')
    } finally {
      isLoadingCard.value = false
    }
  } else {
    studioStore.resetForm()
  }
})

async function handlePublish() {
  if (!authStore.isLoggedIn) {
    emit('open-auth')
    return
  }

  try {
    const cardId = await studioStore.executeUploadPipeline()
    await galleryStore.fetchGallery()
    // Redirect or update
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
        <p>创建卡片、申请 OBS 上传通行证与提交版本需要登录作者或管理员账号。</p>
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
          <span>{{ studioStore.cardId ? '迭代更新卡片版本' : '创建新番评测卡片' }}</span>
        </h2>
        <p class="page-subtitle">
          支持 Markdown 格式长文排版、自动 WebP 原图与缩略图转换，三段式直传 OBS 华为云对象存储。
        </p>
      </div>

      <div class="version-target-pill glass-panel">
        <Layers :size="16" class="text-indigo" />
        <span class="v-label">即将发布版本：</span>
        <span class="v-tag">{{ studioStore.nextVersion }}</span>
      </div>
    </div>

    <!-- Main Studio Workspace Grid -->
    <div class="studio-layout-grid">
      <!-- Left / Main: Article Writing Form -->
      <div class="main-form-column glass-panel-strong">
        <CardForm />
      </div>

      <!-- Right / Side: Media Assets & Submit Action -->
      <div class="side-panel-column">
        <!-- Media Assets Card -->
        <div class="side-card glass-panel-strong">
          <ImageUploader />
        </div>

        <!-- Publish Action Card -->
        <div class="side-card publish-card glass-panel-strong">
          <h4 class="card-section-title">发布与 OBS 三段式流程</h4>
          <p class="publish-tips">
            提交后系统将为正文及所有剧照申请 OBS 预签名 PUT 通行证，直传完成后自动 Commit 登记生效。
          </p>

          <div class="publish-actions">
            <button
              type="button"
              class="btn btn-secondary"
              @click="studioStore.resetForm"
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
              <span>{{ studioStore.cardId ? `提交新版本 (${studioStore.nextVersion})` : '发布新卡片' }}</span>
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

.card-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
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
