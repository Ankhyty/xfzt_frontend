<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGalleryStore } from '../stores/gallery'
import { useConfigStore } from '../stores/config'
import { useToastStore } from '../stores/toast'
import { getGalleryItemsApi } from '../api/gallery'
import { deleteCardApi } from '../api/cards'
import type { CardItem } from '../types'
import CardDetailModal from '../components/gallery/CardDetailModal.vue'
import CustomSelect from '../components/common/CustomSelect.vue'
import {
  User,
  PenTool,
  Star,
  Layers,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
  Search,
  ArrowUpDown,
  X
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const galleryStore = useGalleryStore()
const configStore = useConfigStore()
const toastStore = useToastStore()

// State
const allCardsList = ref<CardItem[]>([])
const isLoading = ref<boolean>(false)
const deletingCardId = ref<string | null>(null)

// Profile Filter & Search State (Dual Year & Season Selectors)
const profileSelectedYear = ref<string>('ALL')
const profileSelectedMonth = ref<string>('ALL')
const profileSearchQuery = ref<string>('')
const profileSortBy = ref<'updated' | 'score' | 'title'>('updated')

async function loadProfileCards() {
  if (!authStore.isLoggedIn) return
  isLoading.value = true
  try {
    const res = await getGalleryItemsApi('ALL')
    allCardsList.value = res.items
  } catch (e) {
    console.error('Failed to load profile cards', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await galleryStore.fetchSeasons()
  await loadProfileCards()
})

watch(
  () => authStore.userInfo,
  () => {
    loadProfileCards()
  }
)

// All cards belonging to current user
const userCards = computed(() => {
  if (!authStore.userInfo) return []
  const userId = String(authStore.userInfo.user_id)
  const username = authStore.userInfo.username
  return allCardsList.value.filter(
    (c) => String(c.owner.user_id) === userId || c.owner.username === username
  )
})

// Distinct years where the user published cards
const availableUserYears = computed(() => {
  const years = new Set<string>()
  userCards.value.forEach((c) => {
    const idx = c.season_tag.indexOf('-')
    if (idx !== -1) {
      const y = c.season_tag.slice(0, idx)
      if (y) years.add(y)
    }
  })
  const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a))
  return [
    { value: 'ALL', label: '全部年份' },
    ...sortedYears.map((y) => ({ value: y, label: `${y} 年` }))
  ]
})

// Distinct seasons/quarters for the selected user year (or all years)
const availableUserMonths = computed(() => {
  const standardLabels: Record<string, string> = {
    '01': '1月 冬季番',
    '04': '4月 春季番',
    '07': '7月 夏季番',
    '10': '10月 秋季番'
  }

  const tags = new Set<string>()
  userCards.value.forEach((c) => {
    const idx = c.season_tag.indexOf('-')
    if (idx !== -1) {
      const y = c.season_tag.slice(0, idx)
      const tag = c.season_tag.slice(idx + 1)
      if (profileSelectedYear.value === 'ALL' || y === profileSelectedYear.value) {
        tags.add(tag)
      }
    }
  })

  const list: { value: string; label: string }[] = [{ value: 'ALL', label: '全部季度' }]

  // Add standard quarters in order if present
  ;['01', '04', '07', '10'].forEach((m) => {
    if (tags.has(m)) {
      list.push({ value: m, label: standardLabels[m] })
    }
  })

  // Add custom tags if present
  tags.forEach((t) => {
    if (!standardLabels[t]) {
      list.push({ value: t, label: t })
    }
  })

  return list
})

const sortOptions = [
  { value: 'updated', label: '按最新更新' },
  { value: 'score', label: '按最高评分' },
  { value: 'title', label: '按番剧名称' }
]

// Statistics
const totalSeasons = computed(() => {
  const seasonsSet = new Set<string>()
  userCards.value.forEach((c) => seasonsSet.add(c.season_tag))
  return seasonsSet.size
})

const averageScore = computed(() => {
  if (userCards.value.length === 0) return '0.0'
  const sum = userCards.value.reduce((acc, c) => acc + (c.articleContent?.score || 9.0), 0)
  return (sum / userCards.value.length).toFixed(1)
})

