# Flask JWT SQLAlchemy 认证服务

一个使用Flask、JWT、SQLAlchemy和Redis构建的用户认证后端服务。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT令牌认证和自动刷新
- ✅ Redis缓存支持（令牌和用户信息）
- ✅ MySQL数据库集成
- ✅ 完整的RESTful API接口
- ✅ 跨域请求支持（CORS）
- ✅ 密码加密存储（bcrypt）

## 技术架构

### 核心组件
- **Web框架**: Flask 2.3.3
- **ORM**: Flask-SQLAlchemy 3.0.5
- **认证**: Flask-JWT-Extended 4.5.3
- **缓存**: Redis 5.0.1
- **数据库驱动**: PyMySQL 1.1.0
- **密码加密**: bcrypt 4.0.1

### 项目结构
```
app/
├── __init__.py          # 应用初始化
├── auth/                # 认证模块
│   ├── __init__.py
│   ├── models.py       # 用户模型
│   ├── routes.py       # 认证路由
│   └── utils.py        # 工具函数
└── config.py           # 配置管理
```

## 安装和运行

### 1. 环境准备
```bash
# 安装Python依赖
pip install -r requirements.txt

# 创建MySQL数据库
mysql -u root -p
CREATE DATABASE jwt_auth_db;
```

### 2. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，设置以下配置：
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=mysql+pymysql://username:password@localhost/jwt_auth_db
REDIS_URL=redis://localhost:6379/0
```

### 3. 运行应用
```bash
# 开发模式
python run.py

# 或者使用Flask CLI
flask run --host=0.0.0.0 --port=8080
```

## API接口文档

### 认证接口

#### 用户注册
- **端点**: `POST /api/auth/register`
- **描述**: 创建新用户账户
- **请求体**:
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
```
- **响应**:
```json
{
    "message": "用户注册成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
}
```

#### 用户登录
- **端点**: `POST /api/auth/login`
- **描述**: 用户登录，获取JWT令牌
- **请求体**:
```json
{
    "username": "testuser",
    "password": "password123"
}
```
- **响应**:
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }
}
```

#### 获取用户信息
- **端点**: `GET /api/auth/profile`
- **描述**: 获取当前登录用户信息
- **认证**: 需要Bearer Token
- **Headers**: `Authorization: Bearer <access_token>`
- **响应**:
```json
{
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2024-01-01T00:00:00"
}
```

#### 刷新令牌
- **端点**: `POST /api/auth/refresh`
- **描述**: 使用refresh_token获取新的access_token
- **认证**: 需要Refresh Token
- **Headers**: `Authorization: Bearer <refresh_token>`
- **响应**:
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 退出登录
- **端点**: `POST /api/auth/logout`
- **描述**: 用户退出，清除令牌缓存
- **认证**: 需要Bearer Token
- **Headers**: `Authorization: Bearer <access_token>`
- **响应**: `200 OK`

## 技术实现细节

### JWT令牌管理
- **Access Token**: 15分钟有效期，用于API访问
- **Refresh Token**: 7天有效期，用于令牌刷新
- **令牌存储**: Redis缓存，支持分布式部署

### 安全特性
- 密码使用bcrypt加密存储
- JWT令牌包含用户ID和过期时间
- 支持令牌黑名单机制
- 自动刷新令牌，减少重复登录

### 缓存策略
- 用户信息缓存：减少数据库查询
- 令牌验证缓存：提高认证性能
- 自动过期：确保数据一致性

## 错误处理

### 常见HTTP状态码
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权或令牌过期
- `404`: 资源不存在
- `500`: 服务器内部错误

### 错误响应格式
```json
{
    "error": "错误类型",
    "message": "详细的错误描述"
}
```

## 开发指南

### 添加新的API端点
1. 在`app/auth/routes.py`中添加新的路由函数
2. 使用适当的JWT装饰器进行认证控制
3. 添加错误处理和响应格式化

### 数据库迁移
```bash
# 进入Flask shell
flask shell

# 创建数据库表
from app import db
db.create_all()
```

### 测试API接口
使用curl或Postman测试API：
```bash
# 登录测试
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# 获取用户信息
curl -X GET http://localhost:8080/api/auth/profile \
  -H "Authorization: Bearer <access_token>"
```

## 部署说明

### 生产环境配置
- 设置强密钥：`SECRET_KEY`和`JWT_SECRET_KEY`
- 配置生产数据库连接
- 启用Redis持久化
- 设置适当的JWT过期时间

### 性能优化建议
- 使用Redis集群提高缓存性能
- 配置数据库连接池
- 启用Gzip压缩
- 使用Nginx反向代理

## 故障排除

### 常见问题
1. **数据库连接失败**: 检查数据库服务和连接字符串
2. **Redis连接失败**: 检查Redis服务是否运行
3. **JWT令牌无效**: 检查密钥配置和令牌格式
4. **跨域请求被阻止**: 检查CORS配置
