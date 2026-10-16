// 机构申请本地演示：不连接注册、查重、文件或审批服务器。
import { organizationFieldGroups, loadOrganizationDetail, saveOrganizationDetail } from './organization-detail'
import { createOrganizations } from './organizations'

export const organizationTypes = ['基金会', '政府部门 / 事业单位', '科研院所', '民办非企业', '社会团体', '工商注册的公益组织', '企业', '未注册']
const certificates = { '基金会': '基金会法人登记证书', '科研院所': '事业单位法人证书', '民办非企业': '民办非企业单位（法人）登记证书', '社会团体': '社会团体法人登记证书', '工商注册的公益组织': '营业执照', '企业': '营业执照' }
export const restrictedTypes = ['基金会', '政府部门 / 事业单位', '科研院所', '企业', '未注册']
const storageKey = 'see-organization-form-v1'
const clone = value => JSON.parse(JSON.stringify(value))
const field = (key, label, kind, required, options) => ({ key, label, kind: kind || 'text', required: !!required, options: options || [] })

export function registrationFields (type, combinedQualifications = false) {
  const fields = [field('name', '机构名称', 'name', true), field('organizationName', '组织名称'), field('registrationType', '组织类型', 'select', true, organizationTypes)]
  if (type !== '未注册') {
    const business = ['工商注册的公益组织', '企业'].includes(type)
    const publicBody = ['政府部门 / 事业单位', '科研院所'].includes(type)
    if (type !== '政府部门 / 事业单位') fields.push(field('certificateType', '登记证书', 'readonly', true))
    fields.push(field('creditCode', '统一社会信用代码', 'credit', true))
    if (type !== '政府部门 / 事业单位') fields.push(field('issuer', business ? '登记机关' : '发证机关', 'text', true), field('issuedAt', business ? '登记日期' : '发证日期', 'date', true))
    if (business) fields.push(field('establishedAt', '成立日期', 'date', true))
    else fields.push(field('validPeriod', publicBody ? '有效期' : '有效期限', 'range', true))
    fields.push(field('supervisor', publicBody ? '登记管理机关' : '业务主管单位', 'text', true))
    if (publicBody) fields.push(field('organizer', '举办单位', 'text', true))
    fields.push(field('legalRepresentative', '法定代表人', 'text', true), field('otherLegalRoles', '法人是否有担任其他机构法人', 'binary'), field('registeredAddress', '住所', 'textarea', true), field('businessScope', '宗旨和业务范围', 'textarea', true))
  }
  fields.push(field('isCharity', '是否为慈善组织', 'qualification', true), field('charityRegisteredAt', '慈善组织认定登记时间', 'date'), field('hasFundraisingQualification', '是否有公募资质', 'qualification', true), field('fundraisingQualifiedAt', '公开募捐资格证书取得时间', 'date'))
  if (combinedQualifications) return fields.filter(item => !['charityRegisteredAt', 'fundraisingQualifiedAt'].includes(item.key)).map(item => {
    if (item.key === 'isCharity') return Object.assign({}, item, { label: '是否为慈善组织（认定登记时间）', kind: 'qualification-date', dateKey: 'charityRegisteredAt', required: false })
    if (item.key === 'hasFundraisingQualification') return Object.assign({}, item, { label: '是否有公募资质（证书取得时间）', kind: 'qualification-date', dateKey: 'fundraisingQualifiedAt', required: false })
    return item
  })
  return fields
}

export const accountFields = [field('loginPhone', '第一登录手机号', 'readonly', true), field('secondLoginPhone', '第二登录手机号'), field('email', '登录邮箱', 'readonly', true), field('inviterDepartment', '邀请人所在部门', 'select', false, ['无', '项目中心', '项目组']), field('avatar', '头像（建议使用机构企业标识）', 'avatar', true)]
export const overviewFields = [field('introduction', '机构简介', 'textarea', true), field('mission', '宗旨', 'textarea'), field('leader', '机构负责人', 'text', true), field('phone', '联系方式', 'text', true), field('projectAreas', '项目开展区域', 'textarea', true), field('officeAddress', '现办公地址', 'address', true), field('specialRemarks', '其他特殊情况备注', 'textarea')]
export const evaluationFields = [field('honors', '社会评价、荣誉、评奖及表彰信息', 'rich', true), field('ratingAndParty', '机构评级及党建信息', 'rich', true)]

export function setOrganizationType (draft, type) {
  draft.fields.registrationType = type
  draft.fields.certificateType = certificates[type] || ''
  if (restrictedTypes.includes(type)) {
    draft.fields.isCharity = '否'; draft.fields.hasFundraisingQualification = '否'
  }
}

