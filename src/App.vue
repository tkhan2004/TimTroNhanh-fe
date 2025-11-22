<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoogleAuth } from './composables/useGoogleAuth'
import { useAuthStore } from './stores/auth'

// Xử lý Google OAuth callback khi app khởi động
useGoogleAuth()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Error message từ query params
const errorMessage = ref('')
const showError = ref(false)

// Watch route changes để hiển thị error messages
watch(() => route.query, (newQuery) => {
  if (newQuery.error === 'access_denied' && newQuery.message) {
    errorMessage.value = decodeURIComponent(newQuery.message)
    showError.value = true
    
    // Auto hide sau 5 giây
    setTimeout(() => {
      showError.value = false
      // Remove error from query
      const { error, message, ...rest } = route.query
      router.replace({ query: rest })
    }, 5000)
  }
  
  // Auto open login modal nếu có query login=true
  if (newQuery.login === 'true') {
    // Trigger login modal (cần emit event hoặc dùng store)
    // Có thể thêm logic mở modal ở đây
  }
}, { immediate: true })

// Restore session on mount
onMounted(() => {
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
})

const closeError = () => {
  showError.value = false
  const { error, message, ...rest } = route.query
  router.replace({ query: rest })
}
</script>



<template>
  <div class="min-h-screen flex flex-col">
    <!-- Error Alert (global) -->
    <transition name="fade">
      <div v-if="showError" class="error-banner">
        <div class="error-content">
          <svg viewBox="0 0 24 24" class="error-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span class="error-text">{{ errorMessage }}</span>
          <button @click="closeError" class="error-close">×</button>
        </div>
      </div>
    </transition>
    
    <router-view />
  </div>
</template>

<style>
/* Reset CSS và style chung */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom form controls */
.form-control {
  display: block;
  width: 100%;
  padding: 0.875rem 1.125rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  background-color: #ffffff;
  background-clip: padding-box;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-control:focus {
  border-color: #3b82f6;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.form-control::placeholder {
  color: #9ca3af;
  opacity: 1;
}

/* Custom buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  line-height: 1.5;
  border-radius: 0.75rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  text-decoration: none;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-outline-primary {
  border: 2px solid #3b82f6;
  color: #3b82f6;
  background-color: transparent;
}

.btn-outline-primary:hover {
  background-color: #3b82f6;
  color: white;
}

/* Card styles */
.card {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Container styles */
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
    padding-right: 1.5rem;
    padding-left: 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

@media (min-width: 1536px) {
  .container {
    max-width: 1536px;
  }
}

/* Alert styles */
.alert {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.alert-success {
  background-color: #ecfdf5;
  color: #065f46;
  border-color: #a7f3d0;
}

.alert-error {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fca5a5;
}

.alert-warning {
  background-color: #fffbeb;
  color: #92400e;
  border-color: #fcd34d;
}

.alert-info {
  background-color: #eff6ff;
  color: #1e40af;
  border-color: #93c5fd;
}

/* Link styles */
a {
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
}

a:hover {
  color: #3b82f6;
}

/* Utility classes */
.hover-shadow:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Loading spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e1, #94a3b8);
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #94a3b8, #64748b);
}

::-webkit-scrollbar-corner {
  background: #f8fafc;
}

/* Focus styles for accessibility */
.focus-ring:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}

/* Text selection */
::selection {
  background-color: rgba(59, 130, 246, 0.2);
  color: #1e40af;
}

::-moz-selection {
  background-color: rgba(59, 130, 246, 0.2);
  color: #1e40af;
}

/* Error Banner */
.error-banner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.error-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-weight: 500;
}

.error-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    font-size: 12pt;
    line-height: 1.4;
  }

  .container {
    max-width: none;
    padding: 0;
  }
}
</style>
