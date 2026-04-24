var userModel = require('../model/UserModel.ts');
var goodsModel = require('../model/GoodsModel.ts');
var db = require('../config/db.ts');
var Op = db.Op;

var AdminService = {
    checkAdmin: async function(user_id) {
        var user = await userModel.User.findOne({
            where: { user_id: user_id }
        });
        return user && user.role === 'admin';
    },
    
    getAllUsers: async function(options) {
        options = options || {};
        var where = {};
        
        if (options.keyword) {
            where[Op.or] = [
                { phone_num: { [Op.like]: '%' + options.keyword + '%' } },
                { nickname: { [Op.like]: '%' + options.keyword + '%' } }
            ];
        }
        
        if (options.role) {
            where.role = options.role;
        }
        
        if (options.is_active !== undefined) {
            where.is_active = options.is_active === 'true' || options.is_active === true;
        }
        
        var order = [['created_at', 'DESC']];
        if (options.orderBy) {
            order = [[options.orderBy, options.order === 'asc' ? 'ASC' : 'DESC']];
        }
        
        var users = await userModel.User.findAll({
            where: where,
            order: order,
            attributes: { exclude: ['password'] }
        });
        
        return users;
    },
    
    getUserById: async function(user_id) {
        var user = await userModel.User.findOne({
            where: { user_id: user_id },
            attributes: { exclude: ['password'] }
        });
        return user;
    },
    
    toggleUserActive: async function(user_id, is_active) {
        var result = await userModel.User.update(
            { 
                is_active: is_active,
                updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP')
            },
            { where: { user_id: user_id } }
        );
        return result[0] > 0;
    },
    
    toggleUserRole: async function(user_id, role) {
        var result = await userModel.User.update(
            { 
                role: role,
                updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP')
            },
            { where: { user_id: user_id } }
        );
        return result[0] > 0;
    },
    
    getAllGoods: async function(options) {
        options = options || {};
        var where = {};
        
        if (options.keyword) {
            where[Op.or] = [
                { goods_name: { [Op.like]: '%' + options.keyword + '%' } },
                { goods_desc: { [Op.like]: '%' + options.keyword + '%' } }
            ];
        }
        
        if (options.status) {
            where.status = options.status;
        }
        
        if (options.audit_status) {
            where.audit_status = options.audit_status;
        }
        
        if (options.user_id) {
            where.user_id = options.user_id;
        }
        
        var order = [['created_at', 'DESC']];
        if (options.orderBy) {
            order = [[options.orderBy, options.order === 'asc' ? 'ASC' : 'DESC']];
        }
        
        var goodsList = await goodsModel.Goods.findAll({
            where: where,
            order: order
        });
        
        return goodsList;
    },
    
    getGoodsById: async function(goods_id) {
        var goods = await goodsModel.Goods.findOne({
            where: { goods_id: goods_id }
        });
        return goods;
    },
    
    auditGoods: async function(goods_id, audit_status, audit_remark) {
        var updateData = {
            audit_status: audit_status,
            audit_remark: audit_remark || null,
            admin_operated_at: db.Sequelize.literal('CURRENT_TIMESTAMP')
        };
        
        var result = await goodsModel.Goods.update(
            updateData,
            { where: { goods_id: goods_id } }
        );
        return result[0] > 0;
    },
    
    takeDownGoods: async function(goods_id, remark) {
        var updateData = {
            status: 'inactive',
            audit_status: 'rejected',
            audit_remark: remark || '违规下架',
            admin_operated_at: db.Sequelize.literal('CURRENT_TIMESTAMP')
        };
        
        var result = await goodsModel.Goods.update(
            updateData,
            { where: { goods_id: goods_id } }
        );
        return result[0] > 0;
    },
    
    deleteGoods: async function(goods_id) {
        var result = await goodsModel.Goods.destroy({
            where: { goods_id: goods_id }
        });
        return result > 0;
    },
    
    getStatistics: async function() {
        var userCount = await userModel.User.count();
        var adminCount = await userModel.User.count({ where: { role: 'admin' } });
        var activeUserCount = await userModel.User.count({ where: { is_active: true } });
        
        var goodsCount = await goodsModel.Goods.count();
        var activeGoodsCount = await goodsModel.Goods.count({ where: { status: 'active' } });
        var pendingAuditCount = await goodsModel.Goods.count({ where: { audit_status: 'pending' } });
        var approvedCount = await goodsModel.Goods.count({ where: { audit_status: 'approved' } });
        var rejectedCount = await goodsModel.Goods.count({ where: { audit_status: 'rejected' } });
        var soldCount = await goodsModel.Goods.count({ where: { status: 'sold' } });
        
        return {
            users: {
                total: userCount,
                admins: adminCount,
                active: activeUserCount
            },
            goods: {
                total: goodsCount,
                active: activeGoodsCount,
                pending: pendingAuditCount,
                approved: approvedCount,
                rejected: rejectedCount,
                sold: soldCount
            }
        };
    }
};

module.exports = AdminService;
