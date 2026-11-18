import source from './project-one-time-donation-detail.json'
import monthlySource from './project-monthly-donation-detail.json'
import shared from './project-tables.json'
import { createDraft, clone } from './project-drafts'

const donationSources = { 'one-time-donation': source, 'monthly-donation': monthlySource }
const donationId = type => type === 'monthly-donation' ? 11 : 10
export const isDonationDraftExample = (id, type) => (String(id) === '19' && type === 'one-time-donation') || (String(id) === '20' && type === 'monthly-donation')

function completeMonthlyDraft (draft) {
  draft.fundraisingStart = '2026-01-01'
  draft.fundraisingEnd = '2026-12-31'
  draft.minimumExecutionAmount = 50000
  draft.total = draft.requested
  draft.experience = '<p>项目团队在长沙社区开展自然教育课程，与社区和公共文化场馆合作组织志愿者培训及公益课堂。</p>'
  draft.areas = [{ id: 'monthly-area', province: '湖南省', city: '长沙市', district: '岳麓区' }]
  draft.team = [{ id: 'monthly-team-lead', name: draft.leader, position: '项目负责人', responsibilities: '统筹讲师培训、社区课堂及志愿者协调。' }]
  draft.outputs = [
    { id: 'monthly-training', name: '培养 30 名本地自然教育讲师', standard: '完成四期培训，至少30名学员通过试讲。', activities: [
      { id: 'monthly-materials', name: '开发自然教育课件', start: '2026-01', end: '2026-03', location: '长沙市', people: '课程研发团队', content: '开发四套面向青少年儿童的自然教育课件。' },
      { id: 'monthly-workshops', name: '开展讲师培训及试讲', start: '2026-04', end: '2026-07', location: '长沙市图书馆及社区', people: '自然教育导师与志愿者', content: '每期开展理论学习、户外实践与试讲评估。' }
    ] },
    { id: 'monthly-classes', name: '面向社区开展 20 场公益自然课堂', standard: '覆盖至少400人次，完成课程反馈和经验汇总。', activities: [
      { id: 'monthly-outreach', name: '实施社区自然课堂', start: '2026-05', end: '2026-11', location: '长沙市及周边社区', people: '本地自然教育讲师', content: '在社区、公园及图书馆开展公益课堂。' },
      { id: 'monthly-sharing', name: '整理教案并开展交流分享', start: '2026-11', end: '2026-12', location: '长沙市', people: '项目执行团队', content: '整理课堂记录与教案，组织两场经验交流。' }
    ] }
  ]
  draft.budget = { rows: [], personnel: [] }
}
export const donationOrganization = source.basic.organization
export const monthlyDonationOrganization = monthlySource.basic.organization
export const donationPlatformOptions = [...new Set([source.basic.onlineFundraisingPlatform, monthlySource.basic.onlineFundraisingPlatform, '支付宝公益', '腾讯公益', '其他'].filter(Boolean))]

