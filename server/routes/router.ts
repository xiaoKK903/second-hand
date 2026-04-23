const router = require('koa-router')();
const UserController = require('../controller/UserController.ts');
const GoodsController = require('../controller/GoodsController.ts');
const CategoryController = require('../controller/CategoryController.ts');
const CartController = require('../controller/CartController.ts');
const AddressController = require('../controller/AddressController.ts');
const FeedbackController = require('../controller/FeedbackController.ts');
const OrderController = require('../controller/OrderController.ts');
const ImageController = require('../controller/ImageController.ts');

module.exports = (app) => {
    router.get('/site/conditions', GoodsController.getConditions);
    router.get('/site/tags', GoodsController.getTags);
    router.get('/site/goods/count', GoodsController.getGoodsCount);
    router.get('/site/goods/my', GoodsController.getMyGoods);
    router.post('/site/goods/:id/status', GoodsController.updateGoodsStatus);
    router.post('/site/goods/:id/update', GoodsController.updateGoods);
    router.delete('/site/goods/:id', GoodsController.deleteGoods);
    router.get('/site/goods/condition/:condition', GoodsController.getGoodsByCondition);

    router.get('/site/index', GoodsController.getAllGoods);
    router.post('/site/goods', GoodsController.publishGoods);
    router.get('/site/search', GoodsController.searchGoods);
    router.get('/site/category', CategoryController.getCategory);
    router.get('/site/goods/:id', GoodsController.getGoodsByCategory);
    router.get('/site/goodsPage', GoodsController.getGoodsByPage);
    router.get('/site/findGoods/:id', GoodsController.getGoodsById);
    router.post('/site/login', UserController.doLogin);
    router.post('/site/register', UserController.doRegister);
    router.get('/site/user/:uid', UserController.getUserById);
    router.post('/site/user', UserController.updatePass);
    router.get('/site/recommend', GoodsController.getRecommendGoods);
    router.post('/site/addToCart', CartController.addToCart);
    router.get('/site/cart/:uid', CartController.getUserCart);
    router.post('/site/cart', CartController.changeCartCount);
    router.post('/site/delCartGoods', CartController.delCartGoods);
    router.post('/site/emptyCart', CartController.emptyCart);
    router.post('/site/addAddress', AddressController.addAddress);
    router.get('/site/getAddress/:uid', AddressController.getAddress);
    router.get('/site/getReceiverAddress/:aid', AddressController.getReceiverAddress);
    router.post('/site/delAddress', AddressController.delAddress);
    router.post('/site/feedback', FeedbackController.addFeedback);
    router.post('/site/addOrder', OrderController.addOrder);
    router.get('/site/order/:uid', OrderController.getOrder);
    router.get('/site/publisherOrder/:uid', OrderController.getPublisherOrder);
    router.post('/site/receipt', OrderController.confirmReceipt);
    router.post('/site/uploadImages', ImageController.uploadImages);
    router.get('/site/getImages/:gid', ImageController.getImages);
    
    // 测试端点
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
    
    app.use(router.routes()).use(router.allowedMethods());
};