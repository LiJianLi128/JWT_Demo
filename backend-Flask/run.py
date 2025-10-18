from app import create_app
from app import create_database_and_tables
import init_database

app = create_app()

if __name__ == '__main__':
    # 创建数据库和表
    create_database_and_tables(app)
    # 初始化数据库和示例数据
    init_database.init_database(app)
    # 启动Flask服务器（端口与前端代理配置一致）
    app.run(debug=False, host='127.0.0.1', port=8080)