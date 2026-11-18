<template>
  <div class="budget-edit-page" :style="context && !generatedSheet ? { minWidth: (tableWidth + 50) + 'px' } : null">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section v-if="context" class="panel budget-edit-panel">
      <header class="budget-page-header"><div><h1>{{ draft.name || draft.projectName || '项目名称' }}</h1><span>{{ draft.code || draft.projectCode }}</span></div><span class="budget-state">{{ status }}</span></header>
      <div class="budget-editor-scroll">
        <budget-summary v-if="generatedSheet === 'summary'" :budget="budget" />
        <budget-generated-table v-else-if="generatedSheet" :budget="budget" :kind="generatedSheet" />
        <project-personnel-table v-else-if="reportMode && $route.query.sheet === 'personnel'" :rows="budget.personnel" :project-name="draft.projectName" readonly show-execution :black-amounts="reportMode" :execution-mode="executionMode" :adjustment-mode="adjustmentMode" @edit-execution="openPerson($event, false)" @edit-adjustment="openPerson($event, true)" />
        <project-budget-table v-else ref="budgetTable" :metadata="budget.metadata" :rows="tableRows" :widths="widths" :donation-project="donationProject" :charity-header="charityEditor" :hide-fundraising-budget="hideFundraisingBudget" :agreement-mode="agreementMode" :agreement-cost-mode="agreementCostExample" :agreement-items-total="agreementItemsTotal" :hide-agreement-amounts="draftAgreementExample && !agreementMode && !agreementCostExample" :blank-agreement-details="agreementMode || (charityEditor && !readonly && !agreementCostExample)" :readonly="readonly || reportMode || agreementMode" @edit-agreement="openAgreement" @edit-agreement-cost="editCost($event, true)" :show-execution="reportMode" :progress-report="progressReport" :black-amounts="reportMode" :execution-mode="executionMode" :adjustment-mode="adjustmentMode" :mismatch-visible="budgetMismatchVisible" @cutoff-change="$set(budget.metadata, 'executionCutoff', $event)" @edit-execution="openExecution($event, false)" @edit-adjustment="openExecution($event, true)" @add-cost="addCost" @edit-cost="editCost" @dismiss-mismatch="budgetMismatchVisible = false" />
      </div>
      <footer v-if="!readonly" class="budget-page-actions"><a-button @click="save('editing')">暂存</a-button><a-button type="primary" @click="save('completed')">完成</a-button></footer>
    </section>
    <section v-else class="panel budget-unavailable"><a-empty :description="loadError || '请从项目信息编辑页进入预算表'" /></section>
    <a-modal :visible="!!agreementDraft" title="协议金额" :width="550" :mask-closable="false" :keyboard="false" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" ok-text="确定" cancel-text="取消" @ok="saveAgreementAmount" @cancel="agreementDraft = null">
      <div v-if="agreementDraft" class="budget-modal-form">
        <template v-for="field in agreementFields">
          <label :key="field.key + '-label'" :for="'agreement-' + field.key">{{ field.label }}</label>
          <div :key="field.key" class="agreement-amount-control">
            <a-input-number :id="'agreement-' + field.key" v-model="agreementDraft[field.key]" :min="0" :max="1000000000" :precision="2" placeholder="请输入金额" />
            <span>元</span>
          </div>
        </template>
        <label class="budget-readonly-label">管理费占比</label><div class="budget-readonly-value">{{ agreementFeeRatio }}</div>
      </div>
    </a-modal>
    <budget-cost-modal ref="costModal" @save="saveCost" @remove="removeCost" />
    <charity-budget-cost-modal ref="charityCostModal" @save="saveCharityCost" @remove="removeCharityCost" />
    <budget-execution-modal ref="executionModal" :latest-execution="latestExecution" @save="saveExecution" />
  </div>
</template>

