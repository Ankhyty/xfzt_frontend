import type {
  CardItem,
  SeasonItem,
  UserInfo,
  PresignUploadResponseData,
  SeasonExportData,
  ArticleContent
} from '../types'

const MOCK_STORAGE_KEY_CARDS = 'xfzt_mock_cards_v5'
const MOCK_STORAGE_KEY_SEASONS = 'xfzt_mock_seasons_v5'

// Detailed Anime Seasons (including standard quarters and special feature seasons)
const DEFAULT_SEASONS: SeasonItem[] = [
  {
    season_id: 10,
    name: '2026-国漫特辑',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 30,
    animes: [
      '凡人修仙传 新年番',
      '雾山五行 犀川白泽篇',
      '仙逆 域外战场篇',
      '完美世界 帝关大战',
      '大理寺日志 第三季'
    ],
    created_at: '2026-08-01T08:00:00+08:00'
  },
  {
    season_id: 9,
    name: '2026-07',
    deadline: Math.floor(Date.now() / 1000) + 86400 * 20,
    animes: [
      '葬送的芙莉莲 第二季',
      '死神 千年血战篇 相克谭',
      '胆大党 第二季',
      '败犬女主太多了！第二季',
      '推子 第三季',
      '迷宫饭 第二季',
      '间谍过家家 第三季'
    ],
    created_at: '2026-07-01T08:00:00+08:00'
  },
  {
    season_id: 8,
    name: '2026-04',
    deadline: 1777507200,
    animes: [
      '鬼灭之刃 无限城篇 第一夜',
      '孤独摇滚！第二季',
      '关于我转生变成史莱姆这档事 第四季',
      '轻音少女！新作剧场版',
      '蔚蓝档案 The Animation 第二季',
      '咒术回战 死灭洄游篇 前篇'
    ],
    created_at: '2026-04-01T08:00:00+08:00'
  },
  {
    season_id: 7,
    name: '2026-01',
    deadline: 1769731200,
    animes: [
      '怪兽8号 第二季',
      '我推的孩子 第二季',
      '紫罗兰永恒花园 特别篇',
      '赛马娘 芦毛灰姑娘',
      '为美好的世界献上祝福！第四季',
      '异世界舅舅 第二季'
    ],
    created_at: '2026-01-01T08:00:00+08:00'
  },
  {
    season_id: 6,
    name: '2025-10',
    deadline: 1761868800,
    animes: [
      '进击的巨人 完结纪念篇',
      'Re:从零开始的异世界生活 第三季',
      '咒术回战 怀玉·玉折 剧场总集篇',
      '天国大魔境 第二季',
      '香格里拉·开拓异境 第二季',
      '电锯人 蕾塞篇'
    ],
    created_at: '2025-10-01T08:00:00+08:00'
  },
  {
    season_id: 5,
    name: '2025-07',
    deadline: 1754006400,
    animes: [
      '无职转生 第二季 下半',
      'Lycoris Recoil 衍生篇',
      'BLEACH 千年血战篇 诀别谭',
      'BanG Dream! It\'s MyGO!!!!!',
      '擅长逃跑的殿下',
      '小林家的龙女仆 剧场版'
    ],
    created_at: '2025-07-01T08:00:00+08:00'
  },
  {
    season_id: 4,
    name: '2025-04',
    deadline: 1746057600,
    animes: [
      '机动战士高达 水星的魔女 第二季',
      '我心里危险的东西 第二季',
      '摇曳露营△ 第三季',
      '女神异闻录3 剧场重制版',
      '迷宫饭 第一季',
      '狼与香辛料 行商邂逅贤狼'
    ],
    created_at: '2025-04-01T08:00:00+08:00'
  },
  {
    season_id: 3,
    name: '2025-01',
    deadline: 1738281600,
    animes: [
      '药屋少女的呢喃 第二季',
      '葬送的芙莉莲 第一季 下半',
      '物理魔法使马修 第二季',
      '我独自升级',
      '弱角友崎同学 第二季'
    ],
    created_at: '2025-01-01T08:00:00+08:00'
  },
  {
    season_id: 2,
    name: '2024-10',
    deadline: 1730332800,
    animes: [
      '胆大党 第一季',
      '乱马1/2 完全重制版',
      '青之箱',
      '七大罪 默示录的四骑士 第二季',
      '魔王2099'
    ],
    created_at: '2024-10-01T08:00:00+08:00'
  },
  {
    season_id: 1,
    name: '2024-剧场版精选',
    deadline: null,
    animes: [
      '排球少年！！垃圾场决战',
      '名侦探柯南 100万美元的五棱星',
      '间谍过家家 代号：白',
      '机动战士高达SEED FREEDOM'
    ],
    created_at: '2024-05-01T08:00:00+08:00'
  }
]

