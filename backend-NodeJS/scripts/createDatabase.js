const mysql = require('mysql2/promise');

async function createDatabase() {
    try {
        // 连接到MySQL服务器（不指定数据库）
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3307,
            user: 'root',
            password: '123456'
        });

        // 创建数据库（如果不存在）
        await connection.execute(`CREATE DATABASE IF NOT EXISTS jwt_auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ 数据库 jwt_auth_db 创建成功或已存在');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ 数据库创建失败:', error.message);
        process.exit(1);
    }
}

createDatabase();