// 创绿家进展报告本地示例；内容参照原型，缺失部分为演示补充。
const name = '创绿家支持“示例机构”发展项目'
const budget = {
  schemaVersion: 1, revision: 0, editStatus: 'completed', personnelStatus: 'completed', updatedAt: '2026-01-14 16:00:00', personnelUpdatedAt: '2026-01-14 16:00:00',
  metadata: { projectName: name, projectCode: 'ZZ-1764740242', organization: '示例的机构', period: '2025年01月01日 至 2026年02月28日', partners: '无' },
  groups: [{ id: 'output-1', name: '繁育中国鲎苗', activities: [{ id: 'activity-1-1', name: '中国鲎繁育' }] }, { id: 'output-2', name: '中国鲎种群修复与增殖放流', activities: [{ id: 'activity-2-1', name: '中国鲎增殖放流' }] }],
  rows: [
    { id: 'green-office', kind: 'support', name: '机构办公与项目协调', type: '办公运行费', price: 2000, quantity: 4, unit: '期', quarters: [2000, 2000, 2000, 2000], executed: 7000, description: '日常办公与项目协调' },
    { id: 'green-breeding', kind: 'activity', outputId: 'output-1', activityId: 'activity-1-1', name: '中国鲎繁育及育苗', type: '第三方采购费', price: 3000, quantity: 4, unit: '期', quarters: [3000, 3000, 3000, 3000], executed: 11000, description: '委托有资质的研究机构开展繁育' },
    { id: 'green-release', kind: 'activity', outputId: 'output-2', activityId: 'activity-2-1', name: '增殖放流与公众参与', type: '会议及培训费', price: 2000, quantity: 4, unit: '期', quarters: [2000, 2000, 2000, 2000], executed: 7000, description: '开展三场增殖放流活动' }
  ],
  personnel: [{ id: 'green-person-1', memberId: 'green-member-1', name: '张三', position: '项目负责人', nature: '专职', responsibilities: '项目协调、执行与报告撰写', monthly: 1000, months: 12, ratio: 100, quarters: [3000, 3000, 3000, 3000], executed: 11000, remark: '全职 / 领薪' }]
}
export default {
  id: 'P-001008', detailType: 'green-home', type: '进展报告', projectName: name, projectCode: 'ZZ-1764740242',
  organization: '示例的机构', organizationCode: '无', projectType: '项目', strategy: '环保公益组织发展', issue: '社区环保与公众参与',
  projectArea: '江苏省苏州市姑苏区，白洋湾街道南山金城', projectPeriod: '2025年01月01日 至 2026年02月28日',
  reportPeriod: '2025年01月01日 至 2025年11月23日', filledAt: '2026年01月14日', editedAt: '2026-01-14 16:00:00',
  fundingCents: 4000000, totalCents: 4000000, requestedCents: 1000000, paidCents: 1000000,
  otherLocalFunding: '社区党建费用（需逐一沟通，以实际发生为准）\n40,000 元（肆万元整）', reporter: '张三', contact: '13800138000', beneficiaryAid: false, aidCompleted: false,
  aiInitialReview: [{ section: '项目执行进展', content: '机构愿景、阶段完成情况与活动记录已填写，请人工核对成果依据及人员分工。' }, { section: '预算与请款', content: '累计执行36000元，执行率90.0%，本次申请请款10000元，请结合在线预算表核对执行金额及请款状态。' }, { section: '收益成果', content: '收益指标成果已填写，请人工核验指标分类、受益数量及备注与项目执行记录是否一致。' }, { section: '票据检查结果', content: '财务票据已列示，请人工确认附件可正常打开，并核验票据金额、日期、用途与预算执行明细是否一致。' }],
  organizationSections: [
    { key: 'vision', title: '机构愿景', editable: false, optional: false, paragraphs: ['机构愿景：打造社区环保圈，联合有公益心的家长与孩子参与多样化环保实践活动。', '三五年的中期战略和目标：通过区域行动小组，逐步由白洋湾街道拓展至姑苏区8个街道，再联动苏州市其他街道，持续推广“苏城绿蛙计划”。', '一两年的短期目标：2025—2026年覆盖白洋湾街道14个小区，将环保行动与自然教育结合，吸纳家长和孩子成为“绿蛙讲师”。'] },
    { key: 'visionAdjustment', title: '机构愿景调整', editable: true, optional: true, paragraphs: ['在原有亲子环保活动基础上，逐步扩大至全年龄居民，建立社区环保志愿者骨干小组。'] },
    { key: 'goalCompletion', title: '完成情况（近一两年的短期完成）', editable: true, optional: false, paragraphs: ['2025年在南山社区持续开展公益活动，并积极与街道沟通。街道肯定了机构工作，各社区表达了对环保活动的欢迎，希望来年开展常态合作。'] }
  ],
  staffCounts: [{ id: 'fulltime', label: '全职领薪（人数）', count: 1 }, { id: 'parttime', label: '兼职领薪（人数）', count: 1 }, { id: 'volunteers', label: '实习生和核心志愿者（人数）', count: 1 }],
  applicationMembers: [{ id: 'green-member-1', name: '张三', position: '项目负责人', responsibilities: '项目负责和执行，撰写项目报告', workType: '全职 / 领薪' }, { id: 'green-member-2', name: '李四', position: '活动组织专员', responsibilities: '自然教育活动的组织和招募', workType: '全职 / 领薪' }, { id: 'green-member-3', name: '王五', position: '活动组织专员', responsibilities: '自然教育活动的组织和招募', workType: '兼职 / 领薪' }],
  members: [{ id: 'green-member-1', name: '张三', position: '项目负责人', responsibilities: '项目负责和执行，撰写项目报告', workType: '全职 / 领薪' }, { id: 'green-member-2', changedFromApplication: true, name: '李四', position: '活动组织专员', responsibilities: '自然教育活动的组织和招募', workType: '离职' }, { id: 'green-member-3', changedFromApplication: true, name: '王五', position: '活动组织专员', responsibilities: '社区联络与志愿者协调', workType: '兼职 / 领薪' }],
  outputs: [
    { id: 1, name: '繁育中国鲎苗', standard: ['繁育4万尾2龄以上鲎苗，其中4龄以上不少于10%。'], progress: [{ date: '2025-05-28', content: '人工育苗和培育繁育1万尾鲎苗。' }, { date: '2025-11-20', content: '委托福建省淡水水产研究所人工育苗和培育研究1.5万尾中国鲎。' }], activities: [{ id: '1.1', name: '中国鲎繁育', period: '2023-07 至 2025-12', location: '福州罗源鉴江镇皇塘大垱1号等育苗基地', people: '福建省淡水所专家陈志团队（具有繁育许可证）', content: '完成中国鲎繁育。', progress: [{ date: '2025-05-28', content: '委托研究所人工育苗和培育研究1万只中国鲎。' }, { date: '2025-11-20', content: '完成1.5万尾中国鲎人工育苗与培育，并成功增殖放流。' }] }] },
    { id: 2, name: '中国鲎育幼栖息地种群修复增殖放流科学放生', standard: ['开展中国鲎育幼栖息地种群修复增殖放流科学放生3场。'], progress: [{ date: '2025-05-28', content: '完成中国鲎增殖放流科学放生3场。' }, { date: '2025-11-20', content: '完成3场种群修复与增殖放流活动。' }], activities: [{ id: '2.1', name: '中国鲎育幼栖息地种群修复增殖放流', period: '2023-08 至 2025-12', location: '泉州晋江金井镇、平潭等地海滩', people: '方垂弘及项目志愿者', content: '组织开展中国鲎育幼栖息地种群修复增殖放流活动3场。', progress: [{ date: '2025-05-28', content: '完成三场增殖放流活动，共放流2龄以上中国鲎苗25000尾，组织公众参与并整理媒体报道。' }, { date: '2025-11-20', content: '完成3场增殖放流活动，共放流2龄以上中国鲎苗15000尾；晋江、平潭和福州活动吸引社区居民及志愿者参与。' }] }] }
  ],
  otherInformation: [{ id: 'followup', title: '后续项目活动安排', paragraphs: ['联合街道和社区开展下一阶段环保实践，完善活动记录与志愿者培训。'] }, { id: 'risks', title: '项目风险及其影响', paragraphs: ['目前相关活动有序进行，深受社区居民欢迎；户外活动将结合天气情况调整。'] }, { id: 'summary', title: '此阶段项目的优点、不足及其他需要说明的情况', paragraphs: ['优点：居民参与积极，与社区、业委会和物业沟通良好。', '不足：活动主要面向亲子家庭，受到学生假期影响；后续逐步扩大参与人群。'] }],
  communication: '社区居民对本机构非常欢迎。在街道推荐下，环保行动已由南山社区向街道14个社区扩散，活动动态通过社区公众号和志愿者网络传播。',
  benefits: [{ id: 'green-benefit-1', indicator: '物种', category: '动物', name: '东黑冠长臂猿', latinName: 'Nomascus nasutus', quantity: '—', remark: '原型物种成果示例' }, { id: 'green-benefit-2', indicator: '物种', category: '植物', name: '云南梧桐', latinName: 'Firmiana major', quantity: 10000, remark: '育种' }],
  attachments: [{ name: '阶段财务票据.pdf', type: '财务票据' }, { name: '预算及执行明细表.pdf', type: '预算及执行明细表' }, { name: '社区活动记录.pdf', type: '其他附件' }],
  budget, budgetRows: [{ name: '机构办公与项目协调', budgetCents: 800000, executedCents: 700000 }, { name: '中国鲎繁育及育苗', budgetCents: 1200000, executedCents: 1100000 }, { name: '增殖放流与公众参与', budgetCents: 800000, executedCents: 700000 }, { name: '人力成本', budgetCents: 1200000, executedCents: 1100000 }],
  auditHistory: [{ time: '2026-01-06 23:59', result: '通过', reviewer: '张三', remark: 'OA付款明细单金额为10000元（本地演示记录）。' }, { time: '2026-01-05 23:59', result: '驳回', reviewer: '张三', remark: '请补充机构发展完成情况和人员分工。' }],
  reviewComments: { 'organizationSections.goalCompletion': '请补充阶段目标完成数量及对应活动记录。', 'members.green-member-3': '请明确志愿者协调的具体职责。', 'reporter': '请核对报告人信息。' }
}
