const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'trading_system',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: console.log
    }
);

async function checkAndFixFields() {
    console.log('检查数据库字段...');
    
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        console.log('\n=== 检查表结构 ===');
        const [columns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        console.log('当前表结构:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type}`);
        });
        
        console.log('\n=== 检查并修复字段 ===');
        
        const fixQueries = [
            "ALTER TABLE goods_table MODIFY COLUMN goods_image TEXT NULL",
            "ALTER TABLE goods_table MODIFY COLUMN goods_images TEXT NULL",
            "ALTER TABLE goods_table MODIFY COLUMN tags TEXT NULL",
            "ALTER TABLE goods_table MODIFY COLUMN goods_desc TEXT NULL"
        ];
        
        for (const query of fixQueries) {
            try {
                await sequelize.query(query);
                console.log(`✅ 执行成功: ${query.substring(0, 60)}...`);
            } catch (e) {
                console.log(`⚠️  执行失败: ${e.message.substring(0, 50)}`);
            }
        }
        
        console.log('\n=== 验证修复结果 ===');
        const [updatedColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        console.log('更新后表结构:');
        updatedColumns.forEach(col => {
            const typesToCheck = ['goods_image', 'goods_images', 'tags', 'goods_desc'];
            if (typesToCheck.includes(col.Field)) {
                console.log(`  ${col.Field}: ${col.Type}`);
            }
        });
        
        console.log('\n✅ 修复完成!');
        
    } catch (e) {
        console.error('❌ 错误: ' + e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}

checkAndFixFields();
