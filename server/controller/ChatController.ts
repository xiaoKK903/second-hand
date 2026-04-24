const ChatService = require('../service/ChatService.ts');
const { Goods } = require('../model/GoodsModel.ts');

module.exports = {
    getOrCreateSession: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var currentUserId = body.uid;
        var targetUserId = body.target_user_id;
        
        if (!currentUserId) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!targetUserId) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少目标用户ID' };
            return;
        }
        
        if (Number(currentUserId) === Number(targetUserId)) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '不能与自己聊天' };
            return;
        }
        
        var session = await ChatService.getOrCreateSession(Number(currentUserId), Number(targetUserId));
        
        if (!session) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '创建会话失败' };
            return;
        }
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            data: {
                session_id: session.session_id
            }
        };
    },
    
    getUserSessions: async function(ctx, next) {
        await next();
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录', data: [] };
            return;
        }
        
        var sessions = await ChatService.getUserSessions(Number(uid));
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            data: sessions
        };
    },
    
    getSessionMessages: async function(ctx, next) {
        await next();
        var session_id = ctx.params.session_id;
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!session_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少会话ID' };
            return;
        }
        
        var session = await ChatService.getSessionById(session_id);
        if (!session) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '会话不存在' };
            return;
        }
        
        if (session.user1_id !== Number(uid) && session.user2_id !== Number(uid)) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '无权访问此会话' };
            return;
        }
        
        await ChatService.markSessionAsRead(session_id, Number(uid));
        
        var messages = await ChatService.getSessionMessages(session_id, Number(uid));
        
        var messagesWithGoods = [];
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            var msgData = {
                message_id: msg.message_id,
                session_id: msg.session_id,
                sender_id: msg.sender_id,
                receiver_id: msg.receiver_id,
                content: msg.content,
                msg_type: msg.msg_type,
                goods_id: msg.goods_id,
                is_read: msg.is_read,
                created_at: msg.created_at,
                goods: null
            };
            
            if (msg.msg_type === 'goods_card' && msg.goods_id) {
                var goods = await Goods.findOne({
                    where: { goods_id: msg.goods_id }
                });
                if (goods) {
                    msgData.goods = {
                        goods_id: goods.goods_id,
                        goods_name: goods.goods_name,
                        goods_price: goods.goods_price,
                        goods_image: goods.goods_image
                    };
                }
            }
            
            messagesWithGoods.push(msgData);
        }
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            data: messagesWithGoods
        };
    },
    
    sendMessage: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var sender_id = body.uid;
        var receiver_id = body.receiver_id;
        var session_id = body.session_id;
        var content = body.content;
        var msg_type = body.msg_type || 'text';
        var goods_id = body.goods_id || null;
        
        if (!sender_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!receiver_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少接收者ID' };
            return;
        }
        
        if (!content || !content.trim()) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '消息内容不能为空' };
            return;
        }
        
        if (!session_id) {
            var session = await ChatService.getOrCreateSession(Number(sender_id), Number(receiver_id));
            if (!session) {
                ctx.response.type = 'utf-8';
                ctx.response.body = { success: false, msg: '创建会话失败' };
                return;
            }
            session_id = session.session_id;
        }
        
        var message = await ChatService.sendMessage(
            session_id,
            Number(sender_id),
            Number(receiver_id),
            content.trim(),
            msg_type,
            goods_id ? Number(goods_id) : null
        );
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            msg: '发送成功',
            data: message
        };
    },
    
    markAsRead: async function(ctx, next) {
        await next();
        var session_id = ctx.params.session_id;
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!session_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少会话ID' };
            return;
        }
        
        var count = await ChatService.markSessionAsRead(session_id, Number(uid));
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            data: {
                marked_count: count
            }
        };
    },
    
    getUnreadCount: async function(ctx, next) {
        await next();
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录', data: { count: 0 } };
            return;
        }
        
        var count = await ChatService.getTotalUnreadCount(Number(uid));
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            data: {
                count: count
            }
        };
    }
};
