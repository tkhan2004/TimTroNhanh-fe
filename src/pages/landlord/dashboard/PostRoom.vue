<template>
  <div class="post-room">
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="page-subtitle">{{ isEditMode ? 'Cập nhật thông tin phòng trọ của bạn' : 'Tạo tin đăng mới để thu hút khách thuê' }}</p>
    </div>

    <div class="post-form-container">
      <form @submit.prevent="submitPost" class="post-form">
        <!-- Thông tin cơ bản -->
        <div class="form-section">
          <h3 class="section-title">Thông tin cơ bản</h3>
          
          <div class="form-group">
            <label class="required">Tiêu đề tin đăng</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="VD: Phòng trọ cao cấp gần trường ĐH Bách Khoa"
              class="form-input"
              required
              maxlength="255"
            />
            <span class="char-count">{{ form.title.length }}/255</span>
          </div>
          
          <div class="form-group">
            <label>Mô tả chi tiết</label>
            <textarea 
              v-model="form.description" 
              rows="6"
              placeholder="Mô tả chi tiết về phòng trọ, tiện ích, vị trí, giao thông..."
              class="form-textarea"
              maxlength="2000"
            ></textarea>
            <span class="char-count">{{ form.description.length }}/2000</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="required">Giá thuê (VNĐ/tháng)</label>
              <input 
                v-model.number="form.price" 
                type="number" 
                placeholder="VD: 3000000"
                class="form-input"
                required
                min="1"
                step="100000"
              />
            </div>

            <div class="form-group">
              <label>Diện tích (m²)</label>
              <input 
                v-model.number="form.area" 
                type="number" 
                placeholder="VD: 25"
                class="form-input"
                min="1"
                step="0.5"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="required">Loại phòng</label>
            <select v-model="form.roomType" class="form-select" required>
              <option value="">Chọn loại phòng</option>
              <option value="PHONG_TRO">Phòng trọ</option>
              <option value="CHUNG_CU">Chung cư</option>
              <option value="NHA_NGUYEN_CAN">Nhà nguyên căn</option>
              <option value="CAN_HO_DICH_VU">Căn hộ dịch vụ</option>
              <option value="NHA_MAT_TIEN">Nhà mặt tiền</option>
              <option value="STUDIO">Studio</option>
            </select>
          </div>
        </div>

        <!-- Địa chỉ & Vị trí -->
        <div class="form-section">
          <h3 class="section-title">Địa chỉ & Vị trí</h3>
          
          <AddressInput 
            :model-value="{
              city: form.city,
              district: form.district,
              ward: form.ward,
              address: form.address
            }"
            @update:model-value="onAddressUpdate"
            :required="true"
          />

          <div class="form-group map-section">
            <label>Vị trí trên bản đồ</label>
            <MapPicker 
              v-model:latitude="form.latitude"
              v-model:longitude="form.longitude"
              :city="form.city"
              :district="form.district"
              :ward="form.ward"
              @address-found="onMapAddressFound"
            />
          </div>
        </div>

        <!-- Tiện ích -->
        <div class="form-section">
          <h3 class="section-title">Tiện ích</h3>
          
          <div v-if="loadingUtilities" class="loading-utilities">
            Đang tải danh sách tiện ích...
          </div>
          
          <div v-else class="utilities-grid">
            <label 
              v-for="utility in utilities" 
              :key="utility.id" 
              class="utility-checkbox"
            >
              <input 
                type="checkbox" 
                :value="utility.id" 
                v-model="form.utilityIds"
              />
              <span>{{ utility.name }}</span>
            </label>
          </div>
        </div>

        <!-- Hình ảnh -->
        <div class="form-section">
          <h3 class="section-title">Hình ảnh</h3>
          
          <div class="image-upload-area">
            <input 
              type="file" 
              ref="fileInput"
              @change="handleFileSelect"
              multiple
              accept="image/*"
              class="file-input"
              id="room-images"
            />
            <label for="room-images" class="upload-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Chọn ảnh (có thể chọn nhiều)</span>
            </label>
          </div>

          <div v-if="uploadingImages" class="uploading-status">
            <div class="spinner"></div>
            <span>Đang tải ảnh lên...</span>
          </div>

          <div v-if="form.imageUrls.length > 0" class="image-preview-grid">
            <div 
              v-for="(imageUrl, index) in form.imageUrls" 
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

          <div v-if="selectedFiles.length > 0 && !uploadingImages" class="selected-files">
            <p>Đã chọn {{ selectedFiles.length }} ảnh. Nhấn "Đăng tin" để tải lên.</p>
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="form-section">
          <h3 class="section-title">Trạng thái</h3>
          
          <div class="form-group">
            <label>Trạng thái phòng</label>
            <select v-model="form.status" class="form-select">
              <option value="AVAILABLE">Còn trống</option>
              <option value="RENTED">Đã cho thuê</option>
            </select>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="resetForm"
            :disabled="isSubmitting"
          >
            Đặt lại
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            <span>{{ submitButtonText }}</span>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="success" class="alert alert-success">
          Đăng tin thành công! Đang chuyển hướng...
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { roomService } from '@/services/roomService'
import { utilityService } from '@/services/utilityService'
import { uploadService } from '@/services/uploadService'
import AddressInput from '@/components/form/AddressInput.vue'
import MapPicker from '@/components/map/MapPicker.vue'

