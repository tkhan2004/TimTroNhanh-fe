<template>
  <div class="home-page">
    <Hero 
      title="Tìm Phòng Trọ Dễ Dàng Nhất" 
      subtitle="Khám phá hàng ngàn phòng trọ, căn hộ, nhà nguyên căn phù hợp với nhu cầu của bạn"
      backgroundImage="https://images.unsplash.com/photo-1560448204-e02f5b9b964a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      searchPlaceholder="Nhập địa chỉ, quận hoặc khu vực"
      :quickFilters="[
        { label: 'Phòng trọ', value: 'room' },
        { label: 'Nhà nguyên căn', value: 'house' },
        { label: 'Căn hộ', value: 'apartment' }
      ]"
    />

    <div class="container">
      <!-- Featured Rooms Section -->
      <section class="featured-rooms">
        <div class="section-header">
          <h2 class="section-title">Phòng Trọ Nổi Bật</h2>
          <p class="section-description">Những phòng trọ được nhiều người quan tâm nhất</p>
        </div>

        <div class="rooms-grid">
          <RoomCard 
            v-for="room in featuredRooms" 
            :key="room.id" 
            :room="room" 
          />
        </div>
      </section>

      <!-- Popular Cities Section -->
      <section class="popular-cities">
        <div class="section-header">
          <h2 class="section-title">Địa Điểm Thuê Trọ Phổ Biến</h2>
          <p class="section-description">Khám phá những thành phố có nhu cầu thuê trọ cao nhất</p>
        </div>

        <div class="cities-grid">
          <div 
            v-for="city in popularCities" 
            :key="city.id" 
            class="city-card"
            @click="navigateToCity(city.slug)"
          >
            <div class="city-image-container">
              <img :src="city.image" :alt="city.name" class="city-image" />
              <div class="city-overlay">
                <h3 class="city-name">{{ city.name }}</h3>
                <p class="city-room-count">{{ city.roomCount }} phòng trọ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Blog Section -->
      <section class="blog-section">
        <div class="section-header">
          <h2 class="section-title">Tin Tức & Hướng Dẫn</h2>
          <p class="section-description">Những bài viết hữu ích về thuê trọ</p>
        </div>

        <div class="blog-grid">
          <div 
            v-for="post in blogPosts" 
            :key="post.id" 
            class="blog-card"
            @click="navigateToBlogPost(post.slug)"
          >
            <div class="blog-image-container">
              <img :src="post.image" :alt="post.title" class="blog-image" />
            </div>
            <div class="blog-content">
              <h3 class="blog-title">{{ post.title }}</h3>
              <p class="blog-excerpt">{{ post.excerpt }}</p>
              <div class="blog-meta">
                <span class="blog-author">{{ post.author }}</span>
                <span class="blog-date">{{ formatDate(post.date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="blog-cta">
          <router-link to="/blog" class="view-all-posts-btn">
            Xem tất cả bài viết
          </router-link>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="features-grid">
          <div class="feature-card">
            <svg viewBox="0 0 24 24" class="feature-icon">
              <path d="M12 4.5v15m7.5-7.5h-15"></path>
            </svg>
            <h3 class="feature-title">Đăng tin miễn phí</h3>
            <p class="feature-description">Dễ dàng đăng tin phòng trọ của bạn mà không mất phí</p>
          </div>

          <div class="feature-card">
            <svg viewBox="0 0 24 24" class="feature-icon">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="feature-title">Xác thực an toàn</h3>
            <p class="feature-description">Chúng tôi kiểm duyệt và xác thực mọi tin đăng</p>
          </div>

          <div class="feature-card">
            <svg viewBox="0 0 24 24" class="feature-icon">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="feature-title">Minh bạch giá</h3>
            <p class="feature-description">Không phát sinh chi phí ẩn, giá rõ ràng</p>
          </div>
        </div>
      </section>

      <!-- Landlord CTA Section -->
      <section class="landlord-cta">
        <div class="cta-content">
          <div class="cta-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h2 class="cta-title">Bạn là chủ trọ?</h2>
          <p class="cta-description">
            Đăng tin miễn phí, quản lý phòng trọ dễ dàng, tiếp cận hàng nghìn khách thuê tiềm năng
          </p>
          <router-link to="/landlord" class="btn btn-primary btn-large">
            Đăng ký / Đăng nhập cho chủ trọ
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavorites } from '@/composables/useFavorites'
import { useAuthStore } from '@/stores/auth'
import Hero from '@/components/Hero.vue'
import RoomCard from '@/components/RoomCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const { loadFavorites } = useFavorites()

// Featured Rooms
const featuredRooms = ref([
  {
    id: 1,
    title: 'Phòng trọ đầy đủ tiện nghi tại Quận 1',
    type: 'room',
    price: 3500000,
    area: 25,
    location: 'Quận 1, TP. Hồ Chí Minh',
    img: 'https://picsum.photos/300/200?1',
    isHot: true
  },
  {
    id: 2,
    title: 'Căn hộ mini gần trung tâm',
    type: 'apartment',
    price: 4700000,
    area: 35,
    location: 'Quận 3, TP. Hồ Chí Minh',
    img: 'https://picsum.photos/300/200?2',
    isHot: true
  },
  {
    id: 3,
    title: 'Nhà nguyên căn rộng rãi',
    type: 'house',
    price: 8000000,
    area: 50,
    location: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
    img: 'https://picsum.photos/300/200?3',
    isHot: false
  },
  {
    id: 4,
    title: 'Studio cao cấp view đẹp',
    type: 'apartment',
    price: 5500000,
    area: 40,
    location: 'Quận 4, TP. Hồ Chí Minh',
    img: 'https://picsum.photos/300/200?4',
    isHot: true
  }
])

// Popular Cities
const popularCities = ref([
  {
    id: 1,
    name: 'TP. Hồ Chí Minh',
    slug: 'ho-chi-minh',
    roomCount: 5234,
    image: 'https://picsum.photos/600/400?hcm'
  },
  {
    id: 2,
    name: 'Hà Nội',
    slug: 'ha-noi',
    roomCount: 3876,
    image: 'https://picsum.photos/600/400?hn'
  },
  {
    id: 3,
    name: 'Đà Nẵng',
    slug: 'da-nang',
    roomCount: 1542,
    image: 'https://picsum.photos/600/400?dn'
  },
  {
    id: 4,
    name: 'Cần Thơ',
    slug: 'can-tho',
    roomCount: 876,
    image: 'https://picsum.photos/600/400?ct'
  }
])

// Blog Posts
const blogPosts = ref([
  {
    id: 1,
    title: 'Hướng Dẫn Thuê Phòng Trọ An Toàn',
    slug: 'huong-dan-thue-phong-tro-an-toan',
    excerpt: 'Những điều cần lưu ý khi thuê phòng trọ để đảm bảo an toàn và tiện nghi.',
    author: 'Nguyễn Văn A',
    date: new Date('2023-07-15'),
    image: 'https://picsum.photos/600/400?blog1'
  },
  {
    id: 2,
    title: 'Kinh Nghiệm Chọn Phòng Trọ Cho Sinh Viên',
    slug: 'kinh-nghiem-chon-phong-tro-sinh-vien',
    excerpt: 'Những mẹo vàng giúp sinh viên tìm được phòng trọ phù hợp và tiết kiệm.',
    author: 'Trần Thị B',
    date: new Date('2023-07-10'),
    image: 'https://picsum.photos/600/400?blog2'
  },
  {
    id: 3,
    title: 'Top 5 Khu Vực Cho Thuê Phòng Trọ Tốt Nhất',
    slug: 'top-5-khu-vuc-cho-thue-phong-tro',
    excerpt: 'Khám phá những khu vực lý tưởng nhất để thuê phòng trọ tại TP. Hồ Chí Minh.',
    author: 'Lê Văn C',
    date: new Date('2023-07-05'),
    image: 'https://picsum.photos/600/400?blog3'
  }
])

// Methods
const navigateToCity = (citySlug) => {
  router.push({ 
    name: 'RoomList', 
    query: { city: citySlug } 
  })
}

const navigateToBlogPost = (postSlug) => {
  router.push({ 
    name: 'BlogPost', 
    params: { slug: postSlug } 
  })
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Load favorites on mount if logged in
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await loadFavorites()
  }
})
</script> 

<style scoped src="@/assets/css/Home.css"></style>