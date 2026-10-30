<template>
  <table class="budget-edit-table" :class="{ 'donation-budget': donationProject, 'budget-black-amounts': blackAmounts }" :style="{ minWidth: tableWidth + 'px' }">
    <colgroup><col v-for="(width, index) in widths" :key="index" :style="{ width: (width / tableWidth * 100) + '%' }" /></colgroup>
    <thead>
      <tr><th colspan="15">{{ metadata.projectName || '未填写' }}</th></tr>
      <tr><th colspan="15" class="budget-title">{{ title }}<span v-if="audit" class="budget-audit-status">（待审核）</span></th></tr>
      <tr><td colspan="9" class="budget-meta">编制单位（全称）：{{ metadata.organization || '未填写' }}</td><td colspan="6" class="budget-meta">项目周期：{{ metadata.period || '未填写' }}</td></tr>
      <tr><td colspan="9" class="budget-meta">合作多方：{{ metadata.partners || '无' }}</td><td colspan="6" class="budget-meta">执行金额截止日期：<template v-if="executionMode"><a-date-picker :value="metadata.executionCutoff && metadata.executionCutoff !== '无' ? metadata.executionCutoff : null" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :locale="dateLocale" :allow-clear="false" :open="dateOpen" @openChange="dateOpen = $event" @change="selectDate"><button slot="default" slot-scope="picker" type="button" :class="metadata.executionCutoff && metadata.executionCutoff !== '无' ? 'budget-subject-link' : 'ant-btn budget-add-button'" @click="dateOpen = true">{{ metadata.executionCutoff && metadata.executionCutoff !== '无' ? metadata.executionCutoff : '选择日期' }}</button></a-date-picker></template><template v-else>{{ metadata.executionCutoff || '无' }}</template></td></tr>
      <tr><td colspan="15" class="budget-meta">金额单位：元</td></tr>
      <tr class="budget-columns"><th v-for="label in columns" :key="label">{{ label }}</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in tableRows" :key="row.key" :class="'budget-row-' + row.kind">
        <td v-if="row.kind === 'action'" colspan="15" class="budget-add-cell"><div class="budget-add-content"><a-button class="budget-add-button" @click="$emit('add-cost', row)">{{ row.action }}</a-button><span>{{ row.note }}</span></div></td>
        <template v-else>
          <th v-if="row.kind === 'total'" colspan="4">合计金额</th>
          <template v-else-if="row.kind === 'group' || row.kind === 'activity'"><td>{{ row.code }}</td><td colspan="3" :class="{ 'budget-description': row.outputId }">{{ row.name }}</td></template>
          <template v-else><td>{{ row.code }}</td><td><button v-if="!readonly && row.cost" type="button" class="budget-subject-link" @click="$emit('edit-cost', row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td :class="{ 'budget-description': row.key !== 'personnel-detail' }"><template v-if="row.detailParts.price !== undefined"><div>{{ money(row.detailParts.price) }}元 × {{ quantity(row.detailParts.quantity) }}{{ row.detailParts.unit }}</div><p v-if="row.detailParts.description" class="budget-detail-note">{{ row.detailParts.description }}</p></template><template v-else>{{ row.detailParts.text }}</template></td><td>{{ row.type }}</td></template>
          <td v-for="(amount, index) in row.quarters" :key="index" class="budget-number"><span class="budget-number-content">{{ money(amount) }}</span></td><td class="budget-number budget-total-column"><a-popconfirm v-if="!readonly && row.kind === 'total' && !donationProject" :visible="mismatchVisible" :trigger="[]" placement="bottom" title="预算合计金额与申请SEE资金金额不一致，请检查费用明细。" ok-text="确定" :cancel-button-props="{ style: { display: 'none' } }" @confirm="$emit('dismiss-mismatch')" @visibleChange="onMismatchVisibleChange"><span ref="budgetGrandTotal" class="budget-number-content" tabindex="-1">{{ money(row.total) }}</span></a-popconfirm><span v-else class="budget-number-content">{{ money(row.total) }}</span></td><td :class="{ 'budget-number': showExecution }"><button v-if="adjustmentMode && row.cost" type="button" :class="row.adjustment == null ? 'ant-btn budget-add-button budget-execution-button' : 'budget-subject-link'" @click="$emit('edit-adjustment', row)">{{ row.adjustment == null ? '预算调整' : signedAdjustment(row.adjustment) }}</button><template v-else>{{ showExecution ? signedAdjustment(row.adjustment) : '/' }}</template></td><td :class="{ 'budget-ratio-increase': showExecution && parseFloat(row.adjustmentRatio) > 0, 'budget-ratio-decrease': showExecution && parseFloat(row.adjustmentRatio) < 0 }">{{ showExecution ? optionalValue(row.adjustmentRatio) : '/' }}</td><td :class="{ 'budget-description': showExecution && optionalValue(row.adjustmentDetail || (row.cost && row.cost.adjustmentDetail)) !== '/' }">{{ showExecution ? optionalValue(row.adjustmentDetail || (row.cost && row.cost.adjustmentDetail)) : '/' }}</td><td :class="{ 'budget-number': showExecution }">{{ showExecution ? optionalMoney(row.adjustedBudget) : '/' }}</td><td class="budget-executed-column" :class="{ 'budget-number': showExecution }"><button v-if="executionMode && row.cost" type="button" :class="row.executed == null ? 'ant-btn budget-add-button budget-execution-button' : 'budget-subject-link'" @click="$emit('edit-execution', row)">{{ row.executed == null ? '填写执行额' : money(row.executed) }}</button><template v-else>{{ showExecution ? optionalMoney(row.executed) : '/' }}</template></td><td class="budget-ratio-column">{{ showExecution ? optionalValue(row.executionRatio) : '/' }}</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { budgetWidths, budgetColumns, budgetDetailParts } from '../utils/project-budget'
