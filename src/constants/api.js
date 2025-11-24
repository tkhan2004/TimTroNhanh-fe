/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * API endpoints constants
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE: '/auth/validate',
    GOOGLE_LOGIN: '/auth/google/login',
    GOOGLE_CALLBACK: '/auth/google/callback'
  },

  // Rooms
  ROOMS: {
    BASE: '/rooms',
    BY_ID: (id) => `/rooms/${id}`,
    BY_ID_FOR_GUEST: (id) => `/rooms/${id}/for-guest`,
    MY_ROOMS: '/rooms/my-rooms',
    FOR_GUEST: '/rooms/for-guest',
    TOGGLE_STATUS: (id) => `/rooms/${id}/toggle-status`
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    BY_ID: (userId) => `/users/${userId}`
  },

  // Favorites
  FAVORITES: {
    TOGGLE: (roomId) => `/favorites/${roomId}/toggle`,
    ADD: (roomId) => `/favorites/${roomId}`,
    REMOVE: (roomId) => `/favorites/${roomId}`,
    MY_FAVORITES: '/favorites/my-favorites'
  },

  // Chat
  CHAT: {
    THREADS: '/chat/threads',
    THREAD_BY_ID: (threadId) => `/chat/threads/${threadId}`,
    THREAD_MESSAGES: (threadId) => `/chat/threads/${threadId}/messages`,
    WS_ENDPOINT: '/ws',
    WS_NATIVE_ENDPOINT: '/ws-native'
  },

  // Upload
  UPLOAD: {
    AVATAR: '/upload/avatar',
    FILE: '/upload/file',
    ROOM_IMAGE: '/upload/room-image',
    ROOM_IMAGES: '/upload/room-images',
    DELETE_FILE: '/upload/file'
  },

  // Utilities
  UTILITIES: {
    BASE: '/utilities',
    BY_ID: (id) => `/utilities/${id}`
  },

  // Reports
  REPORTS: {
    BASE: '/report',
    ADMIN_BASE: '/admin/reports',
    UPDATE_STATUS: (id) => `/admin/reports/${id}/status`
  },

  // Admin
  ADMIN: {
    STATISTICS_OVERVIEW: '/admin/statistics/overview'
  }
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}
