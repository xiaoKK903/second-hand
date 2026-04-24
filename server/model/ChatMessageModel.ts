var db = require('../config/db.ts');

var ChatMessage = db.sequelize.define('chat_message', {
    message_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'message_id'
    },
    session_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'session_id',
        comment: '关联的会话ID'
    },
    sender_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
        comment: '发送者用户ID'
    },
    receiver_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'receiver_id',
        comment: '接收者用户ID'
    },
    content: {
        type: db.DataTypes.TEXT,
        allowNull: false,
        field: 'content',
        comment: '消息内容'
    },
    msg_type: {
        type: db.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'text',
        field: 'msg_type',
        comment: '消息类型：text-文字，goods_card-商品卡片'
    },
    goods_id: {
        type: db.DataTypes.INTEGER,
        allowNull: true,
        field: 'goods_id',
        comment: '商品ID（商品卡片类型时使用）'
    },
    is_read: {
        type: db.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
        comment: '是否已读'
    },
    created_at: {
        type: db.DataTypes.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
    }
}, {
    tableName: 'chat_message_table',
    timestamps: false,
    indexes: [
        {
            name: 'idx_session_id',
            fields: ['session_id']
        },
        {
            name: 'idx_sender_id',
            fields: ['sender_id']
        },
        {
            name: 'idx_receiver_id',
            fields: ['receiver_id']
        },
        {
            name: 'idx_is_read',
            fields: ['is_read']
        },
        {
            name: 'idx_created_at',
            fields: ['created_at']
        }
    ]
});

module.exports = {
    ChatMessage
};
