<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useConfigStore } from '../../stores/config'
import {
  Sparkles,
  LayoutGrid,
  PenTool,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  SlidersHorizontal,
  Server,
  Zap
} from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'open-auth'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const isUserMenuOpen = ref(false)

function handleSwitchRole(role: 'guest' | 'author' | 'admin') {
  authStore.switchMockRole(role)
  isUserMenuOpen.value = false
}

function handleLogout() {
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/')
}
</script>

<template>
  <header class="navbar-wrapper">
    <div class="container navbar-inner">
      <!-- Left: Logo & Brand -->
      <router-link to="/" class="brand-logo">
        <div class="logo-icon-box">
          <Sparkles class="logo-icon" :size="22" />
        </div>
        <div class="brand-text">
          <span class="brand-title">新番杂谈</span>
          <span class="brand-subtitle">Anime Chronicle</span>
        </div>
      </router-link>

      <!-- Center: Navigation Links -->
      <nav class="nav-links">
        <router-link to="/" class="nav-item" active-class="active">
          <LayoutGrid :size="18" />
          <span>新番画廊</span>
        </router-link>
        <router-link to="/studio" class="nav-item" active-class="active">
          <PenTool :size="18" />
          <span>写稿创作台</span>
        </router-link>
        <router-link v-if="authStore.isLoggedIn" to="/profile" class="nav-item" active-class="active">
          <User :size="18" />
          <span>个人中心</span>
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" class="nav-item" active-class="active">
          <ShieldCheck :size="18" />
          <span>季度管理</span>
        </router-link>
      </nav>

      <!-- Right: Controls & User -->
      <div class="nav-actions">
        <!-- Mock Mode Toggle Pill -->
        <button
          class="mock-toggle-btn"
          :class="{ active: configStore.isMockMode }"
          :title="configStore.isMockMode ? '当前为演示 Mock 模式（离线可用）' : '当前连接真实后端'"
          @click="configStore.setMockMode(!configStore.isMockMode)"
        >
          <Zap v-if="configStore.isMockMode" :size="14" />
          <Server v-else :size="14" />
          <span>{{ configStore.isMockMode ? 'Mock 模式' : '真实后端' }}</span>
        </button>

        <!-- Auth / User Actions -->
        <template v-if="authStore.isLoggedIn && authStore.userInfo">
          <div class="user-dropdown-container">
            <button class="user-profile-btn" @click="isUserMenuOpen = !isUserMenuOpen">
              <div class="user-avatar">
                {{ (authStore.userInfo?.nickname || authStore.userInfo?.username || 'U').slice(0, 1) }}
              </div>
              <div class="user-info-text">
                <span class="user-name">{{ authStore.userInfo.nickname }}</span>
                <span class="user-badge" :class="authStore.role">{{ authStore.role === 'admin' ? '管理员' : '作者' }}</span>
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div v-if="isUserMenuOpen" class="user-dropdown glass-panel-strong animate-scale-in">
              <div class="dropdown-header">
                <p class="dropdown-username">@{{ authStore.userInfo.username }}</p>
                <p class="dropdown-role">当前角色：{{ authStore.role === 'admin' ? '系统管理员' : '撰稿作者' }}</p>
              </div>

              <router-link to="/profile" class="dropdown-item" @click="isUserMenuOpen = false">
                <User :size="16" />
                <span>进入个人中心</span>
              </router-link>

              <!-- Quick Role Switch in Mock Mode -->
              <div v-if="configStore.isMockMode" class="dropdown-mock-switch">
                <span class="switch-title"><SlidersHorizontal :size="12" /> 快速角色切换 (Mock)</span>
                <div class="role-btn-group">
                  <button
                    class="role-opt-btn"
                    :class="{ current: authStore.role === 'author' }"
                    @click="handleSwitchRole('author')"
                  >
                    作者
                  </button>
                  <button
                    class="role-opt-btn"
                    :class="{ current: authStore.role === 'admin' }"
                    @click="handleSwitchRole('admin')"
                  >
                    管理员
                  </button>
                  <button
                    class="role-opt-btn"
                    :class="{ current: authStore.role === 'guest' }"
                    @click="handleSwitchRole('guest')"
                  >
                    游客
                  </button>
                </div>
              </div>

              <div class="dropdown-divider"></div>

              <button class="dropdown-item danger" @click="handleLogout">
                <LogOut :size="16" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <button class="btn btn-primary btn-login" @click="emit('open-auth')">
            <LogIn :size="16" />
            <span>登录 / 注册</span>
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(9, 13, 22, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-glass);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-icon-box {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: var(--radius-sm);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-glow);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.active {
  color: #fff;
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mock-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--border-glass);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.mock-toggle-btn.active {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
  color: #34d399;
}

.user-dropdown-container {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.75rem 0.35rem 0.45rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.user-profile-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.user-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.1;
}

.user-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  margin-top: 2px;
}

.user-badge.admin {
  background: rgba(236, 72, 153, 0.2);
  color: #f472b6;
}

.user-badge.author {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 240px;
  padding: 0.85rem;
  z-index: 150;
}

.dropdown-header {
  margin-bottom: 0.65rem;
}

.dropdown-username {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.dropdown-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dropdown-mock-switch {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--radius-xs);
}

.switch-title {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.role-btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
}

.role-opt-btn {
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.role-opt-btn.current {
  background: var(--accent-primary);
  color: #fff;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 0.65rem 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.btn-login {
  padding: 0.5rem 1.15rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
}
</style>
