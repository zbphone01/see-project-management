<template>
  <a-modal :visible="visible" :title="title" :width="550" :mask-closable="false" wrap-class-name="budget-cost-modal standard-form-modal standard-edit-scope standard-edit-modal" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @cancel="close">
    <div class="cost-form budget-modal-form">
      <template v-if="kind === 'activity'"><label class="budget-readonly-label">产出活动</label><div class="budget-readonly-value">{{ activityName }}</div></template>
      <label for="cost-subject">预算科目</label><div>
        <a-select dropdown-class-name="standard-edit-dropdown" v-if="kind === 'support'" id="cost-subject" v-model="subject" placeholder="请选择" style="width:100%"><a-select-option v-for="item in subjects" :key="item">{{ item }}</a-select-option></a-select>
        <a-input v-else id="cost-subject" v-model="form.name" :max-length="200" placeholder="填写活动的预算具体内容" />
        <a-input v-if="kind === 'support' && subject === '其他'" v-model="form.name" class="cost-other" :max-length="200" placeholder="选择其他时填写" aria-label="其他预算科目" />
      </div>
      <label for="cost-type">费用类型</label><a-select dropdown-class-name="standard-edit-dropdown" id="cost-type" v-model="form.type" placeholder="请选择" style="width:100%"><a-select-option v-for="item in types" :key="item">{{ item }}</a-select-option></a-select>
      <label>预算明细</label><div class="cost-detail">
        <div class="cost-pair"><a-input-number v-model="form.price" :min="0.01" :max="1000000000" :precision="2" :step="0.01" placeholder="明细单价" aria-label="明细单价" /><span>元 ×</span><a-input-number v-model="form.quantity" :min="0.01" :max="1000000000" :precision="2" :step="0.01" placeholder="明细数量" aria-label="明细数量" /></div>
        <a-input v-model="form.unit" :max-length="20" placeholder="明细数量的单位量词，如：只，非必填" aria-label="量词" />
        <a-textarea v-model="form.description" :rows="3" :max-length="3000" placeholder="请对预算项明细单价和数量进行详细说明" aria-label="明细说明" aria-required="true" />
      </div>
      <label class="budget-readonly-label">预算明细合计</label><div class="budget-readonly-value">{{ money(detailAmount) }} 元</div>
      <label>分期预算</label><div class="cost-quarters"><div v-for="(label, index) in quarterLabels" :key="label"><span>{{ label }}</span><a-input-number v-model="form.quarters[index]" :min="0" :max="1000000000" :precision="2" :placeholder="label + '金额'" :aria-label="label + '金额'" /><span>元</span></div></div>
      <label class="budget-readonly-label">分期预算合计</label><div class="budget-readonly-value">{{ money(quarterAmount) }} 元</div>
      <a-alert v-if="error" class="cost-error" type="error" show-icon :message="error" />
    </div>
    <template slot="footer"><a-button v-if="form.id" type="danger" class="cost-delete" @click="remove">删除</a-button><a-button @click="close">取消</a-button><a-button type="primary" @click="submit">{{ form.id ? '保存' : '添加' }}</a-button></template>
  </a-modal>
</template>

<script>
import { clone, money } from '../mock/project-drafts'
import { costTypes, supportSubjects, rowTotal, detailTotal, validateCost } from '../utils/project-budget'
const blank = () => ({ name: '', type: undefined, price: null, quantity: null, unit: '', description: '', quarters: [null, null, null, null] })
export default {
  name: 'BudgetCostModal',
  data () { return { visible: false, kind: 'support', activityId: '', outputId: '', activityName: '', form: blank(), subject: undefined, error: '', types: costTypes, subjects: supportSubjects, quarterLabels: ['第一期', '第二期', '第三期', '第四期'] } },
  computed: {
    title () { return (this.form.id ? '编辑' : '添加') + (this.kind === 'support' ? '支撑费用' : '活动预算') },
    detailAmount () { return detailTotal(this.form) },
    quarterAmount () { return rowTotal(this.form) }
  },
  methods: {
    money,
    open (kind, context = {}, row) {
      this.kind = kind; this.activityId = context.activityId || ''; this.outputId = context.outputId || ''; this.activityName = context.activityName || ''
      this.form = row ? clone(row) : blank(); this.subject = row ? (supportSubjects.includes(row.name) ? row.name : '其他') : undefined
      this.error = ''; this.visible = true
    },
    close () { this.visible = false },
    submit () {
      const row = { ...clone(this.form), kind: this.kind, activityId: this.activityId, outputId: this.outputId }
      if (this.kind === 'support' && this.subject !== '其他') row.name = this.subject || ''
      this.error = validateCost(row)
      if (this.error) return
      row.name = row.name.trim(); row.price = Number(row.price); row.quantity = Number(row.quantity); row.quarters = row.quarters.map(Number)
      this.$emit('save', row); this.close()
    },
    remove () { this.$confirm({ title: '删除这条费用明细？', content: '暂存或完成后保存本次删除。', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { this.$emit('remove', this.form.id); this.close() } }) }
  }
}
</script>

<style>
.budget-cost-modal .cost-detail { display: grid; gap: 10px; }
.budget-cost-modal .cost-pair { display: flex; gap: 6px; align-items: center; }
.budget-cost-modal .cost-pair > span { white-space: nowrap; }
.budget-cost-modal .cost-pair .ant-input-number { flex: 1; min-width: 0; width: auto; }
.budget-cost-modal .cost-quarters { display: grid; gap: 10px; }
.budget-cost-modal .cost-quarters > div { display: flex; align-items: center; gap: 8px; }
.budget-cost-modal .cost-quarters .ant-input-number { flex: 1; min-width: 0; }
.budget-cost-modal .cost-other { margin-top: 10px; }
.budget-cost-modal .cost-error { grid-column: 1 / -1; }
.budget-cost-modal .cost-delete { margin-right: auto; }
</style>
