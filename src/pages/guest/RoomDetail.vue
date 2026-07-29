<template>
  <div v-if="loading" class="detail-loading-state">
    <div class="spinner"></div>
    <p>Đang tải chi tiết phòng trọ...</p>
  </div>

  <div v-else-if="error" class="detail-error-state">
    <p>{{ error }}</p>
    <button @click="fetchRoomDetails" class="btn-modern-secondary">Thử lại</button>
  </div>

  <div v-else-if="room" class="room-detail-container">
    <!-- Header Title Bar -->
    <div class="detail-header-bar">
      <div class="header-left">
        <span class="badge-pill badge-verified">✓ Chính chủ xác minh</span>
        <h1 class="detail-title">{{ room.title }}</h1>
        <p class="detail-address">
          <svg viewBox="0 0 24 24" class="icon-location" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {{ formatAddress(room) }}
        </p>
      </div>

      <div class="header-actions">
        <button class="action-circle-btn" @click="shareRoom" title="Chia sẻ bài đăng">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>

        <button 
          class="action-circle-btn" 
          :class="{ 'favorited': isRoomFavorited }"
          @click="toggleFavorite"
          title="Lưu yêu thích"
        >
          <svg viewBox="0 0 24 24" :fill="isRoomFavorited ? '#ef4444' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Airbnb Bento 5-Photo Gallery Grid -->
    <section class="bento-gallery">
      <div class="gallery-main-item" @click="openImageModal(0)">
        <img :src="getRoomImage(0)" :alt="room.title" class="gallery-img" />
      </div>
      <div class="gallery-sub-grid">
        <div 
          v-for="i in 4" 
          :key="i" 
          class="gallery-sub-item"
          @click="openImageModal(i)"
        >
          <img :src="getRoomImage(i)" :alt="`Room image ${i}`" class="gallery-img" />
        </div>
      </div>
    </section>

    <!-- Main Content & Sticky Contact Sidebar -->
    <div class="detail-body-grid">
      <!-- Left Column Details -->
      <div class="detail-left-column">
        <!-- Quick Specs Banner -->
        <div class="specs-banner-card glass-panel">
          <div class="spec-tile">
            <span class="tile-label">Giá cho thuê</span>
            <span class="tile-value price-highlight">{{ formatPrice(room.price) }}<small>/tháng</small></span>
          </div>
          <div class="tile-divider"></div>
          <div class="spec-tile">
            <span class="tile-label">Diện tích</span>
            <span class="tile-value">{{ room.area || 'N/A' }} m²</span>
          </div>
          <div class="tile-divider"></div>
          <div class="spec-tile">
            <span class="tile-label">Loại phòng</span>
            <span class="tile-value">{{ getRoomTypeLabel(room.type) }}</span>
          </div>
        </div>

        <!-- Room Description -->
        <section class="info-section">
          <h2 class="section-heading">Thông tin mô tả</h2>
          <div class="description-body">
            <p>{{ room.description || 'Chủ trọ chưa nhập chi tiết mô tả.' }}</p>
          </div>
        </section>

        <!-- Amenities Grid -->
        <section v-if="room.utilities && room.utilities.length > 0" class="info-section">
          <h2 class="section-heading">Tiện ích căn hộ</h2>
          <div class="amenities-grid">
            <div v-for="u in room.utilities" :key="u.id" class="amenity-card">
              <svg viewBox="0 0 24 24" class="amenity-icon" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{{ u.name }}</span>
            </div>
          </div>
        </section>

        <!-- Location & Map Section -->
        <section class="info-section">
          <h2 class="section-heading">Vị trí & Xung quanh</h2>
          <div class="location-box">
            <p class="location-full-text">{{ formatAddress(room) }}</p>
            <div class="neighborhood-badges">
              <span class="badge-item">🎓 Gần trường ĐH</span>
              <span class="badge-item">🛒 Siêu thị / Chợ</span>
              <span class="badge-item">🚌 Bến xe buýt</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column Sticky Landlord Action Card -->
      <aside class="detail-right-column">
        <div class="landlord-sticky-card glass-panel">
          <!-- Landlord Profile Summary -->
          <div class="landlord-profile-header">
            <div class="landlord-avatar">
              <span>{{ getAvatarLetter(room.ownerName || 'C') }}</span>
            </div>
            <div class="landlord-info">
              <h3 class="landlord-name">{{ room.ownerName || 'Chủ phòng trọ' }}</h3>
              <span class="landlord-badge">✓ Chủ nhà đáng tin cậy</span>
            </div>
          </div>

          <!-- Price Action Banner -->
          <div class="card-price-banner">
            <span class="banner-price">{{ formatPrice(room.price) }}</span>
            <span class="banner-sub">/ tháng (Cọc 1 tháng)</span>
          </div>

          <!-- Contact Buttons Stack -->
          <div class="contact-buttons-stack">
            <button class="btn-modern-primary btn-call" @click="handleCall">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{{ showPhone ? (room.phone || '0987.654.321') : 'Hiện số điện thoại' }}</span>
            </button>

            <button class="btn-modern-secondary btn-chat" @click="openChat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Nhắn tin với chủ nhà</span>
            </button>
          </div>

          <!-- Guarantee Badge -->
          <div class="guarantee-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Cam kết giữ đúng giá & không thu phí môi giới người thuê.</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { roomService } from '@/services/roomService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const room = ref(null)
const showPhone = ref(false)

const isRoomFavorited = computed(() => {
  if (!authStore.isLoggedIn) return false
  return authStore.favorites?.some(fav => fav.id === room.value?.id) || false
})

const getRoomImage = (index) => {
  if (room.value?.images && room.value.images.length > index) {
    const img = room.value.images[index]
    return typeof img === 'string' ? img : img.url || img.imageUrl
  }
  return 'https://images.unsplash.com/photo-1560448204-e02f5b9b964a?auto=format&fit=crop&w=800&q=80'
}

const getAvatarLetter = (name) => name ? name.charAt(0).toUpperCase() : 'C'

const formatPrice = (price) => {
  if (!price) return 'Liên hệ'
  if (price >= 1000000) {
    return (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1) + ' triệu'
  }
  return price.toLocaleString('vi-VN') + ' đ'
}

const formatAddress = (r) => {
  const parts = []
  if (r.address) parts.push(r.address)
  if (r.district) parts.push(r.district)
  if (r.province) parts.push(r.province)
  return parts.join(', ') || 'Chưa cập nhật'
}

const getRoomTypeLabel = (type) => {
  const types = { 'ROOM': 'Phòng trọ', 'APARTMENT': 'Căn hộ mini', 'SHARE': 'Ở ghép' }
  return types[type] || 'Phòng cho thuê'
}

const handleCall = () => { showPhone.value = true }
const openChat = () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Home', query: { login: 'true' } })
    return
  }
  router.push({ name: 'Chat', query: { roomId: room.value.id } })
}

const toggleFavorite = () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Home', query: { login: 'true' } })
    return
  }
  authStore.toggleFavorite(room.value)
}

const shareRoom = () => {
  if (navigator.share) {
    navigator.share({ title: room.value?.title, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('Đã chép liên kết vào bộ nhớ tạm!')
  }
}

const openImageModal = (i) => {
  // Modal gallery trigger
}

const fetchRoomDetails = async () => {
  loading.value = true
  error.value = null
  try {
    const id = route.params.id
    const res = await roomService.getRoomById(id)
    room.value = res
  } catch (err) {
    error.value = 'Không thể lấy thông tin phòng trọ.'
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchRoomDetails() })
</script>

<style scoped src="@/assets/css/RoomDetail.css"></style>