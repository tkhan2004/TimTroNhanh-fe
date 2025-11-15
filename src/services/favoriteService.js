import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Favorite Service
 * Xử lý các API liên quan đến yêu thích phòng
 */
export const favoriteService = {
  /**
   * Toggle favorite status của phòng
   * @param {number|string} roomId - Room ID
   * @returns {Promise<Object>} Response với isFavorited status
   */
  async toggleFavorite(roomId) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FAVORITES.TOGGLE(roomId))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể thay đổi trạng thái yêu thích')
    }
  },

  /**
   * Thêm phòng vào danh sách yêu thích
   * @param {number|string} roomId - Room ID
   * @returns {Promise<Object>} Response
   */
  async addToFavorites(roomId) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FAVORITES.ADD(roomId))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể thêm vào yêu thích')
    }
  },

  /**
   * Xóa phòng khỏi danh sách yêu thích
   * @param {number|string} roomId - Room ID
   * @returns {Promise<Object>} Response
   */
  async removeFromFavorites(roomId) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.FAVORITES.REMOVE(roomId))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể xóa khỏi yêu thích')
    }
  },

  /**
   * Lấy danh sách phòng yêu thích của user hiện tại
   * @param {Object} params - Pagination params
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDirection - Sort direction: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise<Object>} Paginated rooms response
   */
  async getMyFavorites(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.FAVORITES.MY_FAVORITES, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách yêu thích')
    }
  },

  /**
   * Xử lý lỗi từ API
   * @param {Error} error - Error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message)
    }
    if (error.message) {
      return new Error(error.message)
    }
    return new Error(defaultMessage)
  }
}

