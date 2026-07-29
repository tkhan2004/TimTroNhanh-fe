<template>
  <div class="room-list-page">
    <!-- Top Search Header Console -->
    <div class="search-console-wrapper">
      <div class="container">
        <div class="search-console-card">
          <!-- Keyword input -->
          <div class="console-input-cell">
            <Icon icon="ph:magnifying-glass-bold" class="console-icon" />
            <input 
              type="text" 
              placeholder="Nhập khu vực, đường, tên trường ĐH..."
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              class="console-input"
            />
          </div>

          <!-- Location select -->
          <div class="console-input-cell">
            <Icon icon="ph:map-pin-bold" class="console-icon" />
            <select v-model="selectedCity" class="console-select" @change="onCityChange">
              <option value="">Tất cả Tỉnh / Thành phố</option>
              <option v-for="p in provinces" :key="p.code" :value="p.name">{{ p.name }}</option>
            </select>
          </div>

          <!-- Room Type select -->
          <div class="console-input-cell">
            <Icon icon="ph:house-line-bold" class="console-icon" />
            <select v-model="selectedRoomType" class="console-select" @change="applyFilters">
              <option value="">Tất cả loại hình ở</option>
              <option v-for="type in roomTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
            </select>
          </div>

          <!-- Search CTA -->
          <button @click="handleSearch" class="btn-console-search">
            <Icon icon="ph:magnifying-glass-bold" />
            <span>Tìm kiếm</span>
          </button>
        </div>

        <!-- Quick Filter Pills Carousel -->
        <div class="quick-pills-bar">
          <span class="pills-label">Lọc nhanh:</span>
          <div class="pills-scroll">
            <button 
              v-for="pill in filterPills" 
              :key="pill.value"
              @click="togglePillFilter(pill)"
              :class="['pill-btn', { 'active': activePills.includes(pill.value) }]"
            >
              {{ pill.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="container main-content-wrapper">
      <div class="results-layout-grid">
        <!-- Left Column: Filter Sidebar Drawer -->
        <aside class="filter-sidebar-panel">
          <div class="sidebar-header">
            <div class="sidebar-title-group">
              <Icon icon="ph:sliders-horizontal-bold" class="sidebar-icon" />
              <h3>Bộ lọc chi tiết</h3>
            </div>
            <button class="btn-reset-link" @click="resetFilters">Làm mới</button>
          </div>

          <!-- Category Selection -->
          <div class="filter-block">
            <h4 class="block-title">Loại hình cho thuê</h4>
            <div class="type-button-grid">
              <button 
                v-for="type in roomTypes" 
                :key="type.value"
                @click="selectRoomType(type.value)"
                :class="['type-select-btn', { 'active': selectedRoomType === type.value }]"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Location Cascade Selects -->
          <div class="filter-block">
            <h4 class="block-title">Khu vực tìm kiếm</h4>
            <div class="stack-inputs">
              <select v-model="selectedCity" class="sidebar-select" @change="onCityChange">
                <option value="">Tất cả tỉnh / thành phố</option>
                <option v-for="p in provinces" :key="p.code" :value="p.name">{{ p.name }}</option>
              </select>

              <select v-model="selectedDistrict" class="sidebar-select" @change="onDistrictChange" :disabled="!selectedCity">
                <option value="">Tất cả quận / huyện</option>
                <option v-for="d in districts" :key="d.code" :value="d.name">{{ d.name }}</option>
              </select>

              <select v-model="selectedWard" class="sidebar-select" @change="onWardChange" :disabled="!selectedDistrict">
                <option value="">Tất cả phường / xã</option>
                <option v-for="w in wards" :key="w.code" :value="w.name">{{ w.name }}</option>
              </select>
            </div>
          </div>

          <!-- Price Range -->
          <div class="filter-block">
            <h4 class="block-title">Khoảng giá (Triệu / tháng)</h4>
            <div class="price-inputs-row">
              <input type="number" v-model="priceFrom" placeholder="Từ" class="price-input" />
              <span class="range-dash">-</span>
              <input type="number" v-model="priceTo" placeholder="Đến" class="price-input" />
            </div>
            <div class="price-presets-grid">
              <button 
                v-for="preset in pricePresets" 
                :key="preset.label"
                @click="applyPricePreset(preset)"
                class="preset-chip"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Utility Checkboxes -->
          <div class="filter-block">
            <h4 class="block-title">Tiện ích đi kèm</h4>
            <div class="utility-checkbox-list">
              <label v-for="u in utilities" :key="u.id" class="checkbox-item">
                <input type="checkbox" :value="u.id" v-model="selectedUtilities" />
                <span>{{ u.name }}</span>
              </label>
            </div>
          </div>

          <button class="btn-sidebar-apply" @click="applyFilters">
            Áp dụng bộ lọc
          </button>
        </aside>

        <!-- Right Column: Room Cards Results -->
        <main class="results-main-panel">
          <!-- Results Top Control Header -->
          <div class="results-control-header">
            <div class="results-text-info">
              <h1 class="results-page-title">{{ pageTitle }}</h1>
              <span class="results-count-badge">{{ filteredRooms.length }} kết quả phù hợp</span>
            </div>

            <div class="results-sort-bar">
              <span class="sort-label">Sắp xếp:</span>
              <select v-model="sortOption" class="select-sort-dropdown">
                <option value="newest">Mới nhất</option>
                <option value="lowest_price">Giá từ thấp đến cao</option>
                <option value="highest_price">Giá từ cao đến thấp</option>
                <option value="largest_area">Diện tích lớn nhất</option>
              </select>
            </div>
          </div>

          <!-- Loading State Skeletons -->
          <div v-if="loading" class="cards-results-grid">
            <div v-for="i in 8" :key="i" class="skeleton-card">
              <div class="skeleton-img"></div>
              <div class="skeleton-body">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line title"></div>
                <div class="skeleton-line text"></div>
              </div>
            </div>
          </div>

          <!-- Cards Grid -->
          <div v-else class="cards-results-grid">
            <RoomCard 
              v-for="room in paginatedRooms" 
              :key="room.id" 
              :room="room" 
            />
          </div>

          <!-- Pagination Control -->
          <div v-if="totalPages > 1" class="pagination-bar">
            <button @click="prevPage" :disabled="currentPage === 0" class="btn-pagination">
              <Icon icon="ph:arrow-left-bold" />
              <span>Trang trước</span>
            </button>
            <span class="pagination-info">Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-pagination">
              <span>Trang sau</span>
              <Icon icon="ph:arrow-right-bold" />
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RoomCard from '@/components/RoomCard.vue'
import { roomService } from '@/services/roomService'
import { utilityService } from '@/services/utilityService'
import { vietnamAddressService } from '@/services/vietnamAddressService'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const searchKeyword = ref('')
const rooms = ref([])
const utilities = ref([])
const provinces = ref([])
const districts = ref([])
const wards = ref([])

const selectedRoomType = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const selectedWard = ref('')
const priceFrom = ref(null)
const priceTo = ref(null)
const selectedUtilities = ref([])
const sortOption = ref('newest')
const currentPage = ref(0)
const pageSize = ref(8)
const activePills = ref([])

const filterPills = [
  { label: '⚡ Dưới 3 triệu', value: 'under_3m' },
  { label: '🌿 Có ban công', value: 'balcony' },
  { label: '❄️ Có điều hòa', value: 'ac' },
  { label: '🐾 Cho nuôi thú cưng', value: 'pets' },
  { label: '🚗 Có chỗ để xe', value: 'parking' }
]

const roomTypes = [
  { label: 'Tất cả', value: '' },
  { label: 'Phòng trọ', value: 'ROOM' },
  { label: 'Căn hộ mini', value: 'APARTMENT' },
  { label: 'Chung cư', value: 'CONDO' },
  { label: 'Nhà nguyên căn', value: 'HOUSE' },
  { label: 'Ở ghép', value: 'SHARE' }
]

const pricePresets = [
  { label: '< 2tr', from: 0, to: 2 },
  { label: '2 - 4tr', from: 2, to: 4 },
  { label: '4 - 7tr', from: 4, to: 7 },
  { label: '> 7tr', from: 7, to: 20 }
]

const sampleRooms = [
  {
    id: 101,
    title: 'Phòng trọ studio full nội thất cao cấp gần ĐH Bách Khoa',
    price: 3200000,
    area: 28,
    type: 'ROOM',
    status: 'AVAILABLE',
    address: 'Số 15 Ngõ 40 Tạ Quang Bửu',
    district: 'Hai Bà Trưng',
    province: 'Hà Nội',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Điều hòa' }, { id: 2, name: 'Nóng lạnh' }, { id: 3, name: 'Ban công' }]
  },
  {
    id: 102,
    title: 'Căn hộ mini mới xây ban công thoáng mát Quận 10',
    price: 4500000,
    area: 35,
    type: 'APARTMENT',
    status: 'AVAILABLE',
    address: '254 Lý Thường Kiệt',
    district: 'Quận 10',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Máy giặt' }, { id: 2, name: 'Tủ lạnh' }, { id: 3, name: 'Giờ tự do' }]
  },
  {
    id: 103,
    title: 'Phòng trọ giá rẻ cho sinh viên gần ĐH Quốc Gia',
    price: 2200000,
    area: 22,
    type: 'ROOM',
    status: 'AVAILABLE',
    address: 'Xuân Thủy',
    district: 'Cầu Giấy',
    province: 'Hà Nội',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1560448204-e02f5b9b964a?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Khép kín' }, { id: 2, name: 'Để xe tầng 1' }]
  },
  {
    id: 104,
    title: 'Căn hộ dịch vụ 1PN rộng rãi khu trung tâm Bình Thạnh',
    price: 5800000,
    area: 42,
    type: 'APARTMENT',
    status: 'AVAILABLE',
    address: 'Điện Biên Phủ',
    district: 'Bình Thạnh',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Thang máy' }, { id: 2, name: 'Bảo vệ 24/7' }]
  },
  {
    id: 105,
    title: 'Căn hộ chung cư 2PN sang trọng dự án Vinhomes Grand Park',
    price: 6500000,
    area: 55,
    type: 'CONDO',
    status: 'AVAILABLE',
    address: 'Nguyễn Xiển',
    district: 'Quận 9',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Hồ bơi' }, { id: 2, name: 'Phòng Gym' }]
  },
  {
    id: 106,
    title: 'Nhà nguyên căn 3 tầng full đồ cho gia đình thuê Quận Gò Vấp',
    price: 12000000,
    area: 90,
    type: 'HOUSE',
    status: 'AVAILABLE',
    address: 'Huỳnh Văn Nghệ',
    district: 'Gò Vấp',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Sân thượng' }, { id: 2, name: 'Gara ô tô' }]
  },
  {
    id: 107,
    title: 'Phòng trọ cao cấp có gác xép hiện đại gần ĐH Kinh Tế Quốc Dân',
    price: 3500000,
    area: 25,
    type: 'ROOM',
    status: 'AVAILABLE',
    address: 'Trần Đại Nghĩa',
    district: 'Hai Bà Trưng',
    province: 'Hà Nội',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Nội thất gỗ' }, { id: 2, name: 'Wifi tốc độ cao' }]
  },
  {
    id: 108,
    title: 'Tìm 1 nam ở ghép phòng studio Masteri Thảo Điền Quận 2',
    price: 2800000,
    area: 45,
    type: 'SHARE',
    status: 'AVAILABLE',
    address: 'Xa Lộ Hà Nội',
    district: 'Quận 2',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Hồ bơi' }, { id: 2, name: 'Siêu thị 24/7' }]
  }
]

const togglePillFilter = (pill) => {
  const index = activePills.value.indexOf(pill.value)
  if (index > -1) {
    activePills.value.splice(index, 1)
  } else {
    activePills.value.push(pill.value)
  }
  if (pill.value === 'under_3m') {
    priceTo.value = activePills.value.includes('under_3m') ? 3 : null
  }
  applyFilters()
}

const pageTitle = computed(() => {
  if (selectedCity.value) return `Phòng trọ tại ${selectedCity.value}`
  return 'Danh sách phòng cho thuê'
})

const filteredRooms = computed(() => {
  let list = [...rooms.value]
  
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    list = list.filter(r => 
      r.title.toLowerCase().includes(kw) || 
      (r.address && r.address.toLowerCase().includes(kw)) ||
      (r.district && r.district.toLowerCase().includes(kw))
    )
  }

  if (selectedRoomType.value) {
    list = list.filter(r => r.type === selectedRoomType.value)
  }
  if (priceFrom.value) {
    list = list.filter(r => r.price >= priceFrom.value * 1000000)
  }
  if (priceTo.value) {
    list = list.filter(r => r.price <= priceTo.value * 1000000)
  }
  
  if (sortOption.value === 'lowest_price') list.sort((a, b) => a.price - b.price)
  else if (sortOption.value === 'highest_price') list.sort((a, b) => b.price - a.price)
  else if (sortOption.value === 'largest_area') list.sort((a, b) => (b.area || 0) - (a.area || 0))
  
  return list
})

const totalPages = computed(() => Math.ceil(filteredRooms.value.length / pageSize.value) || 1)
const paginatedRooms = computed(() => {
  const start = currentPage.value * pageSize.value
  return filteredRooms.value.slice(start, start + pageSize.value)
})

const prevPage = () => { if (currentPage.value > 0) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value - 1) currentPage.value++ }

