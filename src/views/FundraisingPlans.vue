<template>
  <section class="applied-page fundraising-plans-page">
    <section class="panel applied-table-panel">
      <a-tabs v-model="activeTab" class="plan-tabs">
        <a-tab-pane key="plans" tab="规划列表">
          <form class="filter-grid plan-filters" @submit.prevent="queryPlans">
            <label for="plan-name"><a-input id="plan-name" v-model="planName" aria-label="筹款规划名称" placeholder="请输入筹款规划名称" allow-clear /></label>
            <div class="filter-actions query-actions"><a-button type="primary" html-type="submit" icon="search">查询</a-button></div>
            <a-button class="new-plan-button" icon="file-add" @click="openPlan()">发起筹款规划</a-button>
          </form>
          <a-table class="applied-table plan-table" :columns="planColumns" :data-source="filteredPlans" :pagination="planPagination" :scroll="{ x: true }" row-key="id" :locale="{ emptyText: '暂无符合条件的筹款规划' }" @change="changePlanPage">
            <template slot="name" slot-scope="name"><strong class="plan-name">{{ name }}</strong></template>
            <template slot="amount" slot-scope="amount">{{ formatAmount(amount) }}</template>
            <template slot="restriction" slot-scope="restriction"><span class="plan-text">{{ restriction }}</span></template>
            <template slot="applicationCount" slot-scope="text, record">{{ applicationCount(record.id) }}</template>
            <template slot="operation" slot-scope="text, record">
              <a-button v-if="record.id === 'plan-yangtze'" type="link" @click="handlePlanAction('edit', record)">编辑</a-button>
              <a-button v-else-if="record.id === 'plan-local'" type="link" @click="handlePlanAction('apply', record)">申请</a-button>
              <a-dropdown v-else :trigger="['hover']" placement="bottomRight">
                <a-button class="operation-button" :aria-label="`${record.name}的操作`">操作<a-icon type="down" /></a-button>
                <a-menu slot="overlay" @click="handlePlanAction($event.key, record)">
                  <a-menu-item v-if="record.editable" key="edit">编辑</a-menu-item>
                  <a-menu-item key="apply">申请</a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="applications" tab="申请列表">
          <form class="filter-grid application-filters" @submit.prevent="queryApplications">
            <label for="plan-application-name"><a-input id="plan-application-name" v-model="applicationFilters.name" aria-label="筹款规划申请名称" placeholder="请输入筹款规划申请名称" allow-clear /></label>
            <label for="plan-application-department"><a-select id="plan-application-department" v-model="applicationFilters.department" aria-label="部门" placeholder="请选择部门" allow-clear><a-select-option v-for="department in departments" :key="department" :value="department">{{ department }}</a-select-option></a-select></label>
            <div class="filter-actions"><a-button type="primary" html-type="submit" icon="search">查询</a-button><a-button icon="reload" @click="resetApplications">重置</a-button></div>
          </form>
          <a-table class="applied-table plan-table" :columns="applicationColumns" :data-source="filteredApplications" :pagination="applicationPagination" :scroll="{ x: true }" row-key="id" :locale="{ emptyText: '暂无符合条件的规划申请' }" @change="changeApplicationPage">
            <template slot="name" slot-scope="name"><strong class="plan-name">{{ name }}</strong></template>
            <template slot="amounts" slot-scope="text, record"><span class="plan-amount">{{ formatAmount(record.actualAmount) }} / {{ formatAmount(record.targetAmount) }}</span></template>
            <template slot="department" slot-scope="department"><span class="plan-text">{{ department }}</span></template>
            <template slot="status" slot-scope="status"><span :class="['status-chip', statusTone(status)]">{{ status }}</span></template>
            <template slot="updatedAt" slot-scope="updatedAt"><span class="updated-time"><span>{{ updatedAt.split(' ')[0] }}</span><span>{{ updatedAt.split(' ')[1] }}</span></span></template>
            <template slot="operation" slot-scope="text, record">
              <div class="application-row-actions"><button v-for="action in actions(record)" :key="action" type="button" :class="{ 'view-action': action === '查看', 'delete-action': action === '删除' }" @click="handleApplicationAction(action, record)">{{ action }}</button></div>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </section>
    <FundraisingPlanModal ref="planModal" @saved="onPlanSaved" />
  </section>
