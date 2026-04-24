var imageModel = require('../model/ImageModel.ts');

module.exports = {
    // 批量插入
    insertImages: async function(images) {
        return await imageModel.Image.bulkCreate(images);
    },
    findImages: async function(goods_id) {
        return await imageModel.Image.findAll({
            where: {
                goods_id: goods_id
            }
        })
    }
}