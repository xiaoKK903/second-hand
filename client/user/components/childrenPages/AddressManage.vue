<template>
    <div id="address-manage">
        <div class="address-header">
            <h4>地址管理</h4>
            <el-button type="primary" @click="showAddDialog">
                <i class="el-icon-plus"></i> 新增地址
            </el-button>
        </div>

        <div class="address-list" v-if="addressList.length > 0">
            <div 
                class="address-item" 
                :class="{ 'is-default': item.is_default }"
                v-for="item in addressList" 
                :key="item.address_id"
            >
                <div class="address-info">
                    <div class="address-name">
                        <span class="name">{{ item.name }}</span>
                        <span class="phone">{{ item.phone_num }}</span>
                        <el-tag v-if="item.is_default" type="danger" size="small">默认</el-tag>
                    </div>
                    <div class="address-detail">
                        {{ item.province ? item.province : '' }}{{ item.city ? item.city : '' }}{{ item.district ? item.district : '' }}{{ item.detail ? item.detail : '' }}
                    </div>
                    <div class="address-detail" v-if="!item.province && item.address">
                        {{ item.address }}
                    </div>
                </div>
                <div class="address-actions">
                    <el-button 
                        type="text" 
                        @click="editAddress(item)"
                        :disabled="loading"
                    >
                        编辑
                    </el-button>
                    <el-button 
                        type="text" 
                        @click="setDefault(item)"
                        :disabled="item.is_default || loading"
                        v-if="!item.is_default"
                    >
                        设为默认
                    </el-button>
                    <el-button 
                        type="text" 
                        class="delete-btn"
                        @click="deleteAddress(item)"
                        :disabled="loading"
                    >
                        删除
                    </el-button>
                </div>
            </div>
        </div>

        <div class="empty-tip" v-else>
            <div class="empty-icon">📍</div>
            <div class="empty-text">暂无收货地址</div>
            <el-button type="primary" @click="showAddDialog">
                <i class="el-icon-plus"></i> 添加第一个地址
            </el-button>
        </div>

        <el-dialog 
            :title="isEdit ? '编辑地址' : '新增地址'" 
            :visible.sync="dialogVisible"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form 
                :model="form" 
                :rules="rules" 
                ref="addressForm"
                label-width="80px"
            >
                <el-form-item label="收货人" prop="name">
                    <el-input v-model="form.name" placeholder="请输入收货人姓名" maxlength="20"></el-input>
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11"></el-input>
                </el-form-item>

                <el-form-item label="所在地区" prop="region">
                    <div class="region-select">
                        <el-select 
                            v-model="form.province" 
                            placeholder="选择省份"
                            @change="handleProvinceChange"
                            style="width: 140px; margin-right: 10px;"
                        >
                            <el-option 
                                v-for="item in provinceList" 
                                :key="item.code" 
                                :label="item.name" 
                                :value="item.name"
                            ></el-option>
                        </el-select>
                        <el-select 
                            v-model="form.city" 
                            placeholder="选择城市"
                            @change="handleCityChange"
                            :disabled="!form.province"
                            style="width: 140px; margin-right: 10px;"
                        >
                            <el-option 
                                v-for="item in cityList" 
                                :key="item.code" 
                                :label="item.name" 
                                :value="item.name"
                            ></el-option>
                        </el-select>
                        <el-select 
                            v-model="form.district" 
                            placeholder="选择区县"
                            :disabled="!form.city"
                            style="width: 140px;"
                        >
                            <el-option 
                                v-for="item in districtList" 
                                :key="item.code" 
                                :label="item.name" 
                                :value="item.name"
                            ></el-option>
                        </el-select>
                    </div>
                </el-form-item>

                <el-form-item label="详细地址" prop="detail">
                    <el-input 
                        v-model="form.detail" 
                        type="textarea"
                        :rows="2"
                        placeholder="请输入详细地址，如街道、门牌号等"
                        maxlength="200"
                    ></el-input>
                </el-form-item>

                <el-form-item label="默认地址">
                    <el-switch 
                        v-model="form.is_default"
                        active-text="设为默认地址"
                    >
                    </el-switch>
                </el-form-item>
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelDialog">取 消</el-button>
                <el-button type="primary" @click="submitForm" :loading="loading">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="typescript">
