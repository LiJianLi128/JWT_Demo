
from datetime import timedelta

class Config:
    # 基础配置
    SECRET_KEY = 'your-secret-key-here' # 密钥
    
    # MySQL数据库配置
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = '123456'
    MYSQL_HOST = 'localhost'
    MYSQL_PORT = '3307'
    MYSQL_DATABASE = 'jwt_auth_db'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:123456@localhost:3307/jwt_auth_db' # 数据库连接字符串
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # 关闭SQLAlchemy的跟踪修改
    
    # Redis配置
    REDIS_URL = 'redis://:123456@localhost:6379/0' 
    
    # JWT配置
    JWT_SECRET_KEY =  'my_JWT_Demo-super-secret-jwt-key-at-least-32-characters-long-for-hs256'  # 密钥
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=20)  # 访问令牌过期时间（20秒）
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)  # 刷新令牌过期时间（7天）
    
    # 应用配置
    DEBUG = True

# 开发环境配置
# 继承自Config类，并重写DEBUG属性
class DevelopmentConfig(Config):
    DEBUG = True

# 生产环境配置
# 继承自Config类，并重写DEBUG属性
class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig, # 开发环境
    'production': ProductionConfig, # 生产环境
    'default': DevelopmentConfig # 默认环境
}