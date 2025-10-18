from flask import request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, redis_client
from app.models import User
from app.auth import auth_bp

# 注册接口
# 处理注册请求，验证用户名、邮箱和密码是否符合要求，并创建新用户
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        # print("请求数据",data)
        # 验证输入数据
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': '用户名、邮箱和密码是必填项'}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': '用户名已存在'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': '邮箱已被注册'}), 400
        
        # 创建新用户
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # 将用户信息缓存到Redis
        user_data = user.to_dict()
        redis_client.setex(f'user:{user.id}', 3600, str(user_data))
        
        return jsonify({
            'message': '注册成功',
            'user': user_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '注册失败', 'error': str(e)}), 500

# 登录接口
# 处理登录请求，验证用户名和密码，生成JWT令牌和刷新令牌，并返回给客户端
# 如果用户名或密码错误，返回401状态码
# 如果用户名和密码正确，返回200状态码，并返回JWT令牌和刷新令牌
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': '用户名和密码是必填项'}), 400
        
        # 从数据库查询用户
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': '用户名或密码错误'}), 401
        
        # 生成JWT令牌
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        # 缓存用户信息到Redis
        user_data = user.to_dict()
        redis_client.setex(f'user:{user.id}', 3600, str(user_data)) # 缓存用户信息 
        redis_client.setex(f'refresh_token:{user.id}', 3600, refresh_token) # 缓存刷新令牌(可用于吊销)
        
        return jsonify({
            'message': '登录成功',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': '登录失败', 'error': str(e)}), 500

# 刷新令牌接口
# 使用refresh=True参数，表示这是一个刷新令牌的请求
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity() # 获取当前用户的id
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'message': '用户不存在'}), 404
        
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token
        }), 200
        
    except Exception as e:
        return jsonify({'message': '令牌刷新失败', 'error': str(e)}), 500

# 获取用户信息接口
# 使用jwt_required装饰器，表示需要JWT认证
# 获取用户信息时，先从Redis中获取，如果没有再从数据库中获取，并缓存到Redis中
# 如果Redis中没有，则从数据库中获取，并缓存到Redis中
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        
        # 先尝试从Redis获取用户信息
        cached_user = redis_client.get(f'user:{current_user_id}')
        if cached_user:
            user_data = eval(cached_user.decode('utf-8'))
        else:
            # 从数据库获取
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'message': '用户不存在'}), 404
            user_data = user.to_dict()
            # 缓存到Redis
            redis_client.setex(f'user:{current_user_id}', 3600, str(user_data))
        
        return jsonify({'user': user_data}), 200
        
    except Exception as e:
        return jsonify({'message': '获取用户信息失败', 'error': str(e)}), 500

# 退出登录接口
# 使用jwt_required装饰器，表示需要JWT认证
# 退出登录时，需要删除Redis中的refresh_token和user缓存
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        
        '''
        如果磁盘数据库保存了用户的refresh_token，则需要删除（物理/逻辑）
        '''
        
        # 从Redis删除令牌和用户缓存
        redis_client.delete(f'refresh_token:{current_user_id}') 
        redis_client.delete(f'user:{current_user_id}')
        
        return jsonify({'message': '退出登录成功'}), 200
        
    except Exception as e:
        return jsonify({'message': '退出登录失败', 'error': str(e)}), 500