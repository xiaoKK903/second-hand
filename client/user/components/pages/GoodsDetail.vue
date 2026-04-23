<template>
    <div class="goods-detail-page">
        <div class="detail-container">
            <div class="gallery-section">
                <div class="gallery-wrapper" v-if="images.length > 0">
                    <div class="gallery-main">
                        <div class="gallery-container" ref="galleryContainer">
                            <div 
                                class="gallery-item"
                                v-for="(image, index) in images"
                                :key="index"
                                :style="{ transform: 'translateX(' + (currentImageIndex * -100) + '%)' }">
                                <img 
                                    :src="image" 
                                    @click="openImagePreview(currentImageIndex)"
                                    @error="handleImageError($event)">
                            </div>
                        </div>
                        
                        <div class="gallery-nav" v-if="images.length > 1">
                            <div 
                                class="nav-btn prev"
                                @click="prevImage"
                                :class="{ disabled: currentImageIndex === 0 }">
                                <i class="el-icon-arrow-left"></i>
                            </div>
                            <div 
                                class="nav-btn next"
                                @click="nextImage"
                                :class="{ disabled: currentImageIndex === images.length - 1 }">
                                <i class="el-icon-arrow-right"></i>
                            </div>
                        </div>
                        
                        <div class="gallery-counter" v-if="images.length > 0">
                            <span class="current">{{ currentImageIndex + 1 }}</span>
                            <span class="separator">/</span>
                            <span class="total">{{ images.length }}</span>
                        </div>
                        
                        <div class="gallery-dots" v-if="images.length > 1">
                            <span 
                                class="dot"
                                :class="{ active: index === currentImageIndex }"
                                v-for="(image, index) in images"
                                :key="index"
                                @click="currentImageIndex = index">
                            </span>
                        </div>
                    </div>
                    
                    <div class="gallery-thumbs" v-if="images.length > 1">
                        <div 
                            class="thumb-item"
                            :class="{ active: index === currentImageIndex }"
                            v-for="(image, index) in images"
                            :key="index"
                            @click="currentImageIndex = index">
                            <img :src="image" @error="handleImageError($event)">
                        </div>
                    </div>
                </div>
                
                <div class="gallery-placeholder" v-else>
                    <img :src="defaultImage" @error="handleImageError($event)">
                    <p class="placeholder-text">暂无商品图片</p>
                </div>
            </div>

            <div class="info-section">
                <div class="price-area">
                    <div class="price-left">
                        <div class="price-row">
                            <span class="price-symbol">¥</span>
                            <span class="price-value">{{ formatPrice(goods.goods_price) }}</span>
                            <div class="original-price" v-if="goods.original_price && goods.original_price > goods.goods_price">
                                <span class="original-value">¥{{ formatPrice(goods.original_price) }}</span>
                                <span class="discount-badge">{{ getDiscount() }}折</span>
                            </div>
                        </div>
                    </div>
                    <div class="condition-badge" v-if="goods.condition">
                        <span class="condition-text">{{ goods.condition }}</span>
                    </div>
                </div>

                <div class="title-area">
                    <h1 class="goods-title">{{ goods.goods_name }}</h1>
                    <div class="goods-tags" v-if="goodsTags.length > 0">
                        <span 
                            class="tag-item"
                            :class="getTagClass(tag)"
                            v-for="tag in goodsTags"
                            :key="tag">
                            {{ tag }}
                        </span>
                    </div>
                </div>

                <div class="stats-row">
                    <div class="stat-item">
                        <i class="el-icon-view"></i>
                        <span>{{ formatViews(goods.views || 0) }} 人浏览</span>
                    </div>
                    <div class="stat-item" v-if="goods.created_at">
                        <i class="el-icon-time"></i>
                        <span>{{ formatDate(goods.created_at) }} 发布</span>
                    </div>
                    <div class="stat-item" v-if="goods.count">
                        <i class="el-icon-goods"></i>
                        <span>库存 {{ goods.count }} 件</span>
                    </div>
                </div>

                <div class="seller-card" @click="goToSeller">
                    <div class="seller-avatar">
                        <img :src="sellerInfo.avatar || defaultAvatar" @error="handleAvatarError($event)">
                    </div>
                    <div class="seller-info-box">
                        <div class="seller-name">
                            {{ sellerInfo.nickname || sellerInfo.username || '卖家' }}
                            <el-tag v-if="sellerInfo.verified" type="success" size="mini">已认证</el-tag>
                        </div>
                        <div class="seller-stats">
                            <span>在售 {{ sellerInfo.goodsCount || 0 }} 件</span>
                            <span class="divider">|</span>
                            <span>粉丝 {{ sellerInfo.fans || 0 }}</span>
                        </div>
                    </div>
                    <i class="el-icon-arrow-right arrow-icon"></i>
                </div>

                <div class="desc-section" v-if="goods.goods_desc">
                    <div class="section-header">
                        <span class="section-title">商品详情</span>
                    </div>
                    <div class="desc-content">
                        <p>{{ goods.goods_desc }}</p>
                    </div>
                </div>

                <div class="action-bar">
                    <div class="action-left">
                        <div class="action-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
                            <i :class="isFavorited ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                            <span>{{ isFavorited ? '已收藏' : '收藏' }}</span>
                        </div>
                        <div class="action-btn" @click="shareGoods">
                            <i class="el-icon-share"></i>
                            <span>分享</span>
                        </div>
                        <div class="action-btn" @click="scrollToComments">
                            <i class="el-icon-chat-dot-round"></i>
                            <span>留言</span>
                            <span class="comment-badge" v-if="comments.length > 0">{{ comments.length }}</span>
                        </div>
                    </div>
                    <div class="action-right">
                        <el-button class="cart-btn" @click="addToCart">
                            <i class="el-icon-shopping-cart-2"></i>
                            加入购物车
                        </el-button>
                        <el-button type="primary" class="buy-btn" @click="purchase">
                            立即购买
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <div class="comments-section" id="comments-section" v-if="showComments">
            <div class="section-header">
                <span class="section-title">留言咨询</span>
                <span class="comment-count">{{ comments.length }} 条留言</span>
            </div>

            <div class="comment-list" v-if="comments.length > 0">
                <div class="comment-item" v-for="(comment, index) in comments" :key="comment.comment_id || index">
                    <div class="comment-avatar">
                        <img :src="comment.avatar || defaultAvatar" @error="handleAvatarError($event)">
                    </div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-user">
                                {{ comment.nickname || comment.username || '用户' }}
                                <el-tag v-if="comment.user_id === goods.user_id" type="warning" size="mini" effect="dark">卖家</el-tag>
                            </span>
                            <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                        </div>
                        <div class="comment-text">
                            <span v-if="comment.reply_to" class="reply-prefix">
                                回复 @{{ getReplyUser(comment.reply_to) }}: 
                            </span>
                            {{ comment.content }}
                        </div>
                        <div class="comment-actions">
                            <span class="action-link" @click="replyToComment(comment)">
                                <i class="el-icon-chat-dot-round"></i>
                                回复
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="empty-comments" v-else>
                <div class="empty-icon">💬</div>
                <div class="empty-text">快来抢沙发，第一个留言吧～</div>
            </div>

            <div class="comment-input-box">
                <div class="reply-indicator" v-if="replyTarget">
                    <span class="reply-text">回复 @{{ replyTarget.nickname || '用户' }}</span>
                    <i class="el-icon-close close-btn" @click="cancelReply"></i>
                </div>
                <div class="input-wrapper">
                    <el-input
                        v-model="newComment"
                        type="textarea"
                        :rows="3"
                        :placeholder="getPlaceholder()"
                        maxlength="500"
                        show-word-limit
                        resize="none">
                    </el-input>
                    <div class="submit-row">
                        <span class="tip-text">登录后可留言</span>
                        <el-button 
                            type="primary" 
                            :disabled="!newComment.trim()" 
                            @click="submitComment"
                            :loading="submitting">
                            发送
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <el-dialog :visible.sync="imagePreviewVisible" title="图片预览" width="80%" center append-to-body>
            <div class="image-preview-container">
                <el-image
                    :src="previewImage"
                    fit="contain"
                    :preview-src-list="images"
                    :initial-index="previewIndex">
                </el-image>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="showChat" title="联系卖家" width="420px" center append-to-body>
            <div class="chat-dialog">
                <div class="chat-messages">
                    <div class="chat-message system">
                        你正在和卖家对话
                    </div>
                </div>
                <div class="chat-input">
                    <el-input
                        v-model="chatMessage"
                        placeholder="输入消息..."
                        @keyup.enter.native="sendChat">
                        <el-button slot="append" @click="sendChat">发送</el-button>
                    </el-input>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'GoodsDetail',
    data() {
        return {
            id: this.$route.query.id,
            goods: {},
            sellerInfo: {},
            num: 1,
            images: [],
            currentImageIndex: 0,
            isFavorited: false,
            isFollowed: false,
            imagePreviewVisible: false,
            previewImage: '',
            previewIndex: 0,
            showChat: false,
            chatMessage: '',
            showComments: true,
            comments: [],
            newComment: '',
            replyTarget: null,
            submitting: false,
            goodsTags: [],
            defaultImage: '/static/img/goods.webp',
            defaultAvatar: '/static/img/logo.png',
            placeholderAvatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNlNWU3ZWIiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSIxMiIgZmlsbD0iIzk5YTFhZiIvPjxyZWN0IHg9IjEyIiB5PSI0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjE4IiByeD0iOSIgZmlsbD0iIzk5YTFhZiIvPjwvc3ZnPg==',
            touchStartX: 0,
            touchEndX: 0
        }
    },
    created() {
        this.getGoodsById();
    },
    mounted() {
        this.initTouchEvents();
    },
    methods: {
        formatPrice(price) {
            if (price === null || price === undefined) return '0.00';
            return Number(price).toFixed(2);
        },
        formatViews(views) {
            if (!views || views === 0) return '0';
            if (views >= 10000) {
                return (views / 10000).toFixed(1) + 'w';
            }
            if (views >= 1000) {
                return (views / 1000).toFixed(1) + 'k';
            }
            return views;
        },
        formatDate(date) {
            if (!date) return '';
            var d = new Date(date);
            var now = new Date();
            var diff = now - d;
            if (diff < 60000) return '刚刚';
            if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
            if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
            if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
            var year = d.getFullYear();
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        },
        getReplyUser(userId) {
            var comment = this.comments.find(function(c) { return c.user_id === userId; });
            return (comment && comment.nickname) || (comment && comment.username) || '用户';
        },
        getTagClass(tag) {
            var classes = {
                '包邮': 'tag-free',
                '可小刀': 'tag-bargain',
                '自提': 'tag-self',
                '价格面议': 'tag-negotiate',
                '支持自提': 'tag-support-self',
                '可租可买': 'tag-rent'
            };
            return classes[tag] || '';
        },
        getDiscount() {
            if (!this.goods.original_price || !this.goods.goods_price || this.goods.original_price <= 0) {
                return 0;
            }
            var discount = (this.goods.goods_price / this.goods.original_price * 10).toFixed(1);
            return discount;
        },
        handleImageError(event) {
            event.target.src = this.defaultImage;
        },
        handleAvatarError(event) {
            var target = event.target;
            if (target.dataset.errored) return;
            target.dataset.errored = '1';
            target.src = this.placeholderAvatar;
        },
        prevImage() {
            if (this.currentImageIndex > 0) {
                this.currentImageIndex--;
            }
        },
        nextImage() {
            if (this.currentImageIndex < this.images.length - 1) {
                this.currentImageIndex++;
            }
        },
        openImagePreview(index) {
            this.previewIndex = index;
            this.previewImage = this.images[index];
            this.imagePreviewVisible = true;
        },
        getGoodsById() {
            var that = this;
            this.axios.get('/site/findGoods/' + this.id).then(function(res) {
                that.goods = res.data[0] || {};
                that.images = [];
                
                if (that.goods.goods_images && that.goods.goods_images.length > 0) {
                    if (typeof that.goods.goods_images === 'string') {
                        try {
                            that.images = JSON.parse(that.goods.goods_images);
                        } catch (e) {
                            that.images = [];
                        }
                    } else {
                        that.images = that.goods.goods_images;
                    }
                }
                
                if (that.goods.goods_image && !that.images.includes(that.goods.goods_image)) {
                    that.images.unshift(that.goods.goods_image);
                }
                
                if (that.images.length === 0 && that.goods.goods_image) {
                    that.images = [that.goods.goods_image];
                }
                
                if (that.images.length === 0) {
                    that.images = [that.defaultImage];
                }
                
                if (that.goods.tags) {
                    if (typeof that.goods.tags === 'string') {
                        try {
                            that.goodsTags = JSON.parse(that.goods.tags);
                        } catch (e) {
                            that.goodsTags = [];
                        }
                    } else {
                        that.goodsTags = that.goods.tags;
                    }
                }
                
                if (that.goods.user_id) {
                    that.getSellerInfo(that.goods.user_id);
                }
            }, function(err) {
                console.error(err);
            });
            
            this.axios.get('/site/getImages/' + this.id).then(function(res) {
                if (res.data && res.data.length > 0) {
                    var newImages = res.data.map(function(item) { return item.image_url; });
                    newImages.forEach(function(img) {
                        if (!that.images.includes(img)) {
                            that.images.push(img);
                        }
                    });
                }
            }, function(err) {
                console.error(err);
            });
            
            this.getComments();
            this.checkFavorite();
        },
        getSellerInfo(userId) {
            var that = this;
            this.axios.get('/site/user/' + userId).then(function(res) {
                that.sellerInfo = res.data[0] || {};
            }, function(err) {
                console.error(err);
            });
        },
        getComments() {
            var that = this;
            this.axios.get('/goods/' + this.id + '/comments').then(function(res) {
                that.comments = res.data || [];
            }, function(err) {
                console.error('获取留言失败:', err);
                that.comments = [];
            });
        },
        checkFavorite() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) return;
            var that = this;
            this.axios.get('/user/favoriteGoods', { params: { uid } }).then(function(res) {
                if (res.data && res.data.data) {
                    that.isFavorited = res.data.data.some(function(item) { 
                        return item.goods_id === Number(that.id); 
                    });
                }
            }, function(err) {
                console.error(err);
            });
        },
        toggleFavorite() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                var that = this;
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(function() {
                    that.$router.push({ name: 'login' });
                }).catch(function() {});
                return;
            }
            var action = this.isFavorited ? 'unfavorite' : 'favorite';
            var that2 = this;
            this.axios.post('/user/' + action + '/' + this.id, { uid: uid }).then(function(res) {
                if (res.data.success) {
                    that2.isFavorited = !that2.isFavorited;
                    that2.$message({
                        message: that2.isFavorited ? '收藏成功' : '已取消收藏',
                        type: 'success'
                    });
                }
            }, function(err) {
                that2.$message({
                    message: '操作失败',
                    type: 'error'
                });
            });
        },
        toggleFollow() {
            this.isFollowed = !this.isFollowed;
            this.$message({
                message: this.isFollowed ? '关注成功' : '已取消关注',
                type: 'success'
            });
        },
        shareGoods() {
            this.$message({
                message: '分享链接已复制',
                type: 'success'
            });
        },
        goToSeller() {
            this.$message({
                message: '卖家主页功能开发中',
                type: 'info'
            });
        },
        scrollToComments() {
            var section = document.getElementById('comments-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        },
        addToCart() {
            if (this.$cookieStore.getCookie('sid')) {
                var uid = this.$cookieStore.getCookie('sid'),
                    gid = this.goods.goods_id,
                    count = this.num;
                var that = this;
                this.axios.post('/site/addToCart', {
                    uid: uid,
                    gid: gid,
                    count: count
                }).then(function(res) {
                    that.$notify({
                        title: '成功',
                        message: '加入购物车成功！',
                        type: 'success'
                    });
                }, function(err) {
                    console.error(err);
                    that.$notify({
                        title: '失败',
                        message: '加入购物车失败！',
                        type: 'danger'
                    });
                });
            } else {
                var that2 = this;
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(function() {
                    that2.$router.push({ name: 'login' });
                }).catch(function() {});
            }
        },
        purchase() {
            if (this.$cookieStore.getCookie('sid')) {
                var goods = {
                    goods_id: this.goods.goods_id,
                    goods_image: this.goods.goods_image,
                    goods_name: this.goods.goods_name,
                    goods_price: this.goods.goods_price,
                    count: this.num
                };
                this.$store.commit('clearGoodsList');
                this.$store.commit('addGoods', { goods: goods });
                sessionStorage.setItem('store', JSON.stringify(this.$store.state));
                this.$router.push({ 
                    name: 'order'
                });
            } else {
                var that = this;
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(function() {
                    that.$router.push({ name: 'login' });
                }).catch(function() {});
            }
        },
        replyToComment(comment) {
            this.replyTarget = comment;
            this.newComment = '@' + (comment.nickname || '用户') + ' ';
            var that = this;
            this.$nextTick(function() {
                var textarea = document.querySelector('.comment-input-box textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.selectionStart = textarea.value.length;
                    textarea.selectionEnd = textarea.value.length;
                }
            });
            this.scrollToComments();
        },
        cancelReply() {
            this.replyTarget = null;
            this.newComment = '';
        },
        getPlaceholder() {
            if (this.replyTarget) {
                return '回复 @' + (this.replyTarget.nickname || '用户') + '...';
            }
            return '说点什么...';
        },
        submitComment() {
            if (!this.newComment.trim()) return;
            
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                var that = this;
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(function() {
                    that.$router.push({ name: 'login' });
                }).catch(function() {});
                return;
            }
            
            this.submitting = true;
            
            var commentData = {
                uid: uid,
                content: this.newComment,
                reply_to: this.replyTarget && this.replyTarget.user_id,
                parent_comment_id: this.replyTarget && this.replyTarget.comment_id
            };
            var that2 = this;
            
            this.axios.post('/goods/' + this.id + '/comment', commentData).then(function(res) {
                if (res.data.success) {
                    that2.$message({
                        message: '留言成功',
                        type: 'success'
                    });
                    that2.newComment = '';
                    that2.replyTarget = null;
                    that2.getComments();
                } else {
                    that2.$message({
                        message: res.data.msg || '留言失败',
                        type: 'error'
                    });
                }
            }, function(err) {
                that2.$message({
                    message: '留言失败，请稍后重试',
                    type: 'error'
                });
            }).finally(function() {
                that2.submitting = false;
            });
        },
        sendChat() {
            if (!this.chatMessage.trim()) return;
            this.$message({
                message: '消息已发送',
                type: 'success'
            });
            this.chatMessage = '';
        },
        initTouchEvents() {
            var container = this.$refs.galleryContainer;
            if (!container) return;
            var that = this;
            
            container.addEventListener('touchstart', function(e) {
                that.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            container.addEventListener('touchend', function(e) {
                that.touchEndX = e.changedTouches[0].screenX;
                that.handleSwipe();
            }, { passive: true });
        },
        handleSwipe() {
            var diff = this.touchStartX - this.touchEndX;
            var threshold = 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.nextImage();
                } else {
                    this.prevImage();
                }
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
.goods-detail-page
    background #f5f5f5
    min-height calc(100vh - 60px)
    padding-top 16px
    padding-bottom 80px

.detail-container
    max-width 1200px
    margin 0 auto
    padding 0 16px

.gallery-section
    margin-bottom 16px

.gallery-wrapper
    background #fff
    border-radius 12px
    overflow hidden
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)

.gallery-main
    position relative
    width 100%
    height 0
    padding-bottom 100%
    overflow hidden
    background #fafafa

.gallery-container
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    display flex
    transition transform 0.3s ease-in-out

.gallery-item
    flex-shrink 0
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center
    transition transform 0.3s ease-in-out

    img
        max-width 100%
        max-height 100%
        object-fit contain

.gallery-nav
    position absolute
    top 50%
    left 0
    right 0
    transform translateY(-50%)
    display flex
    justify-content space-between
    padding 0 16px
    pointer-events none
    z-index 10

.nav-btn
    width 36px
    height 36px
    border-radius 50%
    background rgba(0, 0, 0, 0.4)
    display flex
    align-items center
    justify-content center
    cursor pointer
    color #fff
    font-size 16px
    transition all 0.3s
    pointer-events auto

    &:hover
        background rgba(0, 0, 0, 0.6)

    &.disabled
        opacity 0.3
        cursor not-allowed

.gallery-counter
    position absolute
    bottom 16px
    right 16px
    background rgba(0, 0, 0, 0.5)
    color #fff
    padding 4px 12px
    border-radius 12px
    font-size 13px
    z-index 10

    .current
        font-weight bold

    .separator
        margin 0 4px

    .total
        opacity 0.8

.gallery-dots
    position absolute
    bottom 60px
    left 50%
    transform translateX(-50%)
    display flex
    gap 8px
    z-index 10

.dot
    width 8px
    height 8px
    border-radius 50%
    background rgba(255, 255, 255, 0.5)
    cursor pointer
    transition all 0.3s

    &:hover
        background rgba(255, 255, 255, 0.8)

    &.active
        width 20px
        border-radius 4px
        background #fff

.gallery-thumbs
    display flex
    gap 8px
    padding 12px
    overflow-x auto
    background #fff
    border-top 1px solid #f0f0f0

.thumb-item
    width 60px
    height 60px
    border-radius 8px
    overflow hidden
    border 2px solid transparent
    cursor pointer
    transition all 0.3s
    flex-shrink 0

    &:hover
        border-color #e0e0e0

    &.active
        border-color #ff6b35
        box-shadow 0 0 0 2px rgba(255, 107, 53, 0.2)

    img
        width 100%
        height 100%
        object-fit cover

.gallery-placeholder
    width 100%
    height 0
    padding-bottom 100%
    background #fafafa
    border-radius 12px
    display flex
    flex-direction column
    align-items center
    justify-content center
    position relative

    img
        position absolute
        top 50%
        left 50%
        transform translate(-50%, -50%)
        width 60%
        height auto
        opacity 0.6

    .placeholder-text
        position absolute
        bottom 20%
        left 50%
        transform translateX(-50%)
        font-size 14px
        color #999

.info-section
    background #fff
    border-radius 12px
    padding 20px
    margin-bottom 16px
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)

.price-area
    display flex
    justify-content space-between
    align-items flex-start
    margin-bottom 16px

.price-left
    .price-row
        display flex
        align-items baseline
        gap 8px

.price-symbol
    font-size 18px
    color #ff6b35
    font-weight bold

.price-value
    font-size 32px
    color #ff6b35
    font-weight bold
    line-height 1

.original-price
    display flex
    align-items center
    gap 8px
    margin-left 8px

.original-value
    font-size 14px
    color #999
    text-decoration line-through

.discount-badge
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    color #fff
    padding 2px 8px
    border-radius 10px
    font-size 12px
    font-weight bold

.condition-badge
    display flex
    align-items center
    padding 6px 14px
    background linear-gradient(135deg, #fff5f2, #fff0ed)
    border-radius 16px
    border 1px solid #ffd7cc

.condition-text
    font-size 13px
    color #ff6b35
    font-weight 600

.title-area
    margin-bottom 16px

.goods-title
    font-size 18px
    font-weight 600
    color #333
    line-height 1.5
    margin 0 0 12px 0

.goods-tags
    display flex
    flex-wrap wrap
    gap 8px

.tag-item
    display inline-flex
    align-items center
    padding 4px 12px
    border-radius 16px
    font-size 12px
    color #666
    background #f5f5f5
    border 1px solid #e8e8e8

    &.tag-free
        background #f0fdf4
        color #16a34a
        border-color #bbf7d0

    &.tag-bargain
        background #fffbeb
        color #ca8a04
        border-color #fde68a

    &.tag-self
        background #fef3c7
        color #d97706
        border-color #fcd34d

    &.tag-negotiate
        background #f0f9ff
        color #2563eb
        border-color #bfdbfe

    &.tag-support-self
        background #fdf2f8
        color #db2777
        border-color #fbcfe8

    &.tag-rent
        background #f5f3ff
        color #7c3aed
        border-color #ddd6fe

.stats-row
    display flex
    gap 20px
    padding 12px 0
    border-top 1px dashed #f0f0f0
    border-bottom 1px dashed #f0f0f0
    margin-bottom 16px

.stat-item
    display flex
    align-items center
    gap 6px
    font-size 13px
    color #999

    i
        font-size 14px

.seller-card
    display flex
    align-items center
    background #fafafa
    border-radius 12px
    padding 16px
    margin-bottom 16px
    cursor pointer
    transition all 0.3s

    &:hover
        background #f5f5f5

        .arrow-icon
            transform translateX(4px)

.seller-avatar
    width 48px
    height 48px
    border-radius 50%
    overflow hidden
    border 2px solid #fff
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
    flex-shrink 0

    img
        width 100%
        height 100%
        object-fit cover

.seller-info-box
    flex 1
    margin-left 12px

.seller-name
    font-size 15px
    font-weight 600
    color #333
    margin-bottom 4px
    display flex
    align-items center
    gap 8px

.seller-stats
    font-size 12px
    color #999
    display flex
    align-items center
    gap 8px

    .divider
        color #ddd

.arrow-icon
    color #ccc
    font-size 18px
    transition all 0.3s

.desc-section
    margin-bottom 16px

.section-header
    display flex
    align-items center
    margin-bottom 12px

.section-title
    font-size 15px
    font-weight 600
    color #333

.comment-count
    font-size 12px
    color #999
    margin-left 8px

.desc-content
    font-size 14px
    color #666
    line-height 1.8

    p
        margin 0

.action-bar
    position fixed
    bottom 0
    left 0
    right 0
    background #fff
    padding 12px 16px
    display flex
    justify-content space-between
    align-items center
    border-top 1px solid #f0f0f0
    z-index 100

.action-left
    display flex
    gap 20px

.action-btn
    display flex
    flex-direction column
    align-items center
    cursor pointer
    transition all 0.3s
    color #666
    position relative

    &:hover
        color #ff6b35

    &.active
        color #ff6b35

    i
        font-size 20px
        margin-bottom 2px

    span
        font-size 11px

.comment-badge
    position absolute
    top -4px
    right -8px
    background #ff6b35
    color #fff
    font-size 10px
    padding 0 4px
    border-radius 8px
    min-width 16px
    text-align center

.action-right
    display flex
    gap 12px

.cart-btn
    padding 12px 28px
    border-radius 24px
    background #fff
    color #ff6b35
    border-color #ff6b35
    font-weight 600

    &:hover
        background #fff5f2
        color #ff6b35
        border-color #ff6b35

.buy-btn
    padding 12px 28px
    border-radius 24px
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    border none
    font-weight 600

    &:hover
        box-shadow 0 4px 12px rgba(255, 107, 53, 0.4)

.comments-section
    background #fff
    border-radius 12px
    padding 20px
    margin-bottom 80px
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)

.comment-list
    margin-bottom 20px

.comment-item
    display flex
    gap 12px
    padding 16px 0
    border-bottom 1px solid #f5f5f5

    &:last-child
        border-bottom none

.comment-avatar
    width 36px
    height 36px
    border-radius 50%
    overflow hidden
    flex-shrink 0

    img
        width 100%
        height 100%
        object-fit cover

.comment-content
    flex 1

.comment-header
    display flex
    justify-content space-between
    align-items center
    margin-bottom 8px

.comment-user
    display flex
    align-items center
    gap 8px
    font-size 13px
    font-weight 600
    color #333

.comment-time
    font-size 12px
    color #999

.comment-text
    font-size 14px
    color #666
    line-height 1.6
    margin-bottom 8px

.reply-prefix
    color #409EFF
    font-size 13px

.comment-actions
    .action-link
        display inline-flex
        align-items center
        gap 4px
        font-size 12px
        color #409EFF
        cursor pointer

        &:hover
            color #66b1ff

.empty-comments
    text-align center
    padding 40px 0

.empty-icon
    font-size 40px
    margin-bottom 12px

.empty-text
    font-size 14px
    color #999

.comment-input-box
    background #fafafa
    border-radius 12px
    padding 16px

.reply-indicator
    display flex
    justify-content space-between
    align-items center
    margin-bottom 12px
    padding 8px 12px
    background #e6f7ff
    border-radius 8px

.reply-text
    font-size 13px
    color #1890ff

.close-btn
    cursor pointer
    color #999
    font-size 16px

    &:hover
        color #666

.input-wrapper
    .el-textarea__inner
        border-radius 8px
        resize none

.submit-row
    display flex
    justify-content space-between
    align-items center
    margin-top 12px

.tip-text
    font-size 12px
    color #999

.image-preview-container
    display flex
    justify-content center
    align-items center
    min-height 500px

.chat-dialog
    display flex
    flex-direction column
    height 400px

.chat-messages
    flex 1
    overflow-y auto
    padding 16px
    background #fafafa
    border-radius 8px
    margin-bottom 16px

.chat-message
    &.system
        text-align center
        font-size 12px
        color #999
        padding 8px

.chat-input
    .el-input__inner
        border-radius 20px

    .el-button
        border-radius 0 20px 20px 0

@media (max-width 768px)
    .detail-container
        padding 0

    .gallery-main
        border-radius 0

    .info-section
        border-radius 0
        margin-bottom 0

    .comments-section
        border-radius 0
        margin-bottom 60px

    .action-bar
        padding 10px 16px

    .action-left
        gap 16px

    .action-right
        gap 8px

    .cart-btn, .buy-btn
        padding 10px 20px
        font-size 14px

    .price-value
        font-size 28px

    .goods-title
        font-size 16px

    .gallery-thumbs
        .thumb-item
            width 48px
            height 48px
</style>
