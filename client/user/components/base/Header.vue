<template>
    <div id="header">
        <div class="header-content">
            <div class="img-wrapper">
                <img src="../../../../static/img/logo.png">
            </div>
            <div class="link-wrapper">
                <router-link to="/">首页</router-link>
                <router-link to="/site/recommend">推荐</router-link>
                <router-link to="/site/publish">发布</router-link>
                <router-link to="/site/cart">购物车</router-link>
                <div class="nav-item" @click="goToChatList">
                    <i class="el-icon-chat-dot-round"></i>
                    <span class="nav-text">消息</span>
                    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="chat-badge">
                    </el-badge>
                </div>
                <router-link to="/site/userCenter">我的</router-link>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'HeaderSection',
    data() {
        return {
            unreadCount: 0,
            pollingTimer: null
        }
    },
    created() {
        this.checkUnreadCount();
        this.startPolling();
    },
    beforeDestroy() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
    },
    methods: {
        checkUnreadCount: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.unreadCount = 0;
                return;
            }
            var that = this;
            this.axios.get('/chat/unread', { params: { uid: uid } }).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.unreadCount = res.data.data.count || 0;
                }
            }, function(err) {
                console.error(err);
            });
        },
        startPolling: function() {
            var that = this;
            this.pollingTimer = setInterval(function() {
                that.checkUnreadCount();
            }, 10000);
        },
        goToChatList: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            this.$router.push({ path: '/site/userCenter', query: { tab: 'chat' } });
        }
    }
}
</script>

<style lang="stylus">
    #header
        height 80px;
        background-color #fff;
        border-bottom 1px solid black;
        .header-content
            width 1080px;
            margin 0 auto;
            display flex;
            align-self center;
            .img-wrapper
                flex 10;
                >img
                    height 80px;
            .link-wrapper
                flex 6;
                display flex;
                align-items center;
                .active
                    color blue;
                a
                    font-size 16px;
                    line-height 80px;
                    padding 0 20px;
                    text-decoration none;
                    color #b2bac2;
                a:hover
                    color #007fff;
                .nav-item
                    position relative;
                    display flex;
                    align-items center;
                    gap 4px;
                    padding 0 20px;
                    height 80px;
                    cursor pointer;
                    transition color 0.3s;
                    color #b2bac2;

                    &:hover
                        color #007fff;

                    i
                        font-size 18px;

                    .nav-text
                        font-size 16px;

                    .chat-badge
                        position absolute;
                        top 16px;
                        right 8px;
</style>
