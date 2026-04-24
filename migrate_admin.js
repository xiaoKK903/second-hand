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

async function runMigration() {
    console.log('开始管理员后台数据库迁移...');
    
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        
        console.log('\n========== 1. 用户表新增字段 ==========');
        
        try {
            var [userColumns] = await sequelize.query('SHOW COLUMNS FROM user_table');
            var existingUserFields = userColumns.map(function(col) { return col.Field; });
            console.log('现有字段:', existingUserFields.join(', '));
            
            if (existingUserFields.indexOf('role') === -1) {
                console.log('添加 role 字段...');
                await sequelize.query("ALTER TABLE user_table ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '用户角色：user-普通用户，admin-管理员' AFTER `contact`");
                console.log('✅ role 字段添加成功');
            } else {
                console.log('✅ role 字段已存在');
            }
            
            if (existingUserFields.indexOf('is_active') === -1) {
                console.log('添加 is_active 字段...');
                await sequelize.query("ALTER TABLE user_table ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '账号是否激活：1-正常，0-禁用' AFTER `role`");
                console.log('✅ is_active 字段添加成功');
            } else {
                console.log('✅ is_active 字段已存在');
            }
            
        } catch (e) {
            console.error('❌ 用户表操作失败:', e.message);
        }
        
        console.log('\n========== 2. 商品表新增字段 ==========');
        
        try {
            var [goodsColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
            var existingGoodsFields = goodsColumns.map(function(col) { return col.Field; });
            console.log('现有字段:', existingGoodsFields.join(', '));
            
            if (existingGoodsFields.indexOf('audit_status') === -1) {
                console.log('添加 audit_status 字段...');
                await sequelize.query("ALTER TABLE goods_table ADD COLUMN `audit_status` VARCHAR(20) NOT NULL DEFAULT 'approved' COMMENT '审核状态：pending-待审核，approved-已通过，rejected-已拒绝' AFTER `status`");
                console.log('✅ audit_status 字段添加成功');
            } else {
                console.log('✅ audit_status 字段已存在');
            }
            
            if (existingGoodsFields.indexOf('audit_remark') === -1) {
                console.log('添加 audit_remark 字段...');
                await sequelize.query("ALTER TABLE goods_table ADD COLUMN `audit_remark` VARCHAR(200) DEFAULT NULL COMMENT '审核备注' AFTER `audit_status`");
                console.log('✅ audit_remark 字段添加成功');
            } else {
                console.log('✅ audit_remark 字段已存在');
            }
            
            if (existingGoodsFields.indexOf('admin_operated_at') === -1) {
                console.log('添加 admin_operated_at 字段...');
                await sequelize.query("ALTER TABLE goods_table ADD COLUMN `admin_operated_at` DATETIME DEFAULT NULL COMMENT '管理员操作时间' AFTER `audit_remark`");
                console.log('✅ admin_operated_at 字段添加成功');
            } else {
                console.log('✅ admin_operated_at 字段已存在');
            }
            
        } catch (e) {
            console.error('❌ 商品表操作失败:', e.message);
        }
        
        console.log('\n========== 3. 创建默认管理员账号 ==========');
        
        try {
            var bcrypt = require('bcryptjs');
            var adminPhone = 'admin123';
            var adminPassword = 'admin123';
            
            var [existingAdmin] = await sequelize.query("SELECT * FROM user_table WHERE phone_num = ?", {
                replacements: [adminPhone],
                type: Sequelize.QueryTypes.SELECT
            });
            
            if (!existingAdmin || existingAdmin.length === 0) {
                var hashedPassword = bcrypt.hashSync(adminPassword, 10);
                await sequelize.query(
                    "INSERT INTO user_table (phone_num, password, nickname, role, is_active, created_at) VALUES (?, ?, ?, 'admin', 1, NOW())",
                    { replacements: [adminPhone, hashedPassword, '平台管理员'] }
                );
                console.log('✅ 默认管理员账号创建成功');
                console.log('   手机号: admin123');
                console.log('   密码: admin123');
            } else {
                console.log('✅ 管理员账号已存在');
                var updateRole = existingAdmin.role !== 'admin';
                if (updateRole) {
                    await sequelize.query("UPDATE user_table SET role = 'admin' WHERE phone_num = ?", {
                        replacements: [adminPhone]
                    });
                    console.log('✅ 已将该账号设置为管理员');
                }
            }
        } catch (e) {
            console.error('⚠️  创建管理员账号失败:', e.message);
            console.log('   请手动执行以下SQL创建管理员：');
            console.log("   INSERT INTO user_table (phone_num, password, nickname, role, is_active) VALUES ('admin123', '加密后的密码', '平台管理员', 'admin', 1);");
        }
        
        console.log('\n========== 迁移完成 ==========');
        console.log('\n新增字段说明：');
        console.log('  user_table:');
        console.log('    - role: 用户角色（user/admin）');
        console.log('    - is_active: 账号是否激活');
        console.log('');
        console.log('  goods_table:');
        console.log('    - audit_status: 审核状态（pending/approved/rejected）');
        console.log('    - audit_remark: 审核备注');
        console.log('    - admin_operated_at: 管理员操作时间');
        console.log('');
        console.log('默认管理员账号：');
        console.log('    手机号: admin123');
        console.log('    密码: admin123');
        
    } catch (e) {
        console.error('❌ 数据库连接失败: ' + e.message);
        console.error(e.stack);
        process.exit(1);
    }
    
    await sequelize.close();
}

runMigration();
