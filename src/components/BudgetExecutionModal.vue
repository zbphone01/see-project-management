<template>
  <a-modal :visible="visible" :title="personnelAdjustment ? '调整人员预算' : costAdjustment ? (row.kind === 'support' ? '调整支撑费用预算' : '调整活动预算') : adjustment ? '预算调整' : '填写执行额'" :width="550" :mask-closable="false" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @cancel="close">
    <div v-if="personnelAdjustment" class="budget-modal-form">
      <label>姓名</label><a-input :value="row.name" disabled />
      <label>人力成本总额</label><div class="execution-amount-control"><a-input :value="money(total)" disabled /><span>元</span></div>
      <label>本项目人力占比</label><div class="execution-amount-control"><a-input-number v-model="adjustmentInput.ratio" :min="0" :max="100" :precision="0" :step="1" placeholder="请填写整数百分比" aria-label="本项目人力占比" /><span>%</span></div>
      <label>预算调整金额</label><div class="personnel-adjustment-amount"><a-select v-model="adjustmentDirection" dropdown-class-name="standard-edit-dropdown" placeholder="请选择" aria-label="预算调整方向"><a-select-option value="increase">增加</a-select-option><a-select-option value="decrease">减少</a-select-option></a-select><div class="execution-amount-control"><a-input-number v-model="amount" :min="0" :max="1000000000" :precision="2" placeholder="填写预算调整金额" aria-label="预算调整金额" /><span>元</span></div></div>
      <label>调整后人力成本总额</label><div class="execution-amount-control"><a-input :value="adjustedAmount == null ? '' : money(adjustedAmount)" placeholder="填写预算调整金额后自动计算" disabled /><span>元</span></div>
      <label>人力成本分期</label><div class="adjustment-inputs"><div v-for="(label, index) in quarterLabels" :key="label" class="execution-amount-control"><a-input-number v-model="adjustmentInput.quarters[index]" :min="0" :max="1000000000" :precision="2" :placeholder="label + '金额，支持2位小数'" :aria-label="label + '调整后人力成本金额'" /><span>元</span></div></div>
      <label>人力成本分期合计</label><div class="execution-amount-control"><a-input :value="money(personnelQuarterTotal)" disabled /><span>元</span></div>
      <label>备注</label><a-input :value="row.remark || '—'" disabled />
      <a-alert v-if="error" style="grid-column: 1 / -1" type="error" show-icon :message="error" />
    </div>
    <div v-else-if="row" class="budget-modal-form">
      <label>预算编号</label><a-input :value="code" disabled />
      <label>预算科目</label><a-input :value="row.name" disabled />
      <label>预算合计</label><div class="execution-amount-control"><a-input :value="money(executionBudget)" disabled /><span>元</span><span v-if="usesAdjustedBudget">（调整后）</span></div>
      <template v-if="costAdjustment"><label :style="costAdjustment ? { order: 60 } : null">执行金额</label><div class="execution-amount-control" :style="costAdjustment ? { order: 60 } : null"><a-input :value="currentExecuted == null ? '/' : money(currentExecuted)" disabled /><span>元</span></div></template>
      <label for="execution-amount" :style="costAdjustment ? { order: 40 } : null">{{ adjustment ? '预算调整金额' : '执行额' }}</label><div class="execution-amount-control" :style="costAdjustment ? { order: 40 } : null"><a-input v-if="costAdjustment" id="execution-amount" :value="adjustmentAmount == null ? '/' : (adjustmentAmount > 0 ? '+' : '') + adjustmentAmount.toFixed(2)" disabled /><a-input-number v-else id="execution-amount" v-model="amount" :min="adjustment ? -1000000000 : 0" :max="1000000000" :precision="2" :placeholder="adjustment ? '填写预算调整金额，可正可负' : '填写执行额'" /><span>元</span></div>
      <template v-if="costAdjustment">
        <label :style="costAdjustment ? { order: 20 } : null">预算调整后金额</label><div class="execution-amount-control" :style="costAdjustment ? { order: 20 } : null"><a-input :value="adjustedAmount == null ? '/' : money(adjustedAmount)" disabled /><span>元</span></div>
        <label :style="costAdjustment ? { order: 50 } : null">预算调整比例</label><a-input :style="costAdjustment ? { order: 50 } : null" :value="adjustmentRatio" disabled />
        <label :style="costAdjustment ? { order: 10 } : null">预算调整明细</label><div class="adjustment-inputs" :class="{ 'activity-adjustment-detail': activityLayout }" :style="costAdjustment ? { order: 10 } : null"><div :class="activityLayout ? 'adjustment-cost-pair' : 'execution-amount-control'"><a-input-number v-model="adjustmentInput.price" :min="0.01" :max="1000000000" :precision="2" placeholder="请填写单价" aria-label="调整明细单价" /><span>{{ activityLayout ? '元 ×' : '元' }}</span><a-input-number v-if="activityLayout" v-model="adjustmentInput.quantity" :min="0.01" :max="1000000000" :precision="2" placeholder="明细数量" aria-label="调整明细数量" /></div><a-input-number v-if="!activityLayout" v-model="adjustmentInput.quantity" :min="0.01" :max="1000000000" :precision="2" placeholder="请填写数量" aria-label="调整明细数量" /><a-input v-model="adjustmentInput.unit" :max-length="20" placeholder="量词，如：只" aria-label="调整明细量词" /><a-textarea v-model="adjustmentInput.description" :rows="3" :max-length="3000" placeholder="请对明细进行说明" aria-label="调整明细说明" /></div>
        <label :style="costAdjustment ? { order: 30 } : null">分期预算</label><div class="adjustment-inputs" :style="costAdjustment ? { order: 30 } : null"><div v-for="(label, index) in quarterLabels" :key="label" class="execution-amount-control"><a-input-number v-model="adjustmentInput.quarters[index]" :min="0" :max="1000000000" :precision="2" :placeholder="label + '金额，支持2位小数'" :aria-label="label + '调整后预算金额'" /><span>元</span></div></div>
      </template>
      <template v-else-if="adjustment"><label for="adjustment-detail">预算调整明细</label><a-textarea id="adjustment-detail" v-model="detail" :rows="3" placeholder="请填写预算调整明细" /></template>
      <a-alert v-if="error" :style="{ gridColumn: '1 / -1', order: costAdjustment ? 70 : 0 }" type="error" show-icon :message="error" />
    </div>
    <template slot="footer"><a-button v-if="adjustment && hasExistingAdjustment" type="danger" class="adjustment-delete" @click="removeAdjustment">删除</a-button><a-button @click="close">取消</a-button><a-button type="primary" @click="submit">{{ personnelAdjustment ? '完成' : costAdjustment ? (hasExistingAdjustment ? '保存' : '添加') : '确定' }}</a-button></template>
  </a-modal>
