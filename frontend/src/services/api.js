import axios from 'axios'

const API_BASE_URL = '/api'

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器 - 添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 关键修正：从error中获取response（避免response未定义）
    const { response } = error; 
    const originalRequest = error.config; // 原始请求配置
    console.log("response",response)
    // console.log("originalRequest",originalRequest)

    // 1. 先判断是否有响应且状态码为401（避免非401场景误处理）
    if (response && response.status === 401) {
      const errorCode = response.data?.msg; // 用可选链避免data不存在时报错
      // console.log("errorCode",errorCode)
      
      // 2. 检查是否是Token has expired（flask-jwt默认响应，可自行重写修改），且未重试过（避免无限循环）
      if (errorCode === 'Token has expired' && !originalRequest._retry) {
        originalRequest._retry = true; // 标记为已重试
        
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            // 创建独立实例刷新token，避免被当前拦截器拦截
            const refreshAxios = axios.create({
              baseURL: API_BASE_URL,
              timeout: 10000
            });
            
            // 发送刷新请求（用refresh_token）
            const refreshResponse = await refreshAxios.post('/auth/refresh', {}, {
              headers: {
                Authorization: `Bearer ${refreshToken}`
              }
            });
            
            // 3. 刷新成功：更新token并重试原始请求
            const newAccessToken = refreshResponse.data.access_token;
            localStorage.setItem('access_token', newAccessToken);
            
            // 更新原始请求的token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest); // 重试原始请求
          } catch (refreshError) {
            // 4. 刷新失败（如refresh_token过期）：清除数据并跳转登录
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_info');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // 没有refresh_token：直接跳转登录
          localStorage.clear(); // 清空更彻底
          window.location.href = '/login';
        }
      } else {
        // 其他401场景（如INVALID_TOKEN、密码错误）页面提示 errorMessage
        return Promise.reject(error); // 直接抛出
      }
    }
    
    // 非401错误（如500、404）：直接抛出
    return Promise.reject(error);
  }
);


// API方法
export const authAPI = {
  // 注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 获取用户信息
  getProfile: () => api.get('/auth/profile'),
  
  // 退出登录
  logout: () => api.post('/auth/logout')
}

export default api