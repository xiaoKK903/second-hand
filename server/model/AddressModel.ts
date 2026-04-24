var db = require('../config/db.ts');

var Address = db.sequelize.define('address', {
    address_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'address_id'
    },
    user_id: {
        type: db.DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    name: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'name',
        comment: '收货人姓名'
    },
    phone_num: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'phone_num',
        comment: '收货人手机号'
    },
    province: {
        type: db.DataTypes.STRING,
        allowNull: true,
        field: 'province',
        comment: '省份'
    },
    city: {
        type: db.DataTypes.STRING,
        allowNull: true,
        field: 'city',
        comment: '城市'
    },
    district: {
        type: db.DataTypes.STRING,
        allowNull: true,
        field: 'district',
        comment: '区县'
    },
    detail: {
        type: db.DataTypes.STRING,
        allowNull: true,
        field: 'detail',
        comment: '详细地址'
    },
    address: {
        type: db.DataTypes.STRING,
        allowNull: false,
        field: 'address',
        comment: '完整地址（省市区+详细）'
    },
    is_default: {
        type: db.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_default',
        comment: '是否为默认地址'
    },
    created_at: {
        type: db.DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
        comment: '创建时间'
    },
    updated_at: {
        type: db.DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
        comment: '更新时间'
    }
}, {
    tableName: 'address_table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = {
    Address
}