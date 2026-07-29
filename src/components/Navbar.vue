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
          <router-link to="/landlord" class="btn btn-warning navbar-btn post-btn">
            <Icon icon="ph:house-line-bold" class="btn-icon" />
            Bạn là chủ trọ?
          </router-link>
          
          <button @click="openLoginModal" class="btn btn-primary navbar-btn">
            <Icon icon="ph:sign-in-bold" class="btn-icon" />
            Đăng nhập
          </button>
        </div>

        <!-- Hiển thị khi đã đăng nhập -->
        <div v-else class="navbar-user">
          <router-link 
            v-if="isLandlord" 
            to="/post" 
            class="btn btn-warning navbar-btn post-btn"
          >
            <Icon icon="ph:plus-circle-bold" class="btn-icon" />
            Đăng tin
          </router-link>

          <div v-if="!isLandlord" class="user-actions">
            <router-link to="/chat" class="action-btn messages-btn" title="Tin nhắn">
              <Icon icon="ph:chat-circle-dots-bold" class="action-icon" />
            </router-link>
            <router-link to="/favorites" class="action-btn favorites-btn" title="Danh sách yêu thích">
              <Icon icon="ph:heart-bold" class="action-icon" />
            </router-link>
            <button class="action-btn notification-btn" title="Thông báo">
              <Icon icon="ph:bell-bold" class="action-icon" />
              <span class="notification-count">2</span>
            </button>
          </div>

          <div class="user-greeting">
            <span class="greeting-text">Chào, </span>
            <span class="user-name">{{ currentUser?.fullName }}</span>
            <span class="user-role">({{ isLandlord ? 'Chủ trọ' : 'Khách thuê' }})</span>
            <Icon icon="ph:caret-down-bold" class="dropdown-arrow" />
          </div>
          
          <div class="user-dropdown">
            <button v-if="isLandlord" @click="goToDashboard" class="dropdown-item">
              <Icon icon="ph:squares-four-bold" class="dropdown-icon" />
              Quản lý phòng
            </button>

            <router-link v-if="!isLandlord" to="/profile" class="dropdown-item">
              <Icon icon="ph:user-circle-bold" class="dropdown-icon" />
              Hồ sơ cá nhân
            </router-link>
            
            <button @click="handleLogout" class="dropdown-item logout">
              <Icon icon="ph:sign-out-bold" class="dropdown-icon" />
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
            <Icon icon="ph:house-line-bold" class="link-icon" />
            Bạn là chủ trọ?
          </router-link>
          
          <div v-if="!isLoggedIn" class="navbar-auth">
            <button @click="openLoginModal" class="btn btn-primary navbar-btn">Đăng nhập</button>
          </div>
        </div>
      </div>
    </transition>

    <Login :showModal="showLoginModal" @close="closeLoginModal" @switchToRegister="switchToRegister" />
    <Register :showModal="showRegisterModal" @close="closeRegisterModal" @switchToLogin="switchToLogin" />
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
    isHidden.value = true
  } else {
    isHidden.value = false
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
