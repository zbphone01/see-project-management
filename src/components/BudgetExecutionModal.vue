<template>
  <a-modal :visible="visible" :title="costAdjustment ? (row.kind === 'support' ? '调整支撑费用预算' : '调整活动预算') : adjustment ? '预算调整' : '填写执行额'" :width="550" :mask-closable="false" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @cancel="close">
    <div v-if="row" class="budget-modal-form">
      <label>预算编号</label><a-input :value="code" disabled />
      <label>预算科目</label><a-input :value="row.name" disabled />
      <label>预算合计</label><div class="execution-amount-control"><a-input :value="money(executionBudget)" disabled /><span>元</span><span v-if="usesAdjustedBudget">（调整后）</span></div>
      <template v-if="costAdjustment"><label :style="activityLayout ? { order: 60 } : null">执行金额</label><div class="execution-amount-control" :style="activityLayout ? { order: 60 } : null"><a-input :value="currentExecuted == null ? '/' : money(currentExecuted)" disabled /><span>元</span></div></template>
      <label for="execution-amount" :style="activityLayout ? { order: 40 } : null">{{ adjustment ? '预算调整金额' : '执行额' }}</label><div class="execution-amount-control" :style="activityLayout ? { order: 40 } : null"><a-input v-if="costAdjustment" id="execution-amount" :value="adjustmentAmount == null ? '/' : (adjustmentAmount > 0 ? '+' : '') + adjustmentAmount.toFixed(2)" disabled /><a-input-number v-else id="execution-amount" v-model="amount" :min="adjustment ? -1000000000 : 0" :max="1000000000" :precision="2" :placeholder="adjustment ? '填写预算调整金额，可正可负' : '填写执行额'" /><span>元</span></div>
      <template v-if="costAdjustment">
        <label :style="activityLayout ? { order: 20 } : null">预算调整后金额</label><a-input :style="activityLayout ? { order: 20 } : null" :value="adjustedAmount == null ? '/ 元' : money(adjustedAmount) + ' 元'" disabled />
        <label :style="activityLayout ? { order: 50 } : null">预算调整比例</label><a-input :style="activityLayout ? { order: 50 } : null" :value="adjustmentRatio" disabled />
        <label :style="activityLayout ? { order: 10 } : null">预算调整明细</label><div class="adjustment-inputs" :class="{ 'activity-adjustment-detail': activityLayout }" :style="activityLayout ? { order: 10 } : null"><div :class="activityLayout ? 'adjustment-cost-pair' : 'execution-amount-control'"><a-input-number v-model="adjustmentInput.price" :min="0.01" :max="1000000000" :precision="2" placeholder="请填写单价" aria-label="调整明细单价" /><span>{{ activityLayout ? '元 ×' : '元' }}</span><a-input-number v-if="activityLayout" v-model="adjustmentInput.quantity" :min="0.01" :max="1000000000" :precision="2" placeholder="明细数量" aria-label="调整明细数量" /></div><a-input-number v-if="!activityLayout" v-model="adjustmentInput.quantity" :min="0.01" :max="1000000000" :precision="2" placeholder="请填写数量" aria-label="调整明细数量" /><a-input v-model="adjustmentInput.unit" :max-length="20" placeholder="量词，如：只" aria-label="调整明细量词" /><a-textarea v-model="adjustmentInput.description" :rows="3" :max-length="3000" placeholder="请对明细进行说明" aria-label="调整明细说明" /></div>
        <label :style="activityLayout ? { order: 30 } : null">分期预算</label><div class="adjustment-inputs" :style="activityLayout ? { order: 30 } : null"><div v-for="(label, index) in quarterLabels" :key="label" class="execution-amount-control"><a-input-number v-model="adjustmentInput.quarters[index]" :min="0" :max="1000000000" :precision="2" :placeholder="label + '金额，支持2位小数'" :aria-label="label + '调整后预算金额'" /><span>元</span></div></div>
      </template>
      <template v-else-if="adjustment"><label for="adjustment-detail">预算调整明细</label><a-textarea id="adjustment-detail" v-model="detail" :rows="3" placeholder="请填写预算调整明细" /></template>
      <a-alert v-if="error" :style="{ gridColumn: '1 / -1', order: activityLayout ? 70 : 0 }" type="error" show-icon :message="error" />
    </div>
    <template slot="footer"><a-button @click="close">取消</a-button><a-button type="primary" @click="submit">{{ costAdjustment ? (row && row.adjustment != null ? '保存' : '添加') : '确定' }}</a-button></template>
  </a-modal>
