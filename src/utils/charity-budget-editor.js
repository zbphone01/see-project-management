import { normalizeBudget, budgetMoney, budgetQuarterTotal } from './project-budget-data'
import { createCharityBudgetReviewData } from './charity-budget-review-data'

export const charityActivitySubjects = {
  款项捐赠: ['小额资助费'],
  物资捐赠: ['物资费'],
  专业人员成本: ['人力成本', '劳务费', '差旅补贴', '交通费用', '住宿费用', '餐费', '保险费用'],
  活动费用: ['宣传推广费', '监测评估审计费', '第三方服务购买费', '技术服务费', '租赁费', '设备购买费', '物资费', '活动物料费', '图文视频制作费'],
  运营费用: ['账号认证费', '行政办公费', '折旧费', '修理费', '水电费', '邮电费', '物业管理费']
}
export const charityPersonnelSubjects = ['薪金及补贴', '差旅费', '交通费', '餐费']
export const charityCostAmount = row => budgetMoney(Number(row.price) * Number(row.quantity))
const isPublicFee = row => row.name === '公募机构管理费' || row.type === '公募机构管理费'
const publicFeeAmount = rows => {
  const base = budgetMoney(rows.filter(row => !isPublicFee(row)).reduce((sum, row) => sum + budgetQuarterTotal(row), 0))
  return base > 0 ? budgetMoney(base / 95 * 5) : null
}

// 编辑真实预算，只初始化缺失的联合公益资料，不注入查看页的演示明细。
export function prepareCharityBudget (value) {
  const budget = normalizeBudget(value)
  const finance = { publicManagementFee: 0, incentives: [], ...(budget.metadata.charityFinance || {}) }
  const publicFees = budget.rows.filter(isPublicFee)
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  const fee = publicFeeAmount(budget.rows.concat(personnel))
  const automaticFee = { adjustmentDetail: null, adjustment: null, adjustedBudget: null, executed: null, description: '',
    ...(publicFees[0] || {}), id: publicFees.length ? publicFees[0].id : 'charity-public-management-fee',
    kind: 'support', name: '公募机构管理费', type: '公募机构管理费', charityAutomatic: true,
    price: fee, quantity: 1, unit: '项', quarters: [fee || 0, 0, 0, 0],
    outputId: null, activityId: null }
  budget.rows = [automaticFee].concat(budget.rows.filter(row => !isPublicFee(row)))
  finance.publicManagementFee = fee || 0
  if (!finance.incentives.length) finance.incentives = ['平台激励', '北京市企业家环保基金会激励'].map((name, index) => ({
    id: 'charity-incentive-' + index, name, quarters: [0, 0, 0, 0], agreementAmount: null, adjustment: null, adjustedBudget: null, executed: null
  }))
  budget.metadata.charityFinance = finance
  return budget
}

export function charityManagementRatio (budget, candidate, removedId) {
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  const rows = budget.rows.concat(personnel).filter(row => !isPublicFee(row) && row.id !== removedId && (!candidate || row.id !== candidate.id))
  if (candidate) rows.push(candidate)
  const total = budgetMoney(rows.reduce((sum, row) => sum + budgetQuarterTotal(row), 0) + (publicFeeAmount(rows) || 0))
  const management = budgetMoney(rows.filter(row => row.type === '执行机构管理费').reduce((sum, row) => sum + budgetQuarterTotal(row), 0))
  return { total, management, ratio: total ? management / total : 0, invalid: management > 0 && (!total || management > total * 0.05) }
}

export function charityPersonnelActivityTotal (budget) {
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  return budgetMoney(budget.rows.filter(row => row.kind === 'activity').concat(personnel).reduce((sum, row) => sum + budgetQuarterTotal(row), 0))
}

export function validateCharityCost (row) {
  if (!String(row.name || '').trim()) return '请填写预算科目'
  if (!String(row.type || '').trim()) return '请选择费用类型'
  for (const field of ['price', 'quantity']) {
    const value = row[field], label = field === 'price' ? '单价' : '数量'
    if (value == null || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 1000000000) return '请填写大于0且不超过10亿的' + label
    if (Number(Number(value).toFixed(2)) !== Number(value)) return label + '最多支持两位小数'
  }
  if (!String(row.unit || '').trim()) return '请填写单位'
  if (charityCostAmount(row) > 1000000000) return '预算合计不能超过10亿元'
  if (charityCostAmount(row) !== budgetQuarterTotal(row)) return '预算合计须等于单价 × 数量'
  return ''
}

export function charityEditorRows (value, editable = true) {
  const budget = prepareCharityBudget(value)
  const review = createCharityBudgetReviewData(budget)
  const rows = review.rows.map(row => ({ ...row, charityEditable: !!row.cost && !row.mergeLeading && row.type !== '公募机构管理费' && row.name !== '公募机构管理费' }))
  if (!editable) return rows
  const insertAction = (key, costKind, action, note, activity) => {
    let index = rows.findIndex(row => row.key === key)
    while (index + 1 < rows.length && rows[index + 1].kind === 'detail') index++
    if (index >= 0) rows.splice(index + 1, 0, { key: 'add:' + key, kind: 'action', costKind, action, note, ...(activity || {}) })
  }
  insertAction('support', 'support', '添加执行机构管理费', '请先录入人员成本和活动费用，录入执行机构管理费时，比例不能超过项目募集总金额的5%', { disabled: charityPersonnelActivityTotal(budget) <= 0 })
  insertAction('personnel', 'personnel', '添加人员成本', '录入运营人员成本的预算科目、单价和数量')
  budget.groups.forEach(output => (output.activities || []).forEach(activity => {
    insertAction('activity:' + activity.id, 'activity', '添加活动费用', '活动无需预算时可不添加费用', {
      outputId: output.id, activityId: activity.id, activityName: (activity.code || '') + ' ' + activity.name
    })
  }))
  return rows
}

export function validateCharityBudget (budget) {
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  for (const row of budget.rows.concat(personnel)) {
    if (row.charityAutomatic && isPublicFee(row)) continue
    const record = personnel.includes(row) && row.price == null && row.monthly != null
      ? { ...row, price: row.monthly, quantity: row.months, unit: row.unit || '月', type: row.type || '运营人员成本' } : row
    const error = validateCharityCost(record)
    if (error) return row.name + '：' + error
  }
  return ''
}