var regionData = {
    provinces: [
        { code: '110000', name: '北京市', cities: [{ code: '110100', name: '北京市', districts: [
            { code: '110101', name: '东城区' },
            { code: '110102', name: '西城区' },
            { code: '110105', name: '朝阳区' },
            { code: '110106', name: '丰台区' },
            { code: '110107', name: '石景山区' },
            { code: '110108', name: '海淀区' },
            { code: '110109', name: '门头沟区' },
            { code: '110111', name: '房山区' },
            { code: '110112', name: '通州区' },
            { code: '110113', name: '顺义区' },
            { code: '110114', name: '昌平区' },
            { code: '110115', name: '大兴区' },
            { code: '110116', name: '怀柔区' },
            { code: '110117', name: '平谷区' },
            { code: '110118', name: '密云区' },
            { code: '110119', name: '延庆区' }
        ]}] },
        { code: '310000', name: '上海市', cities: [{ code: '310100', name: '上海市', districts: [
            { code: '310101', name: '黄浦区' },
            { code: '310104', name: '徐汇区' },
            { code: '310105', name: '长宁区' },
            { code: '310106', name: '静安区' },
            { code: '310107', name: '普陀区' },
            { code: '310109', name: '虹口区' },
            { code: '310110', name: '杨浦区' },
            { code: '310112', name: '闵行区' },
            { code: '310113', name: '宝山区' },
            { code: '310114', name: '嘉定区' },
            { code: '310115', name: '浦东新区' },
            { code: '310116', name: '金山区' },
            { code: '310117', name: '松江区' },
            { code: '310118', name: '青浦区' },
            { code: '310120', name: '奉贤区' },
            { code: '310151', name: '崇明区' }
        ]}] },
        { code: '440000', name: '广东省', cities: [
            { code: '440100', name: '广州市', districts: [
                { code: '440103', name: '荔湾区' },
                { code: '440104', name: '越秀区' },
                { code: '440105', name: '海珠区' },
                { code: '440106', name: '天河区' },
                { code: '440111', name: '白云区' },
                { code: '440112', name: '黄埔区' },
                { code: '440113', name: '番禺区' },
                { code: '440114', name: '花都区' },
                { code: '440115', name: '南沙区' },
                { code: '440117', name: '从化区' },
                { code: '440118', name: '增城区' }
            ]},
            { code: '440300', name: '深圳市', districts: [
                { code: '440303', name: '罗湖区' },
                { code: '440304', name: '福田区' },
                { code: '440305', name: '南山区' },
                { code: '440306', name: '宝安区' },
                { code: '440307', name: '龙岗区' },
                { code: '440308', name: '盐田区' },
                { code: '440309', name: '龙华区' },
                { code: '440310', name: '坪山区' },
                { code: '440311', name: '光明区' }
            ]}
        ]},
        { code: '330000', name: '浙江省', cities: [
            { code: '330100', name: '杭州市', districts: [
                { code: '330102', name: '上城区' },
                { code: '330104', name: '江干区' },
                { code: '330105', name: '拱墅区' },
                { code: '330106', name: '西湖区' },
                { code: '330108', name: '滨江区' },
                { code: '330109', name: '萧山区' },
                { code: '330110', name: '余杭区' }
            ]},
            { code: '330200', name: '宁波市', districts: [
                { code: '330203', name: '海曙区' },
                { code: '330205', name: '江北区' },
                { code: '330206', name: '北仑区' },
                { code: '330211', name: '镇海区' },
                { code: '330212', name: '鄞州区' }
            ]}
        ]},
        { code: '320000', name: '江苏省', cities: [
            { code: '320100', name: '南京市', districts: [
                { code: '320102', name: '玄武区' },
                { code: '320104', name: '秦淮区' },
                { code: '320105', name: '建邺区' },
                { code: '320106', name: '鼓楼区' },
                { code: '320111', name: '浦口区' },
                { code: '320113', name: '栖霞区' },
                { code: '320114', name: '雨花台区' },
                { code: '320115', name: '江宁区' }
            ]},
            { code: '320200', name: '无锡市', districts: [
                { code: '320205', name: '锡山区' },
                { code: '320206', name: '惠山区' },
                { code: '320211', name: '滨湖区' },
                { code: '320213', name: '梁溪区' },
                { code: '320214', name: '新吴区' }
            ]},
            { code: '320500', name: '苏州市', districts: [
                { code: '320505', name: '虎丘区' },
                { code: '320506', name: '吴中区' },
                { code: '320507', name: '相城区' },
                { code: '320508', name: '姑苏区' },
                { code: '320509', name: '吴江区' }
            ]}
        ]},
        { code: '510000', name: '四川省', cities: [
            { code: '510100', name: '成都市', districts: [
                { code: '510104', name: '锦江区' },
                { code: '510105', name: '青羊区' },
                { code: '510106', name: '金牛区' },
                { code: '510107', name: '武侯区' },
                { code: '510108', name: '成华区' },
                { code: '510112', name: '龙泉驿区' },
                { code: '510113', name: '青白江区' },
                { code: '510114', name: '新都区' },
                { code: '510115', name: '温江区' },
                { code: '510116', name: '双流区' }
            ]}
        ]}
    ]
};

