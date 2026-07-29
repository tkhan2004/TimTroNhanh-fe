<template>
  <!-- Login Modal -->
  <Teleport to="body">
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content login-modal" @click.stop>
          <!-- Close Button -->
          <button @click="closeModal" class="modal-close" aria-label="Đóng">
            <Icon icon="ph:x-bold" />
          </button>

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-logo">
              <img src="../assets/logo.png" alt="Thuê Trọ Logo" class="login-logo" />
            </div>
            <h2 class="modal-title">Chào mừng trở lại!</h2>
            <p class="welcome-text">Đăng nhập để tìm trọ nhanh & quản lý tin đăng</p>
          </div>

          <!-- Social Login -->
          <div class="social-login-group">
            <div id="google-signin-button" class="google-btn-wrapper"></div>
          </div>

          <!-- Divider -->
          <div class="divider">
            <span>hoặc đăng nhập bằng email</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="login" class="login-form">
            <div class="input-field-wrapper">
              <Icon icon="ph:envelope-simple-bold" class="field-icon" />
              <input
                class="form-input"
                placeholder="Địa chỉ Email"
                v-model="form.email"
                type="email"
                required
              />
            </div>

            <div class="input-field-wrapper">
              <Icon icon="ph:lock-key-bold" class="field-icon" />
              <input
                class="form-input"
                placeholder="Mật khẩu"
                v-model="form.password"
                type="password"
                required
              />
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe">
                <span class="checkbox-label">Ghi nhớ đăng nhập</span>
              </label>
              <button type="button" class="forgot-password">Quên mật khẩu?</button>
            </div>

            <button type="submit" class="btn-auth-primary" :disabled="isLoggingIn">
              <span v-if="!isLoggingIn">Đăng nhập</span>
              <span v-else>Đang xử lý...</span>
            </button>
          </form>

          <!-- Footer Switch -->
          <div class="modal-footer">
            <p>Chưa có tài khoản? 
              <button @click="switchToRegister" class="link-btn">Đăng ký ngay</button>
            </p>
          </div>

          <!-- Alerts -->
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">Đăng nhập thành công!</div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const form = ref({ email: '', password: '' })
const success = ref(false)
const error = ref('')
const rememberMe = ref(false)
const isLoggingIn = ref(false)

const closeModal = () => {
  emit('close')
  success.value = false
  error.value = ''
  form.value = { email: '', password: '' }
}

const switchToRegister = () => {
  emit('switchToRegister')
}

const login = async () => {
  error.value = ''
  success.value = false
  isLoggingIn.value = true

  try {
    const res = await authStore.login(form.value)
    if (res && res.success !== false) {
      success.value = true
      setTimeout(() => {
        closeModal()
      }, 800)
    } else {
      error.value = res?.message || 'Email hoặc mật khẩu không chính xác'
    }
  } catch (err) {
    error.value = err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
  } finally {
    isLoggingIn.value = false
  }
}

const initializeGoogleButton = () => {
  try {
    initializeGoogleSignIn('google-signin-button', async (response) => {
      try {
        await authStore.loginWithGoogle(response.credential)
        success.value = true
        setTimeout(() => closeModal(), 800)
      } catch (err) {
        error.value = 'Đăng nhập Google thất bại'
      }
    })
  } catch (err) {
    console.error('Google Sign-In init error:', err)
  }
}

onMounted(() => {
  initializeGoogleButton()
})

watch(() => props.showModal, (val) => {
  if (val) {
    setTimeout(() => initializeGoogleButton(), 100)
  }
})
</script>

<style src="@/assets/css/Login.css"></style>
