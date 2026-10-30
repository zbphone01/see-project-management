import { normalizeBudget, buildBudgetRows, budgetQuarterTotal, budgetPersonnelAmount } from './project-budget-data'

export function createReportBudget (draft) {
  const groups = draft.outputs.map(output => ({ id: output.id, name: output.name, activities: output.activities.map(activity => ({ id: activity.id, name: activity.name })) }))
  const cost = (id, kind, name, type, amount, outputId = null, activityId = null) => ({ id, kind, name, type, price: amount / 4, quantity: 4, unit: '期', description: name + '，按四期实施', quarters: [amount / 4, amount / 4, amount / 4, amount / 4], outputId, activityId, executed: null, adjustment: null, adjustedBudget: null })
  const first = groups[0], second = groups[1]
  return normalizeBudget({
    metadata: { projectName: draft.projectName, projectCode: draft.projectCode, organization: draft.organization, period: draft.projectPeriod, partners: '无', executionCutoff: '', snapshotVersion: 1 }, groups,
    rows: [cost('report-office', 'support', '办公运行费', '办公运行费', 20000), cost('report-monitor', 'activity', '监测设备及巡护物资', '物资费', 160000, first.id, first.activities[0].id), cost('report-data', 'activity', '监测数据整理与交流', '第三方采购费', 100000, first.id, first.activities[1].id), cost('report-training', 'activity', '社区培训与保护实践', '会议及培训费', 100000, second.id, second.activities[0].id)],
    personnel: [{ id: 'report-person-1', memberId: 'report-person-1', name: '项目协调员（示例）', position: '项目协调', nature: '专职', responsibilities: '监测协调、数据归档及社区活动组织', monthly: 10000, months: 12, ratio: 100, quarters: [30000, 30000, 30000, 30000], remark: '专职', executed: null, adjustment: null, adjustedBudget: null }]
  })
}

export function executionError (value, row, personnel = false) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1000000000 || Number(Number(value).toFixed(2)) !== Number(value)) return '请填写 0 至 10 亿元的执行额，最多两位小数'
  const total = personnel ? budgetPersonnelAmount(row) : budgetQuarterTotal(row)
  const limit = row.adjustedBudget == null ? total : row.adjustedBudget
  if (Number(value) < Number(row.executed || 0)) return '新执行额不能低于原执行额'
  if (Number(value) > Math.round(limit * (personnel || row.kind === 'support' ? 1 : 1.2) * 100) / 100) return personnel || row.kind === 'support' ? '支撑和人力的执行额不能超过对应的预算，请检查' : '产出活动执行额超过对应预算的120%'
  return ''
}

export function activityAdjustmentError (row, form) {
  const valid = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= 1000000000 && Number(Number(value).toFixed(2)) === Number(value)
  if (!valid(form.amount)) return '请填写有效的预算调整金额，最多两位小数'
  const total = budgetQuarterTotal(row), adjusted = Math.round((total + Number(form.amount)) * 100) / 100
  if (adjusted < 0) return '预算调整后金额不能为负，请检查修改'
  if (adjusted < Number(row.executed || 0)) return '预算调整后金额小于执行金额，请检查修改'
  if (Number(form.amount) > Math.round(total * 0.2 * 100) / 100) return '预算调整比例不能大于+20%，请检查修改'
  if (!valid(form.price) || Number(form.price) <= 0) return '请填写有效的明细单价，最多两位小数'
  if (!valid(form.quantity) || Number(form.quantity) <= 0) return '请填写有效的明细数量，最多两位小数'
  if (!String(form.description || '').trim()) return '请对明细进行说明'
  if (!Array.isArray(form.quarters) || form.quarters.length !== 4 || form.quarters.some(value => !valid(value) || Number(value) < 0)) return '请填写四期预算金额，不需预算的期数填写 0'
  const detail = Math.round(Number(form.price) * Number(form.quantity) * 100) / 100
  if (detail > 1000000000) return '预算明细总额不能超过 10 亿元'
  if (detail !== budgetQuarterTotal(form)) return '预算明细总额与分期预算合计金额不一致，请检查'
  if (detail !== adjusted) return '预算明细总额与预算调整后金额不一致，请检查'
  return ''
}

export function reportExecuted (budget) {
  const total = buildBudgetRows({}, normalizeBudget(budget)).find(row => row.kind === 'total')
  return total ? total.executed || 0 : 0
}

export function applyReportBudgetChange (budget, row, personnel) {
  const result = normalizeBudget(budget)
  const records = personnel ? result.personnel : result.rows
  const index = records.findIndex(item => item.id === row.id)
  if (index < 0) throw new Error('预算明细不存在，请重新进入')
  records.splice(index, 1, row)
  // 一项发生调整后，其余项目仍以原预算作为有效预算，汇总不能只计调整过的项目。
  if (result.rows.concat(result.personnel, result.legacyPersonnel).some(item => item.adjustment != null)) {
    result.rows.concat(result.personnel, result.legacyPersonnel).forEach(item => { if (item.adjustedBudget == null) item.adjustedBudget = budgetQuarterTotal(item) })
  }
  return normalizeBudget(result)
}
