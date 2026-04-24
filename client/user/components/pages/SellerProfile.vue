<template>
    <div id="seller-profile-page">
        <div class="profile-header">
            <div class="header-back" @click="goBack">
                <i class="el-icon-arrow-left"></i>
            </div>
            <div class="header-title">卖家主页</div>
            <div class="header-actions">
                <el-button type="primary" size="small" @click="chatWithSeller" class="chat-btn" v-if="!isOwnProfile">
                    <i class="el-icon-chat-dot-round"></i>
                    私聊
                </el-button>
            </div>
        </div>

        <div class="profile-content">
            <div class="seller-info-card">
                <div class="seller-top">
                    <div class="seller-avatar">
                        <div class="avatar-circle" v-if="sellerProfile.avatar">
                            <img :src="sellerProfile.avatar" :alt="sellerProfile.nickname">
                        </div>
                        <div class="avatar-circle avatar-placeholder" v-else>
                            <i class="el-icon-user-solid"></i>
                        </div>
                    </div>
                    <div class="seller-basic">
                        <div class="seller-name-row">
                            <span class="seller-name">{{ sellerProfile.nickname }}</span>
                            <el-tag v-if="sellerProfile.contact" type="warning" size="small" class="contact-tag">
                                <i class="el-icon-mobile-phone"></i>
                                {{ sellerProfile.contact }}
                            </el-tag>
                        </div>
                        <div class="seller-bio" v-if="sellerProfile.bio">
                            <i class="el-icon-edit-outline"></i>
                            {{ sellerProfile.bio }}
                        </div>
                        <div class="seller-join-date" v-if="sellerProfile.created_at">
                            <i class="el-icon-time"></i>
                            入驻于 {{ formatDate(sellerProfile.created_at) }}
                        </div>
                    </div>
                </div>
                
                <div class="seller-stats">
                    <div class="stat-item">
                        <span class="stat-value">{{ sellerProfile.total_goods || 0 }}</span>
                        <span class="stat-label">发布闲置</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-value sold-value">{{ sellerProfile.sold_goods || 0 }}</span>
                        <span class="stat-label">已成交</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-value active-value">{{ sellerProfile.active_goods || 0 }}</span>
                        <span class="stat-label">在售中</span>
                    </div>
                </div>
            </div>

            <div class="goods-section">
                <div class="section-header">
                    <span class="section-title">发布的闲置</span>
                    <span class="section-count">({{ goodsList.length }})</span>
                </div>

                <div class="goods-grid" v-if="goodsList.length > 0">
                    <div 
                        class="goods-card" 
                        v-for="goods in goodsList" 
                        :key="goods.goods_id"
                        @click="goToGoodsDetail(goods.goods_id)">
                        <div class="goods-img-wrapper">
                            <div class="goods-img" v-if="goods.goods_image">
                                <img :src="goods.goods_image" :alt="goods.goods_name">
                            </div>
                            <div class="goods-img no-image" v-else>
                                <i class="el-icon-picture"></i>
                            </div>
                            <div class="goods-badges" v-if="goods.condition">
                                <span class="badge condition-badge">{{ goods.condition }}</span>
                            </div>
                            <div class="status-badge" v-if="goods.status === 'inactive'">
                                已下架
                            </div>
                            <div class="status-badge sold-badge" v-if="goods.status === 'sold'">
                                已售出
                            </div>
                        </div>
                        <div class="goods-info">
                            <p class="goods-name">{{ goods.goods_name }}</p>
                            <div class="goods-price-row">
                                <span class="goods-price">
                                    <span class="price-symbol">¥</span>
                                    <span class="price-value">{{ formatPrice(goods.goods_price) }}</span>
                                </span>
                                <span class="goods-views">
                                    <i class="el-icon-view"></i>
                                    {{ goods.views || 0 }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="empty-goods" v-else>
                    <div class="empty-icon">📦</div>
                    <div class="empty-text">暂无发布的闲置</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'SellerProfile',
    data() {
        return {
            sellerId: null,
            sellerProfile: {},
            goodsList: [],
            loading: false,
            currentUserId: null
        }
    },
    computed: {
        isOwnProfile: function() {
            if (!this.currentUserId || !this.sellerId) return false;
            return Number(this.currentUserId) === Number(this.sellerId);
        }
    },
    created() {
        this.initPage();
    },
    methods: {
        initPage: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (uid) {
                this.currentUserId = uid;
            }
            
            var sellerId = this.$route.query.user_id;
            if (!sellerId) {
                this.$router.go(-1);
                return;
            }
            
            this.sellerId = sellerId;
            this.loadSellerProfile();
        },
        
        loadSellerProfile: function() {
            var that = this;
            this.loading = true;
            
            this.axios.get('/api/seller/' + this.sellerId).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.sellerProfile = res.data.data;
                    that.goodsList = res.data.data.recent_goods || [];
                } else {
                    that.$message.error('获取卖家信息失败');
                }
                that.loading = false;
            }, function(err) {
                console.error(err);
                that.$message.error('获取卖家信息失败');
                that.loading = false;
            });
        },
        
        formatPrice: function(price) {
            if (price === null || price === undefined) return '0';
            var num = Number(price);
            if (num === Math.floor(num)) {
                return num.toString();
            }
            return num.toFixed(2);
        },
        
        formatDate: function(date) {
            if (!date) return '';
            var d = new Date(date);
            var year = d.getFullYear();
            var month = d.getMonth() + 1;
            var day = d.getDate();
            return year + '年' + month + '月' + day + '日';
        },
        
        goBack: function() {
            this.$router.go(-1);
        },
        
        goToGoodsDetail: function(goodsId) {
            if (goodsId) {
                this.$router.push({ path: '/site/goodsDetail', query: { id: goodsId } });
            }
        },
        
        chatWithSeller: function() {
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
            
            if (this.isOwnProfile) {
                this.$message.warning('不能与自己聊天');
                return;
            }
            
            this.$router.push({ 
                path: '/site/chat', 
                query: { 
                    target_user_id: this.sellerId,
                    target_name: this.sellerProfile.nickname,
                    from: 'seller'
                } 
            });
        }
    }
}
</script>

