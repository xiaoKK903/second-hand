<template>
    <div class="goods-detail-page">
        <div class="detail-container">
            <div class="main-content">
                <div class="gallery-section">
                    <div class="gallery-main">
                        <div class="gallery-image-wrapper" v-if="images.length > 0">
                            <img 
                                :src="images[currentImageIndex]" 
                                @click="openImagePreview(currentImageIndex)"
                                @error="handleImageError($event)">
                            <div class="gallery-nav">
                                <div 
                                    class="nav-btn prev"
                                    @click="prevImage"
                                    v-if="images.length > 1">
                                    <i class="el-icon-arrow-left"></i>
                                </div>
                                <div 
                                    class="nav-btn next"
                                    @click="nextImage"
                                    v-if="images.length > 1">
                                    <i class="el-icon-arrow-right"></i>
                                </div>
                            </div>
                            <div class="gallery-counter">
                                {{ currentImageIndex + 1 }} / {{ images.length }}
                            </div>
                        </div>
                        <div class="gallery-placeholder" v-else>
                            <img :src="defaultImage" @error="handleImageError($event)">
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

                <div class="info-section">
                    <div class="price-area">
                        <div class="price-main">
                            <span class="price-symbol">¥</span>
                            <span class="price-value">{{ formatPrice(goods.goods_price) }}</span>
                            <div class="original-price" v-if="goods.original_price && goods.original_price > goods.goods_price">
                                <span class="original-label">原价</span>
                                <span class="original-value">¥{{ formatPrice(goods.original_price) }}</span>
                                <span class="discount-badge">{{ getDiscount() }}折</span>
                            </div>
                        </div>
                        <div class="condition-badge" v-if="goods.condition">
                            <span class="condition-icon">{{ getConditionIcon(goods.condition) }}</span>
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
                                <span class="tag-icon">{{ getTagIcon(tag) }}</span>
                                {{ tag }}
                            </span>
                        </div>
                    </div>

                    <div class="stats-area">
                        <div class="stat-item">
                            <i class="el-icon-view"></i>
                            <span>{{ goods.views || 0 }} 人浏览</span>
                        </div>
                        <div class="stat-item" v-if="goods.created_at">
                            <i class="el-icon-time"></i>
                            <span>{{ formatDate(goods.created_at) }} 发布</span>
                        </div>
                    </div>

                    <div class="seller-area">
                        <div class="seller-info" @click="goToSeller">
                            <div class="seller-avatar">
                                <img :src="sellerInfo.avatar || defaultAvatar" @error="handleAvatarError($event)">
                            </div>
                            <div class="seller-detail">
                                <div class="seller-name">
                                    {{ sellerInfo.nickname || sellerInfo.username || '卖家' }}
                                    <el-tag v-if="sellerInfo.verified" type="success" size="mini">已认证</el-tag>
                                </div>
                                <div class="seller-stats">
                                    <span>在售 {{ sellerInfo.goodsCount || 0 }} 件</span>
                                    <span class="stat-divider">·</span>
                                    <span>粉丝 {{ sellerInfo.fans || 0 }}</span>
                                </div>
                            </div>
                            <i class="el-icon-arrow-right seller-arrow"></i>
                        </div>
                        <div class="seller-actions">
                            <el-button class="contact-btn" @click="showChat = true">
                                <i class="el-icon-chat-dot-round"></i>
                                联系卖家
                            </el-button>
                            <el-button class="follow-btn" :type="isFollowed ? '' : 'primary'" @click="toggleFollow">
                                <i :class="isFollowed ? 'el-icon-check' : 'el-icon-plus'"></i>
                                {{ isFollowed ? '已关注' : '关注' }}
                            </el-button>
                        </div>
                    </div>

                    <div class="desc-area" v-if="goods.goods_desc">
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

            <div class="comments-section" v-if="showComments">
                <div class="section-header">
                    <span class="section-title">留言咨询</span>
                    <span class="comment-count">({{ comments.length }})</span>
                </div>

                <div class="comment-list" v-if="comments.length > 0">
                    <div class="comment-item" v-for="(comment, index) in comments" :key="index">
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
                            <div class="comment-text">{{ comment.content }}</div>
                            <div class="comment-reply" @click="replyTo(comment)">
                                <i class="el-icon-chat-dot-round"></i>
                                回复
                            </div>
                        </div>
                    </div>
                </div>

                <div class="empty-comments" v-else>
                    <div class="empty-icon">💬</div>
                    <div class="empty-text">快来抢沙发，第一个留言吧～</div>
                </div>

                <div class="comment-input-area">
                    <el-input
                        v-model="newComment"
                        type="textarea"
                        :rows="2"
                        :placeholder="replyTarget ? `回复 @${replyTarget.nickname || '用户'}: ` : '说点什么...'"
                        maxlength="200"
                        show-word-limit
                        @keyup.enter.native="submitComment">
                    </el-input>
                    <div class="comment-actions">
                        <el-button type="primary" :disabled="!newComment.trim()" @click="submitComment">
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
            goodsTags: [],
            defaultImage: '/static/img/goods.webp',
            defaultAvatar: '/static/img/logo.png'
        }
    },
    computed: {},
    created() {
        this.getGoodsById();
    },
    methods: {
        formatPrice(price) {
            if (price === null || price === undefined) return '0.00';
            return Number(price).toFixed(2);
        },
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            const now = new Date();
            const diff = now - d;
            if (diff < 60000) return '刚刚';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
            if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },
        getConditionIcon(condition) {
            const icons = {
                '全新': '✨',
                '99新': '💎',
                '95新': '🌟',
                '轻微使用': '📦',
                '成色一般': '🔖'
            };
            return icons[condition] || '🏷️';
        },
        getTagIcon(tag) {
            const icons = {
                '包邮': '📦',
                '可小刀': '💰',
                '自提': '🏠',
                '价格面议': '💬',
                '支持自提': '📍',
                '可租可买': '🔄'
            };
            return icons[tag] || '🏷️';
        },
        getTagClass(tag) {
            const classes = {
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
            const discount = (this.goods.goods_price / this.goods.original_price * 10).toFixed(1);
            return discount;
        },
        handleImageError(event) {
            event.target.src = this.defaultImage;
        },
        handleAvatarError(event) {
            event.target.src = this.defaultAvatar;
        },
        prevImage() {
            if (this.images.length === 0) return;
            this.currentImageIndex = this.currentImageIndex === 0 ? this.images.length - 1 : this.currentImageIndex - 1;
        },
        nextImage() {
            if (this.images.length === 0) return;
            this.currentImageIndex = this.currentImageIndex === this.images.length - 1 ? 0 : this.currentImageIndex + 1;
        },
        openImagePreview(index) {
            this.previewIndex = index;
            this.previewImage = this.images[index];
            this.imagePreviewVisible = true;
        },
        getGoodsById() {
            this.axios.get('/site/findGoods/' + this.id).then(res => {
                this.goods = res.data[0] || {};
                this.images = [];
                if (this.goods.goods_images && this.goods.goods_images.length > 0) {
                    this.images = this.goods.goods_images;
                }
                if (this.goods.goods_image && !this.images.includes(this.goods.goods_image)) {
                    this.images.unshift(this.goods.goods_image);
                }
                if (this.images.length === 0 && this.goods.goods_image) {
                    this.images = [this.goods.goods_image];
                }
                if (this.goods.tags && this.goods.tags.length > 0) {
                    this.goodsTags = this.goods.tags;
                }
                if (this.goods.user_id) {
                    this.getSellerInfo(this.goods.user_id);
                }
            }, err => {
                console.error(err);
            });
            this.axios.get('/site/getImages/' + this.id).then(res => {
                if (res.data && res.data.length > 0) {
                    const newImages = res.data.map(item => item.image_url);
                    newImages.forEach(img => {
                        if (!this.images.includes(img)) {
                            this.images.push(img);
                        }
                    });
                }
            }, err => {
                console.error(err);
            });
            this.getComments();
            this.checkFavorite();
        },
        getSellerInfo(userId) {
            this.axios.get('/site/user/' + userId).then(res => {
                this.sellerInfo = res.data[0] || {};
            }, err => {
                console.error(err);
            });
        },
        getComments() {
            this.axios.get('/goods/' + this.id + '/comments').then(res => {
                this.comments = res.data || [];
            }, err => {
                this.comments = [];
            });
        },
        checkFavorite() {
            const uid = this.$cookieStore.getCookie('sid');
            if (!uid) return;
            this.axios.get('/user/favoriteGoods', { params: { uid } }).then(res => {
                if (res.data && res.data.data) {
                    this.isFavorited = res.data.data.some(item => item.goods_id === Number(this.id));
                }
            }, err => {
                console.error(err);
            });
        },
        toggleFavorite() {
            const uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(() => {
                    this.$router.push({ name: 'login' });
                }).catch(() => {});
                return;
            }
            const action = this.isFavorited ? 'unfavorite' : 'favorite';
            this.axios.post(`/user/${action}/${this.id}`, { uid }).then(res => {
                if (res.data.success) {
                    this.isFavorited = !this.isFavorited;
                    this.$message({
                        message: this.isFavorited ? '收藏成功' : '已取消收藏',
                        type: 'success'
                    });
                }
            }, err => {
                this.$message({
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
        addToCart() {
            if (this.$cookieStore.getCookie('sid')) {
                let uid = this.$cookieStore.getCookie('sid'),
                    gid = this.goods.goods_id,
                    count = this.num;
                this.axios.post('/site/addToCart', {
                    uid: uid,
                    gid: gid,
                    count: count
                }).then(res => {
                    this.$notify({
                        title: '成功',
                        message: '加入购物车成功！',
                        type: 'success'
                    });
                }, err => {
                    console.error(err);
                    this.$notify({
                        title: '失败',
                        message: '加入购物车失败！',
                        type: 'danger'
                    });
                })
            } else {
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$router.push({ name: 'login' });
                }).catch(() => {});
            }
        },
        purchase() {
            if (this.$cookieStore.getCookie('sid')) {
                let goods = {
                    goods_id: this.goods.goods_id,
                    goods_image: this.goods.goods_image,
                    goods_name: this.goods.goods_name,
                    goods_price: this.goods.goods_price,
                    count: this.num
                }
                this.$store.commit('clearGoodsList');
                this.$store.commit('addGoods', { goods });
                sessionStorage.setItem('store', JSON.stringify(this.$store.state));
                this.$router.push({ 
                    name: 'order'
                });
            } else {
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$router.push({ name: 'login' });
                }).catch(() => {});
            }
        },
        replyTo(comment) {
            this.replyTarget = comment;
            this.newComment = `@${comment.nickname || '用户'} `;
            this.$nextTick(() => {
                const textarea = document.querySelector('.comment-input-area textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.selectionStart = textarea.value.length;
                    textarea.selectionEnd = textarea.value.length;
                }
            });
        },
        submitComment() {
            if (!this.newComment.trim()) return;
            const uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$confirm('您还未登录, 是否去登录?', '提示', {
                    confirmButtonText: '确定',
                    type: 'warning'
                }).then(() => {
                    this.$router.push({ name: 'login' });
                }).catch(() => {});
                return;
            }
            this.axios.post(`/goods/${this.id}/comment`, {
                uid,
                content: this.newComment,
                reply_to: this.replyTarget?.user_id
            }).then(res => {
                if (res.data.success) {
                    this.$message({
                        message: '留言成功',
                        type: 'success'
                    });
                    this.newComment = '';
                    this.replyTarget = null;
                    this.getComments();
                }
            }, err => {
                this.$message({
                    message: '留言失败，请稍后重试',
                    type: 'error'
                });
            });
        },
        sendChat() {
            if (!this.chatMessage.trim()) return;
            this.$message({
                message: '消息已发送',
                type: 'success'
            });
            this.chatMessage = '';
        }
    }
}
</script>

