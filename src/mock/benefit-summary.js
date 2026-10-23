import example from './benefit-summary.json'

// 本地列表演示数据，未连接收益统计接口。
export const benefitDepartments = example.departments.slice()
export const benefitTabs = example.tabs.map(tab => Object.assign({}, tab))

export function createBenefitTables (tab) {
  const key = Object.prototype.hasOwnProperty.call(example.tables, tab) ? tab : 'document'
  return JSON.parse(JSON.stringify(example.tables[key]))
}

// 非零示例集中在当年生态保护部；其他条件仍显示完整分类及零值。
export function summarizeBenefitRow (row, filters, currentYear) {
  const matched = (filters.year === 'all' || filters.year === currentYear) && (filters.department === 'all' || filters.department === benefitDepartments[0])
  const project = matched ? row.project || 0 : 0
  const department = matched ? row.department || 0 : 0
  return Object.assign({}, row, { project, department, completion: department ? (project / department * 100).toFixed(1) + '%' : '0.0%', coverage: matched && typeof row.coverage === 'number' ? row.coverage : project ? 1 : 0, projects: matched && typeof row.projects === 'number' ? row.projects : project ? 1 : 0 })
}
