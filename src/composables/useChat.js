import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { chatService } from '@/services/chatService'
import { websocketService } from '@/services/websocketService'

/**
 * Chat Composable
 * Manages chat state and WebSocket connection
 */
export function useChat() {
    const authStore = useAuthStore()

    // State
    const connected = ref(false)
    const currentThread = ref(null)
    const messages = ref([])
    const threads = ref([])
    const loading = ref(false)
    const error = ref(null)
    const sending = ref(false)

    // Pagination
    const currentPage = ref(0)
    const hasMore = ref(true)

    /**
     * Initialize WebSocket connection
     */
    const initializeWebSocket = async () => {
        if (!authStore.isLoggedIn || !authStore.token) {
            console.log('User not logged in, skipping WebSocket connection')
            return
        }

        try {
            await websocketService.connect(authStore.token)
            connected.value = true

            // Listen for incoming messages
            websocketService.onMessage((message) => {
                handleIncomingMessage(message)
            })

            // Listen for connection changes
            websocketService.onConnectionChange((isConnected) => {
                connected.value = isConnected
            })
        } catch (err) {
            console.error('Failed to connect WebSocket:', err)
            error.value = 'Không thể kết nối chat'
        }
    }

    /**
     * Handle incoming WebSocket message
     */
    const handleIncomingMessage = (message) => {
        // Add to messages if it belongs to current thread
        if (currentThread.value && message.threadId === currentThread.value.id) {
            // Check if message already exists (avoid duplicates)
            const exists = messages.value.some(m => m.id === message.id)
            if (!exists) {
                messages.value.push(message)
            }
        }

        // Update thread list (move to top, update last message)
        updateThreadList(message)
    }

    /**
     * Update thread list with new message
     */
    const updateThreadList = (message) => {
        const threadIndex = threads.value.findIndex(t => t.id === message.threadId)
        if (threadIndex > -1) {
            const thread = threads.value[threadIndex]
            // Handle both 'message' and 'content' fields
            thread.lastMessage = message.message || message.content
            // Handle both 'timestamp' and 'sentAt' fields
            thread.lastMessageAt = message.timestamp || message.sentAt

            // Move to top
            threads.value.splice(threadIndex, 1)
            threads.value.unshift(thread)
        }
    }

    /**
     * Create or find chat thread for a room
     */
    const createThread = async (roomId) => {
        loading.value = true
        error.value = null

        try {
            const response = await chatService.createOrFindThread(roomId)
            currentThread.value = response.data

            // Load messages for this thread
            await loadMessages(response.data.id)

            return response.data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Load chat threads (inbox)
     */
    const loadThreads = async (page = 0) => {
        loading.value = true
        error.value = null

        try {
            const response = await chatService.getMyThreads(page, 20)

            if (page === 0) {
                threads.value = response.data.content
            } else {
                threads.value.push(...response.data.content)
            }

            hasMore.value = !response.data.last
            currentPage.value = page
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    /**
     * Load messages for a thread
     */
    const loadMessages = async (threadId, page = 0) => {
        loading.value = true
        error.value = null

        try {
            const response = await chatService.getThreadMessages(threadId, page, 50)

            // Messages are sorted DESC (newest first), reverse for display
            const newMessages = response.data.content.reverse()

            if (page === 0) {
                messages.value = newMessages
            } else {
                messages.value.unshift(...newMessages)
            }

            hasMore.value = !response.data.last
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    /**
     * Send a message
     */
    const sendMessage = async (content) => {
        if (!currentThread.value) {
            throw new Error('No active thread')
        }

        if (!content || !content.trim()) {
            throw new Error('Message cannot be empty')
        }

        sending.value = true
        error.value = null

        try {
            const messageData = {
                threadId: currentThread.value.id,
                message: content.trim()  // Changed from 'content' to 'message'
            }

            // Send via WebSocket
            websocketService.sendMessage(messageData)

            // Note: The message will be added to the list when we receive it back from WebSocket
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            sending.value = false
        }
    }

    /**
     * Select a thread
     */
    const selectThread = async (thread) => {
        currentThread.value = thread
        await loadMessages(thread.id)
    }

    /**
     * Clear current thread
     */
    const clearThread = () => {
        currentThread.value = null
        messages.value = []
    }

    // Computed
    const isConnected = computed(() => connected.value)
    const hasActiveThread = computed(() => currentThread.value !== null)

    // Lifecycle - Only disconnect on unmount
    onUnmounted(() => {
        websocketService.disconnect()
    })

    return {
        // State
        connected: isConnected,
        currentThread,
        messages,
        threads,
        loading,
        error,
        sending,
        hasActiveThread,
        hasMore,

        // Methods
        initializeWebSocket,
        createThread,
        loadThreads,
        loadMessages,
        sendMessage,
        selectThread,
        clearThread
    }
}

export default useChat
