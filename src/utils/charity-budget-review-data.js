import { createBudgetReviewData } from './budget-review-data'
import { budgetBaseAmount, budgetQuarterTotal, budgetMoney, hasBudgetAdjustment } from './project-budget-data'

export const charityBudgetWidths = [180, 100, 75, 50, 75, 100, 120, 160, 100, 160, 75, 120, 120, 95]

// 联合公益查看及历史共用行结构，所有汇总由原始明细派生。
export function createCharityBudgetReviewData (value) {
  const review = createBudgetReviewData(value)
  const finance = review.budget.metadata.charityFinance
  if (!finance) return review
  const agreement = finance.agreementAmounts || {}
  const sum = (records, field, fallback) => records.some(row => row[field] != null)
    ? budgetMoney(records.reduce((total, row) => total + Number(row[field] == null ? (fallback ? fallback(row) : 0) : row[field]), 0)) : null
  const personnel = review.budget.personnel.length ? review.budget.personnel : review.budget.legacyPersonnel
  const records = review.budget.rows.concat(personnel)
  const decorate = row => {
    const items = row.cost ? [row.cost] : row.key === 'personnel' ? personnel
      : row.key === 'total' ? records : row.key === 'support' ? review.budget.rows.filter(item => item.kind === 'support')
        : records.filter(item => item.outputId === row.outputId && (row.kind !== 'activity' || item.activityId === row.id.replace('activity:', '')))
    return { ...row, initialTotal: row.cost && row.cost.charityAutomatic && row.cost.price == null ? null : row.initialTotal, agreementAmount: sum(items, 'agreementAmount') }
  }
  const detail = (record, key) => {
    const total = budgetBaseAmount(record), adjustedBudget = record.adjustedBudget
    const base = adjustedBudget == null ? total : adjustedBudget
    return { key, id: record.id, kind: 'detail', code: '', name: record.name, type: record.type,
      quarters: record.quarters, total, initialTotal: budgetQuarterTotal(record),
      agreementAmount: record.agreementAmount, adjustedBudget, adjustment: record.adjustment,
      hasBudgetAdjustment: hasBudgetAdjustment(record), cost: record, description: record.description,
      adjustmentRatio: record.adjustment == null || !total ? null : (record.adjustment / total * 100).toFixed(1) + '%',
      executed: record.executed, executionRatio: record.executed == null || !base ? null : (record.executed / base * 100).toFixed(1) + '%' }
  }
  const rows = review.rows.filter(row => row.key !== 'personnel-detail').map(decorate)
  const personnelIndex = rows.findIndex(row => row.key === 'personnel')
  rows[personnelIndex] = { ...rows[personnelIndex], code: '', name: '项目人员成本' }
  rows.splice(personnelIndex + 1, 0, ...(review.budget.personnel.length ? review.budget.personnel : review.budget.legacyPersonnel).map(row => detail(row, row.id)))
  const total = { ...rows.shift(), code: '', name: '项目募集资金总金额（项目支撑费用+项目人员成本+产出活动费用）' }
  const incentiveRecords = finance.incentives || []
  const incentives = incentiveRecords.map((row, index) => {
    const agreementKey = index === 0 ? 'platform' : 'foundation'
    return { ...detail(row, row.id), agreementKey, agreementAmount: agreement[agreementKey] == null ? row.agreementAmount : agreement[agreementKey], mergeLeading: true, historyBaseAmount: budgetQuarterTotal(row) }
  })
  const publicFeeRow = rows.find(row => row.type === '公募机构管理费')
  if (publicFeeRow) {
    publicFeeRow.agreementKey = 'publicFee'
    if (agreement.publicFee != null) publicFeeRow.agreementAmount = agreement.publicFee
  }
  total.agreementKey = 'fundraising'
  if (agreement.fundraising != null) total.agreementAmount = agreement.fundraising
  const incentiveTotal = {
    key: 'charity-incentives', id: 'charity-incentives', kind: 'group', code: '',
    name: '激励费用金额（筹款平台激励+基金会激励）', quarters: [0, 0, 0, 0],
    initialTotal: null, total: null, historyBaseAmount: budgetMoney(incentiveRecords.reduce((value, row) => value + budgetQuarterTotal(row), 0)), agreementAmount: sum(incentives, 'agreementAmount'),
    adjustment: sum(incentiveRecords, 'adjustment'), adjustedBudget: sum(incentiveRecords, 'adjustedBudget', budgetBaseAmount),
    executed: sum(incentiveRecords, 'executed'), hasBudgetAdjustment: incentives.some(row => row.hasBudgetAdjustment)
  }
  const incentiveBefore = budgetMoney(incentiveRecords.reduce((value, row) => value + budgetBaseAmount(row), 0))
  incentiveTotal.adjustmentRatio = incentiveTotal.adjustment == null || !incentiveBefore ? null : (incentiveTotal.adjustment / incentiveBefore * 100).toFixed(1) + '%'
  const incentiveBase = incentiveTotal.adjustedBudget == null ? incentiveTotal.agreementAmount : incentiveTotal.adjustedBudget
  incentiveTotal.executionRatio = incentiveTotal.executed == null || !incentiveBase ? null : (incentiveTotal.executed / incentiveBase * 100).toFixed(1) + '%'
  const fee = Number(finance.publicManagementFee || 0)
  const allocation = { ...total, agreementKey: undefined, key: 'charity-allocation', id: 'charity-allocation',
    name: '协议拨款额（项目募集资金总额-公募机构管理费+激励费用）',
    initialTotal: budgetMoney(total.initialTotal - fee), total: budgetMoney(total.total - fee + incentiveBefore),
    historyBaseAmount: budgetMoney(total.initialTotal - fee + incentiveTotal.historyBaseAmount),
    agreementAmount: total.agreementAmount == null && incentiveTotal.agreementAmount == null ? null : budgetMoney(total.agreementAmount - fee + incentiveTotal.agreementAmount),
    adjustment: total.adjustment == null && incentiveTotal.adjustment == null ? null : budgetMoney((total.adjustment || 0) + (incentiveTotal.adjustment || 0)),
    adjustedBudget: total.adjustedBudget == null && incentiveTotal.adjustedBudget == null ? null : budgetMoney((total.adjustedBudget == null ? total.total : total.adjustedBudget) - fee + incentiveBase),
    executed: total.executed == null && incentiveTotal.executed == null ? null : budgetMoney((total.executed || 0) + (incentiveTotal.executed || 0)),
    hasBudgetAdjustment: total.hasBudgetAdjustment || incentiveTotal.hasBudgetAdjustment }
  if (finance.agreementAmounts) {
    allocation.agreementAmount = ['fundraising', 'publicFee', 'platform', 'foundation'].every(key => agreement[key] != null)
      ? budgetMoney(agreement.fundraising - agreement.publicFee + agreement.platform + agreement.foundation) : null
  }
  allocation.adjustmentRatio = allocation.adjustment == null || !allocation.total ? null : (allocation.adjustment / allocation.total * 100).toFixed(1) + '%'
  allocation.executionRatio = allocation.executed == null || !allocation.adjustedBudget ? null : (allocation.executed / allocation.adjustedBudget * 100).toFixed(1) + '%'
  // 激励不属于上线筹款预算，仅计入协议拨款及调整后的可执行金额。
  incentives.forEach(row => { row.initialTotal = null; row.total = null; row.code = '' })
  rows.forEach(row => { if (row.key === 'support') row.code = '' })
  return { budget: review.budget, rows: [allocation, incentiveTotal].concat(incentives, total, rows) }
}
