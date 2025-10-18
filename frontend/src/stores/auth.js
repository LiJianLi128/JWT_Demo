import { ref } from 'vue'

// 创建响应式认证状态
const isAuthenticated = ref(!!localStorage.getItem('access_token'))

// 更新认证状态
function updateAuthStatus() {
  isAuthenticated.value = !!localStorage.getItem('access_token')
}

// 登录成功后的处理
function handleLoginSuccess(tokenData) {
  localStorage.setItem('access_token', tokenData.access_token)
  localStorage.setItem('refresh_token', tokenData.refresh_token)
  localStorage.setItem('user_info', JSON.stringify(tokenData.user))
  isAuthenticated.value = true
}

// 退出登录处理
function handleLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
  isAuthenticated.value = false
}

// 导出认证状态和方法
export function useAuth() {
  return {
    isAuthenticated,
    updateAuthStatus,
    handleLoginSuccess,
    handleLogout
  }
}