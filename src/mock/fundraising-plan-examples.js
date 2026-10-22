import example from './fundraising-plan-detail.json'

export const projectExampleName = '2025年点绿长江项目筹款招募申请（项目组示例）'
export const departmentExampleName = '2026年公益传播与伙伴能力建设筹款规划申请（职能部门示例）'
export const functionalDepartment = '品牌与公众传播部'
export const isDepartmentExample = id => ['plan-application-2', 'plan-application-5'].includes(id)

export function createApplicationExample (id) {
  const application = JSON.parse(JSON.stringify(example))
  application.name = projectExampleName
  application.planName = '2025年点绿长江项目筹款招募'
  application.planId = 'plan-yangtze'
  if (!isDepartmentExample(id)) return application
  application.name = departmentExampleName
  application.planName = '在地环保项目筹款规划'
  application.planId = 'plan-local'
  application.team = functionalDepartment
  application.code = 'CB-2026-001'
  application.fundUsePlan = '募集资金用于公益传播内容制作、伙伴培训及公众参与活动。未达到最低执行额时，优先保障线上课程与基础传播材料制作。'
  const paragraphs = {
    overview: ['面向环保公益伙伴开展传播与筹款能力建设，通过课程培训、内容共创和公众参与活动，提升公益项目的表达能力和持续筹款能力。'],
    background: ['伙伴机构在项目传播、捐赠人沟通及成果呈现方面存在能力差异，需要可复用的工具和持续支持。职能部门将联合专业团队提供课程、辅导及传播资源。'],
    goal: ['三年内支持50家伙伴机构完成能力提升，形成20份可复用的传播案例，并组织12场公众参与活动。'],
    strategy: ['采用需求调研、分层培训、实务辅导和成果复盘相结合的方式，为伙伴提供从内容策划到筹款沟通的全流程支持。'],
    fundraisingPlan: ['联合企业和公众捐赠人支持伙伴成长计划，设置年度筹款目标，并通过定期成果反馈维护捐赠关系。'],
    communicationPlan: ['围绕伙伴成长故事开展专题传播，结合线上公开课、项目案例及线下活动，持续呈现公众参与带来的改变。'],
    monitoring: ['按季度记录培训参与、课程完成和案例产出，每年开展一次伙伴反馈调查，根据实际成效调整下一年度支持计划。']
  }
  application.content = ['overview', 'background', 'goal', 'strategy'].map(key => ({ key, title: { overview: '项目概述', background: '项目背景及行业现状', goal: '项目目标', strategy: '项目策略' }[key], paragraphs: paragraphs[key] }))
  application.otherContent.forEach(section => { section.paragraphs = paragraphs[section.key] || [] })
  application.outputs.forEach((output, index) => {
    output.name = index === 0 ? '提升伙伴公益传播和筹款能力' : '建立公益传播案例资源库与协作机制'
    output.standard = index === 0 ? '支持50家伙伴参与培训，完成12期专题课程及30次实务辅导。' : '形成20份传播案例，组织12场公众参与活动，每年发布1份成果报告。'
    output.activities.forEach((activity, activityIndex) => { activity.description = (index === 0 ? ['开展伙伴需求调研并设计专题课程。', '组织线上培训与传播实务辅导。', '开展课程成果评审和学习复盘。'] : ['收集伙伴传播案例并整理资源库。', '联合伙伴组织公众参与活动。', '汇总项目成果并发布年度传播报告。'])[activityIndex % 3]; activity.location = '全国' })
  })
  application.budget.organization = functionalDepartment
  application.budget.rows.filter(row => row.kind === 'detail').forEach((row, index) => { row.name = ['伙伴课程与实务辅导', '传播案例与公众活动', '项目监测及成果评估'][index % 3]; row.detail = '课程设计、专业服务、活动组织及成果材料制作' })
  application.attachments.forEach(file => { file.name = '公益传播与伙伴能力建设实施方案.pdf' })
  return application
}
