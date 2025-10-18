# JWT 前后端认证Demo

一个完整的JWT认证Demo，支持多后端架构（Flask + SpringBoot）和统一的前端界面（Vue3）。

## 项目架构

### 多后端支持
- **Flask版本** (已完成): Python + SQLAlchemy + JWT
- **SpringBoot版本** (待开发): Java + Spring Security + JWT

### 统一前端
- Vue3 + Vite + JavaScript
- 可配置后端API端点
- 响应式用户界面

## 项目结构

```
jwt_sqlalchemy_rl_demo/
├── backend-Flask/         # ✅ Flask后端服务
├── backend-SpringBoot/    # 🔄 SpringBoot后端服务 (TODO)
├── frontend/              # ✅ Vue3前端应用
└── README.md              # ✅ DEMO说明
```

## 快速开始

### 使用Flask后端
```bash
# 启动Flask后端
cd backend-Flask
pip install -r requirements.txt
python run.py

# 启动前端
cd frontend
npm install
npm run dev
```

### 使用SpringBoot后端 (TODO)
```bash
# 启动SpringBoot后端
cd backend-SpringBoot
./mvnw spring-boot:run

# 启动前端 (修改API配置指向SpringBoot)
cd frontend
npm install
npm run dev
```

## 技术栈对比

### Flask版本
- **后端**: Flask + SQLAlchemy + JWT + Redis
- **数据库**: MySQL + PyMySQL
- **特点**: 轻量级、快速开发、Python生态

### SpringBoot版本 (规划中)
- **后端**: Spring Boot 3.x + Spring Security + JWT + Redis
- **数据库**: MySQL + Spring Data JPA
- **特点**: 企业级、强类型、Java生态

### 前端 (统一)
- **框架**: Vue3 + Vite + JavaScript
- **路由**: Vue Router 4.2.4
- **HTTP**: Axios 1.6.0
- **状态管理**: 响应式Composition API

## 配置说明

前端支持动态切换后端API：
```javascript
// 开发环境配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 可配置为不同的后端服务
// Flask: /api
// SpringBoot: /springboot-api
```

## 详细文档

- [Flask后端文档](./backend-Flask/README.md)
- [前端文档](./frontend/README.md)
- [SpringBoot后端文档](./backend-SpringBoot/README.md) (TODO)