</template>
<script>
import { money } from '../mock/project-drafts'
import { budgetQuarterTotal, budgetPersonnelAmount } from '../utils/project-budget-data'
import { executionError, activityAdjustmentError } from '../utils/report-budget'
const emptyAdjustment = () => ({ price: null, quantity: null, unit: '', description: '', quarters: [null, null, null, null] })
export default {
  name: 'BudgetExecutionModal',
  props: { latestExecution: { type: Function, default: row => row.executed } },
  mounted () { window.addEventListener('storage', this.refreshExecution) },
  beforeDestroy () { window.removeEventListener('storage', this.refreshExecution) },
  data () { return { executionTick: 0, visible: false, row: null, code: '', personnel: false, adjustment: false, amount: null, detail: '', error: '', adjustmentInput: emptyAdjustment(), quarterLabels: ['第一期', '第二期', '第三期', '第四期'] } },
  computed: {
    total () { return this.row ? (this.personnel ? budgetPersonnelAmount(this.row) : budgetQuarterTotal(this.row)) : 0 },
    usesAdjustedBudget () { return !this.adjustment && this.row && this.row.adjustment != null && this.row.adjustedBudget != null },
    executionBudget () { return this.usesAdjustedBudget ? this.row.adjustedBudget : this.total },
    activityLayout () { return this.costAdjustment && this.row.kind === 'activity' },
    costAdjustment () { return this.adjustment && !this.personnel && this.row && ['support', 'activity'].includes(this.row.kind) },
    currentExecuted () { this.executionTick; return this.row ? this.latestExecution(this.row, this.personnel) : null },
    adjustmentAmount () { return this.costAdjustment ? (this.adjustedAmount == null ? null : Math.round((this.adjustedAmount - this.total) * 100) / 100) : this.amount },
    adjustedAmount () {
      if (this.costAdjustment) { const input = this.adjustmentInput; return input.price == null || input.price === '' || input.quantity == null || input.quantity === '' ? null : Math.round(Number(input.price) * Number(input.quantity) * 100) / 100 }
      return this.amount == null || this.amount === '' ? null : Math.round((this.total + Number(this.amount)) * 100) / 100 },
    adjustmentRatio () { if (this.adjustedAmount == null || !this.total) return '/'; const ratio = Number(this.adjustmentAmount) / this.total * 100; return (ratio > 0 ? '+' : '') + ratio.toFixed(0) + '%' }
  },
  methods: {
    money,
    refreshExecution () { this.executionTick++ },
    open (row, code, personnel = false, adjustment = false) { this.row = row; this.refreshExecution(); this.code = code; this.personnel = personnel; this.adjustment = adjustment; this.amount = adjustment ? row.adjustment : row.executed; this.detail = row.adjustmentDetail || ''; this.adjustmentInput = row.adjustmentInput ? JSON.parse(JSON.stringify(row.adjustmentInput)) : emptyAdjustment(); this.error = ''; this.visible = true },
    close () { this.visible = false },
    submit () {
      this.refreshExecution()
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
.execution-amount-control { display: flex; align-items: center; gap: 8px; }
.execution-amount-control >>> .ant-input-number { flex: 1; width: 0; min-width: 0; }
.execution-amount-control > span { flex: none; }
.adjustment-inputs { display: grid; gap: 12px; }
.adjustment-inputs > .ant-input-number { width: 100%; }
.activity-adjustment-detail { gap: 10px; }
.adjustment-cost-pair { display: flex; align-items: center; gap: 6px; }
.adjustment-cost-pair > span { white-space: nowrap; }
.adjustment-cost-pair >>> .ant-input-number { flex: 1; min-width: 0; width: auto; }
.budget-modal-form >>> .ant-input[disabled] { color: rgba(0, 0, 0, 0.65); -webkit-text-fill-color: rgba(0, 0, 0, 0.65); }
</style>
