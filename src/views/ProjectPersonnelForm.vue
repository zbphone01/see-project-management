<template>
  <div class="personnel-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section v-if="context" class="panel personnel-panel">
      <header><div><h1>{{ draft.name || '项目名称' }}</h1><span>{{ draft.code }}</span></div><span class="personnel-state">{{ dirty ? '编辑中' : saved ? '已保存' : '待编辑' }}</span></header>
      <project-personnel-table :rows="rows" :project-name="draft.name || '项目名称'" :readonly="readonly" @edit-person="$refs.editor.open($event)" />
      <footer><a-button @click="goBack">返回</a-button><a-button v-if="!readonly" type="primary" @click="save">保存</a-button></footer>
    </section>
    <section v-else class="panel unavailable"><a-empty :description="error || '请从项目编辑页或预算明细页进入'" /></section>
    <personnel-budget-modal ref="editor" :project="draft" @save="updateRow" />
  </div>
</template>
<script>
import PersonnelBudgetModal from '../components/PersonnelBudgetModal.vue'
import ProjectPersonnelTable from '../components/ProjectPersonnelTable.vue'
import { budgetKey, readBudgetContext, readSavedBudget, emptyBudget, initializePersonnel, personnelBudgetMissing, savePersonnelSheet } from '../utils/project-budget'
export default {
  name: 'ProjectPersonnelForm',
  components: { PersonnelBudgetModal, ProjectPersonnelTable },
  data () { return { context: null, rows: [], snapshot: '', error: '', saved: false } },
  computed: {
    key () { return budgetKey(this.$route) },
    draft () { return this.context ? this.context.draft : {} },
    readonly () { return this.$route.query.mode === 'view' },
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
.personnel-page { min-width: 1600px; display: grid; gap: 20px; padding-bottom: 18px; }
.personnel-panel { padding: 0 24px; }
header { display: flex; justify-content: space-between; align-items: center; gap: 20px; min-height: 90px; padding: 20px 0; }
h1 { margin: 0 0 8px; overflow-wrap: anywhere; }
header span { color: #718095; }
.personnel-state { white-space: nowrap; }
footer { display: flex; justify-content: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: #fff; z-index: 3; }
footer .ant-btn { min-width: 100px; }
.unavailable { padding: 40px; }
</style>
