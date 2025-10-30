/**
 * Redis客户端工具
 * 提供Redis连接管理和常用操作
 */

const redis = require('redis');
require('dotenv').config();

// Redis配置
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  },
  database: parseInt(process.env.REDIS_DB) || 0
};

// 如果配置了密码，则添加密码认证
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

// 创建Redis客户端
const redisClient = redis.createClient(redisConfig);

// 连接状态标志
let isConnected = false;

/**
 * 连接Redis
 * @returns {Promise<RedisClient>} Redis客户端实例
 */
async function connectRedis() {
  if (isConnected) {
    return redisClient;
  }
  
  try {
    await redisClient.connect();
    isConnected = true;
    console.log('✅ Redis连接成功');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis连接失败:', error.message);
    throw error;
  }
}

/**
 * 获取Redis客户端（自动连接）
 * @returns {Promise<RedisClient>} Redis客户端实例
 */
async function getRedisClient() {
  try {
    // 如果未连接，先连接
    if (!isConnected) {
      await connectRedis();
    }
    
    // 检查连接是否有效
    if (!redisClient.isOpen) {
      isConnected = false;
      return await connectRedis();
    }
    
    return redisClient;
  } catch (error) {
    console.error('❌ 获取Redis客户端失败:', error.message);
    throw error;
  }
}

/**
 * 健康检查
 * @returns {Promise<boolean>} 是否健康
 */
async function checkRedisHealth() {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('❌ Redis健康检查失败:', error.message);
    return false;
  }
}

/**
 * 关闭Redis连接
 */
async function closeRedis() {
  try {
    if (isConnected) {
      await redisClient.quit();
      isConnected = false;
      console.log('✅ Redis连接已关闭');
    }
  } catch (error) {
    console.error('❌ 关闭Redis连接失败:', error.message);
  }
}

// Redis事件监听
redisClient.on('error', (err) => {
  console.error('❌ Redis客户端错误:', err.message);
  isConnected = false;
});

redisClient.on('connect', () => {
  console.log('🔗 Redis客户端已连接');
  isConnected = true;
});

redisClient.on('disconnect', () => {
  console.log('🔌 Redis客户端已断开');
  isConnected = false;
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis正在重新连接...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis客户端就绪');
  isConnected = true;
});

// 导出Redis客户端和工具函数
module.exports = {
  redisClient,        // Redis客户端实例
  connectRedis,       // 连接Redis
  getRedisClient,     // 获取Redis客户端
  checkRedisHealth,   // 健康检查
  closeRedis,         // 关闭连接
  isConnected         // 连接状态
};