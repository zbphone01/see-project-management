import source from './project-one-time-donation-detail.json'
import monthlySource from './project-monthly-donation-detail.json'
import shared from './project-tables.json'
import { createDraft, clone } from './project-drafts'

const donationSources = { 'one-time-donation': source, 'monthly-donation': monthlySource }
const donationId = type => type === 'monthly-donation' ? 11 : 10
export const donationOrganization = source.basic.organization
export const monthlyDonationOrganization = monthlySource.basic.organization
export const donationPlatformOptions = [...new Set([source.basic.onlineFundraisingPlatform, monthlySource.basic.onlineFundraisingPlatform, '支付宝公益', '腾讯公益', '其他'].filter(Boolean))]

const storageKey = (type, fresh) => 'see-' + type + '-project-draft-v1-' + donationId(type) + (fresh ? '-fresh' : '')
const amount = value => Number(String(value || '').split(' ')[0].replace(/,/g, '')) || 0
const dates = value => (String(value || '').match(/\d{4}年\d{2}月\d{2}日/g) || []).map(date => date.replace('年', '-').replace('月', '-').replace('日', ''))
const rich = paragraphs => (paragraphs || []).map(text => '<p>' + String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p>').join('')

// 月捐与次捐分别使用自己的 JSON，复用转换过程并保留明细稳定 ID。
export function createOneTimeDonationDraft (fresh = false, type = 'one-time-donation') {
  const sourceData = donationSources[type] || source, id = donationId(type)
  const basic = sourceData.basic
  if (fresh) {
    const blank = createDraft(id)
    return { ...blank, detailType: type, fresh: true,
      type: basic.type, strategy: basic.strategy, issue: basic.issue, funding: basic.funding, fundraising: basic.issue,
      organization: basic.organization, recruitment: basic.recruitment, name: type === 'monthly-donation' ? basic.name : blank.name,
      frameworkAgreementNumber: basic.frameworkAgreementNumber, requested: amount(basic.requested), matching: amount(basic.matching),
      publicFundraiserManagementFeeRatio: basic.publicFundraiserManagementFeeRatio,
      onlineFundraisingPlatform: undefined, fundraisingStart: '', fundraisingEnd: '', minimumExecutionAmount: null,
      executionStrategy: '', fundraisingCommunicationPlan: '' }
  }
  const data = clone({ ...shared, ...sourceData })
  const execution = dates(basic.period), fundraising = dates(basic.fundraisingPeriod)
  const draft = {
    ...createDraft(id), ...basic, detailType: type, fundraising: basic.issue,
    targets: basic.targets.split(/[、，,]/), thirdParties: basic.thirdParties === '无' ? [] : basic.thirdParties.split('、'),
    start: execution[0] || '', end: execution[1] || '', fundraisingStart: fundraising[0] || '', fundraisingEnd: fundraising[1] || '',
    total: amount(basic.total), requested: amount(basic.requested), matching: amount(basic.matching), minimumExecutionAmount: amount(basic.minimumExecutionAmount),
    areas: data.areas, team: data.team, outputs: data.outputs,
    experience: rich(data.experience || [
      '团队曾持续推动三江源地区零废弃家庭建设，具备社区动员、环境教育、物资管理与项目监测等综合经验。',
      '核心成员熟悉高海拔地区项目执行环境，能够协调当地社区与合作机构，并依据项目计划完成过程记录、风险跟踪和成果复盘。'
    ]),
    reviewComments: data.reviewComments || { targets: '请补充各项目目标板块对应的成果指标及衡量方式。', overview: '请补充项目受益范围和社区参与方式。', 'areas.areas-1': '请核实实施区域与活动地点的一致性。', 'outputs.output-1': '请明确产出的数量、完成时间和验收依据。', 'activities.activity-2-1': '请补充活动实施安排及执行人员分工。' },
    auditHistory: data.auditHistory || [],
    budget: { ...data.budget, rows: data.budget.rows.filter(row => row.kind === 'detail').map(row => ({ ...row, quarters: row.quarters.map(Number) })), personnel: [] },
    // 示例仅有文件元数据，不能伪造可下载文件；真实上传继续使用 IndexedDB。
    attachments: data.attachments.map(file => ({ ...file, category: file.type, time: file.uploadedAt, example: true }))
  }
  data.detailedMaterials.forEach(field => { draft[field.key] = rich(field.paragraphs) })
  return draft
}

export function loadOneTimeDonationDraft (fresh = false, type = 'one-time-donation') {
  const defaults = createOneTimeDonationDraft(fresh, type), raw = localStorage.getItem(storageKey(type, fresh))
  let draft = defaults
  if (raw) {
    const saved = JSON.parse(raw)
    if (!!saved.fresh !== fresh || saved.id !== donationId(type) || saved.detailType !== type || !['targets', 'thirdParties', 'areas', 'team', 'outputs', 'attachments'].every(key => Array.isArray(saved[key])) || !saved.budget || !Array.isArray(saved.budget.rows) || !Array.isArray(saved.budget.personnel)) throw new Error('次捐草稿格式无法读取')
    draft = { ...defaults, ...saved, reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } }
  }
  if (type === 'monthly-donation') draft.name = defaults.name
  if (fresh) return draft
  try {
    const review = JSON.parse(localStorage.getItem('see-project-review-example-' + donationId(type)))
    if (review && review.reviewComments && typeof review.reviewComments === 'object' && !Array.isArray(review.reviewComments)) draft.reviewComments = clone(review.reviewComments)
  } catch (error) { /* 损坏的演示意见不覆盖业务草稿。 */ }
  return draft
}

export function saveOneTimeDonationDraft (draft, fresh = false, type = 'one-time-donation') {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  localStorage.setItem(storageKey(type, fresh), JSON.stringify({ ...draft, savedAt }))
  return savedAt
}
