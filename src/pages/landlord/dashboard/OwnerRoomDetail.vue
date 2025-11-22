<template>
  <div class="owner-room-detail">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Đang tải thông tin phòng...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <router-link to="/dashboard/rooms" class="btn btn-secondary">Quay lại danh sách</router-link>
    </div>

    <div v-else-if="room" class="detail-content">
      <!-- Header with Actions -->
      <div class="detail-header">
        <div class="header-left">
          <router-link to="/dashboard/rooms" class="back-link">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Quay lại
          </router-link>
          <h1 class="page-title">{{ room.title }}</h1>
          <span :class="['status-badge', room.status === 'AVAILABLE' ? 'available' : 'rented']">
            {{ room.status === 'AVAILABLE' ? 'Đang tìm khách' : 'Đã cho thuê' }}
          </span>
        </div>
        <div class="header-actions">
          <button @click="handleToggleStatus" class="btn btn-secondary">
            {{ room.status === 'AVAILABLE' ? 'Đánh dấu đã thuê' : 'Đánh dấu còn trống' }}
          </button>
          <button class="btn btn-primary">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Chỉnh sửa
          </button>
          <button @click="handleDelete" class="btn btn-danger">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Xóa phòng
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="detail-grid">
        <!-- Left Column: Images & Info -->
        <div class="detail-left">
          <!-- Image Gallery -->
          <div class="image-gallery">
            <div class="main-image">
              <img 
                :src="room.imageUrls?.[0] || 'https://via.placeholder.com/800x500?text=No+Image'" 
                :alt="room.title"
              />
            </div>
            <div v-if="room.imageUrls?.length > 1" class="thumbnail-list">
              <img 
                v-for="(img, idx) in room.imageUrls.slice(1, 5)" 
                :key="idx" 
                :src="img" 
                class="thumbnail"
              />
              <div v-if="room.imageUrls.length > 5" class="more-images">
                +{{ room.imageUrls.length - 5 }}
              </div>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="info-section">
            <div class="price-area-row">
              <div class="info-item price">
                <label>Giá phòng</label>
                <span>{{ formatPrice(room.price) }}/tháng</span>
              </div>
              <div class="info-item area">
                <label>Diện tích</label>
                <span>{{ room.area }} m²</span>
              </div>
            </div>
            
            <div class="info-item address">
              <label>Địa chỉ</label>
              <span>{{ formatAddress(room) }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="info-section">
            <h3>Mô tả chi tiết</h3>
            <p class="description-text">{{ room.description }}</p>
          </div>

          <!-- Utilities -->
          <div class="info-section" v-if="room.utilities?.length">
            <h3>Tiện ích</h3>
            <div class="utilities-list">
              <span v-for="util in room.utilities" :key="util.id" class="utility-tag">
                {{ util.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: Stats & Quick Info -->
        <div class="detail-right">
          <div class="stats-card">
            <h3>Thống kê</h3>
            <div class="stat-row">
              <span>Lượt xem</span>
              <strong>--</strong>
            </div>
            <div class="stat-row">
              <span>Lượt thích</span>
              <strong>{{ room.favoriteCount || 0 }}</strong>
            </div>
            <div class="stat-row">
              <span>Ngày đăng</span>
              <strong>{{ formatDate(room.createdAt) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRooms } from '@/composables/useRooms'
import { roomService } from '@/services/roomService'

const route = useRoute()
const router = useRouter()
const { fetchRoomById } = useRooms()

const room = ref(null)
const loading = ref(true)
const error = ref(null)

const loadRoomDetail = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await fetchRoomById(route.params.id)
    room.value = data
  } catch (err) {
    error.value = err.message || 'Không thể tải thông tin phòng'
  } finally {
    loading.value = false
  }
}

const handleToggleStatus = async () => {
  if (!room.value) return
  try {
    const response = await roomService.toggleRoomStatus(room.value.id)
    if (response.status === 200) {
      // Update local state
      room.value.status = room.value.status === 'AVAILABLE' ? 'RENTED' : 'AVAILABLE'
    }
  } catch (err) {
    alert('Không thể thay đổi trạng thái phòng: ' + err.message)
  }
}

const handleDelete = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể hoàn tác.')) return
  
  try {
    await roomService.deleteRoom(room.value.id)
    router.push('/dashboard/rooms')
  } catch (err) {
    alert('Không thể xóa phòng: ' + err.message)
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

const formatAddress = (room) => {
  return `${room.address}, ${room.ward}, ${room.district}, ${room.city}`
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
  loadRoomDetail()
})
</script>

<style scoped>
.owner-room-detail {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  text-decoration: none;
  font-weight: 500;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.status-badge.available {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.rented {
  background-color: #fce8e6;
  color: #c5221f;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #00b894;
  color: white;
}

.btn-secondary {
  background-color: #f1f2f6;
  color: #2d3436;
}

.btn-danger {
  background-color: #ffeaa7;
  color: #d63031;
}

.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.detail-left {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.image-gallery {
  margin-bottom: 24px;
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.thumbnail-list {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.info-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.info-section:last-child {
  border-bottom: none;
}

.price-area-row {
  display: flex;
  gap: 40px;
  margin-bottom: 16px;
}

.info-item label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.info-item span {
  font-size: 18px;
  font-weight: 600;
  color: #2d3436;
}

.info-item.price span {
  color: #d63031;
  font-size: 20px;
}

.description-text {
  line-height: 1.6;
  color: #444;
  white-space: pre-line;
}

.utilities-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.utility-tag {
  background: #f5f6fa;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #2f3640;
}

.detail-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f6;
}

.stat-row:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
