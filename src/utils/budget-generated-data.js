import { createBudgetReviewData } from './budget-review-data'
import { budgetMoney, budgetDetailParts, budgetAdjustmentParts } from './project-budget-data'

export const generatedSheets = {
  summary: '预算及执行汇总表',
  cost: '费用类型分析表',
  adjustments: '预算调整历史'
}
const amount = value => value == null ? '/' : Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const ratio = (value, base, signed = false) => value == null || !base ? '/' : (signed && value > 0 ? '+' : '') + (value / base * 100).toFixed(2) + '%'
const effective = row => row.adjustedBudget == null ? row.total : row.adjustedBudget
const cell = (value, role = '') => ({ value, role })
const column = (title, width, role = '') => ({ title, width, role })

export function summarySheet (rows) {
  return {
    columns: [column('预算编号', 100), column('产出及活动名称', 650, 'text'), column('执行金额', 155, 'executed'), column('执行比例', 155, 'execution-ratio'), column('变更前预算金额', 155, 'before'), column('变更后预算金额', 155, 'total'), column('预算变更比例', 155, 'change-ratio')],
    rows: rows.filter(row => ['total', 'group', 'activity'].includes(row.kind)).map(row => ({
      key: row.key, kind: row.kind,
      cells: [cell(row.kind === 'total' ? '合计金额' : row.code), cell(row.name), cell(amount(row.executed)), cell(ratio(row.executed, effective(row))), cell(amount(row.total)), cell(amount(effective(row))), cell(ratio(budgetMoney(effective(row) - row.total), row.total, true), !row.total ? '' : effective(row) > row.total ? 'increase' : effective(row) < row.total ? 'decrease' : '')]
    }))
  }
}

export function costSheet (budget) {
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  const records = budget.rows.concat(personnel)
  const hasAdjustment = records.some(row => row.adjustedBudget != null || row.adjustment != null)
  const groups = new Map()
  records.forEach(row => {
    const isPersonnel = personnel.includes(row)
    const type = isPersonnel ? '工资薪金' : row.type || '空白', description = type === '其他费用' ? String(row.otherCostDescription || '').trim() : ''
    const key = JSON.stringify([type, description])
    if (!groups.has(key)) groups.set(key, { type, description, rows: [], personnel: [] })
    groups.get(key)[isPersonnel ? 'personnel' : 'rows'].push(row)
  })
  const sum = group => createBudgetReviewData({ rows: group.rows, personnel: budget.personnel.length ? group.personnel : [], legacyPersonnel: budget.personnel.length ? [] : group.personnel }).rows[0]
  const entries = Array.from(groups.entries()).map(([key, group]) => ({ key, group, total: sum(group) }))
    .filter(item => [item.total.total, item.total.adjustment, item.total.adjustedBudget, item.total.executed].some(value => value != null && value !== 0))
    .sort((left, right) => right.total.total - left.total.total || left.key.localeCompare(right.key))
  const cells = (type, description, row) => [cell(type), cell(description), cell(amount(row.total)), cell(amount(hasAdjustment ? row.adjustment || 0 : null)), cell(amount(effective(row))), cell(amount(row.executed))]
  const total = createBudgetReviewData(budget).rows[0]
  return {
    columns: [column('费用类型', 150), column('费用说明', 360, 'text'), column('预算合计金额', 160, 'total'), column('预算调整金额', 160), column('调整后预算', 160), column('执行金额', 160, 'executed')],
    rows: entries.map(item => ({ key: item.key, kind: 'detail', cells: cells(item.group.type, item.group.description || '/', item.total) }))
      .concat([{ key: 'total', kind: 'total', cells: cells('总计', '', total) }])
  }
}

export function historySheet (budget) {
  // adjustmentHistory 按时间正序保存 { id, budget }，budget 为该次调整后的完整业务快照，
  // 原始四期金额保持不变；adjustedBudget 为该轮结果。汇总与比例仅在读取时计算。
  const rounds = budget.adjustmentHistory || []
  const ids = new Set()
  const snapshots = rounds.map(round => {
    if (!round || !round.id || ids.has(round.id) || !round.budget) throw new Error('预算调整历史缺少快照或稳定 ID 重复')
    ids.add(round.id)
    return createBudgetReviewData(round.budget).rows
  })
  const current = createBudgetReviewData(budget).rows
  const originals = new Map()
  current.concat(...snapshots).forEach(row => { if (!originals.has(row.key)) originals.set(row.key, row) })
  const maps = snapshots.map(rows => new Map(rows.map(row => [row.key, row])))
  const columns = [column('预算编号', 90), column('预算科目', 120, 'text'), column('预算明细（单价*数量）', 210, 'text'), column('费用类型', 80), column('原始\n预算合计金额', 100)]
  rounds.forEach((round, index) => columns.push(column('第' + (index + 1) + '次\n预算调整金额', 100), column('预算变动比例', 60), column('第' + (index + 1) + '次\n预算调整明细', 210, 'text'), column('第' + (index + 1) + '次\n调整后预算', 100)))
  return {
    columns,
    note: rounds.length ? '' : '暂无调整记录',
    rows: Array.from(originals.values()).map(row => {
      const parts = budgetDetailParts(row)
      const detail = parts.price == null ? cell(parts.text || '') : { ...cell(''), detail: { expression: amount(parts.price) + '元 × ' + amount(parts.quantity) + (parts.unit || ''), description: parts.description } }
      const cells = [cell(row.kind === 'total' ? '合计金额' : row.code), cell(row.name), detail, cell(row.type || ''), cell(amount(row.initialTotal == null ? row.total : row.initialTotal))]
      let previous = row.initialTotal == null ? row.total : row.initialTotal
      maps.forEach(map => {
        const next = map.get(row.key)
        if (!next) { cells.push(cell('/'), cell('/'), cell('/'), cell('/')); return }
        const after = effective(next), change = budgetMoney(after - previous)
        const parts = budgetAdjustmentParts(next)
        const detail = parts.price == null ? cell(parts.text || '/') : { ...cell(''), detail: { expression: amount(parts.price) + '元 × ' + amount(parts.quantity) + (parts.unit || ''), description: parts.description } }
        if (next.hasBudgetAdjustment) cells.push(cell(amount(change)), cell(ratio(change, previous, true)), detail, cell(amount(after)))
        else cells.push(cell('/'), cell('/'), cell('/'), cell('/'))
        previous = after
      })
      return { key: row.key, kind: row.kind, cells }
    })
  }
}

export function generatedBudgetSheet (value, kind) {
  if (!generatedSheets[kind]) throw new Error('预算表类型无效')
  const review = createBudgetReviewData(value)
  const sheet = kind === 'summary' ? summarySheet(review.rows) : kind === 'cost' ? costSheet(review.budget) : historySheet(review.budget)
  return { ...sheet, metadata: review.budget.metadata }
}
