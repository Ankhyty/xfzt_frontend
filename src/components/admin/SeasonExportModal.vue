<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSeasonExportApi } from '../../api/seasons'
import { exportSeasonToZip } from '../../services/exporter'
import { useToastStore } from '../../stores/toast'
import type { SeasonItem, SeasonExportData } from '../../types'
import { X, Archive, Download, CheckCircle2, FileText, Database } from 'lucide-vue-next'

const props = defineProps<{
  season: SeasonItem
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const toastStore = useToastStore()
const isLoading = ref(true)
const exportData = ref<SeasonExportData | null>(null)

// Packaging status
const isPackaging = ref(false)
const progressCurrent = ref(0)
const progressTotal = ref(0)
const progressMessage = ref('')

onMounted(async () => {
  try {
    const data = await getSeasonExportApi(props.season.season_id)
    exportData.value = data
  } catch (err: any) {
    toastStore.error('获取季度导出清单失败')
    emit('close')
  } finally {
    isLoading.value = false
  }
})

async function handleDownloadZip() {
  if (!exportData.value) return
  isPackaging.value = true

  try {
    await exportSeasonToZip(exportData.value, (curr, tot, msg) => {
      progressCurrent.value = curr
      progressTotal.value = tot
      progressMessage.value = msg
    })
    toastStore.success(`季度 ${props.season.name} ZIP 压缩包已成功打包下载`)
    emit('close')
  } catch (err: any) {
    toastStore.error(err.message || '导出组包失败')
  } finally {
    isPackaging.value = false
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
          <Archive :size="22" />
        </div>
        <div>
          <h3 class="dialog-title">季度数据导出 · {{ season.name }}</h3>
          <p class="dialog-desc">拉取该季度全量卡片最新版本文件清单，并在客户端一键组装为 ZIP 压缩包</p>
        </div>
      </div>

      <div v-if="isLoading" class="loading-box">
        <div class="spinner"></div>
        <p>正在生成该季度卡片文件清单...</p>
      </div>

      <div v-else-if="exportData" class="dialog-body">
        <!-- Summary Cards -->
        <div class="export-summary-grid">
          <div class="summary-card glass-panel">
            <span class="summary-val">{{ exportData.total_cards }}</span>
            <span class="summary-label">收录卡片总数</span>
          </div>
          <div class="summary-card glass-panel">
            <span class="summary-val text-cyan">
              {{ exportData.cards.reduce((acc, c) => acc + c.files.length, 0) }}
            </span>
            <span class="summary-label">待打包文件资产 (JSON + 图片)</span>
          </div>
        </div>

        <!-- Manifest Preview -->
        <div class="manifest-list glass-panel">
          <h5 class="manifest-title">卡片文件结构概览：</h5>
          <div v-for="card in exportData.cards" :key="card.card_id" class="card-export-item">
            <div class="item-head">
              <span class="card-id-tag">{{ card.card_id }}</span>
              <span class="author-tag">作者：{{ card.owner.nickname }}</span>
              <span class="version-tag">{{ card.current_version }}</span>
            </div>
            <div class="item-files">
              <div v-for="f in card.files" :key="f.relative_path" class="file-line">
                <FileText v-if="f.relative_path.endsWith('.json')" :size="12" class="text-indigo" />
                <Database v-else :size="12" class="text-cyan" />
                <span class="file-rel-path">{{ f.relative_path }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Box when packaging -->
        <div v-if="isPackaging" class="progress-box glass-panel">
          <div class="progress-info-row">
            <span class="prog-msg">{{ progressMessage }}</span>
            <span class="prog-stat">{{ progressCurrent }} / {{ progressTotal }}</span>
          </div>
          <div class="prog-bar-track">
            <div
              class="prog-bar-fill"
              :style="{ width: `${progressTotal > 0 ? (progressCurrent / progressTotal) * 100 : 0}%` }"
            ></div>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">取消</button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="isPackaging || exportData.total_cards === 0"
            @click="handleDownloadZip"
          >
            <Download :size="16" />
            <span>{{ isPackaging ? '正在组包下载...' : '一键打包并下载 ZIP' }}</span>
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
  max-width: 580px;
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
  margin-bottom: 1.25rem;
}

.header-icon-box {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--radius-sm);
  background: rgba(6, 182, 212, 0.2);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.4);
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

.loading-box {
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--accent-primary);
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.export-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  padding: 0.85rem;
  border-radius: var(--radius-sm);
  text-align: center;
}

.summary-val {
  font-size: 1.5rem;
  font-weight: 800;
  font-family: var(--font-display);
  color: #fff;
}

.summary-val.text-cyan { color: #22d3ee; }

.summary-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
  margin-top: 0.2rem;
}

.manifest-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 0.85rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.manifest-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.card-export-item {
  background: rgba(0, 0, 0, 0.25);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.card-id-tag {
  font-weight: 700;
  color: var(--text-primary);
  font-family: monospace;
}

.author-tag {
  color: var(--text-muted);
}

.version-tag {
  color: var(--accent-primary);
  font-weight: 700;
  margin-left: auto;
}

.item-files {
  padding-left: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.file-line {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: monospace;
  color: #94a3b8;
  font-size: 0.7rem;
}

.progress-box {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.25rem;
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-bottom: 0.4rem;
}

.prog-msg {
  color: var(--accent-cyan);
  font-weight: 600;
}

.prog-stat {
  color: var(--text-muted);
  font-family: monospace;
}

.prog-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.prog-bar-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.15s ease;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.text-indigo { color: var(--accent-primary); }
.text-cyan { color: var(--accent-cyan); }
</style>
