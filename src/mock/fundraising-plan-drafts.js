import example from './fundraising-plan-detail.json'
import { clonePlan, loadPlanDetail, readPlanSnapshot, savePlanDetail } from './fundraising-plan-detail'

export const planRichFields = [
  { key: 'overview', title: '项目概述', hint: '全面概括项目，语言简练清晰，内容包括但不限于：项目区域、存在并准备去解决的问题或需求、项目对策和方法、项目目标或预期成效' },
  { key: 'background', title: '项目背景及行业现状', hint: '全面描述行业现状、项目背景，项目涉及的区域及其重要性，分析主要问题以及解决这些问题的必要性及紧迫性' },
  { key: 'goal', title: '项目目标', hint: '指在一定期限内，针对存在的核心问题，通过本项目的实施所要达到的效果' },
  { key: 'strategy', title: '项目策略', hint: '请说明项目实施的主要策略、方法以及与项目目标的关系' },
  { key: 'fundraisingPlan', title: '项目筹款方案', hint: '梳理现有或潜在、能触达的筹款方面资源，将如何开展筹款工作' },
  { key: 'communicationPlan', title: '项目传播方案', hint: '梳理现有或潜在、能触达的传播方面资源，将如何开展传播工作' },
  { key: 'monitoring', title: '项目监测评估', hint: '项目在执行中期、终期将如何进行项目自评自监测？是否有外部的监测评估？如有请展开说明' }
]
export const planUid = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
export function planTimestamp () {
  const date = new Date(), pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
const dateParts = (value, yearOnly) => {
  const matches = String(value || '').match(yearOnly ? /\d{4}/g : /\d{4}年\d{1,2}月\d{1,2}日/g) || []
  return matches.map(part => yearOnly ? Number(part) : part.replace(/年|月/g, '-').replace('日', '').split('-').map((n, i) => i ? n.padStart(2, '0') : n).join('-'))
}
export function createPlanDraft (record, plan, storage = window.localStorage) {
  const saved = record && readPlanSnapshot(record.id, storage)
  const application = record ? loadPlanDetail(record, storage).application : Object.assign(clonePlan(example), {
    id: planUid('plan-application-local'), name: '', planId: plan.id, planName: plan.name,
    department: '项目综合运营与拓展项目组', status: '草稿', updatedAt: '', code: '',
    planningPeriod: '', executionPeriod: '', plannedAmount: null, minimumAmount: null,
    team: '', fundUsePlan: '', outputs: [], attachments: [], auditHistory: [], reviewComments: {}
  })
  if (!saved) {
    application.planId = plan.id; application.planName = plan.name
    if (record) application.name = record.name
    // 第一条草稿保留部分业务内容，未填写项由用户继续补全。
    application.content = planRichFields.slice(0, 4).map(field => {
      const section = application.content.find(item => item.key === field.key)
      return { key: field.key, title: field.title, paragraphs: record && section ? section.paragraphs : [] }
    })
    application.otherContent = planRichFields.slice(4).map(field => {
      const section = application.otherContent.find(item => item.key === field.key)
      return record && section ? section : { key: field.key, title: field.title, paragraphs: [] }
    })
    if (!record) application.budget = Object.assign(clonePlan(example.budget), { rows: [], status: '待编辑', updatedAt: '', organization: '', period: '', partners: '' })

  }
  application.planId = application.planId || plan.id
  const years = dateParts(application.planningPeriod, true), dates = dateParts(application.executionPeriod, false)
  const currentYear = new Date().getFullYear()
  return Object.assign(application, {
    planningStart: application.planningStart || years[0] || currentYear, planningEnd: application.planningEnd || years[1] || undefined,
    executionStart: application.executionStart || dates[0] || '', executionEnd: application.executionEnd || dates[1] || '',
    content: planRichFields.slice(0, 4).map(field => application.content.find(item => item.key === field.key) || { key: field.key, title: field.title, paragraphs: [] })
  })
}
export function syncPlanPeriods (application) {
  const dateText = value => value ? value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1年$2月$3日') : ''
  application.planningPeriod = application.planningStart && application.planningEnd ? `${application.planningStart}年 至 ${application.planningEnd}年` : ''
  application.executionPeriod = application.executionStart && application.executionEnd ? `${dateText(application.executionStart)} 至 ${dateText(application.executionEnd)}` : ''
  application.budget.organization = application.team
  application.budget.period = application.executionPeriod
  return application
}
export function savePlanDraft (draft, submitted, storage = window.localStorage) {
  const previous = readPlanSnapshot(draft.id, storage)
  if (previous && previous.application.status === '规划待审') throw new Error('申请已提交审核，请返回列表查看最新状态')
  const next = syncPlanPeriods(clonePlan(draft))
  next.name = next.name.trim(); next.formVersion = 1; next.updatedAt = planTimestamp()
  next.status = submitted ? '规划待审' : previous ? previous.application.status : draft.status
  // 修改页保留审核端保存的完整意见，不覆盖其他标签页新增的意见。
  if (previous) { next.reviewComments = clonePlan(previous.application.reviewComments); next.auditHistory = clonePlan(previous.application.auditHistory) }
  savePlanDetail(next, previous ? previous.auditForm : { result: 'approved', remark: '', attachments: [] }, storage)
  return next
}
export function validatePlanDraft (draft, records, textOf) {
  const errors = []
  if (!draft.name.trim()) errors.push('请填写筹款规划申请名称')
  else if (records.some(item => item.id !== draft.id && item.name.trim().toLowerCase() === draft.name.trim().toLowerCase())) errors.push('筹款规划申请名称不可重复')
  if (![draft.planningStart, draft.planningEnd].every(year => Number.isInteger(year) && year >= 1900 && year <= 2200) || draft.planningStart > draft.planningEnd) errors.push('请选择有效的规划起止年份，结束年份不能早于开始年份')
  const validDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
    const parts = value.split('-').map(Number), date = new Date(parts[0], parts[1] - 1, parts[2])
    return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 && date.getDate() === parts[2]
  }
  if (!validDate(draft.executionStart) || !validDate(draft.executionEnd) || draft.executionStart > draft.executionEnd) errors.push('请选择有效的执行起止日期，结束日期不能早于开始日期')
  const validAmount = value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 999999999999.99
  if (!validAmount(draft.plannedAmount)) errors.push('请填写大于 0 的有效计划资金')
  if (!validAmount(draft.minimumAmount)) errors.push('请填写大于 0 的有效最低执行额')
  if (validAmount(draft.plannedAmount) && validAmount(draft.minimumAmount) && draft.minimumAmount > draft.plannedAmount) errors.unshift('最低执行额高于计划资金')
  if (!draft.team.trim()) errors.push('请填写执行团队')
  if (!draft.fundUsePlan.trim()) errors.push('请填写善款使用预案')
  planRichFields.forEach(field => {
    const section = draft.content.concat(draft.otherContent).find(item => item.key === field.key)
    if (!section || !textOf(section).trim()) errors.push('请填写' + field.title)
  })
  if (!draft.outputs.length) errors.push('请添加项目产出')
  draft.outputs.forEach((output, i) => {
    if (!output.name.trim() || !output.standard.trim()) errors.push(`请补全产出 ${i + 1} 的名称与衡量标准`)
    if (!output.activities.length) errors.push(`请为产出 ${i + 1} 添加活动`)
    output.activities.forEach(activity => {
      if (!activity.description || !activity.description.trim() || !activity.time || !activity.location || !activity.location.trim()) errors.push(`请补全产出 ${i + 1} 的活动信息`)
      const months = (String(activity.time || '').match(/\d{4}年\d{1,2}月/g) || []).map(item => item.replace('年', '-').replace('月', '').split('-').map((n, index) => index ? n.padStart(2, '0') : n).join('-'))
      if (months.length !== 2 || months[0] > months[1] || months.some(month => !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) || (draft.executionStart && months[0] < draft.executionStart.slice(0, 7)) || (draft.executionEnd && months[1] > draft.executionEnd.slice(0, 7))) errors.push(`产出 ${i + 1} 的活动时间须在项目执行周期内`)
    })
  })
  if (draft.budget.status !== '已编辑' || !draft.budget.rows.some(row => row.kind === 'detail')) errors.push('请编辑并保存项目预算')
  return errors
}
export function buildPlanBudget (base, rows) {
  const sums = [0, 0, 0, 0], format = amount => (amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const details = rows.map((row, index) => {
    const cents = row.values.map(value => Math.round(Number(value) * 100))
    cents.forEach((value, i) => { sums[i] += value })
    return Object.assign({}, row, { kind: 'detail', code: String(index + 1), quarters: cents.map(format), amount: cents.reduce((a, b) => a + b, 0) / 100, total: format(cents.reduce((a, b) => a + b, 0)) })
  })
  return Object.assign({}, base, { status: '已编辑', updatedAt: planTimestamp(), rows: [{ id: 'budget-total', kind: 'total', quarters: sums.map(format), total: format(sums.reduce((a, b) => a + b, 0)) }].concat(details) })
}
