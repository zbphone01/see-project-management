<template>
  <div class="budget-prototype" :class="{ 'budget-prototype-embedded': embedded }">
    <a-tabs v-model="activeTab" :animated="false">
      <a-tab-pane v-for="(title, index) in visibleTabs" :key="String(index)" :tab="title">
        <div v-if="index === 0" class="budget-sheet-scroll" tabindex="0" :aria-label="(donationProject ? donationBudgetTitle : '预算及执行明细表') + '，可左右滚动'">
          <table class="budget-sheet">
            <colgroup><col v-for="(width, i) in sheet.widths" :key="i" :style="{ width: width + 'px' }" /></colgroup>
            <thead>
              <tr><th colspan="15" class="sheet-project">{{ projectName }}</th></tr>
              <tr><th colspan="15" class="sheet-heading">{{ donationProject ? donationBudgetTitle : '项目预算及执行情况明细表' }} <span>{{ sheet.status }}</span></th></tr>
              <tr><td colspan="9" class="sheet-meta">编制单位（全称）：{{ sheet.organization }}</td><td colspan="6" class="sheet-meta">项目周期：{{ sheet.period }}</td></tr>
              <tr><td colspan="9" class="sheet-meta">合作多方：{{ sheet.partners }}</td><td colspan="6" class="sheet-meta">执行金额截止日期：{{ sheet.executionCutoff }}</td></tr>
              <tr><td colspan="15" class="sheet-meta">金额单位：元</td></tr>
              <tr class="sheet-columns"><th v-for="label in sheet.columns" :key="label">{{ label }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in sheet.rows" :key="row.id" :class="'sheet-row-' + row.kind">
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
        <div v-else-if="index === 1 && sharedData && normalizedBudget.personnel.length" class="budget-sheet-scroll" tabindex="0" aria-label="人力成本分摊表，可左右滚动">
          <table class="budget-sheet personnel-sheet">
            <colgroup><col v-for="(width, i) in personnelWidths" :key="i" :style="{ width: width + 'px' }" /></colgroup>
            <thead><tr><th colspan="12">{{ projectName }}</th></tr><tr class="sheet-columns"><th colspan="12">项目执行团队人力成本分摊表</th></tr><tr class="sheet-columns"><th v-for="label in personnelColumns" :key="label" :class="{ 'sheet-description': label === '在本项目中工作内容' }">{{ label }}</th></tr></thead>
            <tbody><tr v-for="row in normalizedBudget.personnel" :key="row.id"><td>{{ row.name }}</td><td>{{ row.position }}</td><td>{{ row.nature || '—' }}</td><td class="sheet-description">{{ row.responsibilities }}</td><td>{{ optionalMoney(row.executed) }}</td><td>{{ row.ratio === null ? '—' : row.ratio + '%' }}</td><td>{{ money(row.monthly) }}</td><td>{{ row.months }}</td><td>{{ money(personnelAmount(row)) }}</td><td>{{ optionalMoney(row.adjustment) }}</td><td>{{ optionalMoney(row.adjustedBudget) }}</td><td>{{ row.remark || '—' }}</td></tr>
            <tr class="sheet-row-group"><th colspan="4">总计</th><td>/</td><td>/</td><td>/</td><td>/</td><td>{{ money(personnelSum) }}</td><td>/</td><td>/</td><td>/</td></tr></tbody>
          </table>
        </div>
        <a-empty v-else class="budget-tab-empty" :description="title + '暂无示例数据'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { normalizeBudget, buildBudgetRows, budgetWidths, budgetColumns, budgetStatus, personnelAmount } from '../utils/project-budget'
import { money, roundMoney } from '../mock/project-drafts'
export default {
  name: 'BudgetPrototype',
  props: {
    sharedData: { type: Boolean, default: false },
    project: { type: Object, default: () => ({}) },
    donationProject: { type: Boolean, default: false },
    embedded: { type: Boolean, default: false },
    projectName: { type: String, default: '项目名称' },
    budget: { type: Object, required: true }
  },
  data () { return { activeTab: '0', donationBudgetTitle: '北京市企业家环保基金会联合公益项目预算表', personnelWidths: [120, 100, 100, 400, 110, 100, 100, 100, 110, 110, 110, 90], personnelColumns: ['姓名', '职务', '人员性质', '在本项目中工作内容', '执行额', '本项目人力占比（%）', '本项目承担月人力成本', '本项目承担月份数', '本项目承担人力成本总额', '预算调整金额', '调整后预算', '备注'] } },
  computed: {
    normalizedBudget () { return normalizeBudget(this.budget, this.project) },
    personnelSum () { return roundMoney(this.normalizedBudget.personnel.reduce((sum, row) => sum + personnelAmount(row), 0)) },
    visibleTabs () { if (!this.sharedData) return this.donationProject ? [this.donationBudgetTitle] : this.budget.tabs; return this.donationProject ? [this.donationBudgetTitle] : ['预算及执行明细表', '人力成本分摊表', '预算及执行汇总表', '费用类型分析表', '预算调整历史'] },
    sheet () {
      if (!this.sharedData) return { ...this.budget, status: '（待审）' }
      const budget = this.normalizedBudget, project = this.project, metadata = budget.metadata
      return {
        widths: budgetWidths, columns: budgetColumns,
        organization: project.organization || metadata.organization || '未填写',
        period: project.start && project.end ? project.start + ' 至 ' + project.end : metadata.period || '未填写',
        partners: Array.isArray(project.thirdParties) ? project.thirdParties.join('、') || '无' : metadata.partners || '无',
        executionCutoff: metadata.executionCutoff || '无', status: budgetStatus(budget),
        rows: buildBudgetRows(project, budget).map(row => ({ ...row,
          detail: row.cost && row.cost.price !== null && row.cost.quantity !== null ? money(row.cost.price) + '元 × ' + row.cost.quantity + row.cost.unit + (row.cost.description ? '\n\n' + row.cost.description : '') : row.description || '',
          quarters: row.quarters.map(money), total: money(row.total),
          adjustment: row.adjustment === null ? null : money(row.adjustment), adjustedBudget: row.adjustedBudget === null ? null : money(row.adjustedBudget), executed: row.executed === null ? null : money(row.executed)
        }))
      }
    }
  },
  methods: { money, personnelAmount, optionalMoney (value) { return value === null || value === undefined ? '/' : money(value) } }
}
</script>

<style scoped>
.budget-prototype { min-width: 0; }
.budget-prototype:not(.budget-prototype-embedded) { padding-bottom: 24px; }
.budget-prototype >>> .ant-tabs-bar { margin-bottom: 24px; }
.budget-prototype >>> .ant-tabs-tab { margin-right: 0; padding: 18px 28px; }
.budget-prototype:not(.budget-prototype-embedded) .budget-sheet-scroll { margin: 0 24px; }
.budget-sheet-scroll { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; padding-bottom: 12px; }
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
.personnel-sheet { width: 1550px; min-width: 1550px; }
.budget-tab-empty { padding: 50px 0; }
</style>
