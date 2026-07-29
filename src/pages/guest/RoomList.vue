<template>
  <div class="full-screen-room-list">
    <!-- Top Control Bar (Single Row Fit) -->
    <div class="top-control-bar">
      <div class="bar-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <span class="count-pill">{{ filteredRooms.length }} phòng</span>
      </div>

      <!-- Quick Filter Pills -->
      <div class="pills-scroll-group">
        <button 
          v-for="pill in filterPills" 
          :key="pill.value"
          @click="togglePillFilter(pill)"
          :class="['filter-pill', { 'active': activePills.includes(pill.value) }]"
        >
          {{ pill.label }}
        </button>
      </div>

      <!-- Sort Selection -->
      <div class="bar-right">
        <select v-model="sortOption" class="select-sort">
          <option value="newest">Mới nhất</option>
          <option value="lowest_price">Giá thấp nhất</option>
          <option value="highest_price">Giá cao nhất</option>
          <option value="largest_area">Diện tích lớn nhất</option>
        </select>
      </div>
    </div>

    <!-- Main Viewport Grid (Split 1-Page Layout) -->
    <div class="app-split-container">
      <!-- Left Filter Drawer / Sidebar -->
      <aside class="sidebar-scrollable">
        <div class="sidebar-inner">
          <div class="sidebar-head">
            <h3>Bộ lọc tìm kiếm</h3>
            <button class="btn-text-reset" @click="resetFilters">Đặt lại</button>
          </div>

          <!-- Room Type -->
          <div class="filter-group">
            <label class="group-title">Loại hình ở</label>
            <div class="type-grid">
              <button 
                v-for="type in roomTypes" 
                :key="type.value"
                @click="selectRoomType(type.value)"
                :class="['type-btn', { 'active': selectedRoomType === type.value }]"
              >
                {{ type.label }}
              </button>
            </div>
          </div>

          <!-- Location -->
          <div class="filter-group">
            <label class="group-title">Địa điểm</label>
            <div class="select-stack">
              <select v-model="selectedCity" class="select-input" @change="onCityChange">
                <option value="">Tất cả tỉnh / thành phố</option>
                <option v-for="p in provinces" :key="p.code" :value="p.name">{{ p.name }}</option>
              </select>

              <select v-model="selectedDistrict" class="select-input" @change="onDistrictChange" :disabled="!selectedCity">
                <option value="">Tất cả quận / huyện</option>
                <option v-for="d in districts" :key="d.code" :value="d.name">{{ d.name }}</option>
              </select>

              <select v-model="selectedWard" class="select-input" @change="onWardChange" :disabled="!selectedDistrict">
                <option value="">Tất cả phường / xã</option>
                <option v-for="w in wards" :key="w.code" :value="w.name">{{ w.name }}</option>
              </select>
            </div>
          </div>

          <!-- Price -->
          <div class="filter-group">
            <label class="group-title">Khoảng giá (triệu VNĐ)</label>
            <div class="num-row">
              <input type="number" v-model="priceFrom" placeholder="Từ" class="num-input" />
              <span class="dash">-</span>
              <input type="number" v-model="priceTo" placeholder="Đến" class="num-input" />
            </div>
            <div class="presets-row">
              <button 
                v-for="preset in pricePresets" 
                :key="preset.label"
                @click="applyPricePreset(preset)"
                class="preset-btn"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Utilities Checkboxes -->
          <div class="filter-group">
            <label class="group-title">Tiện ích đi kèm</label>
            <div class="utility-scroll-list">
              <label v-for="u in utilities" :key="u.id" class="checkbox-row">
                <input type="checkbox" :value="u.id" v-model="selectedUtilities" class="checkbox-ui" />
                <span>{{ u.name }}</span>
              </label>
            </div>
          </div>

          <button class="btn-apply-full" @click="applyFilters">
            Áp dụng bộ lọc
          </button>
        </div>
      </aside>

      <!-- Right Main Content Scroll Area -->
      <main class="content-scrollable">
        <!-- Skeleton Loaders -->
        <div v-if="loading" class="cards-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
              <div class="skeleton-line short"></div>
              <div class="skeleton-line title"></div>
              <div class="skeleton-line text"></div>
            </div>
          </div>
        </div>

        <!-- Room Cards Grid -->
        <div v-else class="cards-grid">
          <RoomCard 
            v-for="room in paginatedRooms" 
            :key="room.id" 
            :room="room"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bottom-pagination">
          <button @click="prevPage" :disabled="currentPage === 0" class="btn-page">
            ← Trang trước
          </button>
          <span class="page-text">Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="btn-page">
            Trang sau →
          </button>
        </div>
      </main>
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
const error = ref(null)
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
const pageSize = ref(9)

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

// Fallback sample data if API returns empty
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
    id: 106,
    title: 'Tìm 1 nam ở ghép căn hộ 2PN Vinhomes Grand Park',
    price: 1800000,
    area: 60,
    type: 'SHARE',
    status: 'AVAILABLE',
    address: 'Nguyễn Xiển',
    district: 'Quận 9',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Hồ bơi' }, { id: 2, name: 'Phòng Gym' }]
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
  return 'Tất cả phòng cho thuê'
})

const filteredRooms = computed(() => {
  let list = [...rooms.value]
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
  error.value = null
  try {
    const res = await roomService.getRooms({ page: 0, size: 50, status: 'AVAILABLE' })
    const fetchedList = res.content || res || []
    if (fetchedList.length > 0) {
      rooms.value = fetchedList
    } else {
      rooms.value = sampleRooms
    }
  } catch (err) {
    console.warn('API error, using sample rooms fallback:', err)
    rooms.value = sampleRooms
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  provinces.value = await vietnamAddressService.getProvinces()
  utilities.value = await utilityService.getAllUtilities()
  
  if (route.query.location) {
    selectedCity.value = route.query.location || ''
  }
  await fetchRooms()
})
</script>

<style scoped src="@/assets/css/RoomList.css"></style>