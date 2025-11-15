import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireOwner, requireAdmin, redirectIfAuthenticated } from './guards'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/Login.vue'),
    beforeEnter: redirectIfAuthenticated
  },
  {
    path: '/rooms',
    name: 'RoomList',
    component: () => import('@/pages/RoomList.vue')
  },
  {
    path: '/room/:id',
    name: 'RoomDetail',
    component: () => import('@/pages/RoomDetail.vue'),
    props: true
  },
  {
    path: '/post',
    name: 'Post',
    component: () => import('@/pages/Post.vue'),
    beforeEnter: requireOwner,
    meta: { 
      title: 'Đăng tin cho thuê',
      requiresOwner: true 
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/About.vue')
  },
  {
    path: '/landlord',
    component: () => import('@/layouts/LandlordLayout.vue'),
    children: [
      {
        path: '',
        name: 'Landlord',
        component: () => import('@/pages/Landlord.vue'),
        meta: { title: 'Dành cho chủ trọ' }
      }
    ]
  },
  // Dashboard routes - Chỉ OWNER và ADMIN mới vào được
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    beforeEnter: requireOwner,
    meta: { 
      requiresOwner: true 
    },
    children: [
      {
        path: '',
        name: 'DashboardOverview',
        component: () => import('@/pages/dashboard/DashboardOverview.vue'),
        meta: { title: 'Tổng quan' }
      },
      {
        path: 'post',
        name: 'PostRoom',
        component: () => import('@/pages/dashboard/PostRoom.vue'),
        meta: { title: 'Đăng tin mới' }
      },
      {
        path: 'rooms',
        name: 'RoomManagement',
        component: () => import('@/pages/dashboard/RoomManagement.vue'),
        meta: { title: 'Quản lý phòng' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/dashboard/Analytics.vue'),
        meta: { title: 'Thống kê' }
      }
    ]
  },
  // 404 page
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - PhongTro247`
  } else {
    document.title = 'PhongTro247 - Tìm trọ nhanh, uy tín'
  }
  
  next()
})

export default router 
