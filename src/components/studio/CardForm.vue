<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStudioStore } from '../../stores/studio'
import { useGalleryStore } from '../../stores/gallery'
import { useToastStore } from '../../stores/toast'
import { addAnimeToSeasonApi } from '../../api/seasons'
import { fuzzyFilterAndSort } from '../../utils/fuzzy'
import {
  Star,
  Plus,
  BookOpen,
  Quote,
  Search,
  Check,
  ChevronDown,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-vue-next'

const studioStore = useStudioStore()
const galleryStore = useGalleryStore()
const toastStore = useToastStore()

// Combobox Search State
const animeSearchInput = ref('')
const isDropdownOpen = ref(false)
const isAddingAnime = ref(false)
const comboboxRef = ref<HTMLElement | null>(null)

// Exact required score ticks: 4.0, 5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0
const scoreTicks = [4.0, 5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]

const currentSeasonObj = computed(() => {
  return galleryStore.seasons.find((s) => s.name === studioStore.seasonTag)
})

const animeCandidates = computed(() => {
  return currentSeasonObj.value?.animes || []
})

// Typo-tolerant & fuzzy filtered anime list
const filteredAnimeCandidates = computed(() => {
  return fuzzyFilterAndSort(animeCandidates.value, animeSearchInput.value)
})

// Auto-fill latest season if empty
function ensureDefaultSeason() {
  if (!studioStore.seasonTag && galleryStore.seasons.length > 0) {
    studioStore.seasonTag = galleryStore.seasons[0].name
  }
}

onMounted(() => {
  ensureDefaultSeason()
  document.addEventListener('click', handleClickOutside)
})

watch(
  () => galleryStore.seasons,
  (seasons) => {
    if (seasons.length > 0 && !studioStore.seasonTag) {
      studioStore.seasonTag = seasons[0].name
    }
  },
  { immediate: true, deep: true }
)

// Sync input text when studioStore.animeName changes externally
watch(
  () => studioStore.animeName,
  (val) => {
    animeSearchInput.value = val
  },
  { immediate: true }
)

function selectAnime(anime: string) {
  studioStore.animeName = anime
  animeSearchInput.value = anime
  isDropdownOpen.value = false
}

function handleInputFocus() {
  isDropdownOpen.value = true
}

function clearAnimeSelection() {
  studioStore.animeName = ''
  animeSearchInput.value = ''
  isDropdownOpen.value = true
}

function setQuickScore(val: number) {
  studioStore.score = val
}

function handleClickOutside(e: MouseEvent) {
  if (comboboxRef.value && !comboboxRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false
  }
}

async function handleAddNewAnime(animeNameToAdd?: string) {
  const targetName = (animeNameToAdd || animeSearchInput.value).trim()
  if (!targetName) {
    toastStore.warning('请输入要新建的番剧名称')
    return
  }
  if (!currentSeasonObj.value) {
    toastStore.warning('请先选择所属季度')
    return
  }

  isAddingAnime.value = true
  try {
    await addAnimeToSeasonApi(currentSeasonObj.value.season_id, targetName)
    toastStore.success(`已向 ${currentSeasonObj.value.name} 新增番剧「${targetName}」`)
    await galleryStore.fetchSeasons()
    selectAnime(targetName)
  } catch (e: any) {
    console.error(e)
  } finally {
    isAddingAnime.value = false
  }
}
</script>

<template>
  <div class="card-form-container">
    <!-- Meta Settings Row -->
    <div class="form-row-grid">
      <!-- Season Selection (Clean, no suffix) -->
      <div class="form-group">
        <label class="form-label">所属季度 <span class="required-star">*</span></label>
        <select v-model="studioStore.seasonTag" class="form-select">
          <option v-for="s in galleryStore.seasons" :key="s.season_id" :value="s.name">
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Searchable Anime Combobox (Typo-tolerant fuzzy search + Bottom New Entry option) -->
      <div class="form-group anime-combobox-group">
        <label class="form-label">评测番剧名称 <span class="required-star">*</span></label>
        
        <div ref="comboboxRef" class="combobox-wrapper">
          <div class="combobox-input-box" :class="{ focused: isDropdownOpen }">
            <Search :size="16" class="combobox-search-icon" />
            <input
              v-model="animeSearchInput"
              type="text"
              class="combobox-input"
              placeholder="输入番剧名搜索（支持错字容错）或选择..."
              @focus="handleInputFocus"
              @keyup.enter="filteredAnimeCandidates.length === 1 ? selectAnime(filteredAnimeCandidates[0]) : null"
            />
            <button
              v-if="animeSearchInput"
              type="button"
              class="clear-input-btn"
              @click="clearAnimeSelection"
            >
              <X :size="14" />
            </button>
            <button
              type="button"
              class="dropdown-arrow-btn"
              @click="isDropdownOpen = !isDropdownOpen"
            >
              <ChevronDown :size="16" :class="{ 'rotate-180': isDropdownOpen }" />
            </button>
          </div>

          <!-- Dropdown List Overlay -->
          <div v-if="isDropdownOpen" class="combobox-dropdown glass-panel-strong animate-scale-in">
            <!-- Header Hint -->
            <div class="dropdown-header-hint">
              <span>当前季度候选番剧 ({{ filteredAnimeCandidates.length }})</span>
            </div>

            <!-- List of existing candidate matches -->
            <ul v-if="filteredAnimeCandidates.length > 0" class="dropdown-list">
              <li
                v-for="anime in filteredAnimeCandidates"
                :key="anime"
                class="dropdown-item"
                :class="{ selected: studioStore.animeName === anime }"
                @click="selectAnime(anime)"
              >
                <span class="anime-name-text">{{ anime }}</span>
                <Check v-if="studioStore.animeName === anime" :size="14" class="text-indigo" />
              </li>
            </ul>

            <div v-else class="no-match-notice">
              <span>无完全匹配的已知候选项</span>
            </div>

            <!-- Always Last Item: Prominent Create New Anime Option (Requirement 3) -->
            <div class="dropdown-add-section">
              <div class="section-divider"></div>
              <button
                type="button"
                class="add-anime-action-btn"
                :disabled="isAddingAnime"
                @click="handleAddNewAnime()"
              >
                <div class="btn-top-tag">
                  <AlertCircle :size="13" class="text-amber" />
                  <span>找不到想要的番剧？</span>
                </div>
                <div class="btn-body-row">
                  <div class="plus-icon-box">
                    <Plus :size="15" />
                  </div>
                  <div class="btn-text-content">
                    <span class="action-title">
                      {{ isAddingAnime ? '正在创建...' : (animeSearchInput.trim() ? `新建「${animeSearchInput.trim()}」词条并选定` : '新建自定义番剧词条并选定') }}
                    </span>
                    <span class="action-subtitle">
                      * 仅在上方的候选项均无您要评测的作品时使用
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Score Setting with Slider & Clickable Ticks (Requirement 4: 4.0 ~ 9.0) -->
    <div class="form-group score-section-group">
      <div class="score-header-row">
        <label class="form-label">综合推荐评分 (0.0 ~ 10.0)</label>
        <span class="score-quick-hint">滑动滑杆或直接点击下方刻度直接选定</span>
      </div>

      <div class="score-input-wrapper">
        <input
          v-model.number="studioStore.score"
          type="range"
          min="0"
          max="10"
          step="0.1"
          class="score-slider"
        />
        <div class="score-display-box">
          <Star :size="16" class="star-gold" />
          <span class="score-text">{{ Number(studioStore.score).toFixed(1) }}</span>
        </div>
      </div>

      <!-- Clickable Integer & Half-Integer Ticks Bar: 4.0, 5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0 -->
      <div class="score-ticks-bar">
        <button
          v-for="tick in scoreTicks"
          :key="tick"
          type="button"
          class="tick-chip-btn"
          :class="{ active: Math.abs(studioStore.score - tick) < 0.05 }"
          @click="setQuickScore(tick)"
        >
          {{ tick.toFixed(1) }}
        </button>
      </div>
    </div>

    <!-- Highlight Summary -->
    <div class="form-group">
      <label class="form-label">
        <Quote :size="14" class="inline-label-icon" /> 一句话亮点简评 <span class="required-star">*</span>
      </label>
      <input
        v-model="studioStore.summary"
        type="text"
        class="form-input summary-input"
        placeholder="用一句话总结本片最触动人心或值得安利的亮点（展示在画廊卡片首屏）"
        maxlength="120"
      />
    </div>

    <!-- Pure Text Article Editor Area -->
    <div class="form-group editor-group">
      <label class="form-label">
        <BookOpen :size="14" class="inline-label-icon" /> 评测正文内容 <span class="required-star">*</span>
      </label>

      <textarea
        v-model="studioStore.content"
        class="plain-text-textarea"
        placeholder="在此输入评测长文正文内容（支持分段换行）..."
        rows="12"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.card-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 1.25rem;
}

