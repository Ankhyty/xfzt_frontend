import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGalleryItemsApi } from '../api/gallery'
import { getSeasonsApi, getCardDetailApi } from '../api/index'
import type { CardItem, SeasonItem } from '../types'
import { useToastStore } from './toast'

export const useGalleryStore = defineStore('gallery', () => {
  const cards = ref<CardItem[]>([])
  const allGalleryCards = ref<CardItem[]>([])
  const seasons = ref<SeasonItem[]>([])
  
  // Year & Month/Tag dual filters
  const selectedYear = ref<string>('2026')
  const selectedMonth = ref<string>('07')
  
  const isGlobalSearch = ref<boolean>(false)
  const searchQuery = ref<string>('')
  const sortBy = ref<'updated' | 'score' | 'title'>('updated')
  const isLoading = ref<boolean>(false)
  const isDetailLoading = ref<boolean>(false)
  const currentCardDetail = ref<CardItem | null>(null)
  const isDetailModalOpen = ref<boolean>(false)

  // Derived selected season tag: e.g. "2026-07" or "2026-国漫特辑"
  const selectedSeason = computed(() => {
    return `${selectedYear.value}-${selectedMonth.value}`
  })

  // Extract all distinct years available in seasons list
  const availableYears = computed(() => {
    const years = new Set<string>()
    seasons.value.forEach((s) => {
      const idx = s.name.indexOf('-')
      if (idx !== -1) {
        const y = s.name.slice(0, idx)
        if (y) years.add(y)
      }
    })
    // Fallback default years if empty
    if (years.size === 0) {
      years.add('2026')
      years.add('2025')
      years.add('2024')
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  })

  // Dynamically compute seasons / quarters available for the selected year (including custom tags)
  const availableMonths = computed(() => {
    const list: { value: string; label: string }[] = []
    const standardLabels: Record<string, string> = {
      '01': '1月 冬季番',
      '04': '4月 春季番',
      '07': '7月 夏季番',
      '10': '10月 秋季番'
    }

    // Collect custom season tags for this year
    const existingTags = new Set<string>()
    seasons.value.forEach((s) => {
      const idx = s.name.indexOf('-')
      if (idx !== -1) {
        const y = s.name.slice(0, idx)
        const tag = s.name.slice(idx + 1)
        if (y === selectedYear.value && tag) {
          existingTags.add(tag)
        }
      }
    })

    // Custom special season tags first if active, or standard quarters
    existingTags.forEach((tag) => {
      if (!standardLabels[tag]) {
        list.push({ value: tag, label: tag })
      }
    })

    // Standard quarters
    ;['01', '04', '07', '10'].forEach((m) => {
      list.push({ value: m, label: standardLabels[m] })
    })

    return list
  })

  const activeSeasonObj = computed(() => {
    return seasons.value.find((s) => s.name === selectedSeason.value) || null
  })

  const filteredCards = computed(() => {
    let list = isGlobalSearch.value ? [...allGalleryCards.value] : [...cards.value]

    // Search query filter (anime_name or author nickname or username or summary)
    if (searchQuery.value && searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(
        (c) =>
          (c.anime_name || '').toLowerCase().includes(q) ||
          (c.owner?.nickname || '').toLowerCase().includes(q) ||
          (c.owner?.username || '').toLowerCase().includes(q) ||
          (c.season_tag || '').toLowerCase().includes(q) ||
          (c.articleContent?.summary || '').toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy.value === 'score') {
      list.sort((a, b) => (b.articleContent?.score || 0) - (a.articleContent?.score || 0))
    } else if (sortBy.value === 'title') {
      list.sort((a, b) => (a.anime_name || '').localeCompare(b.anime_name || '', 'zh-CN'))
    } else {
      list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    return list
  })

  async function fetchSeasons() {
    try {
      const data = await getSeasonsApi()
      seasons.value = data
      
      // Default to latest season in list
      if (data.length > 0) {
        const latest = data[0].name // e.g. "2026-07" or "2026-国漫特辑"
        const idx = latest.indexOf('-')
        if (idx !== -1) {
          selectedYear.value = latest.slice(0, idx)
          selectedMonth.value = latest.slice(idx + 1)
        }
      }
    } catch (e) {
      console.error('Fetch seasons failed', e)
    }
  }

  async function fetchGallery(seasonName?: string) {
    isLoading.value = true
    try {
      const seasonToFetch = seasonName || selectedSeason.value
      const res = await getGalleryItemsApi(seasonToFetch)
      cards.value = res.items
    } catch (e) {
      console.error('Fetch gallery failed', e)
    } finally {
      isLoading.value = false
    }
  }

  async function toggleGlobalSearch(forceState?: boolean) {
    const targetState = forceState !== undefined ? forceState : !isGlobalSearch.value
    isGlobalSearch.value = targetState
    
    if (isGlobalSearch.value) {
      isLoading.value = true
      try {
        const res = await getGalleryItemsApi('ALL')
        allGalleryCards.value = res.items
      } catch (e) {
        console.error('Fetch all cards for global search failed', e)
      } finally {
        isLoading.value = false
      }
    } else {
      fetchGallery(selectedSeason.value)
    }
  }

  function setYear(year: string) {
    isGlobalSearch.value = false
    selectedYear.value = year
    // If current selectedMonth not in new year's seasons, pick the first season of that year
    const currentYearSeasons = seasons.value.filter((s) => s.name.startsWith(`${year}-`))
    if (currentYearSeasons.length > 0) {
      const hasCurrent = currentYearSeasons.some((s) => s.name === `${year}-${selectedMonth.value}`)
      if (!hasCurrent) {
        const firstTag = currentYearSeasons[0].name.slice(year.length + 1)
        selectedMonth.value = firstTag
      }
    }
    fetchGallery(selectedSeason.value)
  }

  function setMonth(month: string) {
    isGlobalSearch.value = false
    selectedMonth.value = month
    fetchGallery(selectedSeason.value)
  }

  function setSeasonByTag(seasonTag: string) {
    isGlobalSearch.value = false
    const idx = seasonTag.indexOf('-')
    if (idx !== -1) {
      selectedYear.value = seasonTag.slice(0, idx)
      selectedMonth.value = seasonTag.slice(idx + 1)
      fetchGallery(seasonTag)
    }
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
    allGalleryCards,
    seasons,
    selectedYear,
    selectedMonth,
    selectedSeason,
    isGlobalSearch,
    availableYears,
    availableMonths,
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
    toggleGlobalSearch,
    setYear,
    setMonth,
    setSeasonByTag,
    openCardDetail,
    closeCardDetail
  }
})
