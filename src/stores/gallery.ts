import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGalleryItemsApi } from '../api/gallery'
import { getSeasonsApi, getCardDetailApi } from '../api/index'
import type { CardItem, SeasonItem } from '../types'
import { useToastStore } from './toast'

export const useGalleryStore = defineStore('gallery', () => {
  const cards = ref<CardItem[]>([])
  const seasons = ref<SeasonItem[]>([])
  const selectedSeason = ref<string>('ALL')
  const searchQuery = ref<string>('')
  const sortBy = ref<'updated' | 'score' | 'title'>('updated')
  const isLoading = ref<boolean>(false)
  const isDetailLoading = ref<boolean>(false)
  const currentCardDetail = ref<CardItem | null>(null)
  const isDetailModalOpen = ref<boolean>(false)

  const activeSeasonObj = computed(() => {
    if (selectedSeason.value === 'ALL') return null
    return seasons.value.find((s) => s.name === selectedSeason.value) || null
  })

  const filteredCards = computed(() => {
    let list = [...cards.value]

    // Search query filter (anime_name or author nickname)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.anime_name.toLowerCase().includes(q) ||
          c.owner.nickname.toLowerCase().includes(q) ||
          c.owner.username.toLowerCase().includes(q) ||
          c.articleContent?.summary.toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy.value === 'score') {
      list.sort((a, b) => (b.articleContent?.score || 0) - (a.articleContent?.score || 0))
    } else if (sortBy.value === 'title') {
      list.sort((a, b) => a.anime_name.localeCompare(b.anime_name, 'zh-CN'))
    } else {
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    return list
  })

  async function fetchSeasons() {
    try {
      const data = await getSeasonsApi()
      seasons.value = data
      // If selected season not set or not in list, pick the first ongoing season
      if (selectedSeason.value === 'ALL' && data.length > 0) {
        selectedSeason.value = data[0].name
      }
    } catch (e) {
      console.error('Fetch seasons failed', e)
    }
  }

  async function fetchGallery(forceSeason?: string) {
    isLoading.value = true
    try {
      const seasonToFetch = forceSeason !== undefined ? forceSeason : selectedSeason.value
      const res = await getGalleryItemsApi(seasonToFetch)
      cards.value = res.items
    } catch (e) {
      console.error('Fetch gallery failed', e)
    } finally {
      isLoading.value = false
    }
  }

  function setSeason(seasonName: string) {
    selectedSeason.value = seasonName
    fetchGallery(seasonName)
  }

  async function openCardDetail(cardId: string, version?: string) {
    isDetailLoading.value = true
    isDetailModalOpen.value = true
    try {
      const card = await getCardDetailApi(cardId, version)
      currentCardDetail.value = card
    } catch (e) {
      useToastStore().error('无法加载卡片详情')
      isDetailModalOpen.value = false
    } finally {
      isDetailLoading.value = false
    }
  }

  function closeCardDetail() {
    isDetailModalOpen.value = false
    currentCardDetail.value = null
  }

  return {
    cards,
    seasons,
    selectedSeason,
    searchQuery,
    sortBy,
    isLoading,
    isDetailLoading,
    currentCardDetail,
    isDetailModalOpen,
    activeSeasonObj,
    filteredCards,
    fetchSeasons,
    fetchGallery,
    setSeason,
    openCardDetail,
    closeCardDetail
  }
})
