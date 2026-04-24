var addressModel = require('../model/AddressModel.ts');
var db = require('../config/db.ts');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize;

module.exports = {
    insertAddress: async function(uid, addressData) {
        var t = await sequelize.transaction();
        try {
            var addressToCreate = {
                user_id: uid,
                name: addressData.name,
                phone_num: addressData.phone_num,
                province: addressData.province || '',
                city: addressData.city || '',
                district: addressData.district || '',
                detail: addressData.detail || '',
                address: addressData.address || (addressData.province + addressData.city + addressData.district + addressData.detail),
                is_default: addressData.is_default || false
            };

            if (addressToCreate.is_default) {
                await addressModel.Address.update(
                    { is_default: false },
                    {
                        where: { user_id: uid },
                        transaction: t
                    }
                );
            }

            var newAddress = await addressModel.Address.create(addressToCreate, {
                transaction: t
            });

            await t.commit();
            return newAddress;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    },

    updateAddress: async function(address_id, addressData) {
        var t = await sequelize.transaction();
        try {
            var existingAddress = await addressModel.Address.findOne({
                where: { address_id: address_id },
                transaction: t
            });

            if (!existingAddress) {
                throw new Error('地址不存在');
            }

            var addressToUpdate = {
                name: addressData.name,
                phone_num: addressData.phone_num,
                province: addressData.province || existingAddress.province,
                city: addressData.city || existingAddress.city,
                district: addressData.district || existingAddress.district,
                detail: addressData.detail || existingAddress.detail,
                address: addressData.address || existingAddress.address,
                is_default: addressData.is_default !== undefined ? addressData.is_default : existingAddress.is_default
            };

            if (addressToUpdate.is_default && addressToUpdate.is_default !== existingAddress.is_default) {
                await addressModel.Address.update(
                    { is_default: false },
                    {
                        where: { user_id: existingAddress.user_id },
                        transaction: t
                    }
                );
            }

            await addressModel.Address.update(
                addressToUpdate,
                {
                    where: { address_id: address_id },
                    transaction: t
                }
            );

            var updatedAddress = await addressModel.Address.findOne({
                where: { address_id: address_id },
                transaction: t
            });

            await t.commit();
            return updatedAddress;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    },

    findAddressById: async function(uid) {
        return await addressModel.Address.findAll({
            where: {
                user_id: uid
            },
            order: [
                ['is_default', 'DESC'],
                ['updated_at', 'DESC']
            ]
        });
    },

    findDefaultAddress: async function(uid) {
        var defaultAddress = await addressModel.Address.findOne({
            where: {
                user_id: uid,
                is_default: true
            }
        });

        if (!defaultAddress) {
            var firstAddress = await addressModel.Address.findOne({
                where: { user_id: uid },
                order: [['updated_at', 'DESC']]
            });
            return firstAddress;
        }

        return defaultAddress;
    },

    setDefaultAddress: async function(address_id, user_id) {
        var t = await sequelize.transaction();
        try {
            await addressModel.Address.update(
                { is_default: false },
                {
                    where: { user_id: user_id },
                    transaction: t
                }
            );

            await addressModel.Address.update(
                { is_default: true },
                {
                    where: { address_id: address_id, user_id: user_id },
                    transaction: t
                }
            );

            await t.commit();
            return true;
        } catch (e) {
            await t.rollback();
            throw e;
        }
    },

    delAddressById: async function(address_id) {
        return await addressModel.Address.destroy({
            where: {
                address_id: address_id
            }
        });
    },

    findAddressByOrderId: async function(address_id) {
        return await addressModel.Address.findAll({
            where: {
                address_id: address_id
            }
        });
    }
}
