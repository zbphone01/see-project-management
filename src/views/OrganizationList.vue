<template>
  <section class="applied-page organization-list-page">
    <section class="panel filter-panel">
      <form class="filter-grid organization-filters" @submit.prevent="queryOrganizations">
        <label for="organization-name"><span>机构名称</span><a-input id="organization-name" v-model="filters.name" placeholder="输入名称搜索" allow-clear /></label>
        <label for="organization-approval"><span>审批状态</span><a-select id="organization-approval" v-model="filters.approval" placeholder="全部状态" allow-clear>
          <a-select-option v-for="option in approvalOptions" :key="option" :value="option">{{ option }}</a-select-option>
        </a-select></label>
        <div class="filter-actions">
          <a-button icon="reload" @click="resetFilters">重置</a-button>
          <a-button type="primary" html-type="submit" icon="search">查询</a-button>
        </div>
      </form>
    </section>
    <section class="panel applied-table-panel">
      <div class="organization-table-scroll">
        <a-table class="applied-table organization-table" :columns="columns" :data-source="filteredOrganizations" :pagination="pagination" row-key="id" :locale="{ emptyText: '暂无符合条件的机构' }" @change="changePage">
          <template slot="logo" slot-scope="text, item"><div class="organization-logo"><img v-if="item.image" :src="item.image" :alt="item.name" /><a-icon v-else type="bank" /></div></template>
          <template slot="name" slot-scope="text, item"><div class="organization-name">{{ item.name }}<span v-if="item.isPrimaryAccount" class="primary-account-tag">主账号</span><div v-if="item.organizationName" class="organization-subline"><span>{{ item.organizationName }}</span><span v-if="item.isSubAccount" class="sub-account-tag">子账号</span></div></div></template>
          <template slot="contact" slot-scope="text, item"><div class="organization-contact"><span>{{ item.contactName }}</span><span>{{ item.contactPhone }}</span></div></template>
          <template slot="status" slot-scope="status"><span :class="['status-chip', states[status].tone]">{{ status }}</span></template>
          <template slot="operation" slot-scope="text, item">
            <a-dropdown :trigger="['click']" placement="bottomRight">
              <a-button class="operation-button" :aria-label="`${item.name}（${item.status}）的操作`">操作<a-icon type="down" /></a-button>
              <a-menu slot="overlay" @click="handleAction($event.key, item)"><a-menu-item v-for="action in states[item.status].actions" :key="action">{{ action }}</a-menu-item></a-menu>
            </a-dropdown>
          </template>
        </a-table>
      </div>
    </section>
    <a-modal v-model="reportVisible" title="上传年报" :width="550" :mask-closable="false" ok-text="确定" cancel-text="取消" @ok="saveReport" @cancel="clearReport">
      <div class="area-picker team-picker report-picker">
        <div class="area-picker-row"><label for="report-year">报告年份：</label><a-select id="report-year" v-model="report.year" placeholder="请选择报告年份"><a-select-option v-for="year in reportYears" :key="year" :value="year">{{ year }}年</a-select-option></a-select></div>
        <div class="area-picker-row"><label for="report-type">年报类型：</label><a-select id="report-type" v-model="report.type" placeholder="请选择年报类型" @change="changeReportType"><a-select-option v-for="type in ['年检年报', '机构年报', '审计报告']" :key="type" :value="type">{{ type }}</a-select-option></a-select></div>
        <div v-if="report.type === '年检年报'" class="area-picker-row"><label for="report-civil-status">已上报民政：</label><a-select id="report-civil-status" v-model="report.civilStatus" placeholder="请选择上报状态"><a-select-option v-for="status in ['已上报', '未上报']" :key="status" :value="status">{{ status }}</a-select-option></a-select></div>
        <div class="area-picker-row"><label>报告文件：</label><a-upload :before-upload="selectFile" :file-list="fileList" :remove="removeFile"><a-button icon="upload">点击上传</a-button></a-upload></div>
        <p v-if="reportError" class="form-error" role="alert">{{ reportError }}</p>
      </div>
    </a-modal>
  </section>
</template>

<script>
import { approvalOptions, organizationStates, createOrganizations, filterOrganizations } from '../mock/organizations'

