const db = require('../config/db.ts');

const ChatSession = db.sequelize.define('chat_session', {
    session_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'session_id'
    },
    user1_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'user1_id',
        comment: '会话参与者1的用户ID'
    },
    user2_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'user2_id',
        comment: '会话参与者2的用户ID'
    },
    last_message: {
        type: db.DataTypes.STRING(500),
        allowNull: true,
        field: 'last_message',
        comment: '最后一条消息预览'
    },
    last_message_time: {
        type: db.DataTypes.DATE,
        allowNull: true,
        field: 'last_message_time',
        comment: '最后消息时间'
    },
    user1_unread: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'user1_unread',
        comment: '用户1的未读消息数'
    },
    user2_unread: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'user2_unread',
        comment: '用户2的未读消息数'
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
    tableName: 'chat_session_table',
    timestamps: false,
    indexes: [
        {
            name: 'idx_user1_id',
            fields: ['user1_id']
        },
        {
            name: 'idx_user2_id',
            fields: ['user2_id']
        },
        {
            name: 'idx_last_message_time',
            fields: ['last_message_time']
        },
        {
            name: 'idx_users_unique',
            fields: ['user1_id', 'user2_id'],
            unique: true
        }
    ]
});

module.exports = {
    ChatSession
};
