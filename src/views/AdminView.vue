<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import { useToastStore } from '../stores/toast'
import { mockDataService } from '../services/mock'
import type { SeasonItem } from '../types'
import SeasonCreateModal from '../components/admin/SeasonCreateModal.vue'
import DeadlineModal from '../components/admin/DeadlineModal.vue'
import AnimeListModal from '../components/admin/AnimeListModal.vue'
import SeasonExportModal from '../components/admin/SeasonExportModal.vue'
import {
  ShieldCheck,
  Plus,
  Clock,
  Film,
  Archive,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const configStore = useConfigStore()
const toastStore = useToastStore()

// Modals State
const isCreateSeasonModalOpen = ref(false)
const activeDeadlineSeason = ref<SeasonItem | null>(null)
const activeAnimeListSeason = ref<SeasonItem | null>(null)
const activeExportSeason = ref<SeasonItem | null>(null)

onMounted(async () => {
  await galleryStore.fetchSeasons()
})

function formatDeadline(deadline: number | null): string {
  if (!deadline) return '长期开放 (无限制)'
  const date = new Date(deadline * 1000)
  const isPast = Date.now() > deadline * 1000
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${isPast ? '(已截止)' : ''}`
}

function handleResetMock() {
  mockDataService.resetToDefault()
  galleryStore.fetchSeasons()
  galleryStore.fetchGallery()
  toastStore.success('已将演示数据与番单重置为初始状态')
}
</script>

<template>
  <div class="admin-page container">
    <!-- Non-admin banner if not admin -->
    <div v-if="!authStore.isAdmin" class="non-admin-banner glass-panel animate-fade-in">
      <AlertTriangle :size="24" class="text-amber" />
      <div class="banner-text">
        <h4>您当前身份不是管理员 ({{ authStore.role }})</h4>
        <p>季度创建、截止时间设置、整体替换番单与季度打包导出需要平台管理员权限。</p>
      </div>
      <button v-if="configStore.isMockMode" class="btn btn-primary btn-sm" @click="authStore.switchMockRole('admin')">
        一键切换为管理员 (Mock)
      </button>
    </div>

    <!-- Admin Header -->
    <div class="admin-header">
      <div>
        <h2 class="page-title">
          <ShieldCheck class="title-icon" :size="26" />
          <span>季度与番单管理中心</span>
        </h2>
        <p class="page-subtitle">
          维护新番季度档案、设置截稿时间锁、维护作者建卡番单，以及导出季度卡片全量归档。
        </p>
      </div>

      <div class="admin-top-actions">
        <button
          v-if="configStore.isMockMode"
          class="btn btn-secondary"
          title="重置预设的 4 季番剧数据"
          @click="handleResetMock"
        >
          <RotateCcw :size="16" />
          <span>重置 Mock 预设数据</span>
        </button>

        <button class="btn btn-primary" @click="isCreateSeasonModalOpen = true">
          <Plus :size="16" />
          <span>新建新番季度</span>
        </button>
      </div>
    </div>

    <!-- Season Cards / Table -->
    <div class="seasons-management-grid">
      <div
        v-for="season in galleryStore.seasons"
        :key="season.season_id"
        class="season-admin-card glass-panel-strong animate-fade-in"
      >
        <div class="season-card-top">
          <div class="season-badge-box">
            <Calendar :size="18" class="text-indigo" />
            <h3 class="season-name-title">{{ season.name }} 季度</h3>
          </div>
          <span class="animes-count-pill">{{ season.animes.length }} 部番剧</span>
        </div>

        <div class="season-card-body">
          <div class="info-row">
            <span class="info-label"><Clock :size="13" /> 截稿时间：</span>
            <span class="info-val" :class="{ 'text-danger': season.deadline && Date.now() > season.deadline * 1000 }">
              {{ formatDeadline(season.deadline) }}
            </span>
          </div>

          <div class="info-row animes-preview-row">
            <span class="info-label"><Film :size="13" /> 候选番剧：</span>
            <div class="anime-tags-cloud">
              <span v-for="anime in season.animes.slice(0, 4)" :key="anime" class="anime-pill">
                {{ anime }}
              </span>
              <span v-if="season.animes.length > 4" class="anime-pill more">
                +{{ season.animes.length - 4 }} 部...
              </span>
            </div>
          </div>
        </div>

        <div class="season-card-actions">
          <button class="action-btn" @click="activeDeadlineSeason = season">
            <Clock :size="14" />
            <span>设置截止时间</span>
          </button>
          <button class="action-btn" @click="activeAnimeListSeason = season">
            <Film :size="14" />
            <span>维护番单</span>
          </button>
          <button class="action-btn export-btn" @click="activeExportSeason = season">
            <Archive :size="14" />
            <span>导出 ZIP</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SeasonCreateModal
      v-if="isCreateSeasonModalOpen"
      @close="isCreateSeasonModalOpen = false"
      @created="galleryStore.fetchSeasons"
    />

    <DeadlineModal
      v-if="activeDeadlineSeason"
      :season="activeDeadlineSeason"
      @close="activeDeadlineSeason = null"
      @updated="galleryStore.fetchSeasons"
    />

    <AnimeListModal
      v-if="activeAnimeListSeason"
      :season="activeAnimeListSeason"
      @close="activeAnimeListSeason = null"
      @updated="galleryStore.fetchSeasons"
    />

    <SeasonExportModal
      v-if="activeExportSeason"
      :season="activeExportSeason"
      @close="activeExportSeason = null"
    />
  </div>
</template>

<style scoped>
.admin-page {
  padding: 2.5rem 1.5rem 5rem 1.5rem;
}

.non-admin-banner {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.75rem;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent-amber);
  margin-bottom: 2rem;
}

.banner-text h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.banner-text p {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.admin-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 2.5rem;
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

.admin-top-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.seasons-management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.75rem;
}

.season-admin-card {
  padding: 1.75rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.season-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.season-badge-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.season-name-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  font-family: var(--font-display);
}

.animes-count-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
}

.season-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-size: 0.85rem;
  flex: 1;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.info-label {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.info-val {
  color: var(--text-primary);
  font-weight: 500;
}

.animes-preview-row {
  flex-direction: column;
  gap: 0.4rem;
}

.anime-tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.anime-pill {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
}

.anime-pill.more {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
}

.season-card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.action-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.action-btn.export-btn {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
}

.action-btn.export-btn:hover {
  background: rgba(6, 182, 212, 0.25);
}

.text-amber { color: var(--accent-amber); }
.text-indigo { color: var(--accent-primary); }
.text-danger { color: #f87171; font-weight: 600; }
</style>
