<template>
  <router-link 
    :to="{ name: 'RoomDetail', params: { id: room.id } }" 
    class="room-card-modern"
    :class="{ 'expired': room.status === 'EXPIRED' }"
  >
    <!-- Image Section -->
    <div class="room-image-section">
      <img 
        :src="roomImage" 
        :alt="room.title" 
        class="room-image"
        loading="lazy"
        @error="handleImageError"
      />

      <!-- Top Overlay Badges -->
      <div class="badge-overlay-left">
        <span v-if="room.status === 'AVAILABLE'" class="status-pill status-available">
          <span class="pulse-dot"></span> Còn trống
        </span>
        <span v-else-if="room.status === 'RENTED'" class="status-pill status-rented">Đã thuê</span>
        <span v-else-if="room.status === 'EXPIRED'" class="status-pill status-expired">Hết hạn</span>
      </div>

      <!-- Favorite Button -->
      <button 
        class="favorite-btn-modern" 
        :class="{ favorited: isRoomFavorited }"
        @click.prevent="toggleFavorite"
        :title="isRoomFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
      >
        <Icon :icon="isRoomFavorited ? 'ph:heart-fill' : 'ph:heart-bold'" class="fav-icon" />
      </button>

      <!-- Bottom Gradient Overlay -->
      <div class="image-gradient-shadow"></div>
      <div class="verified-tag">
        <Icon icon="ph:check-circle-fill" class="verified-icon" />
        Xác minh
      </div>
    </div>

    <!-- Content Section -->
    <div class="room-content-section">
      <!-- Title & Category -->
      <div class="room-header">
        <span class="category-badge">{{ roomTypeLabel }}</span>
        <h3 class="room-title">{{ room.title }}</h3>
      </div>

      <!-- Price Banner -->
      <div class="price-container">
        <span class="room-price">{{ formatPrice(room.price) }}</span>
        <span class="price-unit">/ tháng</span>
      </div>

      <!-- Details Specs -->
      <div class="room-specs">
        <div class="spec-item location-spec">
          <Icon icon="ph:map-pin-bold" class="spec-icon" />
          <span class="truncate-text">{{ fullAddress }}</span>
        </div>

        <div class="spec-grid">
          <div class="spec-item">
            <Icon icon="ph:bounding-box-bold" class="spec-icon" />
            <span>{{ room.area ? room.area + ' m²' : 'N/A' }}</span>
          </div>
          <div class="spec-item">
            <Icon icon="ph:clock-bold" class="spec-icon" />
            <span>{{ formatDate(room.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Utilities Tags -->
      <div v-if="room.utilities && room.utilities.length > 0" class="utility-chips">
        <span 
          v-for="utility in displayUtilities" 
          :key="utility.id"
          class="chip-item"
        >
          {{ utility.name }}
        </span>
        <span v-if="room.utilities.length > 3" class="chip-item chip-more">
          +{{ room.utilities.length - 3 }}
        </span>
      </div>

      <!-- Footer Action -->
      <div class="room-card-footer">
        <span class="view-detail-text">Chi tiết phòng</span>
        <Icon icon="ph:arrow-right-bold" class="arrow-icon" />
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-favorite'])
const authStore = useAuthStore()

const isRoomFavorited = computed(() => {
  if (!authStore.isLoggedIn) return false
  return authStore.favorites?.some(fav => fav.id === props.room.id) || false
})

const fallbackImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f5b9b964a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
]

const roomImage = computed(() => {
  if (props.room?.images && props.room.images.length > 0) {
    const firstImg = props.room.images[0]
    const url = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.imageUrl)
    if (url && typeof url === 'string' && url.trim() !== '' && !url.includes('placeholder')) {
      return url
    }
  }
  const idx = Math.abs(props.room?.id || 0) % fallbackImages.length
  return fallbackImages[idx]
})

const handleImageError = (e) => {
  const idx = Math.abs(props.room?.id || 0) % fallbackImages.length
  e.target.src = fallbackImages[idx]
}

const fullAddress = computed(() => {
  const parts = []
  if (props.room.address) parts.push(props.room.address)
  if (props.room.district) parts.push(props.room.district)
  if (props.room.province) parts.push(props.room.province)
  return parts.join(', ') || 'Chưa cập nhật địa chỉ'
})

const roomTypeLabel = computed(() => {
  const types = {
    'ROOM': 'Phòng trọ',
    'APARTMENT': 'Căn hộ mini',
    'CONDO': 'Chung cư',
    'HOUSE': 'Nhà nguyên căn',
    'SHARE': 'Ở ghép'
  }
  return types[props.room.type] || 'Phòng cho thuê'
})

const displayUtilities = computed(() => {
  if (!props.room.utilities) return []
  return props.room.utilities.slice(0, 3)
})

const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  if (price >= 1000000) {
    return (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + ' triệu'
  }
  return price.toLocaleString('vi-VN') + ' đ'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Mới đăng'
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 1) return 'Hôm nay'
  if (diffDays <= 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

const toggleFavorite = () => {
  emit('toggle-favorite', props.room)
}
</script>

<style scoped src="@/assets/css/RoomCard.css"></style>
