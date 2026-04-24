<template>
    <div id="admin-login">
        <div class="login-container">
            <div class="login-header">
                <h1 class="login-title">
                    <i class="el-icon-s-tools"></i>
                    管理后台
                </h1>
                <p class="login-subtitle">校园闲置交易平台管理系统</p>
            </div>
            
            <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form">
                <el-form-item prop="phone">
                    <el-input
                        v-model="loginForm.phone"
                        placeholder="管理员账号"
                        prefix-icon="el-icon-user"
                        size="large">
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        v-model="loginForm.password"
                        placeholder="密码"
                        prefix-icon="el-icon-lock"
                        size="large"
                        @keyup.enter.native="handleLogin">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button 
                        type="primary" 
                        size="large" 
                        :loading="loading" 
                        class="login-btn"
                        @click="handleLogin">
                        <i class="el-icon-s-opportunity"></i>
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
            
            <div class="login-footer">
                <p>默认管理员账号: admin123 / admin123</p>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'AdminLogin',
    data: function() {
        var validatePhone = function(rule, value, callback) {
            if (!value) {
                callback(new Error('请输入管理员账号'));
            } else {
                callback();
            }
        };
        var validatePass = function(rule, value, callback) {
            if (!value) {
                callback(new Error('请输入密码'));
            } else {
                callback();
            }
        };
        
        return {
            loginForm: {
                phone: '',
                password: ''
            },
            loginRules: {
                phone: [
                    { validator: validatePhone, trigger: 'blur' }
                ],
                password: [
                    { validator: validatePass, trigger: 'blur' }
                ]
            },
            loading: false
        }
    },
    methods: {
        handleLogin: function() {
            var that = this;
            this.$refs.loginForm.validate(function(valid) {
                if (valid) {
                    that.loading = true;
                    
                    that.axios.post('/site/login', {
                        phone: that.loginForm.phone,
                        password: that.loginForm.password
                    }).then(function(res) {
                        that.loading = false;
                        
                        if (res.data && res.data.success) {
                            var uid = res.data.sid;
                            var user = res.data.user;
                            
                            if (user && user.role === 'admin') {
                                that.$cookieStore.setCookie('admin_uid', uid, 86400000);
                                that.$message({
                                    message: '登录成功，正在进入管理后台...',
                                    type: 'success'
                                });
                                setTimeout(function() {
                                    that.$router.push({ name: 'adminDashboard' });
                                }, 500);
                            } else {
                                that.checkAdminPermission(uid);
                            }
                        } else {
                            that.$message({
                                message: res.data.msg || '登录失败',
                                type: 'error'
                            });
                        }
                    }, function(err) {
                        that.loading = false;
                        console.error(err);
                        that.$message({
                            message: '登录失败，请稍后重试',
                            type: 'error'
                        });
                    });
                }
            });
        },
        
        checkAdminPermission: function(uid) {
            var that = this;
            this.axios.post('/admin/check', {
                uid: uid
            }).then(function(res) {
                if (res.data && res.data.success && res.data.data && res.data.data.is_admin) {
                    that.$cookieStore.setCookie('admin_uid', uid, 86400000);
                    that.$message({
                        message: '登录成功，正在进入管理后台...',
                        type: 'success'
                    });
                    setTimeout(function() {
                        that.$router.push({ name: 'adminDashboard' });
                    }, 500);
                } else {
                    that.$cookieStore.delCookie('admin_uid');
                    that.$message({
                        message: '该账号无管理员权限',
                        type: 'warning'
                    });
                }
            }, function(err) {
                console.error(err);
                that.$message({
                    message: '权限验证失败',
                    type: 'error'
                });
            });
        }
    }
}
</script>

<style lang="stylus" scoped>
#admin-login
    min-height 100vh
    background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    display flex
    align-items center
    justify-content center

.login-container
    width 420px
    background #fff
    border-radius 12px
    box-shadow 0 20px 60px rgba(0, 0, 0, 0.3)
    padding 40px

.login-header
    text-align center
    margin-bottom 30px

.login-title
    font-size 28px
    font-weight 700
    color #333
    margin 0 0 10px 0
    display flex
    align-items center
    justify-content center
    gap 10px

    i
        color #667eea

.login-subtitle
    font-size 14px
    color #999
    margin 0

.login-form
    padding 0 20px

.login-btn
    width 100%
    background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    border none
    border-radius 8px
    font-size 16px
    font-weight 600

    &:hover
        background linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)

.login-footer
    text-align center
    margin-top 20px
    padding-top 20px
    border-top 1px solid #f0f0f0

    p
        font-size 12px
        color #999
        margin 0

>>> .el-input__inner
    border-radius 8px
    height 48px
    line-height 48px

>>> .el-form-item
    margin-bottom 24px
</style>
