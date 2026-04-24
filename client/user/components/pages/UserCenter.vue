<template>
    <div id="user-center">
        <div class="center-content">
            <div class="content-wrapper" v-if="isLogin">
                <div class="user-header">
                    <div class="user-info">
                        <div class="user-avatar">
                            <img :src="user.avatar || '../../../static/img/timg.jpg'" v-if="user.avatar">
                            <img src="../../../static/img/timg.jpg" v-else>
                        </div>
                        <div class="user-detail">
                            <div class="user-name" v-if="user.nickname">{{ user.nickname }}</div>
                            <div class="user-name" v-else-if="user.phone_num">欢迎您，{{ user.phone_num | phoneFilter }}</div>
                            <div class="user-bio" v-if="user.bio">{{ user.bio }}</div>
                            <div class="user-bio" v-else>点击下方功能进入管理</div>
                        </div>
                    </div>
                </div>
                
                <div class="content-area">
                    <div class="menu-section">
                        <div class="menu-title">个人中心</div>
                        <div class="menu-grid">
                            <div class="menu-item" @click="goTo('/userCenter/addressManage')">
                                <div class="menu-icon">
                                    <i class="el-icon-location"></i>
                                </div>
                                <div class="menu-text">地址管理</div>
                            </div>
                            <div class="menu-item" @click="goTo('/userCenter/infoManage', { tab: 'profile' })">
                                <div class="menu-icon">
                                    <i class="el-icon-user"></i>
                                </div>
                                <div class="menu-text">个人资料</div>
                            </div>
                            <div class="menu-item" @click="goTo('/userCenter/infoManage', { tab: 'password' })">
                                <div class="menu-icon">
                                    <i class="el-icon-key"></i>
                                </div>
                                <div class="menu-text">修改密码</div>
                            </div>
                            <div class="menu-item" @click="goTo('/userCenter/feedbackManage')">
                                <div class="menu-icon">
                                    <i class="el-icon-edit"></i>
                                </div>
                                <div class="menu-text">意见反馈</div>
                            </div>
                        </div>
                    </div>

                    <div class="menu-section">
                        <div class="menu-title">我的交易</div>
                        <div class="menu-grid">
                            <div class="menu-item" @click="goTo('orderManage')">
                                <div class="menu-icon">
                                    <i class="el-icon-s-order"></i>
                                </div>
                                <div class="menu-text">我的订单</div>
                            </div>
                            <div class="menu-item" @click="goTo('publisherOrder')">
                                <div class="menu-icon">
                                    <i class="el-icon-money"></i>
                                </div>
                                <div class="menu-text">卖出订单</div>
                            </div>
                            <div class="menu-item" @click="goTo('myGoods')">
                                <div class="menu-icon">
                                    <i class="el-icon-goods"></i>
                                </div>
                                <div class="menu-text">我的发布</div>
                            </div>
                            <div class="menu-item" @click="goTo('chatList')">
                                <div class="menu-icon">
                                    <i class="el-icon-chat-dot-round"></i>
                                </div>
                                <div class="menu-text">我的消息</div>
                            </div>
                        </div>
                    </div>

                    <div class="menu-section">
                        <div class="menu-title">系统功能</div>
                        <div class="menu-grid">
                            <div class="menu-item logout-item" @click="doLogout">
                                <div class="menu-icon">
                                    <i class="el-icon-switch-button"></i>
                                </div>
                                <div class="menu-text">退出登录</div>
                            </div>
                        </div>
                    </div>

                    <div class="router-view-area">
                        <router-view></router-view>
                    </div>
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
        getUserInfo: function() {
            if(this.$cookieStore.getCookie('sid')) {
                var uid = this.$cookieStore.getCookie('sid');
                var that = this;
                this.axios.get('/site/user/' + uid).then(function(res) {
                    if (res.data && res.data.success && res.data.data) {
                        that.user = res.data.data;
                    } else if (res.data && res.data.length && res.data.length > 0) {
                        that.user = res.data[0];
                    }
                }, function(err) {
                    console.error(err);
                })
            }
        },
        goTo: function(path, query) {
            if (path && path.indexOf('/') === 0) {
                this.$router.push({ path: path, query: query });
            } else {
                this.$router.push({ name: path, query: query });
            }
        },
        goLogin: function() {
            this.$router.push({ name: 'login' });
        },
        doLogout: function() {
            var that = this;
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.$cookieStore.delCookie('sid');
                that.isLogin = false;
                that.$message.success('已退出登录');
                that.$router.push({ name: 'login' });
            }).catch(function() {
                // 取消
            });
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
            max-width 800px
            margin 0 auto

        .content-wrapper
            background #fff
            border-radius 12px
            overflow hidden

            .user-header
                background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                padding 30px
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
                        background #fff

                        img
                            width 100%
                            height 100%
                            object-fit cover

                    .user-detail
                        .user-name
                            font-size 20px
                            font-weight 600
                            margin-bottom 8px

                        .user-bio
                            font-size 14px
                            opacity 0.8

        .content-area
            padding 20px

            .menu-section
                margin-bottom 30px

                .menu-title
                    font-size 14px
                    font-weight 600
                    color #666
                    margin-bottom 15px
                    padding-left 5px
                    border-left 3px solid #667eea

                .menu-grid
                    display grid
                    grid-template-columns repeat(4, 1fr)
                    gap 15px

                    @media (max-width 600px)
                        grid-template-columns repeat(2, 1fr)

                    .menu-item
                        display flex
                        flex-direction column
                        align-items center
                        justify-content center
                        padding 20px 10px
                        background #f8f9fa
                        border-radius 12px
                        cursor pointer
                        transition all 0.3s ease

                        &:hover
                            background #eef2ff
                            transform translateY(-2px)
                            box-shadow 0 4px 12px rgba(102, 126, 234, 0.15)

                        .menu-icon
                            width 48px
                            height 48px
                            background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                            border-radius 12px
                            display flex
                            align-items center
                            justify-content center
                            margin-bottom 10px

                            i
                                font-size 24px
                                color #fff

                        .menu-text
                            font-size 13px
                            color #333
                            font-weight 500

                    .logout-item
                        .menu-icon
                            background linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%)

            .router-view-area
                margin-top 20px
                padding-top 20px
                border-top 1px dashed #e8e8e8

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
