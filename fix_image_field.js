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

async function fixImageField() {
    console.log('修复 goods_image 字段类型...');
    
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        console.log('\n检查 goods_image 字段...');
        const [columns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        const goodsImageColumn = columns.find(col => col.Field === 'goods_image');
        
        if (goodsImageColumn) {
            console.log(`当前 goods_image 类型: ${goodsImageColumn.Type}`);
            
            if (goodsImageColumn.Type.includes('varchar')) {
                console.log('修改 goods_image 类型为 TEXT...');
                await sequelize.query('ALTER TABLE goods_table MODIFY COLUMN goods_image TEXT');
                console.log('✅ goods_image 字段已修改为 TEXT');
            } else {
                console.log('✅ goods_image 字段类型已经是 TEXT');
            }
        } else {
            console.log('⚠️  goods_image 字段不存在');
        }
        
        console.log('\n验证表结构...');
        const [updatedColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        const updatedGoodsImageColumn = updatedColumns.find(col => col.Field === 'goods_image');
        console.log(`更新后 goods_image 类型: ${updatedGoodsImageColumn?.Type || '未知'}`);
        
        console.log('\n✅ 修复完成!');
        
    } catch (e) {
        console.error('❌ 错误: ' + e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}

fixImageField();