// Filtered & Sorted user cards
const filteredUserCards = computed(() => {
  let list = [...userCards.value]

  // Filter by year
  if (profileSelectedYear.value !== 'ALL') {
    list = list.filter((c) => c.season_tag.startsWith(`${profileSelectedYear.value}-`))
  }

  // Filter by season/tag
  if (profileSelectedMonth.value !== 'ALL') {
    list = list.filter((c) => c.season_tag.endsWith(`-${profileSelectedMonth.value}`))
  }

  // Filter by search query
  if (profileSearchQuery.value.trim()) {
    const q = profileSearchQuery.value.trim().toLowerCase()
    list = list.filter(
      (c) =>
        c.anime_name.toLowerCase().includes(q) ||
        c.articleContent?.summary.toLowerCase().includes(q)
    )
  }

  // Sort
  if (profileSortBy.value === 'score') {
    list.sort((a, b) => (b.articleContent?.score || 0) - (a.articleContent?.score || 0))
  } else if (profileSortBy.value === 'title') {
    list.sort((a, b) => a.anime_name.localeCompare(b.anime_name, 'zh-CN'))
  } else {
    list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }

  return list
})

function resetFilters() {
  profileSelectedYear.value = 'ALL'
  profileSelectedMonth.value = 'ALL'
  profileSearchQuery.value = ''
}

function handleEditCard(cardId: string) {
  router.push({
    path: '/studio',
    query: { editCardId: cardId }
  })
}

function handleViewCard(cardId: string) {
  galleryStore.openCardDetail(cardId)
}

async function handleDeleteCard(card: CardItem) {
  if (!confirm(`确定要删除评测卡片「${card.anime_name}」吗？\n\n该操作将永久移除该评测的所有版本与图片档案，不可撤销！`)) {
    return
  }

  deletingCardId.value = card.card_id
  try {
    await deleteCardApi(card.card_id)
    toastStore.success(`已删除评测卡片「${card.anime_name}」`)
    await loadProfileCards()
    await galleryStore.fetchGallery()
  } catch (err: any) {
    toastStore.error(err.message || '删除卡片失败')
  } finally {
    deletingCardId.value = null
  }
}
</script>

