var mysql = require('mysql2');
require('dotenv').config();

var pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'secondhand_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

var promisePool = pool.promise();

async function getTableColumns(tableName) {
    var [rows] = await promisePool.query('SHOW COLUMNS FROM ' + tableName);
    var columns = {};
    for (var i = 0; i < rows.length; i++) {
        columns[rows[i].Field] = rows[i];
    }
    return columns;
}

async function checkColumnExists(tableName, columnName) {
    try {
        var [rows] = await promisePool.query('SHOW COLUMNS FROM ' + tableName + ' LIKE ?', [columnName]);
        return rows.length > 0;
    } catch (e) {
        console.error('检查列是否存在失败:', e.message);
        return false;
    }
}

async function addColumnIfNotExists(tableName, columnDef) {
    var columnName = columnDef.name;
    var exists = await checkColumnExists(tableName, columnName);
    if (!exists) {
        console.log('添加列: ' + tableName + '.' + columnName);
        try {
            await promisePool.query('ALTER TABLE ' + tableName + ' ADD COLUMN ' + columnDef.definition);
            console.log('列 ' + columnName + ' 添加成功');
            return true;
        } catch (e) {
            console.error('添加列 ' + columnName + ' 失败:', e.message);
            return false;
        }
    } else {
        console.log('列 ' + tableName + '.' + columnName + ' 已存在');
        return true;
    }
}

async function migrate() {
    console.log('开始地址表迁移...');

    try {
        var columns = await getTableColumns('address_table');
        console.log('现有列:', Object.keys(columns));

        var columnsToAdd = [
            {
                name: 'province',
                definition: 'province VARCHAR(50) NULL COMMENT "省份"'
            },
            {
                name: 'city',
                definition: 'city VARCHAR(50) NULL COMMENT "城市"'
            },
            {
                name: 'district',
                definition: 'district VARCHAR(50) NULL COMMENT "区县"'
            },
            {
                name: 'detail',
                definition: 'detail VARCHAR(255) NULL COMMENT "详细地址"'
            },
            {
                name: 'is_default',
                definition: 'is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT "是否为默认地址"'
            },
            {
                name: 'created_at',
                definition: 'created_at DATETIME NULL COMMENT "创建时间"'
            },
            {
                name: 'updated_at',
                definition: 'updated_at DATETIME NULL COMMENT "更新时间"'
            }
        ];

        for (var i = 0; i < columnsToAdd.length; i++) {
            await addColumnIfNotExists('address_table', columnsToAdd[i]);
        }

        console.log('地址表迁移完成！');

    } catch (e) {
        console.error('迁移失败:', e.message);
        console.error('错误堆栈:', e.stack);
    } finally {
        pool.end();
    }
}

migrate();
