import progressReportDetails from './report-progress-detail.json'

const project = {
  projectName: '大熊猫栖息地生态监测与社区保护项目', projectCode: 'ZZ-1234567895',
  organization: '荥经县野生动植物保护协会', projectType: '项目',
  strategy: '生物多样性保护', issue: '大熊猫栖息地保护与社区共建',
  projectPeriod: '2025年01月01日 至 2026年08月31日', fundingCents: 50000000,
  reporter: '陈晓', contact: '138****5608', beneficiaryAid: true, aidCompleted: true,
  attachments: [
    { name: '栖息地保护项目传播材料.pdf', type: '传播信息附件' },
    { name: '阶段执行财务票据.pdf', type: '财务票据' },
    { name: '项目预算及执行明细表.pdf', type: '预算及执行明细表' },
    { name: '社区巡护与监测活动记录.pdf', type: '其他附件' }
  ]
}
const progressOutputs = [
  { id: 1, name: '建立大熊猫栖息地监测与巡护体系', standard: ['在重点栖息地布设并维护30台红外相机，完成12条样线的季度巡护，形成物种监测记录、栖息地评估资料及设备维护台账；同时定期核查监测点位、样线覆盖范围和影像数据质量，确保资料可用于后续保护管理与成效评估。', '在项目执行期内持续开展社区巡护员培训和现场复核，完善巡护记录、问题反馈及整改跟踪机制；针对雨季、设备损耗等情况及时调整维护计划，保障监测工作稳定开展。'],
    progress: [{ date: '2026-03-03', content: '已完成20台红外相机布设与8条样线调查，初步建立监测点位档案。' }, { date: '2026-06-03', content: '累计完成30台红外相机布设及12条样线调查，整理监测影像与巡护记录，并完成阶段性数据核查。' }, { date: '2026-08-20', content: '完成重点监测点位的雨季巡检与设备维护，对新增影像资料、样线巡护记录和栖息地变化情况进行了汇总复核；项目团队将结合社区巡护反馈持续优化点位管理和后续巡护安排，确保监测资料完整可追溯。' }],
    activities: [{ id: '1.1', name: '开展红外相机监测与样线巡护', period: '2025-01 至 2026-08', location: '四川省雅安市荥经县大熊猫栖息地及周边社区', people: '项目监测团队、社区巡护员', content: '按照监测方案开展设备布设、定期维护与样线调查，记录物种活动和人为干扰情况。',
      progress: [{ date: '2026-03-03', content: '完成首批监测设备安装，组织巡护员学习点位记录和数据采集规范，汇总首轮监测影像。' }, { date: '2026-06-03', content: '对全部监测点位完成维护与数据回收；针对雨季通行困难的样线调整巡护安排。监测团队联合社区巡护员核对影像时间、点位及物种记录，形成可持续更新的监测台账。' }, { date: '2026-08-20', content: '完成雨季重点样线复查与设备巡检，补充整理新增监测影像、巡护记录及社区反馈信息；针对发现的设备维护问题已明确后续处理安排，并持续跟踪栖息地变化情况。', isLatest: true }] },
      { id: '1.2', name: '开展监测数据整理与社区巡护交流', period: '2025-04 至 2026-08', location: '四川省雅安市荥经县重点社区及周边样线', people: '项目数据员、社区巡护员、技术顾问', content: '围绕监测影像整理、巡护记录复核和社区反馈开展交流，完善监测资料归档与问题响应机制。',
        progress: [{ date: '2026-03-12', content: '完成首批监测影像和巡护记录整理，组织社区巡护员核对点位信息与设备维护情况。' }, { date: '2026-06-18', content: '完成阶段性数据复核和社区交流，汇总巡护中发现的问题并形成后续维护建议。' }] }]
  },
  { id: 2, name: '提升社区参与栖息地保护与可持续管护的能力', standard: ['开展6场社区保护培训，支持20名社区巡护员参与巡护，并向参与家庭提供必要的巡护物资。'],
    progress: [{ date: '2026-03-03', content: '已开展2场社区培训，完成首批巡护物资发放及签收记录。' }, { date: '2026-06-03', content: '累计开展4场社区培训，20名社区巡护员参与常态化巡护；已完成计划内巡护物资的发放和核验。' }],
    activities: [{ id: '2.1', name: '组织社区培训与保护实践活动', period: '2025-03 至 2026-08', location: '荥经县龙苍沟镇及周边村庄', people: '社区协调员、自然教育讲师、村民代表', content: '围绕野生动物保护、巡护安全、监测记录与自然教育开展培训，通过共同讨论完善社区巡护协作机制。',
      progress: [{ date: '2026-03-03', content: '开展野生动物保护和巡护安全培训各1场，邀请村民代表讨论日常巡护的分工和记录方式。' }, { date: '2026-06-03', content: '新增2场培训与现场实践，围绕设备维护、影像识别和自然教育开展交流。参与人员分组完成样线记录练习，项目团队根据反馈完善巡护手册；物资签收资料与活动记录已整理归档。' }, { date: '2026-08-20', content: '完成近期社区巡护回访与物资使用核验，新增整理培训签到、现场实践和巡护反馈资料；项目团队将结合社区需求持续优化后续培训与常态化巡护安排。', isLatest: true }] }]
  }
]
const otherInformation = [
  { id: 'followup', title: '后续项目活动安排', paragraphs: ['1. 完成雨季后的监测设备维护与样线复查，持续整理物种监测数据。', '2. 开展剩余2场社区培训，跟踪巡护物资使用情况及社区反馈。', '3. 汇总栖息地监测成果、活动记录和财务执行资料，准备项目结项材料。'] },
  { id: 'risks', title: '项目风险及其影响', paragraphs: ['雨季强降雨可能影响山区样线通行与设备维护，需根据天气和现场情况调整活动安排。', '监测设备损耗及巡护人员流动可能影响数据连续性，项目团队已建立设备检查记录和人员交接机制。'] },
  { id: 'summary', title: '此阶段项目的优点、不足及其他需要说明的情况', paragraphs: ['优点：社区巡护员持续参与，监测记录更加规范，保护行动与社区日常协作逐步衔接。', '不足：部分偏远点位的数据回收仍需较长时间，不同巡护人员的记录质量存在差异。后续将通过现场复核和针对性培训持续改进。'] }
]
const reports = [
  { ...project, ...progressReportDetails['P-001006'].basic, id: 'P-001006', type: '进展报告',
    aiInitialReview: progressReportDetails['P-001006'].aiInitialReview, outputs: progressReportDetails['P-001006'].outputs, otherInformation,
    communication: '本阶段围绕栖息地监测、社区巡护和公众保护参与开展传播，累计发布12篇项目动态，获得地方媒体报道3篇。相关活动图片、报道链接及传播记录已整理为附件。',
    benefits: progressReportDetails['P-001006'].benefits,
    reviewComments: progressReportDetails['P-001006'].reviewComments || {},
    budgetRows: [{ name: '栖息地监测与巡护', budgetCents: 30000000, executedCents: 12000000 }, { name: '社区培训与保护行动', budgetCents: 12000000, executedCents: 4400000 }, { name: '人力成本', budgetCents: 8000000, executedCents: 3000000 }],
    staffRows: [{ role: '项目协调员', work: '巡护安排、数据汇总与项目协调', share: '50%', cents: 1800000 }, { role: '社区协调员', work: '培训组织与社区沟通', share: '40%', cents: 1200000 }],
    auditHistory: progressReportDetails['P-001006'].auditHistory
  },
  { ...project, id: 'P-001007', type: '结项报告', reportPeriod: '2026年06月01日 至 2026年08月31日', filledAt: '2026年09月01日', editedAt: '2026-09-01 17:00:00', requestedCents: 0, paidCents: 25000000,
    outputs: progressOutputs.map(output => ({ ...output, progress: [...output.progress, { date: '2026-09-01', content: output.id === 1 ? '完成全部监测点位维护与末期样线复查，监测台账和栖息地评估资料已汇总归档。' : '完成6场社区培训，20名社区巡护员完成计划内巡护任务，全部巡护物资发放与签收资料已核验。' }], activities: output.activities.map(activity => ({ ...activity, progress: [...activity.progress, { date: '2026-09-01', content: '计划内活动已完成，执行记录与成果材料已整理归档，并与社区确认后续管护安排。' }] })) })),
    otherInformation: [{ id: 'followup', title: '后续项目活动安排', paragraphs: ['项目计划内活动已完成。后续将由社区巡护团队继续维护日常巡护记录，并定期向合作机构反馈监测点位情况。'] }, otherInformation[1], { id: 'summary', title: '此阶段项目的优点、不足及其他需要说明的情况', paragraphs: ['项目已完成监测体系建设和社区培训，形成持续协作的巡护机制；全部受益人款物资助已完成并留存签收记录。', '部分监测点位仍需长期跟踪，后续将继续关注设备维护与数据记录质量。'] }],
    communication: '项目累计发布18篇动态、获得地方媒体报道5篇。已完成结项传播材料整理，汇总社区参与、监测行动及阶段成果。',
    benefits: [{ id: 'benefit-1', indicator: '物种', category: '动物', name: '大熊猫', latinName: 'Ailuropoda melanoleuca', quantity: '—', remark: '完成计划内栖息地监测与保护工作' }, { id: 'benefit-2', indicator: '物种', category: '植物', name: '珙桐', latinName: 'Davidia involucrata', quantity: '120', remark: '完成监测与复查登记' }],
    budgetRows: [{ name: '栖息地监测与巡护', budgetCents: 30000000, executedCents: 29000000 }, { name: '社区培训与保护行动', budgetCents: 12000000, executedCents: 11500000 }, { name: '人力成本', budgetCents: 8000000, executedCents: 8000000 }],
    staffRows: [{ role: '项目协调员', work: '巡护安排、数据汇总与项目协调', share: '50%', cents: 4800000 }, { role: '社区协调员', work: '培训组织与社区沟通', share: '40%', cents: 3200000 }], auditHistory: [], reviewComments: {}
  }
]

export default reports