export default {
  name: 'OrganizationList',
  data () {
    return {
      approvalOptions,
      states: organizationStates,
      organizations: createOrganizations(),
      filters: { name: '', approval: undefined },
      appliedFilters: { name: '', approval: undefined },
      page: 1,
      pageSize: 50,
      reportVisible: false,
      selectedOrganization: null,
      report: { year: undefined, type: undefined, civilStatus: undefined, fileName: '' },
      fileList: [],
      reportError: '',
      columns: [
        { title: '头像 / Logo', key: 'logo', width: 140, scopedSlots: { customRender: 'logo' } },
        { title: '机构及组织', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
        { title: '注册类型', dataIndex: 'registrationType', width: 110, align: 'center' },
        { title: '慈善组织/公募资质', dataIndex: 'charityQualification', width: 150, align: 'center' },
        { title: '项目申请数', dataIndex: 'projectCount', width: 110, align: 'center' },
        { title: '负责人及联系方式', key: 'contact', width: 150, scopedSlots: { customRender: 'contact' } },
        { title: '状态', dataIndex: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'operation', width: 90, align: 'center', className: 'organization-operation', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    filteredOrganizations () { return filterOrganizations(this.organizations, this.appliedFilters) },
    pagination () { return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } },
    reportYears () { const year = new Date().getFullYear(); return [0, 1, 2, 3, 4].map(offset => year - offset) }
  },
  methods: {
    queryOrganizations () { this.appliedFilters = Object.assign({}, this.filters); this.page = 1 },
    resetFilters () { this.filters = { name: '', approval: undefined }; this.queryOrganizations() },
    changePage (pagination) { this.page = this.pageSize === pagination.pageSize ? pagination.current : 1; this.pageSize = pagination.pageSize },
    openExternalPage (action) { this.$message.info(`${action}为独立机构页面，当前尚未接入`) },
    handleAction (action, item) {
      if (action === '上传年报') {
        this.clearReport()
        this.selectedOrganization = item
        this.report.year = this.reportYears[0]
        this.reportVisible = true
      } else if (action === '放弃变更') {
        this.$confirm({ title: '确认放弃本次变更？', content: '本地演示将恢复为通过状态，不会向后台提交。', maskClosable: false, okText: '确认放弃', cancelText: '取消', onOk: () => { item.status = '通过'; this.page = 1; this.$message.info('已在本次演示中放弃变更') } })
      } else this.openExternalPage(action)
    },
    clearReport () { this.report = { year: undefined, type: undefined, civilStatus: undefined, fileName: '' }; this.reportError = ''; this.fileList = []; this.selectedOrganization = null },
    changeReportType () { this.report.civilStatus = undefined; this.reportError = '' },
    selectFile (file) {
      this.fileList = [file]
      this.report.fileName = file.name
      this.reportError = ''
      return false
    },
    removeFile () { this.fileList = []; this.report.fileName = ''; return true },
    saveReport () {
      const labels = { year: '报告年份', type: '年报类型', civilStatus: '上报状态', fileName: '报告文件' }
      const required = ['year', 'type', 'fileName'].concat(this.report.type === '年检年报' ? ['civilStatus'] : [])
      const missing = required.filter(key => !this.report[key])
      if (missing.length || !this.selectedOrganization) { this.reportError = '请填写：' + missing.map(key => labels[key]).join('、'); return }
      this.selectedOrganization.reports.push(Object.assign({}, this.report))
      this.reportVisible = false
      this.clearReport()
      this.$message.info('年报信息已记录在本次演示中，文件尚未上传至服务器')
    }
  }
}
</script>

<style scoped>
.organization-filters { grid-template-columns: 260px 200px 196px; justify-content: start; }
.organization-table-scroll { overflow-x: auto; }
.organization-table { min-width: 1140px; }
.organization-table >>> table { width: 100%; min-width: 1140px; table-layout: fixed; }
.organization-table >>> .ant-table-thead > tr > th:first-child,
.organization-table >>> .ant-table-tbody > tr > td:first-child { padding-left: 20px; white-space: nowrap; }
.organization-table >>> .ant-table-thead > tr > th:nth-child(4) { white-space: nowrap; }
.organization-table >>> .organization-operation { position: sticky; right: 0; z-index: 1; background: white; }
.organization-table >>> th.organization-operation { z-index: 2; background: #f7f9fc; }
.organization-logo { width: 80px; height: 80px; border-radius: 13px; overflow: hidden; display: grid; place-items: center; flex: none; background: #f1fbf5; color: #61bd98; font-size: 28px; }
.organization-logo img { width: 100%; height: 100%; object-fit: cover; }
.organization-name { min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; font-size: 16px; color: #18253c; font-weight: 600; }
.organization-name span { display: block; margin-top: 8px; color: #718095; font-size: 10pt; font-weight: 400; }
.organization-name .primary-account-tag { display: table; margin-top: 8px; padding: 2px 7px; border-radius: 3px; color: #62bfe6; background: #effaff; font-size: 10pt; font-weight: 400; line-height: 1.5; }
.organization-subline { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.organization-subline > span { display: inline-block; margin: 0; }
.organization-name .sub-account-tag { display: table; margin-top: 8px; padding: 2px 7px; border-radius: 3px; color: #61bd98; background: #f1fbf5; font-size: 10pt; font-weight: 400; line-height: 1.5; }
.organization-subline .sub-account-tag { display: inline-block; margin: 0; }
.organization-contact { display: grid; gap: 6px; overflow-wrap: anywhere; }
.organization-contact span + span { color: #718095; }
.report-picker { display: grid; width: 470px; max-width: 100%; gap: 16px; margin: 0 auto; padding: 16px 0 12px; }
.report-picker .area-picker-row { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 18px; align-items: start; }
.report-picker .area-picker-row label { display: flex; min-height: 32px; align-items: center; justify-content: flex-end; padding-top: 5px; color: #27384e; line-height: 22px; text-align: right; white-space: nowrap; }
.report-picker .area-picker-row .ant-select { width: 100%; }
.report-picker > .form-error { margin: -4px 0 0 108px; }
.operation-button { border: 0; background: transparent; padding: 0; height: 32px; box-shadow: none; }
.operation-button >>> .anticon { margin-left: 2px !important; }
@media (max-width: 1439px) { .organization-table { min-width: 1200px; } }
</style>
