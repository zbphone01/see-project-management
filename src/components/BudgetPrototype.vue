<template>
  <div class="budget-prototype">
    <a-tabs v-model="activeTab" :animated="false">
      <a-tab-pane v-for="(title, index) in budget.tabs" :key="String(index)" :tab="title">
        <div v-if="index === 0" class="budget-sheet-scroll" tabindex="0" aria-label="预算及执行明细表，可左右滚动">
          <table class="budget-sheet">
            <colgroup><col v-for="(width, i) in budget.widths" :key="i" :style="{ width: width + 'px' }" /></colgroup>
            <thead>
              <tr><th colspan="15" class="sheet-project">{{ projectName }}</th></tr>
              <tr><th colspan="15" class="sheet-heading">项目预算及执行情况明细表 <span>（待审）</span></th></tr>
              <tr><td colspan="9" class="sheet-meta">编制单位（全称）：{{ budget.organization }}</td><td colspan="6" class="sheet-meta">项目周期：{{ budget.period }}</td></tr>
              <tr><td colspan="9" class="sheet-meta">合作多方：{{ budget.partners }}</td><td colspan="6" class="sheet-meta">执行金额截止日期：{{ budget.executionCutoff }}</td></tr>
              <tr><td colspan="15" class="sheet-meta">金额单位：元</td></tr>
              <tr class="sheet-columns"><th v-for="label in budget.columns" :key="label">{{ label }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in budget.rows" :key="row.id" :class="'sheet-row-' + row.kind">
                <template v-if="row.kind === 'total'"><th colspan="4">合计金额</th></template>
                <template v-else-if="row.kind === 'group' || row.kind === 'activity'">
                  <td>{{ row.code }}</td><td colspan="3" :class="{ 'sheet-description': row.kind === 'activity' || row.code.indexOf('产出') === 0 }">{{ row.name }}</td>
                </template>
                <template v-else>
                  <td>{{ row.code }}</td><td>{{ row.name }}</td><td class="sheet-description">{{ row.detail }}</td><td>{{ row.type }}</td>
                </template>
                <td v-for="(amount, quarterIndex) in row.quarters" :key="'q' + quarterIndex">{{ amount }}</td>
                <td class="sheet-budget-total">{{ row.total }}</td>
                <td>{{ row.adjustment == null ? '/' : row.adjustment }}</td><td>{{ row.adjustmentRatio == null ? '/' : row.adjustmentRatio }}</td><td>{{ row.adjustmentDetail == null ? '/' : row.adjustmentDetail }}</td><td>{{ row.adjustedBudget == null ? '/' : row.adjustedBudget }}</td><td class="sheet-executed">{{ row.executed == null ? '/' : row.executed }}</td><td class="sheet-ratio">{{ row.executionRatio == null ? '/' : row.executionRatio }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <a-empty v-else class="budget-tab-empty" :description="title + '暂无示例数据'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
export default {
  name: 'BudgetPrototype',
  props: {
    projectName: { type: String, default: '项目名称' },
    budget: { type: Object, required: true }
  },
  data () { return { activeTab: '0' } }
}
</script>

<style scoped>
.budget-prototype { min-width: 0; padding-bottom: 24px; }
.budget-prototype >>> .ant-tabs-bar { margin-bottom: 24px; }
.budget-prototype >>> .ant-tabs-tab { margin-right: 0; padding: 18px 28px; }
.budget-sheet-scroll { max-width: 100%; margin: 0 24px; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 12px; }
.budget-sheet-scroll:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.budget-sheet { width: 1650px; min-width: 1650px; max-width: none; table-layout: fixed; border-collapse: collapse; color: #111; background: #fff; font-size: 12px; line-height: 1.35; }
.budget-sheet th, .budget-sheet td { border: 1px solid #222; padding: 7px 6px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
.budget-sheet .sheet-project { height: 32px; }
.budget-sheet .sheet-heading { height: 56px; background: #f2f2f2; }
.sheet-heading span { color: #f5222d; }
.budget-sheet .sheet-meta { height: 32px; text-align: left; font-weight: 400; }
.sheet-columns { height: 56px; background: #f2f2f2; }
.budget-sheet .sheet-description { text-align: left; white-space: pre-line; }
.sheet-row-total { background: #fce4e8; font-weight: 700; }
.sheet-row-group { background: #efffce; font-weight: 700; }
.sheet-row-activity { background: #d6f2fc; }
.budget-sheet .sheet-budget-total { background: #f4eafd; }
.budget-sheet .sheet-executed { background: #e5ffff; }
.budget-sheet .sheet-ratio { background: #fff3e2; }
.sheet-row-total .sheet-budget-total, .sheet-row-total .sheet-executed, .sheet-row-total .sheet-ratio { background: inherit; }
.budget-tab-empty { padding: 50px 0; }
</style>
