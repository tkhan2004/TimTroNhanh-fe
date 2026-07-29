<template>
  <div class="favorites-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Phòng Trọ Đã Lưu</h1>
        <p class="subtitle">Danh sách các phòng trọ bạn đã thả tim yêu thích</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải danh sách phòng yêu thích...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <Icon icon="ph:warning-circle-bold" class="error-icon" />
        <p>{{ error }}</p>
        <button @click="loadFavorites" class="retry-btn">Thử lại</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasFavorites" class="empty-state">
        <div class="empty-icon-wrapper">
          <Icon icon="ph:heart-break-duotone" />
        </div>
        <h2>Chưa có phòng yêu thích nào</h2>
        <p>Hãy khám phá danh sách phòng trọ và bấm biểu tượng trái tim để lưu lại.</p>
        <router-link to="/rooms" class="btn-primary-pill">
          <span>Khám phá phòng trọ ngay</span>
          <Icon icon="ph:arrow-right-bold" />
        </router-link>
      </div>

      <!-- Favorites List -->
      <div v-else class="favorites-content">
        <div class="favorites-bar">
          <span class="count-pill">{{ favoritesCount }} phòng đã lưu</span>
        </div>

        <div class="favorites-cards-grid">
          <RoomCard
            v-for="room in favorites"
            :key="room.id"
            :room="room"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavorites } from '@/composables/useFavorites'
import RoomCard from '@/components/RoomCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const {
  favorites,
  loading,
  error,
  favoritesCount,
  hasFavorites,
  loadFavorites
} = useFavorites()

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Home' })
    return
  }
  await loadFavorites()
})
</script>

<style scoped src="@/assets/css/Favorites.css"></style>
