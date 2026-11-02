import { regionPathComplete } from './administrative-regions'
import { reportBudgetStatus } from './report-budget'

export function reportOtherFields (greenHome) {
  const fields = [
    { key: 'followup', label: '后续项目活动安排', optional: true, placeholder: '非必填，如有产出外的活动安排时请填写' },
    { key: 'risks', label: '项目风险及其影响', placeholder: '描述项目执行中遇到的风险及其对项目的影响' },
    { key: 'summary', label: '此阶段项目的优点、不足及其他需要说明的情况', placeholder: '描述与分析此阶段项目的优点、不足及其他需要说明的情况' }
  ]
  fields.splice(greenHome ? 2 : fields.length, 0, { key: 'communication', label: '项目传播情况', placeholder: '项目故事、相关媒体报道、项目传播内容的链接，以及其他与项目执行有关的内容均可' })
  return fields.map(field => ({ ...field, reviewKey: field.key === 'communication' ? 'communication' : 'otherInformation.' + field.key }))
}

// 顺序与报告编辑页一致；仅检查可填写项，保留条件字段的业务边界。
export function reportRequiredErrors (draft, benefitSections, hasRichContent) {
  const errors = []
  const filled = value => value !== null && value !== undefined && String(value).trim().length > 0
  const required = (value, label) => { if (!filled(value)) errors.push('请填写' + label) }
  required(draft.periodStart, '报告开始日期')
  required(draft.periodEnd, '报告结束日期')
  if (draft.periodStart && draft.periodEnd && draft.periodStart > draft.periodEnd) errors.push('报告结束日期不能早于开始日期')
  if (draft.requestNeeded && (!filled(draft.requested) || !Number.isFinite(Number(draft.requested)) || Number(draft.requested) <= 0)) errors.push('请填写有效的本次报告请款金额，金额须大于0')
  if (draft.type === '结项报告' && draft.beneficiaryAid === '是' && !['是', '否'].includes(draft.aidCompleted)) errors.push('请选择是否已完成对受益人款物的资助')
  required(draft.reporter, '报告人')
  required(draft.contact, '联系方式')
  required(draft.filledAt, '报告填写日期')

  if (['green-home', 'grass'].includes(draft.detailType)) {
    if (!regionPathComplete(draft.projectAreaPath)) errors.push('请选择项目实施区域（可选择全部）')
    ;(draft.staffCounts || []).forEach(item => {
      if (!filled(item.count) || !Number.isInteger(Number(item.count)) || Number(item.count) < 0) errors.push('请填写有效的' + item.label + '，无人员请填写0')
    })
    if (!(draft.members || []).length) errors.push('请至少填写一名人员的分工')
    ;(draft.members || []).forEach((member, index) => {
      ;[['name', '姓名'], ['position', '职位'], ['responsibilities', '团队分工'], ['workType', '工作性质']].forEach(([key, label]) => required(member[key], '人员分工第' + (index + 1) + '行的' + label))
    })
    ;(draft.organizationSections || []).concat(draft.communitySections || []).forEach(field => { if (field.editable && !field.optional && !hasRichContent(field.content)) errors.push('请填写' + field.title) })
  }

  ;(draft.outputs || []).forEach((output, index) => {
    required(output.progress, '产出' + (index + 1) + '的本次执行进展')
    ;(output.activities || []).forEach((activity, activityIndex) => required(activity.progress, '活动' + (index + 1) + '.' + (activityIndex + 1) + '的本次执行进展'))
  })
  reportOtherFields(['green-home', 'grass'].includes(draft.detailType)).forEach(field => {
    if (!field.optional && !hasRichContent(draft[field.key])) errors.push('请填写' + field.label)
  })
  const budget = draft.budget || {}
  if (reportBudgetStatus((budget.rows || []).concat(budget.personnel || [], budget.legacyPersonnel || [])) === '未填写执行金额') errors.push('预算表尚未填写执行金额，请先填写并保存执行金额')
  if (!benefitSections.some(section => (section.rows || []).length)) errors.push('请至少添加一条收益指标成果')
  if (!(draft.attachments || []).length) errors.push('请至少添加一个附件')
  return errors
}
