import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Report Service
 * Xử lý các API liên quan đến báo cáo/tố cáo
 */
export const reportService = {
  /**
   * Tạo báo cáo mới
   * @param {Object} reportData - Report data
   * @param {number} reportData.roomId - Room ID (required)
   * @param {string} reportData.reason - Reason for report (required)
   * @returns {Promise<Object>} Created report response
   */
  async createReport(reportData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REPORTS.BASE, reportData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể tạo báo cáo')
    }
  },

  /**
   * Lấy danh sách báo cáo (admin only)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDirection - Sort direction: 'asc' | 'desc' (default: 'desc')
   * @param {string} params.status - Status filter: 'PENDING' | 'RESOLVED'
   * @returns {Promise<Object>} Paginated reports response
   */
  async getAllReports(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.REPORTS.ADMIN_BASE, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách báo cáo')
    }
  },

  /**
   * Cập nhật trạng thái báo cáo (admin only)
   * @param {number|string} id - Report ID
   * @param {string} status - New status: 'PENDING' | 'RESOLVED'
   * @returns {Promise<Object>} Updated report response
   */
  async updateReportStatus(id, status) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.REPORTS.UPDATE_STATUS(id), { status })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể cập nhật trạng thái báo cáo')
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

