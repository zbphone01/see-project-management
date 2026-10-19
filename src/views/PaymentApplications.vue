<template>
  <section class="applied-page payments-page">
    <section class="panel filter-panel">
      <div class="filter-grid payment-filters">
        <label><span>项目名称</span><a-input v-model="filters.projectName" placeholder="请输入项目名称" @pressEnter="query" /></label>
        <label><span>请款编码</span><a-input v-model="filters.paymentCode" placeholder="请输入请款编码" @pressEnter="query" /></label>
        <label><span>报告类型</span><a-select v-model="filters.reportType" placeholder="选择报告类型" allow-clear><a-select-option v-for="type in reportTypes" :key="type" :value="type">{{ type }}</a-select-option></a-select></label>
        <label><span>状态</span><a-select v-model="filters.status" placeholder="选择状态" allow-clear><a-select-option v-for="status in statuses" :key="status" :value="status">{{ status }}</a-select-option></a-select></label>
        <div class="filter-actions"><a-button @click="reset"><a-icon type="reload" /> 重置</a-button><a-button type="primary" @click="query"><a-icon type="search" /> 查询</a-button></div>
      </div>
    </section>
    <section class="panel applied-table-panel">
      <a-table class="applied-table" :columns="columns" :data-source="filteredRecords" :pagination="pagination" :scroll="{ x: true }" row-key="id" @change="changePage">
        <template slot="project" slot-scope="text, record">
          <div class="payment-project">
            <div><router-link class="payment-project-name" :to="{ name: 'project-detail', params: { id: String(record.projectId) } }">{{ record.name }}</router-link><div class="project-primary-meta"><span class="project-code"><a-icon type="flag" /> {{ record.code }}</span></div></div>
          </div>
        </template>
        <template slot="reportType" slot-scope="text, record"><router-link :class="['payment-report-type', { completion: text === '结项报告' }]" :to="{ name: 'report-detail', params: { id: record.reportCode } }">{{ text }}</router-link></template>
        <template slot="amount" slot-scope="value">{{ formatAmount(value) }}</template>
        <template slot="oaAmount" slot-scope="value, record"><span>{{ formatAmount(value) }}<span v-if="record.manual" class="manual-mark" title="手动录入的 OA 付款金额" aria-label="手动录入">*</span></span></template>
        <template slot="submittedAt" slot-scope="value"><span class="updated-time"><span>{{ value.split(' ')[0] }}</span><span>{{ value.split(' ')[1] }}</span></span></template>
        <template slot="status" slot-scope="text, record">
          <button v-if="record.manual || statusOf(record) !== '已完成'" type="button" :class="['status-chip', tone(record), 'payment-status-button']" :aria-label="record.manual || statusOf(record) === '申请中' ? statusOf(record) + '，录入 OA 付款金额' : '待确认，刷新状态'" @click="openStatus(record)">{{ statusOf(record) }}</button>
          <span v-else class="status-chip active-approved">已完成</span>
        </template>
      </a-table>
    </section>
    <a-modal v-model="amountVisible" class="payment-amount-modal" title="录入 OA付款金额" :width="550" :body-style="{ padding: '32px 40px' }" :mask-closable="false" ok-text="保存" cancel-text="取消" @ok="saveAmount">
      <div class="payment-amount-form"><label for="payment-oa-amount">OA付款金额</label><div><a-input id="payment-oa-amount" v-model="amountInput" placeholder="请输入金额（元）" inputmode="decimal" :aria-invalid="!!amountError" aria-describedby="payment-amount-error" @pressEnter="saveAmount" /><div v-if="amountError" id="payment-amount-error" class="payment-error" role="alert">{{ amountError }}</div></div></div>
    </a-modal>
  </section>
</template>

