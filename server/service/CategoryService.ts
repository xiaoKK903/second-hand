var categoryModel = require('../model/CategoryModel.ts');

module.exports = {
    // 查询商品种类
    getCategory: async function() {
        return await categoryModel.Category.findAll({
            attributes: ['category_id', 'goods_type']
        });
    },
}