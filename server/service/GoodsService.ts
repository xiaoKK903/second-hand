var goodsModel = require('../model/GoodsModel.ts');
var db = require('../config/db.ts');

var CONDITIONS = ['全新', '99新', '95新', '轻微使用', '成色一般'];
var TAGS = ['包邮', '可小刀', '自提', '价格面议', '支持自提', '可租可买'];

module.exports = {
    CONDITIONS: CONDITIONS,
    TAGS: TAGS,

    getAllGoods: async function(options) {
        if (options === undefined) options = {};
        var where = { status: 'active', audit_status: 'approved' };
        if (options.condition) {
            where.condition = options.condition;
        }
        if (options.categoryId) {
            where.category_id = options.categoryId;
        }
        if (options.minPrice !== undefined) {
            where.goods_price = {};
            where.goods_price[db.Op.gte] = options.minPrice;
        }
        if (options.maxPrice !== undefined) {
            if (where.goods_price) {
                where.goods_price[db.Op.lte] = options.maxPrice;
            } else {
                where.goods_price = {};
                where.goods_price[db.Op.lte] = options.maxPrice;
            }
        }
        return await goodsModel.Goods.findAll({
            where: where,
            order: [['created_at', 'DESC']]
        });
    },

    publishGoods: async function(data) {
        var goodsData = {
            goods_name: data.name,
            goods_price: data.price,
            original_price: data.originalPrice || null,
            count: data.num || 1,
            goods_desc: data.desc,
            goods_image: data.imageUrl || (data.goods_images && data.goods_images[0]) || '',
            goods_images: data.goods_images || [],
            category_id: data.categoryId,
            user_id: data.uid,
            condition: data.condition || '轻微使用',
            tags: data.tags || [],
            status: 'active',
            audit_status: 'approved',
            views: 0
        };
        return await goodsModel.Goods.create(goodsData);
    },

    searchGoods: async function(keyword, options) {
        if (options === undefined) options = {};
        var where = {
            status: 'active',
            audit_status: 'approved'
        };
        where[db.Op.or] = [
            { goods_name: {} },
            { goods_desc: {} }
        ];
        where[db.Op.or][0].goods_name[db.Op.like] = '%' + keyword + '%';
        where[db.Op.or][1].goods_desc[db.Op.like] = '%' + keyword + '%';
        
        if (options.condition) {
            where.condition = options.condition;
        }
        if (options.categoryId) {
            where.category_id = options.categoryId;
        }
        if (options.minPrice !== undefined) {
            where.goods_price = {};
            where.goods_price[db.Op.gte] = options.minPrice;
        }
        if (options.maxPrice !== undefined) {
            if (where.goods_price) {
                where.goods_price[db.Op.lte] = options.maxPrice;
            } else {
                where.goods_price = {};
                where.goods_price[db.Op.lte] = options.maxPrice;
            }
        }
        return await goodsModel.Goods.findAll({
            where: where,
            order: [['created_at', 'DESC']]
        });
    },

    getGoodsByPage: async function(currentPage, pageSize, options) {
        if (options === undefined) options = {};
        var offset = (currentPage - 1) * pageSize;
        var where = { status: 'active', audit_status: 'approved' };
        if (options.condition) {
            where.condition = options.condition;
        }
        if (options.categoryId) {
            where.category_id = options.categoryId;
        }
        return await goodsModel.Goods.findAll({
            where: where,
            offset: offset,
            limit: pageSize,
            order: [['created_at', 'DESC']]
        });
    },

    getGoodsById: async function(goods_id, incrementViews) {
        if (incrementViews === undefined) incrementViews = true;
        var goods = await goodsModel.Goods.findOne({
            where: { goods_id: goods_id }
        });
        if (goods && incrementViews) {
            await goods.increment('views', { by: 1 });
            await goods.reload();
        }
        return goods ? [goods] : [];
    },

    getCategoryById: async function(categoryId, options) {
        if (options === undefined) options = {};
        var where = { category_id: categoryId, status: 'active', audit_status: 'approved' };
        if (options.condition) {
            where.condition = options.condition;
        }
        return await goodsModel.Goods.findAll({
            where: where,
            order: [['created_at', 'DESC']]
        });
    },

    getRecommendGoods: async function(categoryId, limit) {
        if (categoryId === undefined) categoryId = null;
        if (limit === undefined) limit = 40;
        var where = { status: 'active', audit_status: 'approved' };
        if (categoryId) {
            where.category_id = categoryId;
        }
        return await goodsModel.Goods.findAll({
            where: where,
            limit: limit,
            order: db.Sequelize.literal('RAND()')
        });
    },

    updateGoodsCount: async function(goods_id, count) {
        if (count) {
            return await goodsModel.Goods.update(
                { count: count },
                { where: { goods_id: goods_id } }
            );
        } else {
            return await goodsModel.Goods.update(
                { status: 'sold' },
                { where: { goods_id: goods_id } }
            );
        }
    },

    getMyGoods: async function(user_id, status) {
        var where = { user_id: user_id };
        if (status) {
            where.status = status;
        }
        return await goodsModel.Goods.findAll({
            where: where,
            order: [['created_at', 'DESC']]
        });
    },

    updateGoodsStatus: async function(goods_id, user_id, status) {
        return await goodsModel.Goods.update(
            { status: status, updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP') },
            { where: { goods_id: goods_id, user_id: user_id } }
        );
    },

    deleteGoods: async function(goods_id, user_id) {
        return await goodsModel.Goods.destroy({
            where: { goods_id: goods_id, user_id: user_id }
        });
    },

    updateGoods: async function(goods_id, user_id, data) {
        var updateData = { updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP') };
        if (data.name !== undefined) updateData.goods_name = data.name;
        if (data.price !== undefined) updateData.goods_price = data.price;
        if (data.originalPrice !== undefined) updateData.original_price = data.originalPrice;
        if (data.num !== undefined) updateData.count = data.num;
        if (data.desc !== undefined) updateData.goods_desc = data.desc;
        if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
        if (data.condition !== undefined) updateData.condition = data.condition;
        if (data.tags !== undefined) updateData.tags = data.tags;
        if (data.goods_images !== undefined) {
            updateData.goods_images = data.goods_images;
            if (data.goods_images.length > 0) {
                updateData.goods_image = data.goods_images[0];
            }
        }
        return await goodsModel.Goods.update(
            updateData,
            { where: { goods_id: goods_id, user_id: user_id } }
        );
    },

    getGoodsByCondition: async function(condition) {
        return await goodsModel.Goods.findAll({
            where: { condition: condition, status: 'active', audit_status: 'approved' },
            order: [['created_at', 'DESC']]
        });
    },

    getGoodsCount: async function(options) {
        if (options === undefined) options = {};
        var where = { status: 'active', audit_status: 'approved' };
        if (options.condition) {
            where.condition = options.condition;
        }
        if (options.categoryId) {
            where.category_id = options.categoryId;
        }
        return await goodsModel.Goods.count({ where: where });
    }
};
