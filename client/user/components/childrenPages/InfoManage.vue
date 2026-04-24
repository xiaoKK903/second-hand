<template>
    <div id="info-manage">
        <div class="info-tabs">
            <div 
                class="tab-item" 
                :class="{ active: activeTab === 'profile' }"
                @click="activeTab = 'profile'">
                个人资料
            </div>
            <div 
                class="tab-item" 
                :class="{ active: activeTab === 'password' }"
                @click="activeTab = 'password'">
                修改密码
            </div>
        </div>

        <div class="tab-content" v-if="activeTab === 'profile'">
            <div class="avatar-section">
                <div class="avatar-label">头像</div>
                <div class="avatar-upload">
                    <div class="avatar-preview" @click="triggerAvatarUpload">
                        <div class="avatar-circle" v-if="profileForm.avatar">
                            <img :src="profileForm.avatar" :alt="profileForm.nickname">
                        </div>
                        <div class="avatar-circle avatar-placeholder" v-else>
                            <i class="el-icon-plus"></i>
                        </div>
                        <div class="avatar-overlay">
                            <i class="el-icon-camera"></i>
                            <span>更换</span>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref="avatarInput" 
                        style="display: none;" 
                        accept="image/*"
                        @change="handleAvatarChange">
                </div>
            </div>

            <el-form :model="profileForm" label-width="100px" class="profile-form">
                <el-form-item label="用户ID">
                    <span class="form-text">{{ profileForm.user_id || '-' }}</span>
                </el-form-item>
                
                <el-form-item label="手机号">
                    <span class="form-text">{{ formatPhone(profileForm.phone_num) }}</span>
                </el-form-item>
                
                <el-form-item label="昵称">
                    <el-input 
                        v-model="profileForm.nickname" 
                        placeholder="请输入昵称"
                        maxlength="20"
                        show-word-limit>
                    </el-input>
                </el-form-item>
                
                <el-form-item label="个性签名">
                    <el-input 
                        v-model="profileForm.bio" 
                        type="textarea"
                        :rows="2"
                        placeholder="介绍一下自己吧..."
                        maxlength="200"
                        show-word-limit>
                    </el-input>
                </el-form-item>
                
                <el-form-item label="联系方式">
                    <el-input 
                        v-model="profileForm.contact" 
                        placeholder="微信/QQ等联系方式"
                        maxlength="50"
                        show-word-limit>
                    </el-input>
                </el-form-item>
                
                <el-form-item>
                    <el-button type="primary" @click="saveProfile" :loading="saving">
                        <i class="el-icon-check"></i>
                        保存修改
                    </el-button>
                </el-form-item>
            </el-form>
        </div>

        <div class="tab-content" v-else>
            <h4 class="section-title">修改密码</h4>
            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="password-form">
                <el-form-item label="原密码" prop="pass">
                    <el-input 
                        type="password" 
                        v-model="ruleForm.pass" 
                        autocomplete="off"
                        placeholder="请输入原密码">
                    </el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="checkPass">
                    <el-input 
                        type="password" 
                        v-model="ruleForm.checkPass" 
                        autocomplete="off"
                        placeholder="请输入新密码">
                    </el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPass">
                    <el-input 
                        type="password" 
                        v-model="ruleForm.confirmPass" 
                        autocomplete="off"
                        placeholder="请再次输入新密码">
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('ruleForm')">
                        <i class="el-icon-check"></i>
                        确认修改
                    </el-button>
                    <el-button @click="resetForm('ruleForm')">
                        取消
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'InfoManage',
    data: function() {
        var that = this;
        
        var validatePass = function(rule, value, callback) {
            if (value === '') {
                callback(new Error('请输入原密码'));
            } else {
                callback();
            }
        };
        
        var validatePass2 = function(rule, value, callback) {
            if (value === '') {
                callback(new Error('请输入新密码'));
            } else if (value.length < 6) {
                callback(new Error('密码长度不能少于6位'));
            } else {
                callback();
            }
        };
        
        var validateConfirmPass = function(rule, value, callback) {
            if (value === '') {
                callback(new Error('请再次输入新密码'));
            } else if (value !== that.ruleForm.checkPass) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        
        return {
            activeTab: 'profile',
            saving: false,
            profileForm: {
                user_id: '',
                phone_num: '',
                nickname: '',
                avatar: '',
                bio: '',
                contact: ''
            },
            ruleForm: {
                pass: '',
                checkPass: '',
                confirmPass: ''
            },
            rules: {
                pass: [
                    { validator: validatePass, trigger: 'blur' }
                ],
                checkPass: [
                    { validator: validatePass2, trigger: 'blur' }
                ],
                confirmPass: [
                    { validator: validateConfirmPass, trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        if (this.$route.query && this.$route.query.tab === 'password') {
            this.activeTab = 'password';
        } else {
            this.activeTab = 'profile';
        }
        this.loadUserInfo();
    },
    methods: {
        loadUserInfo: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            
            var that = this;
            this.axios.get('/site/user/' + uid).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.profileForm.user_id = res.data.data.user_id;
                    that.profileForm.phone_num = res.data.data.phone_num;
                    that.profileForm.nickname = res.data.data.nickname || '';
                    that.profileForm.avatar = res.data.data.avatar || '';
                    that.profileForm.bio = res.data.data.bio || '';
                    that.profileForm.contact = res.data.data.contact || '';
                }
            }, function(err) {
                console.error(err);
            });
        },
        
        formatPhone: function(phone) {
            if (!phone) return '-';
            if (phone.length === 11) {
                return phone.substring(0, 3) + '****' + phone.substring(7);
            }
            return phone;
        },
        
        triggerAvatarUpload: function() {
            this.$refs.avatarInput.click();
        },
        
        handleAvatarChange: function(e) {
            var file = e.target.files[0];
            if (!file) return;
            
            if (!file.type.startsWith('image/')) {
                this.$message.warning('请选择图片文件');
                return;
            }
            
            var maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                this.$message.warning('图片大小不能超过5MB');
                return;
            }
            
            var that = this;
            var reader = new FileReader();
            reader.onload = function(e) {
                that.profileForm.avatar = e.target.result;
            };
            reader.readAsDataURL(file);
            
            e.target.value = '';
        },
        
        saveProfile: function() {
            var uid = this.$cookieStore.getCookie('sid');
            if (!uid) {
                this.$router.push({ name: 'login' });
                return;
            }
            
            this.saving = true;
            var that = this;
            
            var updateData = {
                uid: uid
            };
            
            if (this.profileForm.nickname !== undefined) {
                updateData.nickname = this.profileForm.nickname;
            }
            if (this.profileForm.avatar !== undefined) {
                updateData.avatar = this.profileForm.avatar;
            }
            if (this.profileForm.bio !== undefined) {
                updateData.bio = this.profileForm.bio;
            }
            if (this.profileForm.contact !== undefined) {
                updateData.contact = this.profileForm.contact;
            }
            
            console.log('Saving profile:', updateData);
            
            this.axios.post('/site/user/profile', updateData).then(function(res) {
                console.log('Save profile response:', res.data);
                that.saving = false;
                if (res.data && res.data.success) {
                    that.$message({
                        message: '个人资料修改成功',
                        type: 'success'
                    });
                } else {
                    that.$message({
                        message: res.data.msg || '修改失败',
                        type: 'warning'
                    });
                }
            }, function(err) {
                console.error('Save profile error:', err);
                that.saving = false;
                that.$message({
                    message: '保存失败，请稍后重试',
                    type: 'error'
                });
            });
        },
        
        submitForm: function(formName) {
            var that = this;
            this.$refs[formName].validate(function(valid) {
                if (valid) {
                    var uid = that.$cookieStore.getCookie('sid');
                    if (!uid) {
                        that.$message.error('请先登录');
                        that.$router.push({ name: 'login' });
                        return;
                    }
                    that.axios.post('/site/user', {
                        uid: uid,
                        form: {
                            pass: that.ruleForm.pass,
                            checkPass: that.ruleForm.checkPass
                        }
                    }).then(function(res) {
                        if (res.data && res.data.code === 201) {
                            that.$message.error('原密码错误!');
                        } else if (res.data && res.data.success) {
                            that.$message({
                                message: res.data.msg || '修改密码成功',
                                type: 'success'
                            });
                            that.$refs[formName].resetFields();
                        } else if (res.data && res.data.msg) {
                            that.$message.error(res.data.msg);
                        } else {
                            that.$message.error('修改失败，请稍后重试');
                        }
                    }, function(err) {
                        console.error(err);
                        that.$message.error('网络错误，请稍后重试');
                    });
                } else {
                    return false;
                }
            });
        },
        
        resetForm: function(formName) {
            this.$refs[formName].resetFields();
        }
    }
}
</script>

