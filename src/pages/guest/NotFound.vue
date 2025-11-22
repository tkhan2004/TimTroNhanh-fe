<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">Trang không tìm thấy</h1>
      <p class="error-message">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">Về trang chủ</router-link>
        <router-link to="/rooms" class="btn btn-secondary">Tìm phòng</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 Not Found page
</script>

<style scoped src="@/assets/css/pages/NotFound.css"></style>

