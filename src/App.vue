<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { useGoogleAuth } from './composables/useGoogleAuth'

// Xử lý Google OAuth callback khi app khởi động
useGoogleAuth()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
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
