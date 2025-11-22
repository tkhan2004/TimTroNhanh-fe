# Hướng dẫn Google Login với API Backend

## Cách hoạt động

1. **FE gọi API BE**: Khi user click "Đăng nhập với Google", FE gọi `GET /api/auth/google/login`
2. **BE trả về URL**: BE trả về URL Google OAuth để redirect
3. **Redirect đến Google**: FE redirect browser đến URL Google
4. **Google callback**: Google redirect về `GET /api/auth/google/callback?code=...`
5. **BE xử lý code**: BE xử lý code, sinh JWT, trả về user data

## Cấu hình Backend

### API Endpoints cần có:

```javascript
// GET /api/auth/google/login
// Trả về: { url: "https://accounts.google.com/oauth/..." }

// GET /api/auth/google/callback?code=...
// Trả về: { user: {...}, token: "jwt_token" }
```

### Cấu hình Google OAuth trong BE:

1. Tạo Google Cloud Project
2. Enable Google+ API
3. Tạo OAuth 2.0 Client ID
4. Set redirect URI: `http://localhost:3000/api/auth/google/callback`

## Cấu hình Frontend

### 1. Cập nhật API URL

Trong file `src/services/googleAuthService.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api' // Thay đổi theo URL BE
```

### 2. Test chức năng

1. Đảm bảo BE đang chạy
2. Mở FE: `npm run dev`
3. Click "Đăng nhập với Google"
4. Kiểm tra console để xem có lỗi không

## Flow hoàn chỉnh

```
User click "Google" 
    ↓
FE gọi GET /api/auth/google/login
    ↓
BE trả về Google OAuth URL
    ↓
FE redirect đến Google
    ↓
User đăng nhập Google
    ↓
Google redirect về /api/auth/google/callback?code=...
    ↓
BE xử lý code, sinh JWT
    ↓
BE redirect về FE với user data
    ↓
FE lưu user + token vào store
```

## Troubleshooting

### Lỗi CORS
- Đảm bảo BE có CORS config cho FE domain

### Lỗi 404
- Kiểm tra API endpoints trong BE
- Kiểm tra API_BASE_URL trong FE

### Lỗi redirect
- Kiểm tra redirect URI trong Google Cloud Console
- Đảm bảo redirect URI khớp với BE callback URL
