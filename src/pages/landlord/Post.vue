<template>
  <div class="container py-6 max-w-xl">
    <!-- Chưa đăng nhập -->
    <div v-if="!isLoggedIn" class="login-required">
      <div class="login-prompt">
        <svg viewBox="0 0 24 24" class="prompt-icon">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
        </svg>
        <h2>Bạn cần đăng nhập để đăng tin</h2>
        <p>Vui lòng đăng nhập với tài khoản chủ trọ để có thể đăng tin cho thuê phòng</p>
        <button @click="$emit('openLogin')" class="btn btn-primary">
          Đăng nhập ngay
        </button>
      </div>
    </div>

    <!-- Đã đăng nhập nhưng không phải chủ trọ -->
    <div v-else-if="!isLandlord" class="access-denied">
      <div class="access-prompt">
        <svg viewBox="0 0 24 24" class="warning-icon">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h2>Bạn không có quyền đăng tin</h2>
        <p>Chỉ có chủ trọ mới có thể đăng tin cho thuê phòng. Bạn đang đăng nhập với tài khoản khách thuê.</p>
        <div class="action-buttons">
          <button @click="switchToOwner" class="btn btn-warning">
            Chuyển sang tài khoản chủ trọ
          </button>
          <router-link to="/rooms" class="btn btn-secondary">
            Tìm phòng thuê
          </router-link>
        </div>
      </div>
    </div>

    <!-- Chủ trọ - cho phép đăng tin -->
    <div v-else class="post-form">
      <h1>Đăng tin cho thuê phòng trọ</h1>
      <p>Chào {{ currentUser?.fullName }}, hãy điền thông tin phòng trọ của bạn</p>
      <!-- Form đăng tin ở đây -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const currentUser = computed(() => authStore.user)
const isLandlord = computed(() => authStore.isLandlord)

const switchToOwner = () => {
  // TODO: Implement chuyển đổi role hoặc đăng ký làm chủ trọ
  alert('Tính năng chuyển đổi role sẽ được phát triển sau')
}
</script>

<!-- Import external CSS file for Post view styles -->
<style src="@/assets/css/Post.css"></style>
