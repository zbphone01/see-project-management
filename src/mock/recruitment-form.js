import { availableProjects, appliedProjects } from './projects'

// 原型未提供账号/字典接口。仅复用现有演示数据，不代表生产权限或完整业务字典。
export const recruitmentAccount = { department: '捐赠人服务中心', functionalDepartment: true }
export const projectRecruitmentStrategies = ['海洋保护', '环保公益行业发展', '荒漠化防治', '气候变化与商业可持续', '生态保护与自然教育', '探索项目', '专项基金']
export const jointRecruitmentStrategy = '联合公益'
export const jointRecruitmentTopics = ['月捐（需要募捐申请）', '次捐（原则上不新增，如需请联系赠款管理部门）']
export const unspecifiedOrganizationId = 'not-specified'
export const unspecifiedSecondaryOrganizationId = 'not-specified-secondary'
export const recruitmentDirections = availableProjects.reduce((result, project) => {
  if (!result.some(item => item.type === project.type && item.strategy === project.strategy && item.topic === project.topic)) {
    result.push({ type: project.type, strategy: project.strategy, topic: project.topic })
  }
  return result
}, [])
export const recruitmentOrganizations = Array.from(new Set(appliedProjects.map(project => project.organization))).map((name, index) => ({
  id: 'organization-' + (index + 1),
  name,
  children: index === 0 ? [
    { id: 'organization-1-team-1', name: '生态项目一组' },
    { id: 'organization-1-team-2', name: '社区协作二组' },
    { id: 'organization-1-team-3', name: '公众传播三组' }
  ] : []
}))

export function createRecruitmentForm () {
  return {
    name: '', planningName: '无', department: recruitmentAccount.department,
    type: undefined, strategy: undefined, topic: undefined, fundingSource: '', fundraisingMethod: '',
    grantAmount: null, fundraisingAmount: null, managementFee: 5,
    summary: '', organizationId: unspecifiedOrganizationId, secondaryOrganizationId: unspecifiedSecondaryOrganizationId,
    startDate: '', endDate: '', cover: null, contactName: '', phonePrefix: '+86', phone: '', landline: '', email: '', attachments: []
  }
}

export function validateRecruitmentForm (form) {
  const errors = []
  const required = { name: '招募名称', type: '项目类型', strategy: '项目策略', topic: '项目议题', startDate: '招募开始日期', endDate: '招募结束日期', contactName: '联系人姓名', phone: '联系手机号' }
  Object.keys(required).forEach(key => { if (!String(form[key] || '').trim()) errors.push('请填写或选择' + required[key]) })
  if (!form.cover || !form.cover.file) errors.push('请上传招募头图')
  const hasValidDirection = form.type === '联合公益'
    ? form.strategy === jointRecruitmentStrategy && jointRecruitmentTopics.includes(form.topic)
    : recruitmentDirections.some(item => item.type === form.type && item.strategy === form.strategy && item.topic === form.topic)
  if (form.type && !hasValidDirection) errors.push('请选择与项目类型对应的策略和议题')
  if (form.type === '联合公益' && !recruitmentAccount.functionalDepartment) errors.push('只有职能部门可选择联合公益')
  const validAmount = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 999999999.99 && Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 0.0001
  if (form.type === '项目' && !['项目', '项目+筹款'].includes(form.fundingSource)) errors.push('请选择资金来源')
  if (form.type === '项目' && !validAmount(form.grantAmount)) errors.push('请填写有效的资助金额（最多两位小数）')
  const fundraisingEnabled = form.type === '联合公益' || (form.type === '项目' && form.fundingSource === '项目+筹款')
  if (fundraisingEnabled && form.fundraisingAmount !== null && form.fundraisingAmount !== '' && !validAmount(form.fundraisingAmount)) errors.push('请填写有效的筹款金额（最多两位小数）')
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.push('招募结束日期不能早于开始日期')
  const phone = form.phone.trim()
  if (phone && !(form.phonePrefix === '+86' ? /^1[3-9]\d{9}$/ : /^\d{6,15}$/).test(phone)) errors.push('请填写有效的联系手机号')
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.push('请填写有效的联系邮箱')
  const organization = form.organizationId === unspecifiedOrganizationId ? null : recruitmentOrganizations.find(item => item.id === form.organizationId)
  if (form.organizationId !== unspecifiedOrganizationId && !organization) errors.push('请重新选择指定机构')
  if (organization && form.secondaryOrganizationId !== unspecifiedSecondaryOrganizationId && !organization.children.some(item => item.id === form.secondaryOrganizationId)) errors.push('请重新选择二级组织')
  return errors
}

// 将文件本体与表单一起保留在独立 IndexedDB 中；不向服务器发送或实际发布招募。
export function recruitmentLocalRecord (record) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('see-recruitment-form', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('submissions')
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('本地存储被其他页面占用'))
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction('submissions', record ? 'readwrite' : 'readonly')
      const store = transaction.objectStore('submissions')
      const operation = record ? store.put(record, 'latest') : store.get('latest')
      transaction.oncomplete = () => { db.close(); resolve(record || operation.result || null) }
      transaction.onerror = () => { db.close(); reject(transaction.error) }
      transaction.onabort = () => { db.close(); reject(transaction.error || new Error('本地存储已取消')) }
    }
  })
}
