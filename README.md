# 新番杂谈协作写稿平台

前端项目，用于对接后端接口文档中的画廊、卡片、季度、身份认证和文件直传流程。

> [!NOTE]
> **关于第三方静默授权说明**：
> 第三方合作站点的免密静默授权接口（`POST /api/v1/auth/external/exchange`）为跨站嵌入的后端扩展接入规范（详见 [`API_file_08031832.md`](file:///e:/Code/xfzt_frontend/API_file_08031832.md) §1.4）。**本项目当前版本专注于独立 Web 端的完整业务实现，暂不包含第三方静默换票流程**。

---

## 项目目标

- 支持游客查看画廊和卡片详情
- 支持作者创建卡片、上传内容、提交版本、回滚版本和删除卡片
- 支持管理员维护季度、截止时间、番剧清单、季度导出和删除季度
- 支持 OBS 直传、版本缓存和 ETag 校对

## 角色说明

- **游客**：查看画廊、查看卡片详情、浏览季度列表
- **作者**：创建卡片、为自己负责的季度新增番剧名词条、上传内容、提交版本、回滚自己的卡片、删除自己的卡片
- **管理员**：拥有作者全部权限，并可新建季度、修改截止时间、整体更新番剧清单、导出季度内容、修改/删除任意卡片、删除季度

## 功能范围

- 用户注册 / 登录 / 当前身份查询（`/auth/me`）
- 查看画廊列表（支持按季度筛选、最新/评分/名称多维排序）
- 跨季度全局搜索（一键检索全部历史与特别企划季度）
- 查看卡片详情（支持多图 Lightbox 大图预览与 500+ 字深度长评）
- 个人中心（创作者多季度评测卡片聚合与动态统计）
- 写稿创作台（番剧模糊搜索匹配、下拉底部快速新建词条）
- 申请上传凭证并直传华为云 OBS（包含原图与缩略图双轨上传）
- 提交版本、版本历史回滚与删除卡片
- 季度管理（季度创建、截止时间设置、番单全量维护、季度导出 ZIP 与删除季度）
- 本地 ETag 缓存与 304 快速复用机制

## 接口依赖

### 1. 认证模块

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 当前身份查询
- *(扩展)* `POST /api/v1/auth/external/exchange` - 第三方静默授权换取 Token（后端跨站规范，当前前端未启用）

### 2. 画廊与卡片模块

- `GET /api/v1/gallery/items` - 画廊列表（支持 ETag 校对）
- `GET /api/v1/cards/:card_id/` - 查看卡片详情（支持历史版本查看与 ETag 校对）
- `POST /api/v1/cards` - 创建卡片
- `POST /api/v1/cards/:card_id/commit` - 提交版本
- `POST /api/v1/cards/:card_id/rollback` - 版本回滚
- `DELETE /api/v1/cards/:card_id` - 删除卡片

### 3. 上传模块

- `POST /api/v1/storage/presign-upload` - 申请上传凭证（预签名）

### 4. 季度模块

- `GET /api/v1/seasons` - 季度列表
- `POST /api/v1/seasons` - 新建季度（支持固定月份与自定义特辑）
- `PUT /api/v1/seasons/:season_id/deadline` - 设置截止时间（Unix 秒级时间戳）
- `PUT /api/v1/seasons/:season_id/animes` - 全量更新番剧清单
- `POST /api/v1/seasons/:season_id/animes` - 新建番剧名词条
- `GET /api/v1/seasons/:season_id/export` - 季度导出归档
- `DELETE /api/v1/seasons/:season_id` - 删除季度

## 接口对接要点

### 1. 认证与 Token

- 登录接口返回 `token`，后续需要认证的接口统一放在请求头 `Authorization: Bearer {token}`
- 游客可直接访问画廊列表、卡片详情和季度列表

### 2. 画廊列表与卡片详情缓存

- `GET /api/v1/gallery/items` 和 `GET /api/v1/cards/:card_id/` 都支持短缓存
- 响应会带 `Cache-Control: public, max-age=30`，并返回 `ETag`
- 前端应保存上次拿到的 ETag，并在下次请求时携带 `If-None-Match: "{etag}"`
- 如果后端返回 `304 Not Modified`，前端直接复用本地缓存结果

### 3. 卡片内容结构

- 正文文件固定为 `text/article.json`（包含 summary, score, content）
- 原图目录为 `images/`（`*.webp`）
- 缩略图目录为 `images_thumb/`（`*_thumb.webp`）
- 缩略图文件名统一使用“原图名 + `_thumb` 后缀”，例如 `images/cover.webp` 对应 `images_thumb/cover_thumb.webp`
- `content_assets` 中的图片清单需要同时包含原图和缩略图

### 4. 上传流程

上传采用“预签名 -> 直传 -> commit”的三段式流程：

1. 调用 `POST /api/v1/storage/presign-upload` 获取上传凭证
2. 后端返回每个文件的 `upload_url` 和请求头
3. 客户端使用 `PUT` 直传到 OBS
4. 所有文件上传成功后，调用 `POST /api/v1/cards/:card_id/commit`

### 5. 版本与校验

- 卡片详情返回 `current_version` 和 `all_version`
- 画廊列表和卡片详情都可以用 `ETag` 判断内容是否变化
- 前端应将当前版本号、本地缓存版本号和文件 SHA256 一并保存，用于完整性校验和快速复用

## 权限矩阵

| 操作 | 游客 | 作者 | 管理员 |
|---|---|---|---|
| 看画廊 / 卡片详情 / 季度列表 | ✅ | ✅ | ✅ |
| 注册 / 登录 | ✅ | ✅ | ✅ |
| 查看当前身份（`/auth/me`） | ❌ | ✅ | ✅ |
| 创建卡片 | ❌ | ✅ | ✅ |
| 新增单个番剧名词条 | ❌ | ✅ | ✅ |
| 整体替换季度番单 | ❌ | ❌ 403 | ✅ |
| 新建季度 / 设置截止时间 / 导出季度 | ❌ | ❌ 403 | ✅ |
| 上传 / commit / 回滚自己的卡片 | ❌ | ✅ | ✅ |
| 删除自己的卡片 | ❌ | ✅ | ✅ |
| 修改 / 删除他人卡片 | ❌ | ❌ 403 | ✅ |
| 删除季度 | ❌ | ❌ 403 | ✅ |
| 截稿后提交卡片 | — | ❌ 403 | ✅ 豁免 |

## OBS 存储约定

```
桶：at-trump（ap-southeast-3，公共读）
users/user_{用户ID}/cards/{卡片ID}/versions/{版本号}/
├── text/article.json      文字内容（固定名，内容为包含一句话简评、评分和正文三个部分）
├── images/
│   └── *.webp             原图（版本内唯一命名）
└── images_thumb/
    └── *_thumb.webp       缩略图（文件名为原图名 + `_thumb` 后缀）
```

- 前端引用图片时使用版本内相对路径
- 缩略图统一放在 `images_thumb/` 下，并与原图一一对应
- 上传前计算 SHA256，直传 PUT 时携带 `Cache-Control: public, max-age=31536000, immutable`
- 文件不可变（改内容即生成新版本新 URL）

## 频率限制

| 动作 | 涉及接口 | 额度 | 计数主体 |
|---|---|---|---|
| read | `GET /gallery/items`、`GET /cards/:id`、`GET /auth/me` | 100 次/小时 | 访客 IP |
| modify | `POST /storage/presign-upload` | 30 次/小时 | 个人 / 对公组共享 |
| submit | `POST /cards/:id/commit` | 10 次/小时 | 个人 / 对公组共享 |
| external_exchange *(扩展)* | `POST /auth/external/exchange` | 1000 次/小时 | 第三方应用（app） |
| external_exchange *(扩展)* | `POST /auth/external/exchange` | 10 次/分钟 | 单个外部用户 |

## 备注

- **关于第三方静默授权**：属于跨站接入规范，本项目当前版本暂不需要在前端实现该功能。
- **季度格式**：支持 `YYYY-MM`（月份 01/04/07/10）及自定义特辑标识（如 `2026-国漫特辑`）。
- **候选番单**：季度番剧清单是前端建卡时的候选来源，作者亦可在下拉框底部快捷新建番剧名词条。
- **数据导出**：由管理员触发，后端返回文件清单，前端自动使用 JSZip 下载并打包 ZIP 归档。
