var AddressService = require('../service/AddressService.ts');

module.exports = {
    addAddress: async function(ctx, next) {
        await next();
        try {
            var body = ctx.request.body;
            var uid = body.uid;
            var name = body.name;
            var phone = body.phone;
            var province = body.province || '';
            var city = body.city || '';
            var district = body.district || '';
            var detail = body.detail || '';
            var address = body.address || (province + city + district + detail);
            var is_default = body.is_default || false;

            var data = await AddressService.insertAddress(uid, {
                name: name,
                phone_num: phone,
                province: province,
                city: city,
                district: district,
                detail: detail,
                address: address,
                is_default: is_default
            });

            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: data,
                msg: '添加成功'
            };
        } catch (e) {
            console.error('addAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: false,
                msg: '添加失败：' + e.message
            };
        }
    },

    updateAddress: async function(ctx, next) {
        await next();
        try {
            var body = ctx.request.body;
            var address_id = body.address_id;
            var name = body.name;
            var phone = body.phone;
            var province = body.province || '';
            var city = body.city || '';
            var district = body.district || '';
            var detail = body.detail || '';
            var address = body.address || (province + city + district + detail);
            var is_default = body.is_default || false;

            var data = await AddressService.updateAddress(address_id, {
                name: name,
                phone_num: phone,
                province: province,
                city: city,
                district: district,
                detail: detail,
                address: address,
                is_default: is_default
            });

            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: data,
                msg: '更新成功'
            };
        } catch (e) {
            console.error('updateAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: false,
                msg: '更新失败：' + e.message
            };
        }
    },

    getAddress: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.params.uid;
            var data = await AddressService.findAddressById(uid);
            ctx.response.type = 'utf-8';
            ctx.response.body = data;
        } catch (e) {
            console.error('getAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = [];
        }
    },

    getDefaultAddress: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.params.uid;
            var data = await AddressService.findDefaultAddress(uid);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: data
            };
        } catch (e) {
            console.error('getDefaultAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: false,
                data: null,
                msg: e.message
            };
        }
    },

    setDefaultAddress: async function(ctx, next) {
        await next();
        try {
            var body = ctx.request.body;
            var address_id = body.address_id;
            var user_id = body.user_id;

            var data = await AddressService.setDefaultAddress(address_id, user_id);

            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: data,
                msg: '设置成功'
            };
        } catch (e) {
            console.error('setDefaultAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: false,
                msg: '设置失败：' + e.message
            };
        }
    },

    delAddress: async function(ctx, next) {
        await next();
        try {
            var address_id = ctx.request.body.address_id;
            var data = await AddressService.delAddressById(address_id);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: data,
                msg: '删除成功'
            };
        } catch (e) {
            console.error('delAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: false,
                msg: '删除失败：' + e.message
            };
        }
    },

    getReceiverAddress: async function(ctx, next) {
        await next();
        try {
            var address_id = Number(ctx.params.aid);
            var data = await AddressService.findAddressByOrderId(address_id);
            ctx.response.type = 'utf-8';
            ctx.response.body = data;
        } catch (e) {
            console.error('getReceiverAddress error:', e);
            ctx.response.type = 'utf-8';
            ctx.response.body = [];
        }
    }
}
