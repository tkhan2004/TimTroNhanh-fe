<template>
  <div class="hero-container">
    <div class="hero-background">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="hero-title-highlight">Ở TRỌ KHÔNG LO</span>
            <br>
            CỨ ĐỂ CHÚNG TÔI LO CHỖ Ở CHO BẠN
          </h1>
          <p class="hero-subtitle">
            Hàng nghìn phòng trọ được cập nhật mỗi ngày trên toàn quốc
            <br>
            Cùng bạn tìm nơi ở an tâm từ những người cho thuê uy tín
          </p>
        </div>

        <div class="hero-search-container">
          <div class="hero-search-tabs">
            <button 
              v-for="(tab, index) in searchTabs" 
              :key="index"
              @click="activeTab = index"
              :class="['search-tab', { 'active': activeTab === index }]"
            >
              {{ tab }}
            </button>
          </div>

          <div class="hero-search-form">
            <div class="search-inputs">
              <div class="search-input-group">
                <svg viewBox="0 0 24 24" class="search-icon">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  placeholder="Nhập địa chỉ, quận, thành phố"
                  class="search-input"
                  v-model="searchQuery"
                />
              </div>

              <div class="search-input-group">
                <div class="select-wrapper">
                  <select 
                    class="search-select" 
                    v-model="selectedLocation"
                  >
                    <option value="" disabled selected>Chọn địa điểm</option>
                    <option value="">Tất cả</option>
                    <option 
                      v-for="province in provinces" 
                      :key="province.code" 
                      :value="province.name"
                    >
                      {{ province.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="search-input-group">
                <div class="select-wrapper">
                  <select 
                    class="search-select" 
                    v-model="selectedPrice"
                    @change="handlePriceChange"
                  >
                    <option value="" disabled selected>Mức giá</option>
                    <option value="0-1">Dưới 1 triệu</option>
                    <option value="1-3">1-3 triệu</option>
                    <option value="3-5">3-5 triệu</option>
                    <option value="5-10">5-10 triệu</option>
                    <option value="10+">Trên 10 triệu</option>
                    <option value="custom">Tùy chọn</option>
                  </select>
                </div>
              </div>

              <div 
                v-if="showCustomPriceInput" 
                class="search-input-group price-range"
              >
                <div class="price-inputs">
                  <input 
                    type="number" 
                    placeholder="Từ" 
                    class="price-input"
                    v-model="customPriceFrom"
                    min="0"
                  />
                  <span class="price-separator">-</span>
                  <input 
                    type="number" 
                    placeholder="Đến" 
                    class="price-input"
                    v-model="customPriceTo"
                    min="0"
                  />
                </div>
                <span class="price-unit">triệu</span>
              </div>

              <div class="search-input-group">
                <div class="select-wrapper">
                  <select 
                    class="search-select" 
                    v-model="selectedArea"
                  >
                    <option value="" disabled selected>Diện tích</option>
                    <option value="0-20">Dưới 20m²</option>
                    <option value="20-30">20-30m²</option>
                    <option value="30-50">30-50m²</option>
                    <option value="50+">Trên 50m²</option>
                  </select>
                </div>
              </div>

              <button class="search-button" @click="performSearch">
                <svg viewBox="0 0 24 24" class="search-button-icon">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-promotions">
      <div class="promotion-slider" ref="sliderRef">
        <div class="promotion-item">
          <img src="https://res.cloudinary.com/dxzk5p80d/image/upload/v1764158732/in-poster-quang-cao1_vcwwho.jpg" alt="Khuyến mãi 1" />
        </div>
        <div class="promotion-item">
          <img src="https://picsum.photos/seed/promo2/800/200" alt="Khuyến mãi 2" />
        </div>
        <div class="promotion-item">
          <img src="https://picsum.photos/seed/promo3/800/200" alt="Khuyến mãi 3" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { vietnamAddressService } from '@/services/vietnamAddressService'

const router = useRouter()

const searchTabs = [
  'Tất cả', 
  'Nhà trọ, phòng trọ', 
  'Nhà nguyên căn', 
  'Căn hộ'
]

const activeTab = ref(0)
const searchQuery = ref('')
const selectedLocation = ref('')
const selectedPrice = ref('')
const selectedArea = ref('')

// Custom price range
const showCustomPriceInput = ref(false)
const customPriceFrom = ref(null)
const customPriceTo = ref(null)

const handlePriceChange = () => {
  showCustomPriceInput.value = selectedPrice.value === 'custom'
}

const performSearch = () => {
  // Determine price range
  let priceFrom = null
  let priceTo = null

  if (selectedPrice.value !== 'custom') {
    const [from, to] = selectedPrice.value.split('-')
    priceFrom = from === '0' ? null : parseFloat(from) * 1000000
    priceTo = to === '+' ? null : (to ? parseFloat(to) * 1000000 : null)
  } else {
    priceFrom = customPriceFrom.value ? customPriceFrom.value * 1000000 : null
    priceTo = customPriceTo.value ? customPriceTo.value * 1000000 : null
  }

  // Map tabs to room types
  const roomTypes = ['', 'PHONG_TRO', 'NHA_NGUYEN_CAN', 'CHUNG_CU']
  const selectedType = roomTypes[activeTab.value]

  const query = {}
  
  if (searchQuery.value) query.keyword = searchQuery.value
  if (selectedLocation.value) query.city = selectedLocation.value
  if (selectedType) query.roomType = selectedType
  if (selectedArea.value) {
    const [min, max] = selectedArea.value.split('-')
    query.minArea = min
    if (max && max !== '+') query.maxArea = max
  }
  
  if (priceFrom !== null) query.minPrice = priceFrom
  if (priceTo !== null) query.maxPrice = priceTo

  console.log('Navigating to RoomList with query:', query)
  router.push({ name: 'RoomList', query })
}

// Load provinces
const provinces = ref([])
const loadProvinces = async () => {
  try {
    provinces.value = await vietnamAddressService.getProvinces()
  } catch (error) {
    console.error('Error loading provinces:', error)
  }
}

// Promotion Slider Logic
const sliderRef = ref(null)
let autoPlayInterval = null

const startAutoPlay = () => {
  autoPlayInterval = setInterval(() => {
    if (!sliderRef.value) return
    
    const slider = sliderRef.value
    const scrollWidth = slider.scrollWidth
    const clientWidth = slider.clientWidth
    const currentScroll = slider.scrollLeft
    
    // If we're near the end, scroll back to start
    if (currentScroll + clientWidth >= scrollWidth - 10) {
      slider.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      // Otherwise scroll to next item
      slider.scrollBy({ left: clientWidth, behavior: 'smooth' })
    }
  }, 5000) // Change slide every 5 seconds
}

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  startAutoPlay()
  loadProvinces()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<!-- Import external CSS file for Hero component styles -->
<style src="@/assets/css/Hero.css"></style>