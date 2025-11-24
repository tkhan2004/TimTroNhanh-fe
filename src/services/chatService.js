import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Chat Service
 * Handles HTTP API calls for chat functionality
 */
class ChatService {
    /**
     * Create or find existing chat thread for a room
     * @param {number} roomId - Room ID
     * @returns {Promise} Thread response
     */
    async createOrFindThread(roomId) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.CHAT.THREADS, {
                roomId
            })
            return response.data
        } catch (error) {
            console.error('Error creating/finding thread:', error)
            throw this.handleError(error)
        }
    }

    /**
     * Get all chat threads (inbox) for current user
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Page size
     * @returns {Promise} Paginated threads
     */
    async getMyThreads(page = 0, size = 10) {
        try {
            const response = await apiClient.get(API_ENDPOINTS.CHAT.THREADS, {
                params: { page, size }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching threads:', error)
            throw this.handleError(error)
        }
    }

    /**
     * Get messages for a specific thread
     * @param {number} threadId - Thread ID
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Page size
     * @returns {Promise} Paginated messages
     */
    async getThreadMessages(threadId, page = 0, size = 50) {
        try {
            console.log('Fetching messages for thread:', threadId, 'page:', page)
            const response = await apiClient.get(
                API_ENDPOINTS.CHAT.THREAD_MESSAGES(threadId),
                {
                    params: { page, size }
                }
            )
            console.log('Messages response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching messages:', error)
            console.error('Error response:', error.response?.data)
            console.error('Request URL:', API_ENDPOINTS.CHAT.THREAD_MESSAGES(threadId))
            console.error('Request params:', { page, size })
            throw this.handleError(error)
        }
    }

    /**
     * Handle API errors
     * @param {Error} error - Error object
     * @returns {Error} Formatted error
     */
    handleError(error) {
        if (error.response) {
            const message = error.response.data?.message || 'Có lỗi xảy ra'
            return new Error(message)
        }
        return new Error('Không thể kết nối đến server')
    }
}

export const chatService = new ChatService()
export default chatService
