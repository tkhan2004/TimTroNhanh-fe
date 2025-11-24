<template>
  <div class="chat-window">
    <!-- Header -->
    <div class="chat-header">
      <button @click="$emit('close')" class="back-btn">
        <svg viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div class="chat-header-info" v-if="thread">
        <img 
          :src="otherUserAvatar" 
          :alt="otherUserName"
          class="header-avatar"
        />
        <div>
          <h3 class="header-title">{{ otherUserName }}</h3>
          <p class="header-subtitle" v-if="thread.room">{{ thread.room.title }}</p>
        </div>
      </div>

      <div class="connection-status" :class="{ connected: isConnected }">
        <span class="status-dot"></span>
        <span class="status-text">{{ isConnected ? 'Online' : 'Offline' }}</span>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loading" class="loading-messages">
        <div class="spinner"></div>
        <p>Đang tải tin nhắn...</p>
      </div>

      <div v-else-if="error" class="error-messages">
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">Thử lại</button>
      </div>

      <div v-else-if="messages.length === 0" class="empty-messages">
        <svg viewBox="0 0 24 24" class="empty-icon">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
        <p>Chưa có tin nhắn nào</p>
        <p class="empty-subtitle">Hãy bắt đầu cuộc trò chuyện!</p>
      </div>

      <div v-else class="messages-list">
        <ChatMessage 
          v-for="message in messages" 
          :key="message.id"
          :message="message"
        />
      </div>
    </div>

    <!-- Input -->
    <div class="chat-input">
      <textarea
        v-model="messageText"
        @keydown.enter.exact.prevent="handleSend"
        placeholder="Nhập tin nhắn..."
        rows="1"
        ref="inputRef"
        :disabled="sending || !isConnected"
      ></textarea>
      
      <button 
        @click="handleSend" 
        class="send-btn"
        :disabled="!messageText.trim() || sending || !isConnected"
      >
        <svg v-if="!sending" viewBox="0 0 24 24">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <div v-else class="spinner-small"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  thread: {
    type: Object,
    default: null
  },
  messages: {
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
  sending: {
    type: Boolean,
    default: false
  },
  isConnected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send-message', 'close', 'retry'])

const authStore = useAuthStore()
const messageText = ref('')
const messagesContainer = ref(null)
const inputRef = ref(null)

// Get the other user in the conversation
const otherUser = computed(() => {
  if (!props.thread) return null
  
  const currentUserId = authStore.user?.id
  const other = props.thread.renter?.id === currentUserId 
    ? props.thread.owner 
    : props.thread.renter
  
  return other
})

// Computed property for other user name with fallbacks
const otherUserName = computed(() => {
  if (!otherUser.value) return 'Chat'
  
  return otherUser.value.fullName || 
         otherUser.value.name || 
         otherUser.value.email ||
         'Người dùng'
})

// Computed property for other user avatar
const otherUserAvatar = computed(() => {
  if (!otherUser.value) return 'https://via.placeholder.com/40'
  
  return otherUser.value.avatarUrl || 
         otherUser.value.avatar ||
         'https://via.placeholder.com/40'
})

const handleSend = () => {
  if (!messageText.value.trim() || props.sending) return
  
  emit('send-message', messageText.value)
  messageText.value = ''
  
  // Focus back on input
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const retry = () => {
  emit('retry')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch messages and scroll to bottom
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

// Scroll to bottom on mount
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.back-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.header-subtitle {
  margin: 0;
  font-size: 0.8125rem;
  opacity: 0.9;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.connection-status.connected .status-dot {
  background: #10b981;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f9fafb;
}

.loading-messages,
.error-messages,
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  stroke: #d1d5db;
  fill: none;
  stroke-width: 1.5;
  margin-bottom: 1rem;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.messages-list {
  display: flex;
  flex-direction: column;
}

/* Input */
.chat-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.chat-input textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 0.9375rem;
  max-height: 120px;
  transition: border-color 0.2s;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #667eea;
}

.chat-input textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.send-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
