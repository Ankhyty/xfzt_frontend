import type {
  CardItem,
  SeasonItem,
  UserInfo,
  PresignUploadResponseData,
  SeasonExportData,
  ArticleContent
} from '../types'

const MOCK_STORAGE_KEY_CARDS = 'xfzt_mock_cards_v1'
const MOCK_STORAGE_KEY_SEASONS = 'xfzt_mock_seasons_v1'
const MOCK_STORAGE_KEY_USERS = 'xfzt_mock_users_v1'

// Initial Default Mock Datasets
const DEFAULT_SEASONS: SeasonItem[] = [
  {
    season_id: 2,
    name: '2026-07',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 15, // 15 days later
    animes: ['葬送的芙莉莲 第二季', '死神 千年血战篇 相克谭', '胆大党 第二季', '败犬女主太多了！第二季', '迷宫饭 第二季'],
    created_at: '2026-07-01T08:00:00+08:00'
  },
  {
    season_id: 1,
    name: '2026-04',
    deadline: 1777507200, // past deadline
    animes: ['鬼灭之刃 无限城篇', '怪兽8号', '无职转生 第二季 下半', '摇曳露营△ 第三季'],
    created_at: '2026-04-01T08:00:00+08:00'
  },
  {
    season_id: 3,
    name: '2026-10',
    deadline: null,
    animes: ['电锯人 蕾塞篇', '咒术回战 死灭洄游篇', '间谍过家家 第三季'],
    created_at: '2026-08-01T10:00:00+08:00'
  }
]

const DEFAULT_CARDS: (CardItem & { articleContent: ArticleContent; history?: Record<string, { articleContent: ArticleContent; assets: any }> })[] = [
  {
    card_id: 'card_1785671781_u1',
    anime_name: '葬送的芙莉莲 第二季',
    season_tag: '2026-07',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v2',
    all_version: ['v1', 'v2'],
    updated_at: '2026-08-02T20:30:11+08:00',
    created_at: '2026-07-15T10:00:00+08:00',
    articleContent: {
      summary: '时光流逝中重温生命的温度，旅程与回忆交织的绝美史诗续篇。',
      score: 9.8,
      content: `### 评测概要\n\n《葬送的芙莉莲 第二季》不仅延续了前作在分镜节奏、音乐与氛围渲染上的顶尖水准，在人物情感细腻度的描绘上更进一步。\n\n#### 核心亮点\n- **魔法与日常的平衡**：战斗作画利落干脆，而日常对话更具余味。\n- **时间的哲思**：对千年生灵与人类短暂相伴的描写让人动容。\n- **顶级的配乐与美术**：每一帧都展现出宛如油画般通透的质感。\n\n> "回忆并非负担，而是让前行步伐更加坚定的微光。"\n\n**总评**：本季度无可争议的殿堂级作品。`
    },
    content_assets: {
      text_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
      text_sha256: 'e3b0c44298fc1c149afbf4c8996fb924',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
          sha256: '4e0cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene1.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=480&auto=format&fit=crop&q=70',
          sha256: '8f14e45fceea167a5a36dedd4bea2543'
        },
        {
          relative_path: 'images_thumb/scene1_thumb.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=480&auto=format&fit=crop&q=70',
          sha256: 'b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef02'
        }
      ]
    },
    history: {
      v1: {
        articleContent: {
          summary: '初稿版本：芙莉莲第二季剧情初探与期待。',
          score: 9.2,
          content: '芙莉莲第二季初稿分析内容（v1 版本）。'
        },
        assets: {}
      }
    }
  },
  {
    card_id: 'card_1785672200_u2',
    anime_name: '胆大党 第二季',
    season_tag: '2026-07',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-08-03T14:15:00+08:00',
    created_at: '2026-08-01T09:00:00+08:00',
    articleContent: {
      summary: '脑洞大开的高速狂飙，怪异、幽默与青春恋爱激燃碰撞！',
      score: 9.4,
      content: `### 青春与超自然怪谈的视听盛宴\n\nScience SARU 在动作张力与色彩解构上的实验性发挥再次惊艳全场。\n\n#### 亮点解析\n1. **极具辨识度的镜头调度**：鱼眼广角与高速俯冲镜头令人目不暇接。\n2. **男女主角绝佳的化学反应**：恋爱推拉感恰到好处，笑点密集。\n3. **惊悚与温情的双重质感**：每一个怪异背后都有令人唏嘘的故事。`
    },
    content_assets: {
      text_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop',
      text_sha256: '8876c44298fc1c149afbf4c8996fb924',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
          sha256: '770cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=480&auto=format&fit=crop&q=70',
          sha256: '9914e45fceea167a5a36dedd4bea2543'
        }
      ]
    }
  },
  {
    card_id: 'card_1785673355_u1',
    anime_name: '败犬女主太多了！第二季',
    season_tag: '2026-07',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-08-04T18:20:00+08:00',
    created_at: '2026-08-02T15:00:00+08:00',
    articleContent: {
      summary: '败犬们的败北物语依然生动鲜活，青春群像剧的喜剧巅峰。',
      score: 9.1,
      content: `### 败北者们的治愈青春\n\n温水和彦与各位性格鲜明的败犬女主们的日常拉扯，在第二季迎来了更加复杂多维的展开。\n\n#### 观察要点\n- **饮食特写与日常细节**：食欲满满的八奈见依然是全剧喜剧灵魂。\n- **细腻的镜头语言**：对少年少女微表情的捕捉精准而含蓄。`
    },
    content_assets: {
      text_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop',
      text_sha256: '3376c44298fc1c149afbf4c8996fb924',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
          sha256: '550cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=480&auto=format&fit=crop&q=70',
          sha256: '6614e45fceea167a5a36dedd4bea2543'
        }
      ]
    }
  },
  {
    card_id: 'card_1785674400_u3',
    anime_name: '死神 千年血战篇 相克谭',
    season_tag: '2026-07',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v3',
    all_version: ['v1', 'v2', 'v3'],
    updated_at: '2026-08-05T22:00:00+08:00',
    created_at: '2026-07-20T11:00:00+08:00',
    articleContent: {
      summary: '久保带人全程监修的原创补完，重铸死神巅峰热血荣光！',
      score: 9.3,
      content: `### 相克谭：战役进入白热化\n\n动画不仅完美补全了原作漫画由于篇幅受限未尽阐述的战斗细节与零番队对决，更在音乐与特效上展现出影院级的压迫感。`
    },
    content_assets: {
      text_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
      text_sha256: '1176c44298fc1c149afbf4c8996fb924',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '220cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480&auto=format&fit=crop&q=70',
          sha256: '3314e45fceea167a5a36dedd4bea2543'
        }
      ]
    }
  }
]

