<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { CardItem } from '../../types'
import { Star, Edit3, Eye, Calendar, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  card: CardItem
}>()

const emit = defineEmits<{
  (e: 'click-card', cardId: string): void
}>()

const router = useRouter()

const coverImageUrl = computed(() => {
  if (props.card.content_assets?.images_thumb?.length > 0) {
    return props.card.content_assets.images_thumb[0].url
  }
  if (props.card.content_assets?.images?.length > 0) {
    return props.card.content_assets.images[0].url
  }
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
})

const cardScore = computed(() => {
  return props.card.articleContent?.score ?? 9.0
})

const summaryText = computed(() => {
  return (
    props.card.articleContent?.summary ||
    '点击查看本季新番深度长评、画质分析与多版本成稿档案...'
  )
})

function handleEdit(e: Event) {
  e.stopPropagation()
  router.push({
    path: '/studio',
    query: {
      editCardId: props.card.card_id
    }
  })
}
</script>

<template>
  <div class="gallery-card glass-panel" @click="emit('click-card', card.card_id)">
    <!-- Top Image Container -->
    <div class="card-media-wrapper">
      <img
        :src="coverImageUrl"
        :alt="card.anime_name"
        class="card-cover-image"
        loading="lazy"
      />
      <div class="media-overlay-gradient"></div>

      <!-- Top Left: Season & Version Tags -->
      <div class="media-top-badges">
        <span class="badge badge-season">
          <Calendar :size="11" />
          {{ card.season_tag }}
        </span>
        <span class="badge badge-version">
          {{ card.current_version }}
        </span>
      </div>

      <!-- Top Right: Score Pill -->
      <div class="score-floating-pill">
        <Star :size="13" class="star-icon" />
        <span class="score-number">{{ Number(cardScore).toFixed(1) }}</span>
      </div>
    </div>

    <!-- Card Content Area -->
    <div class="card-content">
      <h3 class="anime-title" :title="card.anime_name">
        {{ card.anime_name }}
      </h3>

      <p class="summary-quote">
        "{{ summaryText }}"
      </p>

      <!-- Footer: Author info & Action buttons -->
      <div class="card-footer">
        <div class="author-info">
          <div class="author-avatar-sm">
            {{ card.owner.nickname.slice(0, 1) }}
          </div>
          <span class="author-name">{{ card.owner.nickname }}</span>
        </div>

        <div class="card-action-btns">
          <button
            v-if="card.editable"
            class="action-btn edit-btn"
            title="修改 / 提交新版本"
            @click="handleEdit"
          >
            <Edit3 :size="14" />
            <span>迭代</span>
          </button>
          <button class="action-btn view-btn" title="查看详情">
            <Eye :size="14" />
            <span>详情</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
  position: relative;
}

.gallery-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 32px -8px rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.4);
  background: var(--bg-card-hover);
}

.card-media-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #0d1322;
}

.card-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-card:hover .card-cover-image {
  transform: scale(1.06);
}

.media-overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(9, 13, 22, 0.95) 0%, rgba(9, 13, 22, 0.2) 60%, transparent 100%);
  pointer-events: none;
}

.media-top-badges {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  z-index: 2;
}

.score-floating-pill {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(245, 158, 11, 0.45);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

.star-icon {
  color: #f59e0b;
  fill: #f59e0b;
}

.score-number {
  font-weight: 800;
  font-size: 0.875rem;
  color: #fbbf24;
  font-family: var(--font-display);
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.anime-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary-quote {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-style: italic;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.85rem;
  border-top: 1px solid var(--border-subtle);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.author-avatar-sm {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.author-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.card-action-btns {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-xs);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.view-btn {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.edit-btn {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.edit-btn:hover {
  background: rgba(99, 102, 241, 0.3);
}
</style>
