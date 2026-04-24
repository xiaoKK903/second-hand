var GoodsService = require('../service/GoodsService.ts');

module.exports = {
    getConditions: async function(ctx, next) {
        await next();
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({
            success: true,
            data: GoodsService.CONDITIONS
        });
    },

    getTags: async function(ctx, next) {
        await next();
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({
            success: true,
            data: GoodsService.TAGS
        });
    },

    getAllGoods: async function(ctx, next) {
        await next();
        var options = {};
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
        var data = await GoodsService.getAllGoods(options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    publishGoods: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var name = body.name;
        if (!name && body.form) {
            name = body.form.name;
        }
        var categoryId = body.categoryId;
        if (!categoryId && body.form) {
            categoryId = body.form.categoryId;
        }
        var price = body.price;
        if (!price && body.form) {
            price = body.form.price;
        }
        var num = body.num;
        if (!num && body.form) {
            num = body.form.num;
        }
        var desc = body.desc;
        if (!desc && body.form) {
            desc = body.form.desc;
        }
        var imageUrl = body.imageUrl;
        if (!imageUrl && body.form) {
            imageUrl = body.form.imageUrl;
        }
        var data = await GoodsService.publishGoods({
            name: name,
            categoryId: categoryId,
            price: price,
            originalPrice: body.originalPrice,
            num: num || 1,
            desc: desc,
            imageUrl: imageUrl,
            goods_images: body.goods_images || [],
            uid: body.uid,
            condition: body.condition || '轻微使用',
            tags: body.tags || []
        });
        ctx.response.type = 'utf-8';
        ctx.response.body = {
            success: true,
            goods_id: data.goods_id,
            data: data
        };
    },

    searchGoods: async function(ctx, next) {
        await next();
        var options = {};
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
        var data = await GoodsService.searchGoods(ctx.request.query.keyword, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsByCategory: async function(ctx, next) {
        await next();
        var options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        var data = await GoodsService.getCategoryById(ctx.params.id, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsByPage: async function(ctx, next) {
        await next();
        var currentPage = Number(ctx.request.query.currentPage);
        var pageSize = Number(ctx.request.query.pageSize);
        var options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        var data = await GoodsService.getGoodsByPage(currentPage, pageSize, options);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsById: async function(ctx, next) {
        await next();
        var incrementViews = ctx.request.query.incrementViews !== 'false';
        var data = await GoodsService.getGoodsById(ctx.params.id, incrementViews);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getRecommendGoods: async function(ctx, next) {
        await next();
        var categoryId = ctx.request.query.categoryId ? Number(ctx.request.query.categoryId) : null;
        var limit = ctx.request.query.limit ? Number(ctx.request.query.limit) : 40;
        var data = await GoodsService.getRecommendGoods(categoryId, limit);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getMyGoods: async function(ctx, next) {
        await next();
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        var status = ctx.request.query.status;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        var data = await GoodsService.getMyGoods(uid, status);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify({ success: true, data: data });
    },

    updateGoodsStatus: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var uid = body.uid;
        var goodsId = ctx.params.id;
        var status = body.status;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        var result = await GoodsService.updateGoodsStatus(goodsId, uid, status);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result[0] > 0, msg: result[0] > 0 ? '操作成功' : '操作失败' };
    },

    updateGoods: async function(ctx, next) {
        await next();
        var body = ctx.request.body;
        var uid = body.uid;
        var goodsId = ctx.params.id;
        var updateData = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.price !== undefined) updateData.price = body.price;
        if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice;
        if (body.num !== undefined) updateData.num = body.num;
        if (body.desc !== undefined) updateData.desc = body.desc;
        if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
        if (body.condition !== undefined) updateData.condition = body.condition;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.goods_images !== undefined) updateData.goods_images = body.goods_images;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        var result = await GoodsService.updateGoods(goodsId, uid, updateData);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result[0] > 0, msg: result[0] > 0 ? '更新成功' : '更新失败' };
    },

    deleteGoods: async function(ctx, next) {
        await next();
        var uid = ctx.request.query.uid || ctx.request.body.uid;
        var goodsId = ctx.params.id;
        if (!uid) {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户未登录' };
            return;
        }
        var result = await GoodsService.deleteGoods(goodsId, uid);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: result > 0, msg: result > 0 ? '删除成功' : '删除失败' };
    },

    getGoodsByCondition: async function(ctx, next) {
        await next();
        var data = await GoodsService.getGoodsByCondition(ctx.params.condition);
        ctx.response.type = 'charset=utf-8';
        ctx.response.body = JSON.stringify(data);
    },

    getGoodsCount: async function(ctx, next) {
        await next();
        var options = {};
        if (ctx.request.query.condition) {
            options.condition = ctx.request.query.condition;
        }
        if (ctx.request.query.categoryId) {
            options.categoryId = Number(ctx.request.query.categoryId);
        }
        var count = await GoodsService.getGoodsCount(options);
        ctx.response.type = 'utf-8';
        ctx.response.body = { success: true, count: count };
    }
};
