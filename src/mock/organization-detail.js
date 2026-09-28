// 本地机构详情演示，不连接真实账号、审批接口或文件服务器。
import { createOrganizations } from './organizations'

const storageKey = 'see-organization-detail-v1'
const file = (id, name, year, civilStatus) => ({ id, name, year, civilStatus, uploadedAt: '2023-12-28 23:59', url: '' })
// 前端接入说明：以下社会评价文案及配图仅用于原型演示，不代表真实荣誉、评级或党建情况。
// 接入机构详情接口后，请使用实际 honors、ratingAndParty 和 evaluationImage 数据替换；无图片时不显示配图区域。
const evaluationExample = {
  honors: '【示例内容】机构长期参与社区环保宣传与志愿服务，通过自然教育、社区走访和公众活动，推动居民参与生态保护。\n\n在示例年度社区共建项目中，机构与志愿者团队共同开展环保主题课堂及绿色生活倡议，获得社区合作方的积极反馈。活动记录、公众反馈与相关表彰材料可作为社会评价附件提供。\n\n以上内容用于展示排版，具体荣誉名称、颁发单位、获得时间及证明材料请以机构实际资料为准。',
  ratingAndParty: '【示例内容】机构定期开展治理制度自查，围绕信息公开、财务规范和项目管理完善内部流程，并按要求参加社会组织评估。评级结果及有效期应以正式评估文件为准。\n\n党建方面，示例机构通过主题学习、公益志愿服务和社区共建活动促进团队协作。是否设立党组织、党组织名称及活动情况，请在接入真实业务数据时据实填写。',
  evaluationImage: { src: '/assets/organization-biyuan-logo.png', alt: '社会评价图文排版示意：机构标识', caption: '图文示例：复用现有机构标识，仅用于排版展示，非荣誉证明材料。' }
}
export const organizationFieldGroups = [
  { key: 'account', title: '账号信息', icon: 'user', fields: [['loginPhone', '第一登录手机号'], ['secondLoginPhone', '第二登录手机号'], ['email', '登录邮箱'], ['inviterDepartment', '邀请人所在部门'], ['avatar', '头像']] },
  { key: 'registration', title: '机构注册信息', icon: 'bank', fields: [['name', '机构名称'], ['organizationName', '（二级）组织名称'], ['registrationType', '组织类型'], ['certificateType', '登记证书'], ['creditCode', '统一信用代码'], ['issuer', '发证机关'], ['issuedAt', '发证日期'], ['validPeriod', '有效期限'], ['supervisor', '业务主管单位'], ['legalRepresentative', '法定代表人'], ['otherLegalRoles', '法人是否有担任其他机构法人'], ['registeredAddress', '注册地址'], ['businessScope', '业务范围'], ['isCharity', '是否为慈善组织'], ['charityRegisteredAt', '慈善组织认定登记时间'], ['hasFundraisingQualification', '是否有公募资质'], ['fundraisingQualifiedAt', '公开募捐资格证书取得时间']] },
  { key: 'overview', title: '机构概况', icon: 'read', fields: [['introduction', '机构简介', 'wide'], ['mission', '宗旨', 'wide'], ['leader', '机构负责人'], ['phone', '联系方式'], ['projectAreas', '项目开展区域'], ['officeAddress', '现办公地址'], ['specialRemarks', '其他特殊情况备注', 'wide']] },
  { key: 'evaluation', title: '社会评价信息', icon: 'star', fields: [['honors', '社会评价、荣誉、评奖及表彰信息', 'rich'], ['ratingAndParty', '机构评级及党建信息', 'rich']] }
]

