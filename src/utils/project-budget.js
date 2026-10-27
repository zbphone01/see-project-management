import { normalizeBudget, buildBudgetRows, budgetQuarterTotal, budgetPersonnelAmount } from './project-budget-data'
export { normalizeBudget, buildBudgetRows } from './project-budget-data'
import { clone, roundMoney } from '../mock/project-drafts'

export const budgetWidths = [90, 120, 210, 80, 80, 80, 80, 80, 100, 100, 60, 210, 100, 100, 60]
export const budgetColumns = ['预算编号', '预算科目', '预算明细（单价*数量）', '费用类型', '第一期预算', '第二期预算', '第三期预算', '第四期预算', '预算合计金额', '预算调整金额', '预算变动比例', '预算调整明细', '调整后预算', '执行金额', '执行比例']
export const costTypes = ['劳务费', '交通差旅费', '会议及培训费', '大型活动及宣传费', '资助款', '物资费', '办公运行费', '第三方采购费', '税费', '其他费用']
export const supportSubjects = ['办公用品', '办公室房租', '行政办公', '增值税税费', '其他']
export const budgetStatus = budget => budget && budget.editStatus === 'completed' ? '已完成编辑' : budget && budget.editStatus === 'editing' ? '编辑中' : '待编辑'
export const canViewBudget = budget => budgetStatus(budget) !== '待编辑'
export const rowTotal = budgetQuarterTotal
export const detailTotal = row => roundMoney(Number(row.price) * Number(row.quantity))
export const budgetKey = route => [route.params.id, (!route.query.detailType || route.query.detailType === 'default') ? 'project' : route.query.detailType, route.query.fresh === '1' ? 'fresh' : 'existing', route.query.example === 'filled' ? 'filled' : 'default'].join(':')
export function prepareBudgetContext (route, draft, donationProject, savedSnapshot) {
  const key = budgetKey(route)
  sessionStorage.setItem('see-budget-context:' + key, JSON.stringify({ draft: { ...clone(draft), budget: normalizeBudget(draft.budget, draft) }, donationProject, savedSnapshot, returnTo: { name: 'project-form', params: { id: route.params.id }, query: { ...route.query, budgetReturn: '1' } } }))
  clearBudgetWorking(key)
  return key
}
export function readBudgetContext (key) {
  const raw = sessionStorage.getItem('see-budget-context:' + key)
  if (raw) return JSON.parse(raw)
  const project = readBudgetProject(key)
  if (!project) return null
  const parts = key.split(':')
  const query = { budgetReturn: '1' }
  if (parts[1] !== 'project') query.detailType = parts[1]
  if (parts[2] === 'fresh') query.fresh = '1'
  if (parts[3] === 'filled') query.example = 'filled'
  return { draft: project, savedSnapshot: JSON.stringify(project), returnTo: { name: 'project-form', params: { id: parts[0] }, query } }
}
export function clearBudgetContext (key) { sessionStorage.removeItem('see-budget-context:' + key) }
// 本地存储只是接口仓库的演示实现，权威预算位于文档的 project.budget。
const documentKey = key => 'see-project-budget-document-v1:' + key
export function readBudgetProject (key) {
  const raw = localStorage.getItem(documentKey(key))
  if (!raw) return null
  const document = JSON.parse(raw)
  if (document.schemaVersion !== 1 || document.key !== key || !document.project || String(document.project.id) !== key.split(':')[0]) throw new Error('项目预算文档与项目不匹配')
  return { ...document.project, budget: normalizeBudget(document.project.budget, document.project) }
}
export function readSavedBudget (key) {
  const project = readBudgetProject(key)
  if (project) return project.budget
  const raw = localStorage.getItem('see-budget-sheet:' + key)
  if (!raw) return null
  const budget = JSON.parse(raw)
  if (!Array.isArray(budget.rows) || !Array.isArray(budget.personnel)) throw new Error('预算数据无法读取')
  const context = readBudgetContext(key)
  return normalizeBudget(budget, context ? context.draft : {})
}
export function saveProjectBudget (key, project) {
  if (String(project.id) !== key.split(':')[0]) throw new Error('项目 ID 不匹配')
  const payload = { ...clone(project), budget: normalizeBudget(project.budget, project), reviewComments: clone(project.reviewComments || {}) }
  const current = readBudgetProject(key)
  if (current && current.budget.revision !== payload.budget.revision) throw new Error('预算已在其他页面更新，请刷新后重新编辑')
  payload.budget.revision++
  localStorage.setItem(documentKey(key), JSON.stringify({ schemaVersion: 1, key, project: payload }))
  return payload.budget
}
export function saveBudgetSheet (key, budget, status) {
  const context = readBudgetContext(key)
  const project = context ? context.draft : readBudgetProject(key)
  if (!project) throw new Error('缺少项目预算上下文')
  const saved = normalizeBudget({ ...clone(budget), editStatus: status, updatedAt: new Date().toISOString() }, project)
  return saveProjectBudget(key, { ...project, budget: saved })
}
export function emptyBudget (budget, project = {}) {
  return normalizeBudget(budget || {}, project)
}
export function validateCost (row) {
  if (!String(row.name || '').trim()) return '请填写预算科目'
  if (!costTypes.includes(row.type)) return '请选择费用类型'
  if (row.price === null || row.price === undefined || String(row.price).trim() === '') return '请填写预算项明细单价'
  if (!Number.isFinite(Number(row.price)) || Number(row.price) <= 0 || Number(row.price) > 1000000000) return '请填写大于 0 且不超过 10 亿元的单价'
  if (row.quantity === null || row.quantity === undefined || String(row.quantity).trim() === '') return '请填写预算项明细数量'
  if (!Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0 || Number(row.quantity) > 1000000000) return '请填写有效的数量'
  if (!String(row.description || '').trim()) return '请填写明细'
  if (!Array.isArray(row.quarters) || row.quarters.length !== 4 || row.quarters.some(value => value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1000000000)) return '请填写四期预算金额，不需预算的期数填写 0'
  if (detailTotal(row) > 1000000000) return '预算明细合计不能超过 10 亿元'
  if (detailTotal(row) !== rowTotal(row)) return '分期预算合计须等于单价 × 数量的预算明细合计'
  return ''
}

