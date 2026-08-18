<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateSeasonDeadlineApi } from '../../api/seasons'
import { useToastStore } from '../../stores/toast'
import type { SeasonItem } from '../../types'
import { X, Clock, Check, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  season: SeasonItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const toastStore = useToastStore()
const deadlineStr = ref('')
const isSubmitting = ref(false)

watch(
  () => props.season,
  (s) => {
    if (s && s.deadline) {
      const date = new Date(s.deadline * 1000)
      const tzOffset = date.getTimezoneOffset() * 60000
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
      deadlineStr.value = localISOTime
    } else {
      deadlineStr.value = ''
    }
  },
  { immediate: true }
)

async function handleSave() {
  isSubmitting.value = true
  try {
    let timestamp: number | null = null
    if (deadlineStr.value) {
      timestamp = Math.floor(new Date(deadlineStr.value).getTime() / 1000)
    }
    await updateSeasonDeadlineApi(props.season.season_id, timestamp)
    toastStore.success(`已更新 ${props.season.name} 的截稿截止时间`)
    emit('updated')
    emit('close')
  } catch (err: any) {
    console.error(err)
  } finally {
    isSubmitting.value = false
  }
}

async function handleClearDeadline() {
  deadlineStr.value = ''
  await handleSave()
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
          <Clock :size="22" />
        </div>
        <div>
          <h3 class="dialog-title">设置截稿时间 · {{ season.name }}</h3>
          <p class="dialog-desc">到达截止时间后，非管理员作者将无法继续提交新版本（管理员豁免）</p>
        </div>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label class="form-label">指定截止日期与时间</label>
          <input
            v-model="deadlineStr"
            type="datetime-local"
            class="form-input"
          />
        </div>

        <div class="dialog-actions">
          <button
            v-if="season.deadline"
            type="button"
            class="btn btn-danger btn-sm"
            @click="handleClearDeadline"
          >
            <Trash2 :size="14" />
            <span>清除限制 (永久有效)</span>
          </button>
          
          <div class="actions-right">
            <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
            <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="handleSave">
              <Check :size="16" />
              <span>{{ isSubmitting ? '保存中...' : '确认更新' }}</span>
            </button>
          </div>
        </div>
      </div>
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
  max-width: 460px;
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
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
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

.dialog-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}
</style>
