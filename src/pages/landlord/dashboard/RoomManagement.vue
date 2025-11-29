<template>
  <div class="room-management">
    <div class="page-header">
      <h1 class="page-title">Quản lý phòng trọ</h1>
      <p class="page-subtitle">Quản lý tất cả phòng trọ của bạn</p>
    </div>

    <div class="room-stats">
      <div class="stat-card">
        <div class="stat-number">{{ totalRooms }}</div>
        <div class="stat-label">Tổng phòng</div>
      </div>
      <div class="stat-card available">
        <div class="stat-number">{{ availableRooms }}</div>
        <div class="stat-label">Phòng trống</div>
      </div>
      <div class="stat-card occupied">
        <div class="stat-number">{{ occupiedRooms }}</div>
        <div class="stat-label">Đã thuê</div>
      </div>
    </div>

    <div class="room-list">
      <div class="list-header">
        <h3>Danh sách phòng</h3>
        <router-link to="/dashboard/post" class="btn btn-primary">
          + Thêm phòng mới
        </router-link>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Đang tải danh sách phòng...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchMyRooms({ size: 100 })" class="btn btn-secondary">Thử lại</button>
      </div>

      <div v-else-if="rooms.length === 0" class="empty-state">
        <p>Bạn chưa đăng tin phòng trọ nào.</p>
        <router-link to="/dashboard/post" class="btn btn-primary">Đăng tin ngay</router-link>
      </div>

      <div v-else class="room-grid">
        <div v-for="room in rooms" :key="room.id" class="room-item">
          <div class="room-image">
            <img :src="getRoomImage(room)" :alt="room.title" />
            <div class="room-status" :class="room.status === 'AVAILABLE' ? 'available' : room.status === 'EXPIRED' ? 'expired' : 'occupied'">
              {{ room.status === 'AVAILABLE' ? 'Trống' : room.status === 'EXPIRED' ? 'Hết hạn' : 'Đã thuê' }}
            </div>
          </div>
          <div class="room-info">
            <h4>{{ room.title }}</h4>
            <p class="room-price">{{ formatPrice(room.price) }}/tháng</p>
            <p class="room-address">{{ room.address }}</p>
          </div>
          <div class="room-actions">
            <router-link :to="{ name: 'OwnerRoomDetail', params: { id: room.id } }" class="btn-icon" title="Xem chi tiết">
              <svg viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </router-link>
            <button 
              class="btn-icon" 
              :disabled="room.status === 'EXPIRED'"
              :title="room.status === 'EXPIRED' ? 'Không thể chỉnh sửa phòng hết hạn' : 'Chỉnh sửa'"
            >
              <svg viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon danger" title="Xóa">
              <svg viewBox="0 0 24 24">
                <polyline points="3,6 5,6 21,6"/>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRooms } from '@/composables/useRooms'

const { rooms, loading, error, fetchMyRooms } = useRooms()

/** Computed stats */
const totalRooms = computed(() => rooms.value.length)
const availableRooms = computed(() => rooms.value.filter(r => r.status === 'AVAILABLE').length)
const occupiedRooms = computed(() => rooms.value.filter(r => r.status === 'RENTED').length)

/**
 * Format giá tiền
 * @param {number} price - Giá phòng
 * @returns {string} Giá đã format
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

/**
 * Get display image
 * @param {Object} room
 */
const getRoomImage = (room) => {
  if (room.imageUrls && room.imageUrls.length > 0) {
    return room.imageUrls[0]
  }
  return 'https://via.placeholder.com/300x200?text=No+Image'
}

onMounted(() => {
  fetchMyRooms({ size: 100 }) // Fetch all rooms for now
})
</script>

<style scoped src="@/assets/css/pages/dashboard/RoomManagement.css"></style>