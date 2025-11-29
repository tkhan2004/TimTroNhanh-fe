<template>
  <div class="landlord-page">
    <!-- Hero Section -->
    <section class="landlord-hero">
      <div class="hero-content">
        <div class="hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Dành cho chủ trọ</span>
        </div>
        <h1 class="hero-title">Quản Lý Phòng Trọ Dễ Dàng</h1>
        <p class="hero-subtitle">
          Đăng tin miễn phí, quản lý phòng trọ hiệu quả, kết nối với hàng nghìn khách thuê tiềm năng
        </p>
      </div>
    </section>

    <!-- Auth Section -->
    <section class="auth-section">
      <div class="container">
        <div class="auth-container">
          <!-- Tabs -->
          <div class="auth-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'login' }]"
              @click="activeTab = 'login'"
            >
              Đăng nhập
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'register' }]"
              @click="activeTab = 'register'"
            >
              Đăng ký
            </button>
          </div>

          <!-- Login Form -->
          <div v-if="activeTab === 'login'" class="auth-form">
            <div class="form-header">
              <h2>Đăng nhập tài khoản chủ trọ</h2>
              <p>Nhập thông tin để truy cập dashboard quản lý</p>
            </div>

            <form @submit.prevent="handleLogin" class="form">
              <div class="form-group">
                <label>Email</label>
                <input 
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="email@example.com"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Mật khẩu</label>
                <input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="Nhập mật khẩu"
                  class="form-input"
                />
              </div>

              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox" v-model="rememberMe">
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" class="forgot-password">Quên mật khẩu?</a>
              </div>

              <button type="submit" class="btn btn-primary btn-block" :disabled="isLoggingIn">
                <span v-if="!isLoggingIn">Đăng nhập</span>
                <span v-else>Đang đăng nhập...</span>
              </button>
            </form>

            <div v-if="loginError" class="alert alert-error">
              {{ loginError }}
            </div>
          </div>

          <!-- Register Form -->
          <div v-if="activeTab === 'register'" class="auth-form">
            <div class="form-header">
              <h2>Đăng ký tài khoản chủ trọ</h2>
              <p>Tạo tài khoản mới để bắt đầu đăng tin cho thuê</p>
            </div>

            <form @submit.prevent="handleRegister" class="form">
              <div class="form-group">
                <label>Họ và tên</label>
                <input 
                  v-model="registerForm.fullName" 
                  type="text" 
                  placeholder="Nguyễn Văn A"
                  class="form-input"
                  maxlength="100"
                />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input 
                  v-model="registerForm.email" 
                  type="email" 
                  placeholder="email@example.com"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input 
                  v-model="registerForm.phone" 
                  type="tel" 
                  placeholder="0901234567"
                  class="form-input"
                  pattern="^[0-9]{10,11}$"
                />
              </div>

              <div class="form-group">
                <label>Mật khẩu</label>
                <input 
                  v-model="registerForm.password" 
                  type="password" 
                  placeholder="Tối thiểu 6 ký tự"
                  class="form-input"
                  minlength="6"
                />
              </div>

              <div class="form-group">
                <label>Xác nhận mật khẩu</label>
                <input 
                  v-model="registerForm.confirmPassword" 
                  type="password" 
                  placeholder="Nhập lại mật khẩu"
                  class="form-input"
                />
              </div>

              <label class="terms-agreement">
                <input type="checkbox" v-model="agreeTerms">
                <span>Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a></span>
              </label>

              <button type="submit" class="btn btn-primary btn-block" :disabled="isRegistering">
                <span v-if="!isRegistering">Đăng ký ngay</span>
                <span v-else>Đang đăng ký...</span>
              </button>
            </form>

            <div v-if="registerError" class="alert alert-error">
              {{ registerError }}
            </div>
            <div v-if="registerSuccess" class="alert alert-success">
              Đăng ký thành công! Đang chuyển hướng...
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="features-title">Tại sao chọn chúng tôi?</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>Đăng tin miễn phí</h3>
            <p>Không mất phí đăng tin, không phí ẩn, hoàn toàn miễn phí</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3>Tiếp cận nhiều khách thuê</h3>
            <p>Hàng nghìn người tìm trọ truy cập mỗi ngày</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h3>Quản lý dễ dàng</h3>
            <p>Dashboard trực quan, quản lý phòng trọ hiệu quả</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>An toàn & Uy tín</h3>
            <p>Xác minh thông tin, bảo vệ quyền lợi chủ trọ</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Tabs
const activeTab = ref('login')

// Login form
const loginForm = ref({
  email: '',
  password: ''
})
const isLoggingIn = ref(false)
const loginError = ref('')
const rememberMe = ref(false)

// Register form
const registerForm = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const isRegistering = ref(false)
const registerError = ref('')
const registerSuccess = ref(false)
const agreeTerms = ref(false)

// Handle login
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    loginError.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  isLoggingIn.value = true
  loginError.value = ''

  try {
    const result = await authStore.login(loginForm.value.email, loginForm.value.password)
    
    if (result.success) {
      // Kiểm tra role - chỉ cho phép OWNER và ADMIN
      const role = result.user.role?.toUpperCase()
      if (role === 'OWNER' || role === 'ADMIN') {
        // Redirect to dashboard
        router.push({ name: 'DashboardOverview' })
      } else {
        loginError.value = 'Chỉ chủ trọ mới có thể đăng nhập tại trang này. Vui lòng đăng nhập từ trang chủ.'
        await authStore.logout()
      }
    } else {
      loginError.value = result.error || 'Đăng nhập thất bại'
    }
  } catch (err) {
    console.error('Login error:', err)
    loginError.value = err.message || 'Có lỗi xảy ra khi đăng nhập'
  } finally {
    isLoggingIn.value = false
  }
}

// Handle register
const handleRegister = async () => {
  // Validation
  if (!registerForm.value.fullName || !registerForm.value.email || !registerForm.value.password) {
    registerError.value = 'Vui lòng điền đầy đủ thông tin'
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (registerForm.value.password.length < 6) {
    registerError.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  if (!agreeTerms.value) {
    registerError.value = 'Vui lòng đồng ý với điều khoản sử dụng'
    return
  }

  isRegistering.value = true
  registerError.value = ''
  registerSuccess.value = false

  try {
    const registerData = {
      fullName: registerForm.value.fullName,
      email: registerForm.value.email,
      password: registerForm.value.password,
      phone: registerForm.value.phone || undefined,
      role: 'OWNER' // Mặc định là OWNER cho trang này
    }

    const result = await authStore.register(registerData)
    
    if (result.success) {
      // Check if the registered user is actually an owner
      const role = result.user.role?.toLowerCase()
      if (role === 'owner' || role === 'landlord' || role === 'admin') {
        registerSuccess.value = true
        setTimeout(() => {
          router.push({ name: 'DashboardOverview' })
        }, 1500)
      } else {
        // Registration successful but wrong role (likely backend ignored the role param)
        registerError.value = 'Đăng ký thành công nhưng tài khoản chưa được cấp quyền Chủ trọ. Vui lòng liên hệ Admin hoặc thử lại.'
        // Optional: Logout immediately to prevent stuck state
        authStore.logout()
      }
    } else {
      registerError.value = result.error || 'Đăng ký thất bại'
    }
  } catch (err) {
    registerError.value = err.message || 'Có lỗi xảy ra khi đăng ký'
  } finally {
    isRegistering.value = false
  }
}
</script>

<style scoped src="@/assets/css/pages/Landlord.css"></style>

