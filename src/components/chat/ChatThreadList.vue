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
        <img 
          :src="getOtherUserAvatar(thread)" 
          :alt="getOtherUserName(thread)"
          class="thread-avatar"
        />
        
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
  
  return user.avatarUrl || user.avatar || 'https://via.placeholder.com/48'
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
.chat-thread-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.thread-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.thread-list-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.refresh-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn:hover {
  background: #f3f4f6;
}

.refresh-btn svg {
  width: 20px;
  height: 20px;
  stroke: #6b7280;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.loading-state,
.error-state,
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  width: 64px;
  height: 64px;
  stroke: #d1d5db;
  fill: none;
  stroke-width: 1.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
}

.thread-list {
  flex: 1;
  overflow-y: auto;
}

.thread-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.thread-item:hover {
  background: #f9fafb;
}

.thread-item.active {
  background: #eff6ff;
  border-left: 3px solid #667eea;
}

.thread-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.thread-info {
  flex: 1;
  min-width: 0;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.thread-name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-time {
  font-size: 0.75rem;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.thread-preview {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.thread-room {
  margin: 0;
  font-size: 0.75rem;
  color: #667eea;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-message {
  margin: 0;
  font-size: 0.8125rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  position: absolute;
  top: 50%;
  right: 1.5rem;
  transform: translateY(-50%);
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.load-more {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
}

.load-more button {
  padding: 0.5rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.load-more button:hover:not(:disabled) {
  background: #e5e7eb;
}

.load-more button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Scrollbar */
.thread-list::-webkit-scrollbar {
  width: 6px;
}

.thread-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.thread-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.thread-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
