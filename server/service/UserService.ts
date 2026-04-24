var userModel = require('../model/UserModel.ts');
var goodsModel = require('../model/GoodsModel.ts');
var db = require('../config/db.ts');

module.exports = {
    getAllUsers: async function() {
        return await userModel.User.findAll();
    },
    getUserByPhone: async function(phone) {
        return await userModel.User.findAll({
            where: {
                phone_num: phone
            }
        });
    },
    insertUser: async function(phone, password) {
        return await userModel.User.create({
            phone_num: phone,
            password: password
        });
    },
    findUser: async function(uid) {
        return await userModel.User.findAll({
            where: {
                user_id: uid
            }
        });
    },
    updatePass: async function(uid, pass) {
        return await userModel.User.update({ password: pass }, {
            where: {
                user_id: uid
            }
        });
    },
    updateProfile: async function(uid, data) {
        var updateData = {
            updated_at: db.Sequelize.literal('CURRENT_TIMESTAMP')
        };
        
        if (data.nickname !== undefined) {
            updateData.nickname = data.nickname;
        }
        if (data.avatar !== undefined) {
            updateData.avatar = data.avatar;
        }
        if (data.bio !== undefined) {
            updateData.bio = data.bio;
        }
        if (data.contact !== undefined) {
            updateData.contact = data.contact;
        }
        
        return await userModel.User.update(updateData, {
            where: {
                user_id: uid
            }
        });
    },
    getSellerProfile: async function(sellerId) {
        var user = await userModel.User.findOne({
            where: {
                user_id: sellerId
            },
            attributes: ['user_id', 'phone_num', 'nickname', 'avatar', 'bio', 'contact', 'created_at']
        });
        
        if (!user) {
            return null;
        }
        
        var userData = user.toJSON();
        
        var totalGoods = await goodsModel.Goods.count({
            where: {
                user_id: sellerId
            }
        });
        
        var activeGoods = await goodsModel.Goods.count({
            where: {
                user_id: sellerId,
                status: 'active'
            }
        });
        
        var soldGoods = await goodsModel.Goods.count({
            where: {
                user_id: sellerId,
                status: 'sold'
            }
        });
        
        var recentGoods = await goodsModel.Goods.findAll({
            where: {
                user_id: sellerId
            },
            order: [['created_at', 'DESC']],
            limit: 20
        });
        
        var nickname = userData.nickname;
        if (!nickname && userData.phone_num) {
            var phone = userData.phone_num;
            if (phone.length === 11) {
                nickname = phone.substring(0, 3) + '****' + phone.substring(7);
            } else {
                nickname = phone;
            }
        }
        
        return {
            user_id: userData.user_id,
            phone_num: userData.phone_num,
            nickname: nickname,
            avatar: userData.avatar,
            bio: userData.bio,
            contact: userData.contact,
            created_at: userData.created_at,
            total_goods: totalGoods,
            active_goods: activeGoods,
            sold_goods: soldGoods,
            recent_goods: recentGoods.map(function(g) {
                var data = g.toJSON();
                return {
                    goods_id: data.goods_id,
                    goods_name: data.goods_name,
                    goods_image: data.goods_image,
                    goods_price: data.goods_price,
                    original_price: data.original_price,
                    condition: data.condition,
                    tags: data.tags,
                    status: data.status,
                    views: data.views,
                    created_at: data.created_at
                };
            })
        };
    }
};