const router = useRouter()
const route = useRoute()

/** Form data */
const form = ref({
  title: '',
  description: '',
  price: null,
  area: null,
  address: '',
  city: '',
  district: '',
  ward: '',
  latitude: null,
  longitude: null,
  status: 'AVAILABLE',
  roomType: '',
  utilityIds: [],
  imageUrls: []
})

/** State */
const utilities = ref([])
const loadingUtilities = ref(false)
const selectedFiles = ref([])
const uploadingImages = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)
const isEditMode = ref(false)
const roomId = ref(null)

/** Computed */
const isFormValid = computed(() => {
  return form.value.title && 
         form.value.price && 
         form.value.address && 
         form.value.roomType
})

const pageTitle = computed(() => isEditMode.value ? 'Cập nhật tin đăng' : 'Đăng tin cho thuê phòng trọ')
const submitButtonText = computed(() => {
  if (isSubmitting.value) return isEditMode.value ? 'Đang cập nhật...' : 'Đang đăng tin...'
  return isEditMode.value ? 'Cập nhật tin' : 'Đăng tin'
})

/** Load utilities */
const loadUtilities = async () => {
  loadingUtilities.value = true
  try {
    const response = await utilityService.getAllUtilities()
    if (response.status === 200 && response.data) {
      utilities.value = response.data
    }
  } catch (err) {
    console.error('Error loading utilities:', err)
    error.value = 'Không thể tải danh sách tiện ích'
  } finally {
    loadingUtilities.value = false
  }
}

/** Load room details for edit */
const loadRoomDetails = async (id) => {
  try {
    const data = await roomService.getRoomById(id)
    if (data) {
      form.value = {
        title: data.title,
        description: data.description,
        price: data.price,
        area: data.area,
        address: data.address,
        city: data.city,
        district: data.district,
        ward: data.ward,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
        roomType: data.roomType,
        utilityIds: data.utilities?.map(u => u.id) || [],
        imageUrls: data.imageUrls || []
      }
    }
  } catch (err) {
    console.error('Error loading room details:', err)
    error.value = 'Không thể tải thông tin phòng để chỉnh sửa'
  }
}

const onAddressUpdate = (data) => {
  form.value.city = data.city
  form.value.district = data.district
  form.value.ward = data.ward
  form.value.address = data.address
}

const onMapAddressFound = (addressData) => {
  console.log('Nominatim Address Data:', addressData) // Debug log

  // Extract address components from Nominatim data
  // Nominatim structure varies, so we check multiple fields
  
  // 1. City/Province
  const city = addressData.city || addressData.state || addressData.province
  if (city && !form.value.city) {
    form.value.city = city
  }
  
  // 2. District
  const district = addressData.district || addressData.county || addressData.suburb
  if (district && !form.value.district) {
    form.value.district = district
  }
  
  // 3. Ward
  const ward = addressData.quarter || addressData.neighbourhood || addressData.village || addressData.hamlet
  if (ward && !form.value.ward) {
    form.value.ward = ward
  }

  // 4. Detailed Address (Road + House Number)
  let detailedAddr = ''
  if (addressData.house_number) detailedAddr += `${addressData.house_number} `
  if (addressData.road) detailedAddr += addressData.road
  
  // Only update if field is empty
  if (!form.value.address && detailedAddr) {
    form.value.address = detailedAddr.trim()
  }
}

