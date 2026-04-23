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

async function migrateDatabase() {
    console.log('开始数据库迁移...');
    
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        console.log('\n=== 检查并添加 user_table 字段 ===');
        
        // 检查 user_table 是否有 nickname 字段
        const [userColumns] = await sequelize.query('SHOW COLUMNS FROM user_table');
        const hasNickname = userColumns.some(col => col.Field === 'nickname');
        const hasAvatar = userColumns.some(col => col.Field === 'avatar');
        
        if (!hasNickname) {
            console.log('添加 nickname 字段...');
            await sequelize.query(`
                ALTER TABLE user_table 
                ADD COLUMN nickname VARCHAR(50) COMMENT '用户昵称'
            `);
            console.log('✅ nickname 字段已添加');
        } else {
            console.log('✅ nickname 字段已存在');
        }
        
        if (!hasAvatar) {
            console.log('添加 avatar 字段...');
            await sequelize.query(`
                ALTER TABLE user_table 
                ADD COLUMN avatar VARCHAR(500) COMMENT '用户头像URL'
            `);
            console.log('✅ avatar 字段已添加');
        } else {
            console.log('✅ avatar 字段已存在');
        }
        
        console.log('\n=== 创建 comment_table 表 ===');
        
        // 检查 comment_table 是否存在
        const [tables] = await sequelize.query("SHOW TABLES LIKE 'comment_table'");
        
        if (tables.length === 0) {
            console.log('创建 comment_table 表...');
            await sequelize.query(`
                CREATE TABLE comment_table (
                    comment_id INT AUTO_INCREMENT PRIMARY KEY,
                    goods_id INT NOT NULL COMMENT '关联商品ID',
                    user_id INT NOT NULL COMMENT '评论者用户ID',
                    reply_to INT NULL COMMENT '回复的用户ID，为空表示提问',
                    parent_comment_id INT NULL COMMENT '父评论ID，用于楼中楼回复',
                    content VARCHAR(500) NOT NULL COMMENT '评论内容',
                    status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态：active-正常，deleted-已删除',
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_goods_id (goods_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_parent_comment_id (parent_comment_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品留言/评论表'
            `);
            console.log('✅ comment_table 表已创建');
        } else {
            console.log('✅ comment_table 表已存在');
        }
        
        console.log('\n=== 检查 goods_table 字段 ===');
        
        // 确保 goods_table 所有必需字段存在
        const [goodsColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
        const requiredFields = [
            { name: 'original_price', type: 'DECIMAL(10,2)', comment: '原价' },
            { name: 'condition', type: 'VARCHAR(20)', comment: '成色：全新、99新、95新、轻微使用、成色一般' },
            { name: 'tags', type: 'TEXT', comment: '标签：包邮、可小刀、自提、价格面议...' },
            { name: 'goods_images', type: 'TEXT', comment: '商品图片列表（JSON数组）' },
            { name: 'status', type: 'VARCHAR(20)', comment: '状态：active-上架，inactive-下架，sold-已售出' },
            { name: 'views', type: 'INT', comment: '浏览量' },
            { name: 'created_at', type: 'TIMESTAMP', comment: '创建时间' },
            { name: 'updated_at', type: 'TIMESTAMP', comment: '更新时间' }
        ];
        
        for (const field of requiredFields) {
            const exists = goodsColumns.some(col => col.Field === field.name);
            if (!exists) {
                console.log(`添加 ${field.name} 字段...`);
                try {
                    await sequelize.query(`
                        ALTER TABLE goods_table 
                        ADD COLUMN ${field.name} ${field.type} COMMENT '${field.comment}'
                    `);
                    console.log(`✅ ${field.name} 字段已添加`);
                } catch (e) {
                    console.log(`⚠️  添加 ${field.name} 失败: ${e.message}`);
                }
            } else {
                console.log(`✅ ${field.name} 字段已存在`);
            }
        }
        
        // 检查 goods_image 字段是否为 TEXT
        const goodsImageColumn = goodsColumns.find(col => col.Field === 'goods_image');
        if (goodsImageColumn && goodsImageColumn.Type.includes('varchar')) {
            console.log('\n修改 goods_image 字段类型为 TEXT...');
            await sequelize.query('ALTER TABLE goods_table MODIFY COLUMN goods_image TEXT COMMENT \'商品封面图\'');
            console.log('✅ goods_image 字段已修改为 TEXT');
        }
        
        // 检查 goods_desc 字段是否为 TEXT
        const goodsDescColumn = goodsColumns.find(col => col.Field === 'goods_desc');
        if (goodsDescColumn && goodsDescColumn.Type.includes('varchar')) {
            console.log('\n修改 goods_desc 字段类型为 TEXT...');
            await sequelize.query('ALTER TABLE goods_table MODIFY COLUMN goods_desc TEXT COMMENT \'商品描述\'');
            console.log('✅ goods_desc 字段已修改为 TEXT');
        }
        
        console.log('\n=== 插入测试留言数据 ===');
        
        // 检查是否已有测试数据
        const [commentCount] = await sequelize.query('SELECT COUNT(*) as count FROM comment_table');
        if (commentCount[0].count === 0) {
            console.log('插入测试留言数据...');
            await sequelize.query(`
                INSERT INTO comment_table (goods_id, user_id, reply_to, parent_comment_id, content, status, created_at)
                VALUES 
                (1, 1, NULL, NULL, '这个笔记本还能便宜点吗？', 'active', NOW() - INTERVAL 1 HOUR),
                (1, 2, 1, 1, '最低多少钱？诚心要', 'active', NOW() - INTERVAL 30 MINUTE),
                (2, 1, NULL, NULL, '成色怎么样？有磕碰吗？', 'active', NOW() - INTERVAL 2 HOUR)
            `);
            console.log('✅ 测试留言数据已插入');
        } else {
            console.log('✅ 留言表已有数据，跳过插入');
        }
        
        console.log('\n✅ 数据库迁移完成!');
        
    } catch (e) {
        console.error('❌ 迁移失败: ' + e.message);
        console.error(e.stack);
    } finally {
        await sequelize.close();
    }
}

migrateDatabase();