<style lang="stylus" scoped>
.goods-detail-page
    background #f5f5f5
    min-height calc(100vh - 60px)
    padding 20px 0

.detail-container
    max-width 1200px
    margin 0 auto
    padding 0 16px

.main-content
    display flex
    gap 24px
    background #fff
    border-radius 16px
    padding 24px
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)
    margin-bottom 24px

.gallery-section
    flex 0 0 520px

.gallery-main
    position relative
    width 520px
    height 520px
    border-radius 12px
    overflow hidden
    background #fafafa

.gallery-image-wrapper
    width 100%
    height 100%
    cursor pointer
    position relative

    img
        width 100%
        height 100%
        object-fit contain
        transition transform 0.3s

    &:hover img
        transform scale(1.02)

.gallery-placeholder
    width 100%
    height 100%
    display flex
    align-items center
    justify-content center

    img
        width 80%
        height 80%
        object-fit contain
        opacity 0.8

.gallery-nav
    position absolute
    top 50%
    left 0
    right 0
    transform translateY(-50%)
    display flex
    justify-content space-between
    padding 0 12px
    pointer-events none

.nav-btn
    width 40px
    height 40px
    border-radius 50%
    background rgba(0, 0, 0, 0.3)
    display flex
    align-items center
    justify-content center
    cursor pointer
    color #fff
    font-size 18px
    transition all 0.3s
    pointer-events auto

    &:hover
        background rgba(0, 0, 0, 0.5)

