const Sequelize = require('sequelize');
const sequelize = new Sequelize('trading_system', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

const Goods = sequelize.define('goods', {
    goods_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: 'goods_id'
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    goods_name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'goods_name'
    },
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'category_id'
    },
    goods_desc: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'goods_desc'
    },
    goods_image: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'goods_image'
    },
    goods_price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'goods_price'
    },
    count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'count'
    }
}, {
    tableName: 'goods_table',
    timestamps: false
});

const testGoods = [
    { user_id: 1, goods_name: '二手教材：高等数学第七版', category_id: 1, goods_desc: '九成新，无笔记，适合考研复习使用，正版同济版', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20textbook%20advanced%20mathematics%20book%20on%20desk&image_size=square', goods_price: 35, count: 1 },
    { user_id: 1, goods_name: 'iPad Pro 2021款 11寸', category_id: 2, goods_desc: '128G 深空灰，带Apple Pencil，屏幕完好无划痕，保修期内', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPad%20Pro%20tablet%20with%20Apple%20Pencil%20on%20white%20background&image_size=square', goods_price: 3800, count: 1 },
    { user_id: 1, goods_name: '宿舍懒人椅电竞椅', category_id: 3, goods_desc: '可调节靠背，带脚踏，宿舍必备，九成新，自提优先', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=comfortable%20gaming%20chair%20black%20color%20dorm%20furniture&image_size=square', goods_price: 200, count: 1 },
    { user_id: 1, goods_name: '耐克篮球运动鞋42码', category_id: 4, goods_desc: '穿了三个月，鞋底轻微磨损，原价899，现价300出', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nike%20basketball%20shoes%20sneakers%20on%20white%20background&image_size=square', goods_price: 300, count: 1 },
    { user_id: 1, goods_name: 'Mac口红小辣椒色号', category_id: 5, goods_desc: '仅试色，不适合我，正品官网购入，有购买记录', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=MAC%20lipstick%20red%20color%20cosmetics%20on%20white%20background&image_size=square', goods_price: 120, count: 1 },
    { user_id: 1, goods_name: '考研英语历年真题解析', category_id: 1, goods_desc: '张剑黄皮书，2010-2023年，九成新，少量笔记', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20exam%20test%20paper%20book%20for%20postgraduate%20entrance&image_size=square', goods_price: 50, count: 1 },
    { user_id: 1, goods_name: '机械键盘青轴RGB', category_id: 2, goods_desc: 'RK987三模机械键盘，青轴，带RGB灯效，包装齐全', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mechanical%20keyboard%20RGB%20backlight%20gaming%20keyboard&image_size=square', goods_price: 250, count: 1 },
    { user_id: 1, goods_name: '小米空气净化器Pro H', category_id: 3, goods_desc: '去年购入，滤芯还剩70%，除甲醛效果好，适合宿舍使用', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiaomi%20air%20purifier%20white%20modern%20design%20home%20appliance&image_size=square', goods_price: 800, count: 1 },
    { user_id: 1, goods_name: '迪卡侬登山背包40L', category_id: 4, goods_desc: '防水材质，多隔层设计，徒步旅行必备，只用过一次', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Decathlon%20hiking%20backpack%2040L%20outdoor%20gear%20blue%20color&image_size=square', goods_price: 150, count: 1 },
    { user_id: 1, goods_name: '雅诗兰黛小棕瓶精华', category_id: 5, goods_desc: '50ml正装，只用了1/3，专柜购入，保质期到2026年', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Estee%20Lauder%20Advanced%20Night%20Repair%20serum%20bottle%20cosmetics&image_size=square', goods_price: 350, count: 1 },
    { user_id: 1, goods_name: 'Python编程从入门到实践', category_id: 1, goods_desc: '经典Python入门书，全新未拆封，买多了一本', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Python%20programming%20book%20yellow%20cover%20coding%20tutorial&image_size=square', goods_price: 45, count: 2 },
    { user_id: 1, goods_name: 'Beats Solo3无线蓝牙耳机', category_id: 2, goods_desc: '黑色，音质好，续航40小时，轻微使用痕迹', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beats%20Solo3%20wireless%20headphones%20black%20color%20audio%20device&image_size=square', goods_price: 450, count: 1 },
    { user_id: 1, goods_name: '宿舍床上书桌懒人桌', category_id: 3, goods_desc: '可折叠，带杯托，宿舍神器，学习吃饭都能用', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dorm%20room%20bed%20desk%20foldable%20laptop%20table%20wooden&image_size=square', goods_price: 35, count: 3 },
    { user_id: 1, goods_name: '尤尼克斯羽毛球拍双刃10', category_id: 4, goods_desc: '全碳素材质，攻守兼备，拉了26磅，9成新', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yonex%20badminton%20racket%20professional%20sports%20equipment&image_size=square', goods_price: 500, count: 1 },
    { user_id: 1, goods_name: 'SK-II神仙水230ml', category_id: 5, goods_desc: '余量约60%，正品保证，适合油皮混油皮', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=SK-II%20Facial%20Treatment%20Essence%20bottle%20luxury%20skincare&image_size=square', goods_price: 550, count: 1 },
    { user_id: 1, goods_name: '数据结构与算法分析', category_id: 1, goods_desc: '计算机专业经典教材，Mark Allen Weiss著，中文版', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20structures%20and%20algorithms%20textbook%20computer%20science&image_size=square', goods_price: 40, count: 1 },
    { user_id: 1, goods_name: '罗技G502游戏鼠标', category_id: 2, goods_desc: '有线鼠标，配重可调节，RGB灯效，适合大手', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Logitech%20G502%20gaming%20mouse%20RGB%20wired%20computer%20peripheral&image_size=square', goods_price: 180, count: 1 },
    { user_id: 1, goods_name: '小熊加湿器5L', category_id: 3, goods_desc: '静音设计，大容量，适合干燥季节，带恒湿功能', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Bear%20humidifier%205L%20white%20color%20home%20appliance%20mist&image_size=square', goods_price: 120, count: 1 },
    { user_id: 1, goods_name: '李宁跑步鞋超轻18', category_id: 4, goods_desc: '42码，白色，重量轻，缓震好，跑步训练必备', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Li-Ning%20running%20shoes%20white%20color%20lightweight%20sports%20footwear&image_size=square', goods_price: 280, count: 1 },
    { user_id: 1, goods_name: '资生堂防晒霜安热沙小金瓶', category_id: 5, goods_desc: '60ml，全新未拆封，防水防汗，海边必备', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shiseido%20Anessa%20perfect%20UV%20sunscreen%20gold%20bottle%20skincare&image_size=square', goods_price: 180, count: 2 },
    { user_id: 1, goods_name: '大学物理通用教程', category_id: 1, goods_desc: '北大版，电磁学+力学两册，考研复习用，有笔记', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20physics%20textbook%20electromagnetism%20mechanics%20education&image_size=square', goods_price: 60, count: 1 },
    { user_id: 1, goods_name: 'Kindle Paperwhite 4代', category_id: 2, goods_desc: '8G，黑色，屏幕无划痕，续航优秀，带保护套', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kindle%20Paperwhite%20ereader%20black%20color%20ebook%20device&image_size=square', goods_price: 550, count: 1 },
    { user_id: 1, goods_name: '宜家马尔姆床架+床垫', category_id: 3, goods_desc: '1.5米双人，八成新，需自提，送床上四件套', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=IKEA%20Malm%20bed%20frame%20with%20mattress%20modern%20bedroom%20furniture&image_size=square', goods_price: 800, count: 1 },
    { user_id: 1, goods_name: '迪卡侬椭圆机家用款', category_id: 4, goods_desc: '静音磁控，可折叠，健身减肥利器，只用了一个月', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Decathlon%20elliptical%20machine%20home%20gym%20fitness%20equipment&image_size=square', goods_price: 1200, count: 1 },
    { user_id: 1, goods_name: '兰蔻小黑瓶肌底精华', category_id: 5, goods_desc: '75ml，余量70%，提亮肤色，改善肤质，专柜购入', goods_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lancome%20Advanced%20Genifique%20serum%20bottle%20luxury%20skincare&image_size=square', goods_price: 680, count: 1 }
];

async function initGoods() {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        
        const count = await Goods.count();
        console.log(`Current goods count: ${count}`);
        
        if (count === 0) {
            for (const goods of testGoods) {
                await Goods.create(goods);
            }
            console.log(`Inserted ${testGoods.length} test goods`);
        } else {
            console.log('Goods already exist, skipping initialization');
        }
        
        const allGoods = await Goods.findAll();
        console.log(`Total goods: ${allGoods.length}`);
        allGoods.forEach(g => {
            console.log(`  - ${g.goods_name}: ¥${g.goods_price}`);
        });
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

initGoods();
