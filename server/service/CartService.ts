var cartModel = require('../model/CartModel.ts');

module.exports = {
    // 添加到购物车
    addToCart: async function(uid, gid, count) {
        return await cartModel.Cart.create({
            user_id: uid,
            goods_id: gid,
            count: count
        })
    },
    // 获取用户购物车
    getUserCart: async function(uid) {
        return await cartModel.Cart.findAll({
            where: {
                user_id: uid
            }
        })
    },
    // 修改购物车商品数量
    changeCartCount: async function(gid, count) {
        return await cartModel.Cart.update({
            count: count
        }, {
            where: {
                goods_id: gid
            }
        })
    },
    // 删除商品
    delCartGoods: async function(cart_id) {
        return await cartModel.Cart.destroy({
            where: {
                cart_id: cart_id
            }
        })
    },
    // 根据user_id和goods_id删除
    delCart: async function(user_id, goods_id) {
        return await cartModel.Cart.destroy({
            where: {
                user_id: user_id,
                goods_id: goods_id
            }
        })
    }
}