var validatePhone = function(rule, value, callback) {
    if (!value) {
        callback(new Error('请输入手机号'));
    } else if (!(/^1[3456789]\d{9}$/.test(value))) {
        callback(new Error('请输入正确的手机号'));
    } else {
        callback();
    }
};

var validateName = function(rule, value, callback) {
    if (!value) {
        callback(new Error('请输入收货人姓名'));
    } else if (value.length < 2) {
        callback(new Error('收货人姓名至少2个字符'));
    } else {
        callback();
    }
};

var validateDetail = function(rule, value, callback) {
    if (!value) {
        callback(new Error('请输入详细地址'));
    } else if (value.length < 5) {
        callback(new Error('详细地址至少5个字符'));
    } else {
        callback();
    }
};

export default {
    data: function() {
        var that = this;
        return {
            addressList: [],
            loading: false,
            dialogVisible: false,
            isEdit: false,
            editId: null,
            provinceList: regionData.provinces,
            cityList: [],
            districtList: [],
            form: {
                name: '',
                phone: '',
                province: '',
                city: '',
                district: '',
                detail: '',
                is_default: false
            },
            rules: {
                name: [
                    { validator: validateName, trigger: ['blur', 'change'] }
                ],
                phone: [
                    { validator: validatePhone, trigger: ['blur', 'change'] }
                ],
                detail: [
                    { validator: validateDetail, trigger: ['blur', 'change'] }
                ]
            }
        }
    },
    created: function() {
        this.getAddressList();
    },
    methods: {
        getAddressList: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) return;
            
            var that = this;
            this.axios.get('/site/getAddress/' + uid).then(function(res) {
                that.addressList = res.data || [];
            }, function(err) {
                console.error('获取地址列表失败:', err);
                that.$message.error('获取地址列表失败');
            });
        },

        showAddDialog: function() {
            this.isEdit = false;
            this.editId = null;
            this.resetForm();
            this.dialogVisible = true;
        },

        editAddress: function(item) {
            this.isEdit = true;
            this.editId = item.address_id;
            this.resetForm();
            
            this.form.name = item.name;
            this.form.phone = item.phone_num;
            this.form.detail = item.detail || '';
            this.form.is_default = item.is_default || false;
            
            if (item.province && item.city && item.district) {
                this.form.province = item.province;
                this.form.city = item.city;
                this.form.district = item.district;
                
                var that = this;
                var provinces = regionData.provinces;
                for (var i = 0; i < provinces.length; i++) {
                    if (provinces[i].name === item.province) {
                        that.cityList = provinces[i].cities;
                        for (var j = 0; j < provinces[i].cities.length; j++) {
                            if (provinces[i].cities[j].name === item.city) {
                                that.districtList = provinces[i].cities[j].districts;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            
            this.dialogVisible = true;
        },

        handleProvinceChange: function(val) {
            this.form.city = '';
            this.form.district = '';
            this.districtList = [];
            
            var provinces = regionData.provinces;
            for (var i = 0; i < provinces.length; i++) {
                if (provinces[i].name === val) {
                    this.cityList = provinces[i].cities;
                    break;
                }
            }
        },

        handleCityChange: function(val) {
            this.form.district = '';
            
            var cities = this.cityList;
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].name === val) {
                    this.districtList = cities[i].districts;
                    break;
                }
            }
        },

        resetForm: function() {
            this.form = {
                name: '',
                phone: '',
                province: '',
                city: '',
                district: '',
                detail: '',
                is_default: false
            };
            this.cityList = [];
            this.districtList = [];
            if (this.$refs.addressForm) {
                this.$refs.addressForm.resetFields();
            }
        },

        cancelDialog: function() {
            this.dialogVisible = false;
            this.resetForm();
        },

        submitForm: function() {
            var that = this;
            this.$refs.addressForm.validate(function(valid) {
                if (valid) {
                    if (!that.form.province || !that.form.city || !that.form.district) {
                        that.$message.warning('请选择完整的省市区');
                        return;
                    }
                    
                    that.loading = true;
                    var uid = that.$cookieStore.getCookie('sid');
                    var addressData = {
                        uid: uid,
                        name: that.form.name,
                        phone: that.form.phone,
                        province: that.form.province,
                        city: that.form.city,
                        district: that.form.district,
                        detail: that.form.detail,
                        address: that.form.province + that.form.city + that.form.district + that.form.detail,
                        is_default: that.form.is_default
                    };

                    var url = that.isEdit ? '/site/address/update' : '/site/addAddress';
                    if (that.isEdit) {
                        addressData.address_id = that.editId;
                    }

                    that.axios.post(url, addressData).then(function(res) {
                        if (res.data && res.data.success) {
                            that.$message.success(that.isEdit ? '修改成功' : '添加成功');
                            that.dialogVisible = false;
                            that.getAddressList();
                        } else {
                            that.$message.error(res.data ? (res.data.msg || '操作失败') : '操作失败');
                        }
                        that.loading = false;
                    }, function(err) {
                        console.error('提交地址失败:', err);
                        that.$message.error('操作失败');
                        that.loading = false;
                    });
                } else {
                    return false;
                }
            });
        },

        setDefault: function(item) {
            var that = this;
            this.$confirm('确定将此地址设为默认地址吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                var uid = that.$cookieStore.getCookie('sid');
                that.loading = true;
                that.axios.post('/site/address/setDefault', {
                    address_id: item.address_id,
                    user_id: uid
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message.success('设置成功');
                        that.getAddressList();
                    } else {
                        that.$message.error(res.data ? (res.data.msg || '设置失败') : '设置失败');
                    }
                    that.loading = false;
                }, function(err) {
                    console.error('设置默认地址失败:', err);
                    that.$message.error('设置失败');
                    that.loading = false;
                });
            }).catch(function() {
                // 取消
            });
        },

        deleteAddress: function(item) {
            var that = this;
            this.$confirm('确定要删除此地址吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.loading = true;
                that.axios.post('/site/delAddress', {
                    address_id: item.address_id
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message.success('删除成功');
                        that.getAddressList();
                    } else {
                        that.$message.error(res.data ? (res.data.msg || '删除失败') : '删除失败');
                    }
                    that.loading = false;
                }, function(err) {
                    console.error('删除地址失败:', err);
                    that.$message.error('删除失败');
                    that.loading = false;
                });
            }).catch(function() {
                // 取消
            });
        }
    }
}
</script>

