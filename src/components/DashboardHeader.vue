<template>
  <header class="dashboard-header">
    <button @click="toggleSidebar" class="sidebar-toggle">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    
    <div class="header-actions">
      <button class="notification-btn" title="Thông báo">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span v-if="notificationCount > 0" class="notification-badge">{{ notificationCount }}</span>
      </button>
      
        <div class="user-menu">
          <img 
            v-if="currentUser?.avatarUrl"
            :src="currentUser.avatarUrl" 
            :alt="currentUser?.fullName || 'User'" 
            class="user-avatar" 
          />
          <div v-else class="user-avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        <div class="user-info">
          <span class="user-name">{{ currentUser?.fullName || 'Chủ trọ' }}</span>
          <span class="user-role">Quản lý</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)
const notificationCount = computed(() => 0) // TODO: Implement notification count

const toggleSidebar = () => {
  emit('toggle-sidebar')
}
</script>

<style scoped src="@/assets/css/DashboardHeader.css"></style>