const selectRoomType = (val) => {
  selectedRoomType.value = val
  applyFilters()
}

const applyPricePreset = (p) => {
  priceFrom.value = p.from
  priceTo.value = p.to
  applyFilters()
}

const handleSearch = () => {
  applyFilters()
}

const onCityChange = async () => {
  selectedDistrict.value = ''
  selectedWard.value = ''
  districts.value = []
  wards.value = []
  if (selectedCity.value) {
    const prov = provinces.value.find(p => p.name === selectedCity.value)
    if (prov) {
      districts.value = await vietnamAddressService.getDistricts(prov.code)
    }
  }
  applyFilters()
}

const onDistrictChange = async () => {
  selectedWard.value = ''
  wards.value = []
  if (selectedDistrict.value) {
    const dist = districts.value.find(d => d.name === selectedDistrict.value)
    if (dist) {
      wards.value = await vietnamAddressService.getWards(dist.code)
    }
  }
  applyFilters()
}

const onWardChange = () => { applyFilters() }

const resetFilters = () => {
  searchKeyword.value = ''
  selectedRoomType.value = ''
  selectedCity.value = ''
  selectedDistrict.value = ''
  selectedWard.value = ''
  priceFrom.value = null
  priceTo.value = null
  selectedUtilities.value = []
  activePills.value = []
  fetchRooms()
}

const applyFilters = () => {
  currentPage.value = 0
}

const fetchRooms = async () => {
  loading.value = true
  try {
    const res = await roomService.getRooms({ page: 0, size: 50, status: 'AVAILABLE' })
    const fetchedList = res.content || res || []
    if (fetchedList.length > 0) {
      rooms.value = fetchedList
    } else {
      rooms.value = sampleRooms
    }
  } catch (err) {
    rooms.value = sampleRooms
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  provinces.value = await vietnamAddressService.getProvinces()
  utilities.value = await utilityService.getAllUtilities()
  
  if (route.query.location) selectedCity.value = route.query.location || ''
  if (route.query.q) searchKeyword.value = route.query.q || ''
  if (route.query.type) selectedRoomType.value = route.query.type || ''

  await fetchRooms()
})
</script>

<style scoped src="@/assets/css/RoomList.css"></style>