<template>
  <table class="personnel-table" :class="{ 'personnel-black-amounts': blackAmounts }" :style="{ minWidth: tableWidth + 'px' }">
    <colgroup><col v-for="(width, index) in widths" :key="index" :style="{ width: (width / tableWidth * 100) + '%' }" /></colgroup>
    <thead><tr><th colspan="12">{{ projectName || '未填写' }}</th></tr><tr class="table-heading"><th colspan="12">项目执行团队人力成本分摊表</th></tr><tr class="table-heading"><th v-for="label in columns" :key="label" :class="{ 'work-content': label === '在本项目中工作内容' }">{{ label }}</th></tr></thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td><button v-if="!readonly" class="person-name" @click="$emit('edit-person', row)">{{ row.name }}</button><span v-else>{{ row.name }}</span></td><td>{{ row.position }}</td><td>{{ row.nature || '—' }}</td><td class="work-content">{{ row.responsibilities }}</td><td class="number"><button v-if="executionMode" type="button" :class="row.executed == null ? 'ant-btn budget-execution-button' : 'person-name'" @click="$emit('edit-execution', row)">{{ row.executed == null ? '填写执行额' : money(row.executed) }}</button><template v-else>{{ showExecution ? optionalMoney(row.executed) : '/' }}</template></td><td class="blue">{{ row.ratio === null || row.ratio === undefined ? '—' : row.ratio + '%' }}</td><td class="green number">{{ money(row.monthly) }}</td><td class="green">{{ row.months }}</td><td class="blue number">{{ money(amount(row)) }}</td><td class="number"><button v-if="adjustmentMode" type="button" :class="row.adjustment == null ? 'ant-btn budget-execution-button' : 'person-name'" @click="$emit('edit-adjustment', row)">{{ row.adjustment == null ? '预算调整' : signedAdjustment(row.adjustment) }}</button><template v-else>{{ showExecution ? signedAdjustment(row.adjustment) : '/' }}</template></td><td class="number">{{ showExecution ? optionalMoney(row.adjustedBudget) : '/' }}</td><td>{{ row.remark || '—' }}</td>
      </tr>
      <tr v-if="!rows.length"><td colspan="12">{{ readonly ? '暂无人力成本分摊记录' : '暂无执行团队人员，请返回项目编辑页添加' }}</td></tr>
      <tr class="total-row"><th colspan="4">总计</th><td>/</td><td>/</td><td>/</td><td>/</td><td class="blue number">{{ money(total) }}</td><td>/</td><td>/</td><td>/</td></tr>
    </tbody>
  </table>
</template>

<script>
import { money, roundMoney } from '../mock/project-drafts'
import { personnelAmount } from '../utils/project-budget'
export default {
  name: 'ProjectPersonnelTable',
  props: {
    rows: { type: Array, required: true },
    projectName: { type: String, default: '' },
    readonly: { type: Boolean, default: true },
    blackAmounts: { type: Boolean, default: false },
    executionMode: { type: Boolean, default: false },
    adjustmentMode: { type: Boolean, default: false },
    showExecution: { type: Boolean, default: false }
  },
  data () { return { widths: [120, 100, 100, 400, 110, 100, 100, 100, 110, 110, 110, 90], columns: ['姓名', '职务', '人员性质', '在本项目中工作内容', '执行额', '本项目人力占比（%）', '本项目承担月人力成本', '本项目承担月份数', '本项目承担人力成本总额', '预算调整金额', '调整后预算', '备注'] } },
  computed: {
    tableWidth () { return this.widths.reduce((sum, width) => sum + width, 0) },
    total () { return roundMoney(this.rows.reduce((sum, row) => sum + personnelAmount(row), 0)) }
  },
  methods: {
    money,
    signedAdjustment (value) { return value == null ? '/' : (Number(value) > 0 ? '+' : '') + money(value) },
    amount: personnelAmount,
    optionalMoney (value) { return value === null || value === undefined ? '/' : money(value) }
  }
}
</script>

<style scoped>
.personnel-table { width: 100%; table-layout: fixed; border-collapse: collapse; color: #111; font-size: var(--text-13); line-height: 1.4; background: #fff; }
.personnel-table tr { height: 32px; }
.personnel-table th, .personnel-table td { border: 1px solid #222; padding: 4px 2px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
.table-heading { background: #f2f2f2; }
.personnel-table .work-content { text-align: left; white-space: pre-line; }
.person-name { padding: 0; border: 0; background: none; font: inherit; color: #f59a23; text-decoration: underline; cursor: pointer; overflow-wrap: anywhere; }
.budget-execution-button { display: inline-flex; align-items: center; justify-content: center; flex: none; height: 32px; padding: 0 8px; background: #f59a23; border-color: #f59a23; color: #fff; font-size: inherit; line-height: 20px; }
.budget-execution-button:hover, .budget-execution-button:focus { background: #fff; color: #f59a23; border-color: #f59a23; }
.person-name:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.blue { color: #02a7f0; }
.green { color: #70b603; }
.total-row { background: #edffce; }
.total-row .blue { font-weight: 700; }
.number { font-variant-numeric: tabular-nums; }
.personnel-black-amounts .blue, .personnel-black-amounts .green, .personnel-black-amounts .number { color: #000; }
</style>
