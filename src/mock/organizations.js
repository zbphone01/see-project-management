// 机构列表原型演示数据，不关联真实机构账号或后台审批。
export const approvalOptions = ['审批中', '审批通过', '打回修改', '申请再次修改', '同意再次修改', '已注销']

export const organizationStates = {
  '通过': { tone: 'active-approved', approval: '审批通过', actions: ['查看详情', '上传年报', '提交变更'] },
  '待上传年报': { tone: 'action-rejected', approval: '审批通过', actions: ['查看详情', '上传年报', '提交变更'] },
  '待审': { tone: 'pending-review', approval: '审批中', actions: ['查看详情'] },
  '驳回待修改': { tone: 'action-rejected', approval: '打回修改', actions: ['查看详情', '修改'] },
  '变更待审': { tone: 'pending-review', approval: '申请再次修改', actions: ['查看详情'] },
  '变更驳回': { tone: 'action-rejected', approval: '打回修改', actions: ['查看详情', '提交变更', '放弃变更'] },
  '同意再次修改': { tone: 'active-approved', approval: '同意再次修改', actions: ['查看详情', '修改'] },
  '已注销': { tone: 'neutral', approval: '已注销', actions: ['查看详情'] }
}

export function createOrganizations () {
  return ['待上传年报', '通过', '待审', '驳回待修改', '变更待审', '变更驳回'].map((status, index) => ({
    id: 'org-' + (index + 1),
    name: '青岛西海岸新区碧源环保公益服务中心',
    organizationName: index === 1 ? '碧源环保' : '',
    image: '/assets/organization-biyuan-logo.png',
    isSubAccount: index === 1,
    isPrimaryAccount: index !== 1,
    registrationType: '民办非企业',
    charityQualification: '否 / 否',
    projectCount: index === 1 ? 1 : 2,
    contactName: '陈海霞',
    contactPhone: '15866880977',
    status,
    reports: []
  }))
}

export function filterOrganizations (organizations, filters) {
  const keyword = (filters.name || '').trim().toLowerCase()
  return organizations.filter(item => {
    const matchesName = (item.name + ' ' + item.organizationName).toLowerCase().includes(keyword)
    return matchesName && (!filters.approval || organizationStates[item.status].approval === filters.approval)
  })
}
