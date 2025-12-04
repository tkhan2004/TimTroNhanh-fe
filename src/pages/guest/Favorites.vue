<template>
  <div class="favorites-page">
    <div class="container">
      <div class="page-header">
        <h1>Phòng yêu thích</h1>
        <p class="subtitle">Danh sách các phòng trọ bạn đã lưu</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg viewBox="0 0 24 24" class="error-icon">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <p>{{ error }}</p>
        <button @click="loadFavorites" class="retry-btn">Thử lại</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!hasFavorites" class="empty-state">
        <svg viewBox="0 0 24 24" class="empty-icon">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <h2>Chưa có phòng yêu thích</h2>
        <p>Hãy khám phá và lưu các phòng trọ bạn thích</p>
        <router-link to="/rooms" class="btn btn-primary">
          Tìm phòng ngay
        </router-link>
      </div>

      <!-- Favorites List -->
      <div v-else class="favorites-content">
        <div class="favorites-header">
          <p class="count">{{ favoritesCount }} phòng</p>
        </div>

        <div class="favorites-list">
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
  // Check authentication
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Home' })
    return
  }

  // Load favorites
  await loadFavorites()
})
</script>

<style scoped src="@/assets/css/pages/Favorites.css"></style>

