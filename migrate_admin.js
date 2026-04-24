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
        
        console.log('\n========== 1. 检查并添加用户表所有字段 ==========');
        
        try {
            var [userColumns] = await sequelize.query('SHOW COLUMNS FROM user_table');
            var existingFields = userColumns.map(function(col) { return col.Field; });
            console.log('现有字段:', existingFields.join(', '));
            
            var fieldsToAdd = [];
            
            if (existingFields.indexOf('nickname') === -1) {
                fieldsToAdd.push("`nickname` VARCHAR(50) DEFAULT NULL COMMENT '用户昵称'");
            }
            if (existingFields.indexOf('avatar') === -1) {
                fieldsToAdd.push("`avatar` TEXT DEFAULT NULL COMMENT '用户头像URL'");
            }
            if (existingFields.indexOf('bio') === -1) {
                fieldsToAdd.push("`bio` VARCHAR(200) DEFAULT NULL COMMENT '个人简介/个性签名'");
            }
            if (existingFields.indexOf('contact') === -1) {
                fieldsToAdd.push("`contact` VARCHAR(100) DEFAULT NULL COMMENT '联系方式（微信、QQ等）'");
            }
            if (existingFields.indexOf('role') === -1) {
                fieldsToAdd.push("`role` VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT '用户角色：user-普通用户，admin-管理员'");
            }
            if (existingFields.indexOf('is_active') === -1) {
                fieldsToAdd.push("`is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '账号是否激活：1-正常，0-禁用'");
            }
            if (existingFields.indexOf('created_at') === -1) {
                fieldsToAdd.push("`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
            }
            if (existingFields.indexOf('updated_at') === -1) {
                fieldsToAdd.push("`updated_at` DATETIME DEFAULT NULL");
            }
            
            if (fieldsToAdd.length > 0) {
                console.log('需要添加的字段:', fieldsToAdd);
                
                for (var i = 0; i < fieldsToAdd.length; i++) {
                    var fieldSql = fieldsToAdd[i];
                    console.log('添加字段:', fieldSql.split(' ')[0].replace(/`/g, ''));
                    try {
                        await sequelize.query('ALTER TABLE user_table ADD COLUMN ' + fieldSql);
                        console.log('✅ 添加成功');
                    } catch (e) {
                        console.log('⚠️  跳过(可能已存在):', e.message);
                    }
                }
            } else {
                console.log('✅ 所有字段已存在');
            }
            
        } catch (e) {
            console.error('❌ 用户表操作失败:', e.message);
        }
        
        console.log('\n========== 2. 检查并添加商品表字段 ==========');
        
        try {
            var [goodsColumns] = await sequelize.query('SHOW COLUMNS FROM goods_table');
            var existingGoodsFields = goodsColumns.map(function(col) { return col.Field; });
            console.log('现有字段:', existingGoodsFields.join(', '));
            
            if (existingGoodsFields.indexOf('audit_status') === -1) {
                console.log('添加 audit_status 字段...');
                try {
                    await sequelize.query("ALTER TABLE goods_table ADD COLUMN `audit_status` VARCHAR(20) NOT NULL DEFAULT 'approved' COMMENT '审核状态：pending-待审核，approved-已通过，rejected-已拒绝'");
                    console.log('✅ audit_status 添加成功');
                } catch (e) {
                    console.log('⚠️  跳过:', e.message);
                }
            } else {
                console.log('✅ audit_status 已存在');
            }
            
            if (existingGoodsFields.indexOf('audit_remark') === -1) {
                console.log('添加 audit_remark 字段...');
                try {
                    await sequelize.query("ALTER TABLE goods_table ADD COLUMN `audit_remark` VARCHAR(200) DEFAULT NULL COMMENT '审核备注'");
                    console.log('✅ audit_remark 添加成功');
                } catch (e) {
                    console.log('⚠️  跳过:', e.message);
                }
            } else {
                console.log('✅ audit_remark 已存在');
            }
            
            if (existingGoodsFields.indexOf('admin_operated_at') === -1) {
                console.log('添加 admin_operated_at 字段...');
                try {
                    await sequelize.query("ALTER TABLE goods_table ADD COLUMN `admin_operated_at` DATETIME DEFAULT NULL COMMENT '管理员操作时间'");
                    console.log('✅ admin_operated_at 添加成功');
                } catch (e) {
                    console.log('⚠️  跳过:', e.message);
                }
            } else {
                console.log('✅ admin_operated_at 已存在');
            }
            
        } catch (e) {
            console.error('❌ 商品表操作失败:', e.message);
        }
        
        console.log('\n========== 3. 创建默认管理员账号 ==========');
        
        try {
            var bcrypt = require('bcryptjs');
            var adminPhone = 'admin123';
            var adminPassword = 'admin123';
            
            var [existingAdmin] = await sequelize.query(
                "SELECT * FROM user_table WHERE phone_num = ?",
                {
                    replacements: [adminPhone],
                    type: Sequelize.QueryTypes.SELECT
                }
            );
            
            if (!existingAdmin || existingAdmin.length === 0) {
                console.log('创建管理员账号...');
                var hashedPassword = bcrypt.hashSync(adminPassword, 10);
                
                var [userColumns] = await sequelize.query('SHOW COLUMNS FROM user_table');
                var fields = userColumns.map(function(col) { return col.Field; });
                
                var insertFields = ['phone_num', 'password'];
                var insertValues = [adminPhone, hashedPassword];
                var placeholders = ['?', '?'];
                
                if (fields.indexOf('nickname') !== -1) {
                    insertFields.push('nickname');
                    insertValues.push('平台管理员');
                    placeholders.push('?');
                }
                if (fields.indexOf('role') !== -1) {
                    insertFields.push('role');
                    insertValues.push('admin');
                    placeholders.push('?');
                }
                if (fields.indexOf('is_active') !== -1) {
                    insertFields.push('is_active');
                    insertValues.push(1);
                    placeholders.push('?');
                }
                if (fields.indexOf('created_at') !== -1) {
                    insertFields.push('created_at');
                    placeholders.push('NOW()');
                }
                
                var sql = "INSERT INTO user_table (" + insertFields.join(', ') + ") VALUES (" + placeholders.join(', ') + ")";
                console.log('执行SQL:', sql);
                console.log('参数:', insertValues);
                
                await sequelize.query(sql, {
                    replacements: insertValues,
                    type: Sequelize.QueryTypes.INSERT
                });
                
                console.log('✅ 默认管理员账号创建成功');
                console.log('   手机号: admin123');
                console.log('   密码: admin123');
            } else {
                console.log('✅ 管理员账号已存在');
                
                var adminData = existingAdmin;
                if (Array.isArray(existingAdmin)) {
                    adminData = existingAdmin[0];
                }
                
                if (adminData.role !== 'admin') {
                    console.log('更新角色为管理员...');
                    await sequelize.query(
                        "UPDATE user_table SET role = 'admin' WHERE phone_num = ?",
                        {
                            replacements: [adminPhone],
                            type: Sequelize.QueryTypes.UPDATE
                        }
                    );
                    console.log('✅ 已将该账号设置为管理员');
                } else {
                    console.log('✅ 该账号已是管理员');
                }
            }
        } catch (e) {
            console.error('⚠️  创建管理员账号失败:', e.message);
            console.error(e.stack);
            console.log('');
            console.log('请手动执行以下步骤：');
            console.log('1. 检查 user_table 表是否有以下字段：nickname, role, is_active, created_at');
            console.log('2. 手动插入管理员账号：');
            console.log("   INSERT INTO user_table (phone_num, password, nickname, role, is_active, created_at) VALUES ('admin123', '加密后的密码', '平台管理员', 'admin', 1, NOW())");
            console.log('');
            console.log('或者使用工具生成密码后手动插入。');
        }
        
        console.log('\n========== 迁移完成 ==========');
        console.log('\n字段说明：');
        console.log('  user_table:');
        console.log('    - nickname: 用户昵称');
        console.log('    - avatar: 用户头像');
        console.log('    - bio: 个性签名');
        console.log('    - contact: 联系方式');
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
