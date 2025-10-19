package com.jwt.filter;

import com.jwt.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getServletPath();
        // log.info("JWT过滤器处理请求: {}", path);
        
        // 跳过不需要认证的路径
        if (path.startsWith("/auth/register") || 
            path.startsWith("/auth/login") || 
            path.startsWith("/auth/refresh")) {
            // log.info("跳过认证路径: {}", path);
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = extractToken(request);
        // log.info("提取的token: {}", token);
        
        if (token != null && jwtUtil.validateToken(token)) {
            // log.info("Token验证成功");
            Long userId = jwtUtil.getUserIdFromToken(token);
            // log.info("用户ID: {}", userId);
            
            // 创建认证对象
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userId, null, null);
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } else {
            if (token == null) {
                log.warn("Token为空");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"msg\": \"Missing token\"}");
            } else {
                // log.warn("Token验证失败或已过期");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"msg\": \"Token has expired\"}");
            }
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}