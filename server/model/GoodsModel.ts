var db = require('../config/db.ts');

var Goods = db.sequelize.define('goods', {
    goods_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'goods_id'
    },
    user_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    goods_name: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'goods_name'
    },
    category_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id'
    },
    goods_desc: {
        type: db.DataTypes.TEXT,
        allowNull: true,
        field: 'goods_desc'
    },
    goods_image: {
        type: db.DataTypes.TEXT,
        allowNull: true,
        field: 'goods_image',
        comment: '商品封面图'
    },
    goods_images: {
        type: db.DataTypes.TEXT,
        allowNull: true,
        field: 'goods_images',
        get() {
            var rawValue = this.getDataValue('goods_images');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('goods_images', JSON.stringify(value || []));
        }
    },
    goods_price: {
        type: db.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'goods_price'
    },
    original_price: {
        type: db.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'original_price'
    },
    count: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'count'
    },
    condition: {
        type: db.DataTypes.STRING(20),
        allowNull: true,
        defaultValue: '轻微使用',
        field: 'condition',
        comment: '成色：全新、99新、95新、轻微使用、成色一般'
    },
    tags: {
        type: db.DataTypes.TEXT,
        allowNull: true,
        field: 'tags',
        comment: '标签：包邮、可小刀、自提、价格面议、支持自提、可租可买',
        get() {
            var rawValue = this.getDataValue('tags');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('tags', JSON.stringify(value || []));
        }
    },
    status: {
        type: db.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        field: 'status',
        comment: '状态：active-上架，inactive-下架，sold-已售出'
    },
    audit_status: {
        type: db.DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'approved',
        field: 'audit_status',
        comment: '审核状态：pending-待审核，approved-已通过，rejected-已拒绝'
    },
    audit_remark: {
        type: db.DataTypes.STRING(200),
        allowNull: true,
        field: 'audit_remark',
        comment: '审核备注'
    },
    admin_operated_at: {
        type: db.DataTypes.DATE,
        allowNull: true,
        field: 'admin_operated_at',
        comment: '管理员操作时间'
    },
    views: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'views'
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
    tableName: 'goods_table',
    timestamps: false,
    indexes: [
        {
            name: 'idx_user_id',
            fields: ['user_id']
        },
        {
            name: 'idx_category_id',
            fields: ['category_id']
        },
        {
            name: 'idx_status',
            fields: ['status']
        },
        {
            name: 'idx_condition',
            fields: ['condition']
        },
        {
            name: 'idx_audit_status',
            fields: ['audit_status']
        }
    ]
});

module.exports = {
    Goods
}
