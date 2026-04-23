const Koa = require('koa');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');

const app = new Koa();
app.use(bodyParser({ jsonLimit: '10mb' }));

router.post('/test/publish', async (ctx) => {
    try {
        const body = ctx.request.body;
        console.log('=== 测试发布数据 ===');
        console.log('商品名称:', body.name);
        console.log('商品价格:', body.price);
        console.log('商品图片长度:', body.imageUrl ? body.imageUrl.length : '无');
        console.log('商品图片类型:', body.imageUrl ? body.imageUrl.substring(0, 50) : '无');
        console.log('多图数量:', body.goods_images ? body.goods_images.length : 0);
        console.log('成色:', body.condition);
        console.log('标签:', body.tags);
        
        if (body.imageUrl && body.imageUrl.length > 10000) {
            console.log('⚠️  图片URL过长:', body.imageUrl.length, '字符');
        }
        
        ctx.body = {
            success: true,
            message: '测试成功',
            data: {
                imageUrlLength: body.imageUrl ? body.imageUrl.length : 0,
                goodsImagesCount: body.goods_images ? body.goods_images.length : 0
            }
        };
        
    } catch (e) {
        console.error('测试错误:', e);
        ctx.body = {
            success: false,
            message: e.message
        };
    }
});

app.use(router.routes());

app.listen(3001, () => {
    console.log('测试服务器运行在 http://localhost:3001');
    console.log('请在前端发布页面中临时修改 API 地址为 /test/publish');
});
