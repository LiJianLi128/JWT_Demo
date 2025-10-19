package com.jwt.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;

/**
 * 自动创建users表
 */
@Component
public class AutoTableCreator implements CommandLineRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public AutoTableCreator(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        createUsersTableIfNotExists();
    }

    // 检查users表是否存在，如果不存在则创建
    private void createUsersTableIfNotExists() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            ResultSet tables = metaData.getTables(null, null, "users", new String[]{"TABLE"});
            
            if (!tables.next()) {
                // 表不存在，创建表
                String createTableSQL = "CREATE TABLE users (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "username VARCHAR(50) NOT NULL UNIQUE, " +
                    "email VARCHAR(100) NOT NULL UNIQUE, " +
                    "password_hash VARCHAR(255) NOT NULL, " +
                    "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ")";
                
                jdbcTemplate.execute(createTableSQL);
                System.out.println("Users表创建成功！");
            } else {
                System.out.println("Users表已存在！");
            }
        } catch (Exception e) {
            System.err.println("创建Users表失败: " + e.getMessage());
        } finally{
            // 关闭连接
            jdbcTemplate.close();
            System.out.println("JdbcTemplate关闭");
        }
    }
}