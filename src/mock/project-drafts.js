// 独立的本地演示草稿，不改变已申请项目与审核页的数据。
export const draftId = 3
export const revisionDraftId = 5
export const editableDraftIds = [draftId, revisionDraftId]
export const clone = value => JSON.parse(JSON.stringify(value))
export const money = value => (Number(value) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const roundMoney = value => Math.round((Number(value) || 0) * 100) / 100

export function createDraft (id = draftId) {
  const draft = {
    id, name: '', code: '草稿 · 尚未提交', recruitment: '',
    type: '项目', strategy: '荒漠化防治', issue: '荒漠生态保护', funding: '资助+筹款', fundraising: '月捐',
    organization: undefined, thirdParties: [], targets: [],
    start: '', end: '', rural: undefined, aid: undefined, beneficiaries: '',
    publicBenefit: '', total: null, requested: null, matching: null, leader: '', phone: '',
    overview: '', background: '', goal: '', experience: '',
    areas: [], team: [], outputs: [], stakeholders: [], risks: [], monitoring: [],
    budget: { updatedAt: '', personnelUpdatedAt: '', rows: [], personnel: [] },
    attachments: [], savedAt: '', reviewComments: {}
  }
  if (id !== revisionDraftId) return draft
  return {
    ...draft,
    reviewComments: {
      targets: '请补充项目目标板块与湿地保护核心活动之间的对应关系，并确认各板块均有可量化的成果指标。',
      overview: '请补充项目受益范围、社区参与方式，以及湿地保护成效如何持续发挥作用。',
      executionPeriod: '请结合项目活动安排重新核对执行周期，并确认结束日期是否覆盖结项资料整理时间。',
      'areas.revision-area-1': '请核实该实施区域是否覆盖项目全部核心活动，并补充与属地管理部门的协作安排。',
      'team.revision-team-2': '请补充该专家的具体专业领域、参与周期及在项目中的职责边界。',
      'outputs.revision-output-1': '请进一步量化产出成果，补充监测样地建设数量、社区培训覆盖人数及对应的验收依据。',
      'activities.revision-activity-4': '请补充成果交流活动的目标参与对象、预计覆盖人数、传播渠道及活动成效评估方式。'
    },
    name: '湿地保护伙伴协作项目', code: '申请待修改 · PRJ-2026-005', recruitment: '湿地生态系统保护与社区共管项目招募',
    type: '项目', strategy: '湿地保护与修复', issue: '湿地生态保护', funding: '资助+筹款', fundraising: '月捐',
    organization: '青海省三江源生态环境保护协会', thirdParties: ['武汉观鸟会'], targets: ['物种', '保护地', '水'],
    start: '2026-04-01', end: '2027-03-31', rural: '是', aid: '否', beneficiaries: '项目地湿地周边社区居民、基层保护人员以及依赖湿地栖息的候鸟和其他野生动物。',
    publicBenefit: '项目以湿地生态系统恢复和社区共管能力提升为公益目的，成果将通过监测报告、社区培训和公众传播向社会共享。', total: 200000, requested: 150000, matching: 50000, leader: '张三', phone: '13800138000',
    overview: '<p>项目将在重点湿地区域开展生物多样性调查、栖息地恢复和社区共管，通过建立长期监测样地和公众参与机制，提升湿地保护成效。</p>',
    background: '<p>项目区域是迁徙候鸟的重要停歇地，当前面临水文变化、人类活动干扰和基层监测能力不足等问题，需要通过科学监测与社区协作形成持续保护机制。</p>',
    goal: '<p>恢复关键湿地生境，建立可持续的社区共管与监测体系，并形成可复制的湿地保护实践经验。</p>',
    experience: '<p>团队连续五年开展湿地和候鸟保护工作，具备社区协商、生物多样性监测、自然教育和项目财务管理经验。</p>',
    areas: [{ id: 'revision-area-1', province: '青海省', city: '玉树藏族自治州', district: '囊谦县' }, { id: 'revision-area-2', province: '四川省', city: '成都市', district: '锦江区' }],
    team: [{ id: 'revision-team-1', name: '张三', position: '正式员工', responsibilities: '负责项目统筹、伙伴沟通和质量控制。' }, { id: 'revision-team-2', name: '李四', position: '专家', responsibilities: '负责湿地生态监测方案设计与技术指导。' }],
    outputs: [
      { id: 'revision-output-1', name: '建立湿地生态监测与社区共管机制', standard: '完成 2 处长期监测样地建设。\n培训不少于 30 名社区保护骨干。', activities: [{ id: 'revision-activity-1', name: '开展湿地基线调查与监测样地建设', start: '2026-04', end: '2026-08', location: '青海省玉树藏族自治州囊谦县', people: '张三、李四', content: '完成样地选址、鸟类与植被基线调查，建立标准化监测记录和数据归档流程。' }, { id: 'revision-activity-2', name: '组织社区共管培训和巡护实践', start: '2026-09', end: '2027-02', location: '项目涉及社区', people: '张三、李四', content: '开展保护知识、巡护规范和公众沟通培训，并组织社区成员参与日常巡护。' }] },
      { id: 'revision-output-2', name: '形成湿地保护公众传播与成果共享体系', standard: '形成 1 套湿地保护公众传播材料。\n开展不少于 2 场成果交流活动。', activities: [{ id: 'revision-activity-3', name: '整理湿地监测成果与公众传播材料', start: '2026-06', end: '2026-10', location: '项目办公室及项目社区', people: '张三、李四', content: '整理监测数据、典型案例与社区参与成果，制作面向公众和合作伙伴的传播材料。' }, { id: 'revision-activity-4', name: '开展湿地保护成果交流与公众倡导活动', start: '2026-11', end: '2027-03', location: '项目涉及社区及线上平台', people: '张三、李四', content: '组织成果交流活动并通过线上渠道开展公众传播，分享湿地监测和社区共管经验。' }] }
    ],
    stakeholders: [{ id: 'revision-stakeholder-1', party: '项目地社区', interest: '改善湿地环境并获得参与保护的能力与机会。', impact: '积极', management: '定期开展社区协商，吸纳代表参与活动设计和成效复盘。' }, { id: 'revision-stakeholder-2', party: '属地管理部门', interest: '掌握湿地生态状况并提升保护管理效率。', impact: '积极', management: '共享监测结果，协同处理巡护发现的问题。' }],
    risks: [{ id: 'revision-risk-1', likelihood: '中', description: '极端天气可能影响野外调查计划。', response: '预留机动时间并制定替代样线和安全预案。', affectedActivities: '湿地基线调查与监测样地建设' }],
    monitoring: [{ id: 'revision-monitoring-1', purpose: '持续评估湿地生境恢复、重点物种变化和社区参与成效。', method: '项目团队按季度汇总监测数据，每半年邀请专家复核，并向社区和管理部门反馈结果。' }],
    budget: { updatedAt: '2026-09-10 16:30:00', personnelUpdatedAt: '2026-09-10 16:30:00', rows: [{ id: 'revision-budget-1', quarters: [45000, 45000, 45000, 45000] }], personnel: [{ id: 'revision-personnel-1', monthly: 10000, months: 4, ratio: 50 }] }
  }
}

const storageKey = id => `see-project-draft-example-v3-${id}`
export function loadDraft (id = draftId) {
  const raw = localStorage.getItem(storageKey(id))
  if (!raw) return createDraft(id)
  const draft = JSON.parse(raw)
  if (draft.id !== id || !['areas', 'team', 'outputs', 'stakeholders', 'risks', 'monitoring', 'attachments', 'targets', 'thirdParties'].every(key => Array.isArray(draft[key])) || !draft.budget || !Array.isArray(draft.budget.rows) || !Array.isArray(draft.budget.personnel)) throw new Error('草稿格式无法读取')
  const defaults = createDraft(id)
  return { ...defaults, ...draft, reviewComments: { ...defaults.reviewComments, ...(draft.reviewComments || {}) } }
}
export function saveDraft (draft) {
  const savedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  localStorage.setItem(storageKey(draft.id), JSON.stringify({ ...draft, savedAt }))
  return savedAt
}

// 文件本体保存在 IndexedDB，避免把文件转成文本塞入 localStorage。
export async function draftFile (operation, key, file) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('see-project-draft-files', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('files', operation === 'get' ? 'readonly' : 'readwrite')
      const store = transaction.objectStore('files')
      const request = operation === 'put' ? store.put(file, key) : operation === 'delete' ? store.delete(key) : store.get(key)
      transaction.oncomplete = () => resolve(request.result)
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error || new Error('文件保存中断'))
    })
  } finally { db.close() }
}

