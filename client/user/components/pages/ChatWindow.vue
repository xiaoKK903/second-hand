<template>
    <div id="chat-window-page">
        <div class="chat-header">
            <div class="header-left" @click="goBack">
                <i class="el-icon-arrow-left"></i>
            </div>
            <div class="header-title">
                <span>{{ chatUserName }}</span>
            </div>
            <div class="header-right">
                <i class="el-icon-more"></i>
            </div>
        </div>

        <div class="chat-content" ref="chatContent">
            <div class="messages-container">
                <div 
                    class="message-item" 
                    v-for="(msg, index) in messages" 
                    :key="msg.message_id || index"
                    :class="{ 'message-self': isSelfMessage(msg) }">
                    
                    <div class="message-avatar" v-if="!isSelfMessage(msg)">
                        <div class="avatar-circle">
                            <i class="el-icon-user-solid"></i>
                        </div>
                    </div>
                    
                    <div class="message-content-wrapper">
                        <div class="message-time" v-if="shouldShowTime(index)">
                            <span class="time-text">{{ formatMessageTime(msg.created_at) }}</span>
                        </div>
                        
                        <div class="message-bubble" :class="{ 'goods-card': msg.msg_type === 'goods_card' }">
                            <template v-if="msg.msg_type === 'text'">
                                <div class="message-text">{{ msg.content }}</div>
                            </template>
                            
                            <template v-else-if="msg.msg_type === 'goods_card'">
                                <div class="goods-card-item" @click="goToGoodsDetail(msg.goods_id)">
                                    <div class="goods-img" v-if="msg.goods && msg.goods.goods_image">
                                        <img :src="msg.goods.goods_image" :alt="msg.goods.goods_name">
                                    </div>
                                    <div class="goods-img" v-else>
                                        <i class="el-icon-picture"></i>
                                    </div>
                                    <div class="goods-info">
                                        <div class="goods-name">{{ msg.goods ? msg.goods.goods_name : '商品信息' }}</div>
                                        <div class="goods-price">
                                            <span class="price-symbol">¥</span>
                                            <span class="price-value">{{ msg.goods ? formatPrice(msg.goods.goods_price) : '--' }}</span>
                                        </div>
                                    </div>
                                    <div class="card-arrow">
                                        <i class="el-icon-arrow-right"></i>
                                    </div>
                                </div>
                            </template>
                        </div>
                        
                        <div class="message-status" v-if="isSelfMessage(msg) && !msg.is_read">
                            <span class="unread-tag">未读</span>
                        </div>
                    </div>
                    
                    <div class="message-avatar" v-if="isSelfMessage(msg)">
                        <div class="avatar-circle self-avatar">
                            <i class="el-icon-user-solid"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="chat-input-area">
            <div class="input-toolbar">
                <div class="toolbar-item" @click="showEmojiPicker = !showEmojiPicker">
                    <i class="el-icon-smile"></i>
                </div>
                <div class="toolbar-item" @click="sendGoodsCard" v-if="currentGoodsId">
                    <i class="el-icon-goods"></i>
                    <span class="toolbar-text">发送商品</span>
                </div>
            </div>
            
            <div class="input-row">
                <div class="input-wrapper">
                    <el-input
                        v-model="inputMessage"
                        type="textarea"
                        :rows="1"
                        placeholder="输入消息..."
                        resize="none"
                        @keyup.enter.native="handleEnter"
                        ref="messageInput">
                    </el-input>
                </div>
                <el-button 
                    type="primary" 
                    :disabled="!inputMessage.trim()" 
                    @click="sendMessage"
                    class="send-btn">
                    发送
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'ChatWindow',
    data() {
        return {
            session_id: null,
            target_user_id: null,
            current_user_id: null,
            messages: [],
            inputMessage: '',
            chatUserName: '聊天',
            showEmojiPicker: false,
            currentGoodsId: null,
            goodsInfo: null,
            loading: false,
            pollingTimer: null
        }
    },
    created() {
        this.initChat();
    },
    mounted() {
        this.scrollToBottom();
    },
    beforeDestroy() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
    },
    methods: {
        initChat: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            this.current_user_id = Number(uid);
            
            this.session_id = this.$route.query.session_id;
            this.target_user_id = this.$route.query.target_user_id;
            this.currentGoodsId = this.$route.query.goods_id;
            
            var goodsName = this.$route.query.goods_name;
            if (goodsName) {
                this.goodsInfo = {
                    goods_id: this.currentGoodsId,
                    goods_name: goodsName,
                    goods_price: this.$route.query.goods_price,
                    goods_image: this.$route.query.goods_image
                };
            }
            
            var targetName = this.$route.query.target_name;
            if (targetName) {
                this.chatUserName = targetName;
            } else {
                this.chatUserName = '用户' + this.target_user_id;
            }
            
            this.loadMessages();
            this.startPolling();
        },
        
        loadMessages: function() {
            var that = this;
            var uid = this.$cookieStore.getCookie('sid');
            
            if (this.session_id) {
                this.axios.get('/chat/session/' + this.session_id + '/messages', { 
                    params: { uid: uid } 
                }).then(function(res) {
                    if (res.data && res.data.success && res.data.data) {
                        that.messages = res.data.data;
                        that.$nextTick(function() {
                            that.scrollToBottom();
                        });
                    }
                }, function(err) {
                    console.error(err);
                });
            }
        },
        
        startPolling: function() {
            var that = this;
            this.pollingTimer = setInterval(function() {
                that.loadMessages();
            }, 3000);
        },
        
        scrollToBottom: function() {
            var container = this.$refs.chatContent;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },
        
        isSelfMessage: function(msg) {
            return msg.sender_id === this.current_user_id;
        },
        
        shouldShowTime: function(index) {
            if (index === 0) return true;
            var currentMsg = this.messages[index];
            var prevMsg = this.messages[index - 1];
            if (!currentMsg.created_at || !prevMsg.created_at) return false;
            var currentTime = new Date(currentMsg.created_at).getTime();
            var prevTime = new Date(prevMsg.created_at).getTime();
            return currentTime - prevTime > 5 * 60 * 1000;
        },
        
        formatMessageTime: function(date) {
            if (!date) return '';
            var d = new Date(date);
            var now = new Date();
            
            if (d.toDateString() === now.toDateString()) {
                var hours = d.getHours();
                var minutes = d.getMinutes();
                return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            
            var yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (d.toDateString() === yesterday.toDateString()) {
                var hours = d.getHours();
                var minutes = d.getMinutes();
                return '昨天 ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
            }
            
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var hours = d.getHours();
            var minutes = d.getMinutes();
            return month + '月' + day + '日 ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
        },
        
        formatPrice: function(price) {
            if (price === null || price === undefined) return '0';
            var num = Number(price);
            if (num === Math.floor(num)) {
                return num.toString();
            }
            return num.toFixed(2);
        },
        
        handleEnter: function(e) {
            if (e.shiftKey) return;
            e.preventDefault();
            this.sendMessage();
        },
        
        sendMessage: function() {
            if (!this.inputMessage.trim()) return;
            
            var that = this;
            var uid = this.$cookieStore.getCookie('sid');
            var content = this.inputMessage.trim();
            
            var sendData = {
                uid: uid,
                receiver_id: this.target_user_id,
                content: content,
                msg_type: 'text'
            };
            
            if (this.session_id) {
                sendData.session_id = this.session_id;
            }
            
            this.axios.post('/chat/message', sendData).then(function(res) {
                if (res.data && res.data.success) {
                    that.inputMessage = '';
                    that.loadMessages();
                }
            }, function(err) {
                console.error(err);
                that.$message.error('发送失败');
            });
        },
        
        sendGoodsCard: function() {
            if (!this.currentGoodsId || !this.goodsInfo) {
                this.$message.warning('没有可发送的商品');
                return;
            }
            
            var that = this;
            var uid = this.$cookieStore.getCookie('sid');
            
            var sendData = {
                uid: uid,
                receiver_id: this.target_user_id,
                content: '[商品卡片] ' + this.goodsInfo.goods_name,
                msg_type: 'goods_card',
                goods_id: this.currentGoodsId
            };
            
            if (this.session_id) {
                sendData.session_id = this.session_id;
            }
            
            this.axios.post('/chat/message', sendData).then(function(res) {
                if (res.data && res.data.success) {
                    that.$message.success('商品卡片已发送');
                    that.loadMessages();
                }
            }, function(err) {
                console.error(err);
                that.$message.error('发送失败');
            });
        },
        
        goBack: function() {
            if (this.$route.query.from === 'detail') {
                this.$router.go(-1);
            } else {
                this.$router.push({ path: '/site/userCenter', query: { tab: 'chat' } });
            }
        },
        
        goToGoodsDetail: function(goodsId) {
            if (goodsId) {
                this.$router.push({ path: '/site/goodsDetail', query: { id: goodsId } });
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
#chat-window-page
    display flex
    flex-direction column
    height 100vh
    background #f5f5f5

.chat-header
    display flex
    align-items center
    justify-content space-between
    padding 12px 16px
    background #fff
    border-bottom 1px solid #f0f0f0
    position sticky
    top 0
    z-index 100

    .header-left
        width 40px
        height 40px
        display flex
        align-items center
        justify-content center
        cursor pointer

        i
            font-size 18px
            color #333

    .header-title
        flex 1
        text-align center
        font-size 16px
        font-weight 600
        color #333

    .header-right
        width 40px
        height 40px
        display flex
        align-items center
        justify-content center
        cursor pointer

        i
            font-size 18px
            color #333

.chat-content
    flex 1
    overflow-y auto
    padding 16px
    background #f5f5f5

.messages-container
    display flex
    flex-direction column
    gap 16px

.message-item
    display flex
    gap 12px
    align-items flex-start

    &.message-self
        flex-direction row-reverse

.message-avatar
    flex-shrink 0

.avatar-circle
    width 40px
    height 40px
    border-radius 50%
    background linear-gradient(135deg, #667eea, #764ba2)
    display flex
    align-items center
    justify-content center

    &.self-avatar
        background linear-gradient(135deg, #ff6b35, #ff4d4f)

    i
        font-size 18px
        color #fff

.message-content-wrapper
    display flex
    flex-direction column
    max-width 70%
    min-width 0

    .message-self &
        align-items flex-end

.message-time
    text-align center
    margin-bottom 8px

.time-text
    display inline-block
    padding 4px 12px
    background rgba(0, 0, 0, 0.1)
    border-radius 12px
    font-size 12px
    color #999

.message-bubble
    padding 12px 16px
    border-radius 16px
    background #fff
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)
    position relative
    word-break break-word

    .message-self &
        background linear-gradient(135deg, #ff6b35, #ff4d4f)
        color #fff

    &.goods-card
        padding 0
        overflow hidden
        border-radius 12px
        cursor pointer

.message-text
    font-size 14px
    line-height 1.6
    color #333

    .message-self &
        color #fff

.goods-card-item
    display flex
    align-items center
    padding 12px
    background #fff

.goods-img
    width 60px
    height 60px
    border-radius 8px
    background #f5f5f5
    display flex
    align-items center
    justify-content center
    flex-shrink 0
    overflow hidden

    img
        width 100%
        height 100%
        object-fit cover

    i
        font-size 24px
        color #ccc

.goods-info
    flex 1
    margin-left 12px
    min-width 0

.goods-name
    font-size 14px
    color #333
    font-weight 500
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    margin-bottom 8px

.goods-price
    display flex
    align-items baseline

    .price-symbol
        font-size 12px
        color #ff6b35
        font-weight bold

    .price-value
        font-size 18px
        color #ff6b35
        font-weight 700

.card-arrow
    width 24px
    display flex
    align-items center
    justify-content center

    i
        font-size 14px
        color #ccc

.message-status
    margin-top 4px

.unread-tag
    font-size 11px
    color #999

.chat-input-area
    background #fff
    padding 12px 16px
    border-top 1px solid #f0f0f0
    position sticky
    bottom 0
    z-index 100

.input-toolbar
    display flex
    gap 16px
    margin-bottom 12px

.toolbar-item
    display flex
    align-items center
    gap 4px
    cursor pointer
    padding 4px 8px
    border-radius 4px
    transition background 0.3s

    &:hover
        background #f5f5f5

    i
        font-size 18px
        color #666

    .toolbar-text
        font-size 13px
        color #666

.input-row
    display flex
    gap 12px
    align-items flex-end

.input-wrapper
    flex 1

    >>> .el-textarea__inner
        border-radius 20px
        padding 10px 16px
        font-size 14px
        resize none
        max-height 100px
        overflow-y auto

.send-btn
    border-radius 20px
    padding 10px 24px
    font-size 14px
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    border none

    &:hover
        background linear-gradient(135deg, #ff5a1f, #ff3a3a)

    &.is-disabled
        background #ccc
        border-color #ccc
</style>