<template>
  <div class="profile-page container">
    <!-- Non-logged in banner -->
    <div v-if="!authStore.isLoggedIn" class="unauth-profile glass-panel-strong animate-scale-in">
      <div class="unauth-avatar-box">
        <User :size="36" class="text-indigo" />
      </div>
      <h3>个人中心</h3>
      <p>请登录后查看您撰写的新番评测卡片、创作季度统计与管理档案。</p>
      <button class="btn btn-primary" @click="emit('open-auth')">
        立即登录 / 注册
      </button>
    </div>

    <!-- Logged-in Profile Content -->
    <template v-else>
      <!-- Top Profile Info Header Card -->
      <div class="profile-header-card glass-panel-strong animate-fade-in">
        <div class="profile-main-info">
          <div class="large-avatar">
            {{ (authStore.userInfo?.nickname || authStore.userInfo?.username || 'U').slice(0, 1) }}
          </div>
          <div class="user-meta-col">
            <div class="user-title-row">
              <h2 class="user-nickname">{{ authStore.userInfo?.nickname }}</h2>
              <span class="user-role-badge" :class="authStore.role">
                {{ authStore.role === 'admin' ? '系统管理员' : '专栏撰稿人' }}
              </span>
            </div>
            <p class="user-handle">@{{ authStore.userInfo?.username }}</p>
            <p class="user-bio">
              新番杂谈创作者 · 用文字与镜头记录每季动画的震撼与感动
            </p>
          </div>
        </div>

        <!-- Quick Action on Top Right -->
        <div class="header-action-col">
          <router-link to="/studio" class="btn btn-primary">
            <PenTool :size="16" />
            <span>前往创作台写新稿</span>
          </router-link>
        </div>
      </div>

      <!-- Stats Grid Cards -->
      <div class="stats-cards-grid animate-fade-in">
        <div class="stat-card glass-panel">
          <div class="stat-icon-box bg-indigo">
            <Layers :size="20" class="text-indigo" />
          </div>
          <div class="stat-content">
            <span class="stat-val">{{ userCards.length }}</span>
            <span class="stat-label">创作卡片总数</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-box bg-amber">
            <Star :size="20" class="text-amber" />
          </div>
          <div class="stat-content">
            <span class="stat-val text-amber">{{ averageScore }}</span>
            <span class="stat-label">平均推荐评分</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon-box bg-emerald">
            <Calendar :size="20" class="text-emerald" />
          </div>
          <div class="stat-content">
            <span class="stat-val">{{ totalSeasons }}</span>
            <span class="stat-label">覆盖创作季度数</span>
          </div>
        </div>
      </div>

      <!-- My Cards Section with Dual Year & Season Filters (Requirement 4) -->
      <div class="my-cards-section animate-fade-in">
        <div class="section-title-row">
          <div class="title-left">
            <Sparkles :size="20" class="text-indigo" />
            <h3 class="section-title">我发布的评测卡片</h3>
            <span class="count-pill">共 {{ userCards.length }} 篇</span>
          </div>
        </div>

        <!-- Profile Cards Toolbar: Year & Season Dual Custom Selectors + Search + Sort -->
        <div class="profile-toolbar glass-panel">
          <!-- Year & Season Dual Selectors Group -->
          <div class="profile-dual-selectors">
            <!-- Year Selector -->
            <CustomSelect
              v-model="profileSelectedYear"
              :options="availableUserYears"
              :icon="Calendar"
              min-width="120px"
              @change="profileSelectedMonth = 'ALL'"
            />

            <!-- Quarter / Season Tag Selector -->
            <CustomSelect
              v-model="profileSelectedMonth"
              :options="availableUserMonths"
              :icon="Layers"
              min-width="135px"
            />
          </div>

          <div class="toolbar-divider"></div>

          <!-- Search Input -->
          <div class="toolbar-search-box">
            <Search :size="16" class="search-icon" />
            <input
              v-model="profileSearchQuery"
              type="text"
              class="profile-search-input"
              placeholder="搜索我发布的番剧名或简评..."
            />
            <button
              v-if="profileSearchQuery"
              class="clear-input-btn"
              @click="profileSearchQuery = ''"
            >
              <X :size="14" />
            </button>
          </div>

          <!-- Sort Custom Dropdown -->
          <CustomSelect
            v-model="profileSortBy"
            :options="sortOptions"
            :icon="ArrowUpDown"
            min-width="135px"
          />
        </div>

        <!-- Filtered Cards Counter Hint -->
        <div
          v-if="profileSelectedYear !== 'ALL' || profileSelectedMonth !== 'ALL' || profileSearchQuery"
          class="filtered-hint-row"
        >
          <span>当前筛选结果：{{ filteredUserCards.length }} / {{ userCards.length }} 篇</span>
          <button class="reset-filter-btn" @click="resetFilters">
            重置筛选
          </button>
        </div>

        <!-- Cards Grid -->
        <div v-if="filteredUserCards.length > 0" class="user-cards-grid">
          <div
            v-for="card in filteredUserCards"
            :key="card.card_id"
            class="user-card-item glass-panel animate-fade-in"
          >
            <!-- 16:9 Cover Box -->
            <div class="card-cover-box" @click="handleViewCard(card.card_id)">
              <img
                :src="card.content_assets?.images?.[0]?.url || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'"
                :alt="card.anime_name"
                class="cover-img"
              />
              <span class="season-badge">{{ card.season_tag }}</span>
              <span class="version-pill">{{ card.current_version }}</span>
            </div>

            <!-- Card Content -->
            <div class="card-info-box">
              <div class="card-title-row">
                <h4 class="card-anime-name" @click="handleViewCard(card.card_id)">{{ card.anime_name }}</h4>
                <div class="score-pill">
                  <Star :size="12" class="text-amber" />
                  <span>{{ Number(card.articleContent?.score ?? 9.0).toFixed(1) }}</span>
                </div>
              </div>

              <p class="card-summary-text">
                {{ card.articleContent?.summary || '暂无简评' }}
              </p>

              <div class="card-footer-meta">
                <span class="update-time">更新于 {{ new Date(card.updated_at).toLocaleDateString() }}</span>
                
                <div class="item-actions">
                  <button class="btn btn-secondary btn-xs" title="查看评测详情" @click="handleViewCard(card.card_id)">
                    <Eye :size="13" />
                    <span>查看</span>
                  </button>
                  <button class="btn btn-primary btn-xs" title="进入创作台编辑" @click="handleEditCard(card.card_id)">
                    <Edit3 :size="13" />
                    <span>编辑</span>
                  </button>
                  <button
                    class="btn btn-secondary btn-xs delete-card-btn"
                    title="删除评测卡片"
                    :disabled="deletingCardId === card.card_id"
                    @click="handleDeleteCard(card)"
                  >
                    <Trash2 :size="13" />
                    <span>{{ deletingCardId === card.card_id ? '删除中...' : '删除' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-cards-box glass-panel">
          <Layers :size="36" class="text-muted" />
          <p class="empty-title">未找到符合条件的评测卡片</p>
          <p class="empty-desc">您可以尝试切换年份/季度筛选或清除搜索关键词。</p>
          <button
            v-if="profileSelectedYear !== 'ALL' || profileSelectedMonth !== 'ALL' || profileSearchQuery"
            class="btn btn-secondary btn-sm"
            @click="resetFilters"
          >
            <span>清除筛选条件</span>
          </button>
          <router-link v-else to="/studio" class="btn btn-primary btn-sm">
            <PenTool :size="14" />
            <span>立即开始撰稿</span>
          </router-link>
        </div>
      </div>
    </template>

    <!-- Global Detail Modal -->
    <CardDetailModal />
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2.5rem 1.5rem 5rem 1.5rem;
}

.unauth-profile {
  max-width: 480px;
  margin: 5rem auto;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.unauth-avatar-box {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.profile-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2.25rem;
  border-radius: var(--radius-lg);
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.profile-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.large-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}

.user-meta-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-nickname {
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
}

.user-role-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
}

.user-role-badge.admin {
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.4);
}

