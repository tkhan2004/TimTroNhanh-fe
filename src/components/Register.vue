<template>
  <!-- Register Modal -->
  <transition name="modal">
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content register-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-logo">
            <img src="../assets/logo.png" alt="Thuê Trọ Logo" class="login-logo" width="50px"/>
          </div>
          <h2>Tạo tài khoản</h2>
          <p class="welcome-text">Tham gia cộng đồng thuê trọ</p>
          <button @click="closeModal" class="modal-close">×</button>
        </div>

        <form @submit.prevent="register" class="register-form">
          <div class="form-row">
            <input
              class="form-input"
              placeholder="Họ tên"
              v-model="form.name"
              type="text"
              required
            />
            <input
              class="form-input"
              placeholder="Email"
              v-model="form.email"
              type="email"
              required
            />
          </div>
          <div class="form-row">
            <input
              class="form-input"
              placeholder="Số điện thoại"
              v-model="form.phone"
              type="tel"
              required
            />
            <input
              class="form-input"
              placeholder="Mật khẩu"
              v-model="form.password"
              type="password"
              required
            />
          </div>
          <input
            class="form-input"
            placeholder="Xác nhận mật khẩu"
            v-model="form.confirmPassword"
            type="password"
            required
          />
          <label class="terms-agreement">
            <input type="checkbox" v-model="agreeTerms" required>
            <span class="checkmark"></span>
            <span>Đồng ý điều khoản</span>
          </label>
          <button type="submit" class="btn btn-primary w-full" :disabled="isRegistering">
            <span v-if="!isRegistering">Tạo tài khoản</span>
            <span v-else>Đang đăng ký...</span>
          </button>
        </form>

        <div class="modal-footer">
          <p>Đã có tài khoản? 
            <button @click="switchToLogin" class="link-btn">Đăng nhập</button>
          </p>
        </div>

        <!-- Alerts -->
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">
          Tài khoản đã được tạo thành công!
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'switchToLogin'])

const authStore = useAuthStore()

/** Form data đăng ký */
const form = ref({ 
  name: '', 
  email: '', 
  phone: '', 
  password: '', 
  confirmPassword: '' 
})
const success = ref(false)
const error = ref('')
const agreeTerms = ref(false)
const isRegistering = ref(false)

/** Đóng modal và reset form */
const closeModal = () => {
  emit('close')
  success.value = false
  error.value = ''
  form.value = { name: '', email: '', phone: '', password: '', confirmPassword: '' }
}

/** Chuyển sang form đăng nhập */
const switchToLogin = () => {
  emit('switchToLogin')
}

/** Xử lý đăng ký */
const register = async () => {
  // Validation
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  if (form.value.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  if (!agreeTerms.value) {
    error.value = 'Vui lòng đồng ý với điều khoản'
    return
  }

  isRegistering.value = true
  error.value = ''
  success.value = false

  try {
    const registerData = {
      fullName: form.value.name,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone || undefined,
      role: 'RENTER' // Mặc định là RENTER
    }

    console.log('Register data:', registerData)
    const result = await authStore.register(registerData)
    console.log('Register result:', result)
    
    if (result.success) {
      success.value = true
      setTimeout(() => {
        closeModal()
        // Có thể redirect hoặc chuyển sang login
        switchToLogin()
      }, 1500)
    } else {
      error.value = result.error || 'Đăng ký thất bại'
      console.error('Register failed:', result.error)
    }
  } catch (err) {
    console.error('Register exception:', err)
    error.value = err.message || 'Có lỗi xảy ra khi đăng ký'
  } finally {
    isRegistering.value = false
  }
}
</script>

<style src="@/assets/css/Register.css"></style>