/** Handle file select */
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = files
  
  // Preview images
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // Preview URL (chưa upload)
        form.value.imageUrls.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

/** Remove image */
const removeImage = (index) => {
  form.value.imageUrls.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

/** Upload images */
const uploadImages = async () => {
  if (selectedFiles.value.length === 0) {
    return []
  }

  uploadingImages.value = true
  try {
    const response = await uploadService.uploadRoomImages(selectedFiles.value)
    
    console.log('Upload response:', response) // Debug log
    
    // Extract ONLY the imageUrls array from response
    // Response structure: { status: 200, message: "...", data: { imageUrls: [...], successCount: 1, totalFiles: 1 } }
    if (response && response.data && Array.isArray(response.data.imageUrls)) {
      return response.data.imageUrls
    }
    // Fallback: if response.data is directly an array
    else if (response && Array.isArray(response.data)) {
      return response.data
    }
    // Fallback: if response itself is an array
    else if (Array.isArray(response)) {
      return response
    }
    
    console.error('Unexpected upload response format:', response)
    return []
  } catch (err) {
    console.error('Error uploading images:', err)
    const message = err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.'
    throw new Error(message)
  } finally {
    uploadingImages.value = false
  }
}

/** Submit form */
const submitPost = async () => {
  if (!isFormValid.value) {
    error.value = 'Vui lòng điền đầy đủ thông tin bắt buộc'
    return
  }

  isSubmitting.value = true
  error.value = ''
  success.value = false

  try {
    // Upload images first
    let imageUrls = []
    if (selectedFiles.value.length > 0) {
      const uploadedUrls = await uploadImages()
      imageUrls = [...form.value.imageUrls.filter(url => url.startsWith('http')), ...uploadedUrls]
    } else {
      // Use existing URLs if no new files selected
      imageUrls = form.value.imageUrls.filter(url => url.startsWith('http'))
    }

    // Prepare room data
    const roomData = {
      title: form.value.title,
      description: form.value.description || '',
      price: form.value.price,
      address: form.value.address,
      roomType: form.value.roomType,
      status: form.value.status,
      utilityIds: form.value.utilityIds,
      imageUrls: imageUrls
    }

    // Optional fields
    if (form.value.area) {
      roomData.area = form.value.area
    }
    if (form.value.city) {
      roomData.city = form.value.city
    }
    if (form.value.district) {
      roomData.district = form.value.district
    }
    if (form.value.ward) {
      roomData.ward = form.value.ward
    }
    if (form.value.latitude !== null) {
      roomData.latitude = form.value.latitude
    }
    if (form.value.longitude !== null) {
      roomData.longitude = form.value.longitude
    }

    let response
    if (isEditMode.value) {
      // Update room
      response = await roomService.updateRoom(roomId.value, roomData)
    } else {
      // Create room
      response = await roomService.createRoom(roomData)
    }
    
    if (response.status === 200 && response.data) {
      success.value = true
      setTimeout(() => {
        router.push({ name: 'RoomManagement' })
      }, 1500)
    } else {
      error.value = response.message || (isEditMode.value ? 'Cập nhật thất bại' : 'Đăng tin thất bại')
    }
  } catch (err) {
    error.value = err.message || (isEditMode.value ? 'Có lỗi xảy ra khi cập nhật' : 'Có lỗi xảy ra khi đăng tin')
  } finally {
    isSubmitting.value = false
  }
}

/** Reset form */
const resetForm = () => {
  if (isEditMode.value) {
    loadRoomDetails(roomId.value)
    return
  }
  
  form.value = {
    title: '',
    description: '',
    price: null,
    area: null,
    address: '',
    city: '',
    district: '',
    ward: '',
    latitude: null,
    longitude: null,
    status: 'AVAILABLE',
    roomType: '',
    utilityIds: [],
    imageUrls: []
  }
  selectedFiles.value = []
  error.value = ''
  success.value = false
}

/** Load utilities on mount */
onMounted(async () => {
  await loadUtilities()
  
  // Check for edit mode
  if (route.query.id) {
    isEditMode.value = true
    roomId.value = route.query.id
    await loadRoomDetails(roomId.value)
  }
})
</script>

<style scoped src="@/assets/css/pages/dashboard/PostRoom.css"></style>
