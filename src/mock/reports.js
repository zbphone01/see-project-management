import { appliedProjects } from './projects'

export const reportTypes = ['进展报告', '结项报告', '补充结项']
export const reportStatuses = ['草稿', '进展待审', '进展已审', '进展通过', '进展放弃', '结项待审', '结项已审', '结项通过', '补充结项待审', '补充结项已审', '补充结项通过']

// 本地列表演示：三种类型各含草稿，并覆盖对应的全部报告状态。
const examples = [
  ['进展报告', '进展待审'], ['进展报告', '草稿'], ['结项报告', '草稿'], ['补充结项', '草稿'],
  ['进展报告', '进展已审'], ['进展报告', '进展通过'], ['进展报告', '进展放弃'],
  ['结项报告', '结项待审'], ['结项报告', '结项已审'], ['结项报告', '结项通过'],
  ['补充结项', '补充结项待审'], ['补充结项', '补充结项已审'], ['补充结项', '补充结项通过']
]

export const projectReports = examples.map(([reportType, status], index) => {
  const project = appliedProjects.find(item => item.id === [1, 4, 4][index % 3])
  return {
    ...project,
    projectId: project.id,
    id: index + 1,
    reportCode: `P-${String(1006 - index).padStart(6, '0')}`,
    reportType,
    status,
    periodStart: '2026-03-01',
    periodEnd: '2026-08-31',
    submittedAt: status === '草稿' ? '' : `2026-09-0${index % 8 + 1} 17:32:08`,
    outcome: status.endsWith('通过') ? (index % 2 ? '已采纳' : '未采纳') : '-'
  }
})
