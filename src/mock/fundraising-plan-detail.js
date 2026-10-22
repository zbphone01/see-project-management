import { createApplicationExample } from './fundraising-plan-examples'

export const clonePlan = value => JSON.parse(JSON.stringify(value))
export const planDetailStorageKey = id => 'see-fundraising-plan-detail-v1-' + id
const isObject = value => value && typeof value === 'object' && !Array.isArray(value)

export function createPlanDetail (record) {
  const application = Object.assign(createApplicationExample(record.id), { id: record.id, department: record.department, status: record.status, updatedAt: record.updatedAt })
  if (record.status === '规划通过' || record.status === '规划驳回') {
    application.auditHistory = [{ id: 'history-' + record.id, time: record.updatedAt, result: record.status === '规划通过' ? '通过' : '驳回', account: 'zhangbin', remark: record.status === '规划通过' ? '规划目标及资金安排已完成评审。' : '请补充项目产出与保护目标之间的对应关系。', attachments: [{ id: 'review-example-' + record.id, name: '筹款规划评审资料.xlsx', uploadedAt: record.updatedAt }] }]
  }
  if (record.id === 'plan-application-3') {
    application.reviewComments = Object.assign({}, application.reviewComments, {
      'outputs.output-2': '请补充产出数量、覆盖范围及验收方式。',
      'activities.activity-2-1': '请细化活动实施内容，并说明与产出衡量标准的对应关系。'
    })
    application.auditHistory = application.auditHistory.concat([
      { id: 'history-example-plan-3-3', time: '2025-12-06 15:20:00', result: '驳回', account: 'liuming', remark: '请进一步细化各年度筹款目标，补充最低执行额的测算依据，并说明筹款不足时的资金使用安排。', attachments: [{ id: 'review-example-plan-3-3', name: '筹款目标及资金安排评审意见.xlsx', uploadedAt: '2025-12-06 15:20:00' }] },
      { id: 'history-example-plan-3-2', time: '2025-12-03 11:40:00', result: '驳回', account: 'wangli', remark: '请完善项目传播方案与监测评估计划。\n产出衡量标准应明确数量、覆盖范围及验收方式，活动安排需与执行周期保持一致。', attachments: [{ id: 'review-example-plan-3-2', name: '项目方案评审记录.pdf', uploadedAt: '2025-12-03 11:40:00' }] },
      { id: 'history-example-plan-3-1', time: '2025-11-28 09:15:00', result: '通过', account: 'zhangbin', remark: '初版规划方向已通过评审，后续补充方案按修订版本再次审核。', attachments: [{ id: 'review-example-plan-3-1', name: '初版规划评审资料.xlsx', uploadedAt: '2025-11-28 09:15:00' }] }
    ])
  }
  return { application, auditForm: { result: 'approved', remark: '', attachments: [] } }
}

export function readPlanSnapshot (id, storage = window.localStorage) {
  const saved = JSON.parse(storage.getItem(planDetailStorageKey(id)) || 'null')
  if (!saved) return null
  const app = saved.application
  if (!isObject(app) || app.id !== id || !['草稿', '规划待审', '规划驳回', '规划通过'].includes(app.status) || !Array.isArray(app.auditHistory) || !isObject(app.reviewComments)) throw new Error('无效的筹款规划记录')
  return saved
}

export function loadPlanDetail (record, storage = window.localStorage) {
  const defaults = createPlanDetail(record)
  const saved = readPlanSnapshot(record.id, storage)
  if (!saved) return defaults
  const application = Object.assign({}, defaults.application, saved.application)
  // 仅迁移旧查看页示例；表单保存的数据必须原样恢复。
  if (!saved.application.formVersion) {
    application.name = defaults.application.name
    application.planName = defaults.application.planName
  }
  const outputExample = defaults.application.outputs.find(item => item.id === 'output-2')
  const savedOutput = application.outputs.find(item => item.id === 'output-2')
  if (!saved.application.formVersion && savedOutput && savedOutput.standard === outputExample.standard.split('\n')[0]) savedOutput.standard = outputExample.standard
  const firstOutput = application.outputs.find(item => item.id === 'output-1')
  const firstActivity = firstOutput && firstOutput.activities.find(item => item.id === 'activity-1-1')
  if (!saved.application.formVersion && firstActivity && firstActivity.location === '全国') firstActivity.location = defaults.application.outputs.find(item => item.id === 'output-1').activities.find(item => item.id === 'activity-1-1').location
  if (!application.budget || !Array.isArray(application.budget.tabs)) application.budget = clonePlan(defaults.application.budget)
  if (record.id === 'plan-application-3') {
    const existingIds = application.auditHistory.map(item => item.id)
    application.auditHistory = application.auditHistory.concat(defaults.application.auditHistory.filter(item => item.id.indexOf('history-example-') === 0 && !existingIds.includes(item.id))).sort((left, right) => right.time.localeCompare(left.time))
  }
  application.reviewComments = Object.assign({}, defaults.application.reviewComments, saved.application.reviewComments)
  const auditForm = Object.assign({}, defaults.auditForm, isObject(saved.auditForm) ? saved.auditForm : {})
  if (!Array.isArray(auditForm.attachments)) auditForm.attachments = []
  return { application, auditForm }
}

export function savePlanDetail (application, auditForm, storage = window.localStorage) {
  storage.setItem(planDetailStorageKey(application.id), JSON.stringify({ application, auditForm }))
}

export function planReviewComment (comments, key) {
  const value = (comments || {})[key]
  return typeof value === 'string' ? value.trim() : ''
}

export function planRowComments (comments, section, id, fields = []) {
  const prefix = section + '.' + id
  const known = fields.map(field => prefix + '.' + field)
  const extra = Object.keys(comments || {}).filter(key => key.indexOf(prefix + '.') === 0 && !known.includes(key)).sort()
  return [prefix].concat(known, extra).map(key => ({ key, text: planReviewComment(comments, key) })).filter(item => item.text)
}

export function validatePlanAudit (form) {
  const errors = {}
  if (!['approved', 'rejected'].includes(form.result)) errors.result = '请选择审核结果'
  if (form.result === 'rejected' && (typeof form.remark !== 'string' || !form.remark.trim())) errors.remark = '驳回时请填写审核备注'
  if (!Array.isArray(form.attachments) || !form.attachments.length) errors.attachments = '请上传评审附件'
  return errors
}

export function finishPlanAudit (application, form, time) {
  if (application.status !== '规划待审') throw new Error('该申请已不处于待审状态')
  if (Object.keys(validatePlanAudit(form)).length) throw new Error('请补全审核信息')
  const next = clonePlan(application)
  next.status = form.result === 'approved' ? '规划通过' : '规划驳回'
  next.updatedAt = time
  next.auditHistory.unshift({ id: 'audit-' + application.id + '-' + Date.now(), time, result: form.result === 'approved' ? '通过' : '驳回', account: '本地演示账号', remark: (form.remark || '').trim(), attachments: clonePlan(form.attachments) })
  return next
}
