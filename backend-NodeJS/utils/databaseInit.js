/**
 * 数据库初始化工具
 * 自动检查并创建数据库，同步表结构
 * 与Flask版本的create_database_and_tables功能保持一致
 */

const mysql = require('mysql2/promise');
const { sequelize } = require('../models');
require('dotenv').config();

class DatabaseInitializer {
  constructor() {
    // 数据库配置
    this.dbConfig = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT) || 3307,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '123456',
      database: process.env.MYSQL_DATABASE || 'jwt_auth_db'
    };
  }

  /**
   * 创建MySQL根连接（不指定数据库）
   * @returns {Promise<Connection>} MySQL连接
   */
  async createRootConnection() {
    const config = { ...this.dbConfig };
    delete config.database; // 移除数据库名，连接到MySQL服务器

    try {
      return await mysql.createConnection(config);
    } catch (error) {
      console.error('❌ 创建MySQL连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 检查数据库是否存在
   * @returns {Promise<boolean>} 数据库是否存在
   */
  async checkDatabaseExists() {
    let connection;
    try {
      connection = await this.createRootConnection();

      // 查询数据库是否存在
      const [rows] = await connection.execute(
        `SHOW DATABASES LIKE '${this.dbConfig.database}'`
      );

      return rows.length > 0;
    } catch (error) {
      console.error('❌ 检查数据库存在性失败:', error.message);
      return false;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 创建数据库
   * @returns {Promise<boolean>} 是否创建成功
   */
  async createDatabase() {
    let connection;
    try {
      connection = await this.createRootConnection();

      console.log(`📁 正在创建数据库: ${this.dbConfig.database}`);

      // 创建数据库（如果不存在）
      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS \`${this.dbConfig.database}\` 
         CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );

      console.log(`✅ 数据库创建成功: ${this.dbConfig.database}`);
      return true;
    } catch (error) {
      console.error('❌ 创建数据库失败:', error.message);
      return false;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * 同步数据库表结构
   * @returns {Promise<boolean>} 是否同步成功
   */
  async syncTables() {
    try {
      console.log('🔄 正在同步数据库表结构...');

      // 同步模型到数据库
      await sequelize.sync({
        force: false,  // 不强制删除现有表
        alter: false   // 不自动修改表结构（避免索引冲突）
      });

      console.log('✅ 数据库表结构同步完成');
      return true;
    } catch (error) {
      console.error('❌ 同步数据库表结构失败:', error.message);
      return false;
    }
  }

  /**
   * 完整的数据库初始化流程
   * 1. 检查数据库是否存在
   * 2. 如果不存在则创建数据库
   * 3. 同步表结构
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async initialize() {
    console.log('🚀 开始自动数据库初始化...');

    try {
      // 步骤1: 检查数据库是否存在
      const dbExists = await this.checkDatabaseExists();

      if (!dbExists) {
        console.log('📊 数据库不存在，开始创建...');
        const created = await this.createDatabase();
        if (!created) {
          throw new Error('数据库创建失败');
        }
      } else {
        console.log('📊 数据库已存在，跳过创建');
      }

      // 步骤2: 同步表结构
      const synced = await this.syncTables();
      if (!synced) {
        throw new Error('表结构同步失败');
      }

      console.log('🎉 数据库初始化完成');
      return true;

    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      return false;
    }
  }
}

module.exports = DatabaseInitializer;