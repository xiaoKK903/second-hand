<template>
    <div id="my-goods">
        <div class="goods-header">
            <h4 class="page-title">我的发布</h4>
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                <el-tab-pane label="全部" name="all"></el-tab-pane>
                <el-tab-pane label="出售中" name="active"></el-tab-pane>
                <el-tab-pane label="已下架" name="inactive"></el-tab-pane>
            </el-tabs>
        </div>

        <div class="goods-list" v-if="goodsList.length > 0">
            <div class="goods-item" v-for="goods in goodsList" :key="goods.goods_id">
                <div class="goods-image" @click="goToDetail(goods)">
                    <img :src="goods.goods_image || defaultImage" @error="handleImgError">
                    <div class="goods-badges">
                        <span class="badge condition-badge" v-if="goods.condition">
                            {{ goods.condition }}
                        </span>
                        <span class="badge status-badge" :class="'status-' + goods.status">
                            {{ getStatusText(goods.status) }}
                        </span>
                    </div>
                </div>
                <div class="goods-info" @click="goToDetail(goods)">
                    <div class="goods-name">{{ goods.goods_name }}</div>
                    <div class="goods-desc">{{ goods.goods_desc }}</div>
                    <div class="goods-meta">
                        <span class="meta-item">
                            <i class="el-icon-view"></i>
                            {{ goods.views || 0 }} 浏览
                        </span>
                        <span class="meta-item" v-if="goods.created_at">
                            <i class="el-icon-time"></i>
                            {{ formatDate(goods.created_at) }}
                        </span>
                    </div>
                    <div class="goods-price-section">
                        <span class="current-price">
                            <span class="price-symbol">¥</span>
                            <span class="price-value">{{ formatPrice(goods.goods_price) }}</span>
                        </span>
                        <span class="original-price" v-if="goods.original_price && goods.original_price > goods.goods_price">
                            ¥{{ formatPrice(goods.original_price) }}
                        </span>
                    </div>
                </div>
                <div class="goods-actions">
                    <el-button 
                        type="primary" 
                        size="small"
                        @click="editGoods(goods)">
                        <i class="el-icon-edit"></i>
                        编辑
                    </el-button>
                    <el-button 
                        v-if="goods.status === 'active'"
                        type="warning" 
                        size="small"
                        @click="toggleStatus(goods, 'inactive')">
                        <i class="el-icon-arrow-down"></i>
                        下架
                    </el-button>
                    <el-button 
                        v-if="goods.status === 'inactive'"
                        type="success" 
                        size="small"
                        @click="toggleStatus(goods, 'active')">
                        <i class="el-icon-arrow-up"></i>
                        上架
                    </el-button>
                    <el-button 
                        type="danger" 
                        size="small"
                        @click="deleteGoods(goods)">
                        <i class="el-icon-delete"></i>
                        删除
                    </el-button>
                </div>
            </div>
        </div>

        <div class="empty-state" v-else>
            <div class="empty-icon">📦</div>
            <div class="empty-text">暂无发布的商品</div>
            <el-button type="primary" @click="goToPublish">
                <i class="el-icon-plus"></i>
                去发布
            </el-button>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'MyGoods',
    data() {
        return {
            activeTab: 'all',
            goodsList: [],
            defaultImage: '/static/img/goods.webp'
        }
    },
    created() {
        this.getMyGoods();
    },
    methods: {
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
        getStatusText: function(status) {
            var statusMap = {
                'active': '出售中',
                'inactive': '已下架',
                'sold': '已售出'
            };
            return statusMap[status] || status;
        },
        handleTabClick: function(tab) {
            this.activeTab = tab.name;
            this.getMyGoods();
        },
        getMyGoods: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            var params = { uid: uid };
            if (this.activeTab !== 'all') {
                params.status = this.activeTab;
            }
            var that = this;
            this.axios.get('/site/goods/my', { params: params }).then(function(res) {
                if (res.data && res.data.data) {
                    that.goodsList = res.data.data;
                }
            }, function(err) {
                console.error(err);
                that.$message.error('获取商品列表失败');
            });
        },
        toggleStatus: function(goods, status) {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) return;
            var action = status === 'active' ? '上架' : '下架';
            var that = this;
            this.$confirm('确定要' + action + '这件商品吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.axios.post('/site/goods/' + goods.goods_id + '/status', {
                    uid: uid,
                    status: status
                }).then(function(res) {
                    if (res.data.success) {
                        that.$message.success('商品' + action + '成功');
                        that.getMyGoods();
                    } else {
                        that.$message.error(res.data.msg || '商品' + action + '失败');
                    }
                }, function(err) {
                    console.error(err);
                    that.$message.error('商品' + action + '失败');
                });
            }).catch(function() {});
        },
        deleteGoods: function(goods) {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) return;
            var that = this;
            this.$confirm('确定要删除这件商品吗？此操作不可恢复。', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.axios.delete('/site/goods/' + goods.goods_id, {
                    data: { uid: uid }
                }).then(function(res) {
                    if (res.data.success) {
                        that.$message.success('商品删除成功');
                        that.getMyGoods();
                    } else {
                        that.$message.error(res.data.msg || '删除失败');
                    }
                }, function(err) {
                    console.error(err);
                    that.$message.error('删除失败');
                });
            }).catch(function() {});
        },
        goToDetail: function(goods) {
            this.$router.push({ path: '/site/goodsDetail', query: { id: goods.goods_id } });
        },
        editGoods: function(goods) {
            this.$router.push({ name: 'publish', query: { id: goods.goods_id } });
        },
        goToPublish: function() {
            this.$router.push({ name: 'publish' });
        },
        handleImgError: function(e) {
            e.target.src = this.defaultImage;
        }
    }
}
</script>

