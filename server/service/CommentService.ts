const commentModel = require('../model/CommentModel.ts');
const userModel = require('../model/UserModel.ts');
const db = require('../config/db.ts');

module.exports = {
    getCommentsByGoodsId: async function(goods_id, options) {
        if (options === undefined) options = {};
        
        var where = {
            goods_id: goods_id,
            status: 'active'
        };
        
        var comments = await commentModel.Comment.findAll({
            where: where,
            order: [['created_at', 'DESC']]
        });
        
        var userIds = [];
        comments.forEach(function(c) {
            var cData = c.toJSON();
            if (cData.user_id && userIds.indexOf(cData.user_id) === -1) {
                userIds.push(cData.user_id);
            }
        });
        
        var users = {};
        if (userIds.length > 0) {
            var userList = await userModel.User.findAll({
                where: { user_id: userIds }
            });
            userList.forEach(function(u) {
                var uData = u.toJSON();
                users[uData.user_id] = uData;
            });
        }
        
        return comments.map(function(c) {
            var cData = c.toJSON();
            var user = users[cData.user_id] || {};
            return {
                comment_id: cData.comment_id,
                goods_id: cData.goods_id,
                user_id: cData.user_id,
                reply_to: cData.reply_to,
                parent_comment_id: cData.parent_comment_id,
                content: cData.content,
                status: cData.status,
                created_at: cData.created_at,
                updated_at: cData.updated_at,
                nickname: user.phone_num || '用户',
                username: user.phone_num || '用户',
                avatar: null
            };
        });
    },

    addComment: async function(data) {
        var commentData = {
            goods_id: data.goods_id,
            user_id: data.user_id,
            reply_to: data.reply_to || null,
            parent_comment_id: data.parent_comment_id || null,
            content: data.content,
            status: 'active'
        };
        
        var comment = await commentModel.Comment.create(commentData);
        
        var user = await userModel.User.findOne({
            where: { user_id: data.user_id }
        });
        
        var result = comment.toJSON();
        var userData = user ? user.toJSON() : {};
        result.nickname = userData.phone_num || '用户';
        result.username = userData.phone_num || '用户';
        result.avatar = null;
        
        return result;
    },

    getCommentById: async function(comment_id) {
        return await commentModel.Comment.findOne({
            where: { comment_id: comment_id, status: 'active' }
        });
    },

    deleteComment: async function(comment_id, user_id) {
        var comment = await commentModel.Comment.findOne({
            where: { comment_id: comment_id, user_id: user_id }
        });
        
        if (!comment) {
            return 0;
        }
        
        return await commentModel.Comment.update(
            { status: 'deleted', updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP') },
            { where: { comment_id: comment_id } }
        );
    },

    getCommentsCount: async function(goods_id) {
        return await commentModel.Comment.count({
            where: { goods_id: goods_id, status: 'active' }
        });
    }
};
