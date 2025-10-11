import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { handleGoogleCallback } from '@/services/googleAuthService'

/**
 * Composable để xử lý Google OAuth callback
 */
export function useGoogleAuth() {
  const authStore = useAuthStore()
  const isProcessing = ref(false)
  const error = ref('')

  /**
   * Xử lý callback từ Google khi redirect về
   */
  const processGoogleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const errorParam = urlParams.get('error')

    // Nếu có lỗi từ Google
    if (errorParam) {
      error.value = `Lỗi từ Google: ${errorParam}`
      return false
    }

    // Nếu không có code
    if (!code) {
      return false
    }

    isProcessing.value = true
    error.value = ''

    try {
      // Gọi API BE để xử lý code
      const result = await handleGoogleCallback(code)
      
      if (result.user && result.token) {
        // Lưu thông tin user và token
        authStore.setUserAndToken(result.user, result.token)
        
        // Xóa code khỏi URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, document.title, newUrl)
        
        // Hiển thị thông báo thành công
        console.log('Đăng nhập Google thành công!', result.user)
        
        return true
      } else {
        error.value = 'Dữ liệu từ server không hợp lệ'
        return false
      }
    } catch (err) {
      console.error('Error processing Google callback:', err)
      error.value = err.message || 'Đăng nhập Google thất bại'
      return false
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Kiểm tra và xử lý callback khi component mount
   */
  onMounted(() => {
    // Kiểm tra token trong localStorage (từ Google Sign-In)
    const token = localStorage.getItem('token')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (token && isLoggedIn === 'true') {
      // Có token từ Google Sign-In, cần lấy thông tin user từ token
      try {
        // Decode JWT token để lấy thông tin user
        const payload = JSON.parse(atob(token.split('.')[1]))
        const userData = {
          id: payload.userId,
          email: payload.sub,
          fullName: payload.name || payload.sub,
          role: payload.role.toLowerCase()
        }
        
        // Lưu user data vào store
        authStore.setUserAndToken(userData, token)
        
        console.log('Đăng nhập Google thành công!', userData)
      } catch (err) {
        console.error('Error decoding token:', err)
        // Xóa token không hợp lệ
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
      }
    }
  })

  return {
    isProcessing,
    error,
    processGoogleCallback
  }
}