<script>
import { createPaymentApplications, paymentStatuses, paymentReportTypes, parseAmount, paymentStatus } from '../mock/payment-applications'
const emptyFilters = () => ({ projectName: '', paymentCode: '', reportType: undefined, status: undefined })
export default {
  name: 'PaymentApplications',
  data () {
    return {
      records: createPaymentApplications(), statuses: paymentStatuses, reportTypes: paymentReportTypes,
      filters: emptyFilters(), appliedFilters: emptyFilters(), page: 1, pageSize: 10,
      selectedId: null, amountVisible: false, amountInput: '', amountError: '',
      columns: [
        { title: '请款编码', dataIndex: 'paymentCode', width: 110 },
        { title: '项目名称', dataIndex: 'name', scopedSlots: { customRender: 'project' } },
        { title: '报告类型', dataIndex: 'reportType', className: 'payment-centered-column', width: 110, align: 'center', scopedSlots: { customRender: 'reportType' } },
        { title: '报告请款金额', dataIndex: 'reportAmount', className: 'payment-centered-column', width: 130, align: 'center', scopedSlots: { customRender: 'amount' } },
        { title: 'OA付款金额', dataIndex: 'oaAmount', className: 'payment-centered-column', width: 130, align: 'center', scopedSlots: { customRender: 'oaAmount' } },
        { title: '提交时间', dataIndex: 'submittedAt', className: 'payment-centered-column', width: 120, align: 'center', scopedSlots: { customRender: 'submittedAt' } },
        { title: '状态', key: 'status', width: 150, fixed: 'right', align: 'center', scopedSlots: { customRender: 'status' } }
      ]
    }
  },
  computed: {
    filteredRecords () {
      const f = this.appliedFilters
      return this.records.filter(record => (!f.projectName.trim() || record.name.includes(f.projectName.trim())) &&
        (!f.paymentCode.trim() || record.paymentCode.toLowerCase().includes(f.paymentCode.trim().toLowerCase())) &&
        (!f.reportType || record.reportType === f.reportType) && (!f.status || paymentStatus(record) === f.status))
        .sort((a, b) => Number(paymentStatus(b) === '待确认') - Number(paymentStatus(a) === '待确认') || b.paymentCode.localeCompare(a.paymentCode))
    },
    pagination () { return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['10', '50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } }
  },
  methods: {
    statusOf: paymentStatus,
    tone (record) { return paymentStatus(record) === '已完成' ? 'active-approved' : paymentStatus(record) === '申请中' ? 'pending-review' : 'action-rejected' },
    formatAmount (value) { return value === null ? '—' : (value / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    query () { this.appliedFilters = { ...this.filters }; this.page = 1 },
    reset () { this.filters = emptyFilters(); this.query() },
    changePage (pagination) { this.page = pagination.pageSize !== this.pageSize ? 1 : pagination.current; this.pageSize = pagination.pageSize },
    openStatus (record) {
      this.selectedId = record.id
      if (record.manual || paymentStatus(record) === '申请中') {
        this.amountInput = record.oaAmount === null ? '' : (record.oaAmount / 100).toFixed(2)
        this.amountError = ''
        this.amountVisible = true
      } else {
        this.$confirm({
          title: '是否刷新状态？',
          content: 'OA付款金额与报告请款金额不一致，确定后刷新金额并重新核对，是否继续？',
          maskClosable: false,
          okText: '确定',
          cancelText: '取消',
          onOk: () => this.refreshStatus()
        })
      }
    },
    saveAmount () {
      const amount = parseAmount(this.amountInput)
      if (amount === null) { this.amountError = '请输入非负金额，最多10位整数、2位小数'; return }
      const record = this.records.find(item => item.id === this.selectedId)
      if (!record) return
      record.oaAmount = amount
      record.manual = true
      this.amountVisible = false
      this.page = 1
      this.$message.success('已保存 OA付款金额')
    },
    refreshStatus () {
      const record = this.records.find(item => item.id === this.selectedId)
      if (record) this.$message.info(paymentStatus(record) === '已完成' ? '金额一致，状态已完成' : '金额仍不一致，状态保持待确认')
    }
  }
}
</script>

<style scoped>
.payment-filters { grid-template-columns: minmax(180px, 1.5fr) repeat(3, minmax(130px, 1fr)) 193px; }
.payment-filters .filter-actions { grid-column: auto; }
.payment-filters .filter-actions .ant-btn { flex: none; width: 92px; }
.payments-page ::v-deep .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.payments-page ::v-deep .ant-table-thead > tr > th, .payments-page ::v-deep .ant-table-tbody > tr > td { padding-left: 8px; padding-right: 8px; }
.payments-page ::v-deep .ant-table-thead > tr > th:first-child, .payments-page ::v-deep .ant-table-tbody > tr > td:first-child { padding-left: 20px; }
.payments-page ::v-deep .applied-table th.payment-centered-column,
.payments-page ::v-deep .applied-table td.payment-centered-column { text-align: center !important; }
.payment-project { min-width: 0; }
.payment-project-name { color: #18253c; min-width: 0; max-width: 100%; white-space: normal; overflow-wrap: anywhere; font-size: 16px; line-height: 1.5; margin-bottom: 5px; }
.payment-report-type { color: #722ed1; white-space: nowrap; }
.payment-report-type.completion { color: #00a870; }
.payment-status-button { cursor: pointer; font-size: 14px; font-family: inherit; }
.payment-status-button:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.manual-mark { margin-left: 3px; color: #ff4d4f; }
.payment-amount-form { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 18px; align-items: start; }
.payment-amount-modal ::v-deep .ant-modal-header { box-sizing: border-box; height: 55px; display: flex; align-items: center; }
.payment-amount-modal ::v-deep .ant-modal-footer { box-sizing: border-box; height: 55px; display: flex; align-items: center; justify-content: flex-end; }
.payment-amount-form label { line-height: 32px; }
.payment-error { margin-top: 8px; color: #ff4d4f; }
</style>
