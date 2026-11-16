import reportExamples from './report-examples'
import { appliedProjects } from './projects'
import greenHomeReport from './report-green-home'
import grassReport from './report-grass'

export const reportTypes = ['进展报告', '结项报告', '补充结项']
export const reportStatuses = ['草稿', '进展待审', '进展驳回', '进展已审', '进展通过', '进展放弃', '结项待审', '结项已审', '结项通过', '补充结项待审', '补充结项已审', '补充结项通过']

// 本地列表演示：保留报告状态示例，移除指定记录。
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
    ...(index === 0 ? { sortCode: 'P-999998' } : index === 6 ? { sortCode: 'P-999996.1' } : {}),
    reportType,
    status,
    periodStart: '2026-03-01',
    periodEnd: '2026-08-31',
    submittedAt: status === '草稿' ? '' : `2026-09-0${index % 8 + 1} 17:32:08`,
    outcome: status.endsWith('通过') ? (index % 2 ? '已采纳' : '未采纳') : '-'
  }
}).filter(report => !['P-001005', 'P-001004', 'P-001003', 'P-001001', 'P-001002', 'P-000998', 'P-000997', 'P-000996', 'P-000995', 'P-000994'].includes(report.reportCode)).concat([{ id: 'green-home-progress', projectId: 8, detailType: 'green-home', name: greenHomeReport.projectName, code: greenHomeReport.projectCode, reportCode: greenHomeReport.id, reportType: '进展报告', status: '进展待审', periodStart: '2025-01-01', periodEnd: '2025-11-23', submittedAt: greenHomeReport.editedAt, outcome: '-', cover: 'forest-table', icon: 'team' }])

projectReports.push({ id: 'grass-progress', projectId: 9, detailType: 'grass', name: grassReport.projectName, code: grassReport.projectCode, reportCode: grassReport.id, reportType: '进展报告', status: '进展待审', periodStart: '2024-06-15', periodEnd: '2024-12-31', submittedAt: grassReport.editedAt, outcome: '-', cover: 'plateau', icon: 'team', sortCode: 'P-001007' })

const completion = reportExamples.find(report => report.id === 'P-001010')
projectReports.push({ ...appliedProjects.find(project => project.id === 1), id: 'completion-1764740216', projectId: 1, reportCode: completion.id, reportType: '结项报告', status: '结项待审', periodStart: '2026-06-01', periodEnd: '2026-08-31', submittedAt: completion.editedAt, outcome: '-', sortCode: 'P-999994' })

projectReports.push({ ...appliedProjects.find(project => project.id === 1), id: 'progress-draft-1764740216', projectId: 1, reportCode: 'P-001011', reportType: '进展报告', status: '草稿', periodStart: '—', periodEnd: '—', submittedAt: '', outcome: '-', sortCode: 'P-999999', freshProgressDraft: true })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001006'), id: 'progress-rejected-1764740216', reportCode: 'P-001012', status: '进展驳回', sortCode: 'P-999997', rejectedProgressExample: true })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001006'), id: 'progress-reviewed-1764740216', reportCode: 'P-001013', status: '进展已审', sortCode: 'P-999996', reviewedProgressExample: true })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001006'), id: 'progress-passed-1764740216', reportCode: 'P-001014', status: '进展通过', outcome: '已采纳', sortCode: 'P-999995', passedProgressExample: true })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001010'), id: 'supplement-pending-1764740216', reportCode: 'P-001015', reportType: '补充结项', status: '补充结项待审', sortCode: 'P-999993' })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001008'), id: 'green-home-progress-draft', reportCode: 'P-001016', status: '草稿', periodStart: '—', periodEnd: '—', submittedAt: '', sortCode: 'P-999992', freshProgressDraft: true })

projectReports.push({ ...projectReports.find(report => report.reportCode === 'P-001009'), id: 'grass-progress-draft', reportCode: 'P-001017', status: '草稿', periodStart: '—', periodEnd: '—', submittedAt: '', sortCode: 'P-001007.1', freshProgressDraft: true })
