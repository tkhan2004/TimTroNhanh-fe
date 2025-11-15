import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Utility Service
 * Xử lý các API liên quan đến tiện ích phòng
 */
export const utilityService = {
  /**
   * Lấy danh sách tất cả tiện ích
   * @returns {Promise<Object>} List of utilities
   */
  async getAllUtilities() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.UTILITIES.BASE)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách tiện ích')
    }
  },

  /**
   * Tạo tiện ích mới
   * @param {string} name - Utility name
   * @returns {Promise<Object>} Created utility response
   */
  async createUtility(name) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.UTILITIES.BASE, null, {
        params: { name }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể tạo tiện ích mới')
    }
  },

  /**
   * Cập nhật tiện ích
   * @param {number|string} id - Utility ID
   * @param {string} name - New utility name
   * @returns {Promise<Object>} Updated utility response
   */
  async updateUtility(id, name) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UTILITIES.BY_ID(id), null, {
        params: { name }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể cập nhật tiện ích')
    }
  },

  /**
   * Xóa tiện ích
   * @param {number|string} id - Utility ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteUtility(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.UTILITIES.BY_ID(id))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể xóa tiện ích')
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

