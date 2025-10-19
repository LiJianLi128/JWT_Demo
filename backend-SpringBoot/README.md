# Spring Boot JWT 认证系统

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT令牌生成和验证
- ✅ 访问令牌和刷新令牌机制
- ✅ Redis缓存支持
- ✅ 用户信息缓存
- ✅ 安全配置和CORS支持

## 技术栈

- Spring Boot
- MyBatis-Plus
- Spring Security
- Spring Validation
- Spring Data Redis
- MySQL
- JJWT (JSON Web Token)
- Lombok
- Maven

## 快速开始

### 环境要求

- Java 17+
- MySQL 8.0+
- Redis 6.0+
- Maven 3.6+

### 数据库配置

1. 创建数据库：
```sql
CREATE DATABASE jwt_auth_db;
```

2. 配置数据库连接（修改 `application.yml`）：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3307/jwt_auth_db
    username: root
    password: 123456
```

### Redis配置

- 确保Redis服务运行在默认端口6379，或修改 `application.yml` 中的Redis配置。

### 运行应用

```bash
cd backend-SpringBoot
mvn spring-boot:run
```

应用将在 http://localhost:8081 启动。

## API接口

### 用户注册

**POST** `/api/auth/register`

请求体：
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 用户登录

**POST** `/api/auth/login`

请求体：
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### 刷新令牌

**POST** `/api/auth/refresh`

请求头：
```
Authorization: Bearer {refresh_token}
```

### 获取用户信息

**GET** `/api/auth/profile`

请求头：
```
Authorization: Bearer {access_token}
```

### 退出登录

**POST** `/api/auth/logout`

请求头：
```
Authorization: Bearer {access_token}
```

## 项目结构

```
src/main/java/com/jwt/
├── config/          # 配置类
├── controller/      # 控制器
├── dto/            # 数据传输对象
├── entity/         # 实体类
├── exception/      # 异常处理
├── filter/         # 过滤器
├── repository/     # 数据访问层
├── service/        # 业务逻辑层
└── util/           # 工具类
```

## 与Flask版本对比

| 功能 | Flask版本 | Spring Boot版本 |
|------|-----------|-----------------|
| JWT认证 | Flask-JWT-Extended | Spring Security + JJWT |
| 数据库 | Flask-SQLAlchemy | MyBatis-Plus |
| 缓存 | Redis Python客户端 | Spring Data Redis |
| 密码加密 | Flask-Bcrypt | BCrypt |
| 输入验证 | 手动验证 | Spring Validation |

## 测试

运行测试：
```bash
mvn test
```

## 注意事项

1. 访问令牌过期时间设置为20秒，刷新令牌为7天
2. 用户信息和刷新令牌会缓存到Redis中1小时
3. 生产环境请修改JWT密钥和数据库密码
4. 建议启用HTTPS和更严格的安全配置