<style lang="stylus">
    #address-manage
        padding 20px

        .address-header
            display flex
            justify-content space-between
            align-items center
            margin-bottom 20px

            h4
                margin 0
                font-size 18px
                font-weight 600
                color #333

        .address-list
            .address-item
                background #fff
                border 1px solid #e8e8e8
                border-radius 8px
                padding 20px
                margin-bottom 15px
                display flex
                justify-content space-between
                align-items flex-start
                transition all 0.3s

                &:hover
                    border-color #409eff
                    box-shadow 0 2px 12px rgba(0,0,0,0.1)

                &.is-default
                    border-color #f56c6c
                    background linear-gradient(135deg, rgba(245,108,108,0.05) 0%, rgba(255,255,255,1) 100%)

            .address-info
                flex 1

                .address-name
                    margin-bottom 10px

                    .name
                        font-size 16px
                        font-weight 600
                        color #333
                        margin-right 15px

                    .phone
                        font-size 14px
                        color #666
                        margin-right 10px

                    .el-tag
                        font-size 12px

                .address-detail
                    font-size 14px
                    color #666
                    line-height 1.6

            .address-actions
                margin-left 20px

                .delete-btn
                    color #f56c6c

                .el-button
                    font-size 13px

        .empty-tip
            text-align center
            padding 60px 20px

            .empty-icon
                font-size 64px
                margin-bottom 20px

            .empty-text
                font-size 16px
                color #999
                margin-bottom 24px

        .region-select
            display flex
            align-items center

    .dialog-footer
        text-align right
</style>
