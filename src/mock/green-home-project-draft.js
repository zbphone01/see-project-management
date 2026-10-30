import source from './project-green-home-detail.json'
import { createDraft, clone, createFreshOrganizationDraft } from './project-drafts'
const storageKey = 'see-green-home-project-draft-v1-8'
const escape = text => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rich = paragraphs => (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).map(text => '<p>' + escape(text).replace(/\n/g, '<br>') + '</p>').join('')
function splitLocalFunding (text) {
  const value = String(text || '')
  const match = value.match(/(?:^|\n)([\d,]+(?:\.\d+)?)\s*元[^\n]*$/)
  return { otherLocalFundingDescription: match ? value.slice(0, match.index).trim() : value, otherLocalFundingAmount: match ? Number(match[1].replace(/,/g, '')) : null }
}
function normalizeGreenHomeDraft (value) {
  const draft = clone(value)
  for (const key of ['email', 'mailingAddress', 'postalCode', 'decisionBodySelection', 'decisionBodyOther', 'coachingSelection', 'coachingOther', 'coachingOtherSelected']) delete draft[key]
  for (const key of ['businessLogic', 'coreProjects']) delete draft.organizationBasicInfo[key]
  const members = Array.isArray(draft.organizationMembers) ? draft.organizationMembers : draft.organizationBasicInfo.members || []
  draft.organizationMembers = members.map(member => ({ ...member, workType: String(member.workType || '').split(' / ')[0], usesLingxi: member.usesLingxi || (/不领薪/.test(member.workType) ? '否' : /领薪/.test(member.workType) ? '是' : '') }))
  draft.organizationBasicInfo.members = clone(draft.organizationMembers)
  return draft
}
export function createGreenHomeDraft (fresh = false) {
  const data = clone(source), basic = data.basic, organization = data.organizationBasicInfo
  const draft = { ...createDraft(8), detailType: 'green-home', ...basic, code: 'ZZ-1764740242', recruitment: '创绿家项目招募',
    environmentalFieldSelection: String(basic.environmentalFields || '').split(/[、，,]/).filter(Boolean), ...splitLocalFunding(basic.otherLocalFunding), targets: basic.targets.split('、'), thirdParties: basic.thirdParties === '无' ? [] : basic.thirdParties.split('、'),
    start: '2024-12-01', end: '2026-02-28', total: 200000, requested: 200000, matching: 0,
    organizationBasicInfo: organization, organizationDevelopment: data.organizationDevelopment,
    organizationMembers: organization.members,
    reviewComments: data.reviewComments, auditHistory: data.auditHistory,
    outputs: data.outputs, risks: data.risks,
    budget: clone(data.budget)
  }
  organization.entrepreneurshipOverview = String(organization.entrepreneurshipOverview || '')
  const keys = { background: ['environmentalProblem', 'problemCauses', 'existingEfforts'], plan: ['vision', 'publicBenefitModel'] }
  Object.keys(keys).forEach(section => draft.organizationDevelopment[section].forEach((item, index) => { item.key = item.key || keys[section][index]; item.content = section === 'plan' ? '<p>' + item.paragraphs.map(escape).join('<br>') + '</p>' : rich(item.paragraphs) }))
  return normalizeGreenHomeDraft(fresh ? createFreshOrganizationDraft(draft) : draft)
}
function withExampleReviewComments (draft) {
  try {
    const saved = JSON.parse(localStorage.getItem('see-project-review-example-8'))
    if (saved && saved.reviewComments && typeof saved.reviewComments === 'object' && !Array.isArray(saved.reviewComments)) return { ...draft, reviewComments: clone(saved.reviewComments) }
  } catch (error) { /* 损坏的演示意见不覆盖已保存的业务草稿。 */ }
  return draft
}
export function loadGreenHomeDraft (fresh = false) {
  const defaults = createGreenHomeDraft(fresh), raw = localStorage.getItem(storageKey + (fresh ? '-fresh' : ''))
  if (!raw) return fresh ? defaults : withExampleReviewComments(defaults)
  const saved = JSON.parse(raw)
  if (!!saved.fresh !== fresh || saved.id !== 8 || saved.detailType !== 'green-home' || !saved.organizationBasicInfo || !saved.organizationDevelopment || !['background', 'plan'].every(key => Array.isArray(saved.organizationDevelopment[key])) || !['outputs', 'stakeholders', 'risks', 'attachments'].every(key => Array.isArray(saved[key]))) throw new Error('创绿家草稿格式无法读取')
  const draft = { ...defaults, ...saved, organizationMembers: Array.isArray(saved.organizationMembers) ? saved.organizationMembers : Array.isArray(saved.organizationBasicInfo.members) ? saved.organizationBasicInfo.members : defaults.organizationMembers, environmentalFieldSelection: Array.isArray(saved.environmentalFieldSelection) ? saved.environmentalFieldSelection : String(saved.environmentalFields || '').split(/[、，,]/).filter(Boolean), ...(Object.prototype.hasOwnProperty.call(saved, 'otherLocalFundingAmount') ? {} : splitLocalFunding(saved.otherLocalFunding)), reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } }
  return normalizeGreenHomeDraft(fresh ? draft : withExampleReviewComments(draft))
}
export function saveGreenHomeDraft (draft, fresh = false) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  localStorage.setItem(storageKey + (fresh ? '-fresh' : ''), JSON.stringify(normalizeGreenHomeDraft({ ...draft, environmentalFields: draft.environmentalFieldSelection.join('、'), otherLocalFunding: [draft.otherLocalFundingDescription, draft.otherLocalFundingAmount === null ? '' : Number(draft.otherLocalFundingAmount).toLocaleString('zh-CN') + ' 元'].filter(Boolean).join('\n'), savedAt })))
  return savedAt
}
