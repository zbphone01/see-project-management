<template>
  <section class="applied-page recruitment-summary-page">
    <section class="panel applied-table-panel">
      <a-tabs class="strategy-tabs" :active-key="activeStrategy" @change="switchStrategy">
        <a-tab-pane v-for="strategy in strategies" :key="strategy" :tab="strategy" />
      </a-tabs>

      <div class="recruitment-search">
        <div class="summary-statistics" aria-live="polite">
          <span>{{ activeStrategy === '全部' ? '全部策略' : '该策略' }}下共有招募 <strong>{{ strategyRecruitments.length }}</strong> 个<span class="scope-count">（项目组项目 {{ groupCount }} / 项目中心项目 {{ strategyRecruitments.length - groupCount }}）</span></span>
          <span>有待审申请的招募 <strong class="pending-count">{{ pendingRecruitmentCount }}</strong> 个</span>
          <span>有执行中项目的招募 <strong class="active-count">{{ activeRecruitmentCount }}</strong> 个</span>
        </div>
        <a-input id="summary-keyword" v-model="keyword" class="search-input" placeholder="请输入招募名称" allow-clear @pressEnter="queryRecruitments" />
        <a-button type="primary" @click="queryRecruitments"><a-icon type="search" /> 查询</a-button>
      </div>

      <div class="summary-table-scroll">
        <a-table
          class="applied-table summary-table"
          :columns="recruitmentColumns"
          :data-source="filteredRecruitments"
          :pagination="pagination"
          :expanded-row-keys="expandedRecruitmentKeys"
          :expand-icon-as-cell="false"
          :expand-icon-column-index="-1"
          :custom-row="recruitmentRow"
          row-key="id"
          @change="changePage"
        >
          <template slot="recruitment" slot-scope="text, recruitment">
            <div class="table-project">
              <div :class="['table-project-cover', recruitment.cover]">
                <img v-if="recruitment.image" :src="recruitment.image" :alt="recruitment.name" />
                <a-icon v-else :type="recruitment.icon" />
              </div>
              <div>
                <strong>{{ recruitment.name }}</strong>
                <span class="recruitment-department"><a-icon type="cluster" /> {{ recruitment.department }}</span>
                <div class="recruitment-attributes">
                  <span class="recruitment-attribute strategy-tag">策略：{{ recruitment.strategy }}</span>
                  <span class="recruitment-attribute topic-tag">议题：{{ recruitment.topic }}</span>
                </div>
              </div>
            </div>
          </template>
          <template slot="type" slot-scope="type"><span :class="['project-type-chip', type === '联合公益' ? 'charity' : 'grant']">{{ type }}</span></template>
          <template slot="period" slot-scope="text, recruitment"><span class="updated-time"><span>{{ recruitment.startDate }}</span><span>{{ recruitment.endDate }}</span></span></template>
          <template slot="organizations" slot-scope="organizations">
            <a-tooltip v-if="organizations.length" :title="organizations.join('、')"><span class="organization-names" tabindex="0" :aria-label="`指定机构：${organizations.join('、')}`">{{ organizations.join('、') }}</span></a-tooltip>
            <span v-else class="empty-value">—</span>
          </template>
          <template slot="pending" slot-scope="count"><span :class="{ 'pending-count': count > 0 }">{{ count }}</span></template>
          <template slot="active" slot-scope="count"><span :class="{ 'active-count': count > 0 }">{{ count }}</span></template>
          <template slot="operation" slot-scope="text, recruitment">
            <div class="summary-operation-trigger" @click.stop>
              <a-dropdown :trigger="['click']" placement="bottomRight">
                <a-button class="operation-button" :aria-label="`${recruitment.name}的操作`">操作 <a-icon type="down" /></a-button>
                <a-menu slot="overlay">
                  <a-menu-item key="export-summary" @click="notifyComingSoon('导出申请汇总')">导出申请汇总</a-menu-item>
                  <a-menu-item key="export-all" @click="notifyComingSoon('导出所有申请')">导出所有申请</a-menu-item>
                </a-menu>
              </a-dropdown>
            </div>
          </template>
          <template slot="expandedRowRender" slot-scope="recruitment">
            <section class="application-section" :aria-label="`${recruitment.name}的项目申请`">
              <a-table
                class="applied-table application-table"
                :columns="applicationColumns"
                :data-source="recruitment.applications"
                :pagination="false"
                :locale="{ emptyText: '该招募暂无项目申请' }"
                row-key="id"
              >
                <template slot="project" slot-scope="text, project">
                  <div class="table-project application-project">
                    <div>
                      <strong>{{ project.name }}</strong>
                      <div class="project-primary-meta"><span class="project-code"><a-icon type="flag" /> {{ project.code }}</span><span class="project-organization"><a-icon type="bank" /> {{ project.organization }}</span></div>
                    </div>
                  </div>
                </template>
                <template slot="amount" slot-scope="amount"><span class="application-amount">{{ formatAmount(amount) }}</span></template>
                <template slot="submittedAt" slot-scope="submittedAt"><span class="updated-time"><span>{{ submittedAt.split(' ')[0] }}</span><span>{{ submittedAt.split(' ')[1] }}</span></span></template>
                <template slot="status" slot-scope="status"><span :class="['status-chip', statusTone(status)]">{{ status }}</span></template>
              </a-table>
            </section>
          </template>
        </a-table>
      </div>
    </section>
  </section>
