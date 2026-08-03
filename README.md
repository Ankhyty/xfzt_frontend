# 新番杂谈网站

前端项目，用于对接后端接口文档中的画廊、卡片、季度和上传流程。

## 项目目标

- 支持游客查看画廊和卡片详情
- 支持作者创建卡片、上传内容、提交版本和回滚版本
- 支持管理员维护季度、截止时间、番剧清单和季度导出
- 支持 OBS 直传、版本缓存和 ETag 校对

## 角色说明

- 游客：查看画廊、查看卡片详情、浏览季度列表
- 作者：创建卡片、为自己负责的季度新增番剧名词条、上传内容、提交版本、回滚自己的卡片
- 管理员：拥有作者权限，并可新建季度、修改截止时间、整体更新番剧清单、导出季度内容、修改任意卡片

## 功能范围

- 用户登录 / 注册
- 查看画廊列表
- 按季度筛选卡片
- 查看卡片详情
- 创建卡片
- 申请上传凭证并直传 OBS
- 提交版本和回滚版本
- 季度列表、季度创建、截止时间设置、番剧清单维护
- 季度导出
- 本地缓存与 ETag 校对

## 接口依赖

### 认证

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### 画廊与卡片

- `GET /api/v1/gallery/items`
- `GET /api/v1/cards/:card_id/`
- `POST /api/v1/cards`
- `POST /api/v1/cards/:card_id/commit`
- `POST /api/v1/cards/:card_id/rollback`

### 上传

- `POST /api/v1/storage/presign-upload`

### 季度

- `GET /api/v1/seasons`
- `POST /api/v1/seasons`
- `PUT /api/v1/seasons/:season_id/deadline`
- `PUT /api/v1/seasons/:season_id/animes`
- `POST /api/v1/seasons/:season_id/animes`
- `GET /api/v1/seasons/:season_id/export`

## 接口对接要点

### 1. 认证

- 登录接口返回 `token`，后续需要认证的接口统一放在请求头 `Authorization: Bearer {token}`
- 游客可直接访问画廊列表、卡片详情和季度列表

### 2. 画廊列表与卡片详情缓存

- `GET /api/v1/gallery/items` 和 `GET /api/v1/cards/:card_id/` 都支持短缓存
- 响应会带 `Cache-Control: public, max-age=30`
- 前端应保存上次拿到的 ETag，并在下次请求时携带 `If-None-Match`
- 如果后端返回 `304 Not Modified`，前端直接复用本地缓存结果

### 3. 卡片内容结构

- 正文文件固定为 `text/article.json`
- 图片目录为 `images/`
- 缩略图目录为 `images_thumb/`
- 缩略图文件名统一使用“原图名 + `_thumb` 后缀”，例如 `images/cover.webp` 对应 `images_thumb/cover_thumb.webp`
- `content_assets` 中的图片清单需要同时包含原图和缩略图

### 4. 上传流程

上传采用“预签名 -> 直传 -> commit”的三段式流程：

1. 调用 `POST /api/v1/storage/presign-upload`
2. 后端返回每个文件的 `upload_url` 和请求头
3. 客户端使用 `PUT` 直传到 OBS
4. 所有文件上传成功后，调用 `POST /api/v1/cards/:card_id/commit`

### 5. 文件类型约定

- 正文：`text/article.json`，`Content-Type: application/json`
- 原图：`images/*.webp`，`Content-Type: image/webp`
- 缩略图：`images_thumb/*_thumb.webp`，`Content-Type: image/webp`

### 6. 版本与校验

- 卡片详情返回 `current_version` 和 `all_version`
- 画廊列表和卡片详情都可以用 `ETag` 判断内容是否变化
- 前端应将当前版本号、本地缓存版本号和文件 SHA256 一并保存，用于完整性校验和快速复用

## 权限矩阵

| 操作 | 游客 | 作者 | 管理员 |
|---|---|---|---|
| 看画廊 / 卡片详情 / 季度列表 | ✅ | ✅ | ✅ |
| 注册 / 登录 | ✅ | ✅ | ✅ |
| 创建卡片 | ❌ | ✅ | ✅ |
| 新增单个番剧名词条 | ❌ | ✅ | ✅ |
| 整体替换季度番单 | ❌ | ❌ | ✅ |
| 新建季度 / 设置截止时间 / 导出季度 | ❌ | ❌ | ✅ |
| 上传 / commit / 回滚自己的卡片 | ❌ | ✅ | ✅ |
| 修改他人卡片 | ❌ | ❌ | ✅ |

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
- 上传前建议先算 SHA256，下载后用清单哈希校验
- 文件不可变，改内容即生成新版本新 URL

## 频率限制

| 动作 | 涉及接口 | 额度 | 计数主体 |
|---|---|---|---|
| read | gallery/items | 100 次/小时 | 访客 IP |
| modify | presign-upload | 30 次/小时 | 个人 / 对公组共享 |
| submit | commit | 10 次/小时 | 个人 / 对公组共享 |

## 备注

- 季度名格式为 `YYYY-MM`，月份只能是 `01/04/07/10`
- 季度番剧清单是前端建卡时的唯一候选来源
- 季度导出由管理员触发，后端返回文件清单，前端自行下载或组包