class MockDataService {
  private cards: any[] = []
  private seasons: SeasonItem[] = []

  constructor() {
    this.init()
  }

  private init() {
    try {
      const storedCards = localStorage.getItem(MOCK_STORAGE_KEY_CARDS)
      if (storedCards) {
        this.cards = JSON.parse(storedCards)
      } else {
        this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
        this.saveCards()
      }

      const storedSeasons = localStorage.getItem(MOCK_STORAGE_KEY_SEASONS)
      if (storedSeasons) {
        this.seasons = JSON.parse(storedSeasons)
      } else {
        this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
        this.saveSeasons()
      }
    } catch (e) {
      this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
      this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
    }
  }

  private saveCards() {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY_CARDS, JSON.stringify(this.cards))
    } catch (e) {}
  }

  private saveSeasons() {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY_SEASONS, JSON.stringify(this.seasons))
    } catch (e) {}
  }

  // --- Seasons API Mock ---
  public getSeasons(): SeasonItem[] {
    return this.seasons
  }

  public createSeason(name: string, deadline?: number | null, animes: string[] = []): SeasonItem {
    const existing = this.seasons.find((s) => s.name === name)
    if (existing) {
      throw new Error('该季度已存在')
    }
    const newSeason: SeasonItem = {
      season_id: Date.now(),
      name,
      deadline: deadline || null,
      animes,
      created_at: new Date().toISOString()
    }
    this.seasons.unshift(newSeason)
    this.saveSeasons()
    return newSeason
  }

  public updateDeadline(season_id: number, deadline: number | null): void {
    const s = this.seasons.find((item) => item.season_id === season_id)
    if (!s) throw new Error('季度不存在')
    s.deadline = deadline
    this.saveSeasons()
  }

  public updateAnimes(season_id: number, animes: string[]): string[] {
    const s = this.seasons.find((item) => item.season_id === season_id)
    if (!s) throw new Error('季度不存在')
    s.animes = animes
    this.saveSeasons()
    return s.animes
  }

  public addAnimeToSeason(season_id: number, anime_name: string): SeasonItem {
    const s = this.seasons.find((item) => item.season_id === season_id)
    if (!s) throw new Error('季度不存在')
    if (s.animes.includes(anime_name)) {
      throw new Error('该番剧名已存在，请勿重复添加')
    }
    s.animes.push(anime_name)
    this.saveSeasons()
    return s
  }

  public getSeasonExport(season_id: number): SeasonExportData {
    const s = this.seasons.find((item) => item.season_id === season_id)
    if (!s) throw new Error('季度不存在')
    const seasonCards = this.cards.filter((c) => c.season_tag === s.name)
    
    return {
      season: s.name,
      total_cards: seasonCards.length,
      bucket_base: 'https://at-trump.obs.ap-southeast-3.myhuaweicloud.com',
      cards: seasonCards.map((c) => ({
        card_id: c.card_id,
        owner: c.owner,
        current_version: c.current_version,
        files: [
          { relative_path: 'text/article.json', url: c.content_assets.text_url, sha256: c.content_assets.text_sha256 },
          ...(c.content_assets.images || []),
          ...(c.content_assets.images_thumb || [])
        ]
      })),
      generated_at: new Date().toISOString()
    }
  }

  // --- Cards & Gallery API Mock ---
  public getGalleryItems(season?: string, currentUser?: UserInfo | null): { items: CardItem[]; total: number; etag: string } {
    let filtered = this.cards
    if (season && season !== 'ALL') {
      filtered = filtered.filter((c) => c.season_tag === season)
    }

    const items: CardItem[] = filtered.map((c) => {
      const isOwner = currentUser && currentUser.user_id === c.owner.user_id
      const isAdmin = currentUser?.role === 'admin'
      return {
        ...c,
        editable: Boolean(isAdmin || isOwner)
      }
    })

    const etag = `gallery-${season || 'all'}-${items.length}-${items.map(i => i.updated_at).join('')}`.slice(0, 32)
    return { items, total: items.length, etag }
  }

  public getCardDetail(card_id: string, version?: string, currentUser?: UserInfo | null): { card: CardItem; etag: string } {
    const found = this.cards.find((c) => c.card_id === card_id)
    if (!found) throw new Error('卡片不存在')

    const isOwner = currentUser && currentUser.user_id === found.owner.user_id
    const isAdmin = currentUser?.role === 'admin'

    let cardData = { ...found, editable: Boolean(isAdmin || isOwner) }

    if (version && version !== found.current_version && found.history?.[version]) {
      const hist = found.history[version]
      cardData = {
        ...cardData,
        current_version: version,
        articleContent: hist.articleContent,
        content_assets: hist.assets.images ? hist.assets : found.content_assets
      }
    }

    return { card: cardData, etag: cardData.current_version }
  }

  public createCard(anime_name: string, season_tag: string, currentUser: UserInfo): CardItem {
    const season = this.seasons.find((s) => s.name === season_tag)
    if (!season) throw new Error('季度不存在')
    if (!season.animes.includes(anime_name)) {
      throw new Error('番剧名不在该季度候选清单中')
    }

    const card_id = `card_${Date.now()}_u${currentUser.user_id}`
    const newCard: any = {
      card_id,
      anime_name,
      season_tag,
      owner: {
        user_id: currentUser.user_id,
        username: currentUser.username,
        nickname: currentUser.nickname
      },
      editable: true,
      current_version: 'v1',
      all_version: ['v1'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      articleContent: {
        summary: '',
        score: 9.0,
        content: ''
      },
      content_assets: {
        text_url: '',
        text_sha256: '',
        images: [],
        images_thumb: []
      },
      history: {}
    }

    this.cards.unshift(newCard)
    this.saveCards()
    return newCard
  }

  public generatePresignTickets(
    card_id: string,
    next_version: string,
    files: { relative_path: string; content_type: string; sha256?: string }[],
    currentUser: UserInfo
  ): PresignUploadResponseData {
    const card = this.cards.find((c) => c.card_id === card_id)
    if (!card) throw new Error('卡片不存在')

    const upload_tickets = files.map((f) => ({
      relative_path: f.relative_path,
      upload_url: `mock://obs/users/user_${currentUser.user_id}/cards/${card_id}/versions/${next_version}/${f.relative_path}`,
      http_method: 'PUT' as const,
      headers: {
        'Content-Type': f.content_type || 'application/octet-stream'
      }
    }))

    return {
      card_id,
      version: next_version,
      upload_tickets
    }
  }

  public commitCardVersion(
    card_id: string,
    version: string,
    articleContent: ArticleContent,
    uploadedImages: { original: any; thumb: any }[],
    textSha256: string
  ): CardItem {
    const card = this.cards.find((c) => c.card_id === card_id)
    if (!card) throw new Error('卡片不存在')

    // Backup current version to history
    if (!card.history) card.history = {}
    card.history[card.current_version] = {
      articleContent: JSON.parse(JSON.stringify(card.articleContent)),
      assets: JSON.parse(JSON.stringify(card.content_assets))
    }

    if (!card.all_version.includes(version)) {
      card.all_version.push(version)
    }

    card.current_version = version
    card.updated_at = new Date().toISOString()
    card.articleContent = articleContent

    const images = uploadedImages.map((img) => ({
      relative_path: img.original.relativePath,
      url: img.original.previewUrl,
      sha256: img.original.sha256
    }))

    const images_thumb = uploadedImages.map((img) => ({
      relative_path: img.thumb.relativePath,
      url: img.thumb.previewUrl,
      sha256: img.thumb.sha256
    }))

    card.content_assets = {
      text_url: `mock://obs/text/article.json`,
      text_sha256: textSha256,
      images,
      images_thumb
    }

    this.saveCards()
    return card
  }

  public rollbackCard(card_id: string, target_version: string): CardItem {
    const card = this.cards.find((c) => c.card_id === card_id)
    if (!card) throw new Error('卡片不存在')
    if (!card.all_version.includes(target_version)) {
      throw new Error('目标版本不存在')
    }

    if (card.history?.[target_version]) {
      const hist = card.history[target_version]
      card.articleContent = JSON.parse(JSON.stringify(hist.articleContent))
      if (hist.assets?.images?.length) {
        card.content_assets = JSON.parse(JSON.stringify(hist.assets))
      }
    }

    card.current_version = target_version
    card.updated_at = new Date().toISOString()
    this.saveCards()
    return card
  }

  public resetToDefault() {
    this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
    this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
    this.saveCards()
    this.saveSeasons()
  }
}

export const mockDataService = new MockDataService()