import { money } from '../mock/project-drafts'
import dateLocale from 'ant-design-vue/es/date-picker/locale/zh_CN'

export function measureBudgetWidths (rows) {
  const widths = budgetWidths.slice()
  const measure = document.createElement('canvas').getContext('2d')
  if (!measure) return widths
  const family = window.getComputedStyle(document.body).fontFamily
  const fontSize = window.getComputedStyle(document.documentElement).getPropertyValue('--text-13').trim()
  // 编辑与查看共用金额测量，保留原列宽下限，兼容常规和加粗金额。
  rows.filter(row => row.kind !== 'action').forEach(row => {
    const values = row.quarters.concat([row.total, row.adjustment, null, null, row.adjustedBudget, row.executed])
    values.forEach((value, index) => {
      if (value === null || value === undefined) return
      ;[400, 700].forEach(weight => {
        measure.font = weight + ' ' + fontSize + ' ' + family
        widths[index + 4] = Math.max(widths[index + 4], Math.ceil(measure.measureText(money(value)).width) + 12)
      })
    })
  })
  return widths
}

export default {
  name: 'ProjectBudgetTable',
  props: {
    metadata: { type: Object, default: () => ({}) },
    rows: { type: Array, required: true },
    widths: { type: Array, required: true },
    donationProject: { type: Boolean, default: false },
    readonly: { type: Boolean, default: true },
    blackAmounts: { type: Boolean, default: false },
    showExecution: { type: Boolean, default: false },
    executionMode: { type: Boolean, default: false },
    adjustmentMode: { type: Boolean, default: false },
    audit: { type: Boolean, default: false },
    mismatchVisible: { type: Boolean, default: false }
  },
  data () { return { columns: budgetColumns, dateLocale, dateOpen: false } },
  computed: {
    title () { return this.metadata.tableTitle || '项目预算及执行情况明细表' },
    tableRows () { return this.rows.filter(row => !this.readonly || row.kind !== 'action').map(row => ({ ...row, detailParts: budgetDetailParts(row) })) },
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) }
  },
  methods: {
    money,
    signedAdjustment (value) { return value == null ? '/' : (Number(value) > 0 ? '+' : '') + money(value) },
    selectDate (value) { this.$emit('cutoff-change', value); this.dateOpen = false },
    quantity (value) { return Number(value).toFixed(2) },
    optionalMoney (value) { return value === null || value === undefined ? '/' : money(value) },
    optionalValue (value) { return value === null || value === undefined || value === '' ? '/' : value },
    onMismatchVisibleChange (visible) { if (!visible) this.$emit('dismiss-mismatch') },
    focusTotal () {
      const ref = this.$refs.budgetGrandTotal
      const target = Array.isArray(ref) ? ref[0] : ref
      if (target) {
        target.scrollIntoView({ block: 'center', inline: 'center' })
        target.focus({ preventScroll: true })
      }
    }
  }
}
</script>

<style scoped>
.budget-edit-table { width: 100%; table-layout: fixed; border-collapse: collapse; color: #111; font-size: var(--text-13); line-height: 1.4; background: #fff; }
.budget-edit-table tr { height: 32px; }
.budget-edit-table th, .budget-edit-table td { border: 1px solid #222; padding: 4px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
.budget-edit-table .budget-title { background: #f2f2f2; }
.budget-audit-status { color: #f5222d; }
.budget-edit-table .budget-meta { height: 32px; text-align: left; }
.budget-columns { background: #f2f2f2; }
.budget-edit-table .budget-description { text-align: left; white-space: pre-line; }
.budget-row-total { background: #FFE3E7; font-weight: 700; }
.budget-row-group { background: #EDFFCE; font-weight: 700; }
.budget-row-activity { background: #D4F2FF; }
.budget-row-detail { background: #fff; }
.budget-number { color: #02A7F0; white-space: nowrap; }
.budget-number-content { display: flex; align-items: center; justify-content: center; min-height: 23px; line-height: 20px; }
.budget-row-detail .budget-number { color: #70B603; }
.budget-edit-table .budget-total-column { background: #F5E9FF; color: #02A7F0; }
.budget-edit-table .budget-executed-column { background: #E7FFFF; }
.budget-edit-table .budget-ratio-column { background: #FFF3E1; }
.budget-row-total .budget-executed-column, .budget-row-total .budget-ratio-column { background: inherit; }
.budget-subject-link { padding: 0; border: 0; background: none; color: #f59a23; text-decoration: underline; cursor: pointer; font: inherit; overflow-wrap: anywhere; }
.budget-subject-link:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.budget-detail-note { margin: 8px 0 0; }
.budget-edit-table .budget-row-action { height: 56px; }
.budget-edit-table .budget-add-cell { text-align: left; }
.budget-add-content { display: flex; align-items: center; gap: 16px; padding: 0 16px; line-height: 20px; }
.budget-add-button { display: inline-flex; align-items: center; justify-content: center; flex: none; height: 32px; padding: 0 15px; background: #f59a23; border-color: #f59a23; color: #fff; font-size: inherit; line-height: 20px; }
.budget-execution-button { padding: 0 8px; }
.budget-add-button:hover, .budget-add-button:focus { background: #fff; color: #f59a23; border-color: #f59a23; }
.budget-add-content > span { display: flex; align-items: center; min-height: 32px; min-width: 0; color: #AAAAAA; line-height: 20px; }
.budget-black-amounts, .budget-black-amounts .budget-number, .budget-black-amounts .budget-total-column { color: #000; }
.budget-ratio-increase { color: #f5222d; }
.budget-ratio-decrease { color: #70b603; }
</style>
