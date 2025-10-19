package com.jwt.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    @TableField(condition = SqlCondition.EQUAL)
    private String username;
    
    @TableField(condition = SqlCondition.EQUAL)
    private String email;
    
    @JsonIgnore
    @TableField("password_hash")
    private String passwordHash;
    
    @TableField("created_at")
    private LocalDateTime createdAt;
    
    @TableField("updated_at")
    private LocalDateTime updatedAt;
    
    public void setPassword(String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        this.passwordHash = encoder.encode(password);
    }
    
    public boolean checkPassword(String password) {
        // 检查hash格式，判断使用哪种算法
        if (this.passwordHash.startsWith("pbkdf2:sha256:")) {
            // Flask/Werkzeug格式，使用兼容验证
            return checkPasswordWerkzeug(password, this.passwordHash);
        } else if (this.passwordHash.startsWith("$2a$") || this.passwordHash.startsWith("$2b$")) {
            // BCrypt格式
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            return encoder.matches(password, this.passwordHash);
        }
        return false;
    }
    
    private boolean checkPasswordWerkzeug(String password, String hash) {
        try {
            // 解析Werkzeug hash格式: pbkdf2:sha256:iterations$salt$hash
            String[] parts = hash.split("\\$");
            if (parts.length != 3) return false;
            
            String[] methodParts = parts[0].split(":");
            if (methodParts.length < 3) return false;
            
            int iterations = Integer.parseInt(methodParts[2]);
            byte[] salt = java.util.Base64.getDecoder().decode(parts[1]);
            byte[] expectedHash = java.util.Base64.getDecoder().decode(parts[2]);
            
            // 使用PBKDF2验证
            javax.crypto.SecretKeyFactory factory = javax.crypto.SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            javax.crypto.spec.PBEKeySpec spec = new javax.crypto.spec.PBEKeySpec(
                password.toCharArray(), salt, iterations, expectedHash.length * 8
            );
            byte[] actualHash = factory.generateSecret(spec).getEncoded();
            
            return java.security.MessageDigest.isEqual(expectedHash, actualHash);
        } catch (Exception e) {
            return false;
        }
    }
}