.required-star {
  color: #f43f5e;
}

.anime-combobox-group {
  position: relative;
}

.combobox-wrapper {
  position: relative;
}

.combobox-input-box {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  padding: 0 0.5rem 0 0.85rem;
  transition: all var(--transition-fast);
}

.combobox-input-box.focused {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  background: rgba(15, 23, 42, 0.95);
}

.combobox-search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-right: 0.5rem;
}

.combobox-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.95rem;
  padding: 0.75rem 0;
  outline: none;
}

.combobox-input::placeholder {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.clear-input-btn,
.dropdown-arrow-btn {
  background: transparent;
  color: var(--text-muted);
  padding: 0.35rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.dropdown-arrow-btn .rotate-180 {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

.clear-input-btn:hover,
.dropdown-arrow-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  max-height: 320px;
  overflow-y: auto;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  border: 1px solid var(--border-glass);
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(20px);
}

.dropdown-header-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 0.3rem 0.6rem;
  font-weight: 600;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #fff;
}

.dropdown-item.selected {
  background: rgba(99, 102, 241, 0.35);
  font-weight: 700;
  color: #a5b4fc;
}

.no-match-notice {
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}

/* Add Anime Bottom Option (Prominent) */
.dropdown-add-section {
  margin-top: 0.5rem;
}

.section-divider {
  height: 1px;
  background: var(--border-subtle);
  margin-bottom: 0.5rem;
}

.add-anime-action-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.85rem;
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-anime-action-btn:hover {
  background: rgba(99, 102, 241, 0.18);
  border-color: var(--accent-primary);
  border-style: solid;
}

.btn-top-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24;
}

