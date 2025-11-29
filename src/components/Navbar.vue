<template>
  <nav :class="['site-navbar', { 'navbar-scrolled': isScrolled, 'navbar-hidden': isHidden }]">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-logo">
          <img src="../assets/logo.png" alt="Thuê Trọ Logo" />
        </router-link>
      </div>

      <!-- Hamburger button for mobile -->
      <button class="navbar-hamburger" @click="toggleMenu" aria-label="Mở menu">
        <span :class="{'open': menuOpen}"></span>
        <span :class="{'open': menuOpen}"></span>
        <span :class="{'open': menuOpen}"></span>
      </button>

      <!-- Desktop menu -->
      <div class="navbar-menu desktop-only">
        <router-link to="/" class="navbar-link">Trang chủ</router-link>
        <router-link to="/rooms" class="navbar-link">Tìm phòng</router-link>
        <router-link to="/about" class="navbar-link">Về chúng tôi</router-link>
        <router-link to="/review" class="navbar-link">Review</router-link>
        <router-link to="/pr" class="navbar-link">Quảng cáo</router-link>
        <!-- Hiển thị khi chưa đăng nhập -->
        <div v-if="!isLoggedIn" class="navbar-auth">
          <!-- Nút đăng tin - yêu cầu đăng nhập -->
          <router-link to="/landlord" class="btn btn-warning navbar-btn post-btn">
            <svg viewBox="0 0 24 24" class="btn-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Bạn là chủ trọ?
          </router-link>
          
          <button @click="openLoginModal" class="btn btn-primary navbar-btn">
            Đăng nhập
          </button>
          <button @click="openRegisterModal" class="btn btn-secondary navbar-btn">
            Đăng ký
          </button>
        </div>

        <!-- Hiển thị khi đã đăng nhập -->
        <div v-else class="navbar-user">
          <!-- Nút đăng tin - chỉ OWNER mới thấy -->
          <router-link 
            v-if="isLandlord" 
            to="/post" 
            class="btn btn-warning navbar-btn post-btn"
          >
            <svg viewBox="0 0 24 24" class="btn-icon">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Đăng tin
          </router-link>

          <!-- Actions cho RENTER - chỉ khách thuê mới thấy -->
          <div v-if="!isLandlord" class="user-actions">
            <router-link to="/chat" class="action-btn messages-btn" title="Tin nhắn">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </router-link>
            <router-link to="/favorites" class="action-btn favorites-btn" title="Danh sách yêu thích">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
              </svg>
            </router-link>
            <button class="action-btn notification-btn" title="Thông báo">
              <svg viewBox="0 0 24 24" class="action-icon">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span class="notification-count">2</span>
            </button>
          </div>

          <div class="user-greeting">
            <span class="greeting-text">Chào, </span>
            <span class="user-name">{{ currentUser?.fullName }}</span>
            <span class="user-role">({{ isLandlord ? 'Chủ trọ' : 'Khách thuê' }})</span>
          </div>
          
          <div class="user-dropdown">
            <!-- Menu cho OWNER -->
            <button v-if="isLandlord" @click="goToDashboard" class="dropdown-item">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Quản lý phòng
            </button>
            
            <!-- Menu cho RENTER -->
            <router-link v-if="!isLandlord" to="/profile" class="dropdown-item">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Hồ sơ cá nhân
            </router-link>
            
            <button @click="handleLogout" class="dropdown-item logout">
              <svg viewBox="0 0 24 24" class="dropdown-icon">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3v1"/>
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Mobile menu overlay -->
    <transition name="fade">
      <div v-if="menuOpen" class="navbar-mobile-menu">
        <div class="navbar-mobile-content">
          <router-link to="/" class="navbar-link" @click="closeMenu">Trang chủ</router-link>
          <router-link to="/rooms" class="navbar-link" @click="closeMenu">Tìm phòng</router-link>
          <router-link to="/about" class="navbar-link" @click="closeMenu">Về chúng tôi</router-link>
          <router-link to="/landlord" class="navbar-link landlord-link" @click="closeMenu">
            <svg viewBox="0 0 24 24" class="link-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Bạn là chủ trọ?
          </router-link>
          
          <!-- Mobile auth buttons -->
          <div v-if="!isLoggedIn" class="navbar-auth">
            <!-- Nút đăng tin mobile - dẫn đến trang chủ trọ -->
            <router-link to="/landlord" class="btn btn-warning navbar-btn post-btn mobile-post-btn" @click="closeMenu">
              <svg viewBox="0 0 24 24" class="btn-icon">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Đăng tin
            </router-link>
            
            <button @click="openLoginModal" class="btn btn-primary navbar-btn">
              Đăng nhập
            </button>
            <button @click="openRegisterModal" class="btn btn-secondary navbar-btn">
              Đăng ký
            </button>
          </div>

          <!-- Mobile user menu -->
          <div v-else class="mobile-user-menu">
            <!-- Nút đăng tin cho landlord -->
            <router-link
              v-if="isLandlord"
              to="/post"
              class="btn btn-warning navbar-btn post-btn mobile-post-btn"
              @click="closeMenu"
            >
              <svg viewBox="0 0 24 24" class="btn-icon">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Đăng tin
            </router-link>
            <div class="user-greeting-mobile">
              <span class="greeting-text">Chào, {{ currentUser?.fullName }}</span>
            </div>
            
            <!-- Mobile actions for tenant -->
            <div v-if="!isLandlord" class="mobile-user-actions">
              <button class="action-btn favorites-btn" title="Danh sách yêu thích">
                <svg viewBox="0 0 24 24" class="action-icon">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>
                </svg>
                <span class="favorites-count">3</span>
              </button>
              <button class="action-btn notification-btn" title="Thông báo">
                <svg viewBox="0 0 24 24" class="action-icon">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="notification-count">2</span>
              </button>
            </div>

            <button v-if="isLandlord" @click="goToDashboard" class="mobile-menu-item">
              Dashboard
            </button>
            <button v-if="!isLandlord" class="mobile-menu-item">
              Danh sách yêu thích
            </button>
            <button class="mobile-menu-item">Hồ sơ</button>
            <button @click="handleLogout" class="mobile-menu-item logout">Đăng xuất</button>
          </div>
        </div>
        <div class="navbar-overlay" @click="closeMenu"></div>
      </div>
    </transition>

    <!-- Login Modal Component -->
    <Login
      :showModal="showLoginModal"
      @close="closeLoginModal"
      @switchToRegister="switchToRegister"
    />

    <!-- Register Modal Component -->
    <Register
      :showModal="showRegisterModal"
      @close="closeRegisterModal"
      @switchToLogin="switchToLogin"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from './Login.vue'
