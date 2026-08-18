<script setup lang="ts">
import { onMounted } from 'vue'
import { useGalleryStore } from '../stores/gallery'
import GalleryHero from '../components/gallery/GalleryHero.vue'
import SeasonFilterBar from '../components/gallery/SeasonFilterBar.vue'
import GalleryCard from '../components/gallery/GalleryCard.vue'
import CardDetailModal from '../components/gallery/CardDetailModal.vue'
import { Sparkles, Inbox } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const galleryStore = useGalleryStore()

onMounted(async () => {
  await galleryStore.fetchSeasons()
  await galleryStore.fetchGallery()
})

function handleCardClick(cardId: string) {
  galleryStore.openCardDetail(cardId)
}
</script>

<template>
  <div class="gallery-view">
    <!-- Hero Section -->
    <GalleryHero @open-auth="emit('open-auth')" />

    <!-- Main Content Container -->
    <main class="container gallery-main">
      <!-- Filter and Search Bar -->
      <SeasonFilterBar />

      <!-- Loading State -->
      <div v-if="galleryStore.isLoading" class="gallery-grid skeleton-grid">
        <div v-for="i in 6" :key="i" class="card-skeleton glass-panel skeleton-shimmer"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="galleryStore.filteredCards.length === 0" class="empty-gallery glass-panel">
        <div class="empty-icon-box">
          <Inbox :size="36" />
        </div>
        <h3 class="empty-title">当前筛选条件下暂无卡片</h3>
        <p class="empty-desc">
          您可以切换不同的新番季度，或进入创作台为当前季度发布第一篇新番深度评测！
        </p>
      </div>

      <!-- Gallery Waterfall / Grid Display -->
      <div v-else class="gallery-grid">
        <GalleryCard
          v-for="card in galleryStore.filteredCards"
          :key="card.card_id"
          :card="card"
          @click-card="handleCardClick"
        />
      </div>
    </main>

    <!-- Card Detail Modal -->
    <CardDetailModal />
  </div>
</template>

<style scoped>
.gallery-view {
  min-height: 80vh;
}

.gallery-main {
  padding-bottom: 3rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.75rem;
}

.card-skeleton {
  aspect-ratio: 16 / 15;
  border-radius: var(--radius-md);
}

.empty-gallery {
  padding: 5rem 2rem;
  text-align: center;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
}

.empty-icon-box {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  max-width: 460px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>
