<template>
    <div id="recommend">
        <div class="recommend-header">
            <h2 class="recommend-title">
                <span class="title-icon">🔥</span>
                校园精选推荐
            </h2>
            <p class="recommend-desc">每天为你精选优质闲置好物</p>
        </div>
        
        <div class="category-section" v-for="category in categoryList" :key="category.category_id">
            <div class="category-header">
                <div class="category-title">
                    <span class="category-icon">{{ getCategoryIcon(category.goods_type) }}</span>
                    <span class="category-name">{{ category.goods_type }}</span>
                    <span class="hot-badge" v-if="isHotCategory(category.goods_type)">热门</span>
                </div>
                <el-button type="text" class="view-more" @click="goToCategory(category.category_id)">
                    查看更多 <i class="el-icon-arrow-right"></i>
                </el-button>
            </div>
            
            <div class="goods-grid" v-if="getGoodsByCategory(category.category_id).length > 0">
                <div class="goods-item" v-for="(goods, index) in getGoodsByCategory(category.category_id)" :key="goods.goods_id">
                    <div class="rank-badge" v-if="index < 3">
                        <span class="rank-num" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                    </div>
                    <goods-card 
                        :price="goods.goods_price" 
                        :originalPrice="goods.original_price"
                        :name="goods.goods_name" 
                        :desc="goods.goods_desc" 
                        :imgUrl="goods.goods_image"
                        :id="goods.goods_id"
                        :condition="goods.condition"
                        :tags="goods.tags"
                        :views="goods.views"
                        :imagesCount="getImagesCount(goods)">
                    </goods-card>
                </div>
            </div>
            
            <div class="empty-category" v-else>
                <span class="empty-text">该分类暂无商品</span>
            </div>
        </div>

        <div class="refresh-btn">
            <el-button type="primary" icon="el-icon-refresh" @click="refresh">换一批推荐</el-button>
        </div>
    </div>
</template>

<script lang="typescript">
import Goods from '../base/Goods.vue';

export default {
    data() {
        return {
            allGoodsList: [],
            categoryList: []
        }
    },
    components: {
        'goods-card': Goods
    },
    created() {
        this.getAllGoods();
        this.getCategory();
    },
    methods: {
        getCategoryIcon(type) {
            const icons = {
                '书籍教材': '📚',
                '电子产品': '📱',
                '生活用品': '🏠',
                '体育用品': '⚽',
                '美妆服饰': '👗'
            };
            return icons[type] || '📦';
        },
        isHotCategory(type) {
            return ['书籍教材', '电子产品'].includes(type);
        },
        getImagesCount(goods) {
            let count = 0;
            if (goods.goods_image) count++;
            if (goods.goods_images && Array.isArray(goods.goods_images)) {
                count += goods.goods_images.length;
            }
            return Math.max(count, 1);
        },
        getCategory() {
            this.axios.get('/site/category').then(res => {
                this.categoryList = res.data;
            }, err => {
                console.error(err);
            });
        },
        getAllGoods() {
            this.axios.get('/site/index').then(res => {
                this.allGoodsList = this.shuffleArray(res.data);
            }, err => {
                console.error(err);
            });
        },
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        },
        getGoodsByCategory(categoryId) {
            return this.allGoodsList
                .filter(g => g.category_id === categoryId)
                .slice(0, 4);
        },
        goToCategory(categoryId) {
            this.$router.push({ path: '/site/index', query: { category: categoryId } });
        },
        refresh() {
            this.getAllGoods();
            this.$message({
                message: '已更新推荐商品',
                type: 'success'
            });
        }
    }
}
</script>

<style lang="stylus">
#recommend
    padding 24px
    min-height calc(100vh - 60px)
    background #f5f7fa

    .recommend-header
        text-align center
        margin-bottom 32px
        padding 32px
        background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
        border-radius 16px
        color #fff
        box-shadow 0 8px 24px rgba(102, 126, 234, 0.3)

        .recommend-title
            font-size 28px
            font-weight 700
            margin 0 0 12px 0
            display flex
            align-items center
            justify-content center
            gap 12px

            .title-icon
                font-size 36px

        .recommend-desc
            font-size 16px
            margin 0
            opacity 0.9

    .category-section
        background #fff
        border-radius 12px
        padding 24px
        margin-bottom 24px
        box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)

        .category-header
            display flex
            justify-content space-between
            align-items center
            margin-bottom 20px
            padding-bottom 16px
            border-bottom 1px solid #ebeef5

            .category-title
                display flex
                align-items center
                gap 10px

                .category-icon
                    font-size 28px

                .category-name
                    font-size 18px
                    font-weight 600
                    color #303133

                .hot-badge
                    padding 2px 8px
                    background #ff4d4f
                    color #fff
                    font-size 12px
                    border-radius 10px
                    font-weight 500

            .view-more
                font-size 14px
                color #409EFF
                cursor pointer

                &:hover
                    color #66b1ff

        .goods-grid
            display grid
            grid-template-columns repeat(4, 1fr)
            gap 20px

            .goods-item
                position relative
                display flex
                justify-content center

                .rank-badge
                    position absolute
                    top 12px
                    left 12px
                    z-index 10

                    .rank-num
                        width 28px
                        height 28px
                        border-radius 50%
                        display flex
                        align-items center
                        justify-content center
                        font-size 14px
                        font-weight 700
                        color #fff
                        box-shadow 0 2px 8px rgba(0, 0, 0, 0.2)

                        &.rank-1
                            background linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)

                        &.rank-2
                            background linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)

                        &.rank-3
                            background linear-gradient(135deg, #cd7f32 0%, #daa520 100%)

        .empty-category
            text-align center
            padding 40px 0

            .empty-text
                color #909399
                font-size 14px

    .refresh-btn
        text-align center
        padding 20px

        .el-button
            padding 12px 32px
            border-radius 25px
            font-size 15px
</style>