export function loadOrganizationForm (id) {
  let draft
  if (id === 'new') {
    const fields = {}
    organizationFieldGroups.forEach(group => group.fields.forEach(item => { fields[item[0]] = '' }))
    draft = { id: 'new', status: '草稿', fields, members: [{ key: 'supervisors', title: '监事成员名单', rows: [] }, { key: 'directors', title: '理事/董事成员名单', rows: [] }], attachments: ['certificates', 'civilReports', 'annualReports', 'auditReports', 'otherAttachments'].map((key, index) => ({ key, title: ['登记证书', '年检年报', '机构年报', '审计报告', '其他附件'][index], files: [] })), history: [], reviewComments: {} }
    // 模拟已完成账号注册后的身份信息；不读取真实登录账号。
    Object.assign(fields, { loginPhone: '13800000000', email: 'demo@example.org', inviterDepartment: '无' })
  } else {
    draft = clone(loadOrganizationDetail(id))
    if (!draft) return null
    ;['secondLoginPhone', 'organizationName', 'specialRemarks', 'mission', 'projectAreas'].forEach(key => { if (draft.fields[key] === '-') draft.fields[key] = '' })
    if (!['是', '否'].includes(draft.fields.otherLegalRoles)) draft.fields.otherLegalRoles = ''
    if (!Object.keys(draft.reviewComments).length && draft.status === '驳回待修改') {
      const rejection = draft.history.find(entry => entry.result === '驳回')
      draft.reviewComments = clone((rejection || {}).reviewComments || {})
    }
  }
  Object.assign(draft.fields, { postalCode: draft.fields.postalCode || '', creditRegion: draft.fields.creditRegion || '国内', otherLegalOrganizations: draft.fields.otherLegalOrganizations || '', validStart: draft.fields.validStart || '', validEnd: draft.fields.validEnd || '', establishedAt: draft.fields.establishedAt || '', organizer: draft.fields.organizer || '' })
  ;['issuedAt', 'charityRegisteredAt', 'fundraisingQualifiedAt'].forEach(key => { draft.fields[key] = (draft.fields[key] || '').replace(/[年月]/g, '-').replace(/日/g, '') })
  if (!draft.fields.validStart && draft.fields.validPeriod) {
    const dates = draft.fields.validPeriod.match(/\d{4}[年-]\d{2}[月-]\d{2}/g) || []
    ;['validStart', 'validEnd'].forEach((key, index) => { if (dates[index]) draft.fields[key] = dates[index].replace(/[年月]/g, '-') })
  }
  draft.nameChecked = false; draft.parentOrganizationId = ''; draft.richTextFields = draft.richTextFields || []
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')[id]
    if (saved) draft = Object.assign({}, draft, saved, { fields: Object.assign({}, draft.fields, saved.fields), reviewComments: Object.assign({}, draft.reviewComments, saved.reviewComments) })
  } catch (error) { /* 存储不可用时使用当前机构资料。 */ }
  ;['isCharity', 'hasFundraisingQualification'].forEach(key => { if (!['是', '否'].includes(draft.fields[key])) draft.fields[key] = '否' })
  draft.fields.certificateType = certificates[draft.fields.registrationType] || ''
  return draft
}

export function findOrganizationByName (name) {
  const item = createOrganizations().find(row => row.name === name.trim() || loadOrganizationDetail(row.id).fields.name === name.trim())
  return item ? loadOrganizationDetail(item.id) : null
}

export function saveOrganizationForm (draft, submitted) {
  const payload = clone(draft)
  payload.formVersion = 1
  payload.fields.certificateType = certificates[payload.fields.registrationType] || ''
  payload.fields.validPeriod = [payload.fields.validStart, payload.fields.validEnd].filter(Boolean).join(' 至 ')
  if (submitted) payload.status = '待审'
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) || '{}')
    records[payload.id] = payload
    localStorage.setItem(storageKey, JSON.stringify(records))
    if (payload.id !== 'new' && !saveOrganizationDetail(payload)) return false
    return true
  } catch (error) { return false }
}

export function validateOrganizationForm (draft) {
  const errors = []
  const fields = accountFields.concat(registrationFields(draft.fields.registrationType), overviewFields, evaluationFields)
  fields.forEach(item => {
    if (item.kind !== 'range' && item.required && (typeof draft.fields[item.key] !== 'string' || !draft.fields[item.key].trim() || draft.fields[item.key] === '-')) errors.push('请填写' + item.label)
  })
  evaluationFields.forEach(item => {
    if (draft.fields[item.key] && !draft.fields[item.key].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() && !/<img\b/i.test(draft.fields[item.key])) errors.push('请填写' + item.label + '正文')
  })
  if (!draft.nameChecked) errors.push('请查询并确认机构名称')
  if (draft.fields.registrationType !== '未注册' && !['工商注册的公益组织', '企业'].includes(draft.fields.registrationType)) {
    if (!draft.fields.validStart || !draft.fields.validEnd) errors.push('请选择完整有效期限')
    else if (draft.fields.validStart > draft.fields.validEnd) errors.push('有效期限结束日期不得早于开始日期')
  }
  if (draft.fields.otherLegalRoles === '是' && !draft.fields.otherLegalOrganizations.trim()) errors.push('请填写法人担任其他机构法人的机构名称')
  if (draft.fields.isCharity === '是' && !draft.fields.charityRegisteredAt) errors.push('请选择慈善组织认定登记时间')
  if (draft.fields.hasFundraisingQualification === '是' && !draft.fields.fundraisingQualifiedAt) errors.push('请选择公开募捐资格证书取得时间')
  if (draft.fields.secondLoginPhone && !/^1\d{10}$/.test(draft.fields.secondLoginPhone)) errors.push('第二登录手机号格式不正确')
  if (!['未注册', '政府部门 / 事业单位'].includes(draft.fields.registrationType) && !draft.attachments.find(section => section.key === 'certificates').files.length) errors.push('请上传登记证书')
  return errors
}
