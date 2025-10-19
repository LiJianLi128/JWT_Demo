package com.jwt.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.jwt.dto.UserResponse;
import com.jwt.entity.User;
import com.jwt.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    
    public UserResponse convertToResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt()
        );
    }
    
    public void cacheUserInfo(Long userId, UserResponse userResponse) {
        String key = "user:" + userId;
        redisTemplate.opsForValue().set(key, userResponse, 1, TimeUnit.HOURS);
    }
    
    public UserResponse getCachedUserInfo(Long userId) {
        String key = "user:" + userId;
        return (UserResponse) redisTemplate.opsForValue().get(key);
    }
    
    public void cacheRefreshToken(Long userId, String refreshToken) {
        String key = "refresh_token:" + userId;
        redisTemplate.opsForValue().set(key, refreshToken, 1, TimeUnit.HOURS);
    }
    
    public String getCachedRefreshToken(Long userId) {
        String key = "refresh_token:" + userId;
        return (String) redisTemplate.opsForValue().get(key);
    }
    
    public void deleteUserCache(Long userId) {
        String userKey = "user:" + userId;
        String refreshTokenKey = "refresh_token:" + userId;
        redisTemplate.delete(userKey);
        redisTemplate.delete(refreshTokenKey);
    }
    
    public UserResponse getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return convertToResponse(user);
    }
}