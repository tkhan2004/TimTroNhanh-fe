import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Dashboard Service
 * Xử lý các API liên quan đến dashboard (admin)
 */
export const dashboardService = {
  /**
   * Lấy thống kê tổng quan cho Dashboard (admin only)
   * @returns {Promise<Object>} StatisticOverviewResponse
   * @returns {number} totalUsers - Tổng số users
   * @returns {number} newUsersThisMonth - Số users mới trong tháng
   * @returns {number} totalRooms - Tổng số phòng
   * @returns {number} newRoomsThisMonth - Số phòng mới trong tháng
   * @returns {number} pendingReports - Số báo cáo đang chờ xử lý
   */
  async getStatisticsOverview() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.STATISTICS_OVERVIEW)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy dữ liệu thống kê')
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
