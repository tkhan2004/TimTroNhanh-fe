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
              @change="onCityChange"
            >
              <option value="">Tất cả thành phố</option>
              <option 
                v-for="province in provinces" 
                :key="province.code" 
                :value="province.name"
              >
                {{ province.name }}
              </option>
            </select>

            <select 
              v-model="selectedDistrict" 
              class="filter-select"
              @change="onDistrictChange"
              :disabled="!selectedCity"
            >
              <option value="">Tất cả quận/huyện</option>
              <option 
                v-for="district in districts" 
                :key="district.code" 
                :value="district.name"
              >
                {{ district.name }}
              </option>
            </select>

            <select 
              v-model="selectedWard" 
              class="filter-select"
              @change="onWardChange"
              :disabled="!selectedDistrict"
            >
              <option value="">Tất cả phường/xã</option>
              <option 
                v-for="ward in wards" 
                :key="ward.code" 
                :value="ward.name"
              >
                {{ ward.name }}
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

        <!-- Advanced Filter Toggle -->
        <button 
          class="advanced-filter-toggle" 
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          {{ showAdvancedFilters ? 'Thu gọn bộ lọc' : 'Bộ lọc nâng cao' }}
          <span class="toggle-icon">{{ showAdvancedFilters ? '▲' : '▼' }}</span>
        </button>

        <!-- Advanced Filters Section -->
        <div v-show="showAdvancedFilters" class="advanced-filters">
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
import { useRoute, useRouter } from 'vue-router'
import RoomCard from '@/components/RoomCard.vue'
import { useRooms } from '@/composables/useRooms'
import { useFavorites } from '@/composables/useFavorites'
import { useAuthStore } from '@/stores/auth'
import { utilityService } from '@/services/utilityService'
import { vietnamAddressService } from '@/services/vietnamAddressService'

// Use rooms composable
const { loading, error, rooms, pagination, fetchRooms } = useRooms()

// Use favorites composable
const { loadFavorites } = useFavorites()

// Auth store
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

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

// Address Data
const provinces = ref([])
const districts = ref([])
const wards = ref([])
const showAdvancedFilters = ref(false)

const loadProvinces = async () => {
  try {
    provinces.value = await vietnamAddressService.getProvinces()
  } catch (error) {
    console.error('Error loading provinces:', error)
  }
}

const onCityChange = async () => {
  selectedDistrict.value = ''
  selectedWard.value = ''
  districts.value = []
  wards.value = []
  
  if (selectedCity.value) {
    // Find province code by name (since we store name in selectedCity)
    const province = provinces.value.find(p => p.name === selectedCity.value)
    if (province) {
      try {
        districts.value = await vietnamAddressService.getDistricts(province.code)
      } catch (error) {
        console.error('Error loading districts:', error)
      }
    }
  }
  applyFilters()
}

const onDistrictChange = async () => {
  selectedWard.value = ''
  wards.value = []

  if (selectedDistrict.value) {
    // Find district code by name
    const district = districts.value.find(d => d.name === selectedDistrict.value)
    if (district) {
      try {
        wards.value = await vietnamAddressService.getWards(district.code)
      } catch (error) {
        console.error('Error loading wards:', error)
      }
    }
  }
  applyFilters()
}

const onWardChange = () => {
  applyFilters()
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
const keyword = ref('')
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
const itemsPerPage = ref(100) // Fetch 100 items for client-side sorting
const uiItemsPerPage = ref(7) // Display 7 items per page

// Computed Properties
// 1. Filter and Sort all fetched rooms
const processedRooms = computed(() => {
  if (!rooms.value) return []
  
  let result = [...rooms.value]
  
  // Filter out EXPIRED rooms older than 4 days
  const now = new Date()
  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000
  
  result = result.filter(room => {
    if (room.status === 'EXPIRED') {
      const statusDate = new Date(room.updatedAt || room.createdAt)
      if (now - statusDate > FOUR_DAYS_MS) {
        return false
      }
    }
    return true
  })
  
  // Sort: AVAILABLE -> RENTED -> EXPIRED
  result.sort((a, b) => {
    const statusOrder = {
      'AVAILABLE': 1,
      'RENTED': 2,
      'EXPIRED': 3
    }
    
    const orderA = statusOrder[a.status] || 99
    const orderB = statusOrder[b.status] || 99
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // Keep original order (usually by date desc)
    return 0
  })
  
  return result
})

// 2. Calculate total pages based on processed rooms
const totalPages = computed(() => {
  return Math.ceil(processedRooms.value.length / uiItemsPerPage.value) || 0
})

// 3. Slice for current page
const paginatedRooms = computed(() => {
  const start = currentPage.value * uiItemsPerPage.value
  const end = start + uiItemsPerPage.value
  return processedRooms.value.slice(start, end)
})

// Page Title
const pageTitle = computed(() => {
  const typeLabel = roomTypes.find(type => type.value === selectedRoomType.value)?.label || 'Tất cả phòng'
  return `${typeLabel} (${processedRooms.value.length} phòng)`
})

// Methods

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

const applyFilters = async (resetPage = true) => {
  if (resetPage) {
    currentPage.value = 0 // Reset về trang đầu
  }
  
  // Note: We fetch a large batch (itemsPerPage) and handle pagination locally
  const params = {
    page: 0, // Always fetch page 0 from API
    size: itemsPerPage.value,
    sortBy: sortBy.value,
    sortDirection: sortDirection.value
  }

  if (keyword.value) {
    params.keyword = keyword.value
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
  
  console.log('Applying filters with params:', params)
  
  // Update URL
  const query = { ...params }
  // Remove empty params
  Object.keys(query).forEach(key => {
    if (query[key] === null || query[key] === '' || query[key] === undefined) {
      delete query[key]
    }
  })
  
  router.push({ query })
  
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
  await applyFilters(true)
}

const prevPage = async () => {
  if (currentPage.value > 0) {
    currentPage.value--
    // No need to call API, just update currentPage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = async () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    // No need to call API, just update currentPage
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Watch sort option changes
watch(sortOption, () => {
  applyFilters()
})

// Load data on mount
onMounted(async () => {
  await loadUtilities()
  await loadProvinces()
  
  // Parse query params
  const query = route.query
  if (query.keyword) keyword.value = query.keyword
  if (query.roomType) selectedRoomType.value = query.roomType
  if (query.city) {
    selectedCity.value = query.city
    await onCityChange() // Load districts for the selected city
    // Restore district if present
    if (query.district) {
      selectedDistrict.value = query.district
      await onDistrictChange() // Load wards for the selected district
    }
  }
  if (query.ward) selectedWard.value = query.ward
  if (query.minPrice) priceFrom.value = query.minPrice
  if (query.maxPrice) priceTo.value = query.maxPrice
  if (query.minArea) areaFrom.value = query.minArea
  if (query.maxArea) areaTo.value = query.maxArea

  await applyFilters()
  
  // Load favorites if user is logged in
  if (authStore.isLoggedIn) {
    await loadFavorites()
  }
})
</script>

<!-- Import external CSS file for RoomList view styles -->
<style src="@/assets/css/RoomList.css"></style>