import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Favorites Service
 * Handle favorite rooms operations
 */
export const favoritesService = {
    /**
     * Get user's favorite rooms
     * @returns {Promise} List of favorite rooms
     */
    async getMyFavorites() {
        try {
            const response = await apiClient.get(API_ENDPOINTS.FAVORITES.MY_FAVORITES)
            return response.data
        } catch (error) {
            console.error('Error fetching favorites:', error)
            throw error
        }
    },

    /**
     * Toggle favorite status for a room
     * @param {number} roomId - Room ID
     * @returns {Promise} Updated favorite status
     */
    async toggleFavorite(roomId) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FAVORITES.TOGGLE(roomId))
            return response.data
        } catch (error) {
            console.error('Error toggling favorite:', error)
            throw error
        }
    },

    /**
     * Add room to favorites
     * @param {number} roomId - Room ID
     * @returns {Promise} Success response
     */
    async addFavorite(roomId) {
        try {
            const response = await apiClient.post(API_ENDPOINTS.FAVORITES.ADD(roomId))
            return response.data
        } catch (error) {
            console.error('Error adding favorite:', error)
            throw error
        }
    },

    /**
     * Remove room from favorites
     * @param {number} roomId - Room ID
     * @returns {Promise} Success response
     */
    async removeFavorite(roomId) {
        try {
            const response = await apiClient.delete(API_ENDPOINTS.FAVORITES.REMOVE(roomId))
            return response.data
        } catch (error) {
            console.error('Error removing favorite:', error)
            throw error
        }
    }
}

export default favoritesService