</template>

<script>
import { planDepartments, createFundraisingPlans, createPlanApplications, filterPlans, applicationActions } from '../mock/fundraising-plans'

import FundraisingPlanModal from '../components/FundraisingPlanModal.vue'

export default {
  name: 'FundraisingPlans',
  components: { FundraisingPlanModal },
  data () {
    return {
      activeTab: this.$route.query.tab === 'applications' ? 'applications' : 'plans', departments: planDepartments,
      plans: createFundraisingPlans(), applications: createPlanApplications(),
      planName: '', appliedPlanName: '', planPage: 1, planPageSize: 10,
      applicationFilters: { name: '', department: undefined }, appliedApplicationFilters: { name: '', department: undefined }, applicationPage: 1, applicationPageSize: 50,
      planColumns: [
        { title: '筹款规划名称', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
        { title: '筹款目标额', dataIndex: 'targetAmount', width: 180, align: 'center', scopedSlots: { customRender: 'amount' } },
        { title: '规划申请限制', dataIndex: 'restriction', width: 220, scopedSlots: { customRender: 'restriction' } },
        { title: '规划申请数', key: 'applicationCount', width: 110, align: 'center', scopedSlots: { customRender: 'applicationCount' } },
        { title: '项目招募数', dataIndex: 'recruitmentCount', width: 110, align: 'center' },
        { title: '操作', key: 'operation', width: 90, fixed: 'right', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      applicationColumns: [
        { title: '筹款规划申请名称', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
        { title: '筹款额（实际/目标）', key: 'amounts', width: 220, align: 'center', scopedSlots: { customRender: 'amounts' } },
        { title: '申请部门', dataIndex: 'department', width: 200, scopedSlots: { customRender: 'department' } },
        { title: '申请状态', dataIndex: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '状态更新时间', dataIndex: 'updatedAt', width: 120, align: 'center', scopedSlots: { customRender: 'updatedAt' } },
        { title: '操作', key: 'operation', width: 90, fixed: 'right', align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  activated () {
    this.applications = createPlanApplications()
    if (this.$route.query.tab === 'applications') this.activeTab = 'applications'
  },
  watch: {
    '$route.query.tab' (tab) { if (this.$route.name === 'fundraising-plans' && tab === 'applications') this.activeTab = 'applications' }
  },
  computed: {
    filteredPlans () { return filterPlans(this.plans, { name: this.appliedPlanName }) },
    filteredApplications () { return filterPlans(this.applications, this.appliedApplicationFilters) },
    planPagination () { return { current: this.planPage, pageSize: this.planPageSize, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'], showTotal: total => `共有 ${total} 条数据` } },
    applicationPagination () { return { current: this.applicationPage, pageSize: this.applicationPageSize, showSizeChanger: true, pageSizeOptions: ['50', '100'], showTotal: total => `共有 ${total} 条数据` } }
  },
  methods: {
    actions: applicationActions,
    applicationCount (id) { return this.applications.filter(item => item.planId === id).length },
    formatAmount (amount) { return amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 }) },
    statusTone (status) { return { '草稿': 'neutral', '规划待审': 'pending-review', '规划驳回': 'action-rejected', '规划通过': 'active-approved' }[status] || 'neutral' },
    queryPlans () { this.appliedPlanName = this.planName; this.planPage = 1 },
    queryApplications () { this.appliedApplicationFilters = Object.assign({}, this.applicationFilters); this.applicationPage = 1 },
    resetApplications () { this.applicationFilters = { name: '', department: undefined }; this.queryApplications() },
    changePlanPage (pagination) { this.planPage = pagination.pageSize === this.planPageSize ? pagination.current : 1; this.planPageSize = pagination.pageSize },
    changeApplicationPage (pagination) { this.applicationPage = pagination.pageSize === this.applicationPageSize ? pagination.current : 1; this.applicationPageSize = pagination.pageSize },
    handlePlanAction (action, record) { if (action === 'edit') this.openPlan(record); else this.$router.push({ name: 'fundraising-plan-form', params: { id: 'new' }, query: { planId: record.id } }) },
    handleApplicationAction (action, record) {
      if (action === '编辑') { this.$router.push({ name: 'fundraising-plan-form', params: { id: record.id } }); return }
      if (action === '查看' || action === '审核') {
        this.$router.push({ name: 'fundraising-plan-detail', params: { id: record.id }, query: { mode: action === '审核' ? 'audit' : 'view' } }); return
      }
      this.notifyUnavailable(action)
    },
    notifyUnavailable (action) { this.$message.info(`${action}对应的独立页面尚未实现，当前仅提供列表入口`) },
    openPlan (record) { this.$refs.planModal.open(record) },
    onPlanSaved () { this.planName = ''; this.appliedPlanName = ''; this.planPage = 1 }
  }
}
</script>

<style scoped>
.fundraising-plans-page { min-width: 0; }
.plan-tabs >>> .ant-tabs-bar { min-height: 76px; margin: 0; padding: 0 20px; border-bottom-color: #edf1f5; }
.plan-tabs >>> .ant-tabs-nav .ant-tabs-tab { height: 76px; margin-right: 28px; padding: 0; display: inline-flex; align-items: center; }
.plan-tabs >>> .ant-tabs-tab-active { color: #1677ff; font-weight: 600; }
.plan-filters, .application-filters { padding: 20px; border-bottom: 1px solid #edf1f5; }
.plan-filters { grid-template-columns: minmax(240px, 360px) 88px minmax(88px, 1fr); }
.application-filters { grid-template-columns: minmax(240px, 360px) minmax(220px, 300px) 196px; }
.query-actions { grid-template-columns: 1fr; }
.new-plan-button { justify-self: end; height: 32px; border-radius: 5px; color: #fff; border-color: #18a66a; background: #18a66a; box-shadow: 0 2px 0 rgba(0,0,0,.043); }
.new-plan-button:hover, .new-plan-button:focus, .new-plan-button:active { color: #18a66a; border-color: #18a66a; background: #fff; }
.plan-table >>> .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.plan-table >>> .ant-table-thead > tr > th, .plan-table >>> .ant-table-tbody > tr > td { padding-right: 12px; padding-left: 12px; }
.plan-table >>> .ant-table-body > table > thead > tr > th:first-child, .plan-table >>> .ant-table-body > table > tbody > tr > td:first-child { padding-left: 20px; }
.plan-name, .plan-text, .plan-amount { min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.plan-name { display: block; color: #18253c; font-size: var(--text-14); font-weight: 400; }
.plan-amount { font-variant-numeric: tabular-nums; }
.operation-button { gap: 2px; }
.operation-button >>> span + .anticon { margin-left: 0; }
@media (max-width: 1439px) {
  .application-filters { grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) 196px; }
}
.application-row-actions { display: grid; justify-items: center; gap: 0; }
.application-row-actions button { min-height: 24px; padding: 0 2px; border: 0; border-radius: 5px; color: #1677ff; background: transparent; cursor: pointer; }
.application-row-actions button:hover, .application-row-actions button:focus { color: #0958d9; background: #f0f7ff; }
.application-row-actions .view-action { color: #70b603; }
.application-row-actions .view-action:hover, .application-row-actions .view-action:focus { color: #70b603; background: #f8ffed; }
.application-row-actions .delete-action { color: #ff4d4f; }
.application-row-actions .delete-action:hover, .application-row-actions .delete-action:focus { color: #ff4d4f; background: #fff1f0; }
</style>
