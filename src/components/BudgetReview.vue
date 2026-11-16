<template>
  <div class="budget-review">
    <a-alert v-if="review.error" type="error" show-icon :message="review.error" />
    <a-tabs v-else v-model="activeTab" :animated="false">
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.title">
        <div v-if="tab.key === 'detail'" class="budget-review-scroll" tabindex="0" :aria-label="tab.title + '，可左右滚动'">
          <project-budget-table :metadata="review.budget.metadata" :rows="review.rows" :widths="widths" :progress-report="reportMode && progressReport" :donation-project="donationProject" :charity-header="charityHeader" :audit="audit && !reportMode" readonly black-amounts show-execution />
        </div>
        <div v-else-if="tab.key === 'personnel' && review.budget.personnel.length" class="budget-review-scroll" tabindex="0" :aria-label="tab.title + '，可左右滚动'">
          <project-personnel-table :rows="review.budget.personnel" :project-name="review.budget.metadata.projectName" :audit="audit && !reportMode" readonly black-amounts show-execution />
        </div>
        <budget-summary v-else-if="tab.key === 'summary'" :budget="review.budget" :audit="audit && !reportMode" />
        <budget-generated-table v-else-if="tab.historyExample" :budget="historyExamples[tab.historyExample]" kind="adjustments" :charity-history="charityHeader" />
        <budget-generated-table v-else-if="tab.key === 'cost' || tab.key === 'adjustments'" :budget="review.budget" :kind="tab.key" :charity-history="charityHeader && tab.key === 'adjustments'" :audit="audit && !reportMode && tab.key === 'cost'" />
        <a-empty v-else class="budget-review-empty" :description="tab.title + '暂无示例数据'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import ProjectBudgetTable, { measureBudgetWidths, measureCharityBudgetWidths } from './ProjectBudgetTable.vue'
import ProjectPersonnelTable from './ProjectPersonnelTable.vue'
import BudgetSummary from './BudgetSummary.vue'
import BudgetGeneratedTable from './BudgetGeneratedTable.vue'
import { createBudgetReviewData } from '../utils/budget-review-data'
import { createCharityBudgetReviewData } from '../utils/charity-budget-review-data'

export default {
  name: 'BudgetReview',
  components: { ProjectBudgetTable, ProjectPersonnelTable, BudgetSummary, BudgetGeneratedTable },
  props: {
    budget: { type: Object, required: true },
    projectName: { type: String, default: '' },
    audit: { type: Boolean, default: false },
    reportMode: { type: Boolean, default: false },
    progressReport: { type: Boolean, default: false },
    donationProject: { type: Boolean, default: false },
    charityHeader: { type: Boolean, default: false },
    historyExamples: { type: Object, default: null }
  },
  data () { return { activeTab: 'detail' } },
  computed: {
    review () {
      try { return this.charityHeader ? createCharityBudgetReviewData(this.budget) : createBudgetReviewData(this.budget, this.projectName) } catch (error) { return { error: error.message } }
    },
    widths () { return this.review.error ? [] : this.charityHeader ? measureCharityBudgetWidths(this.review.rows) : measureBudgetWidths(this.review.rows, this.reportMode && this.progressReport) },
    tabs () {
      if (this.charityHeader) return [{ key: 'detail', title: '联合公益预算表' }].concat(this.historyExamples
        ? [{ key: 'adjustments-none', title: '预算调整历史（无调整）', historyExample: 'none' }, { key: 'adjustments-multiple', title: '预算调整历史（多次调整）', historyExample: 'multiple' }]
        : [{ key: 'adjustments', title: '预算调整历史' }])
      if (this.reportMode) return [{ key: 'detail', title: '预算及执行明细表' }, { key: 'personnel', title: '人力成本分摊表' }, { key: 'summary', title: '预算及执行汇总表' }]
      if (this.donationProject) return [{ key: 'detail', title: '北京市企业家环保基金会联合公益项目预算表' }]
      const historyTabs = this.historyExamples
        ? [{ key: 'adjustments-none', title: '预算调整历史（无调整）', historyExample: 'none' }, { key: 'adjustments-multiple', title: '预算调整历史（多次调整）', historyExample: 'multiple' }]
        : [{ key: 'adjustments', title: '预算调整历史' }]
      return [{ key: 'detail', title: '预算及执行明细表' }, { key: 'personnel', title: '人力成本分摊表' },
        { key: 'summary', title: '预算及执行汇总表' }, { key: 'cost', title: '费用类型分析表' }].concat(historyTabs)
    }
  },
  watch: {
    donationProject () { this.activeTab = 'detail' },
    budget () { this.activeTab = 'detail' }
  }
}
</script>

<style scoped>
.budget-review { min-width: 0; }
.budget-review >>> .ant-tabs-bar { margin-bottom: 24px; }
.budget-review >>> .ant-tabs-tab { margin-right: 0; padding: 18px 28px; }
.budget-review-scroll { box-sizing: border-box; min-width: 0; width: 100%; max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 12px; }
.budget-review-scroll:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.budget-review-empty { padding: 50px 0; }
</style>
