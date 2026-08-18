<script setup lang="ts">
import { Sparkles, Database, Shield, Layers } from 'lucide-vue-next'
</script>

<template>
  <footer class="footer-wrapper">
    <div class="container footer-content">
      <div class="footer-brand-col">
        <div class="footer-logo">
          <Sparkles class="brand-sparkle" :size="20" />
          <span class="footer-title">新番杂谈</span>
        </div>
        <p class="footer-desc">
          专为动漫撰稿人与爱好者打造的季度新番画廊与协作平台。支持版本追溯、ETag 本地缓存与 OBS 对象存储直传。
        </p>
      </div>

      <div class="footer-features-grid">
        <div class="feature-item">
          <Database class="feature-icon" :size="18" />
          <div>
            <h4>OBS 华为云直传</h4>
            <p>基于预签名通行证与不可变内容分发</p>
          </div>
        </div>
        <div class="feature-item">
          <Layers class="feature-icon" :size="18" />
          <div>
            <h4>多版本时间线</h4>
            <p>版本快照安全回滚与 SHA-256 完整性校对</p>
          </div>
        </div>
        <div class="feature-item">
          <Shield class="feature-icon" :size="18" />
          <div>
            <h4>权限与截止管控</h4>
            <p>季度番单候选机制与截稿时间锁</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container bottom-inner">
        <span>© 2026 新番杂谈 · All rights reserved.</span>
        <span class="tech-tag">Vue 3 + Vite + TypeScript + Pinia</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wrapper {
  margin-top: 6rem;
  background: rgba(11, 15, 25, 0.95);
  border-top: 1px solid var(--border-glass);
  padding-top: 3.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: 3rem;
  padding-bottom: 3rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.brand-sparkle {
  color: var(--accent-primary);
}

.footer-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
}

.footer-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 380px;
}

.footer-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  gap: 0.85rem;
}

.feature-icon {
  color: var(--accent-secondary);
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.feature-item h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.feature-item p {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.footer-bottom {
  border-top: 1px solid var(--border-subtle);
  padding: 1.25rem 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.bottom-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-tag {
  color: var(--accent-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