.gallery-counter
    position absolute
    bottom 16px
    right 16px
    background rgba(0, 0, 0, 0.5)
    color #fff
    padding 4px 12px
    border-radius 12px
    font-size 13px

.gallery-thumbs
    display flex
    gap 12px
    margin-top 16px
    overflow-x auto
    padding 4px 0

.thumb-item
    width 80px
    height 80px
    border-radius 8px
    overflow hidden
    border 3px solid transparent
    cursor pointer
    transition all 0.3s
    flex-shrink 0

    &:hover
        border-color #409EFF

    &.active
        border-color #ff6b35
        box-shadow 0 0 0 2px rgba(255, 107, 53, 0.2)

    img
        width 100%
        height 100%
        object-fit cover

.info-section
    flex 1
    display flex
    flex-direction column

.price-area
    display flex
    justify-content space-between
    align-items flex-start
    margin-bottom 16px

.price-main
    display flex
    flex-direction column

.price-symbol
    font-size 20px
    color #ff6b35
    font-weight bold

.price-value
    font-size 36px
    color #ff6b35
    font-weight bold
    margin-left 4px

.original-price
    display flex
    align-items center
    margin-top 4px
    gap 8px

.original-label
    font-size 12px
    color #999

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
    gap 6px
    padding 6px 14px
    background linear-gradient(135deg, #f0f9ff, #e0f2fe)
    border-radius 20px
    border 1px solid #bae6fd

.condition-icon
    font-size 16px

.condition-text
    font-size 14px
    color #0369a1
    font-weight 600

.title-area
    margin-bottom 20px

.goods-title
    font-size 20px
    font-weight 600
    color #333
    line-height 1.5
    margin 0 0 12px 0

.goods-tags
    display flex
    flex-wrap wrap
    gap 8px

.tag-item
    display flex
    align-items center
    gap 4px
    padding 4px 12px
    border-radius 16px
    font-size 13px
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

.tag-icon
    font-size 14px

.stats-area
    display flex
    gap 24px
    margin-bottom 20px
    padding 12px 0
    border-top 1px dashed #f0f0f0
    border-bottom 1px dashed #f0f0f0

.stat-item
    display flex
    align-items center
    gap 6px
    font-size 13px
    color #999

    i
        font-size 14px

.seller-area
    background #fafafa
    border-radius 12px
    padding 16px
    margin-bottom 20px

.seller-info
    display flex
    align-items center
    cursor pointer
    transition all 0.3s

    &:hover
        .seller-arrow
            transform translateX(4px)

.seller-avatar
    width 56px
    height 56px
    border-radius 50%
    overflow hidden
    border 3px solid #fff
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

    img
        width 100%
        height 100%
        object-fit cover

.seller-detail
    flex 1
    margin-left 12px

.seller-name
    font-size 16px
    font-weight 600
    color #333
    margin-bottom 4px
    display flex
    align-items center
    gap 8px

.seller-stats
    font-size 13px
    color #999
    display flex
    align-items center
    gap 8px

.stat-divider
    color #ddd

.seller-arrow
    color #ccc
    font-size 16px
    transition all 0.3s

.seller-actions
    display flex
    gap 12px
    margin-top 12px
    padding-top 12px
    border-top 1px solid #f0f0f0

.contact-btn
    flex 1
    border-radius 20px
    background #fff
    color #ff6b35
    border-color #ff6b35

    &:hover
        background #fff5f2
        color #ff6b35
        border-color #ff6b35

.follow-btn
    flex 1
    border-radius 20px

.desc-area
    margin-bottom 20px

.section-header
    display flex
    align-items center
    margin-bottom 12px

.section-title
    font-size 16px
    font-weight 600
    color #333

.comment-count
    font-size 13px
    color #999
    margin-left 8px

.desc-content
    font-size 15px
    color #666
    line-height 1.8

    p
        margin 0

.action-bar
    position sticky
    bottom 0
    margin-top auto
    padding 16px 0 0
    display flex
    justify-content space-between
    align-items center
    border-top 1px solid #f0f0f0

.action-left
    display flex
    gap 24px

.action-btn
    display flex
    flex-direction column
    align-items center
    cursor pointer
    transition all 0.3s
    color #666

    &:hover
        color #409EFF

    &.active
        color #ff6b35

    i
        font-size 22px
        margin-bottom 4px

    span
        font-size 12px

.action-right
    display flex
    gap 12px

.cart-btn
    padding 12px 32px
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
    padding 12px 32px
    border-radius 24px
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    border none
    font-weight 600

    &:hover
        box-shadow 0 4px 12px rgba(255, 107, 53, 0.4)

.comments-section
    background #fff
    border-radius 16px
    padding 24px
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
    width 40px
    height 40px
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
    font-size 14px
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

.comment-reply
    font-size 12px
    color #409EFF
    cursor pointer
    display inline-flex
    align-items center
    gap 4px

    &:hover
        color #66b1ff

.empty-comments
    text-align center
    padding 40px 0

.empty-icon
    font-size 48px
    margin-bottom 12px

.empty-text
    font-size 14px
    color #999

.comment-input-area
    background #fafafa
    border-radius 12px
    padding 16px

.comment-actions
    display flex
    justify-content flex-end
    margin-top 12px

    .el-button
        border-radius 20px
        padding 8px 24px

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

@media (max-width 1200px)
    .main-content
        flex-direction column

    .gallery-section
        flex none
        width 100%

    .gallery-main
        width 100%
        height auto
        aspect-ratio 1

        img
            width 100%
            height auto

@media (max-width 768px)
    .detail-container
        padding 0 8px

    .main-content
        padding 16px
        gap 16px

    .gallery-main
        width 100%
        height 300px

    .gallery-thumbs
        .thumb-item
            width 60px
            height 60px

    .price-main
        .price-value
            font-size 28px

    .action-bar
        flex-direction column
        gap 12px

    .action-right
        width 100%

        .el-button
            flex 1
</style>
