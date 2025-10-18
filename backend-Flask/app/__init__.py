from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import redis
from config import config

db = SQLAlchemy()
jwt = JWTManager()
redis_client = None

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 初始化CORS - 允许前端应用跨域访问
    CORS(app, 
         origins=["http://127.0.0.1:3001", "http://localhost:3001", "http://127.0.0.1:3002", "http://localhost:3002"],
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"]
    )
    
    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    
    # 初始化Redis
    global redis_client
    redis_client = redis.Redis.from_url(app.config['REDIS_URL'])
    
    # 注册蓝图
    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    return app

def create_database_and_tables(app):
    """创建数据库和所有表"""
    import pymysql
    from sqlalchemy import create_engine, text
    
    # 先连接到MySQL服务器创建数据库
    try:
        # 临时连接到MySQL服务器（不带数据库名）
        temp_uri = f"mysql+pymysql://{app.config['MYSQL_USER']}:{app.config['MYSQL_PASSWORD']}@{app.config['MYSQL_HOST']}:{app.config['MYSQL_PORT']}/"
        temp_engine = create_engine(temp_uri)
        
        with temp_engine.connect() as conn:
            # 创建数据库（如果不存在）
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {app.config['MYSQL_DATABASE']} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            conn.commit()
        temp_engine.dispose()
        print("数据库创建成功！")
        
    except Exception as e:
        print(f"数据库创建失败: {e}")
    
    # 现在使用正确的数据库URI创建表
    try:
        # 设置正确的数据库URI
        app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{app.config['MYSQL_USER']}:{app.config['MYSQL_PASSWORD']}@{app.config['MYSQL_HOST']}:{app.config['MYSQL_PORT']}/{app.config['MYSQL_DATABASE']}"
        
        # 创建所有表
        with app.app_context():
            db.create_all()
        print("表创建成功！")
        
    except Exception as e:
        print(f"表创建失败: {e}")