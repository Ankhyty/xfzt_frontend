<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGalleryStore } from '../stores/gallery'
import CardDetailModal from '../components/gallery/CardDetailModal.vue'

const route = useRoute()
const router = useRouter()
const galleryStore = useGalleryStore()

onMounted(async () => {
  const cardId = route.params.card_id as string
  const version = route.query.version as string | undefined
  if (cardId) {
    await galleryStore.openCardDetail(cardId, version)
  }
})
</script>

<template>
  <div class="card-detail-page container">
    <CardDetailModal />
  </div>
</template>

<style scoped>
.card-detail-page {
  padding: 2rem 0;
  min-height: 80vh;
}
</style>
