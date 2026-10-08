import example from './fundraising-application-detail.json'
import { uppercaseMoney } from './project-drafts'

export const fundraisingStorageKey = 'see-fundraising-application-example-v1'
export const attachmentTypes = ['诚信承诺函', '项目上线文案', '其他附件']
export const contentHints = {
  organizationIntroduction: '说明机构由来及组织规模及业务内容等',
  businessAchievements: '1、清晰列出本机构开展的业务，进行概述性描述：\n重点说明业务为了解决哪些社会问题？以及该工作开展的必要性和紧迫性、工作手法、自开展至今的工作成效，以及后续的发展规划\n2、介绍整体项目规划，介绍规划项目的目前处于什么的发展阶段？推进了什么？未完成什么？未完成的后续规划？',
  experience: '请描述项目执行团队成员的项目管理或执行经验，如涉及专家团队、志愿者团队请扩充描述该专业性。',
  purpose: '请描述的文字简洁，不超过5句话、100字内；建议句式逻辑“通过开展...行动/活动，达成...目的/愿景”；',
  goal: '参考：\n核心撰写原则-SMART原则\n请确保您的目标符合SMART原则，这是让目标变得专业、可信的关键：\nS（具体的）： 目标必须清晰明确，不模棱两可。\nM（可衡量的）： 目标必须可以量化，有具体的数字或标准来衡量是否达成。\nA（可实现的）： 目标在现有资源和约束下是可能实现的。\nR（相关的）： 目标与项目的总体使命和宗旨高度相关。\nT（有时限的）： 目标有明确的完成时间。\n建议话术1：本项目针对【明确描述的问题】，该问题导致了【负面的影响】。我们的解决方案是【简述具体解决方案】以达到【有数据支撑】的项目目的/目标。\n建议话术2：在【时间】内，为【目标用户】解决【社会环境痛点问题】，通过【具体描述项目专业手法】，实现【可量化的结果】。',
  importance: '分析说明机构开展公募项目的原因，可具体与机构自身业务结合，例如公众倡导类项目，通过公募能够增加项目透明度、公信力和曝光度等，描述过程需要体现公募项目重要性。',
  executionPlan: 'xx时间xx地点xx开展xxx活动【可量化的数据指标】，请按照半年/年度做活动开展规划。',
  donationUsePlan: '该栏和最低执行额做关联，为最低执行额的善款使用预案。\n例如：最低执行额为1万元，善款使用预案为开展项目中的自然教育活动1场次，预计20名核心志愿者参与，公众倡导覆盖100人，资金使用为自然教育课程研发、授课专家讲师费、志愿者补贴等。',
  fundraisingPlan: '梳理机构人力物力、筹款传播方面的资源有哪些？\n可分清现有资源和潜在资源，逐一列出；并说明资源将如何利用/开发？\n如何发展月度/季度/年度的单次或者可复捐的捐赠人？是否有核心志愿者或筹款传播的公众社群运营？是否设置捐赠人爱心回礼回馈动作？捐赠人维护详细计划等？',
  pastFundraising: '机构是否有公募项目？\n如有，分别在哪些平台上线筹款？请附项目筹款链接。\n如果没有，请在填写“过往无项目”'
}
export const clone = value => JSON.parse(JSON.stringify(value))
export const ratioTotal = rows => Math.round(rows.reduce((sum, row) => sum + (Number(row.ratio) || 0), 0) * 100) / 100
export function readNumber (value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const match = String(value).replace(/,/g, '').trim().match(/^(-?\d+(?:\.\d+)?)(?:\s*(?:%|元|$))/)
  return match ? Number(match[1]) : null
}
export function parseDate (value) {
  const match = String(value || '').trim().match(/^(\d{4})[年-](\d{1,2})[月-](\d{1,2})日?$/)
  return match ? `${match[1]}-${('0' + match[2]).slice(-2)}-${('0' + match[3]).slice(-2)}` : ''
}
export function validDate (value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false
  const parts = value.split('-').map(Number), date = new Date(parts[0], parts[1] - 1, parts[2])
  return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 && date.getDate() === parts[2]
}
export function normalizeFundraising (application) {
  const draft = clone(application)
  const base = clone(example)
  ;['basicFields', 'content', 'amountFields', 'annualFunds', 'fundDirections', 'images', 'attachments', 'auditHistory'].forEach(key => {
    if (!Array.isArray(draft[key])) draft[key] = base[key]
  })
  draft.reviewComments = draft.reviewComments && typeof draft.reviewComments === 'object' && !Array.isArray(draft.reviewComments) ? draft.reviewComments : {}
  draft.rejectionOpinion = typeof draft.rejectionOpinion === 'string' ? draft.rejectionOpinion : ''
  const period = draft.basicFields.find(field => field.key === 'fundraisingPeriod')
  const parts = String(period && period.value || '').split('至')
  draft.periodStart = Object.prototype.hasOwnProperty.call(draft, 'periodStart') ? draft.periodStart : parseDate(parts[0])
  draft.periodEnd = Object.prototype.hasOwnProperty.call(draft, 'periodEnd') ? draft.periodEnd : parseDate(parts[1])
  draft.amountFields.forEach(field => { field.amount = readNumber(Object.prototype.hasOwnProperty.call(field, 'amount') ? field.amount : field.value) })
  draft.annualFunds.forEach(year => { year.rows.forEach(row => { row.amount = readNumber(row.amount); row.ratio = readNumber(row.ratio) }) })
  draft.fundDirections.forEach(row => { row.ratio = readNumber(row.ratio) })
  // Only the prototype's fixed management fee is locked; keep every stable row ID.
  const fixed = draft.fundDirections.find(row => row.id === 'direction-management')
  if (fixed) { fixed.ratio = 5; fixed.editable = false }
  draft.content.forEach(section => {
    if (section.type === 'text' && !Object.prototype.hasOwnProperty.call(section, 'html') && Array.isArray(section.paragraphs) && section.paragraphs.length === 1 && section.paragraphs[0] === '暂无') section.html = ''
  })
  return draft
}
const draftStorageKey = id => id === 'new-2' ? fundraisingStorageKey + '-new-2' : fundraisingStorageKey
export function createNewFundraisingDraft (recruitment) {
  const initial = clone(example)
  initial.id = 'new-2'; initial.recruitment = recruitment || ''; initial.version = ''; initial.status = '草稿'; initial.agreementCode = ''; initial.rejectionOpinion = ''; initial.reviewComments = {}; initial.auditHistory = []; initial.savedAt = ''
  initial.basicFields.forEach(field => { field.value = '' })
  initial.content.forEach(section => { section.html = ''; section.paragraphs = []; delete section.links })
  initial.amountFields.forEach(field => { field.value = ''; field.amount = null })
  initial.annualFunds.forEach(year => { year.rows = [] })
  initial.fundDirections = initial.fundDirections.filter(row => row.editable === false)
  initial.images = []; initial.attachments = []; initial.periodStart = ''; initial.periodEnd = ''
  return normalizeFundraising(initial)
}
export function loadFundraisingDraft (id, recruitment) {
  if (id === 'new-2') {
    const stored = JSON.parse(window.localStorage.getItem(draftStorageKey(id)) || 'null')
    return stored && stored.application && stored.application.id === id ? normalizeFundraising(stored.application) : createNewFundraisingDraft(recruitment)
  }
  const stored = JSON.parse(window.localStorage.getItem(fundraisingStorageKey) || 'null')
  if (stored && stored.application && stored.application.id === example.id) return normalizeFundraising(stored.application)
  const initial = clone(example)
  initial.version = initial.version.replace('（版本作废）', '')
  initial.status = '草稿'; initial.agreementCode = ''; initial.auditHistory = []
  return normalizeFundraising(initial)
}
export function serializeFundraising (draft) {
  const application = clone(draft)
  const dateText = value => value ? value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1年$2月$3日') : ''
  const period = application.basicFields.find(field => field.key === 'fundraisingPeriod')
  if (period) period.value = `${dateText(application.periodStart)} 至 ${dateText(application.periodEnd)}`
  application.amountFields.forEach(field => { field.amount = readNumber(field.amount); field.value = field.amount === null ? '' : `${field.amount.toLocaleString('zh-CN', { maximumFractionDigits: 2 })} 元（${uppercaseMoney(field.amount)}）` })
  application.annualFunds.forEach(year => year.rows.forEach(row => { row.amount = readNumber(row.amount); const ratio = readNumber(row.ratio); row.ratio = ratio === null ? '' : ratio + ' %' }))
  application.fundDirections.forEach(row => { const ratio = readNumber(row.ratio); row.ratio = ratio === null ? '' : ratio + ' %' })
  return application
}
export function saveFundraisingDraft (draft) {
  let stored = {}
  try { stored = JSON.parse(window.localStorage.getItem(draftStorageKey(draft.id)) || 'null') || {} } catch (error) { /* An explicit save can replace an unreadable draft. */ }
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  const application = serializeFundraising(draft)
  application.savedAt = savedAt
  window.localStorage.setItem(draftStorageKey(draft.id), JSON.stringify({ application, auditForm: stored.auditForm }))
  return savedAt
}
const numeric = (value, max, precision) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && Math.abs(value * Math.pow(10, precision) - Math.round(value * Math.pow(10, precision))) < 0.00001
export function validateFundraising (draft, richText, availableFiles = []) {
  const errors = []
  ;['诚信承诺函', '项目上线文案'].forEach(type => {
    if (!draft.attachments.some(file => file.type === type && file.blobKey && availableFiles.includes(file.id))) errors.push('请上传' + type + '后再提交申请')
  })
  const get = key => { const field = draft.basicFields.find(item => item.key === key); return String(field && field.value || '').trim() }
  ;[['name', '项目名称'], ['leader', '申请人'], ['phone', '联系方式']].forEach(([key, label]) => { if (!get(key)) errors.push('请填写' + label) })
  if (get('phone') && (!/^[+\d\s()-]{6,25}$/.test(get('phone')) || get('phone').replace(/\D/g, '').length < 6)) errors.push('请填写有效的联系电话')
  if (!validDate(draft.periodStart) || !validDate(draft.periodEnd)) errors.push('请完整选择有效的预计筹款起止日期')
  else if (draft.periodStart > draft.periodEnd) errors.push('预计筹款结束日期不得早于开始日期')
  draft.content.filter(section => section.type === 'text').forEach(section => {
    if (!String(richText[section.key] || '').trim()) errors.push('请填写' + section.title)
  })
  if (String(richText.purpose || '').replace(/\s/g, '').length > 100) errors.push('募捐目的不得超过 100 字')
  if (String(richText.purpose || '').split(/[。！？!?]+/).filter(sentence => sentence.trim()).length > 5) errors.push('募捐目的不得超过 5 句话')
  draft.amountFields.forEach(field => { if (!numeric(field.amount, 1000000000, 2) || field.amount <= 0) errors.push(field.label + '须大于 0、最多两位小数且不超过 10 亿元') })
  const target = draft.amountFields.find(field => field.key === 'fundraisingTarget'), minimum = draft.amountFields.find(field => field.key === 'minimumExecutionAmount')
  if (target && minimum && minimum.amount > target.amount) errors.push('最低执行额不得高于筹款目标')
  draft.annualFunds.forEach(year => {
    if (!year.rows.length || year.rows.some(row => !String(row.source || '').trim() || !numeric(row.amount, 1000000000, 4) || !numeric(row.ratio, 100, 2))) errors.push(year.year + '的资金来源、资金量或占比未完整填写')
    if (ratioTotal(year.rows) !== 100) errors.push(year.year + '活动成本中的机构年度总收入占比合计须为 100%')
  })
  if (draft.fundDirections.some(row => !String(row.direction || '').trim() || !String(row.description || '').trim() || !numeric(row.ratio, 100, 2))) errors.push('请完整填写公募资金使用方向、比例和具体支出')
  if (ratioTotal(draft.fundDirections) !== 100) errors.push('公募资金分配比例合计须为 100%')
  const fixed = draft.fundDirections.find(row => row.id === 'direction-management')
  if (!fixed || fixed.ratio !== 5 || fixed.editable !== false) errors.push('固定公募管理费须为 5%')
  draft.content.forEach(section => (section.links || []).forEach(link => {
    let validUrl = false
    try { const url = new URL(String(link.url || '').trim()); validUrl = ['http:', 'https:'].includes(url.protocol) && !!url.hostname } catch (error) { /* Report malformed links with the other validation errors. */ }
    if (!String(link.label || '').trim() || !validUrl) errors.push('请完整填写筹款链接名称及有效的 HTTP 或 HTTPS 地址')
  }))
  return errors
}
