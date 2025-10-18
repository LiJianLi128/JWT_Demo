from app import create_app, db
from app.models import User

def init_database(app):
    """初始化数据库和示例数据"""
    
    with app.app_context():
        # 数据库和表已在create_app中创建，这里只添加示例数据
        
        # 检查是否已有管理员用户
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            # 创建管理员用户
            admin_user = User(
                username='admin',
                email='admin@example.com'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()
            print("管理员用户创建成功！")
            print("用户名: admin")
            print("密码: admin123")
            print("邮箱: admin@example.com")
        else:
            print("管理员用户已存在")
        
        # 统计用户数量
        user_count = User.query.count()
        print(f"当前用户总数: {user_count}")

if __name__ == '__main__':
    init_database()