<style lang="stylus" scoped>
#seller-profile-page
    background #f5f5f5
    min-height 100vh

.profile-header
    display flex
    align-items center
    justify-content space-between
    padding 12px 16px
    background #fff
    border-bottom 1px solid #f0f0f0
    position sticky
    top 0
    z-index 100

.header-back
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
    font-size 16px
    font-weight 600
    color #333

.header-actions
    width 80px
    display flex
    justify-content flex-end

.chat-btn
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    border none
    border-radius 20px
    padding 6px 16px

    &:hover
        background linear-gradient(135deg, #ff5a1f, #ff3a3a)

.profile-content
    padding 16px

.seller-info-card
    background #fff
    border-radius 12px
    padding 20px
    margin-bottom 16px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)

.seller-top
    display flex
    gap 16px
    margin-bottom 20px

.seller-avatar
    flex-shrink 0

.avatar-circle
    width 80px
    height 80px
    border-radius 50%
    overflow hidden
    background linear-gradient(135deg, #667eea, #764ba2)
    display flex
    align-items center
    justify-content center

    img
        width 100%
        height 100%
        object-fit cover

    &.avatar-placeholder
        i
            font-size 36px
            color #fff

.seller-basic
    flex 1
    min-width 0
    display flex
    flex-direction column
    gap 8px

.seller-name-row
    display flex
    align-items center
    gap 12px
    flex-wrap wrap

.seller-name
    font-size 18px
    font-weight 700
    color #333

.contact-tag
    margin 0

.seller-bio
    font-size 13px
    color #666
    display flex
    align-items center
    gap 4px

    i
        font-size 14px
        color #999

.seller-join-date
    font-size 12px
    color #999
    display flex
    align-items center
    gap 4px

    i
        font-size 12px

.seller-stats
    display flex
    align-items center
    justify-content space-around
    padding-top 20px
    border-top 1px solid #f0f0f0

.stat-item
    text-align center

.stat-value
    display block
    font-size 24px
    font-weight 700
    color #333
    margin-bottom 4px

    &.sold-value
        color #52c41a

    &.active-value
        color #ff6b35

.stat-label
    font-size 12px
    color #999

.stat-divider
    width 1px
    height 30px
    background #f0f0f0

.goods-section
    background #fff
    border-radius 12px
    padding 16px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)

.section-header
    display flex
    align-items baseline
    gap 8px
    margin-bottom 16px

.section-title
    font-size 16px
    font-weight 600
    color #333

.section-count
    font-size 12px
    color #999

.goods-grid
    display grid
    grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
    gap 16px

.goods-card
    cursor pointer
    transition all 0.3s
    border-radius 8px
    overflow hidden
    background #fafafa

    &:hover
        transform translateY(-4px)
        box-shadow 0 8px 16px rgba(0, 0, 0, 0.1)

.goods-img-wrapper
    position relative
    width 100%
    padding-bottom 100%
    background #f5f5f5

.goods-img
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    overflow hidden

    img
        width 100%
        height 100%
        object-fit cover

    &.no-image
        display flex
        align-items center
        justify-content center

        i
            font-size 32px
            color #ccc

.goods-badges
    position absolute
    top 8px
    left 8px
    z-index 2

.badge
    padding 2px 8px
    border-radius 4px
    font-size 11px
    font-weight 600
    color #fff
    background rgba(0, 0, 0, 0.6)

.condition-badge
    background linear-gradient(135deg, #ff6b35, #ff4d4f)

.status-badge
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    background rgba(0, 0, 0, 0.6)
    display flex
    align-items center
    justify-content center
    color #fff
    font-size 14px
    font-weight 600
    z-index 3

    &.sold-badge
        background rgba(82, 196, 26, 0.8)

.goods-info
    padding 10px

.goods-name
    font-size 13px
    font-weight 500
    color #333
    margin 0 0 8px 0
    line-height 1.4
    display -webkit-box
    -webkit-line-clamp 2
    -webkit-box-orient vertical
    overflow hidden
    text-overflow ellipsis

.goods-price-row
    display flex
    justify-content space-between
    align-items center

.goods-price
    display flex
    align-items baseline

.price-symbol
    font-size 12px
    color #ff6b35
    font-weight bold

.price-value
    font-size 16px
    color #ff6b35
    font-weight 700

.goods-views
    display flex
    align-items center
    gap 2px
    font-size 11px
    color #999

    i
        font-size 12px

.empty-goods
    text-align center
    padding 40px 20px

.empty-icon
    font-size 48px
    margin-bottom 12px

.empty-text
    font-size 14px
    color #999
</style>
