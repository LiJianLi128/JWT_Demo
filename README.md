# JWT 前后端认证Demo

一个完整的JWT认证Demo，支持多后端架构（Flask + SpringBoot）和统一的前端界面（Vue3）。

## 项目架构

### 多后端支持
- **Flask版本** (已完成): Python + SQLAlchemy + JWT
- **SpringBoot版本** (已完成): Java + SpringBoot + MyBatis-Plus + JWT

### 统一前端
- Vue3 + Vite + JavaScript
- 可配置后端API端点
- 响应式用户界面

## 项目结构

```
jwt_sqlalchemy_rl_demo/
├── backend-Flask/         # ✅ Flask后端服务
├── backend-SpringBoot/    # ✅ SpringBoot后端服务
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

# 启动前端 (修改API配置指向Flask，vite.config.js的代理地址)8080
cd frontend
npm install
npm run dev
```

### 使用SpringBoot后端 (TODO)
```bash
# 启动SpringBoot后端
cd backend-SpringBoot
mvn spring-boot:run

# 启动前端 (修改API配置指向SpringBoot，vite.config.js的代理地址)8081
cd frontend
npm install
npm run dev
```

## 技术栈对比

### Flask版本
- **后端**: Flask + SQLAlchemy + JWT + Redis
- **数据库**: MySQL + PyMySQL
- **特点**: 轻量级、快速开发、Python生态

### SpringBoot版本
- **后端**: Spring Boot + MyBatis-Plus + JWT + Redis
- **数据库**: MySQL + JDBC
- **特点**: 企业级、强类型、Java生态

## 后端统一密码加密方式为 Bcrypt, 统一 JWT 密钥

### 前端 (统一)
- **框架**: Vue3 + Vite + JavaScript
- **路由**: Vue Router 4.2.4
- **HTTP**: Axios 1.6.0
- **状态管理**: 响应式Composition API

## 详细文档

- [Flask后端文档](./backend-Flask/README.md)
- [前端文档](./frontend/README.md)
- [SpringBoot后端文档](./backend-SpringBoot/README.md)

## 项目截图（TODO）

- 首页
- 登录页面
- 注册页面
- 后台展示（mysql、redis、postman）