import Register from './Register.vue'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const showLoginModal = ref(false)
const showRegisterModal = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.user)
const isLandlord = computed(() => authStore.user?.role === 'landlord')

onMounted(() => {
  authStore.restoreSession()
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const lastScrollY = ref(window.scrollY)
const isScrolled = ref(false)
const isHidden = ref(false)

function handleScroll() {
  const currentY = window.scrollY
  isScrolled.value = currentY > 40
  if (currentY > lastScrollY.value && currentY > 80) {
    isHidden.value = true // Kéo xuống: ẩn
  } else {
    isHidden.value = false // Kéo lên: hiện
  }
  lastScrollY.value = currentY
}

const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu = () => { menuOpen.value = false }
const openLoginModal = () => {
  showLoginModal.value = true
  showRegisterModal.value = false
  closeMenu()
}
const openRegisterModal = () => {
  showRegisterModal.value = true
  showLoginModal.value = false
  closeMenu()
}
const closeLoginModal = () => { showLoginModal.value = false }
const closeRegisterModal = () => { showRegisterModal.value = false }
const switchToRegister = () => { closeLoginModal(); openRegisterModal() }
const switchToLogin = () => { closeRegisterModal(); openLoginModal() }
const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Home' })
  closeMenu()
}
const goToDashboard = () => {
  router.push({ name: 'DashboardOverview' })
  closeMenu()
}
</script>

<style scoped src="@/assets/css/Navbar.css"></style>
<style scoped>
.site-navbar {
  transition: background 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s cubic-bezier(.4,2,.6,1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  background: white;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.site-navbar.navbar-scrolled .navbar-container {
  padding: 4px 15px !important;
}
.site-navbar .navbar-container {
  transition: padding 0.35s cubic-bezier(.4,2,.6,1), min-height 0.35s cubic-bezier(.4,2,.6,1);
  padding: 18px 15px;
  min-height: 72px;
}
.site-navbar.navbar-scrolled .navbar-container {
  min-height: 44px;
  padding: 4px 15px !important;
}
.site-navbar.navbar-scrolled {
  background: rgba(255,255,255,0.97);
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
.site-navbar.navbar-hidden {
  transform: translateY(-100%);
  transition: transform 0.3s cubic-bezier(.4,2,.6,1);
}
.site-navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
}
.navbar-container {
  transition: padding 0.3s cubic-bezier(.4,2,.6,1);
  padding: 18px 15px;
}
.site-navbar.navbar-scrolled .navbar-container {
  padding: 6px 15px;
}
</style>
