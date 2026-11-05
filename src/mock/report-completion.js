import { buildBudgetRows, budgetBaseAmount } from '../utils/project-budget-data'

const clone = value => JSON.parse(JSON.stringify(value))

// ZZ-1764740216 的结项示例：继承进展报告的第一轮结果，独立记录第二轮调整。
export function createCompletionExample (progress) {
  const first = clone(progress.budget)
  first.adjustmentHistory = []
  const budget = clone(first)
  const changes = {
    'budget-3': { amount: -10, price: 97.5, unit: '期', description: '结项资料整理采用共享办公安排，房租预算由400元调整为390元。' },
    'budget-8': { amount: 40, price: 125, unit: '次', description: '增加末期入户回访与签收核验，交通预算在上轮460元基础上调增40元。' },
    'cost-activity-2-1-other': { amount: -20, price: 85, unit: '次', description: '回收物资已集中转运，临时存放及场地整理预算在上轮360元基础上再减少20元。' },
    'personnel-team-1': { amount: 10, description: '增加结项成果核查和归档工作，人力预算由220元调整为230元。' },
    'personnel-team-2': { amount: -10, description: '活动组织工作已完成，人力预算由180元调整为170元。' }
  }
  budget.rows.concat(budget.personnel).forEach(row => {
    row.previousBudget = row.adjustedBudget == null ? budgetBaseAmount(row) : row.adjustedBudget
    const change = changes[row.id]
    row.adjustment = change ? change.amount : null
    row.adjustedBudget = Math.round((row.previousBudget + (change ? change.amount : 0)) * 100) / 100
    row.executed = row.adjustedBudget
    row.adjustmentDetail = change ? change.description : null
    delete row.adjustmentInput
    if (change && change.price != null) {
      row.adjustmentInput = { price: change.price, quantity: 4, unit: change.unit, description: change.description, quarters: [change.price, change.price, change.price, change.price] }
    } else if (change) {
      row.adjustmentInput = { ratio: row.ratio, quarters: Array(4).fill(row.adjustedBudget / 4) }
    }
  })
  budget.metadata = { ...budget.metadata, executionCutoff: '2026-08-31', adjustmentDetailsByRow: {} }
  const second = clone(budget)
  second.adjustmentHistory = []
  budget.adjustmentHistory = [
    { id: 'p001006-adjustment-1', time: '2026-06-03 16:30:00', reportId: progress.id, budget: first },
    { id: 'p001010-adjustment-2', time: '2026-09-01 17:00:00', reportId: 'P-001010', budget: second }
  ]
  const outputConclusions = [
    '20户家庭已完成全部入户宣讲与末期回访，约60名受益人的参与记录、工具包签收和影像资料已逐户核对归档，社区共同确认减废行动建议。',
    '已完成20户家庭垃圾分类、称重与减塑记录的末期复核，完成回收物资转运和再利用活动；形成家庭减废台账及季度汇总，社区后续持续跟踪不可回收垃圾年减量目标。',
    '已完成社区零废弃实践总结、家庭减废案例和资料清单，开展周边社区经验分享，确定后续台账维护和协作联系人。'
  ]
  const activityConclusions = {
    '1.1': '完成20户家庭末期回访，补齐参与名单与影像资料的对应关系，逐户确认零废弃行动建议和后续跟踪方式。',
    '1.2': '全部可重复使用物资发放完成，签收资料、家庭使用反馈及回访记录已核对归档，明确损耗补充与持续使用安排。',
    '2.1': '完成旧衣物改造、环保袋制作和回收物资集中转运，材料领用、参与名单、交通及场地整理费用已按最终预算核清。',
    '3.1': '完成项目实践总结与社区分享，归档活动签到、反馈意见和成果文件，并将家庭减废案例交由社区继续使用。'
  }
  return {
    ...clone(progress), id: 'P-001010', type: '结项报告', budget,
    reportPeriod: '2026年06月01日 至 2026年08月31日', filledAt: '2026年09月01日', editedAt: '2026-09-01 17:00:00',
    requestedCents: 0, paidCents: progress.paidCents, reviewComments: {}, auditHistory: [],
    outputs: progress.outputs.map((output, index) => ({ ...clone(output), progress: output.progress.concat([{ date: '2026-09-01', content: outputConclusions[index] }]),
      activities: output.activities.map(activity => ({ ...clone(activity), progress: activity.progress.concat([{ date: '2026-09-01', content: activityConclusions[activity.id] || '计划内活动已完成，执行记录、成果和财务资料已核验归档。' }]) })) })),
    otherInformation: [
      { id: 'followup', title: '后续项目活动安排', paragraphs: ['计划内宣讲、物资发放、回收再利用及社区分享均已完成。后续由社区联系人维护家庭分类称重记录，并按季度回访物资使用及减塑情况。', '项目团队保留成果资料和财务归档，配合后续抽查，并继续关注年度垃圾减量目标的持续成效。'] },
      { id: 'risks', title: '项目风险及其影响', paragraphs: ['末期通过集中转运、共享办公和优化现场协作控制执行成本，第二轮预算调整后总预算由2,420元小幅增加至2,430元。', '家庭称重记录质量及长期参与稳定性仍需持续跟踪，已建立社区联系人复核、资料留档和问题反馈机制。'] },
      { id: 'summary', title: '此阶段项目的优点、不足及其他需要说明的情况', paragraphs: ['已完成20户家庭零废弃实践、物资发放和社区经验分享，形成名单、签收、分类称重、回收利用及财务执行资料的完整归档。', '家庭分类记录的完整性有所提升，长期减量效果仍需持续观察。结项数据以末期核验资料为依据，未将后续跟踪目标作为已完成成果。'] }
    ],
    communication: '已汇总项目全过程传播材料，形成20户家庭减废案例和社区分享记录，累计发布18篇项目动态、获得地方媒体报道5篇，活动照片、报道链接及授权资料已分类归档。',
    benefits: [
      { id: 'completion-roster-1', sectionKey: 'roster', indicator: '名单', category: '受益家庭', latinName: '/', name: '20户零废弃家庭受益人名单', quantity: 60, file: '零废弃家庭受益人及物资签收名单.xlsx', remark: '20户家庭，约60人；末期参与记录和签收资料已核验' },
      { id: 'completion-document-1', sectionKey: 'document', indicator: '文件材料', category: '项目成果', latinName: '/', quantity: 1, name: '社区零废弃实践总结', type: '项目成果文件', year: '2026', file: '社区零废弃实践总结及末期监测记录.pdf', remark: '包含分类称重汇总、回收利用案例及社区协作机制' }
    ],
    attachments: [{ name: '零废弃家庭末期回访及签收资料.pdf', type: '其他附件' }, { name: '项目结项财务执行及票据汇总.pdf', type: '财务票据' }, { name: '项目第二次预算调整及执行明细.xlsx', type: '预算及执行明细表' }, { name: '项目结项传播材料.pdf', type: '传播信息附件' }],
    aiInitialReview: [{ section: '项目执行进展', content: '计划内活动已完成，末期回访、签收及成果归档情况需结合附件人工核验。' }, { section: '预算与请款', content: '已记录两轮预算调整，最新执行额与第二轮调整后预算一致，本次结项无需请款。' }, { section: '收益成果', content: '已填报受益人名单和实践总结，年度持续减量目标仍保留后续跟踪安排。' }, { section: '票据检查结果', content: '结项财务票据和执行汇总已提供示例附件，实际票据真实性及合规性仍需人工审核。' }],
    budgetRows: buildBudgetRows({}, budget).filter(row => row.kind === 'group').map(row => ({ name: row.name, budgetCents: Math.round(row.total * 100), executedCents: Math.round((row.executed || 0) * 100) })),
    staffRows: budget.personnel.map(row => ({ role: row.position, work: row.responsibilities, share: row.ratio + '%', cents: Math.round(row.executed * 100) }))
  }
}
