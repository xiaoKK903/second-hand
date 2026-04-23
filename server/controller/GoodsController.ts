const GoodsService = require('../service/GoodsService.ts');

module.exports = {
    getConditions: async (ctx, next) => {
        await next();
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({
            success: true,
            data: GoodsService.CONDITIONS
        });
    },

    getTags: async (ctx, next) => {
        await next();
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({
            success: true,
            data: GoodsService.TAGS
        });
    },

    getAllGoods: async (ctx, next) => {
        await next();
        const options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        if (ctx.request.query.minPrice !== undefined) {
            options.minPrice = Number(ctx.request.query.minPrice);
        }
        if (ctx.request.query.maxPrice !== undefined) {
            options.maxPrice = Number(ctx.request.query.maxPrice);
        }
        let data = await GoodsService.getAllGoods(options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    publishGoods: async (ctx, next) => {
        await next();
        const body = ctx.request.body;
        const data = await GoodsService.publishGoods({
            name: body.name || body.form?.name,
            categoryId: body.categoryId || body.form?.categoryId,
            price: body.price || body.form?.price,
            originalPrice: body.originalPrice,
            num: body.num || body.form?.num || 1,
            desc: body.desc || body.form?.desc,
            imageUrl: body.imageUrl || body.form?.imageUrl,
            goods_images: body.goods_images || [],
            uid: body.uid,
            condition: body.condition || '轻微使用',
            tags: body.tags || []
        });
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            goods_id: data.goods_id,
            data
        };
    },

    searchGoods: async (ctx, next) => {
        await next();
        const options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        if (ctx.request.query.minPrice !== undefined) {
            options.minPrice = Number(ctx.request.query.minPrice);
        }
        if (ctx.request.query.maxPrice !== undefined) {
            options.maxPrice = Number(ctx.request.query.maxPrice);
        }
        let data = await GoodsService.searchGoods(ctx.request.query.keyword, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsByCategory: async (ctx, next) => {
        await next();
        const options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        let data = await GoodsService.getCategoryById(ctx.params.id, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsByPage: async (ctx, next) => {
        await next();
        let currentPage = Number(ctx.request.query.currentPage),
            pageSize = Number(ctx.request.query.pageSize);
        const options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        let data = await GoodsService.getGoodsByPage(currentPage, pageSize, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsById: async (ctx, next) => {
        await next();
        const incrementViews = ctx.request.query.incrementViews !== 'false';
        let data = await GoodsService.getGoodsById(ctx.params.id, incrementViews);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getRecommendGoods: async (ctx, next) => {
        await next();
        const categoryId = ctx.request.query.categoryId ? Number(ctx.request.query.categoryId) : null;
        const limit = ctx.request.query.limit ? Number(ctx.request.query.limit) : 40;
        let data = await GoodsService.getRecommendGoods(categoryId, limit);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getMyGoods: async (ctx, next) => {
        await next();
        const uid = ctx.request.query.uid || ctx.request.body.uid;
        const status = ctx.request.query.status;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        let data = await GoodsService.getMyGoods(uid, status);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({ success: true, data });
    },

    updateGoodsStatus: async (ctx, next) => {
        await next();
        const { uid } = ctx.request.body;
        const goodsId = ctx.params.id;
        const { status } = ctx.request.body;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        const result = await GoodsService.updateGoodsStatus(goodsId, uid, status);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result[0] > 0, msg: result[0] > 0 ? '操作成功' : '操作失败' };
    },

    updateGoods: async (ctx, next) => {
        await next();
        const { uid, ...updateData } = ctx.request.body;
        const goodsId = ctx.params.id;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        const result = await GoodsService.updateGoods(goodsId, uid, updateData);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result[0] > 0, msg: result[0] > 0 ? '更新成功' : '更新失败' };
    },

    deleteGoods: async (ctx, next) => {
        await next();
        const uid = ctx.request.query.uid || ctx.request.body.uid;
        const goodsId = ctx.params.id;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        const result = await GoodsService.deleteGoods(goodsId, uid);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result > 0, msg: result > 0 ? '删除成功' : '删除失败' };
    },

    getGoodsByCondition: async (ctx, next) => {
        await next();
        let data = await GoodsService.getGoodsByCondition(ctx.params.condition);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsCount: async (ctx, next) => {
        await next();
        const options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        const count = await GoodsService.getGoodsCount(options);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: true, count };
    }
};