// Massive 35+ Rich Anime Review Cards across all quarters
const DEFAULT_CARDS: (CardItem & { articleContent: ArticleContent; history?: Record<string, { articleContent: ArticleContent; assets: any }> })[] = [
  // ================= 2026-国漫特辑 =================
  {
    card_id: 'card_2026guoman_01',
    anime_name: '凡人修仙传 新年番',
    season_tag: '2026-国漫特辑',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v2',
    all_version: ['v1', 'v2'],
    updated_at: '2026-08-10T21:00:00+08:00',
    created_at: '2026-08-01T12:00:00+08:00',
    articleContent: {
      summary: '韩立初入星海风云变幻，动作捕捉与真实物理光影铸就硬核仙侠标杆！',
      score: 9.8,
      content: `《凡人修仙传》新年番在制作工艺、叙事编排与人物微表情建模上再次拔高了3D国漫的工业天花板。

从越国篇的杀伐果断到乱星海初期的韬光养晦，原著中那种“杀人夺宝、步步惊心”的真实修仙氛围被原汁原味地还原出来。原力动画团队在动捕技术上的精进尤为亮眼，无论是御剑飞行的空气动力学气流表现，还是符箓法宝碰撞时的粒子光效，都彻底摆脱了传统玄幻动画塑料感过重的通病。

【深度细节拆解与多维评测】

一、动作戏的真实感与力道传导
本作区别于一般国漫“站桩对波”的最大特点就是扎实利落的实战感。韩立每一次施展罗烟步的身法走位、利用神识探查周遭敌情时的视线交替，都通过极其严谨的分镜语言展现出来。尤其是青竹蜂云剑阵初显神威的桥段，剑光如织，雷芒裂空，音效的重低音爆破与高频电鸣配合得严丝合缝，给观众带来极其震撼的视听临场感。

二、韩立“凡人”内核的性格刻画
主角韩立不是天生救世主，他谨慎、隐忍、理性，在险恶的修真界遵循弱肉强食的底层法则，却又在关键时刻守住做人的底线。动画在文戏处理上极为细腻，眼神的微动、下意识握紧储物袋的小动作，无不将一个在泥潭中拼命挣扎求道的小人物刻画得有血有肉。

三、场景美术与国风写意的美学融合
天星城的恢弘雄奇、外海孤岛的荒凉险峻、以及海底妖兽出没时的幽暗深邃，色彩层次极为分明。虚幻引擎5加持下的全局光照让海平面的晨曦与夕阳具备了堪比现实电影的光影质感。

总评：这是一部真正懂得修仙小说灵魂的作品，既有刀光剑影的凌厉肃杀，又有天地苍茫的孤独意境，堪称当前国漫改编领域的殿堂级力作！`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '990cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene1.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: '880cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene2.webp',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
          sha256: '770cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene3.webp',
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
          sha256: '660cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene4.webp',
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
          sha256: '550cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=480&auto=format&fit=crop&q=70',
          sha256: '110cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ]
    },
    history: {
      v1: {
        articleContent: {
          summary: '初稿版本：凡人修仙传乱星海初期评测。',
          score: 9.5,
          content: '凡人修仙传初稿长文评测内容（v1 版本归档）。'
        },
        assets: {}
      }
    }
  },
  {
    card_id: 'card_2026guoman_02',
    anime_name: '雾山五行 犀川白泽篇',
    season_tag: '2026-国漫特辑',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-08-11T16:20:00+08:00',
    created_at: '2026-08-05T09:00:00+08:00',
    articleContent: {
      summary: '水墨写意与极致武术打斗的视觉盛宴，国风美学的惊艳狂飙！',
      score: 9.9,
      content: `林魂导演带领六道无鱼工作室耗时数年打磨的《雾山五行 犀川白泽篇》，以不可思议的超高水准重新诠释了什么叫作“中国水墨动画与现代动作美学的终极融合”。

【全方位视听剖析】
一、国画水墨笔触与冷兵器碰撞的张力：长枪短刀招式清晰，力量感爆棚。
二、白泽与人类贪欲的深层主题：探讨人妖共存与因果循环。
三、唢呐与古筝编织的史诗配乐：民乐与重金属摇滚的破壁结合。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
          sha256: '440cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene1.webp',
          url: 'https://images.unsplash.com/photo-1569705460033-cfaa4bf9f822?w=1200&auto=format&fit=crop&q=80',
          sha256: '330cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=480&auto=format&fit=crop&q=70',
          sha256: '000cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ]
    }
  },
  {
    card_id: 'card_2026guoman_03',
    anime_name: '仙逆 域外战场篇',
    season_tag: '2026-国漫特辑',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-08-12T14:30:00+08:00',
    created_at: '2026-08-08T10:00:00+08:00',
    articleContent: {
      summary: '杀戮果决的王麻子，域外战场修罗道的狂暴杀意与生死意境！',
      score: 9.3,
      content: `王林在域外战场上的杀戮与化神意境感悟，是《仙逆》全书公认的情感与战斗高潮点。动画将极境神识的压迫感与死咒术的诡谲演绎得淋漓尽致。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
          sha256: '220cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2026-07 (Summer 2026) =================
  {
    card_id: 'card_202607_01',
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
      content: `《葬送的芙莉莲 第二季》不仅延续了前作在分镜节奏、音乐与氛围渲染上的顶尖水准，在人物情感细腻度的描绘上更进一步。
魔法与日常的平衡、时间与生命的哲思，每一帧都展现出宛如油画般通透治愈的质感。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
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
        },
        {
          relative_path: 'images/scene2.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: 'c1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef03'
        }
      ],
      images_thumb: [
        {
          relative_path: 'images_thumb/cover_thumb.webp',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=480&auto=format&fit=crop&q=70',
          sha256: '8f14e45fceea167a5a36dedd4bea2543'
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
    card_id: 'card_202607_02',
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
      score: 9.5,
      content: `Science SARU 在动作张力与色彩解构上的实验性发挥再次惊艳全场。男女主角绝佳的化学反应，恋爱推拉感恰到好处。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
          sha256: '770cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202607_03',
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
      content: `温水和彦与各位性格鲜明的败犬女主们的日常拉扯，在第二季迎来了更加复杂多维的展开。八奈见依然是全剧喜剧灵魂。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: '550cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202607_04',
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
      score: 9.4,
      content: `动画不仅完美补全了原作漫画未尽阐述的战斗细节与零番队对决，更在音乐与特效上展现出影院级的压迫感。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '220cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202607_05',
    anime_name: '推子 第三季',
    season_tag: '2026-07',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-08-06T11:00:00+08:00',
    created_at: '2026-08-05T09:00:00+08:00',
    articleContent: {
      summary: '演艺圈的暗流涌动，舞台剧篇高光之后迈向真相的决意。',
      score: 9.2,
      content: `延续了第二季东京BLADE舞台剧的高水准制作，第三季在挖掘娱乐圈深层暗面与角色心理博弈上渐入佳境。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
          sha256: '77aabff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2026-04 (Spring 2026) =================
  {
    card_id: 'card_202604_01',
    anime_name: '鬼灭之刃 无限城篇 第一夜',
    season_tag: '2026-04',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v2',
    all_version: ['v1', 'v2'],
    updated_at: '2026-05-12T19:40:00+08:00',
    created_at: '2026-04-10T12:00:00+08:00',
    articleContent: {
      summary: '无限城终局之战拉开序幕，ufotable 顶级摄影与三维空间调度的极致之作。',
      score: 9.7,
      content: `无限城空间的无尽回转与柱们的决死意志在此刻爆发。分镜与镜头运动达到了动画电影级的标杆水平。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1569705460033-cfaa4bf9f822?w=1200&auto=format&fit=crop&q=80',
          sha256: '990cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202604_02',
    anime_name: '孤独摇滚！第二季',
    season_tag: '2026-04',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-05-18T16:00:00+08:00',
    created_at: '2026-04-15T10:00:00+08:00',
    articleContent: {
      summary: '结束乐队新单曲爆发！社恐少女后藤一里的吉他英雄蜕变路。',
      score: 9.6,
      content: `第二季依然保留了充满天马行空想象力的定格动画与黏土狂想，Live 演奏场景的动捕与乐器细节再次拉满。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
          sha256: '331cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202604_03',
    anime_name: '关于我转生变成史莱姆这档事 第四季',
    season_tag: '2026-04',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-05-20T10:15:00+08:00',
    created_at: '2026-04-20T08:00:00+08:00',
    articleContent: {
      summary: '魔国联邦的开国祭与新威胁，轻松幽默与宏大建国史诗。',
      score: 8.8,
      content: `利姆鲁在巩固周边势力与应对帝国势力的过程中，展现了更加成熟的领袖风范。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
          sha256: '551cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2026-01 (Winter 2026) =================
  {
    card_id: 'card_202601_01',
    anime_name: '怪兽8号 第二季',
    season_tag: '2026-01',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-02-15T18:00:00+08:00',
    created_at: '2026-01-10T10:00:00+08:00',
    articleContent: {
      summary: '大叔主角的执着坚守，防卫队高燃战役全面打响！',
      score: 9.0,
      content: `日比野卡夫卡在身份暴露后的抉择让人动容，Production I.G 在重装机甲与怪兽肉搏上的物理打击感极佳。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: '771cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202601_02',
    anime_name: '紫罗兰永恒花园 特别篇',
    season_tag: '2026-01',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2026-02-28T21:00:00+08:00',
    created_at: '2026-01-20T14:00:00+08:00',
    articleContent: {
      summary: '京都动画献给时光的温润情书，写信人与收信人间永恒的爱意。',
      score: 9.8,
      content: `光影与泪水交融的叙事诗篇，京阿尼用无比精湛的画面与管弦乐章再一次叩击心灵。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=80',
          sha256: '992cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2025-10 (Autumn 2025) =================
  {
    card_id: 'card_202510_01',
    anime_name: '进击的巨人 完结纪念篇',
    season_tag: '2025-10',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v2',
    all_version: ['v1', 'v2'],
    updated_at: '2025-11-20T23:00:00+08:00',
    created_at: '2025-10-15T11:00:00+08:00',
    articleContent: {
      summary: '献给自由的壮烈挽歌，跨越十年的时代印记与思想洗礼。',
      score: 9.9,
      content: `十载岁月铸就的宏大史诗，MAPPA在最后的高潮中交出了令人肃然起敬的答卷。
艾伦·耶格尔的抉择与阿尔敏的对话，在重制版中更具深沉的哲学意味。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '113cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202510_02',
    anime_name: 'Re:从零开始的异世界生活 第三季',
    season_tag: '2025-10',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-11-25T14:30:00+08:00',
    created_at: '2025-10-20T09:00:00+08:00',
    articleContent: {
      summary: '水门都市朴利斯提拉攻防战，大罪司教全员集结的绝望与破局！',
      score: 9.3,
      content: `White Fox 在长篇群像战斗上的统筹力再次得到展现，菜月昴的演讲燃起全城希望。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
          sha256: '333cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2025-07 (Summer 2025) =================
  {
    card_id: 'card_202507_01',
    anime_name: '无职转生 第二季 下半',
    season_tag: '2025-07',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v2',
    all_version: ['v1', 'v2'],
    updated_at: '2025-08-22T19:00:00+08:00',
    created_at: '2025-07-12T10:00:00+08:00',
    articleContent: {
      summary: '迷宫篇的生离死别与家庭沉淀，异世界成长物语的厚重顶点。',
      score: 9.6,
      content: `保罗与鲁迪乌斯的并肩作战，以及转移迷宫深处的牺牲，将全作情感推向顶点。Studio Bind 展现出行业顶尖的制作水准。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
          sha256: '553cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202507_02',
    anime_name: 'BanG Dream! It\'s MyGO!!!!!',
    season_tag: '2025-07',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-08-30T22:15:00+08:00',
    created_at: '2025-07-25T11:00:00+08:00',
    articleContent: {
      summary: '为何要演奏春日影！刺痛与治愈并存的青春重型朋克狂潮。',
      score: 9.7,
      content: `柿本广大与绫奈由仁子打造的现实主义重女扭曲剧，情感张力与台词密度在近五年来独树一帜。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
          sha256: '773cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2025-04 (Spring 2025) =================
  {
    card_id: 'card_202504_01',
    anime_name: '机动战士高达 水星的魔女 第二季',
    season_tag: '2025-04',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-05-30T17:00:00+08:00',
    created_at: '2025-04-18T10:00:00+08:00',
    articleContent: {
      summary: '百合与机甲的羁绊交响，面对命运诅咒的决斗与前行。',
      score: 9.0,
      content: `斯莱塔与米奥莉奈之间的信赖与选择，在日升顶尖机战作画与大河内一楼的悬念设置中圆满收官。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: '994cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202504_02',
    anime_name: '我心里危险的东西 第二季',
    season_tag: '2025-04',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-05-25T15:20:00+08:00',
    created_at: '2025-04-12T09:00:00+08:00',
    articleContent: {
      summary: '纯度极高的青春恋爱物语，从阴郁自闭到彼此奔赴的温柔治愈。',
      score: 9.7,
      content: `市川与山田的相互理解与体谅，细节处理达到了纯爱作品的极高水准。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '115cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202504_03',
    anime_name: '摇曳露营△ 第三季',
    season_tag: '2025-04',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-06-01T12:00:00+08:00',
    created_at: '2025-04-20T10:00:00+08:00',
    articleContent: {
      summary: '松软温暖的户外慢时光，富士山下的热汤与悠闲露营。',
      score: 9.3,
      content: `由8bit接手制作后，画风更加清新自然，配乐依然保持了让人瞬间静心解压的高水准。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
          sha256: '335cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2025-01 (Winter 2025) =================
  {
    card_id: 'card_202501_01',
    anime_name: '药屋少女的呢喃 第二季',
    season_tag: '2025-01',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-02-18T16:00:00+08:00',
    created_at: '2025-01-15T09:00:00+08:00',
    articleContent: {
      summary: '猫猫的宫廷悬疑探案记，毒物知识与后宫权谋的绝妙结合。',
      score: 9.5,
      content: `悠木碧声线与猫猫狡黠灵动性格的完美契合，配合扎实的宫廷推理悬念，节奏把控极佳。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
          sha256: '445cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },
  {
    card_id: 'card_202501_02',
    anime_name: '我独自升级',
    season_tag: '2025-01',
    owner: { user_id: 3, username: 'admin', nickname: '总编晴天' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2025-02-22T20:00:00+08:00',
    created_at: '2025-01-20T11:00:00+08:00',
    articleContent: {
      summary: '暗黑系爽番标杆，暗影君王成长的爽快动作打击感！',
      score: 8.9,
      content: `A-1 Pictures 在动作打斗和泽野弘之配乐加持下，呈现出极具爽感的战斗节奏。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80',
          sha256: '555cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2024-10 (Autumn 2024) =================
  {
    card_id: 'card_202410_01',
    anime_name: '青之箱',
    season_tag: '2024-10',
    owner: { user_id: 2, username: 'writer_b', nickname: '星野' },
    editable: false,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2024-11-15T18:00:00+08:00',
    created_at: '2024-10-10T10:00:00+08:00',
    articleContent: {
      summary: '羽毛球与篮球馆的清晨阳光，纯净微甜的青春体育恋爱群像。',
      score: 9.3,
      content: `Telecom Animation Film 对晨光、球馆汗水与少年悸动的刻画细腻真实。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80',
          sha256: '665cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
    }
  },

  // ================= 2024-剧场版精选 =================
  {
    card_id: 'card_2024mv_01',
    anime_name: '排球少年！！垃圾场决战',
    season_tag: '2024-剧场版精选',
    owner: { user_id: 1, username: 'writer_a', nickname: '阿莉' },
    editable: true,
    current_version: 'v1',
    all_version: ['v1'],
    updated_at: '2024-06-15T22:00:00+08:00',
    created_at: '2024-05-20T10:00:00+08:00',
    articleContent: {
      summary: '乌鸦与野猫的宿命对决，不能重来的一场比赛，满分热血与泪水！',
      score: 9.9,
      content: `孤爪研磨视角的第一人称长镜头堪称运动动画影史神来之笔。排球落地那一刻，全场观众屏息凝神。`
    },
    content_assets: {
      text_url: '',
      text_sha256: '',
      images: [
        {
          relative_path: 'images/cover.webp',
          url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
          sha256: '775cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        },
        {
          relative_path: 'images/scene1.webp',
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
          sha256: '885cbff15c98c0c8046814bc762332cb82d44b5d9502322deebd01e9f3321533'
        }
      ],
      images_thumb: []
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
      if (storedCards && storedCards !== 'undefined' && storedCards !== 'null') {
        this.cards = JSON.parse(storedCards)
      } else {
        this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
        this.saveCards()
      }

      const storedSeasons = localStorage.getItem(MOCK_STORAGE_KEY_SEASONS)
      if (storedSeasons && storedSeasons !== 'undefined' && storedSeasons !== 'null') {
        this.seasons = JSON.parse(storedSeasons)
      } else {
        this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
        this.saveSeasons()
      }
    } catch (e) {
      this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
      this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
      this.saveCards()
      this.saveSeasons()
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
          { relative_path: 'text/article.json', url: c.content_assets?.text_url || '', sha256: c.content_assets?.text_sha256 || '' },
          ...(c.content_assets?.images || []),
          ...(c.content_assets?.images_thumb || [])
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
      const isOwner = currentUser && (currentUser.user_id === c.owner.user_id || currentUser.username === c.owner.username)
      const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin'
      return {
        ...c,
        editable: Boolean(isAdmin || isOwner)
      }
    })

    const etag = `gallery-${season || 'all'}-${items.length}-${items.map((i) => i.updated_at).join('')}`.slice(0, 32)
    return { items, total: items.length, etag }
  }

  public getCardDetail(card_id: string, version?: string, currentUser?: UserInfo | null): { card: CardItem; etag: string } {
    const found = this.cards.find((c) => c.card_id === card_id)
    if (!found) throw new Error('卡片不存在')

    const isOwner = currentUser && (currentUser.user_id === found.owner.user_id || currentUser.username === found.owner.username)
    const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin'

    let cardData = { ...found, editable: Boolean(isAdmin || isOwner) }

    if (version && version !== found.current_version && found.history?.[version]) {
      const hist = found.history[version]
      cardData = {
        ...cardData,
        current_version: version,
        articleContent: hist.articleContent,
        content_assets: hist.assets?.images ? hist.assets : found.content_assets
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

  public deleteCard(card_id: string, currentUser: UserInfo): { card_id: string } {
    const index = this.cards.findIndex((c) => c.card_id === card_id)
    if (index === -1) throw new Error('卡片不存在')
    const card = this.cards[index]
    const isOwner = currentUser.user_id === card.owner.user_id || currentUser.username === card.owner.username
    const isAdmin = currentUser.role === 'admin' || currentUser.username === 'admin'
    if (!isOwner && !isAdmin) {
      throw new Error('权限拒绝：您无权删除他人创建的卡片')
    }
    this.cards.splice(index, 1)
    this.saveCards()
    return { card_id }
  }

  public deleteSeason(season_id: number, currentUser?: UserInfo | null): { season_id: number } {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin'
    if (!isAdmin) {
      throw new Error('权限拒绝：需要管理员权限')
    }
    const index = this.seasons.findIndex((s) => s.season_id === season_id)
    if (index === -1) throw new Error('季度不存在')
    const seasonName = this.seasons[index].name
    this.seasons.splice(index, 1)
    this.saveSeasons()

    // Clean up cards belonging to deleted season
    this.cards = this.cards.filter((c) => c.season_tag !== seasonName)
    this.saveCards()
    return { season_id }
  }

  public resetToDefault() {
    this.cards = JSON.parse(JSON.stringify(DEFAULT_CARDS))
    this.seasons = JSON.parse(JSON.stringify(DEFAULT_SEASONS))
    this.saveCards()
    this.saveSeasons()
  }
}

export const mockDataService = new MockDataService()
