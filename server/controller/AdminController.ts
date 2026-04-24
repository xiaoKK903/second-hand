var AdminService = require('../service/AdminService.ts');

module.exports = {
    checkAdmin: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            if (!uid) {
                uid = ctx.request.query ? ctx.request.query.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录', is_admin: false };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: {
                    is_admin: isAdmin
                }
            };
        } catch (e) {
            console.error('checkAdmin error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误', is_admin: false };
        }
    },
    
    getStatistics: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            if (!uid) {
                uid = ctx.request.query ? ctx.request.query.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限访问' };
                return;
            }
            
            var stats = await AdminService.getStatistics();
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: stats
            };
        } catch (e) {
            console.error('getStatistics error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    getUsers: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            if (!uid) {
                uid = ctx.request.query ? ctx.request.query.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限访问' };
                return;
            }
            
            var options = {
                keyword: ctx.request.query.keyword || ctx.request.body.keyword,
                role: ctx.request.query.role || ctx.request.body.role,
                is_active: ctx.request.query.is_active || ctx.request.body.is_active,
                orderBy: ctx.request.query.orderBy || ctx.request.body.orderBy,
                order: ctx.request.query.order || ctx.request.body.order
            };
            
            var users = await AdminService.getAllUsers(options);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: users
            };
        } catch (e) {
            console.error('getUsers error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    toggleUserActive: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            var targetUserId = ctx.request.body.target_user_id;
            var is_active = ctx.request.body.is_active;
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!targetUserId) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少目标用户ID' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限操作' };
                return;
            }
            
            var result = await AdminService.toggleUserActive(targetUserId, is_active === true || is_active === 'true');
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result,
                msg: result ? '操作成功' : '操作失败'
            };
        } catch (e) {
            console.error('toggleUserActive error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    toggleUserRole: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            var targetUserId = ctx.request.body.target_user_id;
            var role = ctx.request.body.role;
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!targetUserId) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少目标用户ID' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限操作' };
                return;
            }
            
            var result = await AdminService.toggleUserRole(targetUserId, role);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result,
                msg: result ? '操作成功' : '操作失败'
            };
        } catch (e) {
            console.error('toggleUserRole error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    getGoods: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            if (!uid) {
                uid = ctx.request.query ? ctx.request.query.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限访问' };
                return;
            }
            
            var options = {
                keyword: ctx.request.query.keyword || ctx.request.body.keyword,
                status: ctx.request.query.status || ctx.request.body.status,
                audit_status: ctx.request.query.audit_status || ctx.request.body.audit_status,
                user_id: ctx.request.query.user_id || ctx.request.body.user_id,
                orderBy: ctx.request.query.orderBy || ctx.request.body.orderBy,
                order: ctx.request.query.order || ctx.request.body.order
            };
            
            var goodsList = await AdminService.getAllGoods(options);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: goodsList
            };
        } catch (e) {
            console.error('getGoods error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    auditGoods: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            var goods_id = ctx.request.body.goods_id;
            var audit_status = ctx.request.body.audit_status;
            var audit_remark = ctx.request.body.audit_remark;
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!goods_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少商品ID' };
                return;
            }
            
            if (!audit_status) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少审核状态' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限操作' };
                return;
            }
            
            var result = await AdminService.auditGoods(goods_id, audit_status, audit_remark);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result,
                msg: result ? '审核成功' : '审核失败'
            };
        } catch (e) {
            console.error('auditGoods error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    takeDownGoods: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            var goods_id = ctx.request.body.goods_id;
            var remark = ctx.request.body.remark;
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!goods_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少商品ID' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限操作' };
                return;
            }
            
            var result = await AdminService.takeDownGoods(goods_id, remark);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result,
                msg: result ? '下架成功' : '下架失败'
            };
        } catch (e) {
            console.error('takeDownGoods error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    deleteGoods: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            var goods_id = ctx.request.body.goods_id;
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!goods_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少商品ID' };
                return;
            }
            
            var isAdmin = await AdminService.checkAdmin(uid);
            if (!isAdmin) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权限操作' };
                return;
            }
            
            var result = await AdminService.deleteGoods(goods_id);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result,
                msg: result ? '删除成功' : '删除失败'
            };
        } catch (e) {
            console.error('deleteGoods error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    }
};
