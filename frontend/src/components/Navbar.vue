<template>
  <nav class="navbar" v-if="isAuthenticated">
    <div class="nav-brand">JWT认证Demo</div>
    <div class="nav-links">
      <router-link to="/profile" class="nav-link">个人资料</router-link>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div>
  </nav>
</template>

<script>
import { useAuth } from '../stores/auth'
import { authAPI } from '../services/api'

export default {
  name: 'Navbar',
  methods: {
    async handleLogout() {
      try {
        await authAPI.logout() // 调用后端退出接口
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        const { handleLogout: authLogout } = useAuth()
        authLogout() // 调用认证状态管理中的退出方法
        window.location.href = '/login'
      }
    }
  },
  computed: {
    isAuthenticated() {
      const { isAuthenticated } = useAuth()
      return isAuthenticated.value
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.1);
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.3);
}
</style>