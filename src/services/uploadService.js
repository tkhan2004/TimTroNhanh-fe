import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Upload Service
 * Xử lý upload files (images, avatars, etc.)
 */
export const uploadService = {
  /**
   * Upload avatar
   * @param {File} file - Image file
   * @returns {Promise<Object>} Response với imageUrl
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể upload avatar')
    }
  },

  /**
   * Upload một ảnh phòng
   * @param {File} file - Image file
   * @returns {Promise<Object>} Response với imageUrl
   */
  async uploadRoomImage(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.ROOM_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể upload ảnh phòng')
    }
  },

  /**
   * Upload nhiều ảnh phòng
   * @param {File[]} files - Array of image files
   * @returns {Promise<Object>} Response với imageUrls
   */
  async uploadRoomImages(files) {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.ROOM_IMAGES, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể upload ảnh phòng')
    }
  },

  /**
   * Upload file generic
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Response với fileUrl
   */
  async uploadFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(API_ENDPOINTS.UPLOAD.FILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể upload file')
    }
  },

  /**
   * Xóa file
   * @param {string} imageUrl - URL của file cần xóa
   * @returns {Promise<Object>} Response
   */
  async deleteFile(imageUrl) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.UPLOAD.DELETE_FILE, {
        params: { imageUrl }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Không thể xóa file')
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