.btn-body-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
}

.plus-icon-box {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-xs);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.btn-text-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.action-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}

.action-subtitle {
  font-size: 0.725rem;
  color: #cbd5e1;
  line-height: 1.3;
}

.score-section-group {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.score-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.score-quick-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-slider {
  flex: 1;
  accent-color: var(--accent-amber);
  cursor: pointer;
}

.score-display-box {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.85rem;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: var(--radius-sm);
}

.star-gold {
  color: #f59e0b;
  fill: #f59e0b;
}

.score-text {
  font-weight: 800;
  font-size: 1.1rem;
  color: #fbbf24;
  font-family: var(--font-display);
}

.score-ticks-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tick-chip-btn {
  padding: 0.25rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.tick-chip-btn:hover {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.4);
}

.tick-chip-btn.active {
  background: #f59e0b;
  color: #000;
  border-color: #f59e0b;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
}

.inline-label-icon {
  vertical-align: middle;
  color: var(--accent-primary);
}

.summary-input {
  font-size: 0.95rem;
  border-color: rgba(99, 102, 241, 0.3);
}

.plain-text-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.7;
  resize: vertical;
  min-height: 260px;
}

.plain-text-textarea:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  background: rgba(15, 23, 42, 0.95);
}

.text-indigo {
  color: var(--accent-primary);
}
.text-amber {
  color: var(--accent-amber);
}

@media (max-width: 768px) {
  .form-row-grid {
    grid-template-columns: 1fr;
  }
}
</style>
