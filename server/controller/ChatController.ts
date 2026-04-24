var ChatService = require('../service/ChatService.ts');
var GoodsModel = require('../model/GoodsModel.ts');

module.exports = {
    getOrCreateSession: async function(ctx, next) {
        await next();
        try {
            var body = ctx.request.body || {};
            var currentUserId = body.uid;
            var targetUserId = body.target_user_id;
            
            console.log('getOrCreateSession called:', { uid: currentUserId, target_user_id: targetUserId });
            
            if (!currentUserId) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!targetUserId) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少目标用户ID' };
                return;
            }
            
            var uidNum = parseInt(currentUserId, 10);
            var targetUidNum = parseInt(targetUserId, 10);
            
            if (uidNum === targetUidNum) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '不能与自己聊天' };
                return;
            }
            
            var session = await ChatService.getOrCreateSession(uidNum, targetUidNum);
            
            if (!session) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '创建会话失败' };
                return;
            }
            
            console.log('Session created/found:', session.session_id);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: {
                    session_id: session.session_id
                }
            };
        } catch (e) {
            console.error('getOrCreateSession error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误: ' + e.message };
        }
    },
    
    getUserSessions: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.query ? ctx.request.query.uid : null;
            if (!uid) {
                uid = ctx.request.body ? ctx.request.body.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录', data: [] };
                return;
            }
            
            var sessions = await ChatService.getUserSessions(parseInt(uid, 10));
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: sessions
            };
        } catch (e) {
            console.error('getUserSessions error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误', data: [] };
        }
    },
    
    getSessionMessages: async function(ctx, next) {
        await next();
        try {
            var session_id = ctx.params.session_id;
            var uid = ctx.request.query ? ctx.request.query.uid : null;
            if (!uid) {
                uid = ctx.request.body ? ctx.request.body.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!session_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少会话ID' };
                return;
            }
            
            var session = await ChatService.getSessionById(parseInt(session_id, 10));
            if (!session) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '会话不存在' };
                return;
            }
            
            var uidNum = parseInt(uid, 10);
            if (session.user1_id !== uidNum && session.user2_id !== uidNum) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '无权访问此会话' };
                return;
            }
            
            await ChatService.markSessionAsRead(parseInt(session_id, 10), uidNum);
            
            var messages = await ChatService.getSessionMessages(parseInt(session_id, 10), uidNum);
            
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
                    try {
                        var goods = await GoodsModel.Goods.findOne({
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
                    } catch (err) {
                        console.error('Get goods error:', err);
                    }
                }
                
                messagesWithGoods.push(msgData);
            }
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: messagesWithGoods
            };
        } catch (e) {
            console.error('getSessionMessages error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误', data: [] };
        }
    },
    
    sendMessage: async function(ctx, next) {
        await next();
        try {
            console.log('sendMessage called with body:', JSON.stringify(ctx.request.body));
            
            var body = ctx.request.body || {};
            var sender_id = body.uid;
            var receiver_id = body.receiver_id;
            var session_id = body.session_id;
            var content = body.content;
            var msg_type = body.msg_type || 'text';
            var goods_id = body.goods_id;
            
            if (!sender_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!receiver_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少接收者ID' };
                return;
            }
            
            if (!content || !content.trim()) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '消息内容不能为空' };
                return;
            }
            
            var senderNum = parseInt(sender_id, 10);
            var receiverNum = parseInt(receiver_id, 10);
            var sessionNum = session_id ? parseInt(session_id, 10) : null;
            var goodsNum = goods_id ? parseInt(goods_id, 10) : null;
            
            console.log('Parsed values:', {
                senderNum,
                receiverNum,
                sessionNum,
                content: content.trim(),
                msg_type,
                goodsNum
            });
            
            if (!sessionNum) {
                console.log('No session_id, creating/getting session...');
                var session = await ChatService.getOrCreateSession(senderNum, receiverNum);
                if (!session) {
                    ctx.response.type = 'application/json';
                    ctx.response.body = { success: false, msg: '创建会话失败' };
                    return;
                }
                sessionNum = session.session_id;
                console.log('Session created:', sessionNum);
            }
            
            console.log('Calling ChatService.sendMessage...');
            var message = await ChatService.sendMessage(
                sessionNum,
                senderNum,
                receiverNum,
                content.trim(),
                msg_type,
                goodsNum
            );
            
            console.log('Message sent:', message);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                msg: '发送成功',
                data: message
            };
        } catch (e) {
            console.error('sendMessage error:', e);
            console.error('Error stack:', e.stack);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '发送失败: ' + e.message };
        }
    },
    
    markAsRead: async function(ctx, next) {
        await next();
        try {
            var session_id = ctx.params.session_id;
            var uid = ctx.request.query ? ctx.request.query.uid : null;
            if (!uid) {
                uid = ctx.request.body ? ctx.request.body.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            if (!session_id) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少会话ID' };
                return;
            }
            
            var count = await ChatService.markSessionAsRead(parseInt(session_id, 10), parseInt(uid, 10));
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: {
                    marked_count: count
                }
            };
        } catch (e) {
            console.error('markAsRead error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    },
    
    getUnreadCount: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.query ? ctx.request.query.uid : null;
            if (!uid) {
                uid = ctx.request.body ? ctx.request.body.uid : null;
            }
            
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录', data: { count: 0 } };
                return;
            }
            
            var count = await ChatService.getTotalUnreadCount(parseInt(uid, 10));
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: {
                    count: count
                }
            };
        } catch (e) {
            console.error('getUnreadCount error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误', data: { count: 0 } };
        }
    }
};
