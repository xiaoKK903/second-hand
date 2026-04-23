ALTER TABLE goods_table ADD COLUMN original_price DECIMAL(10,2) DEFAULT '0.00' COMMENT '原价';
ALTER TABLE goods_table ADD COLUMN `condition` VARCHAR(20) DEFAULT '轻微使用' COMMENT '成色：全新、99新、95新、轻微使用、成色一般';
ALTER TABLE goods_table ADD COLUMN tags TEXT COMMENT '标签：包邮、可小刀、自提、价格面议...';
ALTER TABLE goods_table ADD COLUMN goods_images TEXT COMMENT '商品图片列表（JSON数组）';
ALTER TABLE goods_table ADD COLUMN `status` VARCHAR(20) DEFAULT 'active' COMMENT '商品状态：active=出售中, inactive=已下架, sold=已售出';
ALTER TABLE goods_table ADD COLUMN views INT DEFAULT 0 COMMENT '浏览量';
ALTER TABLE goods_table ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
ALTER TABLE goods_table ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
