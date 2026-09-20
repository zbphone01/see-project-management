<template>
<section class="applied-page applied-projects-page">
        <section class="panel filter-panel">
          <div class="filter-grid">
            <label>
              <span>发起人</span>
              <a-select v-model="appliedFilters.initiator" placeholder="选择发起人" allow-clear>
                <a-select-option value="all">全部</a-select-option>
                <a-select-option value="department">我所在部门</a-select-option>
                <a-select-option value="mine">我发起的</a-select-option>
              </a-select>
            </label>
            <label>
              <span>项目状态</span>
              <a-select v-model="appliedFilters.status" placeholder="选择项目状态" allow-clear>
                <a-select-option v-for="status in appliedStatuses" :key="status" :value="status">{{ status }}</a-select-option>
              </a-select>
            </label>
            <label><span>申请编码</span><a-input v-model="appliedFilters.code" placeholder="请输入申请编码" @pressEnter="queryAppliedProjects" /></label>
            <label><span>项目名称</span><a-input v-model="appliedFilters.projectName" placeholder="请输入项目名称" @pressEnter="queryAppliedProjects" /></label>
            <label><span>招募名称</span><a-input v-model="appliedFilters.recruitmentName" placeholder="请输入招募名称" @pressEnter="queryAppliedProjects" /></label>
            <div class="filter-actions">
              <a-button @click="resetAppliedFilters"><a-icon type="reload" /> 重置</a-button>
              <a-button type="primary" @click="queryAppliedProjects"><a-icon type="search" /> 查询</a-button>
            </div>
          </div>
        </section>

        <section class="panel applied-table-panel">
          <div class="table-toolbar">
            <div class="export-actions">
              <span>导出（只支持对选择的项目进行操作）：</span>
              <a-button :disabled="!selectedProjectKeys.length" @click="exportSelected('申请汇总表')"><a-icon type="file-excel" /> 申请汇总表</a-button>
              <a-button :disabled="!selectedProjectKeys.length" @click="exportSelected('项目申请详情打包')"><a-icon type="file-zip" /> 项目申请详情打包</a-button>
            </div>
            <span class="selected-count">已选择 {{ selectedProjectKeys.length }} 项</span>
          </div>

          <a-table
            class="applied-table"
            :columns="appliedColumns"
            :data-source="filteredAppliedProjects"
            :row-selection="appliedRowSelection"
            :pagination="appliedPagination"
            :scroll="{ x: true }"
            row-key="id"
            @change="handleAppliedTableChange"
          >
            <template slot="project" slot-scope="text, project">
              <div class="table-project">
                <div :class="['table-project-cover', project.cover]">
                  <img v-if="project.image" :src="project.image" :alt="project.name" />
                  <a-icon v-else :type="project.icon" />
                </div>
                <div>
                  <strong :title="project.name">{{ project.name }}</strong>
                  <div class="project-primary-meta">
                    <span class="project-code"><a-icon type="flag" /> {{ project.code }}</span>
                    <span class="project-organization" :title="project.organization"><a-icon type="bank" /> {{ project.organization }}</span>
                  </div>
                  <button class="project-recruitment" type="button" :title="project.recruitment" @click="notify(`打开招募详情：${project.recruitment}`)"><a-icon type="notification" /> {{ project.recruitment }}</button>
                </div>
              </div>
            </template>
            <template slot="status" slot-scope="status">
              <span :class="['status-chip', appliedStatusTone(status)]">{{ status }}</span>
            </template>
            <template slot="type" slot-scope="type">
              <span :class="['project-type-chip', projectTypeTone(type)]">
                {{ type }}
              </span>
            </template>
            <template slot="fundraising" slot-scope="fundraising">
              <span v-if="fundraising !== '-'" class="fundraising-state"><i></i>{{ fundraising }}</span>
              <span v-else class="empty-value">—</span>
            </template>
            <template slot="updatedAt" slot-scope="updatedAt">
              <span class="updated-time">
                <span>{{ updatedAt.split(' ')[0] }}</span>
                <span>{{ updatedAt.split(' ')[1] }}</span>
              </span>
            </template>
            <template slot="operation" slot-scope="text, record">
              <a-dropdown placement="bottomRight">
                <a-button class="operation-button">操作 <a-icon type="down" /></a-button>
                <a-menu slot="overlay" @click="handleProjectAction($event, record)">
                  <template v-if="record.status === '申请待审'">
                    <a-menu-item key="audit">审核</a-menu-item>
                    <a-menu-item key="download-pdf">下载待审申请书pdf</a-menu-item>
                    <a-menu-item key="download-word">下载待审申请书word</a-menu-item>
                    <a-menu-item key="download-budget">下载待审预算表</a-menu-item>
                  </template>
                  <template v-else-if="record.status === '进展待审'">
                    <a-menu-item key="audit-progress">审核</a-menu-item>
                    <a-menu-item key="project-detail">查看项目详情</a-menu-item>
                    <a-menu-item key="download-project-files">下载项目资料</a-menu-item>
                  </template>
                  <template v-else>
                    <a-menu-item key="detail">查看详情</a-menu-item>
                    <a-menu-item v-if="record.editable" key="edit">修改申请</a-menu-item>
                    <a-menu-item key="history">变更记录</a-menu-item>
                  </template>
                </a-menu>
              </a-dropdown>
            </template>
          </a-table>
        </section>
      </section>
