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

const alterSQL = [
    "ALTER TABLE goods_table ADD COLUMN original_price DECIMAL(10,2) DEFAULT '0.00'",
    "ALTER TABLE goods_table ADD COLUMN `condition` VARCHAR(20) DEFAULT '轻微使用'",
    "ALTER TABLE goods_table ADD COLUMN tags TEXT",
    "ALTER TABLE goods_table ADD COLUMN goods_images TEXT",
    "ALTER TABLE goods_table ADD COLUMN `status` VARCHAR(20) DEFAULT 'active'",
    "ALTER TABLE goods_table ADD COLUMN views INT DEFAULT 0",
    "ALTER TABLE goods_table ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE goods_table ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
];

const updateSQL = [
    "UPDATE goods_table SET `status` = 'active' WHERE `status` IS NULL OR `status` = ''",
    "UPDATE goods_table SET views = 0 WHERE views IS NULL",
    "UPDATE goods_table SET `condition` = '轻微使用' WHERE `condition` IS NULL OR `condition` = ''"
];

async function runMigration() {
    console.log('开始数据库迁移...');
    
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        console.log('\n检查现有字段...');
        const [existingColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        const existingFieldNames = existingColumns.map(col => col.Field);
        console.log('现有字段:', existingFieldNames);
        
        const fieldsToAdd = {
            'original_price': "ALTER TABLE goods_table ADD COLUMN original_price DECIMAL(10,2) DEFAULT '0.00'",
            'condition': "ALTER TABLE goods_table ADD COLUMN `condition` VARCHAR(20) DEFAULT '轻微使用'",
            'tags': "ALTER TABLE goods_table ADD COLUMN tags TEXT",
            'goods_images': "ALTER TABLE goods_table ADD COLUMN goods_images TEXT",
            'status': "ALTER TABLE goods_table ADD COLUMN `status` VARCHAR(20) DEFAULT 'active'",
            'views': "ALTER TABLE goods_table ADD COLUMN views INT DEFAULT 0",
            'created_at': "ALTER TABLE goods_table ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
            'updated_at': "ALTER TABLE goods_table ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        };
        
        console.log('\n添加新字段...');
        for (const [fieldName, sql] of Object.entries(fieldsToAdd)) {
            if (existingFieldNames.includes(fieldName)) {
                console.log(`  ✅ 字段 ${fieldName} 已存在，跳过`);
                continue;
            }
            
            try {
                await sequelize.query(sql);
                console.log(`  ✅ 添加字段 ${fieldName} 成功`);
            } catch (e) {
                if (e.message.includes('Duplicate column name')) {
                    console.log(`  ✅ 字段 ${fieldName} 已存在`);
                } else {
                    console.error(`  ❌ 添加字段 ${fieldName} 失败: ` + e.message);
                }
            }
        }
        
        console.log('\n更新现有数据...');
        for (const sql of updateSQL) {
            try {
                await sequelize.query(sql);
                console.log('  ✅ 执行成功: ' + sql.substring(0, 50));
            } catch (e) {
                console.log('  ⚠️  跳过: ' + e.message.substring(0, 50));
            }
        }
        
        console.log('\n验证表结构...');
        const [columns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        console.log('\n当前表字段:');
        columns.forEach(col => {
            const isNew = !existingFieldNames.includes(col.Field);
            const marker = isNew ? '🆕' : '✅';
            console.log(`  ${marker} ${col.Field}: ${col.Type} (默认: ${col.Default})`);
        });
        
        console.log('\n✅ 数据库迁移完成!');
        console.log('\n现在可以重新测试发布接口了。');
        
    } catch (e) {
        console.error('❌ 数据库连接失败: ' + e.message);
        console.error(e.stack);
        process.exit(1);
    }
    
    await sequelize.close();
}

runMigration();
