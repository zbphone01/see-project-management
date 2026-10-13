import source from './project-grass-detail.json'
import { createDraft, clone, roundMoney } from './project-drafts'
const storageKey = 'see-grass-project-draft-v1-9'
const escape = text => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rich = paragraphs => paragraphs.map(text => '<p>' + escape(text).replace(/\n/g, '<br>') + '</p>').join('')
export const grassCoachingOptions = ['战略定位', '业务模式梳理', '资源调动', '组织治理', '财务管理']
export const grassDecisionOptions = [
  { id: 'decision-body-1', label: '成员大会及其常务机构（或其他形式的成员会议）' },
  { id: 'decision-body-2', label: '理事会（或董事会）' },
  { id: 'decision-body-3', label: '组织负责人（主任、CEO、会长等职务）' },
  { id: 'decision-body-4', label: '其他' }
]
export function createGrassDraft () {
  const data = clone(source), basic = data.basic, organization = data.organizationBasicInfo
  const funding = String(basic.otherLocalFunding || '').match(/(?:^|\n)([\d,]+(?:\.\d+)?)\s*元[^\n]*$/)
  const draft = { ...createDraft(9), ...basic, detailType: 'grass', code: 'ZZ-1764740243', recruitment: '劲草项目招募',
    targets: basic.targets.split(/[、，,]/), thirdParties: basic.thirdParties === '无' ? [] : basic.thirdParties.split('、'),
    start: '2024-12-01', end: '2026-02-28', total: 200000, requested: 200000, matching: 0,
    otherLocalFundingDescription: funding ? basic.otherLocalFunding.slice(0, funding.index).trim() : basic.otherLocalFunding,
    otherLocalFundingAmount: funding ? Number(funding[1].replace(/,/g, '')) : null,
    environmentalFieldSelection: basic.environmentalFields.split(/[、，,]/),
    organizationBasicInfo: organization, organizationDevelopment: data.organizationDevelopment,
    organizationMembers: organization.members.map(member => ({ ...member, workType: member.workType.split(' / ')[0], usesLingxi: member.workType.includes('领薪') ? '是' : '否' })),
    decisionBodySelection: [],
    decisionBodyOther: '',
    coachingSelection: [], coachingOther: '', coachingOtherSelected: false,
    reviewComments: data.reviewComments, auditHistory: data.auditHistory,
    outputs: data.outputs, risks: data.risks,
    budget: { ...data.budget, rows: data.budget.rows.filter(row => row.kind === 'detail').map(row => ({ ...row, quarters: row.quarters.map(Number) })), personnel: [] }
  }
  organization.businessLogic = rich(organization.businessLogic)
  organization.coreProjects = rich(organization.coreProjects)
  organization.governanceStructure = rich(organization.governanceStructure.paragraphs) + '<p><img src="' + organization.governanceStructure.image + '" alt="机构治理结构示例"></p>'
  organization.fundraising.rows.forEach(row => { row.amount = Number(row.amount.replace(/,/g, '')); row.supportRatio = Number(row.supportRatio.replace('%', '')) })
  draft.organizationDevelopment.plan.forEach(item => { item.content = rich(item.paragraphs) })
  draft.organizationCode = source.basic.organizationCode
  return draft
}
export function loadGrassDraft () {
  const defaults = createGrassDraft(), raw = localStorage.getItem(storageKey)
  let draft = defaults
  if (raw) {
    const saved = JSON.parse(raw)
    if (saved.id !== 9 || saved.detailType !== 'grass' || !saved.organizationBasicInfo || !saved.organizationBasicInfo.fundraising || !Array.isArray(saved.organizationBasicInfo.fundraising.rows) || !saved.organizationDevelopment || !['growthNeeds', 'plan'].every(key => Array.isArray(saved.organizationDevelopment[key])) || !['organizationMembers', 'outputs', 'risks', 'targets', 'thirdParties', 'decisionBodySelection', 'coachingSelection', 'environmentalFieldSelection'].every(key => Array.isArray(saved[key])) || !saved.budget || !Array.isArray(saved.budget.rows) || !Array.isArray(saved.budget.personnel)) throw new Error('劲草草稿格式无法读取')
    draft = { ...defaults, ...saved, coachingOtherSelected: typeof saved.coachingOtherSelected === 'boolean' ? saved.coachingOtherSelected : !!String(saved.coachingOther || '').trim(), reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } }
  }
  try {
    const reviewed = localStorage.getItem('see-project-review-example-9')
    if (reviewed) { const saved = JSON.parse(reviewed); if (saved.reviewComments && typeof saved.reviewComments === 'object' && !Array.isArray(saved.reviewComments)) draft.reviewComments = clone(saved.reviewComments) }
  } catch (error) { /* 损坏的演示意见不覆盖已保存的业务草稿。 */ }
  draft.organizationCode = source.basic.organizationCode
  return draft
}
export function saveGrassDraft (draft) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  const saved = clone(draft)
  saved.environmentalFields = saved.environmentalFieldSelection.join('、')
  saved.otherLocalFunding = [saved.otherLocalFundingDescription, saved.otherLocalFundingAmount === null ? '' : Number(saved.otherLocalFundingAmount).toLocaleString('zh-CN') + ' 元'].filter(Boolean).join('\n')
  saved.organizationBasicInfo.members = saved.organizationMembers
  saved.organizationBasicInfo.highestDecisionMakingBody = saved.decisionBodySelection.map(id => ({ id, content: id === 'decision-body-4' ? saved.decisionBodyOther : grassDecisionOptions.find(option => option.id === id).label }))
  saved.organizationBasicInfo.fundraising.total = saved.organizationBasicInfo.fundraising.rows.reduce((sum, row) => roundMoney(sum + Number(row.amount || 0)), 0)
  saved.organizationDevelopment.growthNeeds.find(item => item.key === 'organizationCoachingNeeds').content = saved.coachingSelection.concat(saved.coachingOtherSelected && saved.coachingOther.trim() ? [saved.coachingOther.trim()] : []).join('、')
  localStorage.setItem(storageKey, JSON.stringify({ ...saved, savedAt }))
  return savedAt
}

