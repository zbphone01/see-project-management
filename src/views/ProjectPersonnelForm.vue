<template>
  <div class="personnel-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section v-if="context" class="panel personnel-panel">
      <header><div><h1>{{ draft.name || '项目名称' }}</h1><span>{{ draft.code }}</span></div><span class="personnel-state">{{ dirty ? '编辑中' : saved ? '已保存' : '待编辑' }}</span></header>
      <table class="personnel-table">
        <colgroup><col v-for="(width, index) in widths" :key="index" :style="{ width: width + 'px' }" /></colgroup>
        <thead><tr><th colspan="12">{{ draft.name || '项目名称' }}</th></tr><tr class="table-heading"><th colspan="12">项目执行团队人力成本分摊表</th></tr><tr class="table-heading"><th v-for="label in columns" :key="label" :class="{ 'work-content': label === '在本项目中工作内容' }">{{ label }}</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td><button v-if="!readonly" class="person-name" @click="$refs.editor.open(row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td>{{ row.position }}</td><td>{{ row.nature || '—' }}</td><td class="work-content">{{ row.responsibilities }}</td><td>/</td><td class="blue">{{ row.ratio }}%</td><td class="green number">{{ money(row.monthly) }}</td><td class="green">{{ row.months }}</td><td class="blue number">{{ money(amount(row)) }}</td><td>/</td><td>/</td><td>{{ row.remark || '—' }}</td>
          </tr>
          <tr v-if="!rows.length"><td colspan="12">暂无执行团队人员，请返回项目编辑页添加</td></tr>
          <tr class="total-row"><th colspan="4">总计</th><td>/</td><td>/</td><td>/</td><td>/</td><td class="blue number">{{ money(total) }}</td><td>/</td><td>/</td><td>/</td></tr>
        </tbody>
      </table>
      <footer><a-button @click="goBack">返回</a-button><a-button v-if="!readonly" type="primary" @click="save">保存</a-button></footer>
    </section>
    <section v-else class="panel unavailable"><a-empty :description="error || '请从项目编辑页或预算明细页进入'" /></section>
    <personnel-budget-modal ref="editor" :project="draft" @save="updateRow" />
  </div>
</template>
<script>
import PersonnelBudgetModal from '../components/PersonnelBudgetModal.vue'
import { money, roundMoney } from '../mock/project-drafts'
import { budgetKey, readBudgetContext, readSavedBudget, emptyBudget, initializePersonnel, personnelAmount, personnelBudgetMissing, savePersonnelSheet } from '../utils/project-budget'
export default {
  name: 'ProjectPersonnelForm',
  components: { PersonnelBudgetModal },
  data () { return { context: null, rows: [], snapshot: '', error: '', saved: false, widths: [120, 100, 100, 400, 110, 100, 100, 100, 110, 110, 110, 90], columns: ['姓名', '职务', '人员性质', '在本项目中工作内容', '执行额', '本项目人力占比（%）', '本项目承担月人力成本', '本项目承担月份数', '本项目承担人力成本总额', '预算调整金额', '调整后预算', '备注'] } },
  computed: {
    key () { return budgetKey(this.$route) },
    draft () { return this.context ? this.context.draft : {} },
    readonly () { return this.$route.query.mode === 'view' },
    total () { return roundMoney(this.rows.reduce((sum, row) => sum + personnelAmount(row), 0)) },
    dirty () { return !this.readonly && !!this.context && JSON.stringify(this.rows) !== this.snapshot }
  },
  activated () { this.load(); window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { window.removeEventListener('beforeunload', this.beforeUnload); this.$refs.editor.close() },
  beforeDestroy () { window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeRouteLeave (to, from, next) {
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '是否放弃未保存的人力费用？', maskClosable: false, okText: '放弃并返回', cancelText: '继续编辑', onOk: () => next(), onCancel: () => next(false) })
  },
  methods: {
    money, amount: personnelAmount,
    load () {
      this.context = null; this.error = ''
      try {
        const context = readBudgetContext(this.key)
        if (!context) return
        const budget = readSavedBudget(this.key) || emptyBudget(context.draft.budget, context.draft)
        if (this.readonly && !budget.personnelUpdatedAt) { this.error = '人力费用尚未保存'; return }
        this.saved = !!budget.personnelUpdatedAt
        this.rows = initializePersonnel(context.draft, budget.personnel)
        this.snapshot = JSON.stringify(this.rows); this.context = context
      } catch (error) { this.error = '无法读取人力预算，请返回项目编辑页重新进入。原数据尚未覆盖。' }
    },
    updateRow (row) { const index = this.rows.findIndex(item => item.id === row.id); if (index >= 0) this.$set(this.rows, index, row) },
    beforeUnload (event) { if (this.dirty) { event.preventDefault(); event.returnValue = '' } },
    save () {
      if (this.readonly) return
      if (!this.rows.length || this.rows.some(personnelBudgetMissing)) {
        this.$info({ title: '人力成本未填写无法保存。', maskClosable: false, okText: '知道了' })
        return
      }
      try { savePersonnelSheet(this.key, this.context, this.rows); this.snapshot = JSON.stringify(this.rows); this.$message.success('人力费用已保存到当前浏览器'); this.goBack() } catch (error) { this.$message.error('保存失败，请保留当前页面后重试') }
    },
    goBack () {
      const query = { ...this.$route.query }; delete query.from
      this.$router.push(this.$route.query.from === 'budget' ? { name: 'project-budget-form', params: { id: this.$route.params.id }, query } : this.context ? this.context.returnTo : { name: 'project-form', params: { id: this.$route.params.id } })
    }
  }
}
</script>
<style scoped>
.personnel-page { min-width: 1592px; display: grid; gap: 20px; padding-bottom: 18px; }
.personnel-panel { padding: 0 20px; }
header { display: flex; justify-content: space-between; align-items: center; gap: 20px; min-height: 90px; padding: 20px 0; }
h1 { margin: 0 0 8px; font-size: 16px; font-weight: 700; overflow-wrap: anywhere; }
header span { color: #718095; }
.personnel-state { white-space: nowrap; }
.personnel-table { width: 1550px; table-layout: fixed; border-collapse: collapse; color: #111; font-size: 10pt; line-height: 1.4; background: #fff; }
.personnel-table tr { height: 32px; }
.personnel-table th, .personnel-table td { border: 1px solid #222; padding: 4px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; font-size: inherit; }
.table-heading { background: #f2f2f2; }
.personnel-table .work-content { text-align: left; white-space: pre-line; }
.person-name { padding: 0; border: 0; background: none; font: inherit; color: #f59a23; text-decoration: underline; cursor: pointer; overflow-wrap: anywhere; }
.person-name:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.blue { color: #02a7f0; }
.green { color: #70b603; }
.total-row { background: #edffce; }
.total-row .blue { font-weight: 700; }
.number { font-variant-numeric: tabular-nums; }
footer { display: flex; justify-content: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: #fff; z-index: 3; }
footer .ant-btn { min-width: 100px; }
.unavailable { padding: 40px; }
</style>
