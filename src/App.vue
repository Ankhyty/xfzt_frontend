<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import Toast from './components/layout/Toast.vue'
import AuthModal from './components/auth/AuthModal.vue'

const isAuthModalOpen = ref(false)
</script>

<template>
  <div class="app-shell">
    <Navbar @open-auth="isAuthModalOpen = true" />
    
    <div class="app-content-viewport">
      <router-view @open-auth="isAuthModalOpen = true" />
    </div>

    <Footer />
    <Toast />
    <AuthModal v-if="isAuthModalOpen" @close="isAuthModalOpen = false" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content-viewport {
  flex: 1;
}
</style>
