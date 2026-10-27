<template>
  <div class="budget-edit-page" :style="context ? { minWidth: (tableWidth + 42) + 'px' } : null">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section v-if="context" class="panel budget-edit-panel">
      <header class="budget-page-header"><div><h1>{{ draft.name || '项目名称' }}</h1><span>{{ draft.code }}</span></div><span class="budget-state">{{ status }}</span></header>
      <div class="budget-editor-scroll">
        <table class="budget-edit-table" :class="{ 'donation-budget': donationProject }" :style="{ width: tableWidth + 'px' }">
          <colgroup><col v-for="(width, index) in widths" :key="index" :style="{ width: width + 'px' }" /></colgroup>
          <thead>
            <tr><th colspan="15">{{ draft.name || '项目名称' }}</th></tr>
            <tr><th colspan="15" class="budget-title">{{ title }}</th></tr>
            <tr><td colspan="9" class="budget-meta">编制单位（全称）：{{ draft.organization || '未填写' }}</td><td colspan="6" class="budget-meta">项目周期：{{ draft.start || '未填写' }} 至 {{ draft.end || '未填写' }}</td></tr>
            <tr><td colspan="9" class="budget-meta">合作多方：{{ (draft.thirdParties || []).join('、') || '无' }}</td><td colspan="6" class="budget-meta">执行金额截止日期：无</td></tr>
            <tr><td colspan="15" class="budget-meta">金额单位：元</td></tr>
            <tr class="budget-columns"><th v-for="label in columns" :key="label">{{ label }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="row.key" :class="'budget-row-' + row.kind">
              <td v-if="row.kind === 'action'" colspan="15" class="budget-add-cell"><div class="budget-add-content"><a-button class="budget-add-button" @click="addCost(row)">{{ row.action }}</a-button><span>{{ row.note }}</span></div></td>
              <template v-else>
                <th v-if="row.kind === 'total'" colspan="4">合计金额</th>
                <template v-else-if="row.kind === 'group' || row.kind === 'activity'"><td>{{ row.code }}</td><td colspan="3" :class="{ 'budget-description': row.outputId }">{{ row.name }}</td></template>
                <template v-else><td>{{ row.code }}</td><td><button v-if="!readonly && row.cost" type="button" class="budget-subject-link" @click="editCost(row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td class="budget-description"><template v-if="row.cost"><div>{{ money(row.cost.price) }}元 × {{ row.cost.quantity }}{{ row.cost.unit }}</div><p v-if="row.cost.description" class="budget-detail-note">{{ row.cost.description }}</p></template><template v-else>{{ row.description }}</template></td><td>{{ row.type }}</td></template>
                <td v-for="(amount, index) in row.quarters" :key="index" class="budget-number"><span class="budget-number-content">{{ money(amount) }}</span></td><td class="budget-number budget-total-column"><a-popconfirm v-if="row.kind === 'total' && !donationProject" :visible="budgetMismatchVisible" :trigger="[]" placement="bottom" title="预算合计金额与申请SEE资金金额不一致，请检查费用明细。" ok-text="确定" :cancel-button-props="{ style: { display: 'none' } }" @confirm="budgetMismatchVisible = false" @visibleChange="onBudgetMismatchVisibleChange"><span ref="budgetGrandTotal" class="budget-number-content" tabindex="-1">{{ money(row.total) }}</span></a-popconfirm><span v-else class="budget-number-content">{{ money(row.total) }}</span></td><td>/</td><td>/</td><td>/</td><td>/</td><td class="budget-executed-column">/</td><td class="budget-ratio-column">/</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <footer v-if="!readonly" class="budget-page-actions"><a-button @click="save('editing')">暂存</a-button><a-button type="primary" @click="save('completed')">完成</a-button></footer>
    </section>
    <section v-else class="panel budget-unavailable"><a-empty :description="loadError || '请从项目信息编辑页进入预算表'" /></section>
    <budget-cost-modal ref="costModal" @save="saveCost" @remove="removeCost" />
  </div>
</template>

<script>
import BudgetCostModal from '../components/BudgetCostModal.vue'
import { money, roundMoney, clone } from '../mock/project-drafts'
import { budgetWidths, budgetColumns, budgetStatus, canViewBudget, budgetKey, readBudgetContext, readSavedBudget, saveBudgetSheet, emptyBudget, rowTotal, validateCost, validatePersonnel, readBudgetWorking, writeBudgetWorking, clearBudgetWorking, buildBudgetRows, normalizeBudget } from '../utils/project-budget'
export default {
  name: 'ProjectBudgetForm',
  components: { BudgetCostModal },
  data () { return { context: null, budget: { rows: [], personnel: [] }, snapshot: '', loadError: '', budgetMismatchVisible: false, columns: budgetColumns } },
  computed: {
    key () { return budgetKey(this.$route) },
    draft () { return this.context ? this.context.draft : {} },
    donationProject () { return this.$route.query.budgetType === 'donation' },
    readonly () { return this.$route.query.mode === 'view' },
    status () { return budgetStatus(this.budget) },
    title () { return this.donationProject ? '北京市企业家环保基金会联合公益项目预算表' : '项目预算及执行情况明细表' },
    widths () {
      const widths = budgetWidths.slice()
      const amounts = this.tableRows.filter(row => row.kind !== 'action')
      const measure = document.createElement('canvas').getContext('2d')
      if (!measure) return widths
      const family = window.getComputedStyle(document.body).fontFamily
      // 用实际格式化金额测量常规、加粗两种文字，保留原列宽作为下限。
      for (let index = 4; index <= 8; index++) {
        amounts.forEach(row => {
          const text = money(index === 8 ? row.total : row.quarters[index - 4])
          ;[400, 700].forEach(weight => {
            measure.font = weight + ' 10pt ' + family
            widths[index] = Math.max(widths[index], Math.ceil(measure.measureText(text).width) + 12)
          })
        })
      }
      return widths
    },
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) },
    dirty () { return !this.readonly && !!this.context && JSON.stringify(this.budget) !== this.snapshot },
    tableRows () { return buildBudgetRows(this.draft, this.budget, !this.readonly) }
  },
  activated () { this.load(); window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { this.budgetMismatchVisible = false; window.removeEventListener('beforeunload', this.beforeUnload); this.$refs.costModal.close() },
  beforeDestroy () { window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeRouteLeave (to, from, next) {
    if (to.name === 'project-personnel-form' && budgetKey(to) === this.key) { next(); return }
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '是否放弃已编辑内容？', content: '本次尚未暂存或完成的修改将被放弃，已保存内容不受影响。', maskClosable: false, okText: '放弃并返回', cancelText: '继续编辑', onOk: () => next(), onCancel: () => next(false) })
  },
  methods: {
    money,
    load () {
      this.context = null; this.loadError = ''; this.budgetMismatchVisible = false
      try {
        const context = readBudgetContext(this.key)
        if (!context) return
        const working = !this.readonly && readBudgetWorking(this.key)
        const budget = working ? normalizeBudget(working.budget, context.draft) : readSavedBudget(this.key) || emptyBudget(context.draft.budget, context.draft)
        if (this.readonly && !canViewBudget(budget)) { this.loadError = '预算表尚未暂存或完成，暂不可查看'; return }
        this.context = context; this.budget = budget; this.snapshot = working ? working.snapshot : JSON.stringify(budget)
        clearBudgetWorking(this.key)
      } catch (error) { this.loadError = '无法读取预算数据，请返回项目信息页重新进入。原保存内容尚未覆盖。' }
    },
    beforeUnload (event) { if (this.dirty) { event.preventDefault(); event.returnValue = '' } },
    addCost (row) {
      if (this.readonly) return
      if (row.costKind === 'personnel') {
        try {
          writeBudgetWorking(this.key, { budget: this.budget, snapshot: this.snapshot })
          this.$router.push({ name: 'project-personnel-form', params: { id: this.$route.params.id }, query: { ...this.$route.query, from: 'budget' } })
        } catch (error) { this.$message.error('无法保留当前费用，请暂存后重试') }
        return
      }
      this.$refs.costModal.open(row.costKind, row)
    },
    editCost (row) {
      const activity = this.tableRows.find(item => item.kind === 'action' && item.activityId === row.cost.activityId && item.outputId === row.cost.outputId)
      this.$refs.costModal.open(row.cost.kind, activity || row.cost, row.cost)
    },
    saveCost (row) {
      const index = this.budget.rows.findIndex(item => item.id === row.id)
      if (index < 0) this.budget.rows.push({ ...row, id: 'cost-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9) })
      else this.$set(this.budget.rows, index, row)
    },
    removeCost (id) { this.budget.rows = this.budget.rows.filter(row => row.id !== id) },
    onBudgetMismatchVisibleChange (visible) { if (!visible) this.budgetMismatchVisible = false },
    showBudgetMismatch () {
      this.budgetMismatchVisible = false
      this.$nextTick(() => {
        const ref = this.$refs.budgetGrandTotal
        const target = Array.isArray(ref) ? ref[0] : ref
        if (target) {
          target.scrollIntoView({ block: 'center', inline: 'center' })
          target.focus({ preventScroll: true })
        }
        this.budgetMismatchVisible = true
      })
    },
    save (status) {
      if (this.readonly) return
      if (status === 'completed') {
        const error = this.budget.rows.map(validateCost).find(Boolean)
        if (error) { this.$message.error(error); return }
        const personnelError = (this.budget.personnel || []).map(row => validatePersonnel(row, this.draft)).find(Boolean)
        if (personnelError) { this.$message.error(personnelError); return }
        if (this.tableRows.some(row => row.key === 'unlinked')) { this.$message.error('请先处理已删除产出活动关联的费用明细'); return }
        const total = this.tableRows.find(row => row.kind === 'total').total
        const requested = this.draft.requested
        if (!this.donationProject && (requested === null || requested === undefined || requested === '' || !Number.isFinite(Number(requested)) || roundMoney(total) !== roundMoney(requested))) {
          this.showBudgetMismatch()
          return
        }
      }
      try {
        const saved = saveBudgetSheet(this.key, this.budget, status)
        this.budget = clone(saved); this.snapshot = JSON.stringify(this.budget)
        this.$message.success(status === 'completed' ? '预算表已完成编辑并保存到当前浏览器' : '预算表已暂存到当前浏览器')
        if (status === 'completed') this.goBack()
      } catch (error) { this.$message.error(error.message && error.message.indexOf('预算已') === 0 ? error.message : '保存失败，请保留当前页面后重试') }
    },
    goBack () {
      const query = { ...this.$route.query }; delete query.mode; delete query.budgetType
      this.$router.push(this.context ? this.context.returnTo : { name: 'project-form', params: { id: this.$route.params.id }, query })
    }
  }
}
</script>

<style scoped>
.budget-edit-page { display: grid; gap: 20px; padding-bottom: 18px; min-width: 0; }
.budget-edit-panel { padding: 0 20px; min-width: 0; }
.budget-page-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 90px; padding: 20px 0; }
.budget-page-header h1 { margin: 0 0 8px; color: #18253c; font-size: 16px; font-weight: 700; overflow-wrap: anywhere; }
.budget-page-header span { color: #718095; }
.budget-state { white-space: nowrap; }
.budget-editor-scroll { overflow: visible; padding-bottom: 12px; }
.budget-edit-table { table-layout: fixed; border-collapse: collapse; color: #111; font-size: 10pt; line-height: 1.4; background: #fff; }
.budget-edit-table tr { height: 32px; }
.budget-edit-table th, .budget-edit-table td { border: 1px solid #222; padding: 4px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; font-size: inherit; }
.budget-edit-table .budget-title { background: #f2f2f2; }
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
.budget-add-button:hover, .budget-add-button:focus { background: #fff; color: #f59a23; border-color: #f59a23; }
.budget-add-content > span { display: flex; align-items: center; min-height: 32px; min-width: 0; color: #AAAAAA; line-height: 20px; }
.budget-page-actions { display: flex; justify-content: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: #fff; z-index: 3; }
.budget-page-actions .ant-btn { min-width: 100px; height: 32px; }
.budget-unavailable { padding: 40px; text-align: center; }
</style>
