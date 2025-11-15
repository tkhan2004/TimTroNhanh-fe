import { defineStore } from 'pinia'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoggedIn: false
  }),

  getters: {
    isLandlord: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'owner' || role === 'landlord'
    },
    isRenter: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'renter' || role === 'tenant'
    },
    isAdmin: (state) => {
      const role = state.user?.role?.toLowerCase()
      return role === 'admin'
    },
    userRole: (state) => state.user?.role || null
  },

  actions: {
    /**
     * Đăng nhập với email và password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} { success: boolean, user?: Object, error?: string }
     */
    async login(email, password) {
      try {
        const response = await authService.login({ email, password })
        
        // Response từ authService đã là response.data từ axios
        // Structure: { status: 200, message: "...", data: { accessToken, refreshToken, ... } }
        if (response && response.status === 200 && response.data) {
          const authData = response.data
          
          // Lưu tokens
          this.token = authData.accessToken
          this.refreshToken = authData.refreshToken
          localStorage.setItem('token', authData.accessToken)
          if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken)
          }
          
          // Tạo user object từ response
          const userData = {
            id: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role?.toLowerCase() || 'renter' // RENTER -> renter, OWNER -> owner
          }
          
          this.user = userData
          this.isLoggedIn = true
          
          // Lưu user vào localStorage
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isLoggedIn', 'true')
          
          return { success: true, user: userData }
        } else {
          return { success: false, error: response?.message || 'Đăng nhập thất bại' }
        }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: error.message || 'Có lỗi xảy ra khi đăng nhập' }
      }
    },

    /**
     * Đăng ký tài khoản mới
     * @param {Object} userData - { fullName, email, password, phone?, avatarUrl?, role? }
     * @returns {Promise<Object>} { success: boolean, user?: Object, error?: string }
     */
    async register(userData) {
      try {
        console.log('AuthStore register - sending data:', userData)
        const response = await authService.register(userData)
        console.log('AuthStore register - received response:', response)
        console.log('AuthStore register - response type:', typeof response)
        console.log('AuthStore register - response keys:', Object.keys(response || {}))
        
        // Response từ authService đã là response.data từ axios
        // Có thể có 2 format:
        // 1. { status: 200, message: "...", data: { accessToken, refreshToken, ... } }
        // 2. { accessToken, refreshToken, userId, email, fullName, role } (direct)
        let authData = null
        
        if (response && response.status === 200 && response.data) {
          // Format 1: có wrapper { status, data }
          authData = response.data
        } else if (response && response.accessToken) {
          // Format 2: direct response
          authData = response
        } else if (response && response.data && response.data.accessToken) {
          // Format 3: nested data
          authData = response.data
        }
        
        if (authData && authData.accessToken) {
          console.log('AuthStore register - authData:', authData)
          
          // Lưu tokens
          this.token = authData.accessToken
          this.refreshToken = authData.refreshToken
          localStorage.setItem('token', authData.accessToken)
          if (authData.refreshToken) {
            localStorage.setItem('refreshToken', authData.refreshToken)
          }
          
          // Tạo user object từ response
          const user = {
            id: authData.userId || authData.id,
            email: authData.email,
            fullName: authData.fullName,
            role: (authData.role?.toLowerCase() || 'renter')
          }
          
          this.user = user
          this.isLoggedIn = true
          
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('isLoggedIn', 'true')
          
          return { success: true, user }
        } else {
          console.warn('Register response structure unexpected:', response)
          return { success: false, error: response?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.' }
        }
      } catch (error) {
        console.error('Register error:', error)
        console.error('Register error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        })
        
        // Xử lý lỗi từ API
        let errorMessage = 'Có lỗi xảy ra khi đăng ký'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        // Kiểm tra network error
        if (!error.response) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server đang chạy.'
        }
        
        return { success: false, error: errorMessage }
      }
    },

    /**
     * Đăng xuất
     */
    async logout() {
      try {
        // Gọi API logout
        await authService.logout()
      } catch (error) {
        console.error('Logout API error:', error)
        // Vẫn tiếp tục clear local data dù API fail
      } finally {
        // Clear state
        this.user = null
        this.token = null
        this.refreshToken = null
        this.isLoggedIn = false
        
        // Clear localStorage
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('isLoggedIn')
      }
    },

    /**
     * Set user data
     * @param {Object} userData - User data
     */
    setUser(userData) {
      this.user = userData
      this.isLoggedIn = true
      
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isLoggedIn', 'true')
    },

    /**
     * Set access token
     * @param {string} token - Access token
     */
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    /**
     * Set refresh token
     * @param {string} refreshToken - Refresh token
     */
    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken
      localStorage.setItem('refreshToken', refreshToken)
    },

    /**
     * Set user and tokens
     * @param {Object} userData - User data
     * @param {string} token - Access token
     * @param {string} refreshToken - Refresh token (optional)
     */
    setUserAndToken(userData, token, refreshToken = null) {
      this.setUser(userData)
      this.setToken(token)
      if (refreshToken) {
        this.setRefreshToken(refreshToken)
      }
    },

    /**
     * Restore session from localStorage
     */
    restoreSession() {
      const savedUser = localStorage.getItem('user')
      const savedLoginStatus = localStorage.getItem('isLoggedIn')
      const savedToken = localStorage.getItem('token')
      const savedRefreshToken = localStorage.getItem('refreshToken')
      
      if (savedUser && savedLoginStatus === 'true' && savedToken) {
        this.user = JSON.parse(savedUser)
        this.token = savedToken
        this.isLoggedIn = true
        if (savedRefreshToken) {
          this.refreshToken = savedRefreshToken
        }
      }
    },

    /**
     * Load user profile from API
     * @returns {Promise<Object>} User profile
     */
    async loadUserProfile() {
      try {
        const response = await userService.getCurrentUserProfile()
        if (response.status === 200 && response.data) {
          const userData = {
            id: response.data.id,
            email: response.data.email,
            fullName: response.data.fullName,
            phone: response.data.phone,
            avatarUrl: response.data.avatarUrl,
            role: response.data.role?.toLowerCase() || 'renter'
          }
          this.setUser(userData)
          return userData
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        throw error
      }
    }
  }
})
