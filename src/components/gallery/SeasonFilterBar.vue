<script setup lang="ts">
import { computed } from 'vue'
import { useGalleryStore } from '../../stores/gallery'
import CustomSelect from '../common/CustomSelect.vue'
import {
  Search,
  RefreshCw,
  ArrowUpDown,
  Calendar,
  Layers,
  X,
  Filter,
  Globe
} from 'lucide-vue-next'

const galleryStore = useGalleryStore()

const yearOptions = computed(() => {
  return galleryStore.availableYears.map((y) => ({
    value: y,
    label: `${y} 年`
  }))
})

const monthOptions = computed(() => {
  return galleryStore.availableMonths.map((m) => ({
    value: m.value,
    label: m.label
  }))
})

const sortOptions = [
  { value: 'updated', label: '按最新更新' },
  { value: 'score', label: '按最高评分' },
  { value: 'title', label: '按番剧名称' }
]

function handleYearChange(val: string | number) {
  galleryStore.setYear(String(val))
}

function handleMonthChange(val: string | number) {
  galleryStore.setMonth(String(val))
}

function handleRefresh() {
  if (galleryStore.isGlobalSearch) {
    galleryStore.toggleGlobalSearch(true)
  } else {
    galleryStore.fetchGallery()
  }
}

function clearSearchAndGlobal() {
  galleryStore.searchQuery = ''
  if (galleryStore.isGlobalSearch) {
    galleryStore.toggleGlobalSearch(false)
  }
}
</script>

<template>
  <div class="filter-section">
    <!-- Active Search Filter Banner if searching or in global search mode -->
    <div v-if="galleryStore.searchQuery || galleryStore.isGlobalSearch" class="active-filter-banner glass-panel animate-fade-in">
      <div class="filter-banner-left">
        <Globe v-if="galleryStore.isGlobalSearch" :size="15" class="text-cyan" />
        <Filter v-else :size="14" class="text-indigo" />

        <span v-if="galleryStore.isGlobalSearch">
          当前模式：<strong>跨季度全局搜索</strong>
          <template v-if="galleryStore.searchQuery">
            「<strong>{{ galleryStore.searchQuery }}</strong>」
          </template>
        </span>
        <span v-else>
          当前当季搜索：<strong>「{{ galleryStore.searchQuery }}」</strong>
        </span>

        <span class="count-hint">(共匹配 {{ galleryStore.filteredCards.length }} 篇评测)</span>
      </div>

      <button class="clear-filter-btn" @click="clearSearchAndGlobal">
        <X :size="14" />
        <span>{{ galleryStore.isGlobalSearch ? '退出全局搜索' : '清除筛选' }}</span>
      </button>
    </div>

    <!-- Main Filter & Controls Toolbar -->
    <div class="main-filter-toolbar glass-panel">
      <!-- Left: Custom Year & Season Dropdown Selectors -->
      <div class="dropdowns-group" :class="{ 'dimmed-by-global': galleryStore.isGlobalSearch }">
        <!-- Year Custom Dropdown -->
        <CustomSelect
          :model-value="galleryStore.selectedYear"
          :options="yearOptions"
          :icon="Calendar"
          min-width="125px"
          @change="handleYearChange"
        />

        <!-- Season Custom Dropdown -->
        <CustomSelect
          :model-value="galleryStore.selectedMonth"
          :options="monthOptions"
          :icon="Layers"
          min-width="145px"
          @change="handleMonthChange"
        />
      </div>

      <div class="toolbar-divider"></div>

      <!-- Center: Search Input with Global Search Button -->
      <div class="search-box-wrapper">
        <div class="search-box">
          <Search class="search-icon" :size="17" />
          <input
            v-model="galleryStore.searchQuery"
            type="text"
            class="search-input"
            :placeholder="galleryStore.isGlobalSearch ? '在所有季度中搜索番剧名、作者、季度或简评...' : '搜索当季番剧名、撰稿作者或简评内容...'"
          />
          <button
            v-if="galleryStore.searchQuery"
            class="clear-search-btn"
            @click="galleryStore.searchQuery = ''"
          >
            &times;
          </button>
        </div>

        <!-- Global Search Toggle Button -->
        <button
          class="btn global-search-btn"
          :class="{ active: galleryStore.isGlobalSearch }"
          :title="galleryStore.isGlobalSearch ? '当前为跨季度全局搜索（点击切回当季）' : '点击开启跨所有季度的全局搜索'"
          @click="galleryStore.toggleGlobalSearch()"
        >
          <Globe :size="15" />
          <span>{{ galleryStore.isGlobalSearch ? '全季搜索中' : '全局搜索' }}</span>
        </button>
      </div>

      <!-- Right: Custom Sort & Refresh -->
      <div class="actions-group">
        <!-- Custom Sort Dropdown -->
        <CustomSelect
          v-model="galleryStore.sortBy"
          :options="sortOptions"
          :icon="ArrowUpDown"
          min-width="135px"
        />

        <!-- Refresh Button -->
        <button
          class="btn btn-secondary btn-icon-text refresh-btn"
          :class="{ 'is-loading': galleryStore.isLoading }"
          title="刷新当前画廊卡片"
          @click="handleRefresh"
        >
          <RefreshCw :size="15" :class="{ 'spin-icon': galleryStore.isLoading }" />
          <span>{{ galleryStore.isLoading ? '刷新中...' : '刷新' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 100;
}

.active-filter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-sm);
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  font-size: 0.85rem;
}

.filter-banner-left {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--text-primary);
}

.count-hint {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.clear-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.65rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.clear-filter-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.main-filter-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.dropdowns-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  position: relative;
  z-index: 110;
  transition: opacity var(--transition-fast);
}

.dropdowns-group.dimmed-by-global {
  opacity: 0.75;
}

.toolbar-divider {
  width: 1px;
  height: 1.75rem;
  background: var(--border-subtle);
}

.search-box-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 320px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.2rem 0.6rem 2.5rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.search-input:focus {
  border-color: var(--accent-primary);
  background: rgba(0, 0, 0, 0.45);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 1.2rem;
  line-height: 1;
  padding: 0.2rem 0.4rem;
}

.global-search-btn {
  padding: 0.58rem 0.95rem;
  font-size: 0.825rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.global-search-btn:hover {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.4);
}

.global-search-btn.active {
  background: rgba(6, 182, 212, 0.25);
  color: #67e8f9;
  border-color: #06b6d4;
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
  font-weight: 700;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.refresh-btn {
  padding: 0.55rem 0.95rem;
  font-size: 0.825rem;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

.text-indigo { color: var(--accent-primary); }
.text-cyan { color: var(--accent-cyan); }

@media (max-width: 992px) {
  .main-filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-divider {
    display: none;
  }
  .dropdowns-group,
  .actions-group {
    justify-content: space-between;
  }
  .search-box-wrapper {
    min-width: 100%;
  }
}
</style>
