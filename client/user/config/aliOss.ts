const OSS = require('ali-oss');

const client = new OSS({
    bucket: process.env.ALI_OSS_BUCKET || '',
    region: process.env.ALI_OSS_REGION || '',
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET || ''
});

export default client;
