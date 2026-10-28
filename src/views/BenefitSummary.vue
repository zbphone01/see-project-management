<template>
  <section class="benefit-summary-page">
    <section class="panel applied-table-panel">
      <a-tabs v-model="activeTab" class="benefit-tabs shared-list-tabs" @change="changeTab">
        <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.label" />
      </a-tabs>
      <form class="filter-grid benefit-filters" @submit.prevent="applyFilters">
        <a-select v-model="filters.year" aria-label="年份">
          <a-select-option value="all">全部年份</a-select-option>
          <a-select-option v-for="year in years" :key="year" :value="year">{{ year }}年</a-select-option>
        </a-select>
        <a-select v-model="filters.department" aria-label="部门">
          <a-select-option value="all">全部部门</a-select-option>
          <a-select-option v-for="department in departments" :key="department" :value="department">{{ department }}</a-select-option>
        </a-select>
        <a-button type="primary" html-type="submit" icon="filter">筛选</a-button>
        <div class="benefit-update">
          <a-button v-if="hasDetails" html-type="button" @click="showDetails">查看详情</a-button>
          <span>数据更新日期：2026-01-16</span>
        </div>
      </form>
      <div class="benefit-tables">
        <div v-for="table in tables" :key="table.key" class="benefit-table-wrap">
          <h2 v-if="table.heading" class="benefit-table-heading">{{ table.heading }}</h2>
          <table class="benefit-table" :class="{ 'benefit-species-table': ['species', 'weight', 'money', 'list', 'document'].includes(activeTab), 'benefit-area-table': ['area', 'people', 'distance'].includes(activeTab) }">
            <caption class="benefit-sr-only">{{ activeLabel }} · {{ table.heading || table.title }}</caption>
            <colgroup><col /><col v-if="table.secondary" /><col class="benefit-number" /><col class="benefit-number" /><col class="benefit-rate" /><col v-if="table.coverage" class="benefit-coverage" /><col class="benefit-count" /></colgroup>
            <thead><tr><th scope="col">{{ table.title }}</th><th v-if="table.secondary" scope="col">{{ table.secondary }}</th><th scope="col">项目收益{{ table.unit ? '（' + table.unit + '）' : '' }}</th><th scope="col">部门填报{{ table.unit ? '（' + table.unit + '）' : '' }}</th><th scope="col">完成比例</th><th v-if="table.coverage" scope="col">省或直辖市覆盖数</th><th scope="col">项目数量</th></tr></thead>
            <tbody><tr v-for="row in table.rows" :key="row.id"><td v-if="row.groupSize !== 0" :rowspan="row.groupSize || 1">{{ row.label }}</td><td v-if="table.secondary">{{ row.content }}</td><td class="benefit-numeric">{{ formatNumber(row.project) }}</td><td class="benefit-numeric">{{ formatNumber(row.department) }}</td><td class="benefit-numeric benefit-completion">{{ row.completion }}</td><td v-if="table.coverage" class="benefit-numeric">{{ row.coverage }}</td><td class="benefit-numeric">{{ row.projects }}</td></tr></tbody>
          </table>
        </div>
      </div>
    </section>
  </section>
</template>

<script>
import { benefitTabs, benefitDepartments, createBenefitTables, summarizeBenefitRow } from '../mock/benefit-summary'
export default {
  name: 'BenefitSummary',
  data () {
    const currentYear = new Date().getFullYear()
    const requestedYear = this.$route.query.year
    const year = requestedYear === 'all' ? 'all' : Number(requestedYear) >= 2022 && Number(requestedYear) <= currentYear ? Number(requestedYear) : currentYear
    const department = benefitDepartments.includes(this.$route.query.department) ? this.$route.query.department : 'all'
    return { activeTab: benefitTabs.some(tab => tab.key === this.$route.query.tab) ? this.$route.query.tab : 'species', tabs: benefitTabs, departments: benefitDepartments, currentYear, filters: { year, department }, appliedFilters: { year, department } }
  },
  computed: {
    years () { return Array.from({ length: Math.max(0, this.currentYear - 2022 + 1) }, (_, index) => this.currentYear - index) },
    activeLabel () { return this.tabs.find(tab => tab.key === this.activeTab).label },
    hasDetails () { return ['species', 'list', 'document'].includes(this.activeTab) },
    tables () { return createBenefitTables(this.activeTab).map(table => Object.assign({}, table, { rows: table.rows.map(row => summarizeBenefitRow(row, this.appliedFilters, this.currentYear)) })) }
  },
  watch: {
    '$route.query.tab' (tab) { this.activeTab = benefitTabs.some(item => item.key === tab) ? tab : 'species' }
  },
  methods: {
    changeTab (tab) {
      if (this.$route.query.tab !== tab) this.$router.replace({ name: 'benefit-summary', query: Object.assign({}, this.$route.query, { tab }) })
    },
    applyFilters () { this.appliedFilters = Object.assign({}, this.filters) },
    formatNumber (value) { return Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) },
    showDetails () {
      if (this.activeTab === 'document') { this.$router.push({ name: 'benefit-document-detail', query: { year: String(this.appliedFilters.year), department: this.appliedFilters.department } }); return }
      if (this.activeTab === 'list') { this.$router.push({ name: 'benefit-list-detail', query: { year: String(this.appliedFilters.year), department: this.appliedFilters.department } }); return }
      if (this.activeTab === 'species') { this.$router.push({ name: 'benefit-species-detail', query: { year: String(this.appliedFilters.year), department: this.appliedFilters.department } }); return }
      this.$message.info('查看' + this.activeLabel + '详情示例，暂未接入明细数据')
    }
  }
}
</script>

<style scoped>
.benefit-summary-page { min-width: 0; }

.benefit-filters { display: flex; align-items: center; gap: 12px; padding: 20px; flex-wrap: wrap; }
.benefit-filters .ant-select { width: 200px; }
.benefit-filters .ant-btn { height: 38px; border-radius: 8px; }
.benefit-update { margin-left: auto; display: flex; align-items: center; gap: 16px; color: #718095; }
.benefit-update .ant-btn { height: 32px; }
.benefit-tables { padding: 0 0 20px; display: grid; gap: 32px; min-width: 0; }
.benefit-table-wrap { min-width: 0; overflow-x: auto; }
.benefit-table-heading { margin: 0; padding: 0 20px 16px; color: #18253c; line-height: 1.6; }
.benefit-table { width: 100%; min-width: 1140px; table-layout: fixed; border-collapse: collapse; color: #35455a; }
.benefit-table th { height: 54px; color: #506177; font-weight: 700; background: #f7f9fc; }
.benefit-table th, .benefit-table td { padding: 14px 12px; border-bottom: 1px solid #e8edf3; line-height: 1.6; white-space: normal; overflow-wrap: anywhere; }
.benefit-table th:first-child, .benefit-table td:first-child { padding-left: 20px; }
.benefit-table th:not(:first-child), .benefit-numeric { text-align: center; }
.benefit-table th:first-child { text-align: left; }
.benefit-completion { color: #1677ff; }
.benefit-table tbody tr:hover { background: #fafcff; }
.benefit-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
.benefit-species-table col:first-child { width: auto; }
.benefit-species-table .benefit-number,
.benefit-species-table .benefit-rate,
.benefit-species-table .benefit-count { width: 180px; }
.benefit-area-table col:first-child { width: auto; }
.benefit-area-table .benefit-number,
.benefit-area-table .benefit-rate,
.benefit-area-table .benefit-coverage,
.benefit-area-table .benefit-count { width: 180px; }
</style>
