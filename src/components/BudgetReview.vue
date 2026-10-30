<template>
  <div class="budget-review">
    <a-alert v-if="review.error" type="error" show-icon :message="review.error" />
    <a-tabs v-else v-model="activeTab" :animated="false">
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.title">
        <div v-if="tab.key === 'detail'" class="budget-review-scroll" tabindex="0" :aria-label="tab.title + '，可左右滚动'">
          <project-budget-table :metadata="review.budget.metadata" :rows="review.rows" :widths="widths" :donation-project="donationProject" :audit="audit" readonly black-amounts show-execution />
        </div>
        <div v-else-if="tab.key === 'personnel' && review.budget.personnel.length" class="budget-review-scroll" tabindex="0" :aria-label="tab.title + '，可左右滚动'">
          <project-personnel-table :rows="review.budget.personnel" :project-name="review.budget.metadata.projectName" readonly black-amounts show-execution />
        </div>
        <a-empty v-else class="budget-review-empty" :description="tab.title + '暂无示例数据'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import ProjectBudgetTable, { measureBudgetWidths } from './ProjectBudgetTable.vue'
import ProjectPersonnelTable from './ProjectPersonnelTable.vue'
import { createBudgetReviewData } from '../utils/budget-review-data'

export default {
  name: 'BudgetReview',
  components: { ProjectBudgetTable, ProjectPersonnelTable },
  props: {
    budget: { type: Object, required: true },
    projectName: { type: String, default: '' },
    audit: { type: Boolean, default: false },
    donationProject: { type: Boolean, default: false }
  },
  data () { return { activeTab: 'detail' } },
  computed: {
    review () {
      try { return createBudgetReviewData(this.budget, this.projectName) } catch (error) { return { error: error.message } }
    },
    widths () { return this.review.error ? [] : measureBudgetWidths(this.review.rows) },
    tabs () {
      if (this.donationProject) return [{ key: 'detail', title: '北京市企业家环保基金会联合公益项目预算表' }]
      return [{ key: 'detail', title: '预算及执行明细表' }, { key: 'personnel', title: '人力成本分摊表' },
        { key: 'summary', title: '预算及执行汇总表' }, { key: 'cost', title: '费用类型分析表' }, { key: 'adjustments', title: '预算调整历史' }]
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
.budget-review-scroll { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 12px; }
.budget-review-scroll:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.budget-review-empty { padding: 50px 0; }
</style>
