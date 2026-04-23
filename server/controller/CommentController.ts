const CommentService = require('../service/CommentService.ts');

module.exports = {
    getComments: async (ctx, next) => {
        await next();
        const goods_id = ctx.params.id || ctx.request.query.goods_id;
        
        if (!goods_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少商品ID' };
            return;
        }
        
        const comments = await CommentService.getCommentsByGoodsId(goods_id);
        ctx.response.type = 'utf-8';
        ctx.response.body = comments;
    },

    addComment: async (ctx, next) => {
        await next();
        const body = ctx.request.body;
        const goods_id = ctx.params.id || body.goods_id;
        const user_id = body.uid;
        const content = body.content;
        const reply_to = body.reply_to;
        const parent_comment_id = body.parent_comment_id;
        
        if (!goods_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少商品ID' };
            return;
        }
        
        if (!user_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!content || !content.trim()) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '评论内容不能为空' };
            return;
        }
        
        const comment = await CommentService.addComment({
            goods_id,
            user_id,
            content: content.trim(),
            reply_to,
            parent_comment_id
        });
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            msg: '评论成功',
            data: comment
        };
    },

    deleteComment: async (ctx, next) => {
        await next();
        const comment_id = ctx.params.comment_id;
        const uid = ctx.request.query.uid || ctx.request.body.uid;
        
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '请先登录' };
            return;
        }
        
        if (!comment_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少评论ID' };
            return;
        }
        
        const result = await CommentService.deleteComment(comment_id, uid);
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: result[0] > 0,
            msg: result[0] > 0 ? '删除成功' : '删除失败'
        };
    },

    getCommentsCount: async (ctx, next) => {
        await next();
        const goods_id = ctx.params.id || ctx.request.query.goods_id;
        
        if (!goods_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, count: 0 };
            return;
        }
        
        const count = await CommentService.getCommentsCount(goods_id);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: true, count };
    }
};
