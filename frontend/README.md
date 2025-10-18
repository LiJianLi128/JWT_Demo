# Vue3 JWT认证前端Demo

基于Vue3 + Vite + JavaScript构建的JWT认证前端应用，与Flask后端无缝集成。

## 功能特性

- ✅ 用户注册和登录界面
- ✅ JWT令牌自动管理和刷新
- ✅ 响应式导航栏和用户状态管理
- ✅ 个人资料页面
- ✅ 自动令牌过期处理
- ✅ 优雅的错误提示和加载状态

## 技术架构

### 核心框架
- **Vue 3.3.4**: 渐进式JavaScript框架
- **Vite 5.0.0**: 下一代前端构建工具
- **Vue Router 4.2.4**: 官方路由管理器
- **Axios 1.6.0**: HTTP客户端库

### 项目结构
```
src/
├── components/           # 可复用组件
│   └── Navbar.vue        # 导航栏组件
├── views/                # 页面组件
│   ├── Login.vue         # 登录页面
│   ├── Register.vue       # 注册页面
│   └── Profile.vue        # 个人资料页面
├── services/             # 服务层
│   └── api.js            # API服务配置
├── stores/               # 状态管理
│   └── auth.js           # 认证状态管理
├── router/               # 路由配置
│   └── index.js          # 路由定义
└── App.vue               # 根组件
```

## 安装和运行

### 环境要求
- Node.js 16.0+ 
- npm 7.0+

### 安装依赖
```bash
cd frontend
npm install
```

### 开发模式运行
```bash
npm run dev
```
应用将在 http://localhost:3001 启动

### 生产构建
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 核心功能实现

### 认证状态管理
使用响应式状态管理实现用户认证状态的实时同步：

```javascript
// stores/auth.js
import { ref } from 'vue'

const isAuthenticated = ref(!!localStorage.getItem('access_token'))

export function useAuth() {
  return {
    isAuthenticated,
    handleLoginSuccess,
    handleLogout
  }
}
```

### API服务配置
配置Axios实例，实现自动令牌管理和错误处理：

```javascript
// services/api.js
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器 - 添加JWT令牌
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理令牌过期
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 令牌过期，尝试刷新
      await refreshToken()
    }
    return Promise.reject(error)
  }
)
```

### 路由守卫
实现基于认证状态的路由保护：

```javascript
// router/index.js
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('access_token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/profile')
  } else {
    next()
  }
})
```

## 页面组件说明

### Login.vue - 登录页面
- 用户名密码表单验证
- 登录状态管理和错误提示
- 登录成功后自动跳转

### Register.vue - 注册页面  
- 用户注册表单
- 密码确认验证
- 注册成功后跳转到登录页

### Profile.vue - 个人资料页面
- 显示当前用户信息
- 受保护路由，需要登录访问

### Navbar.vue - 导航栏组件
- 响应式认证状态显示
- 动态显示/隐藏导航菜单
- 退出登录功能

## API接口调用

### 用户登录
```javascript
// views/Login.vue
const response = await authAPI.login({
  username: this.form.username,
  password: this.form.password
})
```

### 用户注册
```javascript  
// views/Register.vue
const response = await authAPI.register({
  username: this.form.username,
  email: this.form.email,
  password: this.form.password
})
```

### 获取用户信息
```javascript
// views/Profile.vue  
const response = await authAPI.getProfile()
```

### 退出登录
```javascript
// components/Navbar.vue
await authAPI.logout()
```

## 开发特性

### 热重载开发
Vite提供极速的热重载体验，代码修改即时生效。

### 代理配置
开发环境下配置API代理，解决跨域问题：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### 响应式设计
使用现代CSS实现响应式布局，适配各种屏幕尺寸。

## 部署说明

### 构建优化
- 代码分割和懒加载
- 资源压缩和优化
- 生产环境错误处理

### 环境变量配置
创建`.env`文件配置环境变量：

```bash
VITE_API_BASE_URL=/api
```

## 故障排除

### 常见问题
1. **端口占用**: 修改vite.config.js中的端口配置
2. **代理失败**: 检查后端服务是否运行在8080端口
3. **依赖安装失败**: 清除node_modules后重新安装
4. **令牌刷新失败**: 检查Redis服务和后端日志