.user-role-badge.author {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.user-handle {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: monospace;
}

.user-bio {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-md);
}

.stat-icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-indigo { background: rgba(99, 102, 241, 0.15); }
.bg-amber { background: rgba(245, 158, 11, 0.15); }
.bg-emerald { background: rgba(16, 185, 129, 0.15); }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-display);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

.my-cards-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  z-index: 50;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
}

.count-pill {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
}

/* Profile Toolbar */
.profile-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.profile-dual-selectors {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.toolbar-divider {
  width: 1px;
  height: 1.75rem;
  background: var(--border-subtle);
}

.toolbar-search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.profile-search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
  padding: 0.6rem 2.2rem 0.6rem 2.5rem;
  outline: none;
  transition: all var(--transition-fast);
}

.profile-search-input:focus {
  border-color: var(--accent-primary);
  background: rgba(0, 0, 0, 0.45);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.clear-input-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: var(--text-muted);
  padding: 0.2rem;
  display: flex;
  align-items: center;
}

.clear-input-btn:hover {
  color: var(--text-primary);
}

.filtered-hint-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0 0.5rem;
}

.reset-filter-btn {
  color: var(--accent-primary);
  font-weight: 600;
  background: transparent;
  cursor: pointer;
}

.reset-filter-btn:hover {
  text-decoration: underline;
}

.user-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.user-card-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.user-card-item:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: var(--shadow-glow);
}

.card-cover-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  overflow: hidden;
  background: #000;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.user-card-item:hover .cover-img {
  transform: scale(1.04);
}

.season-badge {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  font-weight: 700;
  color: #a5b4fc;
}

.version-pill {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: var(--gradient-primary);
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
}

.card-info-box {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-anime-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-anime-name:hover {
  color: var(--accent-primary);
}

.score-pill {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  background: rgba(245, 158, 11, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24;
}

.card-summary-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.update-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-xs {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
}

.delete-card-btn {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.delete-card-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fecaca;
}

.empty-cards-box {
  padding: 4rem 2rem;
  text-align: center;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.text-indigo { color: var(--accent-primary); }
.text-amber { color: var(--accent-amber); }
.text-emerald { color: var(--accent-emerald); }

@media (max-width: 800px) {
  .profile-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-divider {
    display: none;
  }
  .profile-dual-selectors {
    justify-content: space-between;
  }
}
</style>
