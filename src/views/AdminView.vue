<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import { useAuthStore } from '../stores/auth'
import { useConfigStore } from '../stores/config'
import { useToastStore } from '../stores/toast'
import { mockDataService } from '../services/mock'
import { deleteSeasonApi } from '../api/seasons'
import { getGalleryItemsApi } from '../api/gallery'
import type { SeasonItem, CardItem } from '../types'
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
  ArrowLeft,
  Trash2
} from 'lucide-vue-next'

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()
const configStore = useConfigStore()
const toastStore = useToastStore()

// State
const allCards = ref<CardItem[]>([])

// Modals State
const isCreateSeasonModalOpen = ref(false)
const activeDeadlineSeason = ref<SeasonItem | null>(null)
const activeAnimeListSeason = ref<SeasonItem | null>(null)
const activeExportSeason = ref<SeasonItem | null>(null)
const deletingSeasonId = ref<number | null>(null)

async function loadAllCards() {
  try {
    const res = await getGalleryItemsApi('ALL')
    allCards.value = res.items
  } catch (e) {
    console.error('Failed to fetch cards for admin view', e)
  }
}

onMounted(async () => {
  if (authStore.isAdmin) {
    await galleryStore.fetchSeasons()
    await loadAllCards()
  }
})

watch(
  () => authStore.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      galleryStore.fetchSeasons()
      loadAllCards()
    }
  }
)

function getSeasonCardsCount(seasonName: string): number {
  return allCards.value.filter((c) => c.season_tag === seasonName).length
}

function formatDeadline(deadline: number | null): string {
  if (!deadline) return '长期开放 (无限制)'
  const date = new Date(deadline * 1000)
  const isPast = Date.now() > deadline * 1000
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${isPast ? '(已截止)' : ''}`
}

async function handleResetMock() {
  mockDataService.resetToDefault()
  await galleryStore.fetchSeasons()
  await galleryStore.fetchGallery()
  await loadAllCards()
  toastStore.success('已将演示数据与番单重置为初始状态')
}

async function handleSeasonUpdated() {
  await galleryStore.fetchSeasons()
  await loadAllCards()
}

async function handleDeleteSeason(season: SeasonItem) {
  if (
    !confirm(
      `确定要删除季度「${season.name}」吗？\n\n警告：删除后该季度下的所有候选番剧名单及已发布的评测卡片都将被一并清除，此操作不可撤销！`
    )
  ) {
    return
  }

  deletingSeasonId.value = season.season_id
  try {
    await deleteSeasonApi(season.season_id)
    toastStore.success(`季度「${season.name}」已成功删除`)
    await galleryStore.fetchSeasons()
    await galleryStore.fetchGallery()
    await loadAllCards()
  } catch (err: any) {
    toastStore.error(err.message || '删除季度失败')
  } finally {
    deletingSeasonId.value = null
  }
}
</script>

<template>
  <div class="admin-page container">
    <!-- Non-admin screen if not logged in as admin -->
    <div v-if="!authStore.isAdmin" class="unauthorized-card glass-panel-strong animate-scale-in">
      <div class="unauth-icon-box">
        <AlertTriangle :size="32" class="text-amber" />
      </div>
      <h3 class="unauth-title">需要管理员权限</h3>
      <p class="unauth-desc">
        您当前身份为「{{ authStore.role === 'author' ? '撰稿作者' : '游客' }}」，季度创建、截止时间维护与数据导出仅对系统管理员开放。
      </p>

      <div class="unauth-actions">
        <router-link to="/" class="btn btn-secondary">
          <ArrowLeft :size="16" />
          <span>返回新番画廊</span>
        </router-link>

        <button v-if="configStore.isMockMode" class="btn btn-primary" @click="authStore.switchMockRole('admin')">
          一键切换为管理员 (Mock)
        </button>
      </div>
    </div>

    <!-- Authorized Admin Panel -->
    <template v-else>
      <!-- Admin Header -->
      <div class="admin-header">
        <div>
          <h2 class="page-title">
            <ShieldCheck class="title-icon" :size="26" />
            <span>季度与番单管理中心</span>
          </h2>
          <p class="page-subtitle">
            维护新番季度档案、设置截稿时间锁、维护作者建卡候选番单，以及导出季度内容归档。
          </p>
        </div>

        <div class="admin-top-actions">
          <button
            v-if="configStore.isMockMode"
            class="btn btn-secondary"
            title="重置预设的番剧与季度数据"
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

      <!-- Season Cards -->
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
            <span class="cards-count-pill">{{ getSeasonCardsCount(season.name) }} 篇评测卡片</span>
          </div>

          <div class="season-card-body">
            <div class="info-row">
              <span class="info-label"><Clock :size="13" /> 截稿时间：</span>
              <span class="info-val" :class="{ 'text-danger': season.deadline && Date.now() > season.deadline * 1000 }">
                {{ formatDeadline(season.deadline) }}
              </span>
            </div>

            <div class="info-row animes-preview-row">
              <span class="info-label"><Film :size="13" /> 候选番剧 ({{ season.animes.length }} 部)：</span>
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
            <button class="action-btn" title="设置或取消该季度的截稿截止时间" @click="activeDeadlineSeason = season">
              <Clock :size="14" />
              <span>截止时间</span>
            </button>
            <button class="action-btn" title="维护与追加该季度的候选番剧清单" @click="activeAnimeListSeason = season">
              <Film :size="14" />
              <span>维护番单</span>
            </button>
            <button class="action-btn export-btn" title="导出全量评测包文件清单" @click="activeExportSeason = season">
              <Archive :size="14" />
              <span>导出 ZIP</span>
            </button>
            <button
              class="action-btn delete-btn"
              title="删除该季度及关联评测档案"
              :disabled="deletingSeasonId === season.season_id"
              @click="handleDeleteSeason(season)"
            >
              <Trash2 :size="14" />
              <span>{{ deletingSeasonId === season.season_id ? '删除中...' : '删除' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modals -->
      <SeasonCreateModal
        v-if="isCreateSeasonModalOpen"
        @close="isCreateSeasonModalOpen = false"
        @created="handleSeasonUpdated"
      />

      <DeadlineModal
        v-if="activeDeadlineSeason"
        :season="activeDeadlineSeason"
        @close="activeDeadlineSeason = null"
        @updated="handleSeasonUpdated"
      />

      <AnimeListModal
        v-if="activeAnimeListSeason"
        :season="activeAnimeListSeason"
        @close="activeAnimeListSeason = null"
        @updated="handleSeasonUpdated"
      />

      <SeasonExportModal
        v-if="activeExportSeason"
        :season="activeExportSeason"
        @close="activeExportSeason = null"
      />
    </template>
  </div>
</template>

<style scoped>
.admin-page {
  padding: 2.5rem 1.5rem 5rem 1.5rem;
}

.unauthorized-card {
  max-width: 520px;
  margin: 4rem auto;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.unauth-icon-box {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-full);
  background: rgba(245, 158, 11, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.unauth-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.unauth-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.unauth-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.cards-count-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: #c7d2fe;
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
  gap: 0.45rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.35rem;
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

.action-btn.delete-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.action-btn.delete-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
}

.text-amber { color: var(--accent-amber); }
.text-indigo { color: var(--accent-primary); }
.text-danger { color: #f87171; font-weight: 600; }
</style>
