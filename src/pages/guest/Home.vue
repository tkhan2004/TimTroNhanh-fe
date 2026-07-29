<template>
  <div class="home-page">
    <Hero />

    <div class="main-container">
      <!-- Section 1: Featured Rooms -->
      <section class="home-section">
        <div class="section-header-modern">
          <div class="header-content">
            <h2 class="section-title">Phòng Trọ Nổi Bật</h2>
            <p class="section-subtitle">Danh sách phòng trọ chính chủ mới cập nhật với thông tin rõ ràng</p>
          </div>
          <router-link to="/rooms" class="btn-link-action">
            <span>Xem tất cả</span>
            <Icon icon="ph:arrow-right-bold" class="link-arrow" />
          </router-link>
        </div>

        <div class="rooms-grid">
          <RoomCard 
            v-for="room in featuredRooms" 
            :key="room.id" 
            :room="room" 
          />
        </div>
      </section>

      <!-- Section 2: Recommended For You -->
      <section class="home-section">
        <div class="section-header-modern">
          <div class="header-content">
            <h2 class="section-title">Gợi Ý Dành Cho Bạn</h2>
            <p class="section-subtitle">Phòng trọ được lựa chọn theo nhu cầu và ngân sách phổ biến</p>
          </div>
          
          <div class="rec-tabs">
            <button 
              v-for="(tab, i) in recTabs" 
              :key="i"
              @click="activeRecTab = i"
              :class="['rec-tab-btn', { 'active': activeRecTab === i }]"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <div class="rooms-grid">
          <RoomCard 
            v-for="room in recommendedRooms" 
            :key="`rec-${room.id}`" 
            :room="room" 
          />
        </div>
      </section>

      <!-- Section 3: Popular Cities -->
      <section class="home-section">
        <div class="section-header-modern">
          <div class="header-content">
            <h2 class="section-title">Khu Vực Hot Nhất</h2>
            <p class="section-subtitle">Khám phá phòng trọ tại các trung tâm kinh tế & đại học hàng đầu</p>
          </div>
        </div>

        <div class="bento-cities-grid">
          <div 
            v-for="(city, index) in popularCities" 
            :key="city.id" 
            :class="['bento-city-item', `bento-item-${index + 1}`]"
            @click="navigateToCity(city.slug)"
          >
            <img :src="city.image" :alt="city.name" class="bento-city-img" loading="lazy" />
            <div class="bento-city-overlay">
              <span class="city-room-badge">{{ city.roomCount }} phòng</span>
              <h3 class="city-name">{{ city.name }}</h3>
              <span class="city-explore-link">Khám phá →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 4: Editorial News & Magazine Journal (Trình bày phong cách Tạp chí cao cấp) -->
      <section class="home-section editorial-news-section">
        <div class="section-header-modern">
          <div class="header-content">
            <span class="editorial-kicker">Cẩm Nang & Tạp Chí</span>
            <h2 class="section-title">Kinh Nghiệm & Điểm Tin Thuê Trọ</h2>
          </div>
          <a href="#" class="btn-link-action">
            <span>Tất cả bài viết</span>
            <Icon icon="ph:arrow-right-bold" class="link-arrow" />
          </a>
        </div>

        <!-- Editorial Magazine Layout Grid -->
        <div class="editorial-grid">
          <!-- Featured Main Cover Article (Left 60%) -->
          <article class="editorial-hero-card" v-if="featuredArticle">
            <div class="hero-card-image-bg">
              <img :src="featuredArticle.image" :alt="featuredArticle.title" />
              <div class="hero-card-gradient"></div>
            </div>

            <div class="hero-card-content">
              <div class="hero-card-top-tags">
                <span class="editorial-badge-pill">{{ featuredArticle.category }}</span>
                <span class="hero-read-time">
                  <Icon icon="ph:clock-bold" /> {{ featuredArticle.readTime }}
                </span>
              </div>

              <h3 class="hero-card-title">{{ featuredArticle.title }}</h3>
              <p class="hero-card-excerpt">{{ featuredArticle.excerpt }}</p>

              <div class="hero-card-footer">
                <div class="author-info">
                  <div class="author-avatar-circle">
                    <Icon icon="ph:user-bold" />
                  </div>
                  <span class="author-name">Ban Biên Tập Tìm Trọ Nhanh</span>
                  <span class="dot-separator">•</span>
                  <span class="article-date">{{ featuredArticle.date }}</span>
                </div>

                <a href="#" class="btn-editorial-read">
                  <span>Đọc bài viết</span>
                  <Icon icon="ph:arrow-up-right-bold" />
                </a>
              </div>
            </div>
          </article>

          <!-- Secondary Articles Stack (Right 40%) -->
          <div class="editorial-list-stack">
            <article 
              v-for="(item, idx) in secondaryArticles" 
              :key="item.id" 
              class="editorial-list-item"
            >
              <span class="item-number">0{{ idx + 1 }}</span>

              <div class="item-body">
                <div class="item-meta">
                  <span class="item-tag">{{ item.category }}</span>
                  <span class="dot-separator">•</span>
                  <span class="item-date">{{ item.date }}</span>
                </div>
                <h4 class="item-title">{{ item.title }}</h4>
                <p class="item-desc">{{ item.excerpt }}</p>
              </div>

              <div class="item-thumb-wrapper">
                <img :src="item.image" :alt="item.title" class="item-thumb-img" />
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Section 5: Trust & Why Choose Us -->
      <section class="home-section trust-section">
        <div class="section-header-modern text-center-header">
          <h2 class="section-title">Tại sao chọn Tìm Trọ Nhanh?</h2>
          <p class="section-subtitle">Giải pháp tiện lợi, an toàn và minh bạch cho cả khách thuê lẫn chủ nhà</p>
        </div>

        <div class="bento-features-grid">
          <div class="feature-bento-card">
            <div class="feature-icon-wrapper icon-teal">
              <Icon icon="ph:shield-check-bold" />
            </div>
            <h3 class="feature-title">Chính chủ 100% xác minh</h3>
            <p class="feature-desc">Mọi bài đăng đều trải qua quy trình kiểm duyệt thông tin giấy tờ đảm bảo an tâm tuyệt đối.</p>
          </div>

          <div class="feature-bento-card">
            <div class="feature-icon-wrapper icon-sky">
              <Icon icon="ph:map-pin-line-bold" />
            </div>
            <h3 class="feature-title">Bản đồ định vị chuẩn xác</h3>
            <p class="feature-desc">Tìm phòng chính xác theo bán kính, gần trường học, trạm xe buýt và tiện ích xung quanh.</p>
          </div>

          <div class="feature-bento-card">
            <div class="feature-icon-wrapper icon-amber">
              <Icon icon="ph:currency-circle-dollar-bold" />
            </div>
            <h3 class="feature-title">Không phí môi giới ẩn</h3>
            <p class="feature-desc">Kết nối làm việc trực tiếp với chủ trọ. Giá cả niêm yết rõ ràng, không phát sinh chi phí phụ.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Hero from '@/components/Hero.vue'
