import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireOwner, requireAdmin, redirectIfAuthenticated } from './guards'

const routes = [
  // Guest Routes
  {
    path: '/',
    component: () => import('@/layouts/GuestLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/pages/guest/Home.vue')
      },
      {
        path: 'rooms',
        name: 'RoomList',
        component: () => import('@/pages/guest/RoomList.vue')
      },
      {
        path: 'room/:id',
        name: 'RoomDetail',
        component: () => import('@/pages/guest/RoomDetail.vue'),
        props: true
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/pages/guest/About.vue')
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/guest/NotFound.vue')
      }
    ]
  },

  // Landlord Routes
  {
    path: '/landlord',
    component: () => import('@/layouts/LandlordLayout.vue'),
    meta: { layout: 'landlord' },
    children: [
      {
        path: '',
        name: 'Landlord',
        component: () => import('@/pages/landlord/Landlord.vue'),
        meta: { title: 'Dành cho chủ trọ', layout: 'landlord' }
      }
    ]
  },

  // Dashboard Routes
  {
    path: '/dashboard',
    component: () => import('@/layouts/DashboardLayout.vue'),
    beforeEnter: requireOwner,
    meta: {
      requiresOwner: true,
      layout: 'dashboard'
    },
    children: [
      {
        path: '',
        name: 'DashboardOverview',
        component: () => import('@/pages/landlord/dashboard/DashboardOverview.vue'),
        meta: { title: 'Tổng quan' }
      },
      {
        path: 'post',
        name: 'PostRoom',
        component: () => import('@/pages/landlord/dashboard/PostRoom.vue'),
        meta: { layout: 'dashboard', title: 'Đăng tin mới' }
      },
      {
        path: 'rooms',
        name: 'RoomManagement',
        component: () => import('@/pages/landlord/dashboard/RoomManagement.vue'),
        meta: { layout: 'dashboard', title: 'Quản lý phòng' }
      },
      {
        path: 'rooms/:id',
        name: 'OwnerRoomDetail',
        component: () => import('@/pages/landlord/dashboard/OwnerRoomDetail.vue'),
        meta: { layout: 'dashboard', title: 'Chi tiết phòng' }
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/landlord/dashboard/Analytics.vue'),
        meta: { title: 'Thống kê' }
      }
    ]
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
