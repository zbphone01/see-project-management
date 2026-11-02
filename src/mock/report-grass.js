import greenHomeReport from './report-green-home'

// 劲草进展报告本地示例；成长目标、社群反馈与基本信息参照查看原型。
const clone = value => JSON.parse(JSON.stringify(value))
const projectName = '劲草同行支持2024级新疆山水环境保护与可持续发展中心发展项目（第1年）'
const organization = '新疆山水环境保护与可持续发展中心'
const projectPeriod = '2024年06月05日 至 2025年06月14日'
const budget = clone(greenHomeReport.budget)
budget.metadata = { ...budget.metadata, projectName, projectCode: 'ZZ-1764740243', organization, period: projectPeriod }
const amounts = [[12000, 8000], [20000, 14000], [16000, 9690]]
budget.rows.forEach((row, index) => { row.price = amounts[index][0] / 4; row.quarters = Array(4).fill(amounts[index][0] / 4); row.executed = amounts[index][1] })
budget.personnel[0].executed = 8000
budget.personnel[0].remark = '专职'
const completion = '2025年在南山社区正常开展公益活动的同时，积极联系街道，表达向整个街道所有社区开展活动的意愿。街道首先肯定了本公益机构工作成绩，并与相关社区工作人员进行联系。各社区书记和主任表达了对环保活动非常欢迎，希望来年能进驻各自社区开展相关活动。'
const section = (key, title, text, editable = true, optional = false) => ({ key, title, paragraphs: text ? [text] : [], editable, optional })
const members = clone(greenHomeReport.members)
members[0].position = '专家'
const applicationMembers = clone(greenHomeReport.applicationMembers)
applicationMembers[0].position = '专家'
export default {
  ...clone(greenHomeReport), id: 'P-001009', detailType: 'grass', projectName, projectCode: 'ZZ-1764740243', organization,
  projectType: '项目', projectArea: '新疆维吾尔自治区 - 乌鲁木齐市 - 天山区', projectPeriod,
  reportPeriod: '2024年06月15日 至 2024年12月31日', fundingCents: 6000000, totalCents: 6000000,
  requestedCents: 0, paidCents: 2000000, otherLocalFunding: '无',
  members, applicationMembers, staffCounts: [{ id: 'fulltime', label: '全职领薪（人数）', count: 1 }, { id: 'parttime', label: '兼职领薪（人数）', count: 1 }, { id: 'volunteers', label: '实习生和核心志愿者（人数）', count: 0 }],
  organizationSections: [
    section('organizationGrowth', '机构成长目标', '针对机构战略定位游移不定，团队成员理解不一、不坚定的问题，希望第一年成长目标是：明确机构要解决的社会问题，团队明白“为什么做”。', false),
    section('organizationGrowthAdjustment', '机构成长目标调整', '', true, true),
    section('organizationGrowthCompletion', '机构成长目标完成情况', completion),
    section('personalGrowth', '个人成长目标', '针对我在解读机构核心问题的时候逻辑链条不清晰的问题，希望第一年在专业素养上，我能对环境问题、文化策略的理解上有拓展，对什么是问题、什么是路径、什么是策略以及它们之间的关系有更准确的理解和认识。在管理能力上，能识别团队成员对机构发展的需求。', false),
    section('personalGrowthAdjustment', '个人成长目标调整', '', true, true),
    section('personalGrowthCompletion', '个人成长目标完成情况', completion)
  ],
  communitySections: [
    section('activities', '本年度参与的劲草社群活动', '参与了“全国环保公益组织调研”'),
    section('suggestions', '对上述活动的感受或建议', '无'),
    section('expectations', '请说明您对下一年度自己参与劲草社群的预期（包括希望以何种深度/形式参与，以及期待的活动内容）', '下一年度线上听一些相关讲座和分享')
  ],
  otherInformation: [
    { id: 'followup', title: '后续项目活动安排', paragraphs: ['继续开展社区环保实践，推进机构成长目标，完善项目记录与团队管理。'] },
    { id: 'risks', title: '项目风险及其影响', paragraphs: ['对项目地的生态系统退化、发展多元可持续生计等方面，在成因和成效的评估上，缺少基础性的量化信息，团队还是缺少这方面的基本素质，平时缺少整理，不少观点、结论缺少数据支撑，就容易变成用看法形成看法，感觉跟着感觉，对我们分析问题、业务的体系化梳理等有影响，需要在今后通过管理加强。'] },
    { id: 'summary', title: '此阶段项目的优点、不足及其他需要说明的情况', paragraphs: ['优点：导师、项目组和三元团队的实地走访有助于面对面交流；老师们的视野、见解及指导很有帮助。问题树分析方便团队整体认识工作，促进了对问题的深入调查。', '不足：传播做得不够，日常工作量较大，公众号、微博等更新很少。'] }
  ],
  communication: '题目：《在保护自然中促进村民多元增收——江布塔斯村牧业转型调查》\n新疆维吾尔自治区农业农村厅官网：https://tnews.xjmty.com/app/slyapp/sh/202408/t20240815_23182993.html\n天山网：https://www.ts.cn/xwzx/shxw/202408/t20240815_23182989.shtml\n法治网：http://www.legaldaily.com.cn/Village_ruled_by_law/content/2024-08/15/content_9039607.html\n新疆生态环境微信公号：https://mp.weixin.qq.com/s/AumKPHwLaqesUdQF1gPLWw',
  budget, budgetRows: amounts.map(([amount, executed], index) => ({ name: budget.rows[index].name, budgetCents: amount * 100, executedCents: executed * 100 })).concat([{ name: '人力成本', budgetCents: 1200000, executedCents: 800000 }]),
  aiInitialReview: [{ section: '项目执行进展', content: '机构与个人成长目标、人员分工和社群参与反馈已填写，请人工核对完成情况及成果依据。' }, { section: '预算与请款', content: '累计执行39690元，执行率66.2%，本次报告无需请款，请核对预算及执行明细。' }],
  reviewComments: { 'organizationSections.organizationGrowthCompletion': '请补充机构成长目标的具体完成依据。', 'organizationSections.personalGrowthCompletion': '请补充个人成长目标对应的学习与实践成果。', 'communitySections.expectations': '请进一步说明期待的活动内容及参与形式。', 'members.green-member-3': '请明确团队分工。' }
}
