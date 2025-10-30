# JWT认证Node.js后端

基于Express + Sequelize + Redis的JWT认证后端，与Flask和SpringBoot版本功能相同。

## 技术栈

- Express.js - Web框架
- Sequelize - ORM
- MySQL - 数据库
- Redis - 缓存
- JWT - 令牌认证
- Bcrypt - 密码加密

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境

确保MySQL和Redis已启动，检查`.env`配置：

```env
PORT=8082
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_PASSWORD=123456
REDIS_PORT=6379
REDIS_PASSWORD=123456
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务启动后会自动创建数据库和表。

### 4. 测试API

```bash
npm test
```

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/refresh` | 刷新令牌 |
| GET  | `/api/auth/profile` | 获取用户信息 |
| POST | `/api/auth/logout` | 退出登录 |

### 示例

**注册：**
```bash
curl -X POST http://localhost:8082/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

**登录：**
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'
```

## 项目结构

```
backend-NodeJS/
├── config/          # 配置文件
├── models/          # 数据模型
├── routes/          # 路由
├── middleware/      # 中间件
├── utils/           # 工具函数
├── app.js           # 主应用
└── test_api.js      # API测试
```

## 常见问题

**数据库连接失败？**
- 检查MySQL是否启动在3307端口
- 验证用户名密码是否正确

**Redis连接失败？**
- 检查Redis是否启动在6379端口
- 验证Redis密码配置

**端口被占用？**
- 修改`.env`中的`PORT`配置

## 与其他版本对比

| 特性 | Flask | SpringBoot | Node.js |
|------|-------|------------|---------|
| 端口 | 8080 | 8081 | 8082 |
| 语言 | Python | Java | JavaScript |
| ORM | SQLAlchemy | MyBatis-Plus | Sequelize |

三个版本共享相同的数据库、Redis和JWT密钥，API完全兼容。
