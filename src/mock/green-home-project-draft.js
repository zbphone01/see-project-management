import source from './project-green-home-detail.json'
import { createDraft, clone } from './project-drafts'
const storageKey = 'see-green-home-project-draft-v1-8'
const escape = text => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const rich = paragraphs => (Array.isArray(paragraphs) ? paragraphs : [paragraphs]).map(text => '<p>' + escape(text).replace(/\n/g, '<br>') + '</p>').join('')
function splitLocalFunding (text) {
  const value = String(text || '')
  const match = value.match(/(?:^|\n)([\d,]+(?:\.\d+)?)\s*元[^\n]*$/)
  return { otherLocalFundingDescription: match ? value.slice(0, match.index).trim() : value, otherLocalFundingAmount: match ? Number(match[1].replace(/,/g, '')) : null }
}
export function createGreenHomeDraft () {
  const data = clone(source), basic = data.basic, organization = data.organizationBasicInfo
  const draft = { ...createDraft(8), detailType: 'green-home', ...basic, code: 'ZZ-1764740242', recruitment: '创绿家项目招募',
    environmentalFieldSelection: String(basic.environmentalFields || '').split(/[、，,]/).filter(Boolean), ...splitLocalFunding(basic.otherLocalFunding), targets: basic.targets.split('、'), thirdParties: basic.thirdParties === '无' ? [] : basic.thirdParties.split('、'),
    start: '2024-12-01', end: '2026-02-28', total: 200000, requested: 200000, matching: 0,
    organizationBasicInfo: organization, organizationDevelopment: data.organizationDevelopment,
    organizationMembers: [], reviewComments: data.reviewComments, auditHistory: data.auditHistory,
    areas: data.areas, team: data.team, outputs: data.outputs, stakeholders: data.stakeholders, risks: data.risks, monitoring: data.monitoring,
    budget: { ...data.budget, rows: data.budget.rows.filter(row => row.kind === 'detail').map(row => ({ ...row, quarters: row.quarters.map(Number) })), personnel: [] }
  }
  organization.entrepreneurshipOverview = String(organization.entrepreneurshipOverview || '')
  organization.businessLogic = rich(organization.businessLogic)
  organization.coreProjects = rich(organization.coreProjects)
  const keys = { background: ['environmentalProblem', 'problemCauses', 'existingEfforts'], plan: ['vision', 'publicBenefitModel'] }
  Object.keys(keys).forEach(section => draft.organizationDevelopment[section].forEach((item, index) => { item.key = item.key || keys[section][index]; item.content = section === 'plan' ? '<p>' + item.paragraphs.map(escape).join('<br>') + '</p>' : rich(item.paragraphs) }))
  return draft
}
function withExampleReviewComments (draft) {
  try {
    const saved = JSON.parse(localStorage.getItem('see-project-review-example-8'))
    if (saved && saved.reviewComments && typeof saved.reviewComments === 'object' && !Array.isArray(saved.reviewComments)) return { ...draft, reviewComments: clone(saved.reviewComments) }
  } catch (error) { /* 损坏的演示意见不覆盖已保存的业务草稿。 */ }
  return draft
}
export function loadGreenHomeDraft () {
  const defaults = createGreenHomeDraft(), raw = localStorage.getItem(storageKey)
  if (!raw) return withExampleReviewComments(defaults)
  const saved = JSON.parse(raw)
  if (saved.id !== 8 || saved.detailType !== 'green-home' || !saved.organizationBasicInfo || !Array.isArray(saved.organizationMembers) || !saved.organizationDevelopment || !['background', 'plan'].every(key => Array.isArray(saved.organizationDevelopment[key])) || !['outputs', 'stakeholders', 'risks', 'attachments'].every(key => Array.isArray(saved[key]))) throw new Error('创绿家草稿格式无法读取')
  return withExampleReviewComments({ ...defaults, ...saved, environmentalFieldSelection: Array.isArray(saved.environmentalFieldSelection) ? saved.environmentalFieldSelection : String(saved.environmentalFields || '').split(/[、，,]/).filter(Boolean), ...(Object.prototype.hasOwnProperty.call(saved, 'otherLocalFundingAmount') ? {} : splitLocalFunding(saved.otherLocalFunding)), reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } })
}
export function saveGreenHomeDraft (draft) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  localStorage.setItem(storageKey, JSON.stringify({ ...draft, environmentalFields: draft.environmentalFieldSelection.join('、'), otherLocalFunding: [draft.otherLocalFundingDescription, draft.otherLocalFundingAmount === null ? '' : Number(draft.otherLocalFundingAmount).toLocaleString('zh-CN') + ' 元'].filter(Boolean).join('\n'), organizationBasicInfo: { ...draft.organizationBasicInfo, members: draft.organizationMembers }, savedAt }))
  return savedAt
}
