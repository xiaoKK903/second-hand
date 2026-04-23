require('dotenv').config();
const Koa = require('koa');
const app = new Koa();
const router = require('./routes/router.ts');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const session = require('./config/session.ts');
const koaStatic = require('koa-static');
const path = require('path');

// 解决跨域
const allowOrigins = ['http://localhost:8080', 'http://localhost:8085'];
app.use(cors({
    origin: function(ctx) {
        if(allowOrigins.includes(ctx.header.origin)) return ctx.header.origin;
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

app.listen(3000, () => {
    console.log('server is running at http://localhost:3000');
});