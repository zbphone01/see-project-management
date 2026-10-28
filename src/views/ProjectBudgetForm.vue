<template>
  <div class="budget-edit-page" :style="context ? { minWidth: (tableWidth + 42) + 'px' } : null">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section v-if="context" class="panel budget-edit-panel">
      <header class="budget-page-header"><div><h1>{{ draft.name || '项目名称' }}</h1><span>{{ draft.code }}</span></div><span class="budget-state">{{ status }}</span></header>
      <div class="budget-editor-scroll">
        <project-budget-table ref="budgetTable" :metadata="budget.metadata" :rows="tableRows" :widths="widths" :donation-project="donationProject" :readonly="readonly" :mismatch-visible="budgetMismatchVisible" @add-cost="addCost" @edit-cost="editCost" @dismiss-mismatch="budgetMismatchVisible = false" />
      </div>
      <footer v-if="!readonly" class="budget-page-actions"><a-button @click="save('editing')">暂存</a-button><a-button type="primary" @click="save('completed')">完成</a-button></footer>
    </section>
    <section v-else class="panel budget-unavailable"><a-empty :description="loadError || '请从项目信息编辑页进入预算表'" /></section>
    <budget-cost-modal ref="costModal" @save="saveCost" @remove="removeCost" />
  </div>
</template>

<script>
import BudgetCostModal from '../components/BudgetCostModal.vue'
import ProjectBudgetTable, { measureBudgetWidths } from '../components/ProjectBudgetTable.vue'
import { money, roundMoney, clone } from '../mock/project-drafts'
import { budgetStatus, canViewBudget, budgetKey, readBudgetContext, readSavedBudget, saveBudgetSheet, emptyBudget, validateCost, validatePersonnel, readBudgetWorking, writeBudgetWorking, clearBudgetWorking, buildBudgetRows, normalizeBudget, snapshotBudget } from '../utils/project-budget'
export default {
  name: 'ProjectBudgetForm',
  components: { BudgetCostModal, ProjectBudgetTable },
  data () { return { context: null, budget: { rows: [], personnel: [] }, snapshot: '', loadError: '', budgetMismatchVisible: false } },
  computed: {
    key () { return budgetKey(this.$route) },
    draft () { return this.context ? this.context.draft : {} },
    donationProject () { return this.$route.query.budgetType === 'donation' },
    readonly () { return this.$route.query.mode === 'view' },
    status () { return budgetStatus(this.budget) },
    widths () { return measureBudgetWidths(this.tableRows) },
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) },
    dirty () { return !this.readonly && !!this.context && JSON.stringify(this.budget) !== this.snapshot },
    tableRows () { return buildBudgetRows({}, this.budget, !this.readonly) }
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
        const source = working ? normalizeBudget(working.budget) : readSavedBudget(this.key) || emptyBudget(context.draft.budget)
        const budget = this.readonly ? source : snapshotBudget(source, context.draft, this.donationProject)
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
    showBudgetMismatch () {
      this.budgetMismatchVisible = false
      this.$nextTick(() => {
        if (this.$refs.budgetTable) this.$refs.budgetTable.focusTotal()
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
      } catch (error) { this.$message.error(error.message && error.message.indexOf('预算') === 0 ? error.message : '保存失败，请保留当前页面后重试') }
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
.budget-page-header h1 { margin: 0 0 8px; color: #18253c; overflow-wrap: anywhere; }
.budget-page-header span { color: #718095; }
.budget-state { white-space: nowrap; }
.budget-editor-scroll { overflow: visible; padding-bottom: 12px; }
.budget-page-actions { display: flex; justify-content: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: #fff; z-index: 3; }
.budget-page-actions .ant-btn { min-width: 100px; height: 32px; }
.budget-unavailable { padding: 40px; text-align: center; }
</style>
