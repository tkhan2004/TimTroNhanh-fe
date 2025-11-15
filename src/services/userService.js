import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * User Service
 * Xử lý các API liên quan đến user
 */
export const userService = {
  /**
   * Lấy thông tin profile của user hiện tại
   * @returns {Promise<Object>} User response
   */
  async getCurrentUserProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.PROFILE)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy thông tin người dùng')
    }
  },

  /**
   * Cập nhật profile của user hiện tại
   * @param {Object} userData - User data
   * @param {string} userData.fullName - Full name
   * @param {string} userData.email - Email
   * @param {string} userData.phone - Phone number
   * @param {string} userData.avatarUrl - Avatar URL
   * @param {string} userData.role - Role: 'RENTER' | 'OWNER' | 'ADMIN'
   * @returns {Promise<Object>} Updated user response
   */
  async updateCurrentUserProfile(userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.PROFILE, userData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể cập nhật thông tin người dùng')
    }
  },

  /**
   * Lấy thông tin user theo ID
   * @param {number|string} userId - User ID
   * @returns {Promise<Object>} User response
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(userId))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy thông tin người dùng')
    }
  },

  /**
   * Cập nhật thông tin user theo ID (admin only)
   * @param {number|string} userId - User ID
   * @param {Object} userData - User data (same structure as updateCurrentUserProfile)
   * @returns {Promise<Object>} Updated user response
   */
  async updateUserById(userId, userData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.USERS.BY_ID(userId), userData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể cập nhật thông tin người dùng')
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

