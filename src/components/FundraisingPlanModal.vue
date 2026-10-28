<template>
  <a-modal v-model="visible" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :title="editingId ? '编辑筹款规划' : '新建筹款规划'" :width="550" :mask-closable="false" ok-text="确定" cancel-text="取消" @ok="save" @cancel="close">
    <a-form class="plan-form" :hide-required-mark="true" :colon="false" @submit.prevent="save">
      <a-form-item label="筹款规划名称" :validate-status="errors.name ? 'error' : ''" :help="errors.name">
        <a-input v-model="draft.name" aria-label="筹款规划名称" placeholder="输入名称" />
      </a-form-item>
      <a-form-item label="规划申请限制" :validate-status="errors.restriction ? 'error' : ''" :help="errors.restriction">
        <a-select dropdown-class-name="standard-edit-dropdown" v-model="draft.restriction" aria-label="规划申请限制" placeholder="请选择">
          <a-select-option value="公开">公开 - 所有部门皆可申请</a-select-option>
          <a-select-option v-for="department in departments" :key="department" :value="department">{{ department }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="筹款目标额" :validate-status="errors.targetAmount ? 'error' : ''" :help="errors.targetAmount">
        <div class="plan-amount-input"><a-input-number v-model="draft.targetAmount" aria-label="筹款目标额（元）" :min="0.01" :max="999999999999.99" :precision="2" placeholder="填写金额" /><span>元</span></div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { planDepartments, createFundraisingPlans, appendFundraisingPlan, validatePlan } from '../mock/fundraising-plans'

export default {
  name: 'FundraisingPlanModal',
  data () {
    return { visible: false, departments: planDepartments, editingId: null, draft: { name: '', restriction: '公开', targetAmount: null }, errors: {} }
  },
  methods: {
    open (record) {
      if (record && !record.editable) return
      this.editingId = record ? record.id : null
      this.draft = record ? { name: record.name, restriction: record.restriction, targetAmount: record.targetAmount } : { name: '', restriction: '公开', targetAmount: null }
      this.errors = {}; this.visible = true
    },
    close () { this.visible = false; this.errors = {} },
    save () {
      this.errors = validatePlan(this.draft)
      if (Object.keys(this.errors).length) return
      const values = { name: this.draft.name.trim(), restriction: this.draft.restriction, targetAmount: this.draft.targetAmount }
      const plans = createFundraisingPlans()
      if (this.editingId) {
        const index = plans.findIndex(plan => plan.id === this.editingId && plan.editable)
        if (index < 0) { this.$message.warning('当前规划不可编辑'); return }
        this.$set(plans, index, Object.assign({}, plans[index], values))
      } else appendFundraisingPlan(values)
      this.close()
      this.$emit('saved')
      this.$message.success('已保存本地演示，刷新后恢复')
    }
  }
}
</script>

<style scoped>
.plan-form { width: 470px; max-width: 100%; margin: 0 auto; padding: 0; }
.plan-form >>> .ant-form-item { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 18px; align-items: start; margin-bottom: 16px; }
.plan-form >>> .ant-form-item::before, .plan-form >>> .ant-form-item::after { display: none; }
.plan-form >>> .ant-form-item:last-child { margin-bottom: 0; }
.plan-form >>> .ant-form-item-label { min-height: 40px; line-height: 40px; text-align: right; white-space: nowrap; }
.plan-form >>> .ant-form-item-label > label { color: #27384e; }
.plan-form >>> .ant-form-item-label > label::after { display: none; }
.plan-form >>> .ant-form-item-control { line-height: 40px; }
.plan-form >>> .ant-form-item-children { display: block; line-height: 0; }
.plan-form >>> .ant-form-item-control-wrapper { min-width: 0; }
.plan-form >>> .ant-input, .plan-form >>> .ant-input-number, .plan-form >>> .ant-select { width: 100%; }
.plan-form >>> .ant-input, .plan-form >>> .ant-input-number, .plan-form >>> .ant-select-selection--single { height: 40px; }
.plan-form >>> .ant-input-number-input { height: 38px; }
.plan-form >>> .ant-select-selection__rendered { line-height: 38px; }
.plan-form >>> input::placeholder, .plan-form >>> .ant-select-selection__placeholder { color: #5b8ff9; opacity: 1; }
.plan-amount-input { display: flex; align-items: center; gap: 10px; line-height: 22px; }
.plan-amount-input .ant-input-number { flex: 1; min-width: 0; }
</style>
