<script setup lang="ts">
import { ref, computed } from 'vue'
import { createSeasonApi } from '../../api/seasons'
import { useToastStore } from '../../stores/toast'
import { useGalleryStore } from '../../stores/gallery'
import { X, Calendar, Check, Sparkles, Layers, Edit2 } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const toastStore = useToastStore()
const galleryStore = useGalleryStore()

const currentYear = new Date().getFullYear().toString()
const selectedYear = ref(currentYear)
const quarterType = ref<'01' | '04' | '07' | '10' | 'CUSTOM'>('07')
const customTagName = ref('')
const deadlineStr = ref('')
const animesRawText = ref('')
const isSubmitting = ref(false)

const quarterOptions = [
  { value: '01', label: '1月 冬季番' },
  { value: '04', label: '4月 春季番' },
  { value: '07', label: '7月 夏季番' },
  { value: '10', label: '10月 秋季番' },
  { value: 'CUSTOM', label: '自定义特辑/特别篇' }
]

const finalSeasonName = computed(() => {
  const y = selectedYear.value.trim() || currentYear
  if (quarterType.value === 'CUSTOM') {
    const custom = customTagName.value.trim()
    return custom ? `${y}-${custom}` : `${y}-自定义名称`
  }
  return `${y}-${quarterType.value}`
})

async function handleCreate() {
  const year = selectedYear.value.trim()
  if (!/^\d{4}$/.test(year)) {
    toastStore.error('年份格式错误，必须为 4 位数字（例如 2026）')
    return
  }

  if (quarterType.value === 'CUSTOM') {
    const custom = customTagName.value.trim()
    if (!custom) {
      toastStore.error('请输入自定义季度标识（例如：国漫特辑、剧场版大赏）')
      return
    }
    if (/[\/\\]/.test(custom)) {
      toastStore.error('自定义标识不能包含斜杠等特殊符号')
      return
    }
  }

  const name = finalSeasonName.value

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
    toastStore.success(`新季度「${name}」创建成功`)
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
          <p class="dialog-desc">支持标准 1/4/7/10 月份季度，或自定义专属特辑（如：国漫特辑、剧场版）</p>
        </div>
      </div>

      <form class="dialog-form" @submit.prevent="handleCreate">
        <!-- Year & Quarter Dual Selectors -->
        <div class="form-row-grid">
          <div class="form-group">
            <label class="form-label">年份 <span class="required">*</span></label>
            <input
              v-model="selectedYear"
              type="number"
              min="2000"
              max="2099"
              class="form-input"
              placeholder="例如：2026"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">季度类型 <span class="required">*</span></label>
            <select v-model="quarterType" class="form-select">
              <option v-for="opt in quarterOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Custom Tag Input if CUSTOM is chosen -->
        <div v-if="quarterType === 'CUSTOM'" class="form-group animate-fade-in">
          <label class="form-label">
            <Edit2 :size="13" class="text-indigo" /> 自定义季度标识名称 <span class="required">*</span>
          </label>
          <input
            v-model="customTagName"
            type="text"
            class="form-input custom-tag-input"
            placeholder="例如：国漫特辑、特别企划、剧场版精选"
            required
            maxlength="20"
          />
        </div>

        <!-- Generated Season Name Live Preview Tag -->
        <div class="season-preview-box">
          <span class="preview-label">最终生成季度标识：</span>
          <span class="preview-tag">{{ finalSeasonName }}</span>
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
            rows="4"
            placeholder="凡人修仙传&#10;雾山五行&#10;仙逆"
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
  max-width: 520px;
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

.form-row-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 1rem;
}

.custom-tag-input {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.08);
}

.season-preview-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px dashed rgba(99, 102, 241, 0.35);
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}

.preview-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.preview-tag {
  font-size: 0.95rem;
  font-weight: 800;
  color: #a5b4fc;
  font-family: var(--font-display);
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

.text-indigo { color: var(--accent-primary); }
</style>