export const personnelAmount = budgetPersonnelAmount
export function personnelBudgetMissing (row) {
  const missing = value => value === null || value === undefined || String(value).trim() === ''
  return ['nature', 'monthly', 'months', 'ratio', 'remark'].some(field => missing(row[field])) || !Array.isArray(row.quarters) || row.quarters.length !== 4 || row.quarters.some(missing)
}
export function initializePersonnel (draft, saved) {
  if (saved && saved.length) return clone(saved)
  const team = draft.organizationMembers || draft.team || []
  return team.map(member => ({ id: member.id, memberId: member.id, name: member.name, position: member.position, responsibilities: member.responsibilities, nature: undefined, monthly: null, months: null, ratio: null, quarters: [null, null, null, null], remark: undefined }))
}
export function executionMonths (draft) {
  const parse = value => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''))
    if (!match) return null
    const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? { time: date.getTime(), month: year * 12 + month } : null
  }
  const start = parse(draft.start), end = parse(draft.end)
  return start && end && end.time >= start.time ? end.month - start.month + 1 : null
}
export function validatePersonnel (row, draft) {
  if (personnelBudgetMissing(row)) return '请填写完整人员预算，所有录入项均需填写'
  if (!row.id || !String(row.name || '').trim()) return '人员资料不完整，请先完善执行团队'
  if (!['项目人员', '行政管理人员'].includes(row.nature)) return '请选择人员性质：项目人员或行政管理人员'
  for (const field of ['monthly', 'months', 'ratio']) {
    if (row[field] === null || row[field] === '' || !Number.isFinite(Number(row[field])) || Number(row[field]) < 0) return '请填写有效的月成本、月份数和人力占比'
  }
  if (row.ratio > 100 || row.monthly > 1000000000 || row.months > 1200 || !Number.isInteger(Number(row.months))) return '人力占比须为 0–100%，月份数须为 0–1200 的整数，月成本不得超过 10 亿元'
  if (draft) {
    const months = executionMonths(draft)
    if (months === null) return '请先在项目信息中填写有效的执行周期'
    if (Number(row.months) > months) return '承担月份数不得超过项目执行周期的 ' + months + ' 个月（含起止月份）'
  }
  if (!Array.isArray(row.quarters) || row.quarters.length !== 4 || row.quarters.some(value => value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 1000000000)) return '请填写四期金额，不承担费用的期数填写 0'
  if (personnelAmount(row) > 1000000000) return '人力成本总额不得超过 10 亿元'
  if (personnelAmount(row) !== rowTotal(row)) return '人力成本总额须等于人力成本分期合计'
  return ''
}
export function readBudgetWorking (key) {
  const raw = sessionStorage.getItem('see-budget-working:' + key)
  return raw ? JSON.parse(raw) : null
}
export function writeBudgetWorking (key, value) {
  sessionStorage.setItem('see-budget-working:' + key, JSON.stringify(value))
}
export function clearBudgetWorking (key) { sessionStorage.removeItem('see-budget-working:' + key) }
export function savePersonnelSheet (key, context, personnel) {
  const base = readSavedBudget(key) || emptyBudget(context.draft.budget, context.draft)
  const saved = saveBudgetSheet(key, { ...base, personnel: clone(personnel), legacyPersonnel: [], personnelStatus: 'completed', personnelUpdatedAt: new Date().toISOString() }, base.editStatus === 'completed' ? 'editing' : base.editStatus)
  const working = readBudgetWorking(key)
  if (working) {
    working.budget.personnel = clone(personnel)
    working.budget.legacyPersonnel = []; working.budget.personnelStatus = 'completed'
    working.budget.personnelUpdatedAt = saved.personnelUpdatedAt
    working.budget.editStatus = saved.editStatus
    working.budget.revision = saved.revision
    // 人力费用已经独立保存，其他未保存的明细仍维持原有脏状态。
    const snapshot = JSON.parse(working.snapshot)
    snapshot.personnel = clone(personnel)
    snapshot.legacyPersonnel = []; snapshot.personnelStatus = 'completed'
    snapshot.personnelUpdatedAt = saved.personnelUpdatedAt
    snapshot.editStatus = saved.editStatus
    snapshot.revision = saved.revision
    working.snapshot = JSON.stringify(snapshot)
    writeBudgetWorking(key, working)
  }
  return saved
}