import RoomCard from '@/components/RoomCard.vue'
import { roomService } from '@/services/roomService'

const router = useRouter()
const featuredRooms = ref([])
const activeRecTab = ref(0)

const recTabs = ['Tất cả', 'Phòng trọ', 'Chung cư', 'Nhà nguyên căn', 'Căn hộ mini', 'Ở ghép']

const sampleRooms = [
  {
    id: 201,
    title: 'Phòng trọ studio cao cấp gần ĐH Bách Khoa - Xây mới 100%',
    price: 3200000,
    area: 28,
    type: 'ROOM',
    status: 'AVAILABLE',
    address: '40 Tạ Quang Bửu',
    district: 'Hai Bà Trưng',
    province: 'Hà Nội',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Điều hòa' }, { id: 2, name: 'Nóng lạnh' }]
  },
  {
    id: 202,
    title: 'Căn hộ mini full đồ ban công thoáng mát Quận 10',
    price: 4200000,
    area: 32,
    type: 'APARTMENT',
    status: 'AVAILABLE',
    address: 'Lý Thường Kiệt',
    district: 'Quận 10',
    province: 'TP. Hồ Chí Minh',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Tủ lạnh' }, { id: 2, name: 'Giờ tự do' }]
  },
  {
    id: 203,
    title: 'Phòng trọ sinh viên sạch sẽ khép kín gần ĐH Quốc Gia',
    price: 2500000,
    area: 24,
    type: 'ROOM',
    status: 'AVAILABLE',
    address: 'Xuân Thủy',
    district: 'Cầu Giấy',
    province: 'Hà Nội',
    createdAt: new Date().toISOString(),
    images: ['https://images.unsplash.com/photo-1560448204-e02f5b9b964a?auto=format&fit=crop&w=800&q=80'],
    utilities: [{ id: 1, name: 'Khép kín' }, { id: 2, name: 'Máy giặt chung' }]
  },
  {
    id: 204,
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
    utilities: [{ id: 1, name: 'Hồ bơi' }, { id: 2, name: 'Phòng Gym' }, { id: 3, name: 'Thang máy' }]
  }
]

