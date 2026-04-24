<template>
    <div id="admin-dashboard">
        <div class="admin-header">
            <div class="header-left">
                <div class="logo">
                    <i class="el-icon-s-tools"></i>
                    <span>管理后台</span>
                </div>
            </div>
            <div class="header-right">
                <div class="admin-info">
                    <i class="el-icon-user-solid"></i>
                    <span>管理员</span>
                </div>
                <el-button type="text" @click="handleLogout" class="logout-btn">
                    <i class="el-icon-switch-button"></i>
                    退出
                </el-button>
            </div>
        </div>
        
        <div class="admin-main">
            <div class="admin-sidebar">
                <div class="sidebar-menu">
                    <div 
                        class="menu-item" 
                        :class="{ active: activeMenu === 'stats' }"
                        @click="activeMenu = 'stats'">
                        <i class="el-icon-data-analysis"></i>
                        <span>数据统计</span>
                    </div>
                    <div 
                        class="menu-item" 
                        :class="{ active: activeMenu === 'users' }"
                        @click="activeMenu = 'users'">
                        <i class="el-icon-user"></i>
                        <span>用户管理</span>
                        <el-badge :value="pendingUserCount" :hidden="pendingUserCount === 0" class="menu-badge">
                        </el-badge>
                    </div>
                    <div 
                        class="menu-item" 
                        :class="{ active: activeMenu === 'goods' }"
                        @click="activeMenu = 'goods'">
                        <i class="el-icon-goods"></i>
                        <span>商品管理</span>
                        <el-badge :value="pendingGoodsCount" :hidden="pendingGoodsCount === 0" class="menu-badge" type="warning">
                        </el-badge>
                    </div>
                </div>
                
                <div class="sidebar-footer">
                    <el-button type="text" @click="goToHome" class="go-home-btn">
                        <i class="el-icon-back"></i>
                        返回前台
                    </el-button>
                </div>
            </div>
            
            <div class="admin-content">
                <div class="content-wrapper" v-if="activeMenu === 'stats'">
                    <h2 class="section-title">数据统计</h2>
                    
                    <div class="stats-grid">
                        <div class="stat-card user-card">
                            <div class="stat-icon">
                                <i class="el-icon-user"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value">{{ stats.users?.total || 0 }}</div>
                                <div class="stat-label">总用户数</div>
                            </div>
                        </div>
                        <div class="stat-card active-user-card">
                            <div class="stat-icon">
                                <i class="el-icon-circle-check"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value">{{ stats.users?.active || 0 }}</div>
                                <div class="stat-label">活跃用户</div>
                            </div>
                        </div>
                        <div class="stat-card goods-card">
                            <div class="stat-icon">
                                <i class="el-icon-goods"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value">{{ stats.goods?.total || 0 }}</div>
                                <div class="stat-label">商品总数</div>
                            </div>
                        </div>
                        <div class="stat-card pending-card">
                            <div class="stat-icon">
                                <i class="el-icon-time"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value pending-value">{{ stats.goods?.pending || 0 }}</div>
                                <div class="stat-label">待审核商品</div>
                            </div>
                        </div>
                        <div class="stat-card sold-card">
                            <div class="stat-icon">
                                <i class="el-icon-success"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value sold-value">{{ stats.goods?.sold || 0 }}</div>
                                <div class="stat-label">已成交</div>
                            </div>
                        </div>
                        <div class="stat-card approved-card">
                            <div class="stat-icon">
                                <i class="el-icon-check"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value approved-value">{{ stats.goods?.approved || 0 }}</div>
                                <div class="stat-label">已通过审核</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stats-detail">
                        <h3 class="detail-title">商品审核状态分布</h3>
                        <div class="audit-status-bar">
                            <div 
                                class="status-bar pending-bar" 
                                :style="{ width: getPercentage(stats.goods?.pending, stats.goods?.total) + '%' }">
                                <span v-if="stats.goods?.pending > 0">待审核 {{ stats.goods?.pending }}</span>
                            </div>
                            <div 
                                class="status-bar approved-bar" 
                                :style="{ width: getPercentage(stats.goods?.approved, stats.goods?.total) + '%' }">
                                <span v-if="stats.goods?.approved > 0">已通过 {{ stats.goods?.approved }}</span>
                            </div>
                            <div 
                                class="status-bar rejected-bar" 
                                :style="{ width: getPercentage(stats.goods?.rejected, stats.goods?.total) + '%' }">
                                <span v-if="stats.goods?.rejected > 0">已拒绝 {{ stats.goods?.rejected }}</span>
                            </div>
                        </div>
                        <div class="status-legend">
                            <div class="legend-item">
                                <span class="legend-color pending-color"></span>
                                <span>待审核</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color approved-color"></span>
                                <span>已通过</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color rejected-color"></span>
                                <span>已拒绝</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="content-wrapper" v-if="activeMenu === 'users'">
                    <div class="section-header">
                        <h2 class="section-title">用户管理</h2>
                        <div class="section-actions">
                            <el-input 
                                v-model="userFilter.keyword" 
                                placeholder="搜索手机号/昵称"
                                clearable
                                style="width: 200px; margin-right: 10px;"
                                @change="loadUsers">
                            </el-input>
                            <el-select v-model="userFilter.role" placeholder="角色筛选" clearable style="width: 120px; margin-right: 10px;" @change="loadUsers">
                                <el-option label="管理员" value="admin"></el-option>
                                <el-option label="普通用户" value="user"></el-option>
                            </el-select>
                            <el-select v-model="userFilter.is_active" placeholder="状态筛选" clearable style="width: 120px;" @change="loadUsers">
                                <el-option label="正常" :value="true"></el-option>
                                <el-option label="禁用" :value="false"></el-option>
                            </el-select>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <el-table :data="userList" border stripe>
                            <el-table-column prop="user_id" label="用户ID" width="80"></el-table-column>
                            <el-table-column prop="phone_num" label="手机号" width="140"></el-table-column>
                            <el-table-column prop="nickname" label="昵称" width="120">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.nickname || '-' }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="role" label="角色" width="100">
                                <template slot-scope="scope">
                                    <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'" size="small">
                                        {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="is_active" label="状态" width="100">
                                <template slot-scope="scope">
                                    <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
                                        {{ scope.row.is_active ? '正常' : '禁用' }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="created_at" label="注册时间" width="180">
                                <template slot-scope="scope">
                                    <span>{{ formatDate(scope.row.created_at) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="200">
                                <template slot-scope="scope">
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        @click="toggleUserRole(scope.row)">
                                        {{ scope.row.role === 'admin' ? '取消管理员' : '设为管理员' }}
                                    </el-button>
                                    <el-button 
                                        :type="scope.row.is_active ? 'text' : 'text'"
                                        :class="scope.row.is_active ? 'danger-text' : 'success-text'"
                                        size="small"
                                        @click="toggleUserActive(scope.row)">
                                        {{ scope.row.is_active ? '禁用' : '启用' }}
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
                
                <div class="content-wrapper" v-if="activeMenu === 'goods'">
                    <div class="section-header">
                        <h2 class="section-title">商品管理</h2>
                        <div class="section-actions">
                            <el-input 
                                v-model="goodsFilter.keyword" 
                                placeholder="搜索商品名称"
                                clearable
                                style="width: 200px; margin-right: 10px;"
                                @change="loadGoods">
                            </el-input>
                            <el-select v-model="goodsFilter.audit_status" placeholder="审核状态" clearable style="width: 120px; margin-right: 10px;" @change="loadGoods">
                                <el-option label="待审核" value="pending"></el-option>
                                <el-option label="已通过" value="approved"></el-option>
                                <el-option label="已拒绝" value="rejected"></el-option>
                            </el-select>
                            <el-select v-model="goodsFilter.status" placeholder="上架状态" clearable style="width: 120px;" @change="loadGoods">
                                <el-option label="在售" value="active"></el-option>
                                <el-option label="已下架" value="inactive"></el-option>
                                <el-option label="已售出" value="sold"></el-option>
                            </el-select>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <el-table :data="goodsList" border stripe>
                            <el-table-column prop="goods_id" label="商品ID" width="80"></el-table-column>
                            <el-table-column prop="goods_name" label="商品名称" min-width="180" show-overflow-tooltip></el-table-column>
                            <el-table-column prop="goods_price" label="价格" width="100">
                                <template slot-scope="scope">
                                    <span class="price-text">¥{{ scope.row.goods_price }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="user_id" label="卖家ID" width="80"></el-table-column>
                            <el-table-column prop="audit_status" label="审核状态" width="100">
                                <template slot-scope="scope">
                                    <el-tag 
                                        :type="getAuditTagType(scope.row.audit_status)" 
                                        size="small">
                                        {{ getAuditStatusText(scope.row.audit_status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="上架状态" width="100">
                                <template slot-scope="scope">
                                    <el-tag 
                                        :type="getStatusTagType(scope.row.status)" 
                                        size="small">
                                        {{ getStatusText(scope.row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="views" label="浏览量" width="80"></el-table-column>
                            <el-table-column prop="created_at" label="发布时间" width="160">
                                <template slot-scope="scope">
                                    <span>{{ formatDate(scope.row.created_at) }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="280">
                                <template slot-scope="scope">
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        class="success-text"
                                        @click="auditGoods(scope.row, 'approved')"
                                        v-if="scope.row.audit_status !== 'approved'">
                                        通过
                                    </el-button>
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        class="danger-text"
                                        @click="auditGoods(scope.row, 'rejected')"
                                        v-if="scope.row.audit_status !== 'rejected'">
                                        拒绝
                                    </el-button>
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        class="warning-text"
                                        @click="takeDownGoods(scope.row)"
                                        v-if="scope.row.status === 'active'">
                                        下架
                                    </el-button>
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        class="danger-text"
                                        @click="deleteGoods(scope.row)">
                                        删除
                                    </el-button>
                                    <el-button 
                                        type="text" 
                                        size="small"
                                        @click="viewGoodsDetail(scope.row)">
                                        详情
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        
        <el-dialog
            title="审核商品"
            :visible.sync="auditDialogVisible"
            width="400px">
            <el-form :model="auditForm" label-width="80px">
                <el-form-item label="审核结果">
                    <el-tag :type="auditForm.status === 'approved' ? 'success' : 'danger'" size="medium">
                        {{ auditForm.status === 'approved' ? '审核通过' : '审核拒绝' }}
                    </el-tag>
                </el-form-item>
                <el-form-item label="审核备注">
                    <el-input 
                        v-model="auditForm.remark" 
                        type="textarea"
                        :rows="3"
                        placeholder="请输入审核备注（可选）"
                        maxlength="200"
                        show-word-limit>
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="auditDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmAudit">确 定</el-button>
            </span>
        </el-dialog>
        
        <el-dialog
            title="商品详情"
            :visible.sync="detailDialogVisible"
            width="600px">
            <div class="goods-detail-dialog" v-if="currentGoods">
                <div class="detail-item">
                    <span class="detail-label">商品名称：</span>
                    <span class="detail-value">{{ currentGoods.goods_name }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">价格：</span>
                    <span class="detail-value price-text">¥{{ currentGoods.goods_price }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">原价：</span>
                    <span class="detail-value">{{ currentGoods.original_price ? '¥' + currentGoods.original_price : '-' }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">成色：</span>
                    <span class="detail-value">{{ currentGoods.condition }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">商品描述：</span>
                    <span class="detail-value">{{ currentGoods.goods_desc || '-' }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">审核状态：</span>
                    <el-tag :type="getAuditTagType(currentGoods.audit_status)" size="small">
                        {{ getAuditStatusText(currentGoods.audit_status) }}
                    </el-tag>
                </div>
                <div class="detail-item" v-if="currentGoods.audit_remark">
                    <span class="detail-label">审核备注：</span>
                    <span class="detail-value">{{ currentGoods.audit_remark }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">上架状态：</span>
                    <el-tag :type="getStatusTagType(currentGoods.status)" size="small">
                        {{ getStatusText(currentGoods.status) }}
                    </el-tag>
                </div>
                <div class="detail-item">
                    <span class="detail-label">浏览量：</span>
                    <span class="detail-value">{{ currentGoods.views }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">卖家ID：</span>
                    <span class="detail-value">{{ currentGoods.user_id }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">发布时间：</span>
                    <span class="detail-value">{{ formatDate(currentGoods.created_at) }}</span>
                </div>
                <div class="detail-images" v-if="currentGoods.goods_image">
                    <span class="detail-label">商品图片：</span>
                    <div class="image-list">
                        <div class="image-item" v-if="currentGoods.goods_image">
                            <img :src="currentGoods.goods_image" alt="商品图片">
                        </div>
                    </div>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="detailDialogVisible = false">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script lang="typescript">
export default {
    name: 'AdminDashboard',
    data: function() {
        return {
            activeMenu: 'stats',
            stats: {
                users: { total: 0, active: 0, admins: 0 },
                goods: { total: 0, pending: 0, approved: 0, rejected: 0, sold: 0, active: 0 }
            },
            userList: [],
            userFilter: {
                keyword: '',
                role: '',
                is_active: null
            },
            goodsList: [],
            goodsFilter: {
                keyword: '',
                audit_status: '',
                status: ''
            },
            auditDialogVisible: false,
            auditForm: {
                goods_id: null,
                status: 'approved',
                remark: ''
            },
            detailDialogVisible: false,
            currentGoods: null
        }
    },
    computed: {
        pendingGoodsCount: function() {
            return this.stats.goods?.pending || 0;
        },
        pendingUserCount: function() {
            return 0;
        }
    },
    created: function() {
        this.checkAuth();
    },
    methods: {
        checkAuth: function() {
            var adminUid = this.$cookieStore.getCookie('admin_uid');
            if (!adminUid) {
                this.$router.push({ name: 'adminLogin' });
                return;
            }
            this.loadStats();
            this.loadUsers();
            this.loadGoods();
        },
        
        loadStats: function() {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            
            this.axios.get('/admin/stats', {
                params: { uid: uid }
            }).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.stats = res.data.data;
                }
            }, function(err) {
                console.error(err);
            });
        },
        
        loadUsers: function() {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            var params = { uid: uid };
            
            if (this.userFilter.keyword) {
                params.keyword = this.userFilter.keyword;
            }
            if (this.userFilter.role) {
                params.role = this.userFilter.role;
            }
            if (this.userFilter.is_active !== null) {
                params.is_active = this.userFilter.is_active;
            }
            
            this.axios.get('/admin/users', {
                params: params
            }).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.userList = res.data.data;
                }
            }, function(err) {
                console.error(err);
            });
        },
        
        loadGoods: function() {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            var params = { uid: uid };
            
            if (this.goodsFilter.keyword) {
                params.keyword = this.goodsFilter.keyword;
            }
            if (this.goodsFilter.audit_status) {
                params.audit_status = this.goodsFilter.audit_status;
            }
            if (this.goodsFilter.status) {
                params.status = this.goodsFilter.status;
            }
            
            this.axios.get('/admin/goods', {
                params: params
            }).then(function(res) {
                if (res.data && res.data.success && res.data.data) {
                    that.goodsList = res.data.data;
                }
            }, function(err) {
                console.error(err);
            });
        },
        
        toggleUserActive: function(user) {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            var newActive = !user.is_active;
            
            var actionText = newActive ? '启用' : '禁用';
            this.$confirm('确定要' + actionText + '该用户吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.axios.post('/admin/user/toggleActive', {
                    uid: uid,
                    target_user_id: user.user_id,
                    is_active: newActive
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message({
                            message: '操作成功',
                            type: 'success'
                        });
                        that.loadUsers();
                    } else {
                        that.$message({
                            message: res.data.msg || '操作失败',
                            type: 'error'
                        });
                    }
                }, function(err) {
                    console.error(err);
                    that.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            }).catch(function() {});
        },
        
        toggleUserRole: function(user) {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            var newRole = user.role === 'admin' ? 'user' : 'admin';
            
            var actionText = newRole === 'admin' ? '设为管理员' : '取消管理员';
            this.$confirm('确定要' + actionText + '该用户吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.axios.post('/admin/user/toggleRole', {
                    uid: uid,
                    target_user_id: user.user_id,
                    role: newRole
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message({
                            message: '操作成功',
                            type: 'success'
                        });
                        that.loadUsers();
                    } else {
                        that.$message({
                            message: res.data.msg || '操作失败',
                            type: 'error'
                        });
                    }
                }, function(err) {
                    console.error(err);
                    that.$message({
                        message: '操作失败',
                        type: 'error'
                    });
                });
            }).catch(function() {});
        },
        
        auditGoods: function(goods, status) {
            this.auditForm = {
                goods_id: goods.goods_id,
                status: status,
                remark: ''
            };
            this.auditDialogVisible = true;
        },
        
        confirmAudit: function() {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            
            this.axios.post('/admin/goods/audit', {
                uid: uid,
                goods_id: this.auditForm.goods_id,
                audit_status: this.auditForm.status,
                audit_remark: this.auditForm.remark
            }).then(function(res) {
                if (res.data && res.data.success) {
                    that.$message({
                        message: '审核成功',
                        type: 'success'
                    });
                    that.auditDialogVisible = false;
                    that.loadGoods();
                    that.loadStats();
                } else {
                    that.$message({
                        message: res.data.msg || '审核失败',
                        type: 'error'
                    });
                }
            }, function(err) {
                console.error(err);
                that.$message({
                    message: '审核失败',
                    type: 'error'
                });
            });
        },
        
        takeDownGoods: function(goods) {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            
            this.$confirm('确定要下架该商品吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.axios.post('/admin/goods/takedown', {
                    uid: uid,
                    goods_id: goods.goods_id,
                    remark: '管理员强制下架'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message({
                            message: '下架成功',
                            type: 'success'
                        });
                        that.loadGoods();
                        that.loadStats();
                    } else {
                        that.$message({
                            message: res.data.msg || '下架失败',
                            type: 'error'
                        });
                    }
                }, function(err) {
                    console.error(err);
                    that.$message({
                        message: '下架失败',
                        type: 'error'
                    });
                });
            }).catch(function() {});
        },
        
        deleteGoods: function(goods) {
            var uid = this.$cookieStore.getCookie('admin_uid');
            var that = this;
            
            this.$confirm('确定要删除该商品吗？此操作不可恢复！', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'danger'
            }).then(function() {
                that.axios.post('/admin/goods/delete', {
                    uid: uid,
                    goods_id: goods.goods_id
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        that.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        that.loadGoods();
                        that.loadStats();
                    } else {
                        that.$message({
                            message: res.data.msg || '删除失败',
                            type: 'error'
                        });
                    }
                }, function(err) {
                    console.error(err);
                    that.$message({
                        message: '删除失败',
                        type: 'error'
                    });
                });
            }).catch(function() {});
        },
        
        viewGoodsDetail: function(goods) {
            this.currentGoods = goods;
            this.detailDialogVisible = true;
        },
        
        getAuditStatusText: function(status) {
            var map = {
                'pending': '待审核',
                'approved': '已通过',
                'rejected': '已拒绝'
            };
            return map[status] || status;
        },
        
        getAuditTagType: function(status) {
            var map = {
                'pending': 'warning',
                'approved': 'success',
                'rejected': 'danger'
            };
            return map[status] || 'info';
        },
        
        getStatusText: function(status) {
            var map = {
                'active': '在售',
                'inactive': '已下架',
                'sold': '已售出'
            };
            return map[status] || status;
        },
        
        getStatusTagType: function(status) {
            var map = {
                'active': 'success',
                'inactive': 'info',
                'sold': 'warning'
            };
            return map[status] || 'info';
        },
        
        getPercentage: function(value, total) {
            if (!total || total === 0) return 0;
            return Math.round((value || 0) / total * 100);
        },
        
        formatDate: function(date) {
            if (!date) return '-';
            var d = new Date(date);
            var year = d.getFullYear();
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var hour = d.getHours();
            var minute = d.getMinutes();
            return year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day + ' ' + 
                   (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
        },
        
        handleLogout: function() {
            var that = this;
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(function() {
                that.$cookieStore.delCookie('admin_uid');
                that.$router.push({ name: 'adminLogin' });
            }).catch(function() {});
        },
        
        goToHome: function() {
            this.$router.push({ path: '/' });
        }
    }
}
</script>

<style lang="stylus" scoped>
#admin-dashboard
    min-height 100vh
    background #f5f5f5

.admin-header
    height 60px
    background linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    display flex
    align-items center
    justify-content space-between
    padding 0 24px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)

.header-left
    display flex
    align-items center

.logo
    display flex
    align-items center
    gap 10px
    font-size 18px
    font-weight 600
    color #fff

    i
        font-size 24px

.header-right
    display flex
    align-items center
    gap 16px

.admin-info
    display flex
    align-items center
    gap 6px
    color #fff
    font-size 14px

.logout-btn
    color #fff
    font-size 14px

    &:hover
        color #ffd700

.admin-main
    display flex
    min-height calc(100vh - 60px)

.admin-sidebar
    width 220px
    background #fff
    border-right 1px solid #e8e8e8
    display flex
    flex-direction column
    justify-content space-between

.sidebar-menu
    padding 16px 0

.menu-item
    display flex
    align-items center
    justify-content space-between
    padding 14px 24px
    cursor pointer
    transition all 0.3s
    border-left 3px solid transparent

    &:hover
        background #f5f7fa
        color #667eea

    &.active
        background #f0f2ff
        color #667eea
        border-left-color #667eea
        font-weight 600

    i
        font-size 18px
        margin-right 10px

    span
        font-size 14px

.menu-badge
    margin-right 0

.sidebar-footer
    padding 16px 24px
    border-top 1px solid #e8e8e8

.go-home-btn
    color #667eea
    font-size 13px

    i
        margin-right 4px

.admin-content
    flex 1
    padding 24px
    overflow auto

.content-wrapper
    background #fff
    border-radius 8px
    padding 24px
    min-height calc(100vh - 108px)

.section-title
    font-size 18px
    font-weight 600
    color #333
    margin 0 0 24px 0

.section-header
    display flex
    align-items center
    justify-content space-between
    margin-bottom 20px

.section-actions
    display flex
    align-items center
    gap 10px

.stats-grid
    display grid
    grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
    gap 20px
    margin-bottom 32px

.stat-card
    display flex
    align-items center
    gap 16px
    padding 24px
    background #fff
    border-radius 8px
    box-shadow 0 2px 8px rgba(0, 0, 0, 0.05)
    border 1px solid #e8e8e8

.stat-icon
    width 60px
    height 60px
    border-radius 12px
    display flex
    align-items center
    justify-content center
    background linear-gradient(135deg, #667eea 0%, #764ba2 100%)

    i
        font-size 28px
        color #fff

    &.user-card
        background linear-gradient(135deg, #667eea 0%, #764ba2 100%)

    &.active-user-card
        background linear-gradient(135deg, #52c41a 0%, #389e0d 100%)

    &.goods-card
        background linear-gradient(135deg, #1890ff 0%, #096dd9 100%)

    &.pending-card
        background linear-gradient(135deg, #faad14 0%, #d48806 100%)

    &.sold-card
        background linear-gradient(135deg, #13c2c2 0%, #08979c 100%)

    &.approved-card
        background linear-gradient(135deg, #52c41a 0%, #389e0d 100%)

.stat-info
    flex 1

.stat-value
    font-size 32px
    font-weight 700
    color #333
    line-height 1.2

    &.pending-value
        color #faad14

    &.sold-value
        color #13c2c2

    &.approved-value
        color #52c41a

.stat-label
    font-size 14px
    color #999
    margin-top 4px

.stats-detail
    margin-top 20px

.detail-title
    font-size 16px
    font-weight 600
    color #333
    margin 0 0 16px 0

.audit-status-bar
    display flex
    height 40px
    border-radius 8px
    overflow hidden
    background #f5f5f5

.status-bar
    display flex
    align-items center
    justify-content center
    transition width 0.5s
    color #fff
    font-size 12px
    font-weight 600

    &.pending-bar
        background linear-gradient(135deg, #faad14 0%, #d48806 100%)

    &.approved-bar
        background linear-gradient(135deg, #52c41a 0%, #389e0d 100%)

    &.rejected-bar
        background linear-gradient(135deg, #f5222d 0%, #cf1322 100%)

.status-legend
    display flex
    gap 24px
    margin-top 12px

.legend-item
    display flex
    align-items center
    gap 8px
    font-size 13px
    color #666

.legend-color
    width 12px
    height 12px
    border-radius 3px

    &.pending-color
        background #faad14

    &.approved-color
        background #52c41a

    &.rejected-color
        background #f5222d

.table-container
    overflow auto

.price-text
    color #ff6b35
    font-weight 600

.danger-text
    color #f5222d

.success-text
    color #52c41a

.warning-text
    color #faad14

.goods-detail-dialog
    .detail-item
        display flex
        margin-bottom 16px
        align-items baseline

        .detail-label
            width 80px
            color #999
            font-size 14px
            flex-shrink 0

        .detail-value
            color #333
            font-size 14px
            flex 1

    .detail-images
        .image-list
            display flex
            gap 12px
            margin-top 8px

        .image-item
            width 100px
            height 100px
            border-radius 8px
            overflow hidden
            border 1px solid #e8e8e8

            img
                width 100%
                height 100%
                object-fit cover
</style>