</template>
<script>
import { money } from '../mock/project-drafts'
import { budgetQuarterTotal, budgetPersonnelAmount, budgetBaseAmount, hasBudgetAdjustment } from '../utils/project-budget-data'
import { executionError, activityAdjustmentError } from '../utils/report-budget'
const emptyAdjustment = () => ({ price: null, quantity: null, unit: '', description: '', quarters: [null, null, null, null] })
export default {
  name: 'BudgetExecutionModal',
  props: { latestExecution: { type: Function, default: row => row.executed } },
  mounted () { window.addEventListener('storage', this.refreshExecution) },
  beforeDestroy () { window.removeEventListener('storage', this.refreshExecution) },
  data () { return { executionTick: 0, visible: false, row: null, code: '', personnel: false, adjustment: false, amount: null, adjustmentDirection: undefined, detail: '', error: '', adjustmentInput: emptyAdjustment(), quarterLabels: ['第一期', '第二期', '第三期', '第四期'] } },
  computed: {
    hasExistingAdjustment () { return hasBudgetAdjustment(this.row) },
    personnelAdjustment () { return this.adjustment && this.personnel && !!this.row },
    personnelQuarterTotal () { return budgetQuarterTotal(this.adjustmentInput) },
    total () { return this.row ? budgetBaseAmount(this.row) : 0 },
    usesAdjustedBudget () { return !this.adjustment && this.row && this.row.adjustment != null && this.row.adjustedBudget != null },
    executionBudget () { return this.usesAdjustedBudget ? this.row.adjustedBudget : this.total },
    activityLayout () { return this.costAdjustment && this.row.kind === 'activity' },
    costAdjustment () { return this.adjustment && !this.personnel && this.row && ['support', 'activity'].includes(this.row.kind) },
    currentExecuted () { this.executionTick; return this.row ? this.latestExecution(this.row, this.personnel) : null },
    adjustmentAmount () { return this.costAdjustment ? (this.adjustedAmount == null ? null : Math.round((this.adjustedAmount - this.total) * 100) / 100) : this.personnelAdjustment ? (this.adjustmentDirection ? Number(this.amount) * (this.adjustmentDirection === 'decrease' ? -1 : 1) : null) : this.amount },
    adjustedAmount () {
      if (this.costAdjustment) { const input = this.adjustmentInput; return input.price == null || input.price === '' || input.quantity == null || input.quantity === '' ? null : Math.round(Number(input.price) * Number(input.quantity) * 100) / 100 }
      if (this.personnelAdjustment && !this.adjustmentDirection) return null
      return this.amount == null || this.amount === '' ? null : Math.round((this.total + Number(this.adjustmentAmount)) * 100) / 100 },
    adjustmentRatio () { if (this.adjustedAmount == null || !this.total) return '/'; const ratio = Number(this.adjustmentAmount) / this.total * 100; return (ratio > 0 ? '+' : '') + ratio.toFixed(0) + '%' }
  },
  methods: {
    money,
    refreshExecution () { this.executionTick++ },
    open (row, code, personnel = false, adjustment = false) { this.row = row; this.refreshExecution(); this.code = code; this.personnel = personnel; this.adjustment = adjustment; this.amount = adjustment ? row.adjustment : row.executed; this.detail = row.adjustmentDetail || ''; this.adjustmentInput = row.adjustmentInput ? JSON.parse(JSON.stringify(row.adjustmentInput)) : emptyAdjustment(); if (this.personnelAdjustment) { this.adjustmentDirection = !this.hasExistingAdjustment ? undefined : row.adjustment < 0 ? 'decrease' : 'increase'; this.amount = !this.hasExistingAdjustment ? null : Math.abs(row.adjustment); this.adjustmentInput = { ratio: row.ratio, quarters: (row.quarters || [null, null, null, null]).slice(), ...(row.adjustmentInput || {}) } }; this.error = ''; this.visible = true },
    close () { this.visible = false },
    removeAdjustment () {
      if (!this.adjustment || !this.hasExistingAdjustment) return
      this.$confirm({ title: '删除该预算项的调整？', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => {
        this.refreshExecution()
        const row = { ...this.row, executed: this.currentExecuted, adjustment: null, adjustedBudget: null, adjustmentDetail: null }
        delete row.adjustmentInput
        this.error = this.currentExecuted == null ? '' : executionError(this.currentExecuted, row, this.personnel)
        if (this.error) return
        this.$emit('save', { row, personnel: this.personnel }); this.close()
      } })
    },
    submit () {
      this.refreshExecution()
      if (this.personnelAdjustment) {
        const valid = value => value != null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000000000 && Number(Number(value).toFixed(2)) === Number(value)
        if (!valid(this.adjustmentInput.ratio) || !Number.isInteger(Number(this.adjustmentInput.ratio)) || Number(this.adjustmentInput.ratio) > 100) this.error = '本项目人力占比须为 0–100% 的整数百分比'
        else if (!this.adjustmentDirection || !valid(this.amount)) this.error = '请选择增加或减少，并填写有效的预算调整金额，最多两位小数'
        else if (this.adjustedAmount < 0 || this.adjustedAmount > 1000000000) this.error = '调整后人力成本总额须为 0 至 10 亿元'
        else if (this.adjustmentInput.quarters.length !== 4 || this.adjustmentInput.quarters.some(value => !valid(value))) this.error = '请填写四期金额，不承担费用的期数填写 0'
        else if (this.personnelQuarterTotal !== this.adjustedAmount) this.error = '人力成本分期合计与调整后人力成本总额不一致'
        else this.error = ''
        const updated = { ...this.row, executed: this.currentExecuted, adjustment: this.adjustmentAmount, adjustedBudget: this.adjustedAmount, adjustmentInput: { ratio: Number(this.adjustmentInput.ratio), quarters: this.adjustmentInput.quarters.map(Number) } }
        if (!this.error && this.currentExecuted != null) this.error = executionError(this.currentExecuted, updated, true)
        if (this.error) return
        this.$emit('save', { row: updated, personnel: true }); this.close(); return
      }
      if (this.costAdjustment) {
        this.error = activityAdjustmentError({ ...this.row, executed: this.currentExecuted }, { ...this.adjustmentInput, amount: this.adjustmentAmount })
        if (this.error) return
        const input = { ...this.adjustmentInput, price: Number(this.adjustmentInput.price), quantity: Number(this.adjustmentInput.quantity), quarters: this.adjustmentInput.quarters.map(Number), description: this.adjustmentInput.description.trim() }
        this.$emit('save', { row: { ...this.row, executed: this.currentExecuted, adjustment: this.adjustmentAmount, adjustedBudget: this.adjustedAmount, adjustmentInput: input, adjustmentDetail: money(input.price) + '元 × ' + input.quantity.toFixed(2) + input.unit + '\n\n' + input.description }, personnel: false }); this.close(); return
      }
      this.error = this.adjustment ? (this.amount == null || this.amount === '' || !Number.isFinite(Number(this.amount)) || Math.abs(Number(this.amount)) > 1000000000 || Number(Number(this.amount).toFixed(2)) !== Number(this.amount) || this.total + Number(this.amount) < 0 ? '请填写有效的预算调整金额，最多两位小数，调整后预算不能为负数' : !this.detail.trim() ? '请填写预算调整明细' : '') : executionError(this.amount, this.row, this.personnel)
      const updated = this.adjustment ? { ...this.row, adjustment: Number(this.amount), adjustedBudget: Math.round((this.total + Number(this.amount)) * 100) / 100, adjustmentDetail: this.detail.trim() } : { ...this.row, executed: Number(this.amount) }
      if (!this.error && this.adjustment && updated.executed != null) this.error = executionError(updated.executed, updated, this.personnel)
      if (this.error) return
      this.$emit('save', { row: updated, personnel: this.personnel }); this.close()
    }
  }
}
</script>

<style scoped>
.adjustment-delete { margin-right: auto; }
.execution-amount-control { display: flex; align-items: center; gap: 8px; }
.execution-amount-control >>> .ant-input-number { flex: 1; width: 0; min-width: 0; }
.execution-amount-control > span { flex: none; }
.adjustment-inputs { display: grid; gap: 12px; }
.adjustment-inputs > .ant-input-number { width: 100%; }
.personnel-adjustment-amount { display: flex; align-items: center; gap: 8px; }
.personnel-adjustment-amount > .ant-select { flex: 0 0 92px; width: 92px; }
.personnel-adjustment-amount > .execution-amount-control { flex: 1; min-width: 0; }
.activity-adjustment-detail { gap: 10px; }
.adjustment-cost-pair { display: flex; align-items: center; gap: 6px; }
.adjustment-cost-pair > span { white-space: nowrap; }
.adjustment-cost-pair >>> .ant-input-number { flex: 1; min-width: 0; width: auto; }
.budget-modal-form >>> .ant-input[disabled] { color: rgba(0, 0, 0, 0.65); -webkit-text-fill-color: rgba(0, 0, 0, 0.65); }
</style>
