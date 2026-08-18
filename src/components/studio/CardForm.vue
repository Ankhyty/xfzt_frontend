<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import { useStudioStore } from '../../stores/studio'
import { useGalleryStore } from '../../stores/gallery'
import { useToastStore } from '../../stores/toast'
import { addAnimeToSeasonApi } from '../../api/seasons'
import {
  Sparkles,
  Star,
  Plus,
  BookOpen,
  Eye,
  Edit,
  Columns,
  Quote,
  Flame,
  Check
} from 'lucide-vue-next'

const studioStore = useStudioStore()
const galleryStore = useGalleryStore()
const toastStore = useToastStore()

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

// Editor Mode: 'edit' | 'split' | 'preview'
const editorMode = ref<'edit' | 'split' | 'preview'>('split')

// Inline Add Anime Modal State
const isAddAnimeModalOpen = ref(false)
const newAnimeName = ref('')
const isAddingAnime = ref(false)

const currentSeasonObj = computed(() => {
  return galleryStore.seasons.find((s) => s.name === studioStore.seasonTag)
})

const animeCandidates = computed(() => {
  return currentSeasonObj.value?.animes || []
})

// Initialize season if empty
watch(
  () => galleryStore.seasons,
  (seasons) => {
    if (seasons.length > 0 && !studioStore.seasonTag) {
      studioStore.seasonTag = seasons[0].name
    }
  },
  { immediate: true }
)

const renderedMarkdown = computed(() => {
  if (!studioStore.content.trim()) {
    return '<p style="color:#64748b;font-style:italic;">右侧或预览模式将实时呈现 Markdown 渲染效果...</p>'
  }
  return md.render(studioStore.content)
})

