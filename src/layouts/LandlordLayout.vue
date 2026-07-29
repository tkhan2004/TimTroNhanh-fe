<template>
  <div class="landlord-layout">
    <!-- Header riêng cho chủ trọ -->
    <header class="landlord-header">
      <div class="header-container">
        
        <nav class="header-nav">
          <router-link to="/landlord" class="nav-link" :class="{ active: $route.name === 'Landlord' }">
            Đăng nhập / Đăng ký
          </router-link>
          <router-link 
            v-if="isLoggedIn && isLandlord" 
            to="/dashboard" 
            class="nav-link"
            :class="{ active: $route.path.startsWith('/dashboard') }"
          >
            Dashboard
          </router-link>
        </nav>

        <div class="header-actions">
          <router-link v-if="!isLoggedIn" to="/" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Về trang chủ
          </router-link>
          <div v-else-if="isLandlord" class="user-info">
            <span>Xin chào, {{ currentUser?.fullName }}</span>
            <router-link to="/dashboard" class="btn btn-primary">
              Vào Dashboard
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Error Alert -->
    <transition name="fade">
      <div v-if="showError" class="error-banner">
        <div class="error-content">
          <svg viewBox="0 0 24 24" class="error-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span class="error-text">{{ errorMessage }}</span>
          <button @click="closeError" class="error-close">×</button>
        </div>
      </div>
    </transition>

    <!-- Main Content -->
    <main class="landlord-main">
      <router-view />
    </main>

    <!-- Footer riêng cho chủ trọ -->
    <footer class="landlord-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Hỗ trợ chủ trọ</h4>
            <ul>
              <li><a href="#">Hướng dẫn đăng tin</a></li>
              <li><a href="#">Quy định đăng tin</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Liên hệ</h4>
            <ul>
              <li>Email: support@phongtro247.com</li>
              <li>Hotline: 1900 1234</li>
              <li>Giờ làm việc: 8:00 - 22:00</li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Về chúng tôi</h4>
            <ul>
              <li><router-link to="/about">Giới thiệu</router-link></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 PhongTro247. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isLandlord = computed(() => authStore.isLandlord)
const currentUser = computed(() => authStore.user)

// Error message từ query params
const errorMessage = ref('')
const showError = ref(false)

// Watch route changes để hiển thị error messages
watch(() => route.query, (newQuery) => {
  if (newQuery.error === 'access_denied' && newQuery.message) {
    errorMessage.value = decodeURIComponent(newQuery.message)
    showError.value = true
    
    setTimeout(() => {
      showError.value = false
      const { error, message, ...rest } = route.query
      router.replace({ query: rest })
    }, 5000)
  }
}, { immediate: true })

const closeError = () => {
  showError.value = false
  const { error, message, ...rest } = route.query
  router.replace({ query: rest })
}

// Restore session on mount
onMounted(() => {
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
})
</script>

<style scoped src="@/assets/css/LardlordLayout.css"></style>


