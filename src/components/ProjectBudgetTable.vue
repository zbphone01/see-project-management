<template>
  <table class="budget-edit-table" :class="{ 'donation-budget': donationProject, 'charity-budget-table': charityHeader, 'budget-black-amounts': blackAmounts, 'budget-has-adjustment': hasAdjustment }" :style="{ minWidth: tableWidth + 'px' }">
    <colgroup><col v-for="(width, index) in widths" :key="index" :style="{ width: (width / tableWidth * 100) + '%' }" /></colgroup>
    <thead>
      <template v-if="charityHeader">
        <tr><th :colspan="columns.length" class="budget-title"><strong>北京市企业家环保基金会</strong><br />“{{ displayMetadata.projectName || '未填写' }}” <strong>项目预算表 / 执行情况表 / 预算调整表</strong></th></tr>
        <tr><td :colspan="columns.length" class="budget-meta">执行机构：{{ displayMetadata.organization || '未填写' }}</td></tr>
        <tr><td :colspan="columns.length" class="budget-meta">筹款周期：{{ displayMetadata.fundraisingPeriod || '未填写' }}</td></tr>
        <tr><td colspan="8" class="budget-meta">执行周期：{{ displayMetadata.period || '未填写' }}</td><td colspan="4" class="budget-meta">预算调整时间：{{ displayMetadata.adjustmentDate || '无' }}</td><td colspan="2" class="budget-meta">执行填写时间：{{ displayMetadata.executionFilledAt || '无' }}</td></tr>
      </template>
      <template v-else>
      <tr><th :colspan="columns.length">{{ displayMetadata.projectName || '未填写' }}</th></tr>
      <tr><th :colspan="columns.length" class="budget-title">{{ title }}<span v-if="audit" class="budget-audit-status">（待审核）</span></th></tr>
      <tr><td colspan="8" class="budget-meta">编制单位（全称）：{{ displayMetadata.organization || '未填写' }}</td><td :colspan="columns.length - 8" class="budget-meta">项目周期：{{ displayMetadata.period || '未填写' }}</td></tr>
      <tr><td colspan="8" class="budget-meta">合作多方：{{ displayMetadata.partners || '无' }}</td><td :colspan="columns.length - 8" class="budget-meta">执行金额截止日期：<template v-if="executionMode"><a-date-picker :value="displayMetadata.executionCutoff && displayMetadata.executionCutoff !== '无' ? displayMetadata.executionCutoff : null" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :locale="dateLocale" :allow-clear="false" :open="dateOpen" @openChange="dateOpen = $event" @change="selectDate"><button slot="default" slot-scope="picker" type="button" :class="displayMetadata.executionCutoff && displayMetadata.executionCutoff !== '无' ? 'budget-subject-link' : 'ant-btn budget-add-button'" @click="dateOpen = true">{{ displayMetadata.executionCutoff && displayMetadata.executionCutoff !== '无' ? displayMetadata.executionCutoff : '选择日期' }}</button></a-date-picker></template><template v-else>{{ displayMetadata.executionCutoff || '无' }}</template></td></tr>
      </template>
      <tr v-if="!charityHeader"><td :colspan="columns.length" class="budget-meta">金额单位：元</td></tr>
      <tr class="budget-columns"><th v-for="label in columns" :key="label">{{ label }}</th></tr>
    </thead>
    <tbody>
      <tr v-for="row in tableRows" :key="row.key" :class="['budget-row-' + row.kind, { 'charity-fundraising-total': charityHeader && row.key === 'total', 'charity-budget-group': charityHeader && (row.key === 'support' || row.key === 'personnel' || row.key.indexOf('output:') === 0) }]">
        <td v-if="row.kind === 'action'" :colspan="columns.length" class="budget-add-cell"><div class="budget-add-content"><a-button class="budget-add-button" :disabled="!!row.disabled" @click="$emit('add-cost', row)">{{ row.action }}</a-button><span>{{ row.note }}</span></div></td>
        <template v-else-if="charityHeader">
          <th v-if="row.kind === 'total'" colspan="5" class="budget-description">{{ row.name || '合计金额' }}</th>
          <td v-else-if="row.kind === 'group' || row.kind === 'activity' || row.mergeLeading" colspan="5" class="budget-description">{{ row.code }} {{ row.name }}</td>
          <template v-else>
            <td class="budget-description"><button v-if="!readonly && row.cost && row.charityEditable !== false" type="button" class="budget-subject-link" @click="$emit('edit-cost', row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td>{{ row.type || '/' }}</td>
            <td>{{ row.detailParts.quantity == null ? '/' : quantity(row.detailParts.quantity) }}</td><td>{{ row.detailParts.unit || '/' }}</td><td>{{ optionalMoney(row.detailParts.price) }}</td>
          </template>
          <td class="budget-number">{{ optionalMoney(row.initialTotal) }}</td>
          <td class="budget-number">
            <button v-if="agreementMode && row.agreementKey" type="button" class="budget-subject-link" @click="$emit('edit-agreement', row)">{{ row.agreementAmount == null ? '填写金额' : money(row.agreementAmount) }}</button>
            <span v-else-if="agreementMode && row.agreementAmount == null && ['charity-allocation', 'charity-incentives'].includes(row.key)">填写后计算</span>
            <template v-else>{{ optionalMoney(row.agreementAmount == null ? row.cost && row.cost.agreementAmount : row.agreementAmount) }}</template>
          </td>
          <td :class="{ 'budget-description': !blankAgreementDetails && (row.detailParts.price !== undefined || !!row.detailParts.text) }"><template v-if="blankAgreementDetails">/</template><template v-else-if="row.detailParts.price != null"><div>{{ money(row.detailParts.price) }}元 × {{ quantity(row.detailParts.quantity) }}{{ row.detailParts.unit }}</div><p v-if="row.detailParts.description" class="budget-detail-note">{{ row.detailParts.description }}</p></template><template v-else>{{ optionalValue(row.detailParts.text) }}</template></td>
          <td class="budget-number" :class="adjustmentColor(row.adjustment)">{{ signedAdjustment(row.adjustment) }}</td>
          <td :class="{ 'budget-description': row.adjustmentParts.price !== undefined || optionalValue(row.adjustmentParts.text) !== '/' }"><template v-if="row.adjustmentParts.price !== undefined"><div>{{ money(row.adjustmentParts.price) }}元 × {{ quantity(row.adjustmentParts.quantity) }}{{ row.adjustmentParts.unit }}</div><p v-if="row.adjustmentParts.description" class="budget-detail-note">{{ row.adjustmentParts.description }}</p></template><template v-else>{{ optionalValue(row.adjustmentParts.text) }}</template></td>
          <td :class="{ 'budget-ratio-increase': parseFloat(row.adjustmentRatio) > 0, 'budget-ratio-decrease': parseFloat(row.adjustmentRatio) < 0 }">{{ optionalValue(row.adjustmentRatio) }}</td>
          <td class="budget-number">{{ optionalMoney(row.adjustedBudget) }}</td><td class="budget-number">{{ optionalMoney(row.executed) }}</td><td>{{ optionalValue(row.executionRatio) }}</td>
        </template>
        <template v-else>
          <th v-if="row.kind === 'total'" colspan="4">合计金额</th>
          <template v-else-if="row.kind === 'group' || row.kind === 'activity'"><td>{{ row.code }}</td><td colspan="3" :class="{ 'budget-description': row.outputId }">{{ row.name }}</td></template>
          <template v-else><td>{{ row.code }}</td><td><button v-if="!readonly && row.cost" type="button" class="budget-subject-link" @click="$emit('edit-cost', row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td :class="{ 'budget-description': row.key !== 'personnel-detail' }"><template v-if="row.detailParts.price !== undefined"><div>{{ money(row.detailParts.price) }}元 × {{ quantity(row.detailParts.quantity) }}{{ row.detailParts.unit }}</div><p v-if="row.detailParts.description" class="budget-detail-note">{{ row.detailParts.description }}</p></template><template v-else>{{ row.detailParts.text }}</template></td><td>{{ row.type }}</td></template>
          <td v-for="(amount, index) in row.quarters" :key="index" class="budget-number"><span class="budget-number-content">{{ money(amount) }}</span></td><td v-if="hasInitialBudget" class="budget-number budget-initial-column"><span class="budget-number-content">{{ money(row.initialTotal) }}</span></td><td class="budget-number budget-total-column"><a-popconfirm v-if="!readonly && row.kind === 'total' && !donationProject" :visible="mismatchVisible" :trigger="[]" placement="bottom" title="预算合计金额与申请SEE资金金额不一致，请检查费用明细。" ok-text="确定" :cancel-button-props="{ style: { display: 'none' } }" @confirm="$emit('dismiss-mismatch')" @visibleChange="onMismatchVisibleChange"><span ref="budgetGrandTotal" class="budget-number-content" tabindex="-1">{{ money(row.total) }}</span></a-popconfirm><span v-else class="budget-number-content">{{ money(row.total) }}</span></td><td :class="[adjustmentColor(showExecution || adjustmentMode ? row.adjustment : null), { 'budget-number': showExecution }]"><button v-if="adjustmentMode && row.cost" type="button" :class="row.adjustment == null ? 'ant-btn budget-add-button budget-execution-button' : 'budget-subject-link'" @click="$emit('edit-adjustment', row)">{{ row.adjustment == null ? '预算调整' : signedAdjustment(row.adjustment) }}</button><template v-else>{{ showExecution ? signedAdjustment(row.adjustment) : '/' }}</template></td><td :class="{ 'budget-ratio-increase': showExecution && parseFloat(row.adjustmentRatio) > 0, 'budget-ratio-decrease': showExecution && parseFloat(row.adjustmentRatio) < 0 }">{{ showExecution ? optionalValue(row.adjustmentRatio) : '/' }}</td><td :class="{ 'budget-description': showExecution && (row.adjustmentParts.price !== undefined || optionalValue(row.adjustmentParts.text) !== '/') }"><template v-if="showExecution && row.adjustmentParts.price !== undefined"><div>{{ money(row.adjustmentParts.price) }}元 × {{ quantity(row.adjustmentParts.quantity) }}{{ row.adjustmentParts.unit }}</div><p v-if="row.adjustmentParts.description" class="budget-detail-note">{{ row.adjustmentParts.description }}</p></template><template v-else>{{ showExecution ? optionalValue(row.adjustmentParts.text) : '/' }}</template></td><td class="budget-adjusted-column" :class="{ 'budget-number': showExecution }">{{ showExecution ? optionalMoney(row.adjustedBudget) : '/' }}</td><td class="budget-executed-column" :class="{ 'budget-number': showExecution }"><button v-if="executionMode && row.cost" type="button" :class="row.executed == null ? 'ant-btn budget-add-button budget-execution-button' : 'budget-subject-link'" @click="$emit('edit-execution', row)">{{ row.executed == null ? '填写执行额' : money(row.executed) }}</button><template v-else>{{ showExecution ? optionalMoney(row.executed) : '/' }}</template></td><td class="budget-ratio-column">{{ showExecution ? optionalValue(row.executionRatio) : '/' }}</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { budgetWidths, budgetColumns, budgetDetailParts } from '../utils/project-budget'
