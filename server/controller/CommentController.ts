const CommentService = require('../service/CommentService.ts');

module.exports = {
    getComments: async function(ctx, next) {
        await next();
        var goods_id = ctx.params.id || ctx.request.query.goods_id;
        
        if (!goods_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '缺少商品ID' };
            return;
        }
        
        var comments = await CommentService.getCommentsByGoodsId(goods_id);
        ctx.response.type = 'utf-8';
        ctx.response.body = comments;
    },

    addComment: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var goods_id = ctx.params.id || body.goods_id;
        var user_id = body.uid;
        var content = body.content;
        var reply_to = body.reply_to;
        var parent_comment_id = body.parent_comment_id;
        
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
        
        var comment = await CommentService.addComment({
            goods_id: goods_id,
            user_id: user_id,
            content: content.trim(),
            reply_to: reply_to,
            parent_comment_id: parent_comment_id
        });
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            msg: '评论成功',
            data: comment
        };
    },

    deleteComment: async function(ctx, next) {
        await next();
        var comment_id = ctx.params.comment_id;
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        
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
        
        var result = await CommentService.deleteComment(comment_id, uid);
        
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: result > 0,
            msg: result > 0 ? '删除成功' : '删除失败'
        };
    },

    getCommentsCount: async function(ctx, next) {
        await next();
        var goods_id = ctx.params.id || ctx.request.query.goods_id;
        
        if (!goods_id) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, count: 0 };
            return;
        }
        
        var count = await CommentService.getCommentsCount(goods_id);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: true, count: count };
    }
};
