<script setup lang="ts">
import { useToastStore } from '../../stores/toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast-anim">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast-card glass-panel-strong"
        :class="toast.type"
      >
        <div class="toast-icon">
          <CheckCircle2 v-if="toast.type === 'success'" :size="20" class="icon-success" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="20" class="icon-error" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="20" class="icon-warning" />
          <Info v-else :size="20" class="icon-info" />
        </div>

        <div class="toast-body">
          <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button class="toast-close" @click="toastStore.remove(toast.id)">
          <X :size="16" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 5.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: 380px;
  width: 100%;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
}

.toast-card.success {
  border-left: 4px solid var(--accent-emerald);
}
.toast-card.error {
  border-left: 4px solid #ef4444;
}
.toast-card.warning {
  border-left: 4px solid var(--accent-amber);
}
.toast-card.info {
  border-left: 4px solid var(--accent-primary);
}

.icon-success { color: var(--accent-emerald); }
.icon-error { color: #f87171; }
.icon-warning { color: var(--accent-amber); }
.icon-info { color: var(--accent-cyan); }

.toast-body {
  flex: 1;
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.toast-message {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  color: var(--text-muted);
  padding: 0.2rem;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.toast-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

/* Animations */
.toast-anim-enter-active,
.toast-anim-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
