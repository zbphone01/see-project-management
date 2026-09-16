<template>
  <section class="applied-page reports-page">
    <section class="panel filter-panel">
      <div class="filter-grid reports-filters">
        <label><span>项目名称</span><a-input v-model="filters.projectName" placeholder="请输入项目名称" @pressEnter="queryReports" /></label>
        <label><span>项目编码</span><a-input v-model="filters.projectCode" placeholder="请输入项目编码" @pressEnter="queryReports" /></label>
        <label><span>进展编码</span><a-input v-model="filters.reportCode" placeholder="请输入进展编码" @pressEnter="queryReports" /></label>
        <label><span>报告类型</span><a-select v-model="filters.reportType" placeholder="选择报告类型" allow-clear><a-select-option v-for="type in reportTypes" :key="type" :value="type">{{ type }}</a-select-option></a-select></label>
        <label><span>状态</span><a-select v-model="filters.status" placeholder="选择报告状态" allow-clear><a-select-option v-for="status in reportStatuses" :key="status" :value="status">{{ status }}</a-select-option></a-select></label>
        <label><span>成果指标</span><a-select v-model="filters.outcome" placeholder="选择成果指标状态" allow-clear><a-select-option value="未采纳">未采纳</a-select-option><a-select-option value="已采纳">已采纳</a-select-option></a-select></label>
        <div class="filter-actions"><a-button @click="resetFilters"><a-icon type="reload" /> 重置</a-button><a-button type="primary" @click="queryReports"><a-icon type="search" /> 查询</a-button></div>
      </div>
    </section>
    <section class="panel applied-table-panel">
      <a-table class="applied-table" :columns="columns" :data-source="filteredReports" :pagination="pagination" :scroll="{ x: 1156 }" row-key="id" @change="changePage">
        <template slot="project" slot-scope="text, report">
          <div class="table-project">
            <div :class="['table-project-cover', report.cover]"><img v-if="report.image" :src="report.image" :alt="report.name" /><a-icon v-else :type="report.icon" /></div>
            <div>
              <button class="report-project-link" :title="report.name" @click="openProject(report)">{{ report.name }}</button>
              <div class="project-primary-meta"><span class="project-code"><a-icon type="flag" /> {{ report.code }}</span></div>
            </div>
          </div>
        </template>
        <template slot="reportType" slot-scope="type"><span :class="['report-type', { 'report-type-progress': type === '进展报告', 'report-type-completion': type === '结项报告', 'report-type-supplement': type === '补充结项' }]">{{ type }}</span></template>
        <template slot="status" slot-scope="status"><span :class="['status-chip', statusTone(status)]">{{ status }}</span></template>
        <template slot="period" slot-scope="text, report"><span class="updated-time"><span>{{ report.periodStart }}</span><span>{{ report.periodEnd }}</span></span></template>
        <template slot="submittedAt" slot-scope="value"><span v-if="value" class="updated-time"><span>{{ value.split(' ')[0] }}</span><span>{{ value.split(' ')[1] }}</span></span><span v-else class="empty-value">—</span></template>
        <template slot="outcome" slot-scope="value"><span :class="{ 'empty-value': value === '-' }">{{ value === '-' ? '—' : value }}</span></template>
        <template slot="operation" slot-scope="text, report">
          <a-dropdown v-if="report.status !== '进展放弃'" placement="bottomRight">
            <a-button class="operation-button">操作 <a-icon type="down" /></a-button>
            <a-menu slot="overlay" @click="showDemo($event.key, report)">
              <a-menu-item v-if="report.status === '进展待审'" key="审核">审核</a-menu-item>
              <a-menu-item :key="report.reportType === '进展报告' ? '查看进展报告' : '查看报告'">{{ report.reportType === '进展报告' ? '查看进展报告' : '查看报告' }}</a-menu-item>
              <a-menu-item v-if="report.status === '草稿'" key="编辑报告">编辑报告</a-menu-item>
            </a-menu>
          </a-dropdown>
          <a-button v-else class="operation-button" @click="showDemo('查看报告', report)">查看</a-button>
        </template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { projectReports, reportTypes, reportStatuses } from '../mock/reports'

