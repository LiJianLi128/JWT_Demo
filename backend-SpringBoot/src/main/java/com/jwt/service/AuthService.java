package com.jwt.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jwt.dto.AuthResponse;
import com.jwt.dto.LoginRequest;
import com.jwt.dto.RegisterRequest;
import com.jwt.dto.UserResponse;
import com.jwt.entity.User;
import com.jwt.mapper.UserMapper;
import com.jwt.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

// 认证服务
// 注册、登录、刷新令牌、注销


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    
    // 注册：检查用户名和邮箱是否已存在，如果不存在则创建新用户
    public UserResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        QueryWrapper<User> usernameWrapper = new QueryWrapper<>();
        usernameWrapper.eq("username", request.getUsername());
        if (userMapper.selectCount(usernameWrapper) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "用户名已存在");
        }
        
        // 检查邮箱是否已存在
        QueryWrapper<User> emailWrapper = new QueryWrapper<>();
        emailWrapper.eq("email", request.getEmail());
        if (userMapper.selectCount(emailWrapper) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "邮箱已被注册");
        }
        
        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        
        userMapper.insert(user);
        // 使用用户名查询刚插入的用户，确保获取到完整的用户信息
        User savedUser = userMapper.findByUsername(request.getUsername());
        return userService.convertToResponse(savedUser);
    }
    
    // 登录：检查用户名和密码是否匹配，如果匹配则生成JWT令牌和刷新令牌，并缓存用户信息和刷新令牌
    // 如果用户名或密码不匹配，则抛出401 Unauthorized异常
    public AuthResponse login(LoginRequest request) {
        // 查找用户
        User user = userMapper.findByUsername(request.getUsername());
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
        }
        
        // 验证密码
        if (!user.checkPassword(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
        }

        UserResponse userResponse = userService.convertToResponse(user);

        System.out.println("userResponse:"+userResponse);
        // 生成JWT令牌
        try {
            String accessToken = jwtUtil.generateAccessToken(user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());
            System.out.println("accessToken:"+accessToken);
            System.out.println("refreshToken:"+refreshToken);
        
            // 缓存用户信息和刷新令牌
            userService.cacheUserInfo(user.getId(), userResponse);
            userService.cacheRefreshToken(user.getId(), refreshToken);

            return new AuthResponse("登录成功", accessToken, refreshToken, userResponse);
        } catch (Exception e) {
            System.err.println("JWT生成失败: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "令牌生成失败: " + e.getMessage());
        }
    }
    
    // 刷新令牌：验证刷新令牌是否有效，如果有效则生成新的访问令牌和刷新令牌，并缓存用户信息和刷新令牌
    // 如果刷新令牌无效，则抛出401 Unauthorized异常
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "无效的刷新令牌");
        }
        
        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        
        // 验证刷新令牌是否与缓存中的一致
        String cachedRefreshToken = userService.getCachedRefreshToken(userId);
        if (cachedRefreshToken == null || !cachedRefreshToken.equals(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "刷新令牌无效或已过期");
        }
        
        // 生成新的访问令牌
        String newAccessToken = jwtUtil.generateAccessToken(userId);
        
        return new AuthResponse("令牌刷新成功", newAccessToken, refreshToken, userService.getCachedUserInfo(userId));
    }
    
    // 注销：删除用户缓存中的用户信息和刷新令牌
    // 如果用户未登录，则抛出401 Unauthorized异常
    public void logout(Long userId) {
        userService.deleteUserCache(userId);
    }
}