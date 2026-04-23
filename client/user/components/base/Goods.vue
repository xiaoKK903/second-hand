<template>
    <div class="goods-card" @click="goodsDetail">
        <div class="img-wrapper">
            <img :src="imgUrl" :alt="name" @error="handleImgError">
            <div class="card-badges" v-if="condition || showTags">
                <span class="badge condition-badge" v-if="condition">
                    <span class="badge-icon">{{ getConditionIcon(condition) }}</span>
                    {{ condition }}
                </span>
                <span class="badge tag-badge" v-for="tag in displayTags" :key="tag" :class="'tag-' + getTagClass(tag)">
                    {{ tag }}
                </span>
            </div>
            <div class="image-count" v-if="imagesCount > 1">
                <i class="el-icon-picture"></i>
                {{ imagesCount }}
            </div>
        </div>
        <div class="goods-content">
            <p class="goods-title">{{ name }}</p>
            <p class="goods-desc">{{ desc }}</p>
            <div class="goods-bottom">
                <div class="price-section">
                    <span class="goods-price">
                        <span class="price-symbol">¥</span>
                        <span class="price-num">{{ formatPrice(price) }}</span>
                    </span>
                    <span class="original-price" v-if="originalPrice && originalPrice > price">
                        <span class="original-label">原价</span>
                        <span class="original-value">¥{{ formatPrice(originalPrice) }}</span>
                        <span class="discount-badge">{{ getDiscount() }}折</span>
                    </span>
                </div>
                <div class="stats-section">
                    <span class="stat-item" v-if="views >= 0">
                        <i class="el-icon-view"></i>
                        {{ formatViews(views) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'GoodsCard',
    data() {
        return {
            defaultImg: '/static/img/goods.webp'
        }
    },
    props: {
        price: {
            type: [Number, String],
            default: 0
        },
        originalPrice: {
            type: [Number, String],
            default: null
        },
        name: {
            type: String,
            default: ''
        },
        desc: {
            type: String,
            default: ''
        },
        imgUrl: {
            type: String,
            default: ''
        },
        id: {
            type: Number,
            default: 0
        },
        condition: {
            type: String,
            default: ''
        },
        tags: {
            type: Array,
            default: () => []
        },
        views: {
            type: Number,
            default: -1
        },
        imagesCount: {
            type: Number,
            default: 1
        },
        showTags: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        displayTags() {
            if (!this.tags || !Array.isArray(this.tags)) return [];
            return this.tags.slice(0, 2);
        }
    },
    methods: {
        formatPrice(price) {
            if (price === null || price === undefined) return '0';
            const num = Number(price);
            if (num === Math.floor(num)) {
                return num.toString();
            }
            return num.toFixed(2);
        },
        formatViews(views) {
            if (views < 1000) return views;
            if (views < 10000) return (views / 1000).toFixed(1) + 'k';
            return (views / 10000).toFixed(1) + 'w';
        },
        getDiscount() {
            if (!this.originalPrice || !this.price || Number(this.originalPrice) <= 0) {
                return 0;
            }
            const discount = (Number(this.price) / Number(this.originalPrice) * 10).toFixed(1);
            return discount;
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
        getTagClass(tag) {
            const classes = {
                '包邮': 'free',
                '可小刀': 'bargain',
                '自提': 'self',
                '价格面议': 'negotiate',
                '支持自提': 'support-self',
                '可租可买': 'rent'
            };
            return classes[tag] || '';
        },
        goodsDetail() {
            this.$router.push({ path: '/site/goodsDetail?id=' + this.id });
        },
        handleImgError(e) {
            e.target.src = this.defaultImg;
        }
    }
}
</script>

<style lang="stylus" scoped>
.goods-card
    width 240px
    background #fff
    border-radius 12px
    overflow hidden
    cursor pointer
    transition all 0.3s ease
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.08)
    position relative
    
    &:hover
        transform translateY(-8px)
        box-shadow 0 12px 24px rgba(0, 0, 0, 0.15)

    .img-wrapper
        width 100%
        height 200px
        overflow hidden
        background #f5f5f5
        position relative
        
        >img
            width 100%
            height 100%
            object-fit cover
            transition transform 0.5s ease
            
    .goods-card:hover .img-wrapper >img
        transform scale(1.08)

    .card-badges
        position absolute
        top 10px
        left 10px
        display flex
        flex-wrap wrap
        gap 6px
        z-index 2

    .badge
        display inline-flex
        align-items center
        gap 4px
        padding 4px 10px
        border-radius 4px
        font-size 12px
        font-weight 600
        color #fff
        text-shadow 0 1px 2px rgba(0, 0, 0, 0.2)
        backdrop-filter blur(4px)

        .badge-icon
            font-size 14px

    .condition-badge
        background linear-gradient(135deg, #ff6b35, #ff4d4f)
        box-shadow 0 2px 8px rgba(255, 107, 53, 0.3)

    .tag-badge
        background rgba(0, 0, 0, 0.6)

        &.tag-free
            background linear-gradient(135deg, #52c41a, #389e0d)

        &.tag-bargain
            background linear-gradient(135deg, #faad14, #d48806)

        &.tag-self
            background linear-gradient(135deg, #1890ff, #096dd9)

        &.tag-negotiate
            background linear-gradient(135deg, #722ed1, #531dab)

        &.tag-support-self
            background linear-gradient(135deg, #13c2c2, #08979c)

        &.tag-rent
            background linear-gradient(135deg, #eb2f96, #c41d7f)

    .image-count
        position absolute
        top 10px
        right 10px
        display flex
        align-items center
        gap 4px
        padding 4px 8px
        background rgba(0, 0, 0, 0.5)
        border-radius 4px
        color #fff
        font-size 12px
        font-weight 500
        backdrop-filter blur(4px)
        z-index 2

        i
            font-size 14px

    .goods-content
        padding 16px

        .goods-title
            font-size 15px
            font-weight 600
            color #333
            margin 0 0 8px 0
            line-height 1.4
            display -webkit-box
            -webkit-line-clamp 2
            -webkit-box-orient vertical
            overflow hidden
            text-overflow ellipsis

        .goods-desc
            font-size 13px
            color #999
            margin 0 0 12px 0
            line-height 1.5
            display -webkit-box
            -webkit-line-clamp 1
            -webkit-box-orient vertical
            overflow hidden
            text-overflow ellipsis

        .goods-bottom
            display flex
            flex-direction column
            gap 8px

            .price-section
                display flex
                flex-direction column
                gap 4px

                .goods-price
                    display flex
                    align-items baseline

                    .price-symbol
                        font-size 14px
                        color #ff6b35
                        font-weight bold
                        margin-right 2px

                    .price-num
                        font-size 22px
                        color #ff6b35
                        font-weight 700

                .original-price
                    display flex
                    align-items center
                    gap 6px

                    .original-label
                        font-size 11px
                        color #999

                    .original-value
                        font-size 13px
                        color #999
                        text-decoration line-through

                    .discount-badge
                        background linear-gradient(135deg, #ff6b35, #ff4d4f)
                        color #fff
                        padding 2px 6px
                        border-radius 8px
                        font-size 11px
                        font-weight bold

            .stats-section
                display flex
                gap 12px

                .stat-item
                    display flex
                    align-items center
                    gap 4px
                    font-size 12px
                    color #999

                    i
                        font-size 14px
</style>