</template>

<script>
import { summaryRecruitments, summaryApplications } from '../mock/recruitment-summary'

export default {
  name: 'RecruitmentSummary',
  data () {
    return {
      strategies: ['全部', '荒漠化防治', '生态保护与自然教育', '气候变化与商业可持续', '海洋保护', '环保公益行业发展', '探索项目', '专项基金', '联合公益', '其他'],
      activeStrategy: '全部',
      keyword: '',
      appliedKeyword: '',
      page: 1,
      pageSize: 10,
      expandedRecruitmentKeys: [],
      recruitmentColumns: [
        { title: '招募ID', dataIndex: 'code', width: 110, align: 'center', className: 'business-id-column' },
        { title: '招募名称', dataIndex: 'name', key: 'recruitment', scopedSlots: { customRender: 'recruitment' } },
        { title: '项目类型', dataIndex: 'type', width: 110, align: 'center', scopedSlots: { customRender: 'type' } },
        { title: '起止时间', key: 'period', width: 120, align: 'center', scopedSlots: { customRender: 'period' } },
        { title: '指定机构', dataIndex: 'designatedOrganizations', width: 200, align: 'center', scopedSlots: { customRender: 'organizations' } },
        { title: '待审申请', dataIndex: 'pendingCount', width: 90, align: 'center', scopedSlots: { customRender: 'pending' } },
        { title: '执行中项目', dataIndex: 'activeCount', width: 90, align: 'center', scopedSlots: { customRender: 'active' } },
        { title: '操作', key: 'operation', width: 90, align: 'center', className: 'summary-operation-cell', scopedSlots: { customRender: 'operation' } }
      ],
      applicationColumns: [
        { title: '项目名称', dataIndex: 'name', key: 'project', scopedSlots: { customRender: 'project' } },
        { title: '项目预算', dataIndex: 'amount', width: 200, align: 'center', scopedSlots: { customRender: 'amount' } },
        { title: '提交时间', dataIndex: 'submittedAt', width: 120, align: 'center', scopedSlots: { customRender: 'submittedAt' } },
        { title: '状态', dataIndex: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } }
      ]
    }
  },
  computed: {
    recruitments () {
      return summaryRecruitments.map(recruitment => {
        const applications = summaryApplications.filter(application => application.recruitmentId === recruitment.id)
        return Object.assign({}, recruitment, {
          applications,
          pendingCount: applications.filter(application => application.status === '申请待审').length,
          activeCount: applications.filter(application => application.status === '执行中').length
        })
      })
    },
    strategyRecruitments () { return this.recruitments.filter(recruitment => this.activeStrategy === '全部' || recruitment.strategy === this.activeStrategy) },
    groupCount () { return this.strategyRecruitments.filter(recruitment => recruitment.scope === 'group').length },
    pendingRecruitmentCount () { return this.strategyRecruitments.filter(recruitment => recruitment.pendingCount > 0).length },
    activeRecruitmentCount () { return this.strategyRecruitments.filter(recruitment => recruitment.activeCount > 0).length },
    filteredRecruitments () {
      const keyword = this.appliedKeyword.trim().toLowerCase()
      return this.strategyRecruitments.filter(recruitment => !keyword || recruitment.name.toLowerCase().includes(keyword))
    },
    pagination () {
      return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['10', '50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` }
    }
  },
  methods: {
    resetTableState () {
      this.page = 1
      this.expandedRecruitmentKeys = []
    },
    switchStrategy (strategy) { this.activeStrategy = strategy; this.resetTableState() },
    queryRecruitments () { this.appliedKeyword = this.keyword; this.resetTableState() },
    changePage (pagination) {
      this.page = pagination.pageSize === this.pageSize ? pagination.current : 1
      this.pageSize = pagination.pageSize
      this.expandedRecruitmentKeys = []
    },
    recruitmentRow (recruitment) {
      return {
        on: {
          click: () => this.toggleApplications(recruitment.id)
        }
      }
    },
    isExpanded (id) { return this.expandedRecruitmentKeys.includes(id) },
    toggleApplications (id) {
      this.expandedRecruitmentKeys = this.isExpanded(id) ? this.expandedRecruitmentKeys.filter(key => key !== id) : this.expandedRecruitmentKeys.concat(id)
    },
    formatAmount (amount) { return typeof amount === 'number' ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—' },
    statusTone (status) {
      return { '审核流程中': 'neutral', '申请待审': 'pending-review', '进展待审': 'pending-review', '执行中': 'active-approved', '修订中': 'action-rejected', '正常结项': 'neutral', '异常结项': 'action-rejected' }[status] || 'neutral'
    },
    notifyComingSoon (action) { this.$message.info(`${action}功能待开发`) }
  }
}
</script>

<style scoped>
.strategy-tabs { padding: 0 20px; }
.strategy-tabs ::v-deep .ant-tabs-bar { min-height: 76px; margin: 0; border-bottom-color: #edf1f5; }
.strategy-tabs ::v-deep .ant-tabs-nav .ant-tabs-tab { height: 76px; margin-right: 28px; padding: 0; display: inline-flex; align-items: center; box-sizing: border-box; }
.strategy-tabs ::v-deep .ant-tabs-tab-active { color: #1677ff; font-weight: 600; }
.recruitment-search { min-height: 72px; padding: 12px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #e6ebf2; }
.search-input { width: 300px; flex: none; }
.recruitment-search .ant-btn { height: 32px; }
.summary-statistics { min-width: 0; flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 20px; color: #506177; line-height: 1.7; }
.summary-statistics strong { padding: 0 4px; color: #1677ff; font-size: 16px; }
.summary-statistics .pending-count, .pending-count { color: #fa8c16; }
.summary-statistics .active-count, .active-count { color: #70b603; }
.scope-count { color: #718095; }
.recruitment-department { max-width: 100%; margin-top: 11px; padding: 3px 6px; border-radius: 3px; color: #52a61a; background: #f6ffed; line-height: 1.4; overflow-wrap: anywhere; }
.recruitment-attributes { max-width: 100%; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 6px; line-height: 1.4; text-align: left; }
.recruitment-attribute { max-width: 100%; padding: 3px 8px; border-radius: 4px; white-space: normal; overflow-wrap: anywhere; }
.strategy-tag { color: #08979c; background: #e6fffb; }
.topic-tag { color: #d48806; background: #fffbe6; }
.summary-table-scroll { overflow-x: auto; }
.summary-table { width: 100%; min-width: 1140px; }
.summary-table ::v-deep table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.summary-table ::v-deep .ant-table-thead > tr > th,
.summary-table ::v-deep .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; overflow-wrap: anywhere; }
.summary-table ::v-deep .business-id-column { box-sizing: border-box; width: 110px !important; min-width: 110px !important; max-width: 110px !important; }
.summary-table ::v-deep .summary-operation-cell { position: sticky; right: 0; z-index: 1; background: #fff; }
.summary-table ::v-deep th.summary-operation-cell { background: #f7f9fc; }
.summary-table ::v-deep .ant-table-tbody > tr:not(.ant-table-expanded-row):hover > td,
.summary-table ::v-deep .ant-table-tbody > tr.ant-table-row-hover:not(.ant-table-expanded-row) > td { background: #f8fbff !important; }
.summary-table ::v-deep .ant-table-tbody > tr:hover > .summary-operation-cell .operation-button,
.summary-table ::v-deep .ant-table-tbody > tr.ant-table-row-hover > .summary-operation-cell .operation-button,
.summary-table ::v-deep .summary-operation-cell:hover .operation-button { background: transparent !important; }
.summary-table ::v-deep .operation-button { gap: 2px; }
.summary-table ::v-deep .operation-button > span + .anticon { margin-left: 0; }
.summary-table ::v-deep .ant-table-expanded-row > td { padding: 30px !important; background: #f4f7fb; }
.summary-table ::v-deep .ant-table-expanded-row:hover > td { background: #f4f7fb; }
.summary-table .table-project > div:last-child { row-gap: 5px; }
.organization-names { display: inline-block; max-width: 100%; color: #536277; line-height: 1.55; overflow-wrap: anywhere; cursor: help; }
.application-section, .application-table { width: 100%; box-sizing: border-box; }
.application-section { margin: 0; border: 0; border-radius: 0; background: transparent; }
.application-table ::v-deep .ant-table,
.application-table ::v-deep .ant-table-content,
.application-table ::v-deep .ant-table-body { border: 0; border-radius: 0; }
.application-table ::v-deep table { width: 100% !important; min-width: 0 !important; table-layout: fixed; }
.application-table ::v-deep .ant-table-thead > tr > th,
.application-table ::v-deep .ant-table-tbody > tr > td { border-right: 0 !important; border-left: 0 !important; }
.application-table ::v-deep .ant-table-thead > tr > th { height: 40px; padding-top: 10px; padding-bottom: 10px; background: #fff; }
.application-table ::v-deep .ant-table-tbody > tr > td { background: #fff !important; }
.application-table ::v-deep .ant-table-thead > tr > th:first-child,
.application-table ::v-deep .ant-table-tbody > tr > td:first-child { padding-left: 20px !important; }
.application-table .application-project { grid-template-columns: minmax(0, 1fr); gap: 0; }
.application-table .project-primary-meta { flex-wrap: wrap; margin-top: 0; }
.application-table .project-code, .application-table .project-organization { white-space: normal; overflow: visible; overflow-wrap: anywhere; }
.application-amount { font-variant-numeric: tabular-nums; }
@media (max-width: 1439px) {
  .recruitment-search { flex-wrap: wrap; }
  .summary-statistics { flex-basis: 100%; }
}
</style>
