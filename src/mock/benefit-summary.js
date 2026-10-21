// 本地列表演示数据，未连接收益统计接口。
export const benefitDepartments = ['生态保护部', '公众参与部']
export const benefitTabs = [
  { key: 'species', label: '物种' }, { key: 'area', label: '面积' },
  { key: 'people', label: '人数' }, { key: 'weight', label: '重量' },
  { key: 'money', label: '金额' }, { key: 'distance', label: '距离' },
  { key: 'list', label: '名单' }, { key: 'document', label: '文件材料' }
]

export function createBenefitTables (tab) {
  if (tab === 'species') return [
    { key: 'protection', title: '保护级别', rows: [
      { id: 'protection-0', label: '中国一级', project: 1286, department: 1600, projects: 18 },
      { id: 'protection-1', label: '中国二级', project: 64580, department: 28000, projects: 46 }
    ] },
    { key: 'iucn', title: 'IUCN濒危等级', rows: [
      { id: 'iucn-0', label: 'IUCN濒危(EN)', project: 3680, department: 4800, projects: 12 },
      { id: 'iucn-1', label: 'IUCN极危(CR)', project: 96, department: 120, projects: 5 },
      { id: 'iucn-2', label: 'IUCN易危(VU)', project: 18450, department: 20000, projects: 32 },
      { id: 'iucn-3', label: 'IUCN野外灭绝(EW)', project: 0, department: 0, projects: 0 },
      { id: 'iucn-4', label: 'IUCN近危(NT)', project: 125600, department: 160000, projects: 68 },
      { id: 'iucn-5', label: 'IUCN无危(LC)', project: 1234567, department: 1500000, projects: 126 },
      { id: 'iucn-6', label: 'IUCN数据不足(DD)', project: 850, department: 2000, projects: 9 },
      { id: 'iucn-7', label: 'IUCN未评估(NE)', project: 320, department: 320, projects: 3 }
    ] }
  ]
  if (tab === 'area') return [
    { key: 'area-restoration', heading: '生态修复', title: '生态系统', coverage: true, rows: [
      { id: 'area-ocean', label: '海洋（平方公里）', project: 1556399.27, department: 2000000 },
      { id: 'area-forest', label: '森林（公顷）', project: 31038686, department: 36000000 },
      { id: 'area-desert', label: '荒漠（公顷）', project: 19690000, department: 25000000 },
      { id: 'area-wetland', label: '湿地（公顷）', project: 1117653, department: 1500000 }
    ] },
    { key: 'area-other', heading: '其他 - 自定义类型', title: '生态系统', coverage: true, rows: [
      { id: 'area-other', label: '海洋（平方公里）', project: 123456, department: 180000 }
    ] }
  ]
  if (tab === 'people') return ['自然教育', '公众倡导', '培训', '其他 - 自定义类型'].map((heading, group) => ({
    key: 'people-' + group, heading, title: '收益内容', coverage: true, rows: [
      { id: 'people-' + group + '-events', label: '活动场次', project: 477, department: 745 },
      { id: 'people-' + group + '-participants', label: '参与人数', project: 19917, department: 25222 },
      { id: 'people-' + group + '-reach', label: '触达人次', project: 88008, department: 0 }
    ]
  }))
  if (tab === 'weight') return [{ key: 'weight', title: '类型', unit: '吨', rows: [
    { id: 'weight-0', label: '碳汇当量', project: 125680.5, department: 160000, projects: 28 },
    { id: 'weight-1', label: '减排碳当量', project: 48620.75, department: 60000, projects: 19 },
    { id: 'weight-2', label: '水效应量', project: 1234567.8, department: 1500000, projects: 42 },
    { id: 'weight-3', label: '垃圾重量', project: 8650.25, department: 12000, projects: 16 },
    { id: 'weight-4', label: '粮食重量', project: 320.6, department: 500, projects: 7 },
    { id: 'weight-5', label: '其他 - 自定义类型', project: 12.5, department: 20, projects: 3 }
  ] }]
  if (tab === 'money') return [{ key: 'money', title: '类型', unit: '万元', rows: [
    { id: 'money-0', label: '绿色采购额', project: 3680.5, department: 5000, projects: 18 },
    { id: 'money-1', label: '生态系统服务价值', project: 125680.75, department: 160000, projects: 36 },
    { id: 'money-2', label: '其他 - 自定义类型', project: 86.25, department: 120, projects: 5 }
  ] }]
  if (tab === 'distance') return [
    { key: 'distance-patrol', heading: '巡护 / 监测', title: '收益内容', coverage: true, rows: [
      { id: 'distance-patrol', label: '活动次数', project: 1260, department: 1600, projects: 24, coverage: 12 },
      { id: 'distance-patrol-participants', label: '参与人数', project: 8560, department: 12000, projects: 24, coverage: 12 },
      { id: 'distance-patrol-length', label: '距离（公里）', project: 125680.5, department: 160000, projects: 24, coverage: 12 }
    ] },
    { key: 'distance-survey', heading: '调查', title: '收益内容', coverage: true, rows: [
      { id: 'distance-survey-events', label: '活动次数', project: 860, department: 1200, projects: 38, coverage: 18 },
      { id: 'distance-survey', label: '参与人数', project: 18560, department: 24000, projects: 38, coverage: 18 },
      { id: 'distance-survey-length', label: '距离（公里）', project: 48620.75, department: 60000, projects: 38, coverage: 18 }
    ] },
    { key: 'distance-other', heading: '其他 - 自定义活动类型', title: '收益内容', coverage: true, rows: [
      { id: 'distance-other-events', label: '活动次数', project: 320, department: 450, projects: 16, coverage: 9 },
      { id: 'distance-other-participants', label: '参与人数', project: 4680, department: 6000, projects: 16, coverage: 9 },
      { id: 'distance-other', label: '距离（公里）', project: 123456.75, department: 160000, projects: 16, coverage: 9 }
    ] }
  ]
  if (tab === 'list') return [{ key: 'list', title: '类型', unit: '名单数', rows: [
    { id: 'list-0', label: '社区', project: 1286, department: 1600, projects: 32 },
    { id: 'list-1', label: '企业', project: 368, department: 500, projects: 18 },
    { id: 'list-2', label: '行业', project: 26, department: 40, projects: 9 },
    { id: 'list-3', label: '商家', project: 12480, department: 16000, projects: 46 },
    { id: 'list-4', label: '伙伴', project: 856, department: 1000, projects: 28 },
    { id: 'list-5', label: '其他 - 自定义类型', project: 64, department: 100, projects: 5 }
  ] }]
  return [{ key: 'document', title: '类型', unit: '数量', rows: [
    { id: 'document-0', label: '行业标准', project: 18, department: 25, projects: 8 },
    { id: 'document-1', label: '科研论文', project: 126, department: 160, projects: 36 },
    { id: 'document-2', label: '提案', project: 48, department: 60, projects: 19 },
    { id: 'document-3', label: '倡导文件', project: 86, department: 120, projects: 24 },
    { id: 'document-4', label: 'SEE支持出版-公开发行出版物', project: 32, department: 40, projects: 12 },
    { id: 'document-5', label: 'SEE合作出版-公开发行出版物', project: 15, department: 20, projects: 7 },
    { id: 'document-6', label: 'SEE自行出版-公开发行出版物', project: 9, department: 12, projects: 4 },
    { id: 'document-7', label: '其他 - 自定义类型', project: 0, department: 10, projects: 0 }
  ] }]
}

// 非零示例集中在当年生态保护部；其他条件仍显示完整分类及零值。
export function summarizeBenefitRow (row, filters, currentYear) {
  const matched = (filters.year === 'all' || filters.year === currentYear) && (filters.department === 'all' || filters.department === benefitDepartments[0])
  const project = matched ? row.project || 0 : 0
  const department = matched ? row.department || 0 : 0
  return Object.assign({}, row, { project, department, completion: department ? (project / department * 100).toFixed(1) + '%' : '0.0%', coverage: matched && typeof row.coverage === 'number' ? row.coverage : project ? 1 : 0, projects: matched && typeof row.projects === 'number' ? row.projects : project ? 1 : 0 })
}
