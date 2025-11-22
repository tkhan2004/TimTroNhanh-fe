<template>
  <div class="analytics">
    <div class="page-header">
      <h1 class="page-title">Thống kê & Báo cáo</h1>
      <p class="page-subtitle">Phân tích hiệu suất kinh doanh</p>
    </div>

    <div class="analytics-grid">
      <div class="chart-card">
        <h3>Doanh thu theo tháng</h3>
        <div class="chart-placeholder">
          📊 Biểu đồ doanh thu sẽ hiển thị ở đây
        </div>
      </div>

      <div class="chart-card">
        <h3>Tỷ lệ lấp đầy phòng</h3>
        <div class="occupancy-rate">
          <div class="rate-circle">
            <span class="rate-number">75%</span>
          </div>
          <p>Tỷ lệ lấp đầy trung bình</p>
        </div>
      </div>

      <div class="chart-card">
        <h3>Top phòng được quan tâm</h3>
        <div class="top-rooms">
          <div v-for="room in topRooms" :key="room.id" class="room-stat">
            <span class="room-name">{{ room.name }}</span>
            <span class="room-views">{{ room.views }} lượt xem</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/** Top rooms data */
const topRooms = ref([
  { id: 1, name: 'Phòng trọ cao cấp Q1', views: 1234 },
  { id: 2, name: 'Phòng gần ĐH Bách Khoa', views: 987 },
  { id: 3, name: 'Phòng trọ Q7', views: 756 }
])
</script>

<style scoped src="@/assets/css/pages/dashboard/Analytics.css"></style>