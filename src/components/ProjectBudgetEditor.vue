<template>
  <div class="application-budget budget-sheet-list">
    <div v-for="sheet in visibleSheets" :key="sheet.title" class="budget-sheet-row">
      <div class="budget-sheet-info">
        <strong>{{ sheet.title }}</strong>
        <span>{{ sheet.status }}</span>
      </div>
      <a-button v-for="action in sheet.actions" :key="action" type="link" :disabled="action === '查看' && !sheet.viewable" :class="{ 'budget-view-link': action === '查看' }" @click="open(action, sheet)">{{ action }}</a-button>
    </div>
  </div>
</template>

<script>
import { budgetStatus, canViewBudget } from '../utils/project-budget'
export default {
  name: 'ProjectBudgetEditor',
  props: {
    donationProject: { type: Boolean, default: false },
    hideCostTypeAnalysis: { type: Boolean, default: false },
    value: { type: Object, required: true },
    projectName: { type: String, default: '' }
  },
  data () {
    return {
      sheets: [
        { title: '预算及执行明细表', actions: ['编辑', '查看'], detail: true },
        { title: '人力成本分摊表', status: '待编辑', actions: ['编辑', '查看'] },
        { title: '预算及执行汇总表', status: '根据预算及执行明细自动汇总', actions: ['查看'] },
        { title: '费用类型分析表', status: '根据费用类型自动生成分析', actions: ['查看'] }
      ]
    }
  },
  computed: {
    viewable () { return canViewBudget(this.value) },
    visibleSheets () {
      const sheets = this.donationProject ? [{ title: '北京市企业家环保基金会联合公益项目预算表', actions: ['编辑', '查看'], detail: true }] : this.sheets.filter(sheet => !this.hideCostTypeAnalysis || sheet.title !== '费用类型分析表')
      return sheets.map(sheet => ({ ...sheet, status: sheet.title === '人力成本分摊表' ? (this.value.personnelStatus === 'completed' || this.value.personnelUpdatedAt ? '已保存' : '待编辑') : budgetStatus(this.value), viewable: sheet.title === '人力成本分摊表' ? !!this.value.personnelUpdatedAt : this.viewable }))
    }
  },
  methods: {
    open (action, sheet) {
      if (action === '查看' && !sheet.viewable) return
      this.$emit('open', { action, detail: !!sheet.detail, title: sheet.title })
    }
  }
}
</script>

<style scoped>
.budget-sheet-list { padding: 4px 22px 22px; }
.budget-sheet-row { min-height: 72px; padding: 12px 4px; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 12px; border-bottom: 1px solid #edf1f5; }
.budget-sheet-row:last-child { border-bottom: 0; }
.budget-sheet-info { min-width: 0; display: grid; gap: 5px; }
.budget-sheet-info strong { color: #18253c; font-weight: 600; overflow-wrap: anywhere; }
.budget-sheet-info span { color: #8390a2; line-height: 1.55; overflow-wrap: anywhere; }
.budget-sheet-row .ant-btn { padding: 0 8px; }
.budget-sheet-row .budget-view-link:not([disabled]) { color: #70B603; }
</style>
