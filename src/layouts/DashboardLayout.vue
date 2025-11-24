<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
        <h3 v-if="!sidebarCollapsed" class="sidebar-title">Quản lý trọ</h3>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.name"
          :to="{ name: item.route }"
          class="nav-item"
          :class="{ active: $route.name === item.route }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span v-if="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn">
          <LogOutIcon class="nav-icon" />
          <span v-if="!sidebarCollapsed">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="dashboard-main">
      <!-- Top Header -->
      <DashboardHeader @toggle-sidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="dashboard-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardHeader from '@/components/DashboardHeader.vue'
import { 
  HomeIcon, 
  BuildingIcon, 
  UsersIcon, 
  CreditCardIcon, 
  BarChartIcon,
  MenuIcon,
  BellIcon,
  LogOutIcon,
  PlusIcon
} from '@/components/icons'

const router = useRouter()
const authStore = useAuthStore()

/** Sidebar state */
const sidebarCollapsed = ref(false)

/** Menu items - chỉ hiển thị cho OWNER */
const menuItems = computed(() => {
  const items = [
    { label: 'Tổng quan', route: 'DashboardOverview', icon: 'HomeIcon' },
    { label: 'Đăng tin mới', route: 'PostRoom', icon: 'PlusIcon' },
    { label: 'Quản lý phòng', route: 'RoomManagement', icon: 'BuildingIcon' },
    { label: 'Tin nhắn', route: 'Messages', icon: 'MessageIcon' }
  ]
  
  // Chỉ ADMIN mới thấy Analytics
  if (authStore.isAdmin) {
    items.push({ label: 'Thống kê', route: 'Analytics', icon: 'BarChartIcon' })
  }
  
  return items
})

/** Current user */
const currentUser = computed(() => authStore.user)

/** Toggle sidebar */
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

/** Logout function */
const logout = async () => {
  await authStore.logout()
  router.push({ name: 'Home' })
}

/** Check if user has access */
onMounted(() => {
  // Restore session
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
  
  // Nếu không phải OWNER/ADMIN, redirect về home
  if (authStore.isLoggedIn && !authStore.isLandlord && !authStore.isAdmin) {
    router.push({ 
      name: 'Home',
      query: { 
        error: 'access_denied',
        message: 'Bạn không có quyền truy cập dashboard. Chỉ chủ trọ mới có thể quản lý phòng.'
      }
    })
  }
})
</script>

<style scoped src="@/assets/css/DashboardLayout.css"></style>