<style lang="stylus" scoped>
#my-goods
    padding 20px

    .goods-header
        margin-bottom 20px

        .page-title
            margin 0 0 16px 0
            font-size 18px
            font-weight 600
            color #333

        /deep/ .el-tabs__header
            margin-bottom 0

        /deep/ .el-tabs__nav-wrap::after
            height 1px

    .goods-list
        display flex
        flex-direction column
        gap 16px

    .goods-item
        display flex
        gap 16px
        padding 16px
        background #fff
        border-radius 12px
        box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)
        transition all 0.3s

        &:hover
            box-shadow 0 4px 20px rgba(0, 0, 0, 0.1)

    .goods-image
        position relative
        width 120px
        height 120px
        flex-shrink 0
        border-radius 8px
        overflow hidden
        cursor pointer

        img
            width 100%
            height 100%
            object-fit cover

        .goods-badges
            position absolute
            top 8px
            left 8px
            display flex
            flex-direction column
            gap 4px

        .badge
            display inline-block
            padding 2px 8px
            border-radius 4px
            font-size 11px
            font-weight 600
            color #fff

        .condition-badge
            background linear-gradient(135deg, #ff6b35, #ff4d4f)

        .status-badge
            &.status-active
                background linear-gradient(135deg, #52c41a, #389e0d)

            &.status-inactive
                background linear-gradient(135deg, #909399, #606266)

            &.status-sold
                background linear-gradient(135deg, #409EFF, #3073a6)

    .goods-info
        flex 1
        min-width 0
        cursor pointer
        display flex
        flex-direction column
        justify-content space-between

    .goods-name
        font-size 15px
        font-weight 600
        color #333
        line-height 1.4
        margin 0 0 8px 0
        overflow hidden
        text-overflow ellipsis
        white-space nowrap

    .goods-desc
        font-size 13px
        color #999
        line-height 1.5
        margin 0 0 8px 0
        display -webkit-box
        -webkit-line-clamp 2
        -webkit-box-orient vertical
        overflow hidden
        text-overflow ellipsis

    .goods-meta
        display flex
        gap 16px
        margin-bottom 8px

        .meta-item
            display flex
            align-items center
            gap 4px
            font-size 12px
            color #999

            i
                font-size 14px

    .goods-price-section
        display flex
        align-items baseline
        gap 8px

        .current-price
            display flex
            align-items baseline

            .price-symbol
                font-size 14px
                color #ff6b35
                font-weight bold

            .price-value
                font-size 24px
                color #ff6b35
                font-weight 700

        .original-price
            font-size 14px
            color #999
            text-decoration line-through

    .goods-actions
        display flex
        flex-direction column
        gap 8px
        justify-content center
        flex-shrink 0

    .empty-state
        text-align center
        padding 60px 0

        .empty-icon
            font-size 64px
            margin-bottom 16px

        .empty-text
            font-size 16px
            color #999
            margin-bottom 24px
</style>
