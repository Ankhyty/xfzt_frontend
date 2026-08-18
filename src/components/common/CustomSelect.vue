<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

export interface SelectOption {
  value: string | number
  label: string
  icon?: any
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options?: SelectOption[]
    placeholder?: string
    icon?: any
    minWidth?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    placeholder: '请选择',
    minWidth: '130px'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'change', val: string | number): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const currentSelectedOption = computed(() => {
  if (!props.options || !Array.isArray(props.options) || props.options.length === 0) return null
  return props.options.find((opt) => String(opt.value) === String(props.modelValue)) || null
})

function handleSelect(val: string | number) {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="containerRef"
    class="custom-select-container"
    :class="{ 'is-open-active': isOpen }"
    :style="{ minWidth: props.minWidth }"
  >
    <!-- Trigger Button -->
    <button
      type="button"
      class="select-trigger glass-panel"
      :class="{ 'is-open': isOpen }"
      @click="isOpen = !isOpen"
    >
      <component
        :is="props.icon"
        v-if="props.icon"
        :size="15"
        class="trigger-icon"
      />
      <span class="trigger-label">
        {{ currentSelectedOption ? currentSelectedOption.label : props.placeholder }}
      </span>
      <ChevronDown
        :size="14"
        class="trigger-chevron"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Floating Dropdown Menu -->
    <div v-if="isOpen" class="dropdown-menu-floating glass-panel-strong animate-scale-in">
      <ul class="options-list">
        <li
          v-for="opt in (props.options || [])"
          :key="opt.value"
          class="option-item"
          :class="{ selected: String(opt.value) === String(props.modelValue) }"
          @click="handleSelect(opt.value)"
        >
          <div class="option-label-box">
            <component :is="opt.icon" v-if="opt.icon" :size="14" class="opt-icon" />
            <span>{{ opt.label }}</span>
          </div>
          <Check v-if="String(opt.value) === String(props.modelValue)" :size="14" class="check-icon" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.custom-select-container {
  position: relative;
  display: inline-block;
  user-select: none;
  z-index: 10;
}

.custom-select-container.is-open-active {
  z-index: 9999;
}

.select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.select-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(99, 102, 241, 0.4);
}

.select-trigger.is-open {
  border-color: var(--accent-primary);
  background: rgba(15, 23, 42, 0.9);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25);
}

.trigger-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.trigger-label {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-chevron {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.trigger-chevron.rotate-180 {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

.dropdown-menu-floating {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  right: 0;
  z-index: 99999;
  min-width: 100%;
  padding: 0.4rem;
  border-radius: var(--radius-sm);
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(24px);
  max-height: 260px;
  overflow-y: auto;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-item:hover {
  background: rgba(99, 102, 241, 0.22);
  color: #fff;
}

.option-item.selected {
  background: rgba(99, 102, 241, 0.35);
  color: #a5b4fc;
  font-weight: 700;
}

.option-label-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.opt-icon {
  color: var(--accent-primary);
}

.check-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}
</style>
