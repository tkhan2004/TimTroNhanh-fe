<template>
  <div :class="['chat-message', { 'own-message': isOwnMessage }]">
    <div class="message-avatar" v-if="!isOwnMessage">
      <img 
        :src="senderAvatar" 
        :alt="senderName"
      />
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
      <img 
        :src="senderAvatar" 
        :alt="senderName"
      />
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
         'https://via.placeholder.com/40'
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
.chat-message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.chat-message.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.own-message .message-content {
  align-items: flex-end;
}

.message-header {
  margin-bottom: 0.25rem;
  padding: 0 0.75rem;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.message-bubble {
  background: #f3f4f6;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.own-message .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  display: block;
  font-size: 0.6875rem;
  margin-top: 0.25rem;
  opacity: 0.7;
}

.own-message .message-time {
  text-align: right;
}

/* Responsive */
@media (max-width: 768px) {
  .message-content {
    max-width: 80%;
  }
  
  .message-avatar img {
    width: 32px;
    height: 32px;
  }
}
</style>
