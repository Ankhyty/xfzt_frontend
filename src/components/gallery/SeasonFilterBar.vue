<script setup lang="ts">
import { useGalleryStore } from '../../stores/gallery'
import { Search, RefreshCw, ArrowUpDown, Filter, Sparkles } from 'lucide-vue-next'

const galleryStore = useGalleryStore()

function handleRefresh() {
  galleryStore.fetchGallery()
}
</script>

<template>
  <div class="filter-section">
    <!-- Top Row: Seasons Tabs -->
    <div class="season-tabs-container">
      <button
        class="season-tab-btn"
        :class="{ active: galleryStore.selectedSeason === 'ALL' }"
        @click="galleryStore.setSeason('ALL')"
      >
        <Sparkles :size="14" />
        <span>全部季度</span>
      </button>

      <button
        v-for="season in galleryStore.seasons"
        :key="season.season_id"
        class="season-tab-btn"
        :class="{ active: galleryStore.selectedSeason === season.name }"
        @click="galleryStore.setSeason(season.name)"
      >
        <span>{{ season.name }}</span>
      </button>
    </div>

    <!-- Bottom Row: Search & Sort & Refresh Controls -->
    <div class="controls-bar glass-panel">
      <!-- Search Input -->
      <div class="search-box">
        <Search class="search-icon" :size="18" />
        <input
          v-model="galleryStore.searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索番剧名称、作者昵称或简评内容..."
        />
        <button
          v-if="galleryStore.searchQuery"
          class="clear-search-btn"
          @click="galleryStore.searchQuery = ''"
        >
          &times;
        </button>
      </div>

      <!-- Controls Right: Sort & ETag Fresh Refresh -->
      <div class="controls-right">
        <!-- Sort Dropdown -->
        <div class="sort-wrapper">
          <ArrowUpDown :size="16" class="sort-icon" />
          <select v-model="galleryStore.sortBy" class="sort-select">
            <option value="updated">按最新更新</option>
            <option value="score">按最高评分</option>
            <option value="title">按番剧名称</option>
          </select>
        </div>

        <!-- ETag Fresh Refresh Button -->
        <button
          class="btn btn-secondary btn-icon-text refresh-btn"
          :class="{ 'is-loading': galleryStore.isLoading }"
          title="发起附带 ETag 的校对刷新 (304 Cache Check)"
          @click="handleRefresh"
        >
          <RefreshCw :size="16" :class="{ 'spin-icon': galleryStore.isLoading }" />
          <span>{{ galleryStore.isLoading ? '校对中...' : '校对刷新' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.season-tabs-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.season-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.season-tab-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.season-tab-btn.active {
  background: var(--gradient-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 460px;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.65rem 2.2rem 0.65rem 2.6rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
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

.controls-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
}

.sort-select {
  padding: 0.6rem 1rem 0.6rem 2.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
}

.refresh-btn {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: none;
  }
  .controls-right {
    justify-content: space-between;
  }
}
</style>
