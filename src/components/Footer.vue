<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-column brand-col">
          <div class="footer-logo">
            <img src="../assets/logo.png" alt="Tìm Trọ Nhanh Logo" />
          </div>
          <p class="brand-desc">
            Nền tảng tìm kiếm & cho thuê phòng trọ uy tín hàng đầu Việt Nam. Kết nối chính chủ, minh bạch thông tin.
          </p>
          <div class="footer-social-links">
            <a href="#" class="social-link" title="Facebook">
              <Icon icon="ph:facebook-logo-bold" class="social-icon" />
            </a>
            <a href="#" class="social-link" title="Instagram">
              <Icon icon="ph:instagram-logo-bold" class="social-icon" />
            </a>
            <a href="#" class="social-link" title="TikTok">
              <Icon icon="ph:tiktok-logo-bold" class="social-icon" />
            </a>
            <a href="#" class="social-link" title="YouTube">
              <Icon icon="ph:youtube-logo-bold" class="social-icon" />
            </a>
          </div>
        </div>

        <!-- Links Column 1 -->
        <div class="footer-column">
          <h4 class="footer-column-title">Về Chúng Tôi</h4>
          <ul class="footer-links">
            <li><router-link to="/about">Giới thiệu hệ thống</router-link></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Quy chế hoạt động</a></li>
          </ul>
        </div>

        <!-- Links Column 2 -->
        <div class="footer-column">
          <h4 class="footer-column-title">Dịch Vụ</h4>
          <ul class="footer-links">
            <li><router-link to="/landlord">Đăng tin chính chủ</router-link></li>
            <li><router-link to="/rooms">Tìm trọ sinh viên</router-link></li>
            <li><router-link to="/rooms">Căn hộ dịch vụ</router-link></li>
            <li><a href="#">Bảng giá quảng cáo</a></li>
          </ul>
        </div>

        <!-- Contact Column -->
        <div class="footer-column">
          <h4 class="footer-column-title">Liên Hệ Hỗ Trợ</h4>
          <ul class="footer-contact-list">
            <li>
              <Icon icon="ph:phone-call-bold" class="contact-icon" />
              <span>0123 456 789</span>
            </li>
            <li>
              <Icon icon="ph:envelope-simple-bold" class="contact-icon" />
              <span>hotro@timtronhanh.vn</span>
            </li>
            <li>
              <Icon icon="ph:map-pin-bold" class="contact-icon" />
              <span>Quận Gò Vấp, TP. Hồ Chí Minh</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© 2026 Tìm Trọ Nhanh. Bản quyền thuộc về tkhan2004. Tất cả quyền được bảo lưu.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped src="@/assets/css/Footer.css"></style>