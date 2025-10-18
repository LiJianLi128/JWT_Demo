<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人资料</h2>
    </div>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-else-if="user" class="profile-info">
      <div class="info-item">
        <span class="info-label">用户ID:</span>
        <span class="info-value">{{ user.id }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">用户名:</span>
        <span class="info-value">{{ user.username }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">邮箱:</span>
        <span class="info-value">{{ user.email }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">注册时间:</span>
        <span class="info-value">{{ formatDate(user.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      loading: false,
      errorMessage: ''
    }
  },
  async mounted() {
    await this.loadUserProfile()
  },
  methods: {
    async loadUserProfile() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const response = await authAPI.getProfile()
        this.user = response.data.user
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '获取用户信息失败'
        console.error('获取用户信息失败:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>