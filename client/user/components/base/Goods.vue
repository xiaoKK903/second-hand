<template>
    <div class="goods-card" @click="goodsDetail">
        <div class="img-wrapper">
            <img :src="imgUrl" :alt="name" @error="handleImgError">
        </div>
        <div class="goods-content">
            <p class="goods-title">{{ name }}</p>
            <p class="goods-desc">{{ desc }}</p>
            <div class="goods-bottom">
                <span class="goods-price">
                    <span class="price-symbol">¥</span>
                    <span class="price-num">{{ price }}</span>
                </span>
                <span class="view-detail">查看详情</span>
            </div>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'GoodsCard',
    data() {
        return {
            defaultImg: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20placeholder%20image%20grey%20background&image_size=square'
        }
    },
    props: {
        price: {
            type: Number,
            default: 0
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
        }
    },
    methods: {
        goodsDetail() {
            this.$router.push({ path: '/site/goodsDetail?id=' + this.id });
        },
        handleImgError(e) {
            e.target.src = this.defaultImg;
        }
    }
}
</script>

<style lang="stylus">
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
        
        .view-detail
            color #409EFF
            background rgba(64, 158, 255, 0.1)

    .img-wrapper
        width 100%
        height 200px
        overflow hidden
        background #f5f5f5
        
        >img
            width 100%
            height 100%
            object-fit cover
            transition transform 0.5s ease
            
    .goods-card:hover .img-wrapper >img
        transform scale(1.08)

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
            -webkit-line-clamp 2
            -webkit-box-orient vertical
            overflow hidden
            text-overflow ellipsis

        .goods-bottom
            display flex
            justify-content space-between
            align-items center

            .goods-price
                display flex
                align-items baseline

                .price-symbol
                    font-size 14px
                    color #ff6600
                    font-weight bold
                    margin-right 2px

                .price-num
                    font-size 20px
                    color #ff6600
                    font-weight 700

            .view-detail
                font-size 13px
                color #999
                padding 6px 12px
                border-radius 20px
                background #f5f5f5
                transition all 0.3s ease
</style>
