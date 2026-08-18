<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import { loginApi, registerApi } from '../../api/auth'
import { X, LogIn, UserPlus, Lock, User, Sparkles } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const toastStore = useToastStore()

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const nickname = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  if (!username.value.trim() || !password.value.trim()) {
    toastStore.warning('请填写用户名和密码')
    return
  }

  isSubmitting.value = true
  try {
    if (isLoginMode.value) {
      const res = await loginApi(username.value.trim(), password.value)
      authStore.setAuth(res.token, res.user_info)
      toastStore.success(`欢迎回来，${res.user_info.nickname}！`)
      emit('close')
    } else {
      const regRes = await registerApi(username.value.trim(), password.value, nickname.value.trim() || undefined)
      toastStore.success('注册成功！正在为您自动登录...')
      // Auto login after register
      const loginRes = await loginApi(username.value.trim(), password.value)
      authStore.setAuth(loginRes.token, loginRes.user_info)
      emit('close')
    }
  } catch (e: any) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container glass-panel-strong animate-scale-in">
      <button class="modal-close-btn" @click="emit('close')">
        <X :size="20" />
      </button>

      <div class="modal-header">
        <div class="modal-icon-badge">
          <Sparkles :size="24" />
        </div>
        <h3 class="modal-title">{{ isLoginMode ? '登录到新番杂谈' : '注册作者账号' }}</h3>
        <p class="modal-desc">
          {{ isLoginMode ? '登录后可撰写新番长评、管理卡片多版本与直传素材' : '加入协作写稿平台，与动漫同好共同评测每季新番' }}
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">用户名 (全局唯一)</label>
          <div class="input-with-icon">
            <User class="field-icon" :size="18" />
            <input
              v-model="username"
              type="text"
              class="form-input with-icon"
              placeholder="请输入用户名 (如 writer_a)"
              required
            />
          </div>
        </div>

        <div v-if="!isLoginMode" class="form-group">
          <label class="form-label">显示昵称 (可选)</label>
          <div class="input-with-icon">
            <Sparkles class="field-icon" :size="18" />
            <input
              v-model="nickname"
              type="text"
              class="form-input with-icon"
              placeholder="例如：阿莉"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="input-with-icon">
            <Lock class="field-icon" :size="18" />
            <input
              v-model="password"
              type="password"
              class="form-input with-icon"
              placeholder="请输入密码"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary submit-btn" :disabled="isSubmitting">
          <LogIn v-if="isLoginMode" :size="18" />
          <UserPlus v-else :size="18" />
          <span>{{ isSubmitting ? '正在处理...' : (isLoginMode ? '立即登录' : '创建账号') }}</span>
        </button>
      </form>

      <div class="auth-toggle">
        <span>{{ isLoginMode ? '还没有账号？' : '已有账号？' }}</span>
        <button class="toggle-link" @click="isLoginMode = !isLoginMode">
          {{ isLoginMode ? '免费注册作者账号' : '直接登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-container {
  width: 100%;
  max-width: 440px;
  padding: 2.25rem;
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: var(--text-muted);
  padding: 0.35rem;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);
}

.modal-close-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.modal-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.modal-icon-badge {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-glow);
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.modal-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.input-with-icon {
  position: relative;
}

.field-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.form-input.with-icon {
  padding-left: 2.85rem;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.auth-toggle {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.toggle-link {
  color: var(--accent-primary);
  font-weight: 600;
  margin-left: 0.35rem;
}

.toggle-link:hover {
  text-decoration: underline;
}
</style>
