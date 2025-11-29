import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Room Service
 * Xử lý các API liên quan đến phòng trọ
 */
export const roomService = {
  /**
   * Lấy danh sách phòng với filters và pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDirection - Sort direction: 'asc' | 'desc' (default: 'desc')
   * @param {string} params.keyword - Search keyword
   * @param {string} params.city - City filter
   * @param {string} params.district - District filter
   * @param {string} params.ward - Ward filter
   * @param {string} params.minPrice - Minimum price
   * @param {string} params.maxPrice - Maximum price
   * @param {string} params.minArea - Minimum area
   * @param {string} params.maxArea - Maximum area
   * @param {string} params.status - Status: 'AVAILABLE' | 'RENTED'
   * @param {number} params.ownerId - Owner ID filter
   * @returns {Promise<Object>} Paginated rooms response
   */
  async getAllRooms(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROOMS.BASE, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách phòng')
    }
  },

  /**
   * Lấy danh sách phòng cho khách (không cần login)
   * @param {Object} params - Query parameters (same as getAllRooms)
   * @returns {Promise<Object>} Paginated rooms response
   */
  async getAllRoomsForGuest(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROOMS.FOR_GUEST, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách phòng')
    }
  },

  /**
   * Lấy chi tiết phòng theo ID
   * @param {number|string} id - Room ID
   * @returns {Promise<Object>} Room detail response
   */
  async getRoomById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROOMS.BY_ID(id))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy chi tiết phòng')
    }
  },

  /**
   * Lấy chi tiết phòng cho khách (không cần login)
   * @param {number|string} id - Room ID
   * @returns {Promise<Object>} Room detail response
   */
  async getRoomByIdForGuest(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROOMS.BY_ID_FOR_GUEST(id))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy chi tiết phòng')
    }
  },

  /**
   * Tạo phòng mới
   * @param {Object} roomData - Room data
   * @param {string} roomData.title - Room title (required)
   * @param {string} roomData.description - Room description
   * @param {number} roomData.price - Room price (required, > 0)
   * @param {number} roomData.area - Room area (> 0)
   * @param {string} roomData.address - Address (required)
   * @param {string} roomData.city - City
   * @param {string} roomData.district - District
   * @param {string} roomData.ward - Ward
   * @param {number} roomData.latitude - Latitude
   * @param {number} roomData.longitude - Longitude
   * @param {string} roomData.status - Status: 'AVAILABLE' | 'RENTED'
   * @param {string} roomData.roomType - Room type: 'PHONG_TRO' | 'CHUNG_CU' | 'NHA_NGUYEN_CAN' | 'CAN_HO_DICH_VU' | 'NHA_MAT_TIEN' | 'STUDIO'
   * @param {number[]} roomData.utilityIds - Array of utility IDs
   * @param {string[]} roomData.imageUrls - Array of image URLs
   * @returns {Promise<Object>} Created room response
   */
  async createRoom(roomData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ROOMS.BASE, roomData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể tạo phòng mới')
    }
  },

  /**
   * Cập nhật phòng
   * @param {number|string} id - Room ID
   * @param {Object} roomData - Updated room data (same structure as createRoom)
   * @returns {Promise<Object>} Updated room response
   */
  async updateRoom(id, roomData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ROOMS.BY_ID(id), roomData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể cập nhật phòng')
    }
  },

  /**
   * Xóa phòng
   * @param {number|string} id - Room ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteRoom(id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ROOMS.BY_ID(id))
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể xóa phòng')
    }
  },

  /**
   * Toggle trạng thái phòng (AVAILABLE <-> RENTED)
   * @param {number|string} id - Room ID
   * @returns {Promise<Object>} Updated room response
   */
  async toggleRoomStatus(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.ROOMS.TOGGLE_STATUS(id), {})
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể thay đổi trạng thái phòng')
    }
  },

  /**
   * Lấy danh sách phòng của user hiện tại
   * @param {Object} params - Pagination params
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'createdAt')
   * @param {string} params.sortDirection - Sort direction: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise<Object>} Paginated rooms response
   */
  async getMyRooms(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ROOMS.MY_ROOMS, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể lấy danh sách phòng của bạn')
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
