<template>
  <div class="dashboard-overview">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Tổng quan</h1>
      <p class="page-subtitle">Xem tổng quan hoạt động kinh doanh của bạn</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="stat-card"
        :class="stat.trend === 'up' ? 'trend-up' : 'trend-down'"
      >
        <div class="stat-icon">
          <component :is="stat.icon" /> 
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stat.value }}</h3>
          <p class="stat-label">{{ stat.label }}</p>
          <div class="stat-change">
            <span class="change-value">{{ stat.change }}</span>
            <span class="change-period">so với tháng trước</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Revenue Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Doanh thu 6 tháng gần đây</h3>
          <select v-model="revenueFilter" class="chart-filter">
            <option value="6months">6 tháng</option>
            <option value="12months">12 tháng</option>
          </select>
        </div>
        <div class="chart-placeholder">
          <!-- TODO: Thêm chart library -->
          <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
        </div>
      </div>

      <!-- Room Status Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Tình trạng phòng</h3>
        </div>
        <div class="room-status-chart">
          <div class="status-item">
            <div class="status-color available"></div>
            <span>Phòng trống ({{ roomStatus.available }})</span>
          </div>
          <div class="status-item">
            <div class="status-color occupied"></div>
            <span>Đã cho thuê ({{ roomStatus.occupied }})</span>
          </div>
          <div class="status-item">
            <div class="status-color maintenance"></div>
            <span>Bảo trì ({{ roomStatus.maintenance }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-activities">
      <div class="section-header">
        <h3 class="section-title">Hoạt động gần đây</h3>
        <span class="view-all-link" style="cursor: not-allowed; opacity: 0.5;">
          Xem tất cả (Đang phát triển)
        </span>
      </div>
      
      <div class="activities-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            <component :is="activity.icon" />
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BuildingIcon, UsersIcon, CreditCardIcon, EyeIcon } from '@/components/icons'
import { roomService } from '@/services/roomService'

/** Stats data */
const stats = ref([
  {
    label: 'Tổng phòng',
    value: '0',
    change: '0',
    trend: 'neutral',
    icon: 'BuildingIcon'
  },
  {
    label: 'Phòng đã thuê',
    value: '0',
    change: '0',
    trend: 'neutral',
    icon: 'UsersIcon'
  },
  {
    label: 'Doanh thu tháng',
    value: '0',
    change: '0%',
    trend: 'neutral',
    icon: 'CreditCardIcon'
  },
  {
    label: 'Lượt xem',
    value: '0',
    change: '0%',
    trend: 'neutral',
    icon: 'EyeIcon'
  }
])

/** Room status */
const roomStatus = ref({
  available: 0,
  occupied: 0,
  maintenance: 0
})

/** Recent activities */
const recentActivities = ref([])

const revenueFilter = ref('6months')
const loading = ref(false)

/**
 * Load dashboard data từ API
 */
const loadDashboardData = async () => {
  loading.value = true
  try {
    // Lấy danh sách phòng của user (lấy số lượng lớn để tính toán)
    const response = await roomService.getMyRooms({ size: 100 })
    const rooms = response.data?.content || []
    
    // 1. Tính toán thống kê phòng
    const totalRooms = response.data?.totalElements || rooms.length
    const rentedRooms = rooms.filter(r => r.status === 'RENTED').length
    const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length
    // Giả sử có status MAINTENANCE hoặc tính các status khác
    const maintenanceRooms = rooms.filter(r => r.status !== 'RENTED' && r.status !== 'AVAILABLE').length

    // Cập nhật Stats Cards
    stats.value[0].value = totalRooms.toString()
    stats.value[0].change = '+0' // Cần API lịch sử để tính change thực tế
    
    stats.value[1].value = rentedRooms.toString()
    stats.value[1].change = '+0'

    // Tính doanh thu ước tính (tổng giá các phòng đã thuê)
    const estimatedRevenue = rooms
      .filter(r => r.status === 'RENTED')
      .reduce((sum, r) => sum + (r.price || 0), 0)
    
    stats.value[2].value = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(estimatedRevenue)

    // Cập nhật biểu đồ trạng thái
    roomStatus.value = {
      available: availableRooms,
      occupied: rentedRooms,
      maintenance: maintenanceRooms
    }

    // TODO: Lấy recent activities từ API nếu có
    // Tạm thời để trống hoặc mock data nếu cần thiết
    recentActivities.value = []

  } catch (error) {
    console.error('Lỗi khi load dashboard:', error)
  } finally {
    loading.value = false
  }
}

/** Load data khi component mount */
onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped src="@/assets/css/DashboardOverview.css"></style>