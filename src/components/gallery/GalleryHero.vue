<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'
import { useAuthStore } from '../../stores/auth'
import { Clock, PenTool, Calendar, Sparkles } from 'lucide-vue-next'
import type { SeasonItem } from '../../types'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const router = useRouter()
const galleryStore = useGalleryStore()
const authStore = useAuthStore()

// Filter all active / unexpired seasons (deadline is null or deadline is in the future)
const activeUnexpiredSeasons = computed<SeasonItem[]>(() => {
  const now = Math.floor(Date.now() / 1000)
  return galleryStore.seasons.filter((s) => {
    if (s.deadline === null || s.deadline === undefined) return true
    return s.deadline > now
  })
})

function formatSeasonDeadline(season: SeasonItem): string {
  if (!season.deadline) {
    return '截稿时间：长期开放'
  }
  const now = Math.floor(Date.now() / 1000)
  const diff = season.deadline - now
  if (diff <= 0) {
    return '已截止'
  }
  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  return `距截稿剩 ${days} 天 ${hours} 小时`
}

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
      <!-- Line 1: Main Title -->
      <h1 class="hero-headline animate-fade-in">
        <span class="gradient-text">新番杂谈联合企划</span>
      </h1>

      <!-- Line 2: Slogan -->
      <p class="hero-slogan animate-fade-in">
        <span class="team-tag">新力场漫研一课</span>
        <span class="slogan-motto">让热情燃烧世界</span>
      </p>

      <!-- Line 3: Active / Unexpired Seasons Capsules List -->
      <div class="seasons-capsule-list animate-fade-in">
        <div
          v-for="season in activeUnexpiredSeasons"
          :key="season.season_id"
          class="season-capsule clickable-capsule"
          :class="{ 'is-selected': galleryStore.selectedSeason === season.name && !galleryStore.isGlobalSearch }"
          title="点击切换查看该季度画廊"
          @click="galleryStore.setSeasonByTag(season.name)"
        >
          <span class="pulse-dot"></span>
          <Calendar :size="13" class="capsule-icon" />
          <span class="capsule-tag">{{ season.name }} 季度</span>
          <span class="capsule-divider">|</span>
          <Clock :size="13" class="capsule-icon" />
          <span class="capsule-deadline">{{ formatSeasonDeadline(season) }}</span>
        </div>
      </div>

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
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 4rem 0 2rem 0;
  text-align: center;
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 760px;
  height: 380px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.12) 50%, transparent 80%);
  filter: blur(70px);
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

.hero-headline {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
  max-width: 800px;
  margin-bottom: 0.75rem;
}

.gradient-text {
  display: inline-block;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-slogan {
  font-size: 1.2rem;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.team-tag {
  color: #a5b4fc;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
  padding: 0.25rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.95rem;
}

.slogan-motto {
  color: #e2e8f0;
  letter-spacing: 0.1em;
}

.seasons-capsule-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-bottom: 2.25rem;
  max-width: 900px;
}

.season-capsule {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1.15rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  font-size: 0.825rem;
  backdrop-filter: blur(12px);
  transition: all var(--transition-fast);
  cursor: pointer;
  user-select: none;
}

.season-capsule:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
}

.season-capsule.is-selected {
  background: rgba(99, 102, 241, 0.25);
  border-color: var(--accent-primary);
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.35);
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

.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hero-btn {
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .hero-headline {
    font-size: 2.15rem;
  }
  .hero-slogan {
    font-size: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  .seasons-capsule-list {
    flex-direction: column;
    align-items: stretch;
  }
  .season-capsule {
    justify-content: center;
  }
}
</style>
