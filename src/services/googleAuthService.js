/**
 * Google Authentication Service
 * Sử dụng Google Sign-In JavaScript API
 */

const API_BASE_URL = 'http://localhost:8080/api' // Thay đổi theo URL BE của bạn
const GOOGLE_CLIENT_ID = '270436218674-srvfetl5ks8dridnldjj532js5csags7' // Thay đổi theo Client ID của bạn

/**
 * Khởi tạo Google Sign-In
 */
export const initializeGoogleSignIn = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      })
      resolve()
    } else {
      // Load Google Sign-In script
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        })
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    }
  })
}

/**
 * Xử lý response từ Google Sign-In
 */
const handleGoogleResponse = async (response) => {
  try {
    const { credential } = response
    await loginWithGoogleToken(credential)
  } catch (error) {
    console.error('Google Sign-In error:', error)
  }
}

/**
 * Đăng nhập với Google ID Token
 */
export const loginWithGoogleToken = async (idToken) => {
  try {
    console.log('=== GOOGLE LOGIN DEBUG ===')
    console.log('Full ID Token:', idToken)
    console.log('ID Token length:', idToken.length)
    console.log('ID Token first 100 chars:', idToken.substring(0, 100))
    console.log('ID Token last 100 chars:', idToken.substring(idToken.length - 100))
    
    // Decode ID Token để xem nội dung
    try {
      const parts = idToken.split('.')
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]))
        const payload = JSON.parse(atob(parts[1]))
        console.log('ID Token Header:', header)
        console.log('ID Token Payload:', payload)
        console.log('Issuer (iss):', payload.iss)
        console.log('Audience (aud):', payload.aud)
        console.log('Subject (sub):', payload.sub)
        console.log('Email:', payload.email)
        console.log('Name:', payload.name)
        console.log('Expires (exp):', new Date(payload.exp * 1000))
        console.log('Issued at (iat):', new Date(payload.iat * 1000))
      }
    } catch (decodeError) {
      console.error('Error decoding ID Token:', decodeError)
    }
    
    const requestBody = { idToken }
    console.log('Request body:', requestBody)
    console.log('Request body JSON:', JSON.stringify(requestBody))
    console.log('Request body length:', JSON.stringify(requestBody).length)
    console.log('ID Token in request:', requestBody.idToken.substring(0, 50) + '...')
    
    const response = await fetch(`${API_BASE_URL}/auth/google/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      // Lấy chi tiết lỗi từ response
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.status === 200 && data.data) {
      console.log('JWT Token received:', data.data)
      console.log('JWT Token length:', data.data.length)
      
      // Lưu JWT token vào localStorage
      localStorage.setItem('token', data.data)
      localStorage.setItem('isLoggedIn', 'true')
      
      console.log('Token saved to localStorage')
      
      // Redirect về trang chủ
      window.location.href = '/'
      
      return data
    } else {
      throw new Error(data.message || 'Đăng nhập thất bại')
    }
  } catch (error) {
    console.error('Error logging in with Google:', error)
    throw error
  }
}

/**
 * Xử lý callback từ Google (khi BE redirect về)
 * @param {string} code - Authorization code từ Google
 * @returns {Promise<Object>} User data và JWT token
 */
export const handleGoogleCallback = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Xử lý response từ BE
    if (data.status === 200 && data.data) {
      return {
        user: {
          id: data.data.userId,
          email: data.data.email,
          fullName: data.data.fullName,
          role: data.data.role.toLowerCase() // RENTER -> renter
        },
        token: data.data.accessToken
      }
    } else {
      throw new Error(data.message || 'Đăng nhập thất bại')
    }
  } catch (error) {
    console.error('Error handling Google callback:', error)
    throw new Error('Đăng nhập Google thất bại')
  }
}

/**
 * Redirect browser đến URL đăng nhập Google
 */
export const redirectToGoogleLogin = async () => {
  try {
    const loginUrl = await getGoogleLoginUrl()
    // Redirect browser đến URL Google
    window.location.href = loginUrl
  } catch (error) {
    console.error('Error redirecting to Google login:', error)
    throw error
  }
}
