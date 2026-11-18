import { normalizeBudget, copyBudgetData, snapshotBudget, budgetBaseAmount, budgetMoney } from '../utils/project-budget-data'
import { prepareCharityBudget } from '../utils/charity-budget-editor'

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

export function createMonthlyDonationBudgetExample (draft, showExecution) {
  const cost = (id, kind, name, type, price, quantity, unit) => ({
    id, kind, name, type, price, quantity, unit,
    quarters: [price * quantity, 0, 0, 0], agreementAmount: price * quantity
  })
  const rows = [
    cost('monthly-office', 'support', '项目行政办公及场地分摊', '执行机构管理费', 3500, 1, '项'),
    { ...cost('monthly-course-design', 'activity', '图文视频制作费', '活动费用', 3000, 4, '套'), outputId: 'monthly-training', activityId: 'monthly-materials' },
    { ...cost('monthly-workshop-venue', 'activity', '租赁费', '活动费用', 5000, 4, '期'), outputId: 'monthly-training', activityId: 'monthly-workshops' },
    { ...cost('monthly-class-materials', 'activity', '活动物料费', '活动费用', 1375, 20, '场'), outputId: 'monthly-classes', activityId: 'monthly-outreach' },
    { ...cost('monthly-event-services', 'activity', '第三方服务购买费', '活动费用', 4000, 2, '场'), outputId: 'monthly-classes', activityId: 'monthly-sharing' }
  ]
  const personnel = [{
    ...cost('monthly-coordination', 'support', '薪金及补贴', '运营人员成本', 2000, 12, '月'),
    monthly: 2000, months: 12, quarters: [6000, 6000, 6000, 6000], charityCost: true
  }]
  const agreementAmounts = { platform: 1000, foundation: 1500, fundraising: 100000, publicFee: 5000 }
  const budget = prepareCharityBudget(snapshotBudget({
    editStatus: 'completed', rows, personnel, metadata: { charityFinance: { agreementAmounts } }
  }, draft, true), true)
  budget.metadata.charityFinance.incentives.forEach((row, index) => {
    row.agreementAmount = index === 0 ? agreementAmounts.platform : agreementAmounts.foundation
    row.quarters = [row.agreementAmount, 0, 0, 0]
  })
  if (!showExecution) return budget

  const changes = {
    'monthly-workshop-venue': { price: 4500, description: '培训场地费用调减，每期减少500元。' },
    'monthly-class-materials': { price: 1475, description: '社区课堂补充材料，每场增加100元。' }
  }
  budget.rows.forEach(row => {
    const change = changes[row.id]
    if (!change) return
    row.previousBudget = row.agreementAmount
    row.adjustedBudget = budgetMoney(change.price * row.quantity)
    row.adjustment = budgetMoney(row.adjustedBudget - row.previousBudget)
    row.adjustmentInput = { ...change, quantity: row.quantity, unit: row.unit }
  })
  budget.rows.concat(budget.personnel, budget.metadata.charityFinance.incentives).forEach(row => {
    if (row.adjustedBudget == null) row.adjustedBudget = row.agreementAmount == null ? 0 : row.agreementAmount
  })
  budget.metadata.adjustmentDate = '2026-07-15'
  budget.adjustmentHistory = [{ id: 'monthly-adjustment-1', time: '2026-07-15 10:00:00', budget: copyBudgetData(budget) }]
  budget.rows.concat(budget.personnel).forEach(row => {
    row.executed = budgetMoney((row.adjustedBudget == null ? row.agreementAmount : row.adjustedBudget) * 0.8)
  })
  budget.metadata.executionFilledAt = '2026-09-21'
  return budget
}