<script>
import { loadReportDraft, loadReviewedReportExample } from '../mock/report-drafts'
import BudgetCostModal from '../components/BudgetCostModal.vue'
import CharityBudgetCostModal from '../components/CharityBudgetCostModal.vue'
import { isDonationDraftExample } from '../mock/one-time-donation-project-draft'
import { prepareCharityBudget, charityEditorRows, validateCharityBudget } from '../utils/charity-budget-editor'
import BudgetExecutionModal from '../components/BudgetExecutionModal.vue'
import ProjectPersonnelTable from '../components/ProjectPersonnelTable.vue'
import BudgetSummary from '../components/BudgetSummary.vue'
import BudgetGeneratedTable from '../components/BudgetGeneratedTable.vue'
import { executionError, applyReportBudgetChange } from '../utils/report-budget'
import ProjectBudgetTable, { measureBudgetWidths, measureCharityBudgetWidths } from '../components/ProjectBudgetTable.vue'
import { money, roundMoney, clone } from '../mock/project-drafts'
import { budgetStatus, canViewBudget, budgetKey, readBudgetContext, readSavedBudget, readSeeAgreementAmounts, readAgreementExampleAmounts, followsMonthlySeeAgreement, saveBudgetSheet, emptyBudget, validateCost, validatePersonnel, readBudgetWorking, writeBudgetWorking, clearBudgetWorking, buildBudgetRows, normalizeBudget, snapshotBudget } from '../utils/project-budget'
const agreementFields = [
  { key: 'platform', label: '平台激励' },
  { key: 'foundation', label: '基金会激励' },
  { key: 'fundraising', label: '项目募集资金' },
  { key: 'publicFee', label: '公募机构管理费' }
]

