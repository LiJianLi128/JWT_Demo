/**
 * 认证路由
 * 提供用户注册、登录、令牌刷新、获取用户信息、退出登录等功能
 * 与Flask版本的auth路由保持一致
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');
const { getRedisClient } = require('../utils/redisClient');
const { User } = require('../models');
const jwtUtil = require('../utils/jwt');
const { authenticateToken, authenticateRefreshToken } = require('../middleware/auth');

const router = express.Router();

// Redis缓存配置
const CACHE_TTL = {
  USER_INFO: 3600,      // 用户信息缓存1小时
  REFRESH_TOKEN: 604800 // 刷新令牌缓存7天
};

/**
 * 用户注册接口
 * POST /api/auth/register
 * 请求体: { username, email, password }
 */
router.post('/register', [
  body('username')
    .notEmpty().withMessage('用户名是必填项')
    .isLength({ min: 3, max: 80 }).withMessage('用户名长度必须在3-80个字符之间'),
  body('email')
    .notEmpty().withMessage('邮箱是必填项')
    .isEmail().withMessage('邮箱格式不正确'),
  body('password')
    .notEmpty().withMessage('密码是必填项')
    .isLength({ min: 6 }).withMessage('密码长度至少6位')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已被注册
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 创建新用户
    const newUser = await User.create({
      username,
      email,
      password_hash: 'temp' // 临时值，将在setPassword中设置
    });

    // 设置密码（使用bcrypt加密）
    newUser.setPassword(password);
    await newUser.save();

    // 获取用户信息（不包含密码）
    const userData = newUser.toJSON();

    // 缓存用户信息到Redis
    const redisClient = await getRedisClient();
    await redisClient.setEx(
      `user:${newUser.id}`, 
      CACHE_TTL.USER_INFO, 
      JSON.stringify(userData)
    );

    // 返回注册成功响应
    res.status(201).json({
      message: '注册成功',
      user: userData
    });

  } catch (error) {
    console.error('❌ 注册失败:', error);
    res.status(500).json({ 
      message: '注册失败',
      error: error.message 
    });
  }
});

/**
 * 用户登录接口
 * POST /api/auth/login
 * 请求体: { username, password }
 */
router.post('/login', [
  body('username').notEmpty().withMessage('用户名是必填项'),
  body('password').notEmpty().withMessage('密码是必填项')
], async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: '输入数据验证失败',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // 查询用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT令牌对
    const accessToken = jwtUtil.generateAccessToken(user.id);
    const refreshToken = jwtUtil.generateRefreshToken(user.id);

    // 获取用户信息（不包含密码）
    const userData = user.toJSON();

    // 缓存用户信息和刷新令牌到Redis
    const redisClient = await getRedisClient();
    await Promise.all([
      redisClient.setEx(`user:${user.id}`, CACHE_TTL.USER_INFO, JSON.stringify(userData)),
      redisClient.setEx(`refresh_token:${user.id}`, CACHE_TTL.REFRESH_TOKEN, refreshToken)
    ]);

    // 返回登录成功响应
    res.json({
      message: '登录成功',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: userData
    });

  } catch (error) {
    console.error('❌ 登录失败:', error);
    res.status(500).json({ 
      message: '登录失败',
      error: error.message 
    });
  }
});

/**
 * 刷新令牌接口
 * POST /api/auth/refresh
 * 请求头: Authorization: Bearer <refresh_token>
 */
router.post('/refresh', authenticateRefreshToken, async (req, res) => {
  try {
    const userId = req.userId;

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 生成新的访问令牌
    const newAccessToken = jwtUtil.generateAccessToken(userId);

    // 返回新的访问令牌
    res.json({
      access_token: newAccessToken
    });

  } catch (error) {
    console.error('❌ 令牌刷新失败:', error);
    res.status(500).json({ 
      message: '令牌刷新失败',
      error: error.message 
    });
  }
});

/**
 * 获取用户信息接口
 * GET /api/auth/profile
 * 请求头: Authorization: Bearer <access_token>
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const redisClient = await getRedisClient();

    // 先尝试从Redis缓存获取用户信息
    const cachedUser = await redisClient.get(`user:${userId}`);
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      return res.json({ user: userData });
    }

    // 缓存未命中，从数据库获取用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取用户信息（不包含密码）
    const userData = user.toJSON();

    // 更新Redis缓存
    await redisClient.setEx(
      `user:${userId}`, 
      CACHE_TTL.USER_INFO, 
      JSON.stringify(userData)
    );

    // 返回用户信息
    res.json({ user: userData });

  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    res.status(500).json({ 
      message: '获取用户信息失败',
      error: error.message 
    });
  }
});

/**
 * 退出登录接口
 * POST /api/auth/logout
 * 请求头: Authorization: Bearer <access_token>
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const redisClient = await getRedisClient();

    // 从Redis删除刷新令牌和用户缓存
    await Promise.all([
      redisClient.del(`refresh_token:${userId}`),
      redisClient.del(`user:${userId}`)
    ]);

    // 返回退出成功响应
    res.json({ message: '退出登录成功' });

  } catch (error) {
    console.error('❌ 退出登录失败:', error);
    res.status(500).json({ 
      message: '退出登录失败',
      error: error.message 
    });
  }
});

module.exports = router;