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

<style scoped>
.favorites-page {
  min-height: calc(100vh - 80px);
  background: #f9fafb;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-icon {
  width: 64px;
  height: 64px;
  stroke: #ef4444;
  fill: none;
  stroke-width: 2;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #5568d3;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  stroke: #d1d5db;
  fill: none;
  stroke-width: 2;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Favorites Content */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.count {
  color: #6b7280;
  font-size: 0.9375rem;
  margin: 0;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .favorites-page {
    padding: 1rem 0;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .favorites-list {
    gap: 1rem;
  }
}
</style>
