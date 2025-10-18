import requests
import json

BASE_URL = 'http://localhost:5000/api/auth'

def test_register():
    """测试用户注册"""
    print("测试用户注册...")
    data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpassword123'
    }
    
    response = requests.post(f'{BASE_URL}/register', json=data)
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")
    return response

def test_login():
    """测试用户登录"""
    print("\n测试用户登录...")
    data = {
        'username': 'testuser',
        'password': 'testpassword123'
    }
    
    response = requests.post(f'{BASE_URL}/login', json=data)
    print(f"状态码: {response.status_code}")
    response_data = response.json()
    print(f"响应内容: {response_data}")
    
    if response.status_code == 200:
        return response_data['access_token'], response_data['refresh_token']
    return None, None

def test_profile(access_token):
    """测试获取用户信息"""
    print("\n测试获取用户信息...")
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.get(f'{BASE_URL}/profile', headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")

def test_refresh(refresh_token):
    """测试刷新令牌"""
    print("\n测试刷新令牌...")
    headers = {'Authorization': f'Bearer {refresh_token}'}
    response = requests.post(f'{BASE_URL}/refresh', headers=headers)
    print(f"状态码: {response.status_code}")
    response_data = response.json()
    print(f"响应内容: {response_data}")
    
    if response.status_code == 200:
        return response_data['access_token']
    return None

def test_logout(access_token):
    """测试退出登录"""
    print("\n测试退出登录...")
    headers = {'Authorization': f'Bearer {access_token}'}
    response = requests.post(f'{BASE_URL}/logout', headers=headers)
    print(f"状态码: {response.status_code}")
    print(f"响应内容: {response.json()}")

if __name__ == '__main__':
    print("开始API测试...")
    
    # 测试注册
    test_register()
    
    # 测试登录
    access_token, refresh_token = test_login()
    
    if access_token:
        # 测试获取用户信息
        test_profile(access_token)
        
        # 测试刷新令牌
        new_access_token = test_refresh(refresh_token)
        
        if new_access_token:
            # 使用新令牌测试获取用户信息
            test_profile(new_access_token)
            
            # 测试退出登录
            test_logout(new_access_token)
    
    print("\n测试完成！")