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
          <button @click="loginWithFacebook" class="btn btn-primary w-full login-btn social-login-btn facebook" type="button">
            <svg viewBox="0 0 24 24"><path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
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

        <!-- Demo Accounts -->
        <div class="demo-accounts">
          <details>
            <summary>Demo</summary>
            <div class="demo-list">
              <div>👤 khach@gmail.com / 123456</div>
              <div>🏠 chutro@gmail.com / 123456</div>
            </div>
          </details>
        </div>
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
      success.value = true
      setTimeout(() => {
        closeModal()
        
        // Redirect dựa theo role
        const role = result.user.role?.toLowerCase()
        if (role === 'owner' || role === 'landlord') {
          // Chủ trọ -> Dashboard
          window.location.href = '/dashboard'
        } else if (role === 'admin') {
          // Admin -> Dashboard
          window.location.href = '/dashboard'
        }
        // Khách thuê không redirect, ở lại trang hiện tại
      }, 1500)
    } else {
      error.value = result.error || 'Đăng nhập thất bại'
    }
  } catch (err) {
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

