package com.jwt.controller;

import com.jwt.dto.AuthResponse;
import com.jwt.dto.LoginRequest;
import com.jwt.dto.ProfileResponse;
import com.jwt.dto.RegisterRequest;
import com.jwt.dto.UserResponse;
import com.jwt.service.AuthService;
import com.jwt.service.UserService;
import com.jwt.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    // 注册
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(201).body(response);
    }
    // 登录
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // log.info("登录请求 - 用户名: {}", request.getUsername());
        AuthResponse response = authService.login(request);
        // log.info("登录响应: {}", response);
        return ResponseEntity.ok(response);
    }
    // 刷新令牌
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(new AuthResponse("无效的授权头", null, null, null));
        }
        
        String refreshToken = authorizationHeader.substring(7);
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
    // 获取用户信息
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(HttpServletRequest request) {
        // log.info("获取用户信息请求");
        String token = extractToken(request);
        // log.info("提取的token: {}", token);
        
        if (token == null) {
            log.warn("Token为空");
            return ResponseEntity.status(401).build();
        }
        
        if (!jwtUtil.validateToken(token)) {
            log.warn("Token验证失败");
            return ResponseEntity.status(401).build();
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token);
        // log.info("用户ID: {}", userId);
        
        // 先尝试从缓存获取用户信息
        UserResponse cachedUser = userService.getCachedUserInfo(userId);
        if (cachedUser != null) {
            log.info("从缓存获取用户信息成功");
            return ResponseEntity.ok(new ProfileResponse(cachedUser));
        }
        
        // 缓存中没有，从数据库查询
        log.info("缓存中没有用户信息，从数据库查询");
        UserResponse userFromDb = userService.getUserById(userId);
        if (userFromDb != null) {
            // 查询成功后重新缓存
            userService.cacheUserInfo(userId, userFromDb);
            log.info("从数据库获取用户信息成功并已缓存");
            return ResponseEntity.ok(new ProfileResponse(userFromDb));
        }
        
        // 数据库中也没有，返回用户不存在
        log.warn("用户不存在: {}", userId);
        return ResponseEntity.status(404).build();
    }
    // 退出登录
    // 删除用户缓存信息和刷新令牌
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token);
        authService.logout(userId);
        
        return ResponseEntity.ok().build();
    }
    // 从请求头中提取令牌
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}