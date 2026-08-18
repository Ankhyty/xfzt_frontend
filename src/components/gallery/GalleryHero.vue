<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'
import { useAuthStore } from '../../stores/auth'
import { Sparkles, Clock, PenTool, Flame, Calendar } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()

const currentSeason = computed(() => galleryStore.activeSeasonObj)

const deadlineText = computed(() => {
  if (!currentSeason.value || !currentSeason.value.deadline) {
    return '截稿时间：长期开放'
  }
  const now = Math.floor(Date.now() / 1000)
  const diff = currentSeason.value.deadline - now
  if (diff <= 0) {
    return '已截止截稿'
  }
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  return `距截稿还剩 ${days} 天 ${hours} 小时`
})

const isDeadlinePassed = computed(() => {
  if (!currentSeason.value?.deadline) return false
  return Math.floor(Date.now() / 1000) > currentSeason.value.deadline
})

function handleStudioAction() {
  if (!authStore.isLoggedIn) {
    emit('open-auth')
  } else {
    router.push('/studio')
  }
}
</script>

<template>
  <div class="hero-section">
    <div class="hero-bg-glow"></div>
    <div class="container hero-container">
      <!-- Top Announcement / Season Capsule -->
      <div class="season-capsule animate-fade-in">
        <span class="pulse-dot"></span>
        <Calendar :size="14" class="capsule-icon" />
        <span class="capsule-tag">{{ currentSeason ? `${currentSeason.name} 季度新番` : '全季度新番画廊' }}</span>
        <span class="capsule-divider">|</span>
        <Clock :size="14" class="capsule-icon" />
        <span class="capsule-deadline" :class="{ 'deadline-closed': isDeadlinePassed }">
          {{ deadlineText }}
        </span>
      </div>

      <!-- Main Headline -->
      <h1 class="hero-headline animate-fade-in">
        聚焦每一季的精彩与感动
        <span class="gradient-text">新番杂谈协作画廊</span>
      </h1>

      <p class="hero-description animate-fade-in">
        沉浸式画廊卡片流，收录每季核心新番深度长评、精选剧照与多版本迭代档案。基于 OBS 对象存储与不可变版本规范。
      </p>

      <!-- Action Buttons -->
      <div class="hero-actions animate-fade-in">
        <button class="btn btn-primary hero-btn" @click="handleStudioAction">
          <PenTool :size="18" />
          <span>{{ authStore.isLoggedIn ? '进入写稿创作台' : '登录并开始撰稿' }}</span>
        </button>
        <router-link to="/admin" v-if="authStore.isAdmin" class="btn btn-secondary hero-btn">
          <span>进入季度管理</span>
        </router-link>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="hero-metrics glass-panel animate-fade-in">
        <div class="metric-item">
          <span class="metric-val">{{ galleryStore.cards.length }}</span>
          <span class="metric-label">收录卡片</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-item">
          <span class="metric-val">{{ galleryStore.seasons.length }}</span>
          <span class="metric-label">已建季度</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-item">
          <span class="metric-val text-amber">
            <Flame :size="18" class="inline-icon" /> 9.5
          </span>
          <span class="metric-label">当季最高评分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 4rem 0 3rem 0;
  text-align: center;
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 350px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 80%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.hero-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.season-capsule {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(12px);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--accent-emerald);
  box-shadow: 0 0 10px var(--accent-emerald);
  animation: pulseSlow 2s infinite;
}

.capsule-tag {
  font-weight: 700;
  color: #c7d2fe;
}

.capsule-divider {
  color: var(--border-glass);
}

.capsule-deadline {
  color: var(--text-secondary);
}

.capsule-deadline.deadline-closed {
  color: #f87171;
  font-weight: 600;
}

.hero-headline {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.03em;
  max-width: 800px;
  margin-bottom: 1.25rem;
}

.gradient-text {
  display: block;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 620px;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-btn {
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  border-radius: var(--radius-sm);
}

.hero-metrics {
  display: flex;
  align-items: center;
  padding: 0.85rem 2rem;
  border-radius: var(--radius-lg);
  gap: 2rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-display);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.metric-val.text-amber {
  color: #fbbf24;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 2rem;
  background: var(--border-subtle);
}

.inline-icon {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .hero-headline {
    font-size: 2rem;
  }
  .hero-metrics {
    gap: 1rem;
    padding: 0.75rem 1rem;
  }
}
</style>
