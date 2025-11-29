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
          <h1 v-if="!isEditing" class="page-title">{{ room.title }}</h1>
          <input 
            v-else 
            v-model="editForm.title" 
            class="form-input title-input" 
            placeholder="Tiêu đề tin đăng"
          />
          <span :class="['status-badge', room.status === 'AVAILABLE' ? 'available' : room.status === 'EXPIRED' ? 'expired' : 'rented']">
            {{ room.status === 'AVAILABLE' ? 'Đang tìm khách' : room.status === 'EXPIRED' ? 'Hết hạn' : 'Đã cho thuê' }}
          </span>
        </div>
        <div class="header-actions">
          <template v-if="!isEditing">
            <button 
              @click="handleToggleStatus" 
              class="btn btn-secondary"
              :disabled="room.status === 'EXPIRED'"
              :title="room.status === 'EXPIRED' ? 'Không thể thay đổi trạng thái phòng hết hạn' : ''"
            >
              {{ room.status === 'AVAILABLE' ? 'Đánh dấu đã thuê' : 'Đánh dấu còn trống' }}
            </button>
            <button 
              @click="startEditing" 
              class="btn btn-primary"
              :disabled="room.status === 'EXPIRED'"
              :title="room.status === 'EXPIRED' ? 'Không thể chỉnh sửa phòng hết hạn' : ''"
            >
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
          </template>
          <template v-else>
            <button @click="cancelEditing" class="btn btn-secondary">Hủy bỏ</button>
            <button @click="saveChanges" class="btn btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </template>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="detail-grid">
        <!-- Left Column: Images & Info -->
        <div class="detail-left">
          <!-- Image Gallery / Upload -->
          <div class="image-section">
            <div v-if="!isEditing" class="image-gallery">
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
            
            <div v-else class="image-upload-area">
              <!-- Existing Images -->
              <div v-if="editForm.imageUrls.length > 0" class="image-preview-grid">
                <div 
                  v-for="(imageUrl, index) in editForm.imageUrls" 
                  :key="index"
                  class="image-preview-item"
                >
                  <img :src="imageUrl" :alt="`Room image ${index + 1}`" />
                  <button 
                    type="button" 
                    @click="removeImage(index)"
                    class="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <!-- Upload Input -->
              <div class="upload-control">
                <input 
                  type="file" 
                  @change="handleFileSelect"
                  multiple
                  accept="image/*"
                  class="file-input"
                  id="edit-room-images"
                />
                <label for="edit-room-images" class="upload-label">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Thêm ảnh mới</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="info-section">
            <div class="price-area-row">
              <div class="info-item price">
                <label>Giá phòng</label>
                <span v-if="!isEditing">{{ formatPrice(room.price) }}/tháng</span>
                <input 
                  v-else 
                  v-model.number="editForm.price" 
                  type="number" 
                  class="form-input"
                />
              </div>
              <div class="info-item area">
                <label>Diện tích</label>
                <span v-if="!isEditing">{{ room.area }} m²</span>
                <div v-else class="input-with-unit">
                  <input 
                    v-model.number="editForm.area" 
                    type="number" 
                    class="form-input"
                  />
                  <span class="unit">m²</span>
                </div>
              </div>
            </div>
            
            <div class="info-item address">
              <label>Địa chỉ</label>
              <span v-if="!isEditing">{{ formatAddress(room) }}</span>
              <div v-else class="edit-address-container">
                <AddressInput 
                  :model-value="{
                    city: editForm.city,
                    district: editForm.district,
                    ward: editForm.ward,
                    address: editForm.address
                  }"
                  @update:model-value="onAddressUpdate"
                />
                <div class="map-picker-container">
                  <MapPicker 
                    v-model:latitude="editForm.latitude"
                    v-model:longitude="editForm.longitude"
                    :city="editForm.city"
                    :district="editForm.district"
                    :ward="editForm.ward"
                    @address-found="onMapAddressFound"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="info-section">
            <h3>Mô tả chi tiết</h3>
            <p v-if="!isEditing" class="description-text">{{ room.description }}</p>
            <textarea 
              v-else 
              v-model="editForm.description" 
              rows="6" 
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Utilities -->
          <div class="info-section">
            <h3>Tiện ích</h3>
            <div v-if="!isEditing" class="utilities-list">
              <span v-for="util in room.utilities" :key="util.id" class="utility-tag">
                {{ util.name }}
              </span>
            </div>
            <div v-else class="utilities-grid">
              <label 
                v-for="utility in allUtilities" 
                :key="utility.id" 
                class="utility-checkbox"
              >
                <input 
                  type="checkbox" 
                  :value="utility.id" 
                  v-model="editForm.utilityIds"
                />
                <span>{{ utility.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Right Column: Stats & Quick Info -->
        <div class="detail-right">
          <div class="stats-card">
            <h3>Thông tin khác</h3>
            <div class="stat-row">
              <span>Loại phòng</span>
              <strong v-if="!isEditing">{{ formatRoomType(room.roomType) }}</strong>
              <select v-else v-model="editForm.roomType" class="form-select">
                <option value="PHONG_TRO">Phòng trọ</option>
                <option value="CHUNG_CU">Chung cư</option>
                <option value="NHA_NGUYEN_CAN">Nhà nguyên căn</option>
                <option value="CAN_HO_DICH_VU">Căn hộ dịch vụ</option>
                <option value="NHA_MAT_TIEN">Nhà mặt tiền</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
            <div class="stat-row">
              <span>Lượt xem</span>
              <strong>{{ room.viewCount || 0 }}</strong>
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
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRooms } from '@/composables/useRooms'
import { roomService } from '@/services/roomService'
import { utilityService } from '@/services/utilityService'
import { uploadService } from '@/services/uploadService'
import AddressInput from '@/components/form/AddressInput.vue'
import MapPicker from '@/components/map/MapPicker.vue'

const route = useRoute()
const router = useRouter()
const { fetchRoomById } = useRooms()

const room = ref(null)
const loading = ref(true)
const error = ref(null)
const isEditing = ref(false)
const isSaving = ref(false)
const allUtilities = ref([])
const selectedFiles = ref([])


// Edit form state
const editForm = reactive({
  title: '',
  description: '',
  price: 0,
  area: 0,
  address: '',
  city: '',
  district: '',
  ward: '',
  latitude: null,
  longitude: null,
  roomType: '',
  utilityIds: [],
  imageUrls: []
})

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

const loadUtilities = async () => {
  try {
    const response = await utilityService.getAllUtilities()
    if (response.data) {
      allUtilities.value = response.data
    }
  } catch (err) {
    console.error('Error loading utilities:', err)
  }
}

const startEditing = async () => {
  if (!allUtilities.value.length) {
    await loadUtilities()
  }
  
  // Populate form with current data
  Object.assign(editForm, {
    title: room.value.title,
    description: room.value.description,
    price: room.value.price,
    area: room.value.area,
    address: room.value.address,
    city: room.value.city,
    district: room.value.district,
    ward: room.value.ward,
    latitude: room.value.latitude,
    longitude: room.value.longitude,
    roomType: room.value.roomType,
    utilityIds: room.value.utilities?.map(u => u.id) || [],
    imageUrls: [...(room.value.imageUrls || [])]
  })
  
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  selectedFiles.value = []
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        editForm.imageUrls.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  editForm.imageUrls.splice(index, 1)
  // Note: Handling removal from selectedFiles vs existing URLs is complex, 
  // for simplicity we just remove from the preview list.
  // In a real app, we'd track which are new files vs existing URLs.
}

const onAddressUpdate = (data) => {
  editForm.city = data.city
  editForm.district = data.district
  editForm.ward = data.ward
  editForm.address = data.address
}

const onMapAddressFound = (addressData) => {
  // Similar logic to PostRoom.vue
  const city = addressData.city || addressData.state || addressData.province
  if (city && !editForm.city) editForm.city = city
  
  const district = addressData.district || addressData.county || addressData.suburb
  if (district && !editForm.district) editForm.district = district
  
  const ward = addressData.quarter || addressData.neighbourhood || addressData.village || addressData.hamlet
  if (ward && !editForm.ward) editForm.ward = ward

  let detailedAddr = ''
  if (addressData.house_number) detailedAddr += `${addressData.house_number} `
  if (addressData.road) detailedAddr += addressData.road
  
  if (!editForm.address && detailedAddr) {
    editForm.address = detailedAddr.trim()
  }
}

const saveChanges = async () => {
  isSaving.value = true
  try {
    // Upload new images if any
    let finalImageUrls = editForm.imageUrls.filter(url => url.startsWith('http'))
    
    if (selectedFiles.value.length > 0) {
      const uploadResponse = await uploadService.uploadRoomImages(selectedFiles.value)
      const newUrls = uploadResponse.data?.imageUrls || uploadResponse.data || []
      finalImageUrls = [...finalImageUrls, ...newUrls]
    }

    const updateData = {
      ...editForm,
      imageUrls: finalImageUrls
    }

    await roomService.updateRoom(room.value.id, updateData)
    
    // Refresh data
    await loadRoomDetail()
    isEditing.value = false
    alert('Cập nhật thành công!')
  } catch (err) {
    alert('Lỗi khi cập nhật: ' + err.message)
  } finally {
    isSaving.value = false
  }
}

const handleToggleStatus = async () => {
  if (!room.value) return
  try {
    const response = await roomService.toggleRoomStatus(room.value.id)
    if (response.status === 200 && response.data) {
      // Update local state with data from backend
      room.value = response.data
      alert('Đã thay đổi trạng thái phòng thành công!')
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

const formatRoomType = (type) => {
  const types = {
    'PHONG_TRO': 'Phòng trọ',
    'CHUNG_CU': 'Chung cư',
    'NHA_NGUYEN_CAN': 'Nhà nguyên căn',
    'CAN_HO_DICH_VU': 'Căn hộ dịch vụ',
    'NHA_MAT_TIEN': 'Nhà mặt tiền',
    'STUDIO': 'Studio'
  }
  return types[type] || type
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
  flex: 1;
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

.title-input {
  font-size: 20px;
  font-weight: 700;
  width: 100%;
  max-width: 500px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.available {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.rented {
  background-color: #fce8e6;
  color: #c5221f;
}

.status-badge.expired {
  background-color: #f3f4f6;
  color: #6b7280;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  align-items: center;
}

.stat-row:last-child {
  border-bottom: none;
}

/* Edit Mode Styles */
.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
}

.utilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.utility-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.image-upload-area {
  border: 2px dashed #d1d5db;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 4/3;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #6b7280;
}

.file-input {
  display: none;
}

.edit-address-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-picker-container {
  height: 300px;
  margin-top: 16px;
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