import { budgetAdjustmentParts, progressBudgetDisplayRows } from '../utils/project-budget-data'
import { charityBudgetWidths } from '../utils/charity-budget-review-data'
import { money } from '../mock/project-drafts'
import dateLocale from 'ant-design-vue/es/date-picker/locale/zh_CN'

const charityColumns = ['预算科目', '费用类型', '数量', '单位', '单价', '上线筹款预算', '协议签署金额', '协议签署科目明细', '预算调整金额', '预算调整明细', '预算调整\n比例', '预算调整后金额', '执行金额', '执行率']

export function measureCharityBudgetWidths (rows) {
  // 基础列宽按联合公益查看原型标注，金额较长时继续按内容撑宽。
  const widths = measureBudgetWidths(rows.map(row => ({ ...row, hasInitialBudget: false })))
  const result = charityBudgetWidths.slice()
  result[8] = Math.max(result[8], widths[9])
  result[11] = Math.max(result[11], widths[12])
  result[12] = Math.max(result[12], widths[13])
  const cells = []
  rows.filter(row => row.kind === 'detail').forEach(row => {
    const parts = row.previousDetailParts || budgetDetailParts(row)
    if (parts.quantity != null) cells.push({ index: 2, text: Number(parts.quantity).toFixed(2) })
    if (parts.price != null) cells.push({ index: 4, text: money(parts.price) })
  })
  return measureNumberWidths(result, cells)
}

