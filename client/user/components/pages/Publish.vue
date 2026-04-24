<template>
    <div class="publish-page">
        <div class="publish-container">
            <div class="page-header">
                <h3 class="page-title">{{ isEditMode ? '编辑商品' : '发布商品' }}</h3>
            </div>

            <div class="section-title">
                <span class="title-icon">📷</span>
                <span>添加实拍照片和视频</span>
                <span class="section-tip">第一张设为封面，最多9张</span>
            </div>
            <div class="image-upload-section">
                <div 
                    class="upload-item"
                    v-for="(file, index) in fileList"
                    :key="file.uid || index">
                    <div class="image-wrapper">
                        <img :src="file.url || file.thumbUrl" @click="previewImage(index)">
                        <div class="image-mask" @click.stop>
                            <span class="delete-btn" @click="removeImage(index)">
                                <i class="el-icon-close"></i>
                            </span>
                        </div>
                    </div>
                    <div class="image-index" v-if="index === 0">封面</div>
                </div>
                <el-upload
                    v-if="fileList.length < 9"
                    class="upload-trigger"
                    action="#"
                    list-type="picture-card"
                    :auto-upload="false"
                    :limit="9 - fileList.length"
                    :on-change="handleImageChange"
                    :on-exceed="handleExceed"
                    accept="image/*">
                    <div class="upload-add">
                        <i class="el-icon-plus"></i>
                        <span class="upload-text">添加图片</span>
                    </div>
                </el-upload>
            </div>

            <div class="section-title">
                <span class="title-icon">✏️</span>
                <span>商品信息</span>
            </div>
            <el-form ref="publishForm" :model="form" :rules="rules" label-position="top" class="publish-form">
                <el-form-item label="商品标题" prop="name">
                    <el-input 
                        v-model="form.name" 
                        placeholder="请输入商品标题（如：iPhone 13 Pro 256G 远峰蓝）"
                        maxlength="50"
                        show-word-limit>
                    </el-input>
                    <div class="form-tip">建议填写品牌型号、成色等关键信息</div>
                </el-form-item>

                <el-form-item label="商品分类" prop="categoryId">
                    <el-select 
                        v-model="form.categoryId" 
                        placeholder="请选择商品分类"
                        style="width: 100%">
                        <el-option
                            v-for="item in categoryList"
                            :key="item.category_id"
                            :label="item.goods_type"
                            :value="item.category_id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="新旧程度" prop="condition">
                    <div class="condition-options">
                        <div 
                            class="condition-item"
                            :class="{ active: form.condition === item }"
                            v-for="item in conditions"
                            :key="item"
                            @click="selectCondition(item)">
                            <span class="condition-label">{{ item }}</span>
                            <span class="condition-desc" v-if="getConditionDesc(item)">{{ getConditionDesc(item) }}</span>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="价格设置">
                    <div class="price-section">
                        <div class="price-group">
                            <span class="price-label">卖价</span>
                            <div class="price-input-wrapper">
                                <span class="currency-symbol">¥</span>
                                <el-input-number 
                                    v-model="form.price" 
                                    :min="0"
                                    :precision="2"
                                    :step="10"
                                    controls-position="right"
                                    placeholder="0.00">
                                </el-input-number>
                            </div>
                        </div>
                        <div class="price-group original-group">
                            <span class="price-label">原价</span>
                            <div class="price-input-wrapper">
                                <span class="currency-symbol">¥</span>
                                <el-input-number 
                                    v-model="form.originalPrice" 
                                    :min="0"
                                    :precision="2"
                                    :step="10"
                                    controls-position="right"
                                    placeholder="选填，方便买家了解折扣">
                                </el-input-number>
                            </div>
                            <div class="discount-badge" v-if="form.originalPrice && form.price && form.originalPrice > form.price">
                                {{ getDiscount() }}折
                            </div>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="商品标签">
                    <div class="tags-section">
                        <div 
                            class="tag-item"
                            :class="{ active: form.tags.indexOf(item) > -1 }"
                            v-for="item in tags"
                            :key="item"
                            @click="toggleTag(item)">
                            <span class="tag-icon">{{ getTagIcon(item) }}</span>
                            <span class="tag-label">{{ item }}</span>
                        </div>
                    </div>
                    <div class="form-tip">选择合适的标签可以让商品更容易被找到</div>
                </el-form-item>

                <el-form-item label="商品数量" prop="num">
                    <el-input-number 
                        v-model="form.num" 
                        :min="1" 
                        :max="99"
                        label="件">
                    </el-input-number>
                </el-form-item>

                <el-form-item label="商品描述" prop="desc">
                    <el-input 
                        type="textarea" 
                        v-model="form.desc" 
                        :rows="5"
                        placeholder="请输入商品描述，包括：购买渠道、购买时间、使用情况、是否有配件、是否包邮、为什么要卖等信息..."
                        maxlength="500"
                        show-word-limit>
                    </el-input>
                    <div class="form-tip">详细的描述能提高成交率哦</div>
                </el-form-item>
            </el-form>

            <div class="publish-actions">
                <el-button @click="goBack">取消</el-button>
                <el-button type="primary" :loading="publishing" @click="submitPublish" class="publish-btn">
                    <i class="el-icon-check"></i>
                    {{ isEditMode ? '保存修改' : '立即发布' }}
                </el-button>
            </div>
        </div>

        <el-dialog :visible.sync="previewVisible" title="图片预览" width="600px">
            <div class="preview-container">
                <el-image 
                    v-if="previewIndex >= 0 && fileList[previewIndex]"
                    :src="fileList[previewIndex].url || fileList[previewIndex].thumbUrl"
                    fit="contain"
                    style="width: 100%; height: 400px;">
                </el-image>
            </div>
            <div slot="footer" class="preview-footer">
                <span class="preview-count">{{ previewIndex + 1 }} / {{ fileList.length }}</span>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'Publish',
    data: function() {
        return {
            isEditMode: false,
            editGoodsId: null,
            publishing: false,
            previewVisible: false,
            previewIndex: -1,
            fileList: [],
            uploadFileList: [],
            categoryList: [],
            conditions: ['全新', '99新', '95新', '轻微使用', '成色一般'],
            tags: ['包邮', '可小刀', '自提', '价格面议', '支持自提', '可租可买'],
            form: {
                name: '',
                categoryId: null,
                condition: '轻微使用',
                price: 0,
                originalPrice: null,
                num: 1,
                desc: '',
                tags: []
            },
            rules: {
                name: [
                    { required: true, message: '请输入商品标题', trigger: 'blur' },
                    { min: 5, max: 50, message: '标题长度在 5 到 50 个字符', trigger: 'blur' }
                ],
                categoryId: [
                    { required: true, message: '请选择商品分类', trigger: 'change' }
                ],
                price: [
                    { required: true, message: '请输入价格', trigger: 'blur' },
                    { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
                ],
                desc: [
                    { required: true, message: '请输入商品描述', trigger: 'blur' },
                    { min: 10, message: '描述至少10个字符', trigger: 'blur' }
                ]
            }
        }
    },
    created: function() {
        var that = this;
        if (!this.$cookieStore.getCookie('sid')) {
            this.$confirm('您还未登录, 是否去登录?', '提示', {
                confirmButtonText: '确定',
                type: 'warning'
            }).then(function() {
                that.$router.push({ name: 'login' });
            }).catch(function() {
                that.$router.push({ path: '/' });
            });
        } else {
            var goodsId = this.$route.query.id;
            if (goodsId) {
                this.isEditMode = true;
                this.editGoodsId = goodsId;
                this.loadGoodsData(goodsId);
            }
            this.getCategory();
        }
    },
    methods: {
        loadGoodsData: function(goodsId) {
            var that = this;
            this.axios.get('/site/findGoods/' + goodsId).then(function(res) {
                if (res.data && res.data.length > 0) {
                    var goods = res.data[0];
                    that.form.name = goods.goods_name || '';
                    that.form.categoryId = goods.category_id || null;
                    that.form.condition = goods.condition || '轻微使用';
                    that.form.price = Number(goods.goods_price) || 0;
                    that.form.originalPrice = goods.original_price ? Number(goods.original_price) : null;
                    that.form.num = goods.count || 1;
                    that.form.desc = goods.goods_desc || '';
                    
                    if (goods.tags) {
                        if (typeof goods.tags === 'string') {
                            try {
                                that.form.tags = JSON.parse(goods.tags);
                            } catch (e) {
                                that.form.tags = [];
                            }
                        } else {
                            that.form.tags = goods.tags;
                        }
                    }
                    
                    if (goods.goods_images && goods.goods_images.length > 0) {
                        var images = [];
                        if (typeof goods.goods_images === 'string') {
                            try {
                                images = JSON.parse(goods.goods_images);
                            } catch (e) {
                                images = [];
                            }
                        } else {
                            images = goods.goods_images;
                        }
                        that.fileList = images.map(function(url, index) {
                            return {
                                uid: index,
                                url: url
                            };
                        });
                    } else if (goods.goods_image) {
                        that.fileList = [{
                            uid: 0,
                            url: goods.goods_image
                        }];
                    }
                }
            }, function(err) {
                console.error(err);
                that.$message.error('加载商品信息失败');
            });
        },
        getConditionDesc: function(condition) {
            var descs = {
                '全新': '未拆封/未使用',
                '99新': '几乎全新，几乎无使用痕迹',
                '95新': '轻微使用痕迹，功能完好',
                '轻微使用': '有使用痕迹，不影响使用',
                '成色一般': '明显使用痕迹，功能正常'
            };
            return descs[condition] || '';
        },
        getTagIcon: function(tag) {
            var icons = {
                '包邮': '📦',
                '可小刀': '💰',
                '自提': '🏠',
                '价格面议': '💬',
                '支持自提': '📍',
                '可租可买': '🔄'
            };
            return icons[tag] || '🏷️';
        },
        getDiscount: function() {
            if (!this.form.originalPrice || !this.form.price || this.form.originalPrice <= 0) {
                return 0;
            }
            var discount = (this.form.price / this.form.originalPrice * 10).toFixed(1);
            return discount;
        },
        getCategory: function() {
            var that = this;
            this.axios.get('/site/category').then(function(res) {
                that.categoryList = res.data.filter(function(item) {
                    return item.category_id !== 0;
                });
            }, function(err) {
                console.error(err);
            });
        },
        getFileUniqueId: function(file) {
            if (!file.raw) return null;
            return file.raw.name + '-' + file.raw.size + '-' + (file.raw.lastModified || 0);
        },
        handleImageChange: function(file, fileList) {
            if (!file.raw) return;
            
            var fileId = this.getFileUniqueId(file);
            var that = this;
            var existingIndex = this.fileList.findIndex(function(item) {
                return that.getFileUniqueId(item) === fileId;
            });
            if (existingIndex !== -1) return;
            
            var reader = new FileReader();
            reader.onload = function(e) {
                var finalIndex = that.fileList.findIndex(function(item) {
                    return that.getFileUniqueId(item) === fileId;
                });
                if (finalIndex === -1) {
                    that.fileList.push({
                        uid: file.uid || Date.now() + Math.random(),
                        name: file.name,
                        url: e.target.result,
                        raw: file.raw
                    });
                }
            };
            reader.readAsDataURL(file.raw);
        },
        handleExceed: function(files, fileList) {
            this.$message.warning('最多只能上传9张图片，当前已选择' + this.fileList.length + '张');
        },
        removeImage: function(index) {
            this.fileList.splice(index, 1);
        },
        previewImage: function(index) {
            this.previewIndex = index;
            this.previewVisible = true;
        },
        selectCondition: function(condition) {
            this.form.condition = condition;
        },
        toggleTag: function(tag) {
            var index = this.form.tags.indexOf(tag);
            if (index > -1) {
                this.form.tags.splice(index, 1);
            } else {
                this.form.tags.push(tag);
            }
        },
        uploadImages: function() {
            var that = this;
            var imageUrls = [];
            
            var newFiles = this.fileList.filter(function(file) {
                return file.raw !== undefined;
            });
            var existingUrls = this.fileList.filter(function(file) {
                return file.raw === undefined;
            }).map(function(file) {
                return file.url;
            });
            
            imageUrls = existingUrls;
            
            if (newFiles.length === 0) {
                return Promise.resolve(imageUrls);
            }
            
            var promises = newFiles.map(function(file, index) {
                return new Promise(function(resolve) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        resolve(e.target.result);
                    };
                    reader.onerror = function() {
                        resolve('');
                    };
                    reader.readAsDataURL(file.raw);
                });
            });
            
            return Promise.all(promises).then(function(urls) {
                var validUrls = urls.filter(function(url) {
                    return url && url !== '';
                });
                return imageUrls.concat(validUrls);
            });
        },
        submitPublish: function() {
            var that = this;
            this.$refs.publishForm.validate(function(valid) {
                if (valid) {
                    that.publishing = true;
                    that.uploadImages().then(function(imageUrls) {
                        var publishData = {
                            name: that.form.name,
                            categoryId: that.form.categoryId,
                            condition: that.form.condition,
                            price: that.form.price,
                            originalPrice: that.form.originalPrice,
                            num: that.form.num,
                            desc: that.form.desc,
                            tags: that.form.tags,
                            goods_images: imageUrls,
                            imageUrl: imageUrls[0] || '',
                            uid: that.$cookieStore.getCookie('sid')
                        };
                        
                        var apiUrl = '/site/goods';
                        var method = 'post';
                        
                        if (that.isEditMode && that.editGoodsId) {
                            apiUrl = '/site/goods/' + that.editGoodsId + '/update';
                            method = 'post';
                        }
                        
                        if (method === 'post') {
                            that.axios.post(apiUrl, publishData).then(function(res) {
                                var successMsg = that.isEditMode ? '保存成功！' : '发布成功！';
                                that.$message({
                                    message: successMsg,
                                    type: 'success',
                                    duration: 2000
                                });
                                setTimeout(function() {
                                    that.$router.push({ name: 'myGoods' });
                                }, 1000);
                            }, function(err) {
                                console.error(err);
                                that.$message({
                                    message: '操作失败，请稍后重试',
                                    type: 'error'
                                });
                                that.publishing = false;
                            });
                        }
                    }).catch(function(err) {
                        console.error(err);
                        that.publishing = false;
                        that.$message({
                            message: '操作失败，请稍后重试',
                            type: 'error'
                        });
                    });
                }
            });
        },
        goBack: function() {
            var that = this;
            if (this.form.name || this.form.desc || this.fileList.length > 0) {
                this.$confirm('有未保存的内容，确定要离开吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(function() {
                    if (that.isEditMode) {
                        that.$router.push({ name: 'myGoods' });
                    } else {
                        that.$router.push({ path: '/' });
                    }
                }).catch(function() {});
            } else {
                if (that.isEditMode) {
                    that.$router.push({ name: 'myGoods' });
                } else {
                    that.$router.push({ path: '/' });
                }
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
.publish-page
    background #f5f5f5
    min-height calc(100vh - 60px)
    padding 20px 0

.page-header
    margin-bottom 20px
    padding 0 20px

    .page-title
        font-size 20px
        font-weight 600
        color #333
        margin 0

.publish-container
    max-width 800px
    margin 0 auto
    background #fff
    border-radius 12px
    padding 24px
    box-shadow 0 2px 12px rgba(0, 0, 0, 0.05)

.section-title
    display flex
    align-items center
    font-size 16px
    font-weight 600
    color #333
    margin-bottom 16px
    padding-bottom 12px
    border-bottom 1px solid #f0f0f0

    .title-icon
        margin-right 8px
        font-size 18px

    .section-tip
        margin-left auto
        font-size 12px
        color #999
        font-weight normal

.image-upload-section
    display flex
    flex-wrap wrap
    gap 12px
    margin-bottom 32px

.upload-item
    position relative
    width 120px
    height 120px

    .image-wrapper
        width 100%
        height 100%
        border-radius 8px
        overflow hidden
        position relative
        border 2px solid transparent
        transition all 0.3s

        &:hover
            border-color #409EFF

            .image-mask
                opacity 1

        img
            width 100%
            height 100%
            object-fit cover

    .image-mask
        position absolute
        top 0
        left 0
        right 0
        bottom 0
        background rgba(0, 0, 0, 0.5)
        display flex
        align-items center
        justify-content center
        opacity 0
        transition all 0.3s

    .delete-btn
        width 28px
        height 28px
        border-radius 50%
        background #fff
        display flex
        align-items center
        justify-content center
        cursor pointer
        color #ff4d4f
        font-size 14px
        transition all 0.3s

        &:hover
            background #ff4d4f
            color #fff

    .image-index
        position absolute
        bottom -24px
        left 50%
        transform translateX(-50%)
        font-size 12px
        color #409EFF
        font-weight 500

.upload-trigger
    /deep/ .el-upload--picture-card
        width 120px
        height 120px
        border-radius 8px
        background #fafafa
        border 2px dashed #d9d9d9

        &:hover
            border-color #409EFF

.upload-add
    display flex
    flex-direction column
    align-items center
    justify-content center
    height 100%

    .el-icon-plus
        font-size 28px
        color #999
        margin-bottom 8px

    .upload-text
        font-size 12px
        color #999

.publish-form
    .form-tip
        font-size 12px
        color #999
        margin-top 4px

    /deep/ .el-form-item__label
        font-weight 600
        color #333

    /deep/ .el-input__inner
        border-radius 8px
        padding 12px 16px
        height auto
        min-height 40px

    /deep/ .el-textarea__inner
        border-radius 8px
        padding 12px 16px

    /deep/ .el-select
        width 100%

    /deep/ .el-input-number
        width 100%

        .el-input-number__decrease, .el-input-number__increase
            border-radius 0 8px 8px 0

        .el-input__inner
            border-radius 8px

.condition-options
    display flex
    flex-wrap wrap
    gap 12px

.condition-item
    flex 1
    min-width 140px
    padding 16px 12px
    border 2px solid #e8e8e8
    border-radius 12px
    cursor pointer
    transition all 0.3s
    text-align center

    &:hover
        border-color #409EFF
        background #ecf5ff

    &.active
        border-color #409EFF
        background #ecf5ff

    .condition-label
        display block
        font-size 15px
        font-weight 600
        color #333
        margin-bottom 4px

    .condition-desc
        display block
        font-size 11px
        color #999

.price-section
    display flex
    flex-direction column
    gap 16px

.price-group
    display flex
    align-items center
    gap 12px

    &.original-group
        position relative

    .price-label
        width 50px
        font-size 14px
        color #666
        flex-shrink 0

.price-input-wrapper
    position relative
    flex 1
    max-width 280px

    /deep/ .el-input-number
        width 100%

        .el-input__inner
            padding-left 36px
            text-align left

    .currency-symbol
        position absolute
        left 16px
        top 50%
        transform translateY(-50%)
        color #ff6b35
        font-weight bold
        font-size 16px
        z-index 1

.discount-badge
    position absolute
    left calc(100% + 16px)
    top 50%
    transform translateY(-50%)
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    color #fff
    padding 4px 12px
    border-radius 20px
    font-size 14px
    font-weight bold
    box-shadow 0 4px 12px rgba(255, 77, 79, 0.3)

.tags-section
    display flex
    flex-wrap wrap
    gap 12px

.tag-item
    display flex
    align-items center
    gap 6px
    padding 10px 16px
    border 2px solid #e8e8e8
    border-radius 24px
    cursor pointer
    transition all 0.3s

    &:hover
        border-color #409EFF
        background #ecf5ff

    &.active
        border-color #409EFF
        background #ecf5ff

    .tag-icon
        font-size 16px

    .tag-label
        font-size 14px
        color #333

.publish-actions
    display flex
    justify-content flex-end
    gap 12px
    margin-top 32px
    padding-top 24px
    border-top 1px solid #f0f0f0

    .el-button
        padding 12px 32px
        border-radius 24px
        font-size 15px
        font-weight 600

    .publish-btn
        background linear-gradient(135deg, #409EFF, #66b1ff)
        border none
        box-shadow 0 4px 12px rgba(64, 158, 255, 0.3)

        &:hover
            box-shadow 0 6px 16px rgba(64, 158, 255, 0.4)

.preview-container
    display flex
    justify-content center
    align-items center
    min-height 400px

.preview-footer
    text-align center

    .preview-count
        font-size 14px
        color #999

@media (max-width 768px)
    .publish-container
        margin 0 16px
        padding 16px

    .image-upload-section
        .upload-item
            width 80px
            height 80px

        .upload-trigger
            /deep/ .el-upload--picture-card
                width 80px
                height 80px

    .condition-options
        .condition-item
            min-width 100%
            flex auto
</style>
