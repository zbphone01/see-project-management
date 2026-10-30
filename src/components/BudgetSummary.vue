<template>
  <table class="detail-table budget-summary"><thead><tr><th>预算及执行汇总表</th><th>预算合计金额</th><th>预算调整金额</th><th>调整后预算</th><th>执行金额</th><th>执行比例</th></tr></thead><tbody><tr v-for="row in summary" :key="row.key"><th>{{ row.kind === 'total' ? '合计金额' : row.name }}</th><td>{{ money(row.total) }}</td><td>{{ signedAdjustment(row.adjustment) }}</td><td>{{ optional(row.adjustedBudget) }}</td><td>{{ optional(row.executed) }}</td><td>{{ row.executionRatio || '/' }}</td></tr></tbody></table>
</template>
<script>
import { money } from '../mock/project-drafts'
export default {
  name: 'BudgetSummary',
  props: { rows: { type: Array, required: true } },
  computed: { summary () { return this.rows.filter(row => row.kind === 'total' || row.kind === 'group') } },
  methods: { money, signedAdjustment (value) { return value == null ? '/' : (Number(value) > 0 ? '+' : '') + money(value) }, optional (value) { return value == null ? '/' : money(value) } }
}
</script>
<style scoped>
.budget-summary { min-width: 900px; font-size: var(--text-13); }.budget-summary td, .budget-summary th { text-align: center; padding: 4px 2px; border: 1px solid #222; line-height: 1.4; }.budget-summary thead { background: #f2f2f2; }.budget-summary tbody tr:first-child { background: #ffe3e7; }
</style>
