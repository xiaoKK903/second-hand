var db = require('../config/db.ts');

var User = db.sequelize.define('user', {
    user_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'user_id'
    },
    password: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'password'
    },
    phone_num: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'phone_num'
    },
    nickname: {
        type: db.DataTypes.STRING(50),
        allowNull: true,
        field: 'nickname',
        comment: '用户昵称'
    },
    avatar: {
        type: db.DataTypes.TEXT,
        allowNull: true,
        field: 'avatar',
        comment: '用户头像URL'
    },
    bio: {
        type: db.DataTypes.STRING(200),
        allowNull: true,
        field: 'bio',
        comment: '个人简介/个性签名'
    },
    contact: {
        type: db.DataTypes.STRING(100),
        allowNull: true,
        field: 'contact',
        comment: '联系方式（微信、QQ等）'
    },
    created_at: {
        type: db.DataTypes.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
    },
    updated_at: {
        type: db.DataTypes.DATE,
        allowNull: true,
        field: 'updated_at'
    }
}, {
    timestamps: false,
    tableName: 'user_table'
});

module.exports = {
    User
}
