// 募捐申请书列表原型演示数据，未关联真实申请及文件。
export const applicationStates = {
  '草稿': { tone: 'neutral', actions: ['编辑'] },
  '募捐申请待审': { tone: 'pending-review', actions: ['审核', '下载pdf'] },
  '募捐申请驳回': { tone: 'action-rejected', actions: ['编辑'] },
  '版本作废': { tone: 'neutral', actions: ['查看'] },
  '待生效': { tone: 'neutral', actions: ['查看', '手动生效'] },
  '框架协议结束': { tone: 'neutral', actions: ['查看'] },
  '生效中': { tone: 'active-approved', actions: ['查看', '更新', '申请新项目'] }
}

export function createFundraisingApplications () {
  return Object.keys(applicationStates).map((status, index) => ({
    id: 'fundraising-application-' + (index + 1),
    recruitment: index === 5 ? '2025年伙伴月捐联合公益项目招募' : '2024年度联合公益项目招募(包含99公益日项目)',
    organization: index === 5 ? '天津滨海环保咨询服务中心' : '大理白族自治州云山生物多样性保护与研究中心',
    version: index === 5 ? '613890_036098_01' : index >= 4 ? '896257_656962_02' : '896257_656962_01',
    agreementCode: index < 3 ? '' : index === 5 ? 'SEE-B-7266' : 'SEE-B-7087',
    projectCount: index < 3 ? null : 1,
    status
  }))
}

export function filterFundraisingApplications (applications, filters) {
  const organization = (filters.organization || '').trim().toLowerCase()
  const recruitment = (filters.recruitment || '').trim().toLowerCase()
  return applications.filter(item => item.organization.toLowerCase().includes(organization) && item.recruitment.toLowerCase().includes(recruitment))
}
