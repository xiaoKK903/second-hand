<template>
    <div id="chat-list-page">
        <div class="chat-header">
            <h4 class="page-title">消息</h4>
        </div>

        <div class="session-list" v-if="sessions.length > 0">
            <div 
                class="session-item" 
                v-for="session in sessions" 
                :key="session.session_id"
                @click="goToChat(session)">
                <div class="avatar-wrapper">
                    <div class="user-avatar">
                        <i class="el-icon-user-solid"></i>
                    </div>
                    <el-badge :value="session.unread_count" :hidden="session.unread_count === 0" class="unread-badge">
                    </el-badge>
                </div>
                <div class="session-info">
                    <div class="session-top">
                        <span class="user-name">{{ getUserName(session) }}</span>
                        <span class="last-time">{{ formatTime(session.last_message_time) }}</span>
                    </div>
                    <div class="session-bottom">
                        <span class="last-message">{{ session.last_message || '暂无消息' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="empty-state" v-else>
            <div class="empty-icon">💬</div>
            <div class="empty-text">暂无消息</div>
            <div class="empty-tip">去逛逛，发现心仪的商品吧</div>
            <el-button type="primary" @click="goToHome">
                <i class="el-icon-search"></i>
                去逛逛
            </el-button>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'ChatList',
    data() {
        return {
            sessions: [],
            loading: false
        }
    },
    created() {
        this.loadSessions();
    },
    activated() {
        this.loadSessions();
    },
    methods: {
        loadSessions: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            var that = this;
            this.axios.get('/chat/sessions', { params: { uid: uid } }).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.sessions = res.data.data;
                }
            }, function(err) {
                console.error(err);
            });
        },
        getUserName: function(session) {
            if (session.other_user && session.other_user.nickname) {
                return session.other_user.nickname;
            }
            if (session.other_user && session.other_user.username) {
                var phone = session.other_user.username;
                if (phone.length === 11) {
                    return phone.substring(0, 3) + '****' + phone.substring(7);
                }
                return phone;
            }
            return '用户' + session.other_user_id;
        },
        formatTime: function(date) {
            if (!date) return '';
            var d = new Date(date);
            var now = new Date();
            var diff = now - d;
            
            if (d.toDateString() === now.toDateString()) {
                var hours = d.getHours();
                var minutes = d.getMinutes();
                return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            
            var yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (d.toDateString() === yesterday.toDateString()) {
                return '昨天';
            }
            
            var weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            if (d > weekAgo) {
                var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                return weekdays[d.getDay()];
            }
            
            var month = d.getMonth() + 1;
            var day = d.getDate();
            return month + '月' + day + '日';
        },
        goToChat: function(session) {
            this.$router.push({ 
                path: '/site/chat', 
                query: { 
                    session_id: session.session_id,
                    target_user_id: session.other_user_id
                } 
            });
        },
        goToHome: function() {
            this.$router.push({ path: '/' });
        }
    }
}
</script>

<style lang="stylus" scoped>
#chat-list-page
    background #f5f5f5
    min-height calc(100vh - 80px)
    padding 20px

.chat-header
    margin-bottom 16px

    .page-title
        margin 0
        font-size 18px
        font-weight 600
        color #333

.session-list
    display flex
    flex-direction column
    gap 0

.session-item
    display flex
    align-items center
    gap 12px
    padding 16px
    background #fff
    cursor pointer
    transition all 0.3s
    border-bottom 1px solid #f0f0f0

    &:first-child
        border-radius 12px 12px 0 0

    &:last-child
        border-radius 0 0 12px 12px
        border-bottom none

    &:hover
        background #fafafa

.avatar-wrapper
    position relative
    flex-shrink 0

.user-avatar
    width 56px
    height 56px
    border-radius 50%
    background linear-gradient(135deg, #667eea, #764ba2)
    display flex
    align-items center
    justify-content center

    i
        font-size 24px
        color #fff

.unread-badge
    position absolute
    top -4px
    right -4px

.session-info
    flex 1
    min-width 0
    display flex
    flex-direction column
    gap 6px

.session-top
    display flex
    justify-content space-between
    align-items baseline

.user-name
    font-size 15px
    font-weight 600
    color #333
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    max-width 200px

.last-time
    font-size 12px
    color #999
    flex-shrink 0
    margin-left 8px

.session-bottom
    display flex
    justify-content space-between
    align-items center

.last-message
    font-size 13px
    color #999
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    flex 1

.empty-state
    text-align center
    padding 80px 20px

.empty-icon
    font-size 64px
    margin-bottom 16px

.empty-text
    font-size 16px
    color #333
    margin-bottom 8px

.empty-tip
    font-size 14px
    color #999
    margin-bottom 24px
</style>
