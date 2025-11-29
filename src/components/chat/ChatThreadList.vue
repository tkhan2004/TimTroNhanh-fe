<template>
  <div class="chat-thread-list">
    <div class="thread-list-header">
      <h2>Tin nhắn</h2>
      <button v-if="!loading && threads.length > 0" @click="refresh" class="refresh-btn">
        <svg viewBox="0 0 24 24">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">Thử lại</button>
    </div>

    <div v-else-if="threads.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" class="empty-icon">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      <h3>Chưa có tin nhắn</h3>
      <p>Các cuộc trò chuyện sẽ hiển thị ở đây</p>
    </div>

    <div v-else class="thread-list">
      <div 
        v-for="thread in threads" 
        :key="thread.id"
        :class="['thread-item', { active: activeThreadId === thread.id }]"
        @click="selectThread(thread)"
      >
        <div class="avatar-container">
          <img 
            v-if="getOtherUserAvatar(thread)"
            :src="getOtherUserAvatar(thread)" 
            :alt="getOtherUserName(thread)"
            class="thread-avatar"
          />
          <div v-else class="thread-avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        
        <div class="thread-info">
          <div class="thread-header">
            <h4 class="thread-name">{{ getOtherUserName(thread) }}</h4>
            <span class="thread-time">{{ formatTime(thread.lastMessageAt || thread.createdAt) }}</span>
          </div>
          
          <div class="thread-preview">
            <p class="thread-room" v-if="thread.room">{{ thread.room.title }}</p>
            <p class="thread-message">{{ thread.lastMessage?.message || thread.lastMessage || 'Bắt đầu cuộc trò chuyện' }}</p>
          </div>
        </div>

        <div v-if="thread.unreadCount > 0" class="unread-badge">
          {{ thread.unreadCount }}
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? 'Đang tải...' : 'Xem thêm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import '@/assets/css/Chat.css';

const props = defineProps({
  threads: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  hasMore: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  activeThreadId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select-thread', 'load-more', 'refresh', 'retry'])

const authStore = useAuthStore()

const getOtherUser = (thread) => {
  if (!thread) return null
  
  // Backend trả về trực tiếp otherUser trong thread list
  if (thread.otherUser) {
    return thread.otherUser
  }
  
  // Fallback: tính toán từ renter/owner (cho trường hợp thread detail)
  const currentUserId = authStore.user?.id
  if (thread.renter?.id === currentUserId) {
    return thread.owner
  }
  return thread.renter
}

// Get other user name with fallbacks
const getOtherUserName = (thread) => {
  const user = getOtherUser(thread)
  if (!user) return 'Unknown'
  
  return user.fullName || user.name || user.email || 'Người dùng'
}

// Get other user avatar
const getOtherUserAvatar = (thread) => {
  const user = getOtherUser(thread)
  if (!user) return 'https://via.placeholder.com/48'
  
  return user.avatarUrl || user.avatar || null
}

const selectThread = (thread) => {
  emit('select-thread', thread)
}

const loadMore = () => {
  emit('load-more')
}

const refresh = () => {
  emit('refresh')
}

const retry = () => {
  emit('retry')
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins}p`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày`
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit'
  })
}
</script>

<style scoped>
@import '@/assets/css/Chat.css';
</style>
