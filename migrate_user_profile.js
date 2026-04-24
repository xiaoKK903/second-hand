require('dotenv').config();
var Sequelize = require('sequelize');

var sequelize = new Sequelize(
    process.env.DB_NAME || 'trading_system',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: console.log
    }
);

var addUserColumns = `
ALTER TABLE user_table
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50) DEFAULT NULL COMMENT '用户昵称' AFTER phone_num,
ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT NULL COMMENT '用户头像URL' AFTER nickname,
ADD COLUMN IF NOT EXISTS bio VARCHAR(200) DEFAULT NULL COMMENT '个人简介/个性签名' AFTER avatar,
ADD COLUMN IF NOT EXISTS contact VARCHAR(100) DEFAULT NULL COMMENT '联系方式（微信、QQ等）' AFTER bio,
ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER contact,
ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT NULL AFTER created_at;
`;

async function runMigration() {
    console.log('开始用户表字段迁移...');
    
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        
        console.log('\n检查 user_table 表...');
        try {
            var [columns] = await sequelize.query('SHOW COLUMNS FROM user_table');
            var existingColumns = columns.map(function(col) { return col.Field; });
            console.log('现有字段:', existingColumns.join(', '));
            
            var columnsToAdd = [];
            if (existingColumns.indexOf('nickname') === -1) {
                columnsToAdd.push('nickname VARCHAR(50) DEFAULT NULL');
            }
            if (existingColumns.indexOf('avatar') === -1) {
                columnsToAdd.push('avatar TEXT DEFAULT NULL');
            }
            if (existingColumns.indexOf('bio') === -1) {
                columnsToAdd.push('bio VARCHAR(200) DEFAULT NULL');
            }
            if (existingColumns.indexOf('contact') === -1) {
                columnsToAdd.push('contact VARCHAR(100) DEFAULT NULL');
            }
            if (existingColumns.indexOf('created_at') === -1) {
                columnsToAdd.push('created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
            }
            if (existingColumns.indexOf('updated_at') === -1) {
                columnsToAdd.push('updated_at DATETIME DEFAULT NULL');
            }
            
            if (columnsToAdd.length > 0) {
                console.log('\n需要添加的字段:', columnsToAdd.join(', '));
                
                for (var i = 0; i < columnsToAdd.length; i++) {
                    var columnDef = columnsToAdd[i];
                    var columnName = columnDef.split(' ')[0];
                    console.log('添加字段:', columnName);
                    await sequelize.query('ALTER TABLE user_table ADD COLUMN ' + columnDef);
                    console.log('✅ ' + columnName + ' 添加成功');
                }
            } else {
                console.log('\n✅ 所有字段已存在，无需添加');
            }
            
        } catch (e) {
            console.error('❌ 检查表或添加字段失败:', e.message);
        }
        
        console.log('\n✅ 用户表字段迁移完成!');
        console.log('\n新增字段说明:');
        console.log('  - nickname: 用户昵称');
        console.log('  - avatar: 用户头像URL');
        console.log('  - bio: 个人简介/个性签名');
        console.log('  - contact: 联系方式');
        console.log('  - created_at: 注册时间');
        console.log('  - updated_at: 更新时间');
        
    } catch (e) {
        console.error('❌ 数据库连接失败: ' + e.message);
        console.error(e.stack);
        process.exit(1);
    }
    
    await sequelize.close();
}

runMigration();