const emptyFilters = () => ({ projectName: '', projectCode: '', reportCode: '', reportType: undefined, status: undefined, outcome: undefined })

export default {
  name: 'ProjectReports',
  data () {
    return {
      projectReports, reportTypes, reportStatuses,
      filters: emptyFilters(), appliedFilters: emptyFilters(), page: 1, pageSize: 10,
      columns: [
        { title: '进展编码', dataIndex: 'reportCode', width: 92, align: 'center' },
        { title: '项目名称', dataIndex: 'name', width: 499, scopedSlots: { customRender: 'project' } },
        { title: '报告类型', dataIndex: 'reportType', width: 88, align: 'center', scopedSlots: { customRender: 'reportType' } },
        { title: '状态', dataIndex: 'status', width: 128, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '报告周期', key: 'period', width: 96, align: 'center', scopedSlots: { customRender: 'period' } },
        { title: '提交时间', dataIndex: 'submittedAt', width: 96, align: 'center', scopedSlots: { customRender: 'submittedAt' } },
        { title: '成果指标', dataIndex: 'outcome', width: 72, align: 'center', scopedSlots: { customRender: 'outcome' } },
        { title: '操作', key: 'operation', width: 85, fixed: 'right', align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    filteredReports () {
      const f = this.appliedFilters
      return this.projectReports.filter(report =>
        (!f.projectName.trim() || report.name.includes(f.projectName.trim())) &&
        (!f.projectCode.trim() || report.code.toLowerCase().includes(f.projectCode.trim().toLowerCase())) &&
        (!f.reportCode.trim() || report.reportCode.toLowerCase().includes(f.reportCode.trim().toLowerCase())) &&
        (!f.reportType || report.reportType === f.reportType) &&
        (!f.status || report.status === f.status) &&
        (!f.outcome || report.outcome === f.outcome)
      ).sort((a, b) => b.reportCode.localeCompare(a.reportCode))
    },
    pagination () {
      return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['10', '50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` }
    }
  },
  methods: {
    statusTone (status) {
      if (status === '草稿' || status === '进展放弃') return 'neutral'
      if (status.endsWith('待审')) return 'pending-review'
      return 'active-approved'
    },
    queryReports () { this.appliedFilters = { ...this.filters }; this.page = 1 },
    resetFilters () { this.filters = emptyFilters(); this.queryReports() },
    changePage (pagination) { this.page = pagination.pageSize !== this.pageSize ? 1 : pagination.current; this.pageSize = pagination.pageSize },
    openProject (report) { this.$router.push({ name: 'project-detail', params: { id: String(report.projectId) } }) },
    showDemo (action, report) {
      if (action === '审核' || action === '查看进展报告' || action === '查看报告') {
        this.$router.push({ name: 'report-detail', params: { id: report.reportCode }, query: action === '审核' ? { mode: 'audit' } : {} })
        return
      }
      this.$message.info(`${action}：${report.reportCode}（演示入口，尚未接入业务功能）`)
    }
  }
}
</script>

<style scoped>
.report-type { white-space: nowrap; }
.report-type-progress { color: #722ed1; }
.report-type-completion { color: #00a870; }
.report-type-supplement { color: #62bfe6; }
.reports-filters { grid-template-columns: minmax(140px, 1.2fr) repeat(3, minmax(120px, 1fr)) minmax(140px, 1fr) minmax(150px, 1fr) 193px; gap: 10px; }
.reports-filters .filter-actions { grid-column: auto; }
.reports-filters .filter-actions .ant-btn { flex: none; width: 92px; }
.reports-page ::v-deep .applied-table .ant-table-thead > tr > th,
.reports-page ::v-deep .applied-table .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; }
.reports-page ::v-deep .operation-button { gap: 2px; }
.reports-page ::v-deep .operation-button > span + .anticon { margin-left: 0; }
.report-project-link { max-width: 100%; min-width: 0; padding: 0; margin-bottom: 5px; border: 0; background: none; color: #18253c; font-size: 16px; text-align: left; white-space: normal; overflow-wrap: anywhere; line-height: 1.5; cursor: pointer; }
.report-project-link:hover, .report-project-link:focus { color: #1677ff; }
</style>
