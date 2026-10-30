import { normalizeBudget, buildBudgetRows, budgetNumber, copyBudgetData } from './project-budget-data'

// Legacy tables are display snapshots, not an alternative source of calculations.
// Preserve their group links and notes; amounts use the shared calculation rules.
export function createBudgetReviewData (value, projectName = '') {
  const source = copyBudgetData(value || {})
  const legacy = (source.rows || []).some(row => ['total', 'group'].includes(row.kind))
  const notes = { ...((source.metadata || {}).adjustmentDetailsByRow || {}) }
  if (legacy) {
    const costs = [], groups = [], personnel = []
    let section = 'support', output = null, activity = null
    ;(source.rows || []).forEach(row => {
      let key = row.id
      if (row.kind === 'total') key = 'total'
      else if (row.kind === 'group') {
        activity = null
        if (String(row.code).indexOf('产出') === 0) {
          if (!row.id) throw new Error('预算产出缺少稳定 ID')
          output = { id: row.id, code: row.code, name: row.name, activities: [] }
          groups.push(output); section = 'activity'; key = 'output:' + row.id
        } else {
          output = null
          section = String(row.code).indexOf('2-人力') === 0 ? 'personnel' : 'support'
          key = section
        }
      } else if (row.kind === 'activity') {
        if (!output || !row.id) throw new Error('预算活动缺少产出关联或稳定 ID')
        activity = { id: row.id, code: row.code, name: row.name }
        output.activities.push(activity); key = 'activity:' + row.id
      } else {
        if (row.kind === 'detail' && row.name === '无') {
          const placeholders = normalizeBudget({ rows: [row] }).legacyPlaceholders
          if (placeholders.length) {
            source.legacyPlaceholders = (source.legacyPlaceholders || []).concat(placeholders)
            return
          }
        }
        const item = { ...row, kind: section === 'support' ? 'support' : 'activity', description: row.description || row.detail || '',
          outputId: output ? output.id : null, activityId: activity ? activity.id : null }
        if (section === 'personnel') {
          key = 'personnel-detail'
          item.quarters = (row.quarters || [null, null, null, null]).map(budgetNumber)
          ;['adjustment', 'adjustedBudget', 'executed'].forEach(field => { item[field] = budgetNumber(row[field]) })
          personnel.push(item)
        } else costs.push(item)
      }
      if (row.adjustmentDetail != null) notes[key] = row.adjustmentDetail
    })
    source.rows = costs
    source.groups = groups
    if (personnel.length) source.legacyPersonnel = personnel
  }
  const budget = normalizeBudget(source)
  budget.metadata = { ...budget.metadata, adjustmentDetailsByRow: notes }
  if (legacy) budget.metadata.snapshotVersion = 1
  if (projectName) budget.metadata.projectName = projectName
  const rows = buildBudgetRows({}, budget).map(row => ({ ...row,
    adjustmentDetail: notes[row.key] === undefined ? (row.cost && row.cost.adjustmentDetail) : notes[row.key] }))
  return { budget, rows }
}
