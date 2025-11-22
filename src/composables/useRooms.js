import { ref } from 'vue'
import { roomService } from '@/services/roomService'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable quản lý rooms data và logic
 * @returns {Object} Rooms state và methods
 */
export function useRooms() {
  const authStore = useAuthStore()

  /** Loading state */
  const loading = ref(false)

  /** Error state */
  const error = ref(null)

  /** Rooms list */
  const rooms = ref([])

  /** Pagination info */
  const pagination = ref({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  })

  /**
   * Fetch rooms với filters và pagination
   * @param {Object} params - Filter và pagination parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.size - Page size
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortDirection - Sort direction: 'asc' | 'desc'
   * @param {string} params.keyword - Search keyword
   * @param {string} params.city - City filter
   * @param {string} params.district - District filter
   * @param {string} params.ward - Ward filter
   * @param {string} params.minPrice - Minimum price
   * @param {string} params.maxPrice - Maximum price
   * @param {string} params.minArea - Minimum area
   * @param {string} params.maxArea - Maximum area
   * @param {string} params.status - Status: 'AVAILABLE' | 'RENTED'
   * @param {string} params.roomType - Room type filter
   */
  const fetchRooms = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      // Set default pagination
      const queryParams = {
        page: params.page ?? pagination.value.page,
        size: params.size ?? pagination.value.size,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc',
        ...params
      }

      let response
      if (authStore.isLoggedIn) {
        response = await roomService.getAllRooms(queryParams)
      } else {
        response = await roomService.getAllRoomsForGuest(queryParams)
      }

      if (response.status === 200 && response.data) {
        rooms.value = response.data.content || []
        pagination.value = {
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0
        }
      }
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách phòng'
      rooms.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch room by ID
   * @param {number|string} id - Room ID
   * @returns {Promise<Object>} Room detail
   */
  const fetchRoomById = async (id) => {
    loading.value = true
    error.value = null

    try {
      let response
      if (authStore.isLoggedIn) {
        response = await roomService.getRoomById(id)
      } else {
        response = await roomService.getRoomByIdForGuest(id)
      }

      if (response.status === 200 && response.data) {
        return response.data
      }
      throw new Error('Không tìm thấy phòng')
    } catch (err) {
      error.value = err.message || 'Không thể tải chi tiết phòng'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch my rooms (for owner)
   * @param {Object} params - Pagination params
   */
  const fetchMyRooms = async (params = {}) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = {
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy || 'createdAt',
        sortDirection: params.sortDirection || 'desc'
      }

      const response = await roomService.getMyRooms(queryParams)

      if (response.status === 200 && response.data) {
        rooms.value = response.data.content || []
        pagination.value = {
          page: response.data.number || 0,
          size: response.data.size || 10,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0
        }
      }
    } catch (err) {
      error.value = err.message || 'Không thể tải danh sách phòng của bạn'
      rooms.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Search rooms với keyword
   * @param {string} keyword - Search keyword
   * @param {Object} additionalParams - Additional filter params
   */
  const searchRooms = async (keyword, additionalParams = {}) => {
    await fetchRooms({ keyword, ...additionalParams })
  }

  return {
    // State
    loading,
    error,
    rooms,
    pagination,

    // Methods
    fetchRooms,
    fetchRoomById,
    fetchMyRooms,
    searchRooms
  }
}