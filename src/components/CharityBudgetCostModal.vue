<template>
  <a-modal :visible="visible" :title="title" :width="550" :mask-closable="false" :keyboard="false" wrap-class-name="charity-cost-modal standard-form-modal standard-edit-scope standard-edit-modal" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @cancel="close">
    <div class="budget-modal-form charity-cost-form">
      <template v-if="kind === 'activity'"><label class="budget-readonly-label">产出活动</label><div class="budget-readonly-value">{{ context.activityName }}</div></template>
      <template v-if="kind === 'activity'">
        <label for="charity-cost-type">费用类型</label><a-select id="charity-cost-type" v-model="form.type" dropdown-class-name="standard-edit-dropdown" placeholder="请选择费用类型" @change="typeChanged"><a-select-option v-for="item in activityTypes" :key="item">{{ item }}</a-select-option></a-select>
      </template>
      <label for="charity-cost-subject">预算科目</label><div>
        <a-input v-if="kind === 'support'" id="charity-cost-subject" v-model="form.name" :max-length="200" placeholder="请填写具体的行政费用" />
        <a-select v-else id="charity-cost-subject" v-model="subject" style="width: 100%" dropdown-class-name="standard-edit-dropdown" placeholder="请选择预算科目"><a-select-option v-for="item in subjects" :key="item">{{ item }}</a-select-option><a-select-option value="__custom__">自定义</a-select-option></a-select>
        <a-input v-if="kind !== 'support' && subject === '__custom__'" v-model="form.name" class="charity-custom-subject" :max-length="200" placeholder="请填写预算科目" aria-label="自定义预算科目" />
      </div>
      <template v-if="kind !== 'activity'"><label class="budget-readonly-label">费用类型</label><div class="budget-readonly-value">{{ kind === 'support' ? '执行机构管理费' : '运营人员成本' }}</div></template>
      <label>预算明细</label><div class="charity-cost-detail">
        <div class="charity-cost-pair"><a-input-number v-model="form.price" :min="0.01" :max="1000000000" :precision="2" placeholder="明细单价" aria-label="明细单价" /><span>元 ×</span><a-input-number v-model="form.quantity" :min="0.01" :max="1000000000" :precision="2" placeholder="明细数量" aria-label="明细数量" /></div>
        <a-input v-model="form.unit" :max-length="20" placeholder="填写单位，如：人、项、次" aria-label="单位" />
        <a-textarea v-model="form.description" :rows="3" :max-length="3000" placeholder="可补充预算明细说明" aria-label="预算明细说明" />
      </div>
      <label class="budget-readonly-label">{{ kind === 'activity' ? '筹款预算总计' : '预算总计' }}</label><div class="budget-readonly-value">{{ money(total) }} 元</div>
      <template v-if="kind === 'support'"><label class="budget-readonly-label">管理费合计占比</label><div class="budget-readonly-value">{{ (management.ratio * 100).toFixed(2) }}%</div></template>
      <a-alert v-if="error" class="charity-cost-error" type="error" show-icon :message="error" />
    </div>
    <template slot="footer"><a-button v-if="form.id" type="danger" class="charity-cost-delete" @click="remove">删除</a-button><a-button @click="close">取消</a-button><a-button type="primary" :disabled="addDisabled" @click="submit">{{ form.id ? '保存' : '添加' }}</a-button></template>
  </a-modal>
</template>

<script>
import { money } from '../mock/project-drafts'
import { budgetQuarterTotal } from '../utils/project-budget-data'
import { charityActivitySubjects, charityPersonnelSubjects, charityCostAmount, charityManagementRatio, charityPersonnelActivityTotal, validateCharityCost } from '../utils/charity-budget-editor'
const blank = () => ({ name: '', type: undefined, price: null, quantity: null, unit: '', description: '', quarters: [0, 0, 0, 0] })
export default {
  name: 'CharityBudgetCostModal',
  data () { return { visible: false, kind: 'support', form: blank(), subject: undefined, context: {}, budget: { rows: [], personnel: [], legacyPersonnel: [] }, error: '' } },
  computed: {
    title () { return (this.form.id ? '编辑' : '添加') + (this.kind === 'support' ? '执行机构管理费' : this.kind === 'personnel' ? '人员成本' : '活动费用') },
    activityTypes () { const types = Object.keys(charityActivitySubjects); return this.form.type && !types.includes(this.form.type) ? types.concat(this.form.type) : types },
    subjects () { return this.kind === 'personnel' ? charityPersonnelSubjects : charityActivitySubjects[this.form.type] || [] },
    total () { return charityCostAmount(this.form) },
    addDisabled () { return this.kind === 'support' && !this.form.id && charityPersonnelActivityTotal(this.budget) <= 0 },
    management () { return charityManagementRatio(this.budget, this.record()) }
  },
  methods: {
    money,
    open (kind, context, budget, row) {
      this.kind = kind; this.context = context || {}; this.budget = budget
      this.form = { ...blank(), ...(row ? JSON.parse(JSON.stringify(row)) : {}) }
      if (kind === 'personnel' && this.form.price == null && this.form.monthly != null) { this.form.price = this.form.monthly; this.form.quantity = this.form.months; this.form.unit = this.form.unit || '月' }
      if (kind !== 'activity') this.form.type = kind === 'support' ? '执行机构管理费' : '运营人员成本'
      this.subject = this.subjects.includes(this.form.name) ? this.form.name : row ? '__custom__' : undefined
      this.error = ''; this.visible = true
    },
    close () { this.visible = false },
    typeChanged () { this.subject = undefined; this.form.name = '' },
    record () {
      const row = { ...this.form, name: this.kind === 'support' || this.subject === '__custom__' ? this.form.name : this.subject || '',
        kind: this.kind === 'support' ? 'support' : 'activity', type: this.kind === 'support' ? '执行机构管理费' : this.kind === 'personnel' ? '运营人员成本' : this.form.type,
        outputId: this.context.outputId || this.form.outputId || null, activityId: this.context.activityId || this.form.activityId || null }
      if (budgetQuarterTotal(row) !== this.total) row.quarters = [this.total, 0, 0, 0]
      if (this.kind === 'personnel') { row.monthly = row.price; row.months = row.quantity; row.charityCost = true }
      return row
    },
    submit () {
      if (this.addDisabled) return
      const row = this.record()
      this.error = validateCharityCost(row)
      if (!this.error && this.kind === 'support' && this.management.invalid) this.error = '管理费合计占比不能超过5%，请检查'
      if (this.error) return
      row.name = row.name.trim(); row.unit = row.unit.trim(); row.price = Number(row.price); row.quantity = Number(row.quantity)
      this.$emit('save', { row, personnel: this.kind === 'personnel' }); this.close()
    },
    remove () { this.$confirm({ title: '删除这条费用明细？', content: '暂存或完成后保存本次删除。', maskClosable: false, keyboard: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { this.$emit('remove', { id: this.form.id, personnel: this.kind === 'personnel' }); this.close() } }) }
  }
}
</script>

<style>
.charity-cost-modal .charity-cost-detail { display: grid; gap: 10px; }
.charity-cost-modal .charity-cost-pair { display: flex; align-items: center; gap: 6px; }
.charity-cost-modal .charity-cost-pair > span { white-space: nowrap; }
.charity-cost-modal .charity-cost-pair .ant-input-number { flex: 1; min-width: 0; width: auto; }
.charity-cost-modal .charity-custom-subject { margin-top: 10px; }
.charity-cost-modal .charity-cost-error { grid-column: 1 / -1; }
.charity-cost-modal .charity-cost-delete { margin-right: auto; }
</style>
