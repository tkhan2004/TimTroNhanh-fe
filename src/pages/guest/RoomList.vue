<template>
  <div class="room-list-container">
    <div class="room-list-content">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <div class="filter-header">
          <h2>Bộ lọc tìm kiếm</h2>
          <button 
            class="reset-filters-btn" 
            @click="resetFilters"
          >
            Đặt lại
          </button>
        </div>

        <!-- Room Type Tabs -->
        <div class="room-type-tabs">
          <button 
            v-for="(type, index) in roomTypes" 
            :key="index"
            @click="selectRoomType(type.value)"
            :class="['room-type-tab', { 'active': selectedRoomType === type.value }]"
          >
            {{ type.label }}
          </button>
        </div>

        <!-- Location Filter -->
        <div class="filter-section">
          <h3>Địa điểm</h3>
          <div class="location-filters">
            <select 
              v-model="selectedCity" 
              class="filter-select"
            >
              <option value="">Tất cả thành phố</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="hn">Hà Nội</option>
              <option value="dn">Đà Nẵng</option>
            </select>

            <select 
              v-model="selectedDistrict" 
              class="filter-select"
            >
              <option value="">Tất cả quận/huyện</option>
              <option 
                v-for="district in getDistrictsByCity(selectedCity)" 
                :key="district.value" 
                :value="district.value"
              >
                {{ district.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Price Filter -->
        <div class="filter-section">
          <h3>Mức giá</h3>
          <div class="price-filters">
            <div class="price-range-inputs">
              <input 
                type="number" 
                v-model="priceFrom" 
                placeholder="Từ" 
                class="price-input"
              />
              <span>-</span>
              <input 
                type="number" 
                v-model="priceTo" 
                placeholder="Đến" 
                class="price-input"
              />
              <span class="price-unit">triệu</span>
            </div>
            <div class="price-presets">
              <button 
                v-for="preset in pricePresets" 
                :key="preset.label"
                @click="applyPricePreset(preset)"
                class="price-preset-btn"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Area Filter -->
        <div class="filter-section">
          <h3>Diện tích</h3>
          <div class="area-filters">
            <div class="area-range-inputs">
              <input 
                type="number" 
                v-model="areaFrom" 
                placeholder="Từ" 
                class="area-input"
              />
              <span>-</span>
              <input 
                type="number" 
                v-model="areaTo" 
                placeholder="Đến" 
                class="area-input"
              />
              <span class="area-unit">m²</span>
            </div>
            <div class="area-presets">
              <button 
                v-for="preset in areaPresets" 
                :key="preset.label"
                @click="applyAreaPreset(preset)"
                class="area-preset-btn"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Utilities Filter -->
        <div class="filter-section">
          <h3>Tiện ích</h3>
          <div class="utilities-grid">
            <label 
              v-for="utility in utilities" 
              :key="utility.id" 
              class="utility-checkbox"
            >
              <input 
                type="checkbox" 
                :value="utility.id" 
                v-model="selectedUtilities"
              />
              <span>{{ utility.name }}</span>
            </label>
            <div v-if="utilities.length === 0" class="loading-utilities">
              Đang tải tiện ích...
            </div>
          </div>
        </div>

        <!-- Apply Filters Button -->
        <button 
          class="apply-filters-btn" 
          @click="applyFilters"
        >
          Áp dụng bộ lọc
        </button>
      </aside>

      <!-- Room Listings -->
      <main class="room-listings">
        <div class="listings-header">
          <h2>{{ pageTitle }}</h2>
          <div class="sort-options">
            <select v-model="sortOption" class="sort-select">
              <option value="newest">Mới nhất</option>
              <option value="lowest_price">Giá thấp nhất</option>
              <option value="highest_price">Giá cao nhất</option>
              <option value="largest_area">Diện tích lớn nhất</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="loading-container">
          <p>Đang tải danh sách phòng...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
          <button @click="applyFilters">Thử lại</button>
        </div>

        <div v-else>
          <div class="rooms-grid">
            <RoomCard 
              v-for="room in paginatedRooms" 
              :key="room.id" 
              :room="room"
            />
          </div>

          <div 
            v-if="paginatedRooms.length === 0" 
            class="no-results"
          >
            <p>Không tìm thấy phòng phù hợp</p>
            <button @click="resetFilters">Đặt lại bộ lọc</button>
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 0"
            >
              Trang trước
            </button>
            <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button 
              @click="nextPage" 
              :disabled="currentPage >= totalPages - 1"
            >
              Trang tiếp
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import RoomCard from '@/components/RoomCard.vue'
import { useRooms } from '@/composables/useRooms'
import { utilityService } from '@/services/utilityService'

// Use rooms composable
const { loading, error, rooms, pagination, fetchRooms } = useRooms()

// Room Types - Map với API enum
const roomTypes = [
  { label: 'Tất cả', value: '' },
  { label: 'Phòng trọ', value: 'PHONG_TRO' },
  { label: 'Chung cư', value: 'CHUNG_CU' },
  { label: 'Nhà nguyên căn', value: 'NHA_NGUYEN_CAN' },
  { label: 'Căn hộ dịch vụ', value: 'CAN_HO_DICH_VU' },
  { label: 'Nhà mặt tiền', value: 'NHA_MAT_TIEN' },
  { label: 'Studio', value: 'STUDIO' }
]

// City and District Data
const cityDistricts = {
  hcm: [
    { label: 'Quận 1', value: 'q1' },
    { label: 'Quận 2', value: 'q2' },
    { label: 'Quận 3', value: 'q3' },
    { label: 'Quận 4', value: 'q4' },
    { label: 'Quận 5', value: 'q5' }
  ],
  hn: [
    { label: 'Quận Ba Đình', value: 'badinh' },
    { label: 'Quận Hoàn Kiếm', value: 'hoankiem' },
    { label: 'Quận Tây Hồ', value: 'tayho' }
  ],
  dn: [
    { label: 'Quận Hải Châu', value: 'haichau' },
    { label: 'Quận Sơn Trà', value: 'sontra' }
  ]
}

// Utilities - sẽ load từ API
const utilities = ref([])

// Load utilities từ API
const loadUtilities = async () => {
  try {
    const response = await utilityService.getAllUtilities()
    if (response.status === 200 && response.data) {
      utilities.value = response.data
    }
  } catch (err) {
    console.error('Error loading utilities:', err)
  }
}

// Price Presets (giá tính bằng triệu)
const pricePresets = [
  { label: 'Dưới 1 triệu', min: '0', max: '1000000' },
  { label: '1-3 triệu', min: '1000000', max: '3000000' },
  { label: '3-5 triệu', min: '3000000', max: '5000000' },
  { label: '5-10 triệu', min: '5000000', max: '10000000' },
  { label: 'Trên 10 triệu', min: '10000000', max: null }
]

// Area Presets
const areaPresets = [
  { label: 'Dưới 20m²', min: '0', max: '20' },
  { label: '20-30m²', min: '20', max: '30' },
  { label: '30-50m²', min: '30', max: '50' },
  { label: 'Trên 50m²', min: '50', max: null }
]

// Reactive State
const selectedRoomType = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const selectedWard = ref('')
const priceFrom = ref(null)
const priceTo = ref(null)
const areaFrom = ref(null)
const areaTo = ref(null)
const selectedUtilities = ref([])
const sortOption = ref('newest')
const sortBy = computed(() => {
  switch (sortOption.value) {
    case 'lowest_price': return 'price'
    case 'highest_price': return 'price'
    case 'largest_area': return 'area'
    default: return 'createdAt'
  }
})
const sortDirection = computed(() => {
  if (sortOption.value === 'lowest_price') return 'asc'
  if (sortOption.value === 'highest_price') return 'desc'
  if (sortOption.value === 'largest_area') return 'desc'
  return 'desc'
})
const currentPage = ref(0)
const itemsPerPage = ref(12)

// Computed Properties
const totalPages = computed(() => pagination.value.totalPages || 0)
const paginatedRooms = computed(() => rooms.value || [])

// Page Title
const pageTitle = computed(() => {
  const typeLabel = roomTypes.find(type => type.value === selectedRoomType.value)?.label || 'Tất cả phòng'
  return `${typeLabel} (${pagination.value.totalElements || 0} phòng)`
})

// Methods
const getDistrictsByCity = (city) => {
  return cityDistricts[city] || []
}

const selectRoomType = (type) => {
  selectedRoomType.value = type
  applyFilters()
}

const applyPricePreset = (preset) => {
  priceFrom.value = preset.min
  priceTo.value = preset.max
}

const applyAreaPreset = (preset) => {
  areaFrom.value = preset.min
  areaTo.value = preset.max
}

const applyFilters = async () => {
  currentPage.value = 0 // Reset về trang đầu
  
  const params = {
    page: currentPage.value,
    size: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value
  }
  
  // Add filters
  if (selectedRoomType.value) {
    params.roomType = selectedRoomType.value
  }
  if (selectedCity.value) {
    params.city = selectedCity.value
  }
  if (selectedDistrict.value) {
    params.district = selectedDistrict.value
  }
  if (selectedWard.value) {
    params.ward = selectedWard.value
  }
  if (priceFrom.value) {
    params.minPrice = priceFrom.value
  }
  if (priceTo.value) {
    params.maxPrice = priceTo.value
  }
  if (areaFrom.value) {
    params.minArea = areaFrom.value
  }
  if (areaTo.value) {
    params.maxArea = areaTo.value
  }
  if (selectedUtilities.value.length > 0) {
    // Note: API có thể không hỗ trợ utilityIds filter trực tiếp
    // Có thể cần filter ở frontend hoặc backend hỗ trợ
  }
  
  await fetchRooms(params)
}

const resetFilters = async () => {
  selectedRoomType.value = ''
  selectedCity.value = ''
  selectedDistrict.value = ''
  selectedWard.value = ''
  priceFrom.value = null
  priceTo.value = null
  areaFrom.value = null
  areaTo.value = null
  selectedUtilities.value = []
  sortOption.value = 'newest'
  currentPage.value = 0
  await applyFilters()
}

const prevPage = async () => {
  if (currentPage.value > 0) {
    currentPage.value--
    await applyFilters()
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    await applyFilters()
  }
}

// Watch sort option changes
watch(sortOption, () => {
  applyFilters()
})

// Load data on mount
onMounted(async () => {
  await loadUtilities()
  await applyFilters()
})
</script>

<!-- Import external CSS file for RoomList view styles -->
<style src="@/assets/css/RoomList.css"></style>