<style lang="stylus" scoped>
#info-manage
    padding 20px

.info-tabs
    display flex
    gap 0
    margin-bottom 24px
    border-bottom 2px solid #f0f0f0

.tab-item
    padding 12px 24px
    font-size 15px
    font-weight 500
    color #666
    cursor pointer
    transition all 0.3s
    position relative
    margin-bottom -2px

    &.active
        color #ff6b35
        font-weight 600

        &::after
            content ''
            position absolute
            bottom 0
            left 0
            right 0
            height 2px
            background linear-gradient(135deg, #ff6b35, #ff4d4f)
            border-radius 2px

    &:hover
        color #ff6b35

.tab-content
    background #fff
    border-radius 12px
    padding 24px

.section-title
    margin 0 0 20px 0
    font-size 16px
    font-weight 600
    color #333

.avatar-section
    display flex
    align-items center
    gap 16px
    margin-bottom 24px
    padding-bottom 24px
    border-bottom 1px solid #f0f0f0

.avatar-label
    width 100px
    font-size 14px
    font-weight 500
    color #606266
    text-align right

.avatar-upload
    position relative

.avatar-preview
    position relative
    cursor pointer

.avatar-circle
    width 80px
    height 80px
    border-radius 50%
    overflow hidden
    background linear-gradient(135deg, #667eea, #764ba2)
    display flex
    align-items center
    justify-content center
    border 3px solid #f0f0f0
    transition border-color 0.3s

    img
        width 100%
        height 100%
        object-fit cover

    &.avatar-placeholder
        i
            font-size 28px
            color #fff

.avatar-overlay
    position absolute
    top 0
    left 0
    right 0
    bottom 0
    border-radius 50%
    background rgba(0, 0, 0, 0.5)
    display flex
    flex-direction column
    align-items center
    justify-content center
    opacity 0
    transition opacity 0.3s
    cursor pointer

    .avatar-preview:hover &
        opacity 1

    i
        font-size 20px
        color #fff
        margin-bottom 4px

    span
        font-size 12px
        color #fff

.profile-form
    .form-text
        font-size 14px
        color #333
        font-weight 500

.password-form
    max-width 500px

>>> .el-form-item__label
    font-weight 500

>>> .el-input__inner
    border-radius 8px

>>> .el-textarea__inner
    border-radius 8px

>>> .el-button--primary
    background linear-gradient(135deg, #ff6b35, #ff4d4f)
    border none
    border-radius 8px

    &:hover
        background linear-gradient(135deg, #ff5a1f, #ff3a3a)
</style>