const recommendedRooms = computed(() => sampleRooms)

const popularCities = ref([
  {
    id: 1,
    name: 'Hà Nội',
    slug: 'ha-noi',
    roomCount: '4.850+',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'TP. Hồ Chí Minh',
    slug: 'ho-chi-minh',
    roomCount: '6.200+',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Đà Nẵng',
    slug: 'da-nang',
    roomCount: '1.450+',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 4,
    name: 'Bình Dương',
    slug: 'binh-duong',
    roomCount: '980+',
    image: 'https://images.unsplash.com/photo-1560448204-e02f5b9b964a?auto=format&fit=crop&w=800&q=80'
  }
])

// Editorial Magazine Articles Data
const featuredArticle = ref({
  id: 1,
  title: 'Top 5 điều khoản quan trọng trong hợp đồng thuê trọ bạn tuyệt đối không được xem nhẹ năm 2026',
  excerpt: 'Phân tích chi tiết quy định về tiền cọc, chi phí phát sinh điện nước sinh hoạt và điều kiện bồi thường giúp bạn bảo vệ quyền lợi pháp lý tối đa.',
  category: 'Cẩm nang pháp lý',
  date: '28 Th07, 2026',
  readTime: '6 phút đọc',
  image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80'
})

const secondaryArticles = ref([
  {
    id: 2,
    title: 'Bí quyết hô biến phòng trọ 20m² thành căn Studio phong cách Minimalist cực sang',
    excerpt: 'Giải pháp chọn đồ nội thất thông minh đa năng và mẹo phối màu ánh sáng mở rộng không gian sống.',
    category: 'Mẹo trang trí',
    date: '26 Th07, 2026',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    title: 'Nhận biết 4 chiêu trò lừa đảo cọc giữ chỗ phòng trọ phổ biến hiện nay',
    excerpt: 'Cách tra cứu thông tin chính chủ và quy trình làm việc minh bạch không qua trung gian môi giới.',
    category: 'Cảnh báo lừa đảo',
    date: '24 Th07, 2026',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    title: 'Kinh nghiệm tìm bạn ở ghép hòa hợp, văn minh cho tân sinh viên',
    excerpt: 'Những quy tắc ứng xử, chia sẻ chi phí sinh hoạt và danh mục thống nhất chung giúp sống tập thể êm đẹp.',
    category: 'Sống tập thể',
    date: '21 Th07, 2026',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80'
  }
])

const navigateToCity = (slug) => {
  router.push({ name: 'RoomList', query: { location: slug } })
}

onMounted(async () => {
  try {
    const res = await roomService.getRooms({ page: 0, size: 4, status: 'AVAILABLE' })
    const fetchedList = res.content || res || []
    if (fetchedList.length > 0) {
      featuredRooms.value = fetchedList
    } else {
      featuredRooms.value = sampleRooms
    }
  } catch (err) {
    featuredRooms.value = sampleRooms
  }
})
</script>

<style scoped src="@/assets/css/Home.css"></style>