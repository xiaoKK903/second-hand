<template>
    <div id="user-center">
        <div class="center-content">
            <div class="content-wrapper" v-if="isLogin">
                <div class="user-header">
                    <div class="user-info">
                        <div class="user-avatar">
                            <img src="../../../../static/img/timg.jpg">
                        </div>
                        <div class="user-detail">
                            <div class="user-name" v-if="user.phone_num">欢迎您，{{ user.phone_num | phoneFilter }}</div>
                            <el-dropdown @command="handleCommand">
                                <span class="el-dropdown-link">
                                    个人中心 <i class="el-icon-arrow-down el-icon--right"></i>
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="7">消息</el-dropdown-item>
                                    <el-dropdown-item command="0">地址管理</el-dropdown-item>
                                    <el-dropdown-item command="1">订单管理</el-dropdown-item>
                                    <el-dropdown-item command="2">我的发布</el-dropdown-item>
                                    <el-dropdown-item command="3">发布管理</el-dropdown-item>
                                    <el-dropdown-item command="8">个人资料</el-dropdown-item>
                                    <el-dropdown-item command="4">修改密码</el-dropdown-item>
                                    <el-dropdown-item command="5">反馈</el-dropdown-item>
                                    <el-dropdown-item command="6">退出</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </div>
                </div>
                <div class="content-area">
                    <router-view></router-view>
                </div>
            </div>
            <div class="login-prompt" v-else>
                <div class="prompt-icon">🔒</div>
                <div class="prompt-text">您还未登录，请先登录</div>
                <el-button type="primary" @click="goLogin">去登录</el-button>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
import Login from '../pages/Login.vue';

export default {
    data: function() {
        return {
            user: {},
            isLogin: this.$cookieStore.getCookie('sid')
        }
    },
    components: {
        'login-input': Login
    },
    created: function() {
        var that = this;
        if(this.$cookieStore.getCookie('sid')) {
            this.getUserInfo();
        } else {
            this.$confirm('您还未登录, 是否去登录?', '提示', {
                confirmButtonText: '确定',
                type: 'warning'
            }).then(function() {
                that.$router.push({ name: 'login' });
            }).catch(function() {
                that.$router.push({ name: 'login' });
            });
        }
    },
    methods: {
        handleCommand: function(command) {
            var c = Number(command);
            switch(c) {
                case 0: 
                    this.$router.push({ path: '/userCenter/addressManage' });
                    break;
                case 1:
                    this.$router.push({ name: 'orderManage' });
                    break;
                case 2:
                    this.$router.push({ name: 'myGoods' });
                    break;
                case 3:
                    this.$router.push({ name: 'publisherOrder' });
                    break;
                case 4:
                    this.$router.push({ path: '/userCenter/infoManage', query: { tab: 'password' } });
                    break;
                case 5:
                    this.$router.push({ path: '/userCenter/feedbackManage' });
                    break;
                case 6:
                    this.$cookieStore.delCookie('sid');
                    this.isLogin = false;
                    this.$router.push({ name: 'login' });
                    break;
                case 7:
                    this.$router.push({ name: 'chatList' });
                    break;
                case 8:
                    this.$router.push({ path: '/userCenter/infoManage', query: { tab: 'profile' } });
                    break;
                default:
                    break;
            }
        },
        getUserInfo: function() {
            if(this.$cookieStore.getCookie('sid')) {
                var uid = this.$cookieStore.getCookie('sid');
                var that = this;
                this.axios.get('/site/user/' + uid).then(function(res) {
                    that.user = res.data[0];
                }, function(err) {
                    console.error(err);
                })
            }
        },
        goLogin: function() {
            this.$router.push({ name: 'login' });
        }
    }
}
</script>

<style lang="stylus">
    #user-center
        min-height calc(100vh - 60px)
        background-color #f5f5f5
        padding 20px

        .center-content
            max-width 1200px
            margin 0 auto

        .content-wrapper
            background #fff
            border-radius 8px
            min-height 600px

            .user-header
                background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                padding 30px
                border-radius 8px 8px 0 0
                color #fff

                .user-info
                    display flex
                    align-items center
                    gap 20px

                    .user-avatar
                        width 80px
                        height 80px
                        border-radius 50%
                        border 3px solid rgba(255,255,255,0.3)
                        overflow hidden

                        img
                            width 100%
                            height 100%
                            object-fit cover

                    .user-detail
                        .user-name
                            font-size 20px
                            font-weight 600
                            margin-bottom 10px

                        .el-dropdown-link
                            cursor pointer
                            color #fff
                            font-size 14px
                            opacity 0.9

                            &:hover
                                opacity 1

        .content-area
            padding 0
            min-height 500px

    .login-prompt
        display flex
        flex-direction column
        align-items center
        justify-content center
        min-height 400px
        background #fff
        border-radius 8px
        padding 40px

        .prompt-icon
            font-size 64px
            margin-bottom 20px

        .prompt-text
            font-size 16px
            color #999
            margin-bottom 24px
</style>
