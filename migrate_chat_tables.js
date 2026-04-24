require('dotenv').config();
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

const createChatSessionTable = `
CREATE TABLE IF NOT EXISTS chat_session_table (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL COMMENT '会话参与者1的用户ID',
    user2_id INT NOT NULL COMMENT '会话参与者2的用户ID',
    last_message VARCHAR(500) DEFAULT NULL COMMENT '最后一条消息预览',
    last_message_time DATETIME DEFAULT NULL COMMENT '最后消息时间',
    user1_unread INT NOT NULL DEFAULT 0 COMMENT '用户1的未读消息数',
    user2_unread INT NOT NULL DEFAULT 0 COMMENT '用户2的未读消息数',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    UNIQUE KEY idx_users_unique (user1_id, user2_id),
    KEY idx_user1_id (user1_id),
    KEY idx_user2_id (user2_id),
    KEY idx_last_message_time (last_message_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私聊会话表';
`;

const createChatMessageTable = `
CREATE TABLE IF NOT EXISTS chat_message_table (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL COMMENT '关联的会话ID',
    sender_id INT NOT NULL COMMENT '发送者用户ID',
    receiver_id INT NOT NULL COMMENT '接收者用户ID',
    content TEXT NOT NULL COMMENT '消息内容',
    msg_type VARCHAR(20) NOT NULL DEFAULT 'text' COMMENT '消息类型：text-文字，goods_card-商品卡片',
    goods_id INT DEFAULT NULL COMMENT '商品ID（商品卡片类型时使用）',
    is_read TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_session_id (session_id),
    KEY idx_sender_id (sender_id),
    KEY idx_receiver_id (receiver_id),
    KEY idx_is_read (is_read),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='私聊消息表';
`;

async function runMigration() {
    console.log('开始创建聊天相关数据库表...');
    
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        
        console.log('\n检查 chat_session_table 表...');
        try {
            const [sessions] = await sequelize.query('SHOW TABLES LIKE "chat_session_table"');
            if (sessions.length > 0) {
                console.log('✅ chat_session_table 表已存在');
            } else {
                await sequelize.query(createChatSessionTable);
                console.log('✅ chat_session_table 表创建成功');
            }
        } catch (e) {
            console.error('❌ 创建 chat_session_table 失败:', e.message);
        }
        
        console.log('\n检查 chat_message_table 表...');
        try {
            const [messages] = await sequelize.query('SHOW TABLES LIKE "chat_message_table"');
            if (messages.length > 0) {
                console.log('✅ chat_message_table 表已存在');
            } else {
                await sequelize.query(createChatMessageTable);
                console.log('✅ chat_message_table 表创建成功');
            }
        } catch (e) {
            console.error('❌ 创建 chat_message_table 失败:', e.message);
        }
        
        console.log('\n验证表结构...');
        try {
            const [sessionColumns] = await sequelize.query('SHOW COLUMNS FROM chat_session_table');
            console.log('\nchat_session_table 字段:');
            sessionColumns.forEach(col => {
                console.log(`  ✅ ${col.Field}: ${col.Type}`);
            });
        } catch (e) {
            console.log('  ⚠️  无法获取 chat_session_table 字段信息');
        }
        
        try {
            const [messageColumns] = await sequelize.query('SHOW COLUMNS FROM chat_message_table');
            console.log('\nchat_message_table 字段:');
            messageColumns.forEach(col => {
                console.log(`  ✅ ${col.Field}: ${col.Type}`);
            });
        } catch (e) {
            console.log('  ⚠️  无法获取 chat_message_table 字段信息');
        }
        
        console.log('\n✅ 聊天数据库表迁移完成!');
        console.log('\n现在可以测试私聊功能了。');
        
    } catch (e) {
        console.error('❌ 数据库连接失败: ' + e.message);
        console.error(e.stack);
        process.exit(1);
    }
    
    await sequelize.close();
}

runMigration();
