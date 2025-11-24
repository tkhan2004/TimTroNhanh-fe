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

<style scoped>
.landlord-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* Header */
.landlord-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #007bff;
  font-weight: 700;
  font-size: 1.25rem;
}

.header-logo img {
  height: 40px;
}

.header-nav {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.2s;
  position: relative;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.active {
  color: #007bff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #007bff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #666;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #007bff;
}

.back-link svg {
  width: 18px;
  height: 18px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Main Content */
.landlord-main {
  flex: 1;
}

/* Footer */
.landlord-footer {
  background: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 1.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #ffd700;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section ul li a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-section ul li a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* Error Banner */
.error-banner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.error-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }

  .header-nav {
    width: 100%;
    justify-content: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>