async function handleAddAnime() {
  if (!newAnimeName.value.trim()) {
    toastStore.warning('请输入番剧名称')
    return
  }
  if (!currentSeasonObj.value) {
    toastStore.warning('请先选择季度')
    return
  }

  isAddingAnime.value = true
  try {
    const updated = await addAnimeToSeasonApi(currentSeasonObj.value.season_id, newAnimeName.value.trim())
    toastStore.success(`已向 ${currentSeasonObj.value.name} 新增番剧词条「${newAnimeName.value.trim()}」`)
    studioStore.animeName = newAnimeName.value.trim()
    newAnimeName.value = ''
    isAddAnimeModalOpen.value = false
    await galleryStore.fetchSeasons()
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
      <!-- Season Selection -->
      <div class="form-group">
        <label class="form-label">所属季度 <span class="required-star">*</span></label>
        <select v-model="studioStore.seasonTag" class="form-select">
          <option v-for="s in galleryStore.seasons" :key="s.season_id" :value="s.name">
            {{ s.name }} ({{ s.animes.length }} 部候选番剧)
          </option>
        </select>
      </div>

      <!-- Anime Name Selection -->
      <div class="form-group">
        <div class="label-with-action">
          <label class="form-label">评测番剧名称 <span class="required-star">*</span></label>
          <button
            type="button"
            class="inline-action-btn"
            @click="isAddAnimeModalOpen = true"
          >
            <Plus :size="13" />
            <span>新增番剧词条</span>
          </button>
        </div>

        <select v-model="studioStore.animeName" class="form-select">
          <option value="" disabled>请从当前季度候选清单中选择番剧</option>
          <option v-for="anime in animeCandidates" :key="anime" :value="anime">
            {{ anime }}
          </option>
        </select>
      </div>
    </div>

    <!-- Score & Commit Message Row -->
    <div class="form-row-grid score-row">
      <!-- Score -->
      <div class="form-group">
        <label class="form-label">综合推荐评分 (0.0 ~ 10.0)</label>
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
      </div>

      <!-- Commit Message -->
      <div class="form-group">
        <label class="form-label">版本提交说明 (Commit Message)</label>
        <input
          v-model="studioStore.commitMessage"
          type="text"
          class="form-input"
          placeholder="例如：初稿成稿 / 修正第8话作画分析"
        />
      </div>
    </div>

    <!-- Highlight Summary -->
    <div class="form-group">
      <label class="form-label">
        <Quote :size="14" class="inline-label-icon" /> 一句话亮点简评 (Summary) <span class="required-star">*</span>
      </label>
      <input
        v-model="studioStore.summary"
        type="text"
        class="form-input summary-input"
        placeholder="用一句话总结本片最触动人心或值得安利的亮点（展示在画廊卡片首屏）"
        maxlength="120"
      />
    </div>

    <!-- Markdown Article Editor Area -->
    <div class="form-group editor-group">
      <div class="editor-header">
        <label class="form-label">
          <BookOpen :size="14" class="inline-label-icon" /> 评测长文正文 (Markdown 格式) <span class="required-star">*</span>
        </label>

        <!-- Mode Toggle Switcher -->
        <div class="editor-mode-toggle">
          <button
            type="button"
            class="mode-btn"
            :class="{ active: editorMode === 'edit' }"
            @click="editorMode = 'edit'"
          >
            <Edit :size="13" />
            <span>仅编辑</span>
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: editorMode === 'split' }"
            @click="editorMode = 'split'"
          >
            <Columns :size="13" />
            <span>分栏对照</span>
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: editorMode === 'preview' }"
            @click="editorMode = 'preview'"
          >
            <Eye :size="13" />
            <span>实时预览</span>
          </button>
        </div>
      </div>

      <!-- Editor Container -->
      <div class="editor-box" :class="editorMode">
        <textarea
          v-if="editorMode === 'edit' || editorMode === 'split'"
          v-model="studioStore.content"
          class="markdown-textarea"
          placeholder="支持完整 Markdown 语法：&#10;# 一级标题&#10;## 二级分段分析&#10;- 要点列表&#10;> 引用台词与高光金句&#10;**加粗重点** 与 剧照穿插说明..."
          rows="14"
        ></textarea>

        <div
          v-if="editorMode === 'preview' || editorMode === 'split'"
          class="markdown-preview-pane markdown-body"
          v-html="renderedMarkdown"
        ></div>
      </div>
    </div>

    <!-- Modal: Add New Anime Name -->
    <div v-if="isAddAnimeModalOpen" class="submodal-overlay" @click.self="isAddAnimeModalOpen = false">
      <div class="submodal-dialog glass-panel-strong animate-scale-in">
        <h4 class="submodal-title">向 {{ studioStore.seasonTag }} 新增番剧词条</h4>
        <p class="submodal-desc">作者与管理员均可为所属季度追加番单候选条目。</p>
        <div class="form-group" style="margin-top: 1rem;">
          <input
            v-model="newAnimeName"
            type="text"
            class="form-input"
            placeholder="例如：败犬女主太多了！第二季"
            @keyup.enter="handleAddAnime"
          />
        </div>
        <div class="submodal-actions">
          <button type="button" class="btn btn-secondary" @click="isAddAnimeModalOpen = false">取消</button>
          <button type="button" class="btn btn-primary" :disabled="isAddingAnime" @click="handleAddAnime">
            <Check :size="16" />
            <span>{{ isAddingAnime ? '添加中...' : '确认新增' }}</span>
          </button>
        </div>
      </div>
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
  grid-template-columns: 1fr 1.5fr;
  gap: 1.25rem;
}

.required-star {
  color: #f43f5e;
}

.label-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inline-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-primary);
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);
}

.inline-action-btn:hover {
  background: rgba(99, 102, 241, 0.15);
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

.inline-label-icon {
  vertical-align: middle;
  color: var(--accent-primary);
}

.summary-input {
  font-size: 1rem;
  border-color: rgba(99, 102, 241, 0.3);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.editor-mode-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-glass);
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.mode-btn.active {
  background: var(--accent-primary);
  color: white;
}

.editor-box {
  display: grid;
  gap: 1rem;
  min-height: 380px;
}

.editor-box.edit {
  grid-template-columns: 1fr;
}

.editor-box.preview {
  grid-template-columns: 1fr;
}

.editor-box.split {
  grid-template-columns: 1fr 1fr;
}

.markdown-textarea {
  width: 100%;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
}

.markdown-preview-pane {
  padding: 1rem;
  background: rgba(10, 15, 30, 0.75);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  overflow-y: auto;
  max-height: 480px;
}

/* Submodal */
.submodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.submodal-dialog {
  width: 100%;
  max-width: 400px;
  padding: 1.75rem;
  border-radius: var(--radius-md);
}

.submodal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.submodal-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.submodal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .form-row-grid {
    grid-template-columns: 1fr;
  }
  .editor-box.split {
    grid-template-columns: 1fr;
  }
}
</style>
