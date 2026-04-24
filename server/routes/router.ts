var router = require('koa-router')();
var UserController = require('../controller/UserController.ts');
var GoodsController = require('../controller/GoodsController.ts');
var CategoryController = require('../controller/CategoryController.ts');
var CartController = require('../controller/CartController.ts');
var AddressController = require('../controller/AddressController.ts');
var FeedbackController = require('../controller/FeedbackController.ts');
var OrderController = require('../controller/OrderController.ts');
var ImageController = require('../controller/ImageController.ts');
var CommentController = require('../controller/CommentController.ts');
var ChatController = require('../controller/ChatController.ts');
var AdminController = require('../controller/AdminController.ts');

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
    router.get('/site/goodsPage', GoodsController.getGoodsByPage);
    router.get('/site/findGoods/:id', GoodsController.getGoodsById);
    router.post('/site/login', UserController.doLogin);
    router.post('/site/register', UserController.doRegister);
    
    router.post('/site/user/profile', UserController.updateProfile);
    router.get('/site/seller/:user_id', UserController.getSellerProfile);
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
    
    router.get('/goods/:id/comments', CommentController.getComments);
    router.post('/goods/:id/comment', CommentController.addComment);
    router.delete('/comments/:comment_id', CommentController.deleteComment);
    router.get('/goods/:id/comments/count', CommentController.getCommentsCount);
    
    router.post('/chat/session', ChatController.getOrCreateSession);
    router.get('/chat/sessions', ChatController.getUserSessions);
    router.get('/chat/session/:session_id/messages', ChatController.getSessionMessages);
    router.post('/chat/message', ChatController.sendMessage);
    router.post('/chat/session/:session_id/read', ChatController.markAsRead);
    router.get('/chat/unread', ChatController.getUnreadCount);
    
    router.post('/admin/check', AdminController.checkAdmin);
    router.get('/admin/stats', AdminController.getStatistics);
    router.get('/admin/users', AdminController.getUsers);
    router.post('/admin/user/toggleActive', AdminController.toggleUserActive);
    router.post('/admin/user/toggleRole', AdminController.toggleUserRole);
    router.get('/admin/goods', AdminController.getGoods);
    router.post('/admin/goods/audit', AdminController.auditGoods);
    router.post('/admin/goods/takedown', AdminController.takeDownGoods);
    router.post('/admin/goods/delete', AdminController.deleteGoods);
    
    router.get('/site/goods/:id', GoodsController.getGoodsByCategory);
    
    app.use(router.routes()).use(router.allowedMethods());
};
