<template>
  <div class="form-container">
    <h2 class="form-title">登录</h2>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label class="form-label" for="username">用户名</label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          class="form-input"
          required
          placeholder="请输入用户名"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-input"
          required
          placeholder="请输入密码"
        />
      </div>
      
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    
    <div class="form-link">
      <span>还没有账号？</span>
      <router-link to="/register">立即注册</router-link>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'
import { useAuth } from '../stores/auth'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const response = await authAPI.login(this.form)
        
        // 使用新的响应式状态管理
        const { handleLoginSuccess } = useAuth()
        handleLoginSuccess(response.data)
        
        // 跳转到个人资料页
        this.$router.push('/profile')
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '登录失败，请重试'
        this.loading = false
      } finally {
        // 只在成功时设置loading为false，错误时在catch中已经设置
        if (!this.errorMessage) {
          this.loading = false
        }
      }
    }
  }
}
</script>