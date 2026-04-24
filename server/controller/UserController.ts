var UserService = require('../service/UserService.ts');
var tools = require('../config/tools.ts');

module.exports = {
    doLogin: async function(ctx, next) {
        await next();
        var phone = ctx.request.body.phone;
        var password = ctx.request.body.password;
        var data = await UserService.getUserByPhone(phone);
        if (data.length) {
            var user = data[0].dataValues;
            if (user.phone_num === phone && tools.debcrypt(password, user.password)) {
                var sid = ctx.cookies.get('sid');
                if (ctx.cookies.get('sid')) {
                } else {
                    ctx.session.sid = user.user_id;
                    ctx.cookies.set('sid', ctx.session.sid, {
                        domain: 'localhost',
                        path: '/',
                        maxAge: 86400000,
                        overwrite: false,
                        httpOnly: false
                    });
                    sid = ctx.session.sid;
                }
                ctx.response.type = 'charset=utf-8';
                
                var nickname = user.nickname;
                if (!nickname && user.phone_num) {
                    var phoneNum = user.phone_num;
                    if (phoneNum.length === 11) {
                        nickname = phoneNum.substring(0, 3) + '****' + phoneNum.substring(7);
                    } else {
                        nickname = phoneNum;
                    }
                }
                
                ctx.response.body = {
                    success: true,
                    msg: '登录成功！',
                    sid: sid,
                    user: {
                        user_id: user.user_id,
                        phone_num: user.phone_num,
                        nickname: nickname,
                        avatar: user.avatar,
                        bio: user.bio,
                        contact: user.contact
                    }
                };
            } else {
                ctx.response.type = 'charset=utf-8';
                ctx.response.body = { success: false, msg: '账号或密码错误！' };
            }
        } else {
            ctx.response.type = 'charset=utf-8';
            ctx.response.body = { success: false, msg: '账号不存在！' };
        }
    },
    
    doRegister: async function(ctx, next) {
        await next();
        var phone = ctx.request.body.phone;
        var password = ctx.request.body.password;
        var data = await UserService.getUserByPhone(phone);
        if (data.length) {
            ctx.response.type = 'charset=utf-8';
            ctx.response.body = { success: false, msg: '该账号已存在！' };
        } else {
            var ret = await UserService.insertUser(phone, tools.enbcrypt(password));
            ctx.response.type = 'charset=utf-8';
            ctx.response.body = { success: true, msg: '注册成功！', data: ret };
        }
    },
    
    getUserById: async function(ctx, next) {
        await next();
        var uid = ctx.params.uid;
        var data = await UserService.findUser(uid);
        
        if (data && data.length > 0) {
            var user = data[0].dataValues;
            var nickname = user.nickname;
            if (!nickname && user.phone_num) {
                var phone = user.phone_num;
                if (phone.length === 11) {
                    nickname = phone.substring(0, 3) + '****' + phone.substring(7);
                } else {
                    nickname = phone;
                }
            }
            
            ctx.response.type = 'utf-8';
            ctx.response.body = {
                success: true,
                data: {
                    user_id: user.user_id,
                    phone_num: user.phone_num,
                    nickname: nickname,
                    avatar: user.avatar,
                    bio: user.bio,
                    contact: user.contact
                }
            };
        } else {
            ctx.response.type = 'utf-8';
            ctx.response.body = { success: false, msg: '用户不存在' };
        }
    },
    
    updatePass: async function(ctx, next) {
        await next();
        var uid = ctx.request.body.uid;
        var form = ctx.request.body.form;
        var data = await UserService.findUser(uid);
        var user = data[0].dataValues;
        if (tools.debcrypt(form.pass, user.password)) {
            var result = await UserService.updatePass(uid, tools.enbcrypt(form.checkPass));
            ctx.response.type = 'utf-8';
            ctx.response.body = result;
        } else {
            ctx.response.type = 'utf-8';
            ctx.response.body = 201;
        }
    },
    
    updateProfile: async function(ctx, next) {
        await next();
        try {
            var uid = ctx.request.body.uid;
            if (!uid) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '请先登录' };
                return;
            }
            
            var updateData = {};
            if (ctx.request.body.nickname !== undefined) {
                updateData.nickname = ctx.request.body.nickname;
            }
            if (ctx.request.body.avatar !== undefined) {
                updateData.avatar = ctx.request.body.avatar;
            }
            if (ctx.request.body.bio !== undefined) {
                updateData.bio = ctx.request.body.bio;
            }
            if (ctx.request.body.contact !== undefined) {
                updateData.contact = ctx.request.body.contact;
            }
            
            console.log('updateProfile called:', { uid: uid, data: updateData });
            
            var result = await UserService.updateProfile(uid, updateData);
            
            console.log('updateProfile result:', result);
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: result[0] > 0,
                msg: result[0] > 0 ? '更新成功' : '更新失败或无变化',
                affected: result[0]
            };
        } catch (e) {
            console.error('updateProfile error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误: ' + e.message };
        }
    },
    
    getSellerProfile: async function(ctx, next) {
        await next();
        try {
            var userId = ctx.params.user_id;
            if (!userId) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '缺少用户ID' };
                return;
            }
            
            var profile = await UserService.getSellerProfile(userId);
            
            if (!profile) {
                ctx.response.type = 'application/json';
                ctx.response.body = { success: false, msg: '用户不存在' };
                return;
            }
            
            ctx.response.type = 'application/json';
            ctx.response.body = {
                success: true,
                data: profile
            };
        } catch (e) {
            console.error('getSellerProfile error:', e);
            ctx.response.type = 'application/json';
            ctx.response.body = { success: false, msg: '服务器错误' };
        }
    }
};
