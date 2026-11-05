<template>
  <div class="budget-generated">
    <a-alert v-if="sheet.error" type="error" show-icon :message="sheet.error" />
    <template v-else>
      <p v-if="sheet.note" class="budget-generated-note">{{ sheet.note }}</p>
      <div class="budget-generated-scroll" tabindex="0" :aria-label="title + '，可左右滚动'">
        <table class="budget-generated-table" :class="{ 'budget-cost-analysis': kind === 'cost', 'budget-summary-table': kind === 'summary' }" :style="{ minWidth: tableWidth + 'px' }">
          <colgroup><col v-for="(column, index) in sheet.columns" :key="index" :style="{ width: (column.width / tableWidth * 100) + '%' }" /></colgroup>
          <thead>
            <tr><th :colspan="sheet.columns.length" class="budget-generated-project-name">{{ sheet.metadata.projectName || '未填写' }}</th></tr>
            <tr><th :colspan="sheet.columns.length">{{ title }}<span v-if="audit && kind !== 'adjustments'" class="budget-audit-status">（待审核）</span></th></tr>
            <template v-if="kind === 'summary'">
              <tr><td colspan="2" class="budget-generated-meta">编制单位（全称）：{{ sheet.metadata.organization || '未填写' }}</td><td :colspan="sheet.columns.length - 2" class="budget-generated-meta">项目周期：{{ sheet.metadata.period || '未填写' }}</td></tr>
              <tr><td colspan="2" class="budget-generated-meta">合作多方：{{ sheet.metadata.partners || '无' }}</td><td :colspan="sheet.columns.length - 2" class="budget-generated-meta">执行金额截止日期：{{ sheet.metadata.executionCutoff || '无' }}</td></tr>
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">金额单位：元</td></tr>
            </template>
            <template v-else-if="kind === 'adjustments'">
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">编制单位（全称）：{{ sheet.metadata.organization || '未填写' }}</td></tr>
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">项目周期：{{ sheet.metadata.period || '未填写' }}</td></tr>
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">合作多方：{{ sheet.metadata.partners || '无' }}</td></tr>
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">执行金额截止日期：{{ sheet.metadata.executionCutoff || '无' }}</td></tr>
              <tr><td :colspan="sheet.columns.length" class="budget-generated-meta">金额单位：元</td></tr>
            </template>
            <tr><th v-for="(column, index) in sheet.columns" :key="index">{{ column.title }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in sheet.rows" :key="row.key" :class="'generated-row-' + row.kind">
              <template v-for="(cell, index) in row.cells"><td v-if="!mergeHistoryContent(row) || index < 2 || index > 3" :key="index" :colspan="mergeHistoryContent(row) && index === 1 ? 3 : 1" :class="['generated-cell-' + sheet.columns[index].role, cell.role ? 'generated-cell-' + cell.role : '']"><template v-if="cell.detail"><div>{{ cell.detail.expression }}</div><div v-if="cell.detail.description" class="budget-generated-description">{{ cell.detail.description }}</div></template><template v-else>{{ cell.value }}</template></td></template>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script>
import { generatedBudgetSheet, generatedSheets } from '../utils/budget-generated-data'
export default {
  name: 'BudgetGeneratedTable',
  props: { budget: { type: Object, required: true }, kind: { type: String, required: true }, audit: { type: Boolean, default: false } },
  methods: {
    mergeHistoryContent (row) { return this.kind === 'adjustments' && (row.key.indexOf('output:') === 0 || row.key.indexOf('activity:') === 0) }
  },
  computed: {
    title () { return generatedSheets[this.kind] || '预算表' },
    sheet () {
      try {
        const sheet = generatedBudgetSheet(this.budget, this.kind)
        if (this.kind === 'summary' || this.kind === 'adjustments') sheet.metadata = Object.keys(sheet.metadata).reduce((result, key) => { result[key] = typeof sheet.metadata[key] === 'string' ? sheet.metadata[key].replace(/（自动获取）/g, '') : sheet.metadata[key]; return result }, {})
        return sheet
      } catch (error) { return { error: error.message } }
    },
    tableWidth () { return this.sheet.error ? 0 : this.sheet.columns.reduce((sum, column) => sum + column.width, 0) }
  }
}
</script>

<style scoped>
.budget-generated { min-width: 0; width: 100%; }
.budget-generated-note { margin: 0 0 12px; color: #718095; }
.budget-generated-scroll { width: 100%; max-width: 100%; overflow-x: auto; padding-bottom: 12px; overscroll-behavior-x: contain; }
.budget-generated-table { width: 100%; table-layout: fixed; border-collapse: collapse; background: #fff; color: #000; font-size: var(--text-13); line-height: 1.4; }
.budget-generated-table td, .budget-generated-table th { padding: 4px 2px; border: 1px solid #222; text-align: center; vertical-align: middle; overflow-wrap: anywhere; white-space: pre-wrap; font-variant-numeric: tabular-nums; }
.budget-generated-table tr { height: 32px; }
.budget-generated-table thead th { background: #F2F2F2; }
.budget-generated-table thead .budget-generated-project-name { background: #fff; }
.budget-generated-table .budget-generated-meta, .budget-generated-table .generated-cell-text { text-align: left; }
.budget-generated-description { margin-top: 8px; }
.budget-audit-status { color: #F5222D; }
.generated-row-total { background: #FFE3E7; font-weight: 700; }
.generated-row-group { background: #EDFFCE; font-weight: 700; }
.generated-row-activity { background: #D4F2FF; font-weight: 700; }
.generated-cell-total { background: #F5E9FF; }
.generated-cell-executed { background: #E7FFFF; }
.generated-cell-execution-ratio { background: #FFF3E1; }
.generated-row-total .generated-cell-executed, .generated-row-total .generated-cell-execution-ratio { background: inherit; }
.budget-cost-analysis tbody td { background: #fff; }
.budget-cost-analysis .generated-row-total td { background: #F2F2F2; }
.budget-summary-table .generated-cell-before, .budget-summary-table .generated-cell-change-ratio { background: #fff; }
.budget-summary-table .generated-row-total > td { background: #FFE3E7; }
.budget-summary-table .generated-cell-increase { color: #F5222D; }
.budget-summary-table .generated-cell-decrease { color: #70B603; }
</style>
