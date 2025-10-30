// JWT认证Node.js后端

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { syncDatabase, closeDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const DatabaseInitializer = require('./utils/databaseInit');
const { connectRedis, closeRedis } = require('./utils/redisClient');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 8082;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 中间件配置
// CORS跨域
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    'http://localhost:3002', 
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 路由配置
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JWT认证Node.js后端服务运行正常',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: '接口不存在',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('❌ 全局错误:', error);
  
  // 数据验证错误
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: '数据验证失败',
      errors: error.details
    });
  }
  
  // JWT令牌错误
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: '令牌验证失败',
      msg: 'Token has expired'
    });
  }
  
  // Sequelize数据库错误
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: '数据验证失败',
      errors: error.errors.map(e => ({ field: e.path, message: e.message }))
    });
  }
  
  // 默认服务器错误
  res.status(500).json({
    message: '服务器内部错误',
    error: NODE_ENV === 'development' ? error.message : '内部服务器错误'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库
    const dbInitializer = new DatabaseInitializer();
    await dbInitializer.initialize();
    
    // 连接Redis
    await connectRedis();
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`\n🚀 服务启动成功: http://localhost:${PORT}`);
      console.log(`环境: ${NODE_ENV}\n`);
    });
    
  } catch (error) {
    console.error('\n❌ 启动失败:', error.message);
    console.error('请检查MySQL(3307)和Redis(6379)是否正常运行\n');
    process.exit(1);
  }
}

// 优雅关闭
async function gracefulShutdown(signal) {
  console.log(`\n收到 ${signal} 信号，正在关闭...`);
  try {
    await closeDatabase();
    await closeRedis();
    console.log('服务已关闭');
    process.exit(0);
  } catch (error) {
    console.error('关闭失败:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

module.exports = app;