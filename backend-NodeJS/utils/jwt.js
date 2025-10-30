const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTUtil {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'my_JWT_Demo-super-secret-jwt-key-at-least-32-characters-long-for-hs256';
    this.accessExpires = process.env.JWT_ACCESS_EXPIRES || '20s';
    this.refreshExpires = process.env.JWT_REFRESH_EXPIRES || '7d';
  }

  // 生成访问令牌
  generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      this.secret,
      { expiresIn: this.accessExpires }
    );
  }

  // 生成刷新令牌
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.secret,
      { expiresIn: this.refreshExpires }
    );
  }

  // 验证令牌
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw new Error('令牌无效或已过期');
    }
  }

  // 从令牌中提取用户ID
  getUserIdFromToken(token) {
    try {
      const decoded = this.verifyToken(token);
      return decoded.userId;
    } catch (error) {
      throw error;
    }
  }

  // 检查令牌是否过期
  isTokenExpired(token) {
    try {
      this.verifyToken(token);
      return false;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return true;
      }
      throw error;
    }
  }

  // 解码令牌（不验证）
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JWTUtil();