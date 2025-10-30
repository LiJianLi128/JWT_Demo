/**
 * JWT认证中间件
 * 提供访问令牌和刷新令牌的验证功能
 */

const jwtUtil = require('../utils/jwt');

/**
 * 从请求头中提取Bearer令牌
 * @param {Object} req - Express请求对象
 * @returns {string|null} JWT令牌或null
 */
function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * 访问令牌认证中间件
 * 验证请求头中的访问令牌，并将用户ID附加到请求对象
 */
const authenticateToken = (req, res, next) => {
  const token = extractToken(req);

  // 检查令牌是否存在
  if (!token) {
    return res.status(401).json({ 
      message: '访问令牌不存在',
      msg: 'Token has expired' // 与Flask版本保持一致
    });
  }

  try {
    // 验证令牌
    const decoded = jwtUtil.verifyToken(token);
    
    // 检查令牌类型（必须是access类型）
    if (decoded.type !== 'access') {
      return res.status(401).json({ 
        message: '无效的令牌类型',
        msg: 'Token has expired'
      });
    }
    
    // 将用户ID附加到请求对象
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // 处理令牌过期
    if (error.message.includes('过期')) {
      return res.status(401).json({ 
        message: '访问令牌已过期',
        msg: 'Token has expired'
      });
    }
    
    // 处理其他令牌错误
    return res.status(401).json({ 
      message: '无效的访问令牌',
      msg: 'Token has expired'
    });
  }
};

/**
 * 刷新令牌认证中间件
 * 验证请求头中的刷新令牌，并将用户ID附加到请求对象
 */
const authenticateRefreshToken = (req, res, next) => {
  const token = extractToken(req);

  // 检查令牌是否存在
  if (!token) {
    return res.status(401).json({ 
      message: '刷新令牌不存在',
      msg: 'Token has expired'
    });
  }

  try {
    // 验证令牌
    const decoded = jwtUtil.verifyToken(token);
    
    // 检查令牌类型（必须是refresh类型）
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        message: '无效的刷新令牌',
        msg: 'Token has expired'
      });
    }
    
    // 将用户ID附加到请求对象
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // 处理令牌过期
    if (error.message.includes('过期')) {
      return res.status(401).json({ 
        message: '刷新令牌已过期',
        msg: 'Token has expired'
      });
    }
    
    // 处理其他令牌错误
    return res.status(401).json({ 
      message: '无效的刷新令牌',
      msg: 'Token has expired'
    });
  }
};

/**
 * 可选认证中间件
 * 如果提供了有效令牌则验证，否则继续处理请求
 * 适用于可选登录的接口
 */
const optionalAuth = (req, res, next) => {
  const token = extractToken(req);

  // 如果没有令牌，直接继续
  if (!token) {
    return next();
  }

  try {
    // 尝试验证令牌
    const decoded = jwtUtil.verifyToken(token);
    if (decoded.type === 'access') {
      req.userId = decoded.userId;
    }
    next();
  } catch (error) {
    // 令牌无效，但不阻止请求继续
    next();
  }
};

// 导出中间件
module.exports = {
  authenticateToken,          // 访问令牌认证
  authenticateRefreshToken,   // 刷新令牌认证
  optionalAuth,               // 可选认证
  extractToken                // 提取令牌工具函数
};