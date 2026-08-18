<script setup lang="ts">
import { useStudioStore } from '../../stores/studio'
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ImageIcon,
  Sparkles
} from 'lucide-vue-next'

const studioStore = useStudioStore()
</script>

<template>
  <div v-if="studioStore.isUploading" class="upload-modal-overlay">
    <div class="upload-dialog glass-panel-strong animate-scale-in">
      <!-- Top Step Indicator -->
      <div class="pipeline-header">
        <div class="pipeline-icon-box">
          <UploadCloud v-if="studioStore.uploadStep !== 'done' && studioStore.uploadStep !== 'error'" class="pulsing-icon" :size="28" />
          <CheckCircle2 v-else-if="studioStore.uploadStep === 'done'" class="icon-success" :size="28" />
          <AlertCircle v-else class="icon-error" :size="28" />
        </div>

        <h3 class="pipeline-title">正在发布新番评测</h3>
        <p class="pipeline-status-text">{{ studioStore.uploadStepDescription }}</p>
      </div>

      <!-- Step Stepper Row -->
      <div class="stepper-row">
        <div class="step-node" :class="{ active: studioStore.uploadStep === 'presigning', done: ['uploading', 'committing', 'done'].includes(studioStore.uploadStep) }">
          <div class="node-circle">1</div>
          <span>准备数据</span>
        </div>
        <div class="step-line" :class="{ done: ['uploading', 'committing', 'done'].includes(studioStore.uploadStep) }"></div>
        <div class="step-node" :class="{ active: studioStore.uploadStep === 'uploading', done: ['committing', 'done'].includes(studioStore.uploadStep) }">
          <div class="node-circle">2</div>
          <span>上传图片</span>
        </div>
        <div class="step-line" :class="{ done: ['committing', 'done'].includes(studioStore.uploadStep) }"></div>
        <div class="step-node" :class="{ active: studioStore.uploadStep === 'committing', done: studioStore.uploadStep === 'done' }">
          <div class="node-circle">3</div>
          <span>完成发布</span>
        </div>
      </div>

      <!-- Total Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{ width: `${studioStore.overallPercentage}%` }"
          ></div>
        </div>
        <span class="progress-bar-label">{{ studioStore.overallPercentage }}%</span>
      </div>

      <!-- Individual File Progress List -->
      <div class="file-progress-list glass-panel">
        <div
          v-for="file in studioStore.fileProgressList"
          :key="file.relativePath"
          class="file-item-row"
        >
          <div class="file-item-left">
            <ImageIcon v-if="file.relativePath.startsWith('images')" :size="14" class="text-indigo" />
            <FileCheck v-else :size="14" class="text-secondary" />
            <span class="file-path">
              {{ file.relativePath === 'text/article.json' ? '评测文字内容' : (file.relativePath.includes('_thumb') ? '封面缩略图' : '原图素材') }}
            </span>
          </div>

          <div class="file-item-right">
            <div class="mini-bar-track">
              <div
                class="mini-bar-fill"
                :style="{ width: `${file.percentage}%` }"
              ></div>
            </div>
            <span class="file-status-tag" :class="file.status">
              {{ file.status === 'completed' ? '已完成' : `${file.percentage}%` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Button when done or error -->
      <div v-if="studioStore.uploadStep === 'done' || studioStore.uploadStep === 'error'" class="modal-bottom-actions">
        <button
          v-if="studioStore.uploadStep === 'done'"
          class="btn btn-primary btn-full"
          @click="studioStore.isUploading = false"
        >
          <Sparkles :size="16" />
          <span>完成并返回</span>
        </button>
        <button
          v-else
          class="btn btn-danger btn-full"
          @click="studioStore.isUploading = false"
        >
          <span>关闭</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.upload-dialog {
  width: 100%;
  max-width: 480px;
  padding: 2.25rem;
  background: rgba(15, 23, 42, 0.96);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pipeline-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pipeline-icon-box {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.pulsing-icon {
  animation: pulseSlow 1.5s infinite;
}

.icon-success {
  color: var(--accent-emerald);
}

.icon-error {
  color: #f87171;
}

.pipeline-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.pipeline-status-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.stepper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.step-node.active {
  color: var(--accent-primary);
}

.step-node.done {
  color: var(--accent-emerald);
}

.node-circle {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.step-node.active .node-circle {
  background: var(--accent-primary);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.step-node.done .node-circle {
  background: var(--accent-emerald);
  color: white;
  border-color: transparent;
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border-subtle);
  margin: 0 0.5rem -1rem 0.5rem;
}

.step-line.done {
  background: var(--accent-emerald);
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.2s ease;
}

.progress-bar-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-display);
  width: 2.5rem;
  text-align: right;
}

.file-progress-list {
  max-height: 160px;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: var(--radius-sm);
}

.file-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.file-item-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 60%;
}

.file-path {
  color: var(--text-secondary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-item-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mini-bar-track {
  width: 60px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.mini-bar-fill {
  height: 100%;
  background: var(--accent-emerald);
  transition: width 0.15s ease;
}

.file-status-tag {
  font-size: 0.7rem;
  font-weight: 600;
  width: 40px;
  text-align: right;
  color: var(--text-muted);
}

.file-status-tag.completed {
  color: var(--accent-emerald);
}

.btn-full {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
}

.text-indigo { color: var(--accent-primary); }
</style>
