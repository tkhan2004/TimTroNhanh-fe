<template>
  <button 
    @click="handleClick" 
    class="chat-button"
    :disabled="loading"
  >
    <svg viewBox="0 0 24 24" class="chat-icon">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span v-if="!loading">{{ buttonText }}</span>
    <span v-else>Đang tải...</span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChat } from '@/composables/useChat'

const props = defineProps({
  roomId: {
    type: Number,
    required: true
  },
  ownerId: {
    type: Number,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Nhắn tin với chủ trọ'
  }
})

const emit = defineEmits(['chat-opened'])

const router = useRouter()
const authStore = useAuthStore()
const { createThread, initializeWebSocket } = useChat()

const loading = ref(false)

const handleClick = async () => {
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    // Redirect to login with return URL
    router.push({
      name: 'Home',
      query: { 
        login: 'true',
        returnUrl: router.currentRoute.value.fullPath
      }
    })
    return
  }

  // Check if user is the owner (can't chat with yourself)
  if (authStore.user && authStore.user.id === props.ownerId) {
    alert('Bạn không thể nhắn tin với chính mình')
    return
  }

  loading.value = true

  try {
    // Initialize WebSocket if not connected
    await initializeWebSocket()

    // Create or find thread
    const thread = await createThread(props.roomId)

    // Emit event to parent (can open modal or navigate)
    emit('chat-opened', thread)

    // Navigate to chat page with thread
    router.push({
      name: 'Chat',
      query: { threadId: thread.id }
    })
  } catch (error) {
    console.error('Error opening chat:', error)
    alert(error.message || 'Không thể mở chat')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chat-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.chat-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.chat-button:active:not(:disabled) {
  transform: translateY(0);
}

.chat-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
