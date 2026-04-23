const session = require('koa-session');

module.exports = (app) => {
    app.keys = [process.env.SESSION_KEY || 'some-secret-hurr-change-me'];
    const CONFIG = {
        key: 'koa:sess',
        maxAge: 86400000,
        overwrite: true,
        httpOnly: true,
        signed: true,
        secure: process.env.NODE_ENV === 'production'
    };
    app.use(session(CONFIG, app));
};