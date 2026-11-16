import { normalizeBudget, copyBudgetData, budgetBaseAmount, budgetMoney } from '../utils/project-budget-data'

// 独立样式示例：只生成查看快照，不写入项目预算或本地草稿。
export function createCharityBudgetHistoryExamples (source) {
  const none = normalizeBudget(source)
  // 仅联合公益查看示例使用原型中的支撑及人员科目；产出活动保留来源数据。
  const cost = (id, name, type, price, quantity, unit) => ({ id, name, type, price, quantity, unit,
    kind: 'support', quarters: [budgetMoney(price * quantity), 0, 0, 0], agreementAmount: budgetMoney(price * quantity),
    description: '', adjustment: null, adjustedBudget: null, executed: null })
  none.rows = [cost('charity-management', '公募机构管理费', '公募机构管理费', 50, 1, '项'),
    cost('budget-3', '办公用品', '执行机构管理费', 1000, 2, '项')].concat(none.rows.filter(row => row.kind !== 'support'))
  none.personnel = [{ ...cost('personnel-team-1', '薪金及补贴', '运营人员成本', 2000, 2, '人'),
    memberId: 'team-1', monthly: 2000, months: 2, remark: '兼职' }]
  none.legacyPersonnel = []
  none.rows.forEach(row => { row.agreementAmount = row.quarters.reduce((sum, value) => sum + Number(value || 0), 0) })
  none.metadata.charityFinance = {
    publicManagementFee: 50,
    incentives: [cost('charity-platform', '平台激励', '', 1000, 1, '项'),
      cost('charity-foundation', '北京市企业家环保基金会激励', '', 1000, 1, '项')]
  }
  none.adjustmentHistory = []
  none.metadata = { ...none.metadata, adjustmentDate: '', executionFilledAt: '', executionCutoff: '无', adjustmentDetailsByRow: {} }
  none.rows.concat(none.personnel, none.legacyPersonnel).forEach(row => {
    delete row.previousBudget
    delete row.adjustmentInput
    Object.assign(row, { adjustment: null, adjustedBudget: null, executed: null, adjustmentDetail: null })
  })
  const rounds = [
    { id: 'charity-adjustment-1', time: '2026-04-15 10:00:00', changes: {
      'budget-3': { change: 40, price: 1020, description: '第一轮补充办公用品，预算由2000元调增至2040元。' },
      'budget-8': { change: -40, price: 90, description: '第一轮合并交通安排，交通差旅费由400元调减至360元。' },
      'personnel-team-1': { change: 20, description: '第一轮增加运营协调工作，人员成本由4000元调增至4020元。' },
      'charity-platform': { change: 200, description: '第一轮增加平台激励200元。' }
    } },
    { id: 'charity-adjustment-2', time: '2026-06-15 15:00:00', changes: {
      'budget-3': { change: -20, price: 1010, description: '第二轮优化采购，办公用品预算在2040元基础上调减至2020元。' },
      'budget-8': { change: 60, price: 105, description: '第二轮增加社区回访，交通差旅费在360元基础上调增至420元。' },
      'personnel-team-1': { change: -10, description: '第二轮优化协调分工，人员成本在4020元基础上调减至4010元。' },
      'charity-platform': { change: 300, description: '第二轮增加平台激励300元。' }
    } }
  ]
  let current = copyBudgetData(none)
  const history = []
  rounds.forEach(round => {
    const next = copyBudgetData(current)
    next.rows.concat(next.personnel, next.legacyPersonnel, next.metadata.charityFinance.incentives).forEach(row => {
      const before = row.adjustedBudget == null ? budgetBaseAmount(row) : row.adjustedBudget
      const change = round.changes[row.id]
      delete row.adjustmentInput
      Object.assign(row, { previousBudget: before, adjustment: change ? change.change : null, adjustedBudget: budgetMoney(before + (change ? change.change : 0)), adjustmentDetail: change ? change.description : null })
      if (change && change.price != null) row.adjustmentInput = { price: change.price, quantity: row.quantity, unit: row.unit, description: change.description }
    })
    next.metadata.adjustmentDate = round.time.slice(0, 10)
    next.adjustmentHistory = []
    history.push({ id: round.id, time: round.time, budget: copyBudgetData(next) })
    current = next
  })
  current.adjustmentHistory = history
  return { none, multiple: current }
}

// 主预算表沿用第二轮调整快照，补充本地演示执行数据。
export function createCharityBudgetExecutionExample (source) {
  const budget = createCharityBudgetHistoryExamples(source).multiple
  budget.rows.concat(budget.personnel, budget.legacyPersonnel, budget.metadata.charityFinance.incentives).forEach(row => {
    row.executed = budgetMoney((row.adjustedBudget == null ? budgetBaseAmount(row) : row.adjustedBudget) * 0.8)
  })
  budget.metadata.executionFilledAt = '2026-09-21'
  budget.metadata.executionCutoff = '2026-09-21'
  return budget
}
