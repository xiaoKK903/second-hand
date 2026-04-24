var db = require('../config/db.ts');

var Comment = db.sequelize.define('comment', {
    comment_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'comment_id'
    },
    goods_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'goods_id',
        comment: '关联商品ID'
    },
    user_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '评论者用户ID'
    },
    reply_to: {
        type: db.DataTypes.INTEGER,
        allowNull: true,
        field: 'reply_to',
        comment: '回复的用户ID，为空表示提问'
    },
    parent_comment_id: {
        type: db.DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_comment_id',
        comment: '父评论ID，用于楼中楼回复'
    },
    content: {
        type: db.DataTypes.STRING(500),
        allowNull: false,
        field: 'content',
        comment: '评论内容'
    },
    status: {
        type: db.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        field: 'status',
        comment: '状态：active-正常，deleted-已删除'
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
    tableName: 'comment_table',
    timestamps: false,
    indexes: [
        {
            name: 'idx_goods_id',
            fields: ['goods_id']
        },
        {
            name: 'idx_user_id',
            fields: ['user_id']
        },
        {
            name: 'idx_parent_comment_id',
            fields: ['parent_comment_id']
        },
        {
            name: 'idx_status',
            fields: ['status']
        }
    ]
});

module.exports = {
    Comment
};
