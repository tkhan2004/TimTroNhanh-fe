<template>
  <div class="hero-wrapper">
    <div class="hero-inner container">
      <!-- Left Column: Copy & Search Console -->
      <div class="hero-left-col">
        <div class="hero-header-text">
          <h1 class="hero-heading">
            Tìm phòng trọ, căn hộ <br />
            <span class="text-accent">ưng ý & phù hợp nhất</span>
          </h1>
          <p class="hero-lead">
            Kết nối trực tiếp người thuê với chủ nhà uy tín trên toàn quốc. Thông tin giá cả, diện tích và vị trí được xác thực minh bạch.
          </p>
        </div>

        <!-- Search Card Console -->
        <div class="hero-search-box">
          <!-- Category Tabs -->
          <div class="search-tab-bar">
            <button 
              v-for="(tab, index) in searchTabs" 
              :key="index"
              @click="activeTab = index"
              :class="['tab-btn', { 'active': activeTab === index }]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Main Input Fields -->
          <div class="search-form-body">
            <div class="input-grid">
              <!-- Keyword input -->
              <div class="input-cell keyword-cell">
                <Icon icon="ph:magnifying-glass-bold" class="field-icon" />
                <input 
                  type="text" 
                  placeholder="Khu vực, tên đường, trường ĐH..."
                  class="field-input"
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
                />
              </div>

              <!-- Location Select -->
              <div class="input-cell">
                <Icon icon="ph:map-pin-bold" class="field-icon" />
                <select class="field-select" v-model="selectedLocation">
                  <option value="" disabled selected>Chọn tỉnh thành</option>
                  <option value="">Tất cả tỉnh thành</option>
                  <option 
                    v-for="province in provinces" 
                    :key="province.code" 
                    :value="province.name"
                  >
                    {{ province.name }}
                  </option>
                </select>
              </div>

              <!-- Price Select -->
              <div class="input-cell">
                <Icon icon="ph:currency-circle-dollar-bold" class="field-icon" />
                <select class="field-select" v-model="selectedPrice">
                  <option value="" disabled selected>Mức giá mong muốn</option>
                  <option value="0-1">Dưới 1 triệu</option>
                  <option value="1-3">1 - 3 triệu</option>
                  <option value="3-5">3 - 5 triệu</option>
                  <option value="5-10">5 - 10 triệu</option>
                  <option value="10+">Trên 10 triệu</option>
                </select>
              </div>

              <!-- Search CTA -->
              <button @click="handleSearch" class="btn-search-action">
                <Icon icon="ph:magnifying-glass-bold" class="cta-icon" />
                <span>Tìm kiếm</span>
              </button>
            </div>

            <!-- Quick Suggestion Tags -->
            <div class="search-quick-tags">
              <span class="tags-label">Gợi ý tìm nhanh:</span>
              <div class="tags-list">
                <button 
                  v-for="tag in quickTags" 
                  :key="tag"
                  @click="applyQuickTag(tag)"
                  class="tag-btn"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Features Strip -->
        <div class="hero-trust-bar">
          <div class="trust-item">
            <Icon icon="ph:check-circle-bold" class="trust-icon" />
            <span>100% Chính chủ đăng bài</span>
          </div>

          <div class="trust-item">
            <Icon icon="ph:shield-check-bold" class="trust-icon" />
            <span>Không thu phí môi giới</span>
          </div>

          <div class="trust-item">
            <Icon icon="ph:map-pin-line-bold" class="trust-icon" />
            <span>Xác minh địa chỉ thực tế</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Visual Photo Card Showcase -->
      <div class="hero-right-col">
        <div class="photo-card-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80" 
            alt="Căn hộ phòng trọ hiện đại" 
            class="hero-main-photo"
          />

          <!-- Floating Badge Top Left -->
          <div class="floating-card float-top">
            <Icon icon="ph:house-line-duotone" class="float-icon" />
            <div class="float-text">
              <strong class="float-num">15.000+</strong>
              <span class="float-desc">Phòng trọ sẵn sàng</span>
            </div>
          </div>

          <!-- Floating Badge Bottom Right -->
          <div class="floating-card float-bottom">
            <Icon icon="ph:star-duotone" class="float-icon star-icon" />
            <div class="float-text">
              <strong class="float-num">4.9 / 5.0</strong>
              <span class="float-desc">Đánh giá từ người thuê</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { vietnamAddressService } from '@/services/vietnamAddressService'

const router = useRouter()
const activeTab = ref(0)
const searchTabs = ['Tất cả', 'Phòng trọ', 'Căn hộ mini', 'Chung cư', 'Nhà nguyên căn', 'Ở ghép']
const quickTags = ['Gần ĐH Bách Khoa', 'Dưới 3 triệu', 'Có ban công', 'Cho nuôi thú cưng']

const searchQuery = ref('')
const selectedLocation = ref('')
const selectedPrice = ref('')
const provinces = ref([])

const applyQuickTag = (tag) => {
  searchQuery.value = tag
  handleSearch()
}

const handleSearch = () => {
  const query = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedLocation.value) query.location = selectedLocation.value
  if (selectedPrice.value) query.price = selectedPrice.value
  
  if (activeTab.value === 1) query.type = 'ROOM'
  else if (activeTab.value === 2) query.type = 'APARTMENT'
  else if (activeTab.value === 3) query.type = 'CONDO'
  else if (activeTab.value === 4) query.type = 'HOUSE'
  else if (activeTab.value === 5) query.type = 'SHARE'

  router.push({ name: 'RoomList', query })
}

onMounted(async () => {
  try {
    const data = await vietnamAddressService.getProvinces()
    provinces.value = data || []
  } catch (err) {
    console.error('Error fetching provinces:', err)
  }
})
</script>

<style scoped src="@/assets/css/Hero.css"></style>