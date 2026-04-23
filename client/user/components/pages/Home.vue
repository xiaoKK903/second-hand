<template>
    <div id="home">
        <div class="search-section">
            <el-input
                placeholder="搜索闲置物品，如：教材、手机、电脑..."
                v-model="keyword"
                clearable
                class="search-input"
                @keyup.enter.native="search">
                <el-button slot="append" type="primary" icon="el-icon-search" @click="search">搜索</el-button>
            </el-input>
        </div>
        
        <div class="category-section">
            <div class="category-title">
                <span class="title-icon">📦</span>
                <span class="title-text">商品分类</span>
            </div>
            <div class="category-list">
                <div 
                    class="category-item"
                    :class="categoryNum === 0 ? 'active' : ''"
                    @click="getGoodsByKind(0)">
                    <span class="category-icon">🏠</span>
                    <span class="category-name">全部</span>
                </div>
                <div 
                    class="category-item"
                    v-for="item in categoryList" 
                    :key="item.category_id"
                    :class="categoryNum === item.category_id ? 'active' : ''"
                    @click="getGoodsByKind(item.category_id)">
                    <span class="category-icon">{{ getCategoryIcon(item.goods_type) }}</span>
                    <span class="category-name">{{ item.goods_type }}</span>
                </div>
            </div>
        </div>

        <div class="goods-section">
            <div class="section-header">
                <span class="section-title">
                    {{ categoryNum === 0 ? '全部闲置商品' : getCategoryName(categoryNum) + '专区' }}
                </span>
                <span class="goods-count" v-if="goodsList.length > 0">
                    共 {{ goodsList.length }} 件商品
                </span>
            </div>
            
            <div class="goods-grid" v-if="goodsList.length > 0">
                <div class="goods-item" v-for="goods in goodsList" :key="goods.goods_id">
                    <goods-card 
                        :price="goods.goods_price" 
                        :name="goods.goods_name" 
                        :desc="goods.goods_desc" 
                        :imgUrl="goods.goods_image"
                        :id="goods.goods_id">
                    </goods-card>
                </div>
            </div>
            
            <div class="empty-state" v-else>
                <div class="empty-icon">📭</div>
                <div class="empty-text">暂无商品</div>
            </div>
        </div>

        <div class="pagination-section" v-if="goodsList.length > 0">
            <el-pagination
                background
                layout="prev, pager, next"
                class="pagination"
                :hide-on-single-page="true"
                :page-count="page.pageCount"
                :page-size="page.pageSize"
                :current-page="page.currentPage"
                @current-change="pageChange">
            </el-pagination>
        </div>
    </div>
</template>

<script lang="typescript">
import Goods from '../base/Goods.vue';

export default {
    name: 'home',
    data() {
        return {
            categoryNum: 0,
            goodsList: [],
            categoryList: [],
            keyword: '',
            page: {
                currentPage: 1,
                pageSize: 12,
                pageCount: 1
            }
        }
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
        getCategoryName(categoryId) {
            const category = this.categoryList.find(c => c.category_id === categoryId);
            return category ? category.goods_type : '';
        },
        getGoodsByKind(categoryNum) {
            this.categoryNum = categoryNum;
            if (this.categoryNum === 0) {
                this.getAllGoods();
            } else {
                this.axios.get('/site/goods/' + categoryNum).then(res => {
                    this.goodsList = res.data;
                }, err => {
                    console.error(err);
                });
            }
        },
        getAllGoods() {
            this.axios.get('/site/index').then(res => {
                this.page.pageCount = Math.ceil(res.data.length / this.page.pageSize);
                this.pageChange(this.page.currentPage);
            }, err => {
                console.error(err);
            });
        },
        getCategory() {
            this.axios.get('/site/category').then(res => {
                this.categoryList = res.data;
            }, err => {
                console.error(err);
            });
        },
        search() {
            if (!this.keyword.trim()) {
                this.getAllGoods();
                return;
            }
            this.axios.get('/site/search', {
                params: {
                    keyword: this.keyword
                }
            }).then(res => {
                this.goodsList = res.data;
                this.categoryNum = 0;
            }, err => {
                console.error(err);
            });
        },
        pageChange(currentPage) {
            this.page.currentPage = currentPage;
            this.axios.get('/site/goodsPage', {
                params: {
                    currentPage: currentPage,
                    pageSize: this.page.pageSize
                }
            }).then(res => {
                this.goodsList = res.data;
            }, err => {
                console.error(err);
            });
        }
    },
    components: {
        'goods-card': Goods
    }
}
</script>

<style lang="stylus">
#home
    padding 24px
    min-height calc(100vh - 60px)
    background #f5f7fa

    .search-section
        margin-bottom 24px
        
        .search-input
            max-width 600px
            margin 0 auto
            
            >>> .el-input__inner
                height 48px
                font-size 15px
                border-radius 24px 0 0 24px
                border-right none
                
            >>> .el-input-group__append
                background #409EFF
                border #409EFF
                border-radius 0 24px 24px 0
                padding 0
                
                .el-button
                    height 48px
                    padding 0 24px
                    border none
                    border-radius 0 24px 24px 0
                    
                    &:hover
                        background #66b1ff
                        
    .category-section
        background #fff
        border-radius 12px
        padding 20px
        margin-bottom 24px
        box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)
        
        .category-title
            display flex
            align-items center
            margin-bottom 16px
            
            .title-icon
                font-size 20px
                margin-right 8px
                
            .title-text
                font-size 18px
                font-weight 600
                color #303133
                
        .category-list
            display flex
            flex-wrap wrap
            gap 12px
            
            .category-item
                display flex
                flex-direction column
                align-items center
                padding 12px 20px
                border-radius 8px
                cursor pointer
                transition all 0.3s ease
                background #f5f7fa
                
                &:hover
                    background #ecf5ff
                    transform translateY(-2px)
                    
                &.active
                    background #409EFF
                    
                    .category-icon
                        color #fff
                        
                    .category-name
                        color #fff
                    
            .category-icon
                font-size 24px
                margin-bottom 4px
                
            .category-name
                font-size 14px
                color #606266
                font-weight 500
                
    .goods-section
        background #fff
        border-radius 12px
        padding 20px
        margin-bottom 24px
        box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)
        
        .section-header
            display flex
            justify-content space-between
            align-items center
            margin-bottom 20px
            padding-bottom 16px
            border-bottom 1px solid #ebeef5
            
            .section-title
                font-size 18px
                font-weight 600
                color #303133
                
            .goods-count
                font-size 13px
                color #909399
                
        .goods-grid
            display grid
            grid-template-columns repeat(auto-fill, minmax(240px, 1fr))
            gap 20px
            
            .goods-item
                display flex
                justify-content center
                
        .empty-state
            text-align center
            padding 60px 0
            
            .empty-icon
                font-size 64px
                margin-bottom 16px
                
            .empty-text
                font-size 16px
                color #909399
                
    .pagination-section
        display flex
        justify-content center
        padding 20px
        
        .pagination
            >>> .el-pager li
                background #fff
                border 1px solid #dcdfe6
                border-radius 4px
                margin 0 4px
                
                &.active
                    background #409EFF
                    border-color #409EFF
                    
            >>> .btn-prev, >>> .btn-next
                background #fff
                border 1px solid #dcdfe6
                border-radius 4px
</style>
