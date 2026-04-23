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
    console.log('检查并修复数据库字段...');
    
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        console.log('\n=== 检查表结构 ===');
        const [columns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        console.log('当前表结构:');
        columns.forEach(col => {
            console.log(`  ${col.Field}: ${col.Type} (默认: ${col.Default})`);
        });
        
        console.log('\n=== 强制修复字段 ===');
        
        // 强制修改字段类型
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
        
        console.log('\n=== 测试插入 ===');
        // 测试插入一个包含长字符串的记录
        try {
            const testData = {
                user_id: 1,
                goods_name: '测试商品',
                category_id: 1,
                goods_desc: '测试描述',
                goods_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                goods_images: JSON.stringify(['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==']),
                goods_price: 100,
                original_price: 200,
                count: 1,
                condition: '轻微使用',
                tags: JSON.stringify(['包邮', '可小刀']),
                status: 'active',
                views: 0
            };
            
            const [result] = await sequelize.query(`
                INSERT INTO goods_table 
                (user_id, goods_name, category_id, goods_desc, goods_image, goods_images, goods_price, original_price, count, condition, tags, status, views)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, {
                replacements: [
                    testData.user_id,
                    testData.goods_name,
                    testData.category_id,
                    testData.goods_desc,
                    testData.goods_image,
                    testData.goods_images,
                    testData.goods_price,
                    testData.original_price,
                    testData.count,
                    testData.condition,
                    testData.tags,
                    testData.status,
                    testData.views
                ]
            });
            
            console.log('✅ 测试插入成功');
            
            // 删除测试数据
            await sequelize.query('DELETE FROM goods_table WHERE goods_name = ?', {
                replacements: [testData.goods_name]
            });
            console.log('✅ 测试数据已清理');
            
        } catch (e) {
            console.error('❌ 测试插入失败: ' + e.message);
        }
        
        console.log('\n✅ 修复完成!');
        
    } catch (e) {
        console.error('❌ 错误: ' + e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}

checkAndFixFields();