const storageKey = (type, fresh, id = donationId(type), agreement = false) => {
  const version = type === 'one-time-donation' && id === 19 && fresh ? 'v2' : 'v1'
  return 'see-' + type + '-project-draft-' + version + '-' + id + (fresh ? '-fresh' : agreement ? '-agreement' : '')
}
const amount = value => Number(String(value || '').split(' ')[0].replace(/,/g, '')) || 0
const dates = value => (String(value || '').match(/\d{4}年\d{2}月\d{2}日/g) || []).map(date => date.replace('年', '-').replace('月', '-').replace('日', ''))
const rich = paragraphs => (paragraphs || []).map(text => '<p>' + String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') + '</p>').join('')

// 月捐与次捐分别使用自己的 JSON，复用转换过程并保留明细稳定 ID。
export function createOneTimeDonationDraft (fresh = false, type = 'one-time-donation', id = donationId(type)) {
  const sourceData = donationSources[type] || source
  const basic = sourceData.basic
  if (fresh) {
    const blank = createDraft(id)
    return { ...blank, detailType: type, fresh: true,
      ...(isDonationDraftExample(id, type) ? { code: basic.code } : {}),
      type: basic.type, strategy: basic.strategy, issue: basic.issue, funding: basic.funding, fundraising: basic.issue,
      organization: basic.organization, recruitment: basic.recruitment, name: type === 'monthly-donation' || isDonationDraftExample(id, type) ? basic.name : blank.name,
      frameworkAgreementNumber: basic.frameworkAgreementNumber, requested: amount(basic.requested), matching: amount(basic.matching),
      publicFundraiserManagementFeeRatio: basic.publicFundraiserManagementFeeRatio,
      onlineFundraisingPlatform: undefined, fundraisingStart: '', fundraisingEnd: '', minimumExecutionAmount: null,
      executionStrategy: '', fundraisingCommunicationPlan: '' }
  }
  const data = clone({ ...shared, ...sourceData })
  if (id === 19 && type === 'one-time-donation') {
    data.budget.editStatus = 'editing'
    data.budget.personnel = [
      { id: 'personnel-team-1', name: '薪金及补贴', price: 100, quantity: 4, unit: '月', monthly: 100, months: 4, quarters: [100, 100, 100, 100] },
      { id: 'charity-personnel-transport', name: '交通费', price: 25, quantity: 4, unit: '次', monthly: 25, months: 4, quarters: [25, 25, 25, 25] }
    ].map(row => ({ ...row, type: '运营人员成本', memberId: null, charityCost: true }))
    const rent = data.budget.rows.find(row => row.id === 'budget-3' && row.kind === 'support')
    if (rent) {
      rent.price = 25
      rent.quarters = [25, 25, 25, 25]
      rent.description = '项目办公场地房租分四期分摊，每期25元。'
    }
  }
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
    budget: clone(data.budget),
    // 示例仅有文件元数据，不能伪造可下载文件；真实上传继续使用 IndexedDB。
    attachments: data.attachments.map(file => ({ ...file, category: file.type, time: file.uploadedAt, example: true }))
  }
  if (isDonationDraftExample(id, type)) { draft.reviewComments = {}; draft.auditHistory = [] }
  if (id === 20 && type === 'monthly-donation') completeMonthlyDraft(draft)
  data.detailedMaterials.forEach(field => { draft[field.key] = rich(field.paragraphs) })
  return draft
}

export function loadOneTimeDonationDraft (fresh = false, type = 'one-time-donation', id = donationId(type), agreement = false) {
  const defaults = createOneTimeDonationDraft(fresh, type, id), raw = localStorage.getItem(storageKey(type, fresh, id, agreement))
  let draft = defaults
  if (raw) {
    const saved = JSON.parse(raw)
    if (!!saved.fresh !== fresh || saved.id !== id || saved.detailType !== type || !['targets', 'thirdParties', 'areas', 'team', 'outputs', 'attachments'].every(key => Array.isArray(saved[key])) || !saved.budget || !Array.isArray(saved.budget.rows) || !Array.isArray(saved.budget.personnel)) throw new Error('次捐草稿格式无法读取')
    draft = { ...defaults, ...saved, reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } }
  }
  if (type === 'monthly-donation') draft.name = defaults.name
  const oldCode = type === 'monthly-donation' ? 'ZZ-1764740245' : 'ZZ-1764740244'
  const currentCode = (donationSources[type] || source).basic.code
  if (draft.code === oldCode) draft.code = currentCode
  if (draft.budget.metadata && draft.budget.metadata.projectCode === oldCode) draft.budget.metadata.projectCode = currentCode
  if (fresh) return draft
  try {
    const review = JSON.parse(localStorage.getItem('see-project-review-example-' + id))
    if (review && review.reviewComments && typeof review.reviewComments === 'object' && !Array.isArray(review.reviewComments)) draft.reviewComments = clone(review.reviewComments)
  } catch (error) { /* 损坏的演示意见不覆盖业务草稿。 */ }
  return draft
}

export function saveOneTimeDonationDraft (draft, fresh = false, type = 'one-time-donation', agreement = false) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  localStorage.setItem(storageKey(type, fresh, draft.id, agreement), JSON.stringify({ ...draft, savedAt }))
  return savedAt
}
