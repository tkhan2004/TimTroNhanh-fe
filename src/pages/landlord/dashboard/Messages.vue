<template>
  <div class="messages-page">
    <div class="messages-container">
      <!-- Thread List (Inbox) -->
      <div class="threads-panel">
        <ChatThreadList
          :threads="threads"
          :loading="loading"
          :error="error"
          :has-more="hasMore"
          :loading-more="loadingMore"
          :active-thread-id="currentThread?.id"
          @select-thread="handleSelectThread"
          @load-more="handleLoadMore"
          @refresh="handleRefresh"
          @retry="handleRetry"
        />
      </div>

      <!-- Chat Window -->
      <div class="chat-panel">
        <ChatWindow
          v-if="currentThread"
          :thread="currentThread"
          :messages="messages"
          :loading="messagesLoading"
          :error="messagesError"
          :sending="sending"
          :is-connected="connected"
          @send-message="handleSendMessage"
          @close="handleClose"
          @retry="handleRetryMessages"
        />

        <div v-else class="no-thread-selected">
          <svg viewBox="0 0 24 24" class="no-thread-icon">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <h2>Chọn một cuộc trò chuyện</h2>
          <p>Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatThreadList from '@/components/chat/ChatThreadList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'

const {
  connected,
  currentThread,
  messages,
  threads,
  loading,
  error,
  sending,
  hasMore,
  initializeWebSocket,
  loadThreads,
  loadMessages,
  sendMessage,
  selectThread,
  clearThread
} = useChat()

const messagesLoading = ref(false)
const messagesError = ref(null)
const loadingMore = ref(false)
const currentPage = ref(0)

const handleSelectThread = async (thread) => {
  messagesLoading.value = true
  messagesError.value = null
  
  try {
    await selectThread(thread)
  } catch (err) {
    messagesError.value = err.message
  } finally {
    messagesLoading.value = false
  }
}

const handleSendMessage = async (content) => {
  try {
    await sendMessage(content)
  } catch (err) {
    console.error('Error sending message:', err)
  }
}

const handleClose = () => {
  clearThread()
}

const handleLoadMore = async () => {
  loadingMore.value = true
  try {
    currentPage.value++
    await loadThreads(currentPage.value)
  } catch (err) {
    console.error('Error loading more threads:', err)
  } finally {
    loadingMore.value = false
  }
}

const handleRefresh = async () => {
  currentPage.value = 0
  await loadThreads(0)
}

const handleRetry = async () => {
  await loadThreads(currentPage.value)
}

const handleRetryMessages = async () => {
  if (currentThread.value) {
    messagesLoading.value = true
    try {
      await loadMessages(currentThread.value.id)
    } catch (err) {
      messagesError.value = err.message
    } finally {
      messagesLoading.value = false
    }
  }
}

onMounted(async () => {
  // Initialize WebSocket
  await initializeWebSocket()
  
  // Load threads
  await loadThreads(0)
})
</script>

<style scoped>
.messages-page {
  height: calc(100vh - 80px);
  padding: 1.5rem;
  background: #f9fafb;
}

.messages-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.threads-panel,
.chat-panel {
  height: 100%;
  overflow: hidden;
}

.no-thread-selected {
  height: 100%;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.no-thread-icon {
  width: 80px;
  height: 80px;
  stroke: #d1d5db;
  fill: none;
  stroke-width: 1.5;
  margin-bottom: 1.5rem;
}

.no-thread-selected h2 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.no-thread-selected p {
  margin: 0;
  color: #6b7280;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .messages-container {
    grid-template-columns: 1fr;
  }
  
  .threads-panel {
    display: none;
  }
  
  .chat-panel.has-thread .threads-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .messages-page {
    padding: 0;
  }
  
  .messages-container {
    gap: 0;
  }
}
</style>
