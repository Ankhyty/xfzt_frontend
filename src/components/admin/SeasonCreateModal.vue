<script setup lang="ts">
import { ref } from 'vue'
import { createSeasonApi } from '../../api/seasons'
import { useToastStore } from '../../stores/toast'
import { useGalleryStore } from '../../stores/gallery'
import { X, Calendar, Plus, Check } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const toastStore = useToastStore()
const galleryStore = useGalleryStore()

const seasonName = ref('') // e.g. "2026-10"
const deadlineStr = ref('')
const animesRawText = ref('')
const isSubmitting = ref(false)

function validateSeasonName(name: string): boolean {
  const pattern = /^\d{4}-(01|04|07|10)$/
  return pattern.test(name.trim())
}

async function handleCreate() {
  const name = seasonName.value.trim()
  if (!validateSeasonName(name)) {
    toastStore.error('季度格式错误：应为 YYYY-MM，且月份只能是 01/04/07/10（如 2026-07）')
    return
  }

  let deadlineTimestamp: number | null = null
  if (deadlineStr.value) {
    deadlineTimestamp = Math.floor(new Date(deadlineStr.value).getTime() / 1000)
  }

  const animesList = animesRawText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  isSubmitting.value = true
  try {
    await createSeasonApi(name, deadlineTimestamp, animesList)
    toastStore.success(`新季度 ${name} 创建成功`)
    await galleryStore.fetchSeasons()
    emit('created')
    emit('close')
  } catch (err: any) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-dialog glass-panel-strong animate-scale-in">
      <button class="close-btn" @click="emit('close')">
        <X :size="20" />
      </button>

      <div class="dialog-header">
        <div class="header-icon-box">
          <Calendar :size="22" />
        </div>
        <div>
          <h3 class="dialog-title">新建新番季度 (Admin)</h3>
          <p class="dialog-desc">根据系统规范，月份限定为 01（冬）、04（春）、07（夏）、10（秋）</p>
        </div>
      </div>

      <form class="dialog-form" @submit.prevent="handleCreate">
        <div class="form-group">
          <label class="form-label">季度标识 (格式 YYYY-MM) <span class="required">*</span></label>
          <input
            v-model="seasonName"
            type="text"
            class="form-input"
            placeholder="例如：2026-10"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">截稿截止时间 (可选，留空为不限时)</label>
          <input
            v-model="deadlineStr"
            type="datetime-local"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">初始番剧候选名单 (每行一部番剧)</label>
          <textarea
            v-model="animesRawText"
            class="form-textarea"
            rows="5"
            placeholder="电锯人 蕾塞篇&#10;咒术回战 死灭洄游篇&#10;间谍过家家 第三季"
          ></textarea>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <Check :size="16" />
            <span>{{ isSubmitting ? '创建中...' : '立即创建' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-dialog {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  position: relative;
  border-radius: var(--radius-md);
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: var(--text-muted);
  padding: 0.3rem;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.header-icon-box {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--radius-sm);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.dialog-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-top: 0.2rem;
}

.required {
  color: #f43f5e;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
