<template>
  <div class="form-container">
    <h2 class="form-title">注册</h2>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="handleRegister">
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
        <label class="form-label" for="email">邮箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          required
          placeholder="请输入邮箱"
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
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
    
    <div class="form-link">
      <span>已有账号？</span>
      <router-link to="/login">立即登录</router-link>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/api'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: ''
      },
      loading: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        const response = await authAPI.register(this.form)
        this.successMessage = response.data.message
        
        // 清空表单
        this.form = {
          username: '',
          email: '',
          password: ''
        }
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
      } catch (error) {
        this.errorMessage = error.response?.data?.message || '注册失败，请重试'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>