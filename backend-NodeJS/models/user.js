/**
 * 用户模型
 * 定义用户数据结构和相关方法
 * 与Flask版本的User模型保持一致
 */

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        // 用户ID（主键，自增）
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: '用户唯一标识'
        },
        // 用户名（唯一，3-80字符）
        username: {
            type: DataTypes.STRING(80),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: '用户名不能为空' },
                len: {
                    args: [3, 80],
                    msg: '用户名长度必须在3-80个字符之间'
                }
            },
            comment: '用户名'
        },
        // 邮箱（唯一，必须是有效邮箱格式）
        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: '邮箱格式不正确' },
                notEmpty: { msg: '邮箱不能为空' }
            },
            comment: '用户邮箱'
        },
        // 密码哈希值（使用bcrypt加密）
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: '密码哈希值'
        },
        // 创建时间
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '创建时间'
        },
        // 更新时间
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            comment: '更新时间'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeUpdate: (user) => {
                user.updated_at = new Date();
            }
        }
    });

    /**
     * 设置密码
     * 使用bcryptjs加密密码，与Flask版本的bcrypt保持一致
     * @param {string} password - 明文密码
     */
    User.prototype.setPassword = function(password) {
        const saltRounds = 12; // 盐轮数，与Flask版本保持一致
        this.password_hash = bcrypt.hashSync(password, saltRounds);
    };

    /**
     * 验证密码
     * @param {string} password - 待验证的明文密码
     * @returns {boolean} 密码是否正确
     */
    User.prototype.checkPassword = function(password) {
        return bcrypt.compareSync(password, this.password_hash);
    };

    /**
     * 转换为JSON格式
     * 移除敏感信息（如密码哈希）
     * @returns {Object} 安全的用户信息对象
     */
    User.prototype.toJSON = function() {
        const values = Object.assign({}, this.get());
        delete values.password_hash; // 移除密码哈希
        return values;
    };

    /**
     * 转换为字典格式（与Flask版本的to_dict方法保持一致）
     * @returns {Object} 用户信息字典
     */
    User.prototype.toDict = function() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            created_at: this.created_at ? this.created_at.toISOString() : null,
            updated_at: this.updated_at ? this.updated_at.toISOString() : null
        };
    };

    /**
     * 根据用户名查找用户（静态方法）
     * @param {string} username - 用户名
     * @returns {Promise<User|null>} 用户对象或null
     */
    User.findByUsername = function(username) {
        return this.findOne({ where: { username } });
    };

    /**
     * 根据邮箱查找用户（静态方法）
     * @param {string} email - 邮箱
     * @returns {Promise<User|null>} 用户对象或null
     */
    User.findByEmail = function(email) {
        return this.findOne({ where: { email } });
    };

    return User;
};