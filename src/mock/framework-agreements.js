// 原型演示数据，不关联真实协议、机构账号或后台存储。
export function createFrameworkAgreements () {
  return [
    { id: 'agreement-7087', code: 'SEE-B-7087', organization: '青岛市黄岛区清源环保公益服务中心', recruitment: '2024年度联合公益项目招募(包含99公益日项目)', status: '正常' },
    { id: 'agreement-7570', code: 'SEE-B-7570', organization: '澄迈县湿地保护协会', recruitment: '2024年度联合公益项目招募(包含99公益日项目)', status: '结束' }
  ]
}

export function filterFrameworkAgreements (agreements, filters) {
  const organization = (filters.organization || '').trim().toLowerCase()
  const code = (filters.code || '').trim().toLowerCase()
  return agreements.filter(item => item.organization.toLowerCase().includes(organization) && item.code.toLowerCase().includes(code))
}
