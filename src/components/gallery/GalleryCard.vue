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
  <div class="gallery-card-item glass-panel animate-fade-in" @click="emit('click-card', card.card_id)">
    <!-- 16:9 Cover Box with Season Badge and Version Pill -->
    <div class="card-cover-box">
      <img
        :src="coverImageUrl"
        :alt="card.anime_name"
        class="cover-img"
        loading="lazy"
      />
      <span class="season-badge">{{ card.season_tag }}</span>
      <span class="version-pill">{{ card.current_version }}</span>
    </div>

    <!-- Info Box -->
    <div class="card-info-box">
      <div class="card-title-row">
        <h4 class="card-anime-name" :title="card.anime_name">{{ card.anime_name }}</h4>
        <div class="score-pill">
          <Star :size="12" class="text-amber" />
          <span>{{ Number(cardScore).toFixed(1) }}</span>
        </div>
      </div>

      <p class="card-summary-text">
        {{ summaryText }}
      </p>

      <div class="card-footer-meta">
        <!-- Author info -->
        <div class="author-info">
          <div class="author-avatar-sm">
            {{ (card.owner?.nickname || card.owner?.username || 'U').slice(0, 1) }}
          </div>
          <span class="author-name">{{ card.owner.nickname }}</span>
        </div>
        
        <!-- Actions -->
        <div class="item-actions">
          <button class="btn btn-secondary btn-xs" @click.stop="emit('click-card', card.card_id)">
            <Eye :size="13" />
            <span>查看</span>
          </button>
          <button v-if="card.editable" class="btn btn-primary btn-xs" @click="handleEdit">
            <Edit3 :size="13" />
            <span>编辑</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery-card-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid var(--border-glass);
}

.gallery-card-item:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: var(--shadow-glow);
}

.card-cover-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.gallery-card-item:hover .cover-img {
  transform: scale(1.04);
}

.season-badge {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  font-weight: 700;
  color: #a5b4fc;
}

.version-pill {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  padding: 0.2rem 0.5rem;
  background: var(--gradient-primary);
  border-radius: var(--radius-xs);
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
}

.card-info-box {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-anime-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-card-item:hover .card-anime-name {
  color: var(--accent-primary);
}

.score-pill {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.45rem;
  background: rgba(245, 158, 11, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24;
}

.card-summary-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
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

.item-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-xs {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
}

.text-amber { color: var(--accent-amber); fill: var(--accent-amber); }
</style>
