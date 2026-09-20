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
      <a-form-model ref="reportForm" :model="report" :rules="reportRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item label="报告年份" prop="year"><a-select v-model="report.year" placeholder="请选择报告年份"><a-select-option v-for="year in reportYears" :key="year" :value="year">{{ year }}年</a-select-option></a-select></a-form-model-item>
        <a-form-model-item label="报告评级" prop="rating"><a-select v-model="report.rating" placeholder="请选择报告评级"><a-select-option v-for="rating in ['达标', '基本达标', '不达标']" :key="rating" :value="rating">{{ rating }}</a-select-option></a-select></a-form-model-item>
        <a-form-model-item label="年报类型" prop="type"><a-select v-model="report.type" placeholder="请选择年报类型"><a-select-option v-for="type in ['年检报告', '机构年报', '审计报告']" :key="type" :value="type">{{ type }}</a-select-option></a-select></a-form-model-item>
        <a-form-model-item label="报告文件" prop="fileName">
          <a-upload :before-upload="selectFile" :file-list="fileList" :remove="removeFile"><a-button icon="upload">点击上传</a-button></a-upload>
        </a-form-model-item>
      </a-form-model>
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
      report: { year: undefined, rating: undefined, type: undefined, fileName: '' },
      fileList: [],
      reportRules: {
        year: [{ required: true, message: '请选择报告年份', trigger: 'change', type: 'number' }],
        rating: [{ required: true, message: '请选择报告评级', trigger: 'change' }],
        type: [{ required: true, message: '请选择年报类型', trigger: 'change' }],
        fileName: [{ required: true, message: '请选择报告文件', trigger: 'change' }]
      },
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
    reportYears () { const year = new Date().getFullYear(); return [1, 2, 3, 4, 5].map(offset => year - offset) }
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
        this.$nextTick(() => { if (this.$refs.reportForm) this.$refs.reportForm.clearValidate() })
      } else if (action === '放弃变更') {
        this.$confirm({ title: '确认放弃本次变更？', content: '本地演示将恢复为通过状态，不会向后台提交。', maskClosable: false, okText: '确认放弃', cancelText: '取消', onOk: () => { item.status = '通过'; this.page = 1; this.$message.info('已在本次演示中放弃变更') } })
      } else this.openExternalPage(action)
    },
    clearReport () { this.report = { year: undefined, rating: undefined, type: undefined, fileName: '' }; this.fileList = []; this.selectedOrganization = null },
    selectFile (file) {
      this.fileList = [file]
      this.report.fileName = file.name
      this.$nextTick(() => this.$refs.reportForm.validateField('fileName'))
      return false
    },
    removeFile () { this.fileList = []; this.report.fileName = ''; return true },
    saveReport () {
      this.$refs.reportForm.validate(valid => {
        if (!valid || !this.selectedOrganization) return
        this.selectedOrganization.reports.push(Object.assign({}, this.report))
        this.reportVisible = false
        this.clearReport()
        this.$message.info('年报信息已记录在本次演示中，文件尚未上传至服务器')
      })
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
.operation-button { border: 0; background: transparent; padding: 0; height: 32px; box-shadow: none; }
.operation-button >>> .anticon { margin-left: 2px !important; }
@media (max-width: 1439px) { .organization-table { min-width: 1200px; } }
</style>
