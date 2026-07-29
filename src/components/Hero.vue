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

        <!-- Search Card Console (Compact 2026) -->
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
                <Icon icon="ph:magnifying-glass-bold" class="hero-field-icon" />
                <input 
                  type="text" 
                  placeholder="Khu vực, đường, trường..."
                  class="field-input"
                  v-model="searchQuery"
                  @keyup.enter="handleSearch"
                />
              </div>

              <!-- Location Select -->
              <div class="input-cell">
                <Icon icon="ph:map-pin-bold" class="hero-field-icon" />
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
                <Icon icon="ph:currency-circle-dollar-bold" class="hero-field-icon" />
                <select class="field-select" v-model="selectedPrice">
                  <option value="" disabled selected>Mức giá</option>
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

            <!-- Quick Suggestion Tags (Compact) -->
            <div class="search-quick-tags">
              <span class="tags-label">Gợi ý nhanh:</span>
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
            <span>100% Chính chủ</span>
          </div>

          <div class="trust-item">
            <Icon icon="ph:shield-check-bold" class="trust-icon" />
            <span>Không phí môi giới</span>
          </div>

          <div class="trust-item">
            <Icon icon="ph:map-pin-line-bold" class="trust-icon" />
            <span>Địa chỉ thực tế</span>
          </div>
        </div>
      </div>

      <!-- Right Column: Visual Photo Card Showcase with Balanced Layers -->
      <div class="hero-right-col">
        <div class="photo-card-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80" 
            alt="Căn hộ phòng trọ hiện đại" 
            class="hero-main-photo"
          />

          <!-- Floating Badge Top Left -->
          <div class="floating-card float-top">
            <div class="float-icon-box box-sky">
              <Icon icon="ph:house-line-duotone" />
            </div>
            <div class="float-text">
              <strong class="float-num">15.000+</strong>
              <span class="float-desc">Phòng trọ sẵn sàng</span>
            </div>
          </div>

          <!-- Floating Badge Bottom Left: Interactive Map Feature -->
          <div class="floating-card float-bottom-left">
            <div class="float-icon-box box-emerald">
              <Icon icon="ph:map-trifold-duotone" />
            </div>
            <div class="float-text">
              <strong class="float-num">Bản đồ thực tế</strong>
              <span class="float-desc">Định vị chuẩn 100%</span>
            </div>
          </div>

          <!-- Floating Badge Bottom Right: Rating -->
          <div class="floating-card float-bottom-right">
            <div class="float-icon-box box-amber">
              <Icon icon="ph:star-duotone" />
            </div>
            <div class="float-text">
              <strong class="float-num">4.9 / 5.0</strong>
              <span class="float-desc">Đánh giá người thuê</span>
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
const searchQuery = ref('')
const selectedLocation = ref('')
const selectedPrice = ref('')
const provinces = ref([])

const searchTabs = [
  'Tất cả',
  'Phòng trọ',
  'Căn hộ mini',
  'Chung cư',
  'Nhà nguyên căn',
  'Ở ghép'
]

const tabCategoryMap = {
  0: '',
  1: 'ROOM',
  2: 'APARTMENT',
  3: 'CONDO',
  4: 'HOUSE',
  5: 'SHARE'
}

const quickTags = [
  'Gần ĐH Bách Khoa',
  'Dưới 3 triệu',
  'Có ban công',
  'Cho nuôi thú cưng'
]

const handleSearch = () => {
  const query = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedLocation.value) query.location = selectedLocation.value
  if (selectedPrice.value) query.price = selectedPrice.value
  
  const categoryCode = tabCategoryMap[activeTab.value]
  if (categoryCode) query.type = categoryCode

  router.push({ name: 'RoomList', query })
}

const applyQuickTag = (tag) => {
  if (tag.includes('Bách Khoa')) {
    searchQuery.value = 'Bách Khoa'
  } else if (tag.includes('3 triệu')) {
    selectedPrice.value = '1-3'
  } else if (tag.includes('ban công') || tag.includes('thú cưng')) {
    searchQuery.value = tag
  }
  handleSearch()
}

onMounted(async () => {
  provinces.value = await vietnamAddressService.getProvinces()
})
</script>

<style scoped src="@/assets/css/Hero.css"></style>