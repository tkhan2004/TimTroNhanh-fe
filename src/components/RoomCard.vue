<template>
  <router-link 
    :to="{ name: 'RoomDetail', params: { id: room.id } }" 
    class="room-card-horizontal"
    :class="{ 'expired': room.status === 'EXPIRED' }"
  >
    <!-- Image Section -->
    <div class="room-image-section">
      <img 
        :src="roomImage" 
        :alt="room.title" 
        class="room-image"
      />
      <span v-if="room.status === 'AVAILABLE'" class="status-badge available">Còn trống</span>
      <span v-else-if="room.status === 'RENTED'" class="status-badge rented">Đã thuê</span>
      <span v-else-if="room.status === 'EXPIRED'" class="status-badge expired">Hết hạn</span>
      <button 
        class="favorite-btn show-on-hover" 
        :class="{ favorited: isRoomFavorited }"
        @click.prevent="toggleFavorite"
        :title="isRoomFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
      >
        <svg viewBox="0 0 24 24" :fill="isRoomFavorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <!-- Content Section -->
    <div class="room-content-section">
      <!-- Title and Price -->
      <div class="room-header">
        <h3 class="room-title">{{ room.title }}</h3>
        <p class="room-price">{{ formatPrice(room.price) }}</p>
      </div>

      <!-- Details Grid -->
      <div class="room-details">
        <!-- Full Address -->
        <div class="detail-item address">
          <svg viewBox="0 0 24 24" class="detail-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ fullAddress }}</span>
        </div>

        <!-- Area and Room Type -->
        <div class="detail-row">
          <div class="detail-item">
            <svg viewBox="0 0 24 24" class="detail-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
            <span>{{ room.area ? room.area + ' m²' : 'Chưa cập nhật' }}</span>
          </div>
          <div class="detail-item">
            <svg viewBox="0 0 24 24" class="detail-icon">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{{ roomTypeLabel }}</span>
          </div>
        </div>

        <!-- Utilities -->
        <div v-if="room.utilities && room.utilities.length > 0" class="utilities-section">
          <svg viewBox="0 0 24 24" class="detail-icon">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <div class="utilities-list">
            <span 
              v-for="(utility, index) in displayUtilities" 
              :key="utility.id"
              class="utility-tag"
            >
              {{ utility.name }}
            </span>
            <span v-if="room.utilities.length > 4" class="utility-more">
              +{{ room.utilities.length - 4 }} tiện ích
            </span>
          </div>
        </div>
      </div>

      <!-- Footer with Posted Date -->
      <div class="room-footer">
        <span class="posted-date">
          <svg viewBox="0 0 24 24" class="detail-icon">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ formatDate(room.createdAt) }}
        </span>
        <span class="view-detail-link">Xem chi tiết →</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavorites } from '@/composables/useFavorites'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const { isFavorite, toggleFavorite: toggleFav } = useFavorites()

// Get first image from imageUrls array or use placeholder
const roomImage = computed(() => {
  if (props.room.imageUrls && props.room.imageUrls.length > 0) {
    return props.room.imageUrls[0]
  }
  return 'https://via.placeholder.com/400x300?text=No+Image'
})

// Format location from address fields
const roomLocation = computed(() => {
  const parts = []
  if (props.room.ward) parts.push(props.room.ward)
  if (props.room.district) parts.push(props.room.district)
  if (props.room.city) parts.push(props.room.city)
  return parts.join(', ') || props.room.address || 'Chưa cập nhật'
})

// Full address with street
const fullAddress = computed(() => {
  const parts = []
  if (props.room.address) parts.push(props.room.address)
  if (props.room.ward) parts.push(props.room.ward)
  if (props.room.district) parts.push(props.room.district)
  if (props.room.city) parts.push(props.room.city)
  return parts.join(', ') || 'Chưa cập nhật địa chỉ'
})

// Display only first 4 utilities
const displayUtilities = computed(() => {
  if (!props.room.utilities || props.room.utilities.length === 0) return []
  return props.room.utilities.slice(0, 4)
})

// Map roomType enum to Vietnamese label
const roomTypeLabel = computed(() => {
  const typeMap = {
    'PHONG_TRO': 'Phòng trọ',
    'CHUNG_CU': 'Chung cư',
    'NHA_NGUYEN_CAN': 'Nhà nguyên căn',
    'CAN_HO_DICH_VU': 'Căn hộ dịch vụ',
    'NHA_MAT_TIEN': 'Nhà mặt tiền',
    'STUDIO': 'Studio'
  }
  return typeMap[props.room.roomType] || props.room.roomType || 'Phòng trọ'
})

const formatPrice = (price) => {
  if (!price || price === 0) {
    return 'Liên hệ lấy giá'
  } else if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + ' triệu/tháng'
  }
  return price.toLocaleString('vi-VN') + ' đ/tháng'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Mới đăng'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffWeeks = Math.floor(diffDays / 7)
  
  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

// Check if room is favorited
const isRoomFavorited = computed(() => isFavorite(props.room.id))

// Toggle favorite
const toggleFavorite = async () => {
  // Check if user is logged in
  if (!authStore.isLoggedIn) {
    // Redirect to login or show login modal
    alert('Vui lòng đăng nhập để lưu phòng yêu thích')
    return
  }

  try {
    await toggleFav(props.room.id)
  } catch (error) {
    console.error('Error toggling favorite:', error)
    alert(error.message || 'Không thể lưu phòng yêu thích')
  }
}
</script>

<!-- Import external CSS file for RoomCard component styles -->
<style src="@/assets/css/RoomCard.css"></style>