export function measureBudgetWidths (rows, progressReport = false) {
  if (progressReport) rows = progressBudgetDisplayRows(rows)
  const hasInitialBudget = rows.some(row => row.hasInitialBudget)
  const widths = budgetWidths.slice()
  if (hasInitialBudget) widths.splice(8, 0, 100)
  const cells = []
  rows.filter(row => row.kind !== 'action').forEach(row => {
    const values = row.quarters.concat(hasInitialBudget ? [row.initialTotal] : [], [row.total, row.adjustment, null, null, row.adjustedBudget, row.executed])
    values.forEach((value, index) => {
      if (value === null || value === undefined) return
      cells.push({ index: index + 4, text: money(value) })
    })
  })
  return measureNumberWidths(widths, cells)
}

function measureNumberWidths (widths, cells) {
  const measure = document.createElement('canvas').getContext('2d')
  if (!measure) return widths
  const family = window.getComputedStyle(document.body).fontFamily
  const fontSize = window.getComputedStyle(document.documentElement).getPropertyValue('--text-13').trim()
  // 分期金额、数量及单价共用测量，保留基础列宽，兼容常规和加粗数字。
  cells.forEach(cell => {
    ;[400, 700].forEach(weight => {
      measure.font = weight + ' ' + fontSize + ' ' + family
      widths[cell.index] = Math.max(widths[cell.index], Math.ceil(measure.measureText(cell.text).width) + 12)
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
    charityHeader: { type: Boolean, default: false },
    agreementMode: { type: Boolean, default: false },
    blankAgreementDetails: { type: Boolean, default: false },
    readonly: { type: Boolean, default: true },
    blackAmounts: { type: Boolean, default: false },
    showExecution: { type: Boolean, default: false },
    progressReport: { type: Boolean, default: false },
    executionMode: { type: Boolean, default: false },
    adjustmentMode: { type: Boolean, default: false },
    audit: { type: Boolean, default: false },
    mismatchVisible: { type: Boolean, default: false }
  },
  data () { return { dateLocale, dateOpen: false } },
  computed: {
    hasAdjustment () { return this.rows.some(row => row.hasBudgetAdjustment || row.hasInitialBudget) },
    hasInitialBudget () { return this.rows.some(row => row.hasInitialBudget) },
    columns () { if (this.charityHeader) return charityColumns; const columns = budgetColumns.slice(); if (this.hasInitialBudget) columns.splice(8, 0, '初始预算合计'); return columns },
    displayMetadata () { return Object.keys(this.metadata).reduce((result, key) => { result[key] = typeof this.metadata[key] === 'string' ? this.metadata[key].replace(/（自动获取）/g, '') : this.metadata[key]; return result }, {}) },
    title () { return this.displayMetadata.tableTitle || '项目预算及执行情况明细表' },
    tableRows () {
      const rows = this.progressReport ? progressBudgetDisplayRows(this.rows) : this.rows
      return rows.filter(row => !this.readonly || row.kind !== 'action').map(row => ({ ...row, adjustment: row.hasBudgetAdjustment ? row.adjustment : null, adjustmentRatio: row.hasBudgetAdjustment ? row.adjustmentRatio : null, detailParts: row.cost && row.cost.charityAutomatic ? { price: row.cost.price, quantity: row.cost.quantity, unit: row.cost.unit } : row.previousDetailParts || budgetDetailParts(row), adjustmentParts: !row.hasBudgetAdjustment ? { text: '' } : budgetAdjustmentParts(row) }))
    },
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) }
  },
  methods: {
    money,
    adjustmentColor (value) { return value > 0 ? 'budget-adjustment-increase' : value < 0 ? 'budget-adjustment-decrease' : '' },
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
.charity-budget-table .budget-columns th { white-space: pre-line; }
.budget-edit-table .budget-description { text-align: left; white-space: pre-line; }
.budget-row-total { background: #FFE3E7; font-weight: 700; }
.budget-row-group { background: #EDFFCE; font-weight: 700; }
.budget-row-activity { background: #D4F2FF; }
.budget-row-detail { background: #fff; }
.charity-budget-table .budget-row-detail { height: 50px; }
.budget-number { color: #02A7F0; white-space: nowrap; }
.budget-number-content { display: flex; align-items: center; justify-content: center; min-height: 23px; line-height: 20px; }
.budget-row-detail .budget-number { color: #70B603; }
.budget-edit-table .budget-total-column { background: #F5E9FF; color: #02A7F0; }
.budget-has-adjustment .budget-total-column { background: transparent; }
.budget-has-adjustment .budget-adjusted-column { background: #F5E9FF; }
.budget-edit-table .budget-row-total > th, .budget-edit-table .budget-row-total > td { background: #FFE3E7; }
.charity-budget-table .charity-fundraising-total, .charity-budget-table .charity-fundraising-total > th, .charity-budget-table .charity-fundraising-total > td { background: #EDFFCE; }
.charity-budget-table .charity-budget-group { background: #D4F2FF; }
.charity-budget-table .budget-row-activity { background: #EEFAFF; }
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
.budget-add-button[disabled], .budget-add-button[disabled]:hover, .budget-add-button[disabled]:focus { background: #f5f5f5; border-color: #d9d9d9; color: rgba(0, 0, 0, .25); cursor: not-allowed; }
.budget-add-content > span { display: flex; align-items: center; min-height: 32px; min-width: 0; color: #AAAAAA; line-height: 20px; }
.budget-black-amounts, .budget-black-amounts .budget-number, .budget-black-amounts .budget-total-column { color: #000; }
.budget-ratio-increase { color: #f5222d; }
.budget-ratio-decrease { color: #70b603; }
.budget-edit-table .budget-adjustment-increase, .budget-edit-table .budget-adjustment-increase .budget-subject-link { color: #F5222D; }
.budget-edit-table .budget-adjustment-decrease, .budget-edit-table .budget-adjustment-decrease .budget-subject-link { color: #70B603; }
</style>