</template>

<script>
import { appliedProjects } from '../mock/projects'
export default {
  name: 'AppliedProjects',
  data () { return {
    appliedProjects,
    selectedProjectKeys: [],
    appliedPage: 1,
    appliedFilters: {
        initiator: undefined,
        status: undefined,
        code: '',
        projectName: '',
        recruitmentName: ''
      },
    appliedStatuses: ['审核流程中', '申请待审', '进展待审', '执行中', '修订中', '正常结项', '异常结项'],
    appliedColumns: [
        { title: '项目名称', dataIndex: 'name', key: 'project', scopedSlots: { customRender: 'project' } },
        { title: '项目类型', dataIndex: 'type', key: 'type', width: 110, align: 'center', scopedSlots: { customRender: 'type' } },
        { title: '申请状态', dataIndex: 'status', key: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '筹款状态', dataIndex: 'fundraising', key: 'fundraising', width: 110, align: 'center', scopedSlots: { customRender: 'fundraising' } },
        { title: '状态更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 120, align: 'center', scopedSlots: { customRender: 'updatedAt' } },
        { title: '操作', key: 'operation', fixed: 'right', width: 90, align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
  } },
  computed: {
    filteredAppliedProjects () {
      const filters = this.appliedFilters
      return this.appliedProjects.filter(project => {
        if (filters.initiator && filters.initiator !== 'all' && project.initiator !== filters.initiator) return false
        if (filters.status && project.status !== filters.status) return false
        if (filters.code.trim() && !project.code.toLowerCase().includes(filters.code.trim().toLowerCase())) return false
        if (filters.projectName.trim() && !project.name.includes(filters.projectName.trim())) return false
        if (filters.recruitmentName.trim() && !project.recruitment.includes(filters.recruitmentName.trim())) return false
        return true
      })
    },
    appliedRowSelection () {
      return {
        columnWidth: 60,
        selectedRowKeys: this.selectedProjectKeys,
        onChange: keys => { this.selectedProjectKeys = keys }
      }
    },
    appliedPagination () {
      return {
        current: this.appliedPage,
        pageSize: 10,
        pageSizeOptions: ['10', '50', '100'],
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: total => `共有 ${total} 条数据`
      }
    }
  },
  methods: {
    statusCount (status) { return this.appliedProjects.filter(project => project.status === status).length },
    appliedStatusTone (status) {
      const statusRoles = {
        '审核流程中': 'neutral',
        '执行中': 'active-approved',
        '修订中': 'action-rejected',
        '正常结项': 'neutral',
        '异常结项': 'action-rejected',
        '申请待审': 'pending-review',
        '进展待审': 'pending-review'
      }
      return statusRoles[status] || 'neutral'
    },
    projectTypeTone (type) {
      return type === '联合公益' ? 'charity' : 'grant'
    },
    resetAppliedFilters () {
      this.appliedFilters = { initiator: undefined, status: undefined, code: '', projectName: '', recruitmentName: '' }
      this.appliedPage = 1
      this.selectedProjectKeys = []
      this.$message.success('筛选条件已重置')
    },
    queryAppliedProjects () {
      this.appliedPage = 1
      this.selectedProjectKeys = []
      this.$message.success(`已找到 ${this.filteredAppliedProjects.length} 条项目申请`)
    },
    handleAppliedTableChange (pagination) { this.appliedPage = pagination.current },
    exportSelected (type) { this.$message.info(`已选择 ${this.selectedProjectKeys.length} 个项目，准备导出${type}`) },
    handleProjectAction ({ key }, record) {
      const labels = {
        detail: '查看详情',
        edit: '修改申请',
        history: '变更记录',
        'audit-progress': '审核进展',
        'project-detail': '查看项目详情',
        'download-project-files': '下载项目资料',
        'download-pdf': '下载待审申请书pdf',
        'download-word': '下载待审申请书word',
        'download-budget': '下载待审预算表'
      }
      if (key === 'audit-progress') {
        this.$router.push({ name: 'report-detail', params: { id: record.reportId }, query: { mode: 'audit' } })
        return
      }
      if (key === 'detail' || key === 'project-detail' || key === 'audit') {
        this.$router.push({ name: 'project-detail', params: { id: String(record.id) }, query: key === 'audit' ? { mode: 'audit' } : {} })
        return
      }
      this.$message.info(`${labels[key]}：${record.name}`)
    },
    notify (label) { this.$message.info(label) }
  },
  
}
</script>

<style scoped>
.applied-projects-page ::v-deep .applied-table .ant-table-thead > tr > th,
.applied-projects-page ::v-deep .applied-table .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; }
.applied-projects-page ::v-deep .operation-button { gap: 2px; }
.applied-projects-page ::v-deep .operation-button > span + .anticon { margin-left: 0; }
.applied-projects-page ::v-deep .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; }
</style>
