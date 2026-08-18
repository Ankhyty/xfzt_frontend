<script setup lang="ts">
import { ref, watch } from 'vue'
import { updateSeasonAnimesApi } from '../../api/seasons'
import { useToastStore } from '../../stores/toast'
import type { SeasonItem } from '../../types'
import { X, Film, Check } from 'lucide-vue-next'

const props = defineProps<{
  season: SeasonItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

const toastStore = useToastStore()
const animesRawText = ref('')
const isSubmitting = ref(false)

watch(
  () => props.season,
  (s) => {
    if (s && s.animes) {
      animesRawText.value = s.animes.join('\n')
    } else {
      animesRawText.value = ''
    }
  },
  { immediate: true }
)

async function handleSave() {
  const animesList = animesRawText.value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  if (animesList.length === 0) {
    toastStore.warning('番剧清单不能为空')
    return
  }

  isSubmitting.value = true
  try {
    await updateSeasonAnimesApi(props.season.season_id, animesList)
    toastStore.success(`已更新 ${props.season.name} 的番剧候选清单 (共 ${animesList.length} 部)`)
    emit('updated')
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
          <Film :size="22" />
        </div>
        <div>
          <h3 class="dialog-title">维护番剧清单 · {{ season.name }}</h3>
          <p class="dialog-desc">整体替换该季度的番单，每行一部番剧名称（作为建卡候选数据源）</p>
        </div>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <textarea
            v-model="animesRawText"
            class="form-textarea"
            rows="10"
            placeholder="葬送的芙莉莲 第二季&#10;死神 千年血战篇&#10;胆大党 第二季..."
          ></textarea>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
          <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="handleSave">
            <Check :size="16" />
            <span>{{ isSubmitting ? '正在更新...' : '保存番单' }}</span>
          </button>
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
  max-width: 500px;
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
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.4);
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
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>
