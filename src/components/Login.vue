<template>
  <!-- Login Modal -->
  <transition name="modal">
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content login-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-logo">
            <img src="../assets/logo.png" alt="Thuê Trọ Logo" class="login-logo" width="50px"/>
          </div>
          <h2>Chào mừng trở lại!</h2>
          <p class="welcome-text">Đăng nhập để tiếp tục tìm kiếm phòng trọ lý tưởng</p>
          <button @click="closeModal" class="modal-close">×</button>
        </div>

        <!-- Social Login -->
        <div class="social-login-group">
          <div id="google-signin-button" style="flex:1;"></div>
        </div>

        <!-- Divider -->
        <div class="divider">
          <span>hoặc</span>
        </div>

        <form @submit.prevent="login" class="login-form">
          <input
            class="form-input"
            placeholder="Email"
            v-model="form.email"
            type="email"
            required
          />
          <input
            class="form-input"
            placeholder="Mật khẩu"
            v-model="form.password"
            type="password"
            required
          />
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              Ghi nhớ
            </label>
            <button type="button" class="forgot-password">Quên mật khẩu?</button>
          </div>
          <button type="submit" class="btn btn-primary w-full login-btn" :disabled="isLoggingIn">
            <span v-if="!isLoggingIn">Đăng nhập</span>
            <span v-else>Đang đăng nhập...</span>
          </button>
        </form>

        <div class="modal-footer">
          <p>Chưa có tài khoản? 
            <button @click="switchToRegister" class="link-btn">Đăng ký</button>
          </p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">Đăng nhập thành công!</div>

      
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { initializeGoogleSignIn } from '@/services/googleAuthService'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'switchToRegister'])

const authStore = useAuthStore()

/** Form data đăng nhập */
const form = ref({ email: '', password: '' })
const success = ref(false)
const error = ref('')
const rememberMe = ref(false)
const isLoggingIn = ref(false)

/** Đóng modal và reset form */
const closeModal = () => {
  emit('close')
  success.value = false
  error.value = ''
  form.value = { email: '', password: '' }
}

/** Chuyển sang form đăng ký */
const switchToRegister = () => {
  emit('switchToRegister')
}

/** Xử lý đăng nhập */
const login = async () => {
  if (!form.value.email || !form.value.password) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  isLoggingIn.value = true
  error.value = ''
  success.value = false

  try {
    const result = await authStore.login(form.value.email, form.value.password)
    
    if (result.success) {
      const role = result.user.role?.toUpperCase()
      
      // Kiểm tra trang hiện tại
      const isLandlordPage = window.location.pathname.includes('/landlord')
      
      if (isLandlordPage) {
        // Đang ở trang landlord - chỉ cho phép OWNER/ADMIN
        if (role !== 'OWNER' && role !== 'ADMIN') {
          error.value = 'Chỉ chủ trọ mới có thể đăng nhập tại trang này. Vui lòng đăng nhập từ trang chủ.'
          await authStore.logout()
          isLoggingIn.value = false
          return
        }
        // OWNER/ADMIN -> redirect to dashboard
        success.value = true
        setTimeout(() => {
          closeModal()
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        // Đang ở trang khách (home, rooms, etc.) - chỉ cho phép RENTER
        if (role === 'OWNER' || role === 'ADMIN') {
          error.value = 'Tài khoản chủ trọ vui lòng đăng nhập tại trang dành cho chủ trọ.'
          await authStore.logout()
          isLoggingIn.value = false
          return
        }
        // RENTER -> stay on current page
        success.value = true
        setTimeout(() => {
          closeModal()
          // Không redirect, ở lại trang hiện tại
        }, 1500)
      }
    } else {
      error.value = result.error || 'Đăng nhập thất bại'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Có lỗi xảy ra khi đăng nhập'
  } finally {
    isLoggingIn.value = false
  }
}

/** Khởi tạo Google Sign-In button */
const initializeGoogleButton = async () => {
  try {
    await initializeGoogleSignIn()
    
    // Render Google Sign-In button
    await nextTick()
    const buttonElement = document.getElementById('google-signin-button')
    
    if (window.google && buttonElement) {
      // Clear existing content
      buttonElement.innerHTML = ''
      
      window.google.accounts.id.renderButton(
        buttonElement,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular'
        }
      )
    }
  } catch (err) {
    console.error('Error initializing Google Sign-In:', err)
    error.value = 'Không thể khởi tạo Google Sign-In'
  }
}

/** Khởi tạo khi component mount */
onMounted(() => {
  // Khởi tạo ngay khi component mount
  initializeGoogleButton()
})

/** Khởi tạo lại khi modal hiện ra */
const watchModal = () => {
  if (props.showModal) {
    // Delay một chút để đảm bảo DOM đã render
    setTimeout(() => {
      initializeGoogleButton()
    }, 100)
  }
}

// Watch modal show
watch(() => props.showModal, watchModal)

/** Đăng nhập với Facebook */
const loginWithFacebook = () => {
  console.log('Login with Facebook')
  // TODO: Implement Facebook login
}
</script>

<style src="@/assets/css/Login.css"></style>

