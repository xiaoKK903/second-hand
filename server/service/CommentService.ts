const commentModel = require('../model/CommentModel.ts');
const userModel = require('../model/UserModel.ts');
const goodsModel = require('../model/GoodsModel.ts');
const db = require('../config/db.ts');

module.exports = {
    getCommentsByGoodsId: async (goods_id, options = {}) => {
        const where = {
            goods_id,
            status: 'active'
        };
        
        const comments = await commentModel.Comment.findAll({
            where,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: userModel.User,
                    as: 'user',
                    attributes: ['user_id', 'nickname', 'avatar']
                }
            ]
        });
        
        return comments.map(c => {
            const cData = c.toJSON();
            return {
                ...cData,
                nickname: cData.user?.nickname || '用户',
                avatar: cData.user?.avatar || null
            };
        });
    },

    addComment: async (data) => {
        const commentData = {
            goods_id: data.goods_id,
            user_id: data.user_id,
            reply_to: data.reply_to || null,
            parent_comment_id: data.parent_comment_id || null,
            content: data.content,
            status: 'active'
        };
        
        const comment = await commentModel.Comment.create(commentData);
        
        const user = await userModel.User.findOne({
            where: { user_id: data.user_id }
        });
        
        const result = comment.toJSON();
        result.nickname = user?.nickname || '用户';
        result.avatar = user?.avatar || null;
        
        return result;
    },

    getCommentById: async (comment_id) => {
        return await commentModel.Comment.findOne({
            where: { comment_id, status: 'active' }
        });
    },

    deleteComment: async (comment_id, user_id) => {
        const comment = await commentModel.Comment.findOne({
            where: { comment_id, user_id }
        });
        
        if (!comment) {
            return 0;
        }
        
        return await commentModel.Comment.update(
            { status: 'deleted', updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP') },
            { where: { comment_id } }
        );
    },

    getCommentsCount: async (goods_id) => {
        return await commentModel.Comment.count({
            where: { goods_id, status: 'active' }
        });
    }
};
