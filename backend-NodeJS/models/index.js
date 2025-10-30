/**
 * 模型入口文件
 * 初始化Sequelize并导出所有模型
 */

const { Sequelize } = require('sequelize');
const config = require('../config/config.json');

// 获取当前环境配置（开发/生产）
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// 创建Sequelize实例
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging, // 是否打印SQL日志
        pool: dbConfig.pool,       // 连接池配置
        define: dbConfig.define,   // 模型默认配置
        timezone: '+08:00'         // 设置时区为东八区
    }
);

// 导入用户模型
const User = require('./user')(sequelize, Sequelize);

/**
 * 同步数据库
 * 将模型定义同步到数据库表结构
 * @returns {Promise<Sequelize>} Sequelize实例
 */
async function syncDatabase() {
    try {
        // 测试数据库连接
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        
        // 同步模型到数据库
        await sequelize.sync({ 
            force: false,  // 不强制删除现有表
            alter: false   // 不自动修改表结构（避免索引冲突）
        });
        console.log('✅ 数据库表同步成功');
        
        return sequelize;
    } catch (error) {
        console.error('❌ 数据库同步失败:', error.message);
        throw error;
    }
}

/**
 * 关闭数据库连接
 */
async function closeDatabase() {
    try {
        await sequelize.close();
        console.log('✅ 数据库连接已关闭');
    } catch (error) {
        console.error('❌ 关闭数据库连接失败:', error.message);
    }
}

// 导出Sequelize实例、模型和工具函数
module.exports = {
    sequelize,      // Sequelize实例
    Sequelize,      // Sequelize类
    User,           // 用户模型
    syncDatabase,   // 同步数据库函数
    closeDatabase   // 关闭数据库连接函数
};