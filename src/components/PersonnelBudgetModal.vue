<template>
  <a-modal :visible="visible" title="编辑人员预算" :width="550" :mask-closable="false" wrap-class-name="personnel-budget-modal standard-form-modal standard-edit-scope standard-edit-modal" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @cancel="close">
    <div class="personnel-form budget-modal-form">
      <label class="budget-readonly-label">姓名</label><div class="budget-readonly-value">{{ form.name }}</div>
      <label class="budget-readonly-label">职务</label><div class="budget-readonly-value">{{ form.position }}</div>
      <label>人员性质</label><a-select dropdown-class-name="standard-edit-dropdown" v-model="form.nature" placeholder="请选择人员性质"><a-select-option v-for="item in natures" :key="item">{{ item }}</a-select-option></a-select>
      <label class="budget-readonly-label">工作内容</label><div class="budget-readonly-value">{{ form.responsibilities }}</div>
      <label>月人力成本</label><div class="amount-input"><a-input-number v-model="form.monthly" :min="0" :max="1000000000" :precision="2" placeholder="请填写月人力成本" aria-label="月人力成本" /><span>元</span></div>
      <label>承担月份数</label><div class="amount-input"><a-input-number v-model="form.months" :min="0" :max="1200" :precision="0" placeholder="请填写承担月份数" aria-label="承担月份数" /><span>月</span></div>
      <label class="budget-readonly-label">人力成本总额</label><div class="budget-readonly-value"><span v-if="costFilled">{{ money(total) }} 元</span><span v-else class="budget-input-hint">填写月成本和月份数后自动计算</span></div>
      <label>本项目人力占比</label><div><div class="amount-input"><a-input-number v-model="form.ratio" :min="0" :max="100" :precision="2" placeholder="请填写本项目人力占比" aria-label="本项目人力占比" /><span>%</span></div><small>该员工在本项目中承担的工作量占该员工劳力的人力成本比例</small></div>
      <label>人力成本分期</label><div class="quarters"><div v-for="(label, index) in labels" :key="label" class="amount-input"><span>{{ label }}</span><a-input-number v-model="form.quarters[index]" :min="0" :max="1000000000" :precision="2" :placeholder="'请填写' + label + '金额'" :aria-label="label + '金额'" /><span>元</span></div></div>
      <label class="budget-readonly-label">人力成本分期合计</label><div class="budget-readonly-value"><span v-if="quartersFilled">{{ money(quarterTotal) }} 元</span><span v-else class="budget-input-hint">填写四期金额后自动计算</span></div>
      <label>备注</label><a-select dropdown-class-name="standard-edit-dropdown" v-model="form.remark" placeholder="请选择备注" allow-clear><a-select-option value="专职">专职</a-select-option><a-select-option value="兼职">兼职</a-select-option></a-select>
      <a-alert v-if="error" class="form-error" type="error" show-icon :message="error" />
    </div>
    <template slot="footer"><a-button @click="close">取消</a-button><a-button type="primary" @click="submit">完成</a-button></template>
  </a-modal>
</template>
<script>
import { clone, money } from '../mock/project-drafts'
import { personnelAmount, rowTotal, validatePersonnel } from '../utils/project-budget'
export default {
  name: 'PersonnelBudgetModal',
  props: { project: { type: Object, required: true } },
  data () { return { visible: false, error: '', form: { quarters: [null, null, null, null] }, natures: ['项目人员', '行政管理人员'], labels: ['第一期', '第二期', '第三期', '第四期'] } },
  computed: {
    costFilled () { return ['monthly', 'months'].every(key => this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== '') },
    quartersFilled () { return this.form.quarters.every(value => value !== null && value !== undefined && value !== '') },
    total () { return personnelAmount(this.form) }, quarterTotal () { return rowTotal(this.form) } },
  methods: {
    money,
    open (row) { this.form = clone(row); this.error = ''; this.visible = true },
    close () { this.visible = false },
    submit () { this.error = validatePersonnel(this.form, this.project); if (this.error) return; this.$emit('save', clone(this.form)); this.close() }
  }
}
</script>
<style>
.personnel-budget-modal .amount-input { display: flex; align-items: center; gap: 8px; }
.personnel-budget-modal .ant-input-number { width: 100%; flex: 1; min-width: 0; }
.personnel-budget-modal .quarters { display: grid; gap: 10px; }
.personnel-budget-modal .amount-input span { white-space: nowrap; }
.personnel-budget-modal small { display: block; margin-top: 6px; color: #718095; }
.personnel-budget-modal .form-error { grid-column: 1 / -1; }
</style>
