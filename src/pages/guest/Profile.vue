<template>
  <div class="profile-page">
    <div class="container">
      <div class="page-header">
        <h1>Hồ sơ cá nhân</h1>
        <p class="subtitle">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>

      <!-- Profile Content -->
      <div v-else class="profile-content">
        <!-- Avatar Section -->
        <div class="profile-card avatar-card">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                :src="profileData.avatarUrl || 'https://via.placeholder.com/150'" 
                :alt="profileData.fullName"
                class="avatar"
              />
              <button @click="triggerFileInput" class="avatar-edit-btn" title="Đổi ảnh đại diện">
                <svg viewBox="0 0 24 24">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input 
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleAvatarUpload"
                style="display: none"
              />
            </div>
            <div class="avatar-info">
              <h2>{{ profileData.fullName || 'Người dùng' }}</h2>
              <p class="role-badge" :class="profileData.role?.toLowerCase()">
                {{ getRoleText(profileData.role) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Info Form -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Thông tin cá nhân</h3>
          </div>
          <form @submit.prevent="handleUpdateProfile" class="profile-form">
            <div class="form-group">
              <label>Họ và tên</label>
              <input 
                v-model="profileData.fullName"
                type="text"
                class="form-input"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input 
                v-model="profileData.email"
                type="email"
                class="form-input"
                disabled
              />
              <small class="form-hint">Email không thể thay đổi</small>
            </div>

            <div class="form-group">
              <label>Số điện thoại</label>
              <input 
                v-model="profileData.phone"
                type="tel"
                class="form-input"
                placeholder="Nhập số điện thoại"
                pattern="[0-9]{10,11}"
              />
            </div>

            <div v-if="updateError" class="alert alert-error">
              {{ updateError }}
            </div>

            <div v-if="updateSuccess" class="alert alert-success">
              Cập nhật thông tin thành công!
            </div>

            <button type="submit" class="btn btn-primary" :disabled="updating">
              <span v-if="!updating">Lưu thay đổi</span>
              <span v-else>Đang lưu...</span>
            </button>
          </form>
        </div>

        <!-- Change Password Form -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Đổi mật khẩu</h3>
          </div>
          <form @submit.prevent="handleChangePassword" class="profile-form">
            <div class="form-group">
              <label>Mật khẩu hiện tại</label>
              <input 
                v-model="passwordData.oldPassword"
                type="password"
                class="form-input"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </div>

            <div class="form-group">
              <label>Mật khẩu mới</label>
              <input 
                v-model="passwordData.newPassword"
                type="password"
                class="form-input"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                minlength="6"
                required
              />
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input 
                v-model="passwordData.confirmPassword"
                type="password"
                class="form-input"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <div v-if="passwordError" class="alert alert-error">
              {{ passwordError }}
            </div>

            <div v-if="passwordSuccess" class="alert alert-success">
              Đổi mật khẩu thành công!
            </div>

            <button type="submit" class="btn btn-primary" :disabled="changingPassword">
              <span v-if="!changingPassword">Đổi mật khẩu</span>
              <span v-else">Đang xử lý...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userService } from '@/services/userService'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(true)
const profileData = ref({
  fullName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  role: ''
})

// Update profile
const updating = ref(false)
const updateError = ref('')
const updateSuccess = ref(false)

// Change password
const passwordData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

// File input ref
const fileInput = ref(null)

// Load profile
const loadProfile = async () => {
  loading.value = true
  try {
    const response = await userService.getCurrentUserProfile()
    
    if (response.status === 200 && response.data) {
      profileData.value = {
        fullName: response.data.fullName || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        avatarUrl: response.data.avatarUrl || '',
        role: response.data.role || ''
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

// Update profile
const handleUpdateProfile = async () => {
  updating.value = true
  updateError.value = ''
  updateSuccess.value = false

  try {
    const response = await userService.updateCurrentUserProfile({
      fullName: profileData.value.fullName,
      phone: profileData.value.phone
    })

    if (response.status === 200) {
      updateSuccess.value = true
      // Update auth store
      authStore.user = { ...authStore.user, ...response.data }
      
      setTimeout(() => {
        updateSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    updateError.value = error.message || 'Không thể cập nhật thông tin'
  } finally {
    updating.value = false
  }
}

// Change password
const handleChangePassword = async () => {
  // Validation
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    passwordError.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (passwordData.value.newPassword.length < 6) {
    passwordError.value = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = false

  try {
    const response = await userService.changePassword({
      oldPassword: passwordData.value.oldPassword,
      newPassword: passwordData.value.newPassword
    })

    if (response.status === 200) {
      passwordSuccess.value = true
      // Reset form
      passwordData.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      
      setTimeout(() => {
        passwordSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    passwordError.value = error.message || 'Không thể đổi mật khẩu'
  } finally {
    changingPassword.value = false
  }
}

// Avatar upload
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    updateError.value = 'Vui lòng chọn file ảnh'
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    updateError.value = 'Kích thước ảnh không được vượt quá 5MB'
    return
  }

  updating.value = true
  updateError.value = ''

  try {
    const response = await userService.uploadAvatar(file)
    
    if (response.status === 200 && response.data) {
      profileData.value.avatarUrl = response.data.url || response.data
      // Update auth store
      authStore.user = { ...authStore.user, avatarUrl: profileData.value.avatarUrl }
      updateSuccess.value = true
      
      setTimeout(() => {
        updateSuccess.value = false
      }, 3000)
    }
  } catch (error) {
    updateError.value = error.message || 'Không thể tải lên ảnh đại diện'
  } finally {
    updating.value = false
  }
}

// Get role text
const getRoleText = (role) => {
  const roleMap = {
    'RENTER': 'Khách thuê',
    'OWNER': 'Chủ trọ',
    'ADMIN': 'Quản trị viên'
  }
  return roleMap[role] || role
}

onMounted(async () => {
  // Check authentication
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Home' })
    return
  }

  await loadProfile()
})
</script>

<style scoped src="@/assets/css/pages/Profile.css"></style>
