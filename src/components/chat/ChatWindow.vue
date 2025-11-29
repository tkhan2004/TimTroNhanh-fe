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
        <div class="avatar-wrapper">
          <img 
            v-if="otherUserAvatar"
            :src="otherUserAvatar" 
            :alt="otherUserName"
            class="header-avatar"
          />
          <div v-else class="header-avatar-placeholder">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
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
  return otherUser.value.avatarUrl || 
         otherUser.value.avatar ||
         null
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
@import '@/assets/css/Chat.css';
</style>
