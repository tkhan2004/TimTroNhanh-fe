<template>
  <!-- Register Modal -->
  <Teleport to="body">
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content register-modal" @click.stop>
          <!-- Close Button -->
          <button @click="closeModal" class="modal-close" aria-label="Đóng">
            <Icon icon="ph:x-bold" />
          </button>

          <!-- Header -->
          <div class="modal-header">
            <div class="modal-logo">
              <img src="../assets/logo.png" alt="Thuê Trọ Logo" class="login-logo" />
            </div>
            <h2 class="modal-title">Tạo tài khoản mới</h2>
            <p class="welcome-text">Tham gia cộng đồng tìm & cho thuê trọ nhanh chóng</p>
          </div>

          <!-- Role Selector Tabs -->
          <div class="role-selector-bar">
            <button 
              type="button"
              @click="form.role = 'ROLE_USER'"
              :class="['role-tab', { 'active': form.role === 'ROLE_USER' }]"
            >
              <Icon icon="ph:user-bold" />
              <span>Khách tìm trọ</span>
            </button>
            <button 
              type="button"
              @click="form.role = 'ROLE_LANDLORD'"
              :class="['role-tab', { 'active': form.role === 'ROLE_LANDLORD' }]"
            >
              <Icon icon="ph:house-line-bold" />
              <span>Chủ nhà / Cho thuê</span>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="register" class="register-form">
            <div class="input-field-wrapper">
              <Icon icon="ph:user-bold" class="field-icon" />
              <input
                class="form-input"
                placeholder="Họ và tên"
                v-model="form.name"
                type="text"
                required
              />
            </div>

            <div class="form-row">
              <div class="input-field-wrapper">
                <Icon icon="ph:envelope-simple-bold" class="field-icon" />
                <input
                  class="form-input"
                  placeholder="Email"
                  v-model="form.email"
                  type="email"
                  required
                />
              </div>

              <div class="input-field-wrapper">
                <Icon icon="ph:phone-bold" class="field-icon" />
                <input
                  class="form-input"
                  placeholder="Số điện thoại"
                  v-model="form.phone"
                  type="tel"
                  required
                />
              </div>
            </div>

            <div class="form-row">
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

              <div class="input-field-wrapper">
                <Icon icon="ph:shield-check-bold" class="field-icon" />
                <input
                  class="form-input"
                  placeholder="Nhập lại mật khẩu"
                  v-model="form.confirmPassword"
                  type="password"
                  required
                />
              </div>
            </div>

            <label class="terms-agreement">
              <input type="checkbox" v-model="agreeTerms" required />
              <span>Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a></span>
            </label>

            <button type="submit" class="btn-auth-primary" :disabled="isRegistering">
              <span v-if="!isRegistering">Đăng ký tài khoản</span>
              <span v-else>Đang khởi tạo...</span>
            </button>
          </form>

          <!-- Footer Switch -->
          <div class="modal-footer">
            <p>Đã có tài khoản? 
              <button @click="switchToLogin" class="link-btn">Đăng nhập ngay</button>
            </p>
          </div>

          <!-- Alerts -->
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <div v-if="success" class="alert alert-success">
            Tài khoản đã được khởi tạo thành công!
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
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

const form = ref({ 
  name: '', 
  email: '', 
  phone: '', 
  password: '', 
  confirmPassword: '',
  role: 'ROLE_USER'
})

const agreeTerms = ref(false)
const success = ref(false)
const error = ref('')
const isRegistering = ref(false)

const closeModal = () => {
  emit('close')
  success.value = false
  error.value = ''
  form.value = { name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'ROLE_USER' }
}

const switchToLogin = () => {
  emit('switchToLogin')
}

const register = async () => {
  error.value = ''
  success.value = false

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  isRegistering.value = true

  try {
    const res = await authStore.register({
      fullName: form.value.name,
      email: form.value.email,
      phone: form.value.phone,
      password: form.value.password,
      role: form.value.role
    })

    if (res && res.success !== false) {
      success.value = true
      setTimeout(() => {
        switchToLogin()
      }, 1000)
    } else {
      error.value = res?.message || 'Đăng ký thất bại. Email hoặc SĐT có thể đã tồn tại.'
    }
  } catch (err) {
    error.value = err?.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký'
  } finally {
    isRegistering.value = false
  }
}
</script>

<style src="@/assets/css/Login.css"></style>
