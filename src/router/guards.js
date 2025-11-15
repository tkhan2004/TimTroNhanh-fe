import { useAuthStore } from '@/stores/auth'

/**
 * Route guards để bảo vệ routes dựa trên authentication và roles
 */

/**
 * Kiểm tra user đã đăng nhập chưa
 * @param {Object} to - Route đang đi tới
 * @param {Object} from - Route đang đi từ
 * @param {Function} next - Next function
 */
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Restore session từ localStorage
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
  
  if (!authStore.isLoggedIn) {
    // Chưa đăng nhập, redirect về login
    next({
      name: 'Home',
      query: { redirect: to.fullPath, login: 'true' }
    })
  } else {
    next()
  }
}

/**
 * Kiểm tra user là chủ trọ (OWNER) hoặc ADMIN
 * @param {Object} to - Route đang đi tới
 * @param {Object} from - Route đang đi từ
 * @param {Function} next - Next function
 */
export const requireOwner = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Restore session từ localStorage
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
  
  if (!authStore.isLoggedIn) {
    // Chưa đăng nhập
    next({
      name: 'Home',
      query: { redirect: to.fullPath, login: 'true' }
    })
  } else if (!authStore.isLandlord && !authStore.isAdmin) {
    // Đã đăng nhập nhưng không phải OWNER/ADMIN
    next({
      name: 'Home',
      query: { 
        error: 'access_denied',
        message: 'Bạn không có quyền truy cập trang này. Chỉ chủ trọ mới có thể đăng tin.'
      }
    })
  } else {
    next()
  }
}

/**
 * Kiểm tra user là ADMIN
 * @param {Object} to - Route đang đi tới
 * @param {Object} from - Route đang đi từ
 * @param {Function} next - Next function
 */
export const requireAdmin = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Restore session từ localStorage
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
  
  if (!authStore.isLoggedIn) {
    next({
      name: 'Home',
      query: { redirect: to.fullPath, login: 'true' }
    })
  } else if (!authStore.isAdmin) {
    next({
      name: 'Home',
      query: { 
        error: 'access_denied',
        message: 'Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể truy cập.'
      }
    })
  } else {
    next()
  }
}

/**
 * Redirect nếu đã đăng nhập (dùng cho login/register pages)
 * @param {Object} to - Route đang đi tới
 * @param {Object} from - Route đang đi từ
 * @param {Function} next - Next function
 */
export const redirectIfAuthenticated = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isLoggedIn) {
    authStore.restoreSession()
  }
  
  if (authStore.isLoggedIn) {
    // Đã đăng nhập, redirect về trang chủ hoặc dashboard
    if (authStore.isLandlord || authStore.isAdmin) {
      next({ name: 'DashboardOverview' })
    } else {
      next({ name: 'Home' })
    }
  } else {
    next()
  }
}