export const personnelTotal = rows => roundMoney(rows.reduce((sum, row) => sum + roundMoney(row.monthly * row.months * row.ratio / 100), 0))
export const budgetTotal = budget => roundMoney(budget.rows.reduce((sum, row) => sum + row.quarters.reduce((value, amount) => value + roundMoney(amount), 0), 0) + personnelTotal(budget.personnel))

export function uppercaseMoney (value) {
  if (value === null || value === '' || !Number.isFinite(Number(value))) return '—'
  const cents = Math.round(Number(value) * 100)
  if (!cents) return '零元整'
  const digits = '零壹贰叁肆伍陆柒捌玖'
  const units = ['', '万', '亿']
  let integer = Math.floor(cents / 100), result = '', groupIndex = 0, lowerGroup = 0
  while (integer > 0) {
    const group = integer % 10000
    if (group) {
      let part = ''
      const text = String(group)
      for (let i = 0; i < text.length; i++) part += digits[Number(text[i])] + (text[i] === '0' ? '' : ['', '拾', '佰', '仟'][text.length - i - 1])
      part = part.replace(/零+/g, '零').replace(/零$/, '')
      result = part + units[groupIndex] + (result && lowerGroup < 1000 ? '零' : '') + result
    }
    lowerGroup = group
    integer = Math.floor(integer / 10000); groupIndex++
  }
  result = (result.replace(/零+/g, '零').replace(/零$/, '') || '零') + '元'
  const jiao = Math.floor(cents % 100 / 10), fen = cents % 10
  if (!jiao && !fen) return result + '整'
  return result + (jiao ? digits[jiao] + '角' : fen && cents >= 100 ? '零' : '') + (fen ? digits[fen] + '分' : '')
}
