<template>
  <div :class="['chat-message', { 'own-message': isOwnMessage }]">
    <div class="message-avatar" v-if="!isOwnMessage">
      <div class="avatar-wrapper">
        <img 
          v-if="senderAvatar"
          :src="senderAvatar" 
          :alt="senderName"
        />
        <div v-else class="message-avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="message-content">
      <div class="message-header" v-if="!isOwnMessage">
        <span class="sender-name">{{ senderName }}</span>
      </div>
      
      <div class="message-bubble">
        <p class="message-text">{{ message.message || message.content }}</p>
        <span class="message-time">{{ formatTime(message.timestamp || message.sentAt) }}</span>
      </div>
    </div>

    <div class="message-avatar" v-if="isOwnMessage">
      <div class="avatar-wrapper">
        <img 
          v-if="senderAvatar"
          :src="senderAvatar" 
          :alt="senderName"
        />
        <div v-else class="message-avatar-placeholder">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const authStore = useAuthStore()

const isOwnMessage = computed(() => {
  return authStore.user && props.message.sender?.id === authStore.user.id
})

// Computed property for sender name with fallbacks
const senderName = computed(() => {
  // Try different possible field names from backend
  return props.message.sender?.fullName || 
         props.message.sender?.name || 
         props.message.senderName ||
         'Người dùng'
})

// Computed property for sender avatar with fallback
const senderAvatar = computed(() => {
  return props.message.sender?.avatarUrl || 
         props.message.sender?.avatar ||
         null
})

const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}
</script>

<style scoped>
@import '@/assets/css/Chat.css';
</style>
