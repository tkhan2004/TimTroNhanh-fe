import apiClient from './api'
import { API_ENDPOINTS } from '@/constants/api'

/**
 * Authentication Service
 * Xử lý các API liên quan đến authentication
 */
export const authService = {
  /**
   * Đăng nhập
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} AuthResponse với accessToken, refreshToken, user info
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Đăng nhập thất bại')
    }
  },

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - { fullName, email, password, phone?, avatarUrl?, role? }
   * @returns {Promise<Object>} AuthResponse
   */
  async register(userData) {
    try {
      console.log('AuthService register - calling API:', API_ENDPOINTS.AUTH.REGISTER)
      console.log('AuthService register - request data:', userData)
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData)
      console.log('AuthService register - axios response:', response)
      console.log('AuthService register - response.data:', response.data)
      return response.data
    } catch (error) {
      console.error('AuthService register - error:', error)
      console.error('AuthService register - error.response:', error.response)
      throw this.handleError(error, 'Đăng ký thất bại')
    }
  },

  /**
   * Đăng xuất
   * @returns {Promise<Object>} Response message
   */
  async logout() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Đăng xuất thất bại')
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<Object>} AuthResponse với token mới
   */
  async refreshToken() {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Refresh token thất bại')
    }
  },

  /**
   * Validate token
   * @returns {Promise<Object>} Validation response
   */
  async validateToken() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Token không hợp lệ')
    }
  },

  /**
   * Đăng nhập với Google ID Token
   * @param {string} idToken - Google ID Token
   * @returns {Promise<Object>} AuthResponse
   */
  async loginWithGoogle(idToken) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { idToken })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Đăng nhập Google thất bại')
    }
  },

  /**
   * Xử lý callback từ Google OAuth
   * @param {string} code - Authorization code từ Google
   * @returns {Promise<Object>} AuthResponse
   */
  async handleGoogleCallback(code) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK, {
        params: { code }
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Xử lý Google callback thất bại')
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

