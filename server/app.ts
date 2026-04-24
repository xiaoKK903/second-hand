require('dotenv').config();
var Koa = require('koa');
var app = new Koa();
var router = require('./routes/router.ts');
var cors = require('koa2-cors');
var bodyParser = require('koa-bodyparser');
var session = require('./config/session.ts');
var koaStatic = require('koa-static');
var path = require('path');

// 解决跨域
var allowOrigins = ['http://localhost:8080', 'http://localhost:8085'];
app.use(cors({
    origin: function(ctx) {
        if(allowOrigins.indexOf(ctx.header.origin) !== -1) return ctx.header.origin;
        return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    withCredentials:true,
    allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// bodyParser 必须在 router 之前，否则 ctx.request.body 会是 undefined
app.use(bodyParser({
    jsonLimit: '10mb',
    formLimit: '10mb'
}));

session(app);
app.use(koaStatic(path.join(__dirname, './public/dist')));

// router 必须在 bodyParser 和 session 之后
router(app);

app.listen(3000, function() {
    console.log('server is running at http://localhost:3000');
});