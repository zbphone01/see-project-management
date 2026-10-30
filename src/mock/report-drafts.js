import reportExamples from './report-examples'
import { createReportBudget } from '../utils/report-budget'

const storageKey = (projectId, type, draftId) => `see-report-draft-example-v4-${projectId}-${type}${draftId ? '-' + draftId : ''}`
const reviewedExampleKey = reportId => `see-reviewed-report-draft-example-${reportId}`
const clone = value => JSON.parse(JSON.stringify(value))
const today = () => {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const progressOutputs = [
  {
    id: 'output-1',
    name: '建立大熊猫栖息地监测与巡护体系',
    standard: '在重点栖息地布设并维护30台红外相机，完成12条样线的季度巡护，形成物种监测记录、栖息地评估资料及设备维护台账。',
    progressHistory: [{ date: '2026-03-03', content: '已完成20台红外相机布设与8条样线调查，初步建立监测点位档案。' }, { date: '2026-06-03', content: '累计完成30台红外相机布设及12条样线调查，整理监测影像与巡护记录，并完成阶段性数据核查。' }],
    progress: '累计完成30台红外相机布设及12条样线调查，整理监测影像与巡护记录，并完成阶段性数据核查。',
    activities: [
      { id: 'activity-1-1', name: '开展红外相机监测与样线巡护', period: '2025-01 至 2026-08', location: '四川省雅安市荥经县大熊猫栖息地及周边社区', people: '项目监测团队、社区巡护员', content: '按照监测方案开展设备布设、定期维护与样线调查，记录物种活动和人为干扰情况。', progressHistory: [{ date: '2026-03-03', content: '完成首批监测设备安装，组织巡护员学习点位记录和数据采集规范。' }, { date: '2026-06-03', content: '对全部监测点位完成维护与数据回收，形成可持续更新的监测台账。' }], progress: '完成雨季重点样线复查与设备巡检，补充整理新增监测影像、巡护记录及社区反馈信息。' },
      { id: 'activity-1-2', name: '开展监测数据整理与社区巡护交流', period: '2025-04 至 2026-08', location: '四川省雅安市荥经县重点社区及周边样线', people: '项目数据员、社区巡护员、技术顾问', content: '围绕监测影像整理、巡护记录复核和社区反馈开展交流，完善监测资料归档与问题响应机制。', progressHistory: [{ date: '2026-03-12', content: '完成首批监测影像和巡护记录整理，组织社区巡护员核对点位信息。' }, { date: '2026-06-18', content: '完成阶段性数据复核和社区交流，汇总巡护中发现的问题。' }], progress: '完成阶段性数据复核和社区交流，汇总巡护中发现的问题并形成后续维护建议。' }
    ]
  },
  {
    id: 'output-2',
    name: '提升社区参与栖息地保护与可持续管护的能力',
    standard: '开展6场社区保护培训，支持20名社区巡护员参与巡护，并向参与家庭提供必要的巡护物资。',
    progressHistory: [{ date: '2026-03-03', content: '已开展2场社区培训，完成首批巡护物资发放及签收记录。' }, { date: '2026-06-03', content: '累计开展4场社区培训，20名社区巡护员参与常态化巡护。' }],
    progress: '累计开展4场社区培训，20名社区巡护员参与常态化巡护；已完成计划内巡护物资的发放和核验。',
    activities: [
      { id: 'activity-2-1', name: '组织社区培训与保护实践活动', period: '2025-03 至 2026-08', location: '荥经县龙苍沟镇及周边村庄', people: '社区协调员、自然教育讲师、村民代表', content: '围绕野生动物保护、巡护安全、监测记录与自然教育开展培训，通过共同讨论完善社区巡护协作机制。', progressHistory: [{ date: '2026-03-03', content: '开展野生动物保护和巡护安全培训各1场。' }, { date: '2026-06-03', content: '新增2场培训与现场实践，完善巡护手册和物资签收资料。' }], progress: '完成近期社区巡护回访与物资使用核验，新增整理培训签到、现场实践和巡护反馈资料。' }
    ]
  }
]

const createReportDraft = (projectId, type) => {
  const isCompletion = type === 'completion'
  return {
    projectId,
    type: isCompletion ? '结项报告' : '进展报告',
    projectName: '闲鱼红树林-海草生境演替项目',
    projectCode: 'ZZ-1764740216',
    reportCode: isCompletion ? 'P-EXAMPLE-002' : 'P-EXAMPLE-001',
    projectType: '项目',
    strategy: '海洋保护',
    issue: '滨海湿地生态系统保护与修复',
    organization: '湛江市霞山区文化旅游体育局',
    projectPeriod: '2026年01月01日 至 2026年12月31日',
    periodStart: '',
    periodEnd: '',
    funding: 500000,
    executed: isCompletion ? 485000 : 194000,
    schemaVersion: 4,
    requestNeeded: false,
    requested: 0,
    paid: 50000,
    beneficiaryAid: '是',
    aidCompleted: undefined,
    reporter: '',
    contact: '',
    filledAt: today(),
    overview: '',
    outputs: clone(progressOutputs).map(output => ({ ...output, progress: '', activities: output.activities.map(activity => ({ ...activity, progress: '' })) })),
    communication: '',
    followup: '',
    risks: '',
    summary: '',
    budget: { updatedAt: '', personnelUpdatedAt: '', rows: [], personnel: [] },
    benefits: [],
    attachments: [],
    auditHistory: Number(projectId) === (isCompletion ? 12 : 9) ? [{ id: isCompletion ? 'completion-12-audit-rejected' : 'progress-9-audit-rejected', time: '2026-03-06 10:30', result: '驳回', reviewer: '李四', remark: isCompletion ? '请补充结项成果证明及财务票据，核对最终预算执行金额后重新提交。' : '请补充监测点位、活动执行记录和巡护物资签收记录，核对预算执行金额后重新提交。' }] : [],
    reviewComments: {},
    savedAt: ''
  }
}

export function loadReportDraft (projectId, type, draftId) {
  const defaults = createReportDraft(projectId, type)
  if (String(projectId) === '1') { defaults.budget = createReportBudget(defaults); defaults.executed = 0 }
  if (draftId) defaults.draftId = draftId
  const raw = localStorage.getItem(storageKey(projectId, type, draftId))
  if (!raw) return defaults
  try {
    const saved = JSON.parse(raw)
    const merged = { ...defaults, ...saved, auditHistory: Array.isArray(saved.auditHistory) ? saved.auditHistory : defaults.auditHistory, outputs: Array.isArray(saved.outputs) ? saved.outputs : defaults.outputs, attachments: Array.isArray(saved.attachments) ? saved.attachments : [], benefits: Array.isArray(saved.benefits) ? saved.benefits : defaults.benefits, budget: saved.budget || defaults.budget, reviewComments: { ...defaults.reviewComments, ...(saved.reviewComments || {}) } }
    if (String(projectId) === '1' && !merged.budget.schemaVersion && !(merged.budget.rows || []).length && !(merged.budget.personnel || []).length && !merged.budget.updatedAt && !merged.budget.personnelUpdatedAt) { merged.budget = defaults.budget; merged.executed = 0 }
    merged.beneficiaryAid = defaults.beneficiaryAid
    if (!merged.filledAt) merged.filledAt = defaults.filledAt
    if (typeof merged.contact === 'string' && merged.contact.includes('*')) merged.contact = defaults.contact
    if (saved.schemaVersion !== defaults.schemaVersion) { merged.schemaVersion = defaults.schemaVersion; merged.requestNeeded = false; merged.requested = 0 }
    merged.outputs = defaults.outputs.map(defaultOutput => {
      const savedOutput = merged.outputs.find(output => output.id === defaultOutput.id) || {}
      return { ...defaultOutput, ...savedOutput, progressHistory: defaultOutput.progressHistory, activities: defaultOutput.activities.map(defaultActivity => ({ ...defaultActivity, ...(savedOutput.activities || []).find(activity => activity.id === defaultActivity.id), progressHistory: defaultActivity.progressHistory })) }
    })
    return merged
  } catch (error) {
    return defaults
  }
}

export function loadReviewedReportExample (projectId, reportId = 'P-001006') {
  const source = reportExamples.find(report => report.id === reportId)
  if (!source) return loadReportDraft(projectId, 'progress')
  const basic = source, isCompletion = source.type === '结项报告'
  const dateValue = value => value.replace(/年|月/g, '-').replace(/日/g, '')
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const draft = {
    ...createReportDraft(projectId, isCompletion ? 'completion' : 'progress'),
    exampleReportId: reportId, reportCode: reportId,
    projectName: basic.projectName, projectCode: basic.projectCode,
    projectType: basic.projectType, strategy: basic.strategy, issue: basic.issue,
    organization: basic.organization, projectPeriod: basic.projectPeriod,
    periodStart: dateValue(basic.reportPeriod.split(' 至 ')[0]), periodEnd: dateValue(basic.reportPeriod.split(' 至 ')[1]), filledAt: dateValue(basic.filledAt),
    executed: source.budgetRows.reduce((sum, row) => sum + row.executedCents, 0) / 100,
    beneficiaryAid: basic.beneficiaryAid ? '是' : '否', aidCompleted: basic.beneficiaryAid ? (basic.aidCompleted ? '是' : '否') : undefined,
    ...source.otherInformation.reduce((values, field) => { values[field.id] = field.paragraphs.map(text => '<p>' + escape(text) + '</p>').join(''); return values }, {}),
    communication: '<p>' + escape(source.communication) + '</p>',
    benefits: clone(source.benefits), benefitsInitialized: true,
    funding: basic.fundingCents / 100, requestNeeded: !!basic.requestedCents,
    requested: basic.requestedCents / 100, paid: basic.paidCents / 100,
    reporter: basic.reporter, contact: basic.contact,
    outputs: source.outputs.map(output => ({
      ...clone(output), id: 'output-' + output.id, standard: output.standard.join('\n'),
      progressHistory: clone(output.progress.slice(0, -1)),
      progress: output.progress.length ? output.progress[output.progress.length - 1].content : '',
      activities: output.activities.map(activity => ({
        ...clone(activity), id: 'activity-' + activity.id.replace(/\./g, '-'),
        progressHistory: clone(activity.progress.slice(0, -1)),
        progress: activity.progress.length ? activity.progress[activity.progress.length - 1].content : ''
      }))
    })),
    auditHistory: source.auditHistory.map(entry => ({ ...entry, id: reportId + '-' + entry.time })),
    reviewComments: { ...(source.reviewComments || {}),
      ...(!isCompletion ? { 'outputs.output-1': '请补充最新产出进展对应的监测资料、核查结果及成果归档情况。',
      'activities.activity-1-1': '请补充最新活动进展的执行记录及设备维护问题处理结果。' } : {})
    }
  }
  let result = draft
  try {
    const saved = JSON.parse(localStorage.getItem(reviewedExampleKey(reportId)))
    if (saved && saved.exampleReportId === reportId) result = { ...draft, ...saved, projectId, benefits: saved.benefitsInitialized || (Array.isArray(saved.benefits) && saved.benefits.length) ? saved.benefits : draft.benefits, reviewComments: { ...draft.reviewComments, ...(saved.reviewComments || {}) } }
  } catch (error) { /* Invalid local draft falls back to the example. */ }
  try {
    const audit = JSON.parse(localStorage.getItem('see-report-review-example-' + reportId))
    if (audit && audit.reviewComments && typeof audit.reviewComments === 'object' && !Array.isArray(audit.reviewComments)) result.reviewComments = { ...audit.reviewComments }
  } catch (error) { /* Retain example comments if local audit data is invalid. */ }
  return result
}

export function saveReportDraft (draft) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  const key = draft.exampleReportId ? reviewedExampleKey(draft.exampleReportId) : storageKey(draft.projectId, draft.type === '结项报告' ? 'completion' : 'progress', draft.draftId)
  localStorage.setItem(key, JSON.stringify({ ...draft, savedAt }))
  return savedAt
}
