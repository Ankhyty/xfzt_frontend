<script setup lang="ts">
import { Sparkles, Heart, Film } from 'lucide-vue-next'
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
          专为动漫撰稿人与爱好者打造的季度新番画廊与协作交流平台，收录当季热点新番评分、深度长评与精选剧照。
        </p>
      </div>

      <div class="footer-links-col">
        <div class="footer-tagline">
          <Film :size="16" class="tagline-icon" />
          <span>每一部新番，都值得被认真记录与品味</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container bottom-inner">
        <span>© 2026 新番杂谈 · All rights reserved.</span>
        <span class="tech-tag">Anime Chronicle Gallery</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wrapper {
  margin-top: 6rem;
  background: rgba(11, 15, 25, 0.95);
  border-top: 1px solid var(--border-glass);
  padding-top: 3rem;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3rem;
  padding-bottom: 2.5rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.brand-sparkle {
  color: var(--accent-primary);
}

.footer-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
}

.footer-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 480px;
}

.footer-tagline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.tagline-icon {
  color: var(--accent-secondary);
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
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>