export default {
  name: 'ProjectBudgetForm',
  components: { CharityBudgetCostModal, BudgetCostModal, ProjectBudgetTable, BudgetExecutionModal, ProjectPersonnelTable, BudgetSummary, BudgetGeneratedTable },
  data () { return { context: null, budget: { rows: [], personnel: [] }, snapshot: '', loadError: '', budgetMismatchVisible: false, agreementDraft: null, agreementFields } },
  computed: {
    agreementFeeRatio () {
      const { fundraising, publicFee } = this.agreementDraft || {}
      return fundraising > 0 && typeof publicFee === 'number' ? (publicFee / fundraising * 100).toFixed(2) + '%' : '/'
    },
    key () { return budgetKey(this.$route) },
    draft () { return this.context ? this.context.draft : {} },
    donationProject () {
      return this.$route.query.budgetType === 'donation' || ['one-time-donation', 'monthly-donation'].includes(this.$route.query.detailType) ||
        !!(this.context && this.context.donationProject) || this.draft.type === '联合公益' || /^LH-/.test(this.draft.code || '')
    },
    agreementMode () { return this.draftAgreementExample && this.$route.query.mode === 'agreement' },
    draftAgreementExample () { return isDonationDraftExample(this.$route.params.id, this.$route.query.detailType) && !this.reportMode },
    agreementCostExample () {
      const finance = this.budget.metadata && this.budget.metadata.charityFinance
      return this.draftAgreementExample && (this.$route.query.example === 'agreement' ||
        (followsMonthlySeeAgreement(this.$route) && !!(finance && finance.agreementAmounts)))
    },
    agreementItemsTotal () {
      if (!this.agreementCostExample || !this.context) return null
      const amounts = this.budget.metadata.charityFinance.agreementAmounts || {}
      const cents = this.tableRows.reduce((total, row) => row.charityEditable ? total + Math.round(Number(row.agreementAmount || 0) * 100) : total, Math.round(Number(amounts.publicFee || 0) * 100))
      return cents / 100
    },
    charityEditor () { return this.donationProject && !this.reportMode },
    reportMode () { return this.$route.query.reportBudget === '1' },
    progressReport () { return this.reportMode && this.$route.query.type !== 'completion' },
    generatedSheet () { return !this.donationProject && ['summary', 'cost', 'adjustments'].includes(this.$route.query.sheet) ? this.$route.query.sheet : '' },
    executionMode () { return this.reportMode && this.$route.query.mode === 'execution' },
    adjustmentMode () { return this.reportMode && this.$route.query.mode === 'adjustment' },
    readonly () { return !!this.generatedSheet || this.$route.query.mode === 'view' || (this.reportMode && !['execution', 'adjustment'].includes(this.$route.query.mode)) },
    status () {
      if (this.agreementCostExample) return '待填写协议金额'
      if (this.agreementMode) {
        const finance = this.budget.metadata && this.budget.metadata.charityFinance
        const amounts = (finance && finance.agreementAmounts) || {}
        return agreementFields.every(({ key }) => amounts[key] != null) ? '已填写协议金额' : '待填写协议金额'
      }
      return this.generatedSheet ? '自动生成（只读）' : this.reportMode ? (this.executionMode ? '填写执行' : this.adjustmentMode ? '预算调整' : '查看') : budgetStatus(this.budget)
    },
    hideFundraisingBudget () { return this.$route.query.detailType === 'monthly-donation' },
    monthlyAgreement () { return this.hideFundraisingBudget && this.draftAgreementExample },
    widths () { return this.charityEditor ? measureCharityBudgetWidths(this.tableRows.filter(row => row.kind !== 'action'), this.hideFundraisingBudget) : measureBudgetWidths(this.tableRows, this.progressReport) },
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) },
    dirty () { return !this.readonly && !!this.context && JSON.stringify(this.budget) !== this.snapshot },
    tableRows () { return this.charityEditor ? charityEditorRows(this.budget, !this.readonly && !this.agreementMode && (!this.agreementCostExample || this.monthlyAgreement || this.$route.query.fresh === '1'), this.monthlyAgreement) : buildBudgetRows({}, this.budget, !this.readonly && !this.reportMode) }
  },
  activated () { this.load(); window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { this.agreementDraft = null; this.budgetMismatchVisible = false; window.removeEventListener('beforeunload', this.beforeUnload); this.$refs.costModal.close(); this.$refs.charityCostModal.close(); this.$refs.executionModal.close() },
  beforeDestroy () { window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeRouteLeave (to, from, next) {
    if (to.name === 'project-personnel-form' && budgetKey(to) === this.key) { next(); return }
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '填写内容尚未保存', content: '是否保存为本地草稿后离开？', maskClosable: false, keyboard: false, okText: '保存并离开', cancelText: '放弃填写', onOk: () => { this.save('editing'); next(!this.dirty) }, onCancel: () => { this.budget = JSON.parse(this.snapshot); next() } })
  },
  methods: {
    money,
    latestExecution (row, personnel = false) {
      if (!this.reportMode || !this.context) return row.executed
      const report = this.draft.exampleReportId ? loadReviewedReportExample(this.draft.projectId, this.draft.exampleReportId, !!this.draft.fresh, !!this.draft.rejectedDemo) : loadReportDraft(this.draft.projectId, this.$route.query.type || 'progress', this.draft.draftId)
      const latest = ((report.budget || {})[personnel ? 'personnel' : 'rows'] || []).find(item => item.id === row.id)
      if (!latest || latest.executed == null) return row.executed
      return row.executed == null ? latest.executed : Math.max(row.executed, latest.executed)
    },
    openExecution (row, adjustment) { if (this.readonly || !row.cost) return; this.$refs.executionModal.open(row.cost, row.code, false, adjustment) },
    openPerson (row, adjustment) { if (this.readonly) return; this.$refs.executionModal.open(row, '2-人力', true, adjustment) },
    saveExecution (event) { this.budget = applyReportBudgetChange(this.budget, event.row, event.personnel) },
    load () {
      this.context = null; this.loadError = ''; this.budgetMismatchVisible = false
      try {
        const context = readBudgetContext(this.key)
        if (!context) return
        const working = !this.readonly && readBudgetWorking(this.key)
        const source = this.reportMode || this.generatedSheet ? normalizeBudget(context.draft.budget) : working ? normalizeBudget(working.budget) : readSavedBudget(this.key) || emptyBudget(context.draft.budget)
        const donationProject = this.donationProject || context.donationProject || context.draft.type === '联合公益' || /^LH-/.test(context.draft.code || '')
        const budget = this.readonly || this.reportMode ? source : snapshotBudget(source, context.draft, donationProject)
        if (this.readonly && !this.reportMode && !this.generatedSheet && !canViewBudget(budget)) { this.loadError = '预算表尚未暂存或完成，暂不可查看'; return }
        this.context = context
        if (this.monthlyAgreement && this.agreementMode) {
          budget.rows = budget.rows.filter(row => row.type === '公募机构管理费')
          budget.personnel = []
          budget.legacyPersonnel = []
        }
        this.budget = this.charityEditor ? prepareCharityBudget(budget, this.monthlyAgreement) : budget
        if (followsMonthlySeeAgreement(this.$route) || this.agreementCostExample) {
          const finance = this.budget.metadata.charityFinance
          const amounts = this.$route.query.example === 'agreement' ? readAgreementExampleAmounts(this.$route) : readSeeAgreementAmounts(this.$route)
          if (amounts) this.$set(finance, 'agreementAmounts', { ...amounts })
        }
        if (this.monthlyAgreement) this.budget = prepareCharityBudget(this.budget, true)
        this.snapshot = working ? working.snapshot : JSON.stringify(this.budget)
        clearBudgetWorking(this.key)
      } catch (error) { this.loadError = '无法读取预算数据，请返回项目信息页重新进入。原保存内容尚未覆盖。' }
    },
    beforeUnload (event) { if (this.dirty) { event.preventDefault(); event.returnValue = '' } },
    addCost (row) {
      if (this.readonly || row.disabled) return
      if (this.charityEditor) { this.$refs.charityCostModal.open(row.costKind, { ...row, monthlyAgreement: this.monthlyAgreement }, this.budget); return }
      if (row.costKind === 'personnel') {
        try {
          writeBudgetWorking(this.key, { budget: this.budget, snapshot: this.snapshot })
          this.$router.push({ name: 'project-personnel-form', params: { id: this.$route.params.id }, query: { ...this.$route.query, from: 'budget' } })
        } catch (error) { this.$message.error('无法保留当前费用，请暂存后重试') }
        return
      }
      this.$refs.costModal.open(row.costKind, row)
    },
    editCost (row, agreement = false) {
      if (this.charityEditor) {
        const personnel = this.budget.personnel.concat(this.budget.legacyPersonnel).some(item => item.id === row.cost.id)
        const output = this.budget.groups.find(item => item.id === row.cost.outputId)
        const activity = output && output.activities.find(item => item.id === row.cost.activityId)
        const cost = agreement ? { ...row.cost, ...row.cost.agreementDetail } : row.cost
        const activityName = activity ? [activity.code, activity.name].filter(Boolean).join(' ') : ''
        this.$refs.charityCostModal.open(personnel ? 'personnel' : row.cost.kind, { activityName, agreement, monthlyAgreement: this.monthlyAgreement }, this.budget, cost); return
      }
      const activity = this.tableRows.find(item => item.kind === 'action' && item.activityId === row.cost.activityId && item.outputId === row.cost.outputId)
      this.$refs.costModal.open(row.cost.kind, activity || row.cost, row.cost)
    },
    saveCharityCost (event) {
      const row = event.row
      if (!row.id) row.id = 'charity-cost-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
      const key = event.personnel ? (this.budget.personnel.length || !this.budget.legacyPersonnel.length ? 'personnel' : 'legacyPersonnel') : 'rows'
      if (key === 'personnel') this.budget.legacyPersonnel = []
      const index = this.budget[key].findIndex(item => item.id === row.id)
      if (event.agreement && !this.monthlyAgreement) {
        if (index < 0) return
        const { price, quantity, unit } = row
        this.$set(this.budget[key], index, { ...this.budget[key][index], agreementAmount: roundMoney(price * quantity), agreementDetail: { price, quantity, unit } })
        return
      }
      if (this.monthlyAgreement) {
        row.agreementAmount = roundMoney(row.price * row.quantity)
        delete row.agreementDetail
      }
      if (index < 0) this.budget[key].push(row)
      else this.$set(this.budget[key], index, row)
      this.budget = prepareCharityBudget(this.budget, this.monthlyAgreement)
    },
    removeCharityCost (event) {
      if (event.personnel && this.budget.personnel.length) this.budget.legacyPersonnel = []
      const keys = event.personnel ? ['personnel', 'legacyPersonnel'] : ['rows']
      keys.forEach(key => { this.budget[key] = this.budget[key].filter(row => row.id !== event.id) })
      this.budget = prepareCharityBudget(this.budget, this.monthlyAgreement)
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
    openAgreement (row) {
      if (!this.agreementMode || !row.agreementKey) return
      const draft = { platform: null, foundation: null, fundraising: null, publicFee: null }
      this.tableRows.forEach(item => {
        if (item.agreementKey && item.agreementAmount != null) draft[item.agreementKey] = item.agreementAmount
      })
      this.agreementDraft = draft
    },
    saveAgreementAmount () {
      if (!this.agreementMode || !this.agreementDraft) return
      const invalid = agreementFields.find(({ key }) => {
        const amount = this.agreementDraft[key]
        return typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0 || amount > 1000000000 || roundMoney(amount) !== amount
      })
      if (invalid) {
        this.$message.error('请填写有效的' + invalid.label + '，无金额时填写0，最多两位小数')
        return
      }
      const finance = this.budget.metadata.charityFinance
      this.$set(finance, 'agreementAmounts', { ...finance.agreementAmounts, ...this.agreementDraft })
      if (this.monthlyAgreement) this.budget = prepareCharityBudget(this.budget, true)
      this.agreementDraft = null
    },
    validateCostAgreement () {
      const amounts = this.budget.metadata.charityFinance.agreementAmounts
      const items = this.tableRows.filter(row => row.charityEditable)
      const cents = value => Math.round(Number(value || 0) * 100)
      const sum = rows => rows.reduce((total, row) => total + cents(row.agreementAmount), 0)
      const fundraising = cents(amounts.fundraising)
      if (cents(this.agreementItemsTotal) !== fundraising) {
        return { key: 'total', message: '填写的协议金额与SEE确定的协议金额不一致' }
      }
      const management = items.filter(row => row.type === '执行机构管理费')
      if (sum(management) * 20 > fundraising) {
        return { key: management[0].key, message: '管理费合计占比不能超过5%' }
      }
      return null
    },
    save (status) {
      if (this.readonly) return
      if (this.charityEditor) this.budget = prepareCharityBudget(this.budget, this.monthlyAgreement)
      if (this.reportMode) {
        this.budget.rows.forEach(row => { row.executed = this.latestExecution(row) }); this.budget.personnel.forEach(row => { row.executed = this.latestExecution(row, true) })
        const error = this.budget.rows.map(row => row.executed == null ? '' : executionError(row.executed, row)).concat(this.budget.personnel.map(row => row.executed == null ? '' : executionError(row.executed, row, true))).find(Boolean)
        if (error) { this.$message.error(error); return }
        if (status === 'completed' && this.executionMode && this.$route.query.sheet !== 'personnel' && (!this.budget.metadata.executionCutoff || this.budget.metadata.executionCutoff === '无')) { this.$message.error('请选择执行金额截止日期'); return }
        try { this.budget = saveBudgetSheet(this.key, this.budget, status); this.snapshot = JSON.stringify(this.budget); this.$message.success('报告预算已保存到当前浏览器'); if (status === 'completed') this.goBack() } catch (error) { this.$message.error('保存失败，请保留当前页面后重试') }
        return
      }
      if (this.agreementMode && status === 'completed') {
        const amounts = this.budget.metadata.charityFinance.agreementAmounts || {}
        if (['fundraising', 'publicFee', 'platform', 'foundation'].some(key => amounts[key] == null)) {
          this.$message.error('请填写四项协议金额，无金额时填写0')
          return
        }
      }
      if (this.agreementCostExample && status === 'completed') {
        const error = this.validateCostAgreement()
        if (error) {
          this.$refs.budgetTable.showAgreementError(error.key, error.message)
          return
        }
      }
      if (!this.agreementMode && status === 'completed') {
        const error = this.charityEditor ? validateCharityBudget(this.budget) : this.budget.rows.map(validateCost).find(Boolean)
        if (error) { this.$message.error(error); return }
        const personnelError = this.charityEditor ? '' : (this.budget.personnel || []).map(row => validatePersonnel(row, this.draft)).find(Boolean)
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
        const saved = saveBudgetSheet(this.key, this.budget, this.agreementMode ? this.budget.editStatus : status)
        this.budget = clone(saved); this.snapshot = JSON.stringify(this.budget)
        this.$message.success(status === 'completed' ? '预算表已完成编辑并保存到当前浏览器' : '预算表已暂存到当前浏览器')
        if (status === 'completed') this.goBack()
      } catch (error) { this.$message.error(error.message && error.message.indexOf('预算') === 0 ? error.message : '保存失败，请保留当前页面后重试') }
    },
    goBack () {
      if (this.agreementMode) { this.$router.push({ name: 'applied-projects' }); return }
      const query = { ...this.$route.query }; delete query.mode; delete query.budgetType; delete query.sheet
      this.$router.push(this.context ? this.context.returnTo : { name: 'project-form', params: { id: this.$route.params.id }, query })
    }
  }
}
</script>

<style scoped>
.agreement-amount-control { display: flex; align-items: center; gap: 8px; }
.agreement-amount-control >>> .ant-input-number { flex: 1; width: 0; min-width: 0; }
.agreement-amount-control > span { flex: none; }
.budget-edit-page { display: grid; gap: 20px; padding-bottom: 18px; min-width: 0; }
.budget-edit-panel { padding: 0 24px; min-width: 0; }
.budget-page-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; min-height: 90px; padding: 20px 0; }
.budget-page-header h1 { margin: 0 0 8px; color: #18253c; overflow-wrap: anywhere; }
.budget-page-header span { color: #718095; }
.budget-state { white-space: nowrap; }
.budget-editor-scroll { overflow: visible; padding-bottom: 12px; }
.budget-page-actions { display: flex; justify-content: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: #fff; z-index: 3; }
.budget-page-actions .ant-btn { min-width: 100px; height: 32px; }
.budget-unavailable { padding: 40px; text-align: center; }
</style>
