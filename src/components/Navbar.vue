<template>
  <nav :class="['site-navbar', { 'navbar-scrolled': isScrolled, 'navbar-hidden': isHidden }]">
    <div class="navbar-container">
      <!-- 1. Left Column: Logo -->
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

      <!-- 2. Center Column: Category Links -->
      <div class="navbar-menu desktop-only">
        <router-link to="/" class="navbar-link">Trang chủ</router-link>
        <router-link to="/rooms" class="navbar-link">Tìm phòng</router-link>
        <router-link to="/about" class="navbar-link">Về chúng tôi</router-link>
        <router-link to="/review" class="navbar-link">Review</router-link>
        <router-link to="/pr" class="navbar-link">Quảng cáo</router-link>
      </div>

      <!-- 3. Right Column: 2 Action Buttons -->
      <div class="navbar-actions desktop-only">
        <!-- Hiển thị khi chưa đăng nhập (2 Buttons: Chủ trọ + Đăng nhập) -->
        <div v-if="!isLoggedIn" class="navbar-auth">
          <router-link to="/landlord" class="btn btn-warning navbar-btn post-btn">
            <Icon icon="ph:house-line-bold" class="btn-icon" />
            <span>Bạn là chủ trọ?</span>
          </router-link>
          
          <button @click="openLoginModal" class="btn btn-primary navbar-btn">
            <Icon icon="ph:sign-in-bold" class="btn-icon" />
            <span>Đăng nhập</span>
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
            <span>Đăng tin</span>
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
              <span v-if="unreadNotificationsCount > 0" class="notification-count">{{ unreadNotificationsCount }}</span>
            </button>
          </div>

          <div class="user-greeting">
            <span class="user-name">{{ userDisplayName }}</span>
            <span class="user-role">{{ userRoleBadge }}</span>
            <Icon icon="ph:caret-down-bold" class="dropdown-arrow" />
          </div>

          <!-- Dropdown menu -->
          <div class="user-dropdown">
            <router-link to="/profile" class="dropdown-item">
              <Icon icon="ph:user-circle-bold" class="dropdown-icon" />
              Trang cá nhân
            </router-link>

            <router-link v-if="isLandlord" to="/dashboard/rooms" class="dropdown-item">
              <Icon icon="ph:house-line-bold" class="dropdown-icon" />
              Quản lý tin đăng
            </router-link>

            <button @click="logout" class="dropdown-item logout">
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

const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const menuOpen = ref(false)
const isScrolled = ref(false)
const isHidden = ref(false)
const unreadNotificationsCount = ref(2)
let lastScrollPosition = 0

const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.currentUser)

const userDisplayName = computed(() => {
  if (!currentUser.value) return ''
  return currentUser.value.fullName || currentUser.value.email || 'Người dùng'
})

const isLandlord = computed(() => {
  if (!currentUser.value) return false
  return currentUser.value.role === 'ROLE_LANDLORD' || currentUser.value.roles?.includes('ROLE_LANDLORD')
})

const userRoleBadge = computed(() => {
  return isLandlord.value ? 'Chủ nhà' : 'Khách thuê'
})

const openLoginModal = () => {
  showLoginModal.value = true
  showRegisterModal.value = false
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const openRegisterModal = () => {
  showRegisterModal.value = true
  showLoginModal.value = false
}

const closeRegisterModal = () => {
  showRegisterModal.value = false
}

const switchToRegister = () => {
  showLoginModal.value = false
  showRegisterModal.value = true
}

const switchToLogin = () => {
  showRegisterModal.value = false
  showLoginModal.value = true
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop
  isScrolled.value = currentScrollPosition > 50

  if (currentScrollPosition > 150) {
    isHidden.value = currentScrollPosition > lastScrollPosition
  } else {
    isHidden.value = false
  }

  lastScrollPosition = currentScrollPosition
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped src="@/assets/css/Navbar.css"></style>