export function createOrganizationDetail (id) {
  const item = createOrganizations().find(row => row.id === id)
  if (!item) return null
  return {
    id, status: item.status, reviewComments: {},
    fields: {
      name: '新疆红石慈善基金会', organizationName: '-', registrationType: '基金会',
      loginPhone: item.contactPhone, secondLoginPhone: '-', email: 'demo@example.org', inviterDepartment: '-', avatar: item.image,
      certificateType: '基金会法人证书', creditCode: '53650102689594565E（境内）', issuer: '新疆维吾尔自治区民政厅', issuedAt: '2022年12月29日', validPeriod: '2022年12月17日 至 2027年12月17日', supervisor: '新疆维吾尔自治区民政厅',
      legalRepresentative: '余立军', otherLegalRoles: '否 / 是（其他机构名称）', registeredAddress: '新疆乌鲁木齐市沙依巴克区克拉玛依西街1100号北晟商业广场409室', businessScope: '支持社会福利事业发展，为可行性项目提供资金，技术援助，支持公益事业，参与社会工作，人才培训，咨询服务。', isCharity: '是', charityRegisteredAt: '2009年06月29日',
      hasFundraisingQualification: '是', fundraisingQualifiedAt: '2009年06月29日', introduction: '本地示例机构，开展环保公益服务。', mission: '-',
      leader: item.contactName, phone: item.contactPhone, projectAreas: '-', officeAddress: '新疆乌鲁木齐市沙依巴克区克拉玛依西街1100号北晟商业广场409室', postalCode: '100000', specialRemarks: '-', honors: evaluationExample.honors, ratingAndParty: evaluationExample.ratingAndParty
    },
    evaluationImage: Object.assign({}, evaluationExample.evaluationImage),
    members: [
      { key: 'supervisors', title: '监事成员名单', rows: [
        { id: 'supervisor-1', name: '张三', identityNumber: '123456789012345', relatedCompanies: '北京市企业家环保基金会 / 53110000682855355J' },
        { id: 'supervisor-2', name: '李四', identityNumber: '123456789012345', relatedCompanies: '北京市企业家环保基金会 / 53110000682855355J\n阿拉善SEE生态协会 / 5115290050283219XJ' }
      ] },
      { key: 'directors', title: '理事/董事成员名单', rows: [{ id: 'director-1', name: '李四', identityNumber: '-', relatedCompanies: '-' }] }
    ],
    attachments: [
      { key: 'certificates', title: '登记证书', files: [file('certificate-1', '登记证书.pdf')] },
      { key: 'civilReports', title: '年检年报', files: [file('civil-2023', '2023年年检报告.pdf', 2023, '已上报'), file('civil-2022', '2022年年检报告.pdf', 2022, '已上报')] },
      { key: 'annualReports', title: '机构年报', files: [file('annual-2023', '2023年机构年报.pdf', 2023), file('annual-2022', '2022年机构年报.pdf', 2022)] },
      { key: 'auditReports', title: '审计报告', files: [file('audit-2023', '2023年审计报告.pdf', 2023), file('audit-2022', '2022年审计报告.pdf', 2022)] },
      { key: 'otherAttachments', title: '其他附件', files: [] }
    ],
    // 前端接入说明：审核时间、结果、意见及审核账号均为演示数据，接入后使用接口返回的历史记录替换。
    history: [
      { id: 'history-example-approved', submittedAt: '2025-12-18 10:30:00', auditedAt: '2025-12-19 15:30:00', approvedAt: '2025-12-19 15:30:00', reviewer: '审核账号名称', result: '通过', remark: '已补充登记证书及最新年检年报，机构注册信息与提交材料一致，同意通过。', versionLabel: '2025-12-19审核通过的版本', reviewComments: { creditCode: '统一信用代码已与登记证书核对一致。', officeAddress: '办公地址和邮编已补充完整。' } },
      { id: 'history-example-rejected', submittedAt: '2025-12-10 09:00:00', auditedAt: '2025-12-11 14:20:00', approvedAt: '', reviewer: '审核账号名称', result: '驳回', remark: '登记资料和办公联系信息尚不完整，请按以下审核意见补充后重新提交。', versionLabel: '2025-12-11审核驳回的版本', reviewComments: { creditCode: '请核对统一信用代码，并补充清晰的登记证书扫描件。', officeAddress: '请补充完整办公地址及邮编。' } }
    ]
  }
}

export function loadOrganizationDetail (id) {
  const defaults = createOrganizationDetail(id)
  if (!defaults) return null
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')[id]
    if (saved && saved.id === id) {
      const fields = Object.assign({}, defaults.fields, saved.fields || {})
      // 注册资料按原型展示；保留本地审核意见、上传记录及其他模块数据。
      organizationFieldGroups.find(group => group.key === 'registration').fields.forEach(field => { fields[field[0]] = defaults.fields[field[0]] })
      fields.officeAddress = defaults.fields.officeAddress
      fields.postalCode = defaults.fields.postalCode
      ;['honors', 'ratingAndParty'].forEach(key => { if (!fields[key] || fields[key] === '-') fields[key] = defaults.fields[key] })
      const members = (saved.members || defaults.members).map(section => section.key === 'supervisors' ? defaults.members.find(item => item.key === 'supervisors') : section)
      const history = (saved.history || []).filter(entry => !['history-1', 'history-example-approved', 'history-example-rejected'].includes(entry.id)).concat(defaults.history)
      return Object.assign({}, defaults, saved, { fields, members, history, reviewComments: Object.assign({}, defaults.reviewComments, saved.reviewComments || {}) })
    }
  } catch (error) { /* 存储不可用时继续展示默认示例。 */ }
  return defaults
}

export function saveOrganizationDetail (payload) {
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) || '{}')
    records[payload.id] = payload
    localStorage.setItem(storageKey, JSON.stringify(records))
    return true
  } catch (error) { return false }
}

export function validateOrganizationAudit (form) {
  if (form.confirmed !== 'confirmed') return '请先阅读并确认最新的年检年报'
  if (!['approved', 'rejected'].includes(form.result)) return '请选择审核结果'
  if (form.result === 'rejected' && !form.remark.trim()) return '驳回时请填写审核备注'
  return ''
}
