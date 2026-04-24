const db = require('../config/db.ts');
const { ChatSession } = require('../model/ChatSessionModel.ts');
const { ChatMessage } = require('../model/ChatMessageModel.ts');
const { User } = require('../model/UserModel.ts');
const { Op } = db;

var ChatService = {
    getOrCreateSession: async function(user1_id, user2_id) {
        if (user1_id === user2_id) {
            return null;
        }
        
        var minUserId = Math.min(user1_id, user2_id);
        var maxUserId = Math.max(user1_id, user2_id);
        
        var session = await ChatSession.findOne({
            where: {
                user1_id: minUserId,
                user2_id: maxUserId
            }
        });
        
        if (session) {
            return session;
        }
        
        session = await ChatSession.create({
            user1_id: minUserId,
            user2_id: maxUserId,
            last_message: '',
            last_message_time: new Date(),
            user1_unread: 0,
            user2_unread: 0
        });
        
        return session;
    },
    
    getUserSessions: async function(user_id) {
        var sessions = await ChatSession.findAll({
            where: {
                [Op.or]: [
                    { user1_id: user_id },
                    { user2_id: user_id }
                ]
            },
            order: [['last_message_time', 'DESC']]
        });
        
        var results = [];
        for (var i = 0; i < sessions.length; i++) {
            var session = sessions[i];
            var otherUserId = session.user1_id === user_id ? session.user2_id : session.user1_id;
            var unreadCount = session.user1_id === user_id ? session.user1_unread : session.user2_unread;
            
            var otherUser = await User.findOne({
                where: { user_id: otherUserId },
                attributes: ['user_id', 'phone_num']
            });
            
            results.push({
                session_id: session.session_id,
                other_user_id: otherUserId,
                other_user: otherUser ? {
                    user_id: otherUser.user_id,
                    username: otherUser.phone_num,
                    nickname: otherUser.phone_num
                } : null,
                last_message: session.last_message,
                last_message_time: session.last_message_time,
                unread_count: unreadCount
            });
        }
        
        return results;
    },
    
    getSessionMessages: async function(session_id, user_id, limit) {
        limit = limit || 50;
        
        var messages = await ChatMessage.findAll({
            where: {
                session_id: session_id
            },
            order: [['created_at', 'ASC']],
            limit: limit
        });
        
        return messages;
    },
    
    sendMessage: async function(session_id, sender_id, receiver_id, content, msg_type, goods_id) {
        msg_type = msg_type || 'text';
        
        var message = await ChatMessage.create({
            session_id: session_id,
            sender_id: sender_id,
            receiver_id: receiver_id,
            content: content,
            msg_type: msg_type,
            goods_id: goods_id || null,
            is_read: false
        });
        
        var session = await ChatSession.findOne({
            where: { session_id: session_id }
        });
        
        if (session) {
            var previewContent = content;
            if (msg_type === 'goods_card') {
                previewContent = '[商品卡片]';
            }
            if (previewContent.length > 50) {
                previewContent = previewContent.substring(0, 50) + '...';
            }
            
            var updateData = {
                last_message: previewContent,
                last_message_time: new Date(),
                updated_at: new Date()
            };
            
            if (session.user1_id === sender_id) {
                updateData.user2_unread = (session.user2_unread || 0) + 1;
            } else {
                updateData.user1_unread = (session.user1_unread || 0) + 1;
            }
            
            await ChatSession.update(updateData, {
                where: { session_id: session_id }
            });
        }
        
        return message;
    },
    
    markSessionAsRead: async function(session_id, user_id) {
        var session = await ChatSession.findOne({
            where: { session_id: session_id }
        });
        
        if (!session) {
            return 0;
        }
        
        var updateData = { updated_at: new Date() };
        if (session.user1_id === user_id) {
            updateData.user1_unread = 0;
        } else {
            updateData.user2_unread = 0;
        }
        
        await ChatSession.update(updateData, {
            where: { session_id: session_id }
        });
        
        var result = await ChatMessage.update(
            { is_read: true },
            {
                where: {
                    session_id: session_id,
                    receiver_id: user_id,
                    is_read: false
                }
            }
        );
        
        return result[0];
    },
    
    getTotalUnreadCount: async function(user_id) {
        var sessions = await ChatSession.findAll({
            where: {
                [Op.or]: [
                    { user1_id: user_id },
                    { user2_id: user_id }
                ]
            }
        });
        
        var total = 0;
        for (var i = 0; i < sessions.length; i++) {
            var session = sessions[i];
            if (session.user1_id === user_id) {
                total += session.user1_unread || 0;
            } else {
                total += session.user2_unread || 0;
            }
        }
        
        return total;
    },
    
    getSessionById: async function(session_id) {
        return await ChatSession.findOne({
            where: { session_id: session_id }
        });
    }
};

module.exports = ChatService;
