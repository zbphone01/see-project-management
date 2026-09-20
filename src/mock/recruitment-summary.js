import { availableProjects, appliedProjects } from './projects'

// 汇总页专用演示数据，不改变其他页面的数据。申请通过稳定 ID 关联招募。
const historicalRecruitments = [
  { id: 506310, code: '506310', name: '高原生态保护专项招募', type: '项目', strategy: '生态保护与自然教育', topic: '草地生态保护', department: '项目组-生态保护与自然教育', startDate: '2025-09-01', endDate: '2025-10-31', cover: 'plateau', icon: 'area-chart' },
  { id: 896256, code: '896256', name: '2026年联合公益公募筹资项目招募', type: '联合公益', strategy: '联合公益', topic: '公募项目', department: '捐赠人服务中心', startDate: '2025-11-01', endDate: '2025-12-31', cover: 'wildlife', icon: 'heart' },
  { id: 506311, code: '506311', name: '2025—2027年湿地保护伙伴计划', type: '项目', strategy: '生态保护与自然教育', topic: '湿地保护', department: '项目组-生态保护与自然教育', startDate: '2025-01-01', endDate: '2025-03-31', cover: 'wetland', icon: 'cloud' },
  { id: 506312, code: '506312', name: '绿色社区创新项目招募', type: '项目', strategy: '探索项目', topic: '零废弃社区', department: '项目中心', startDate: '2025-01-01', endDate: '2025-04-30', cover: 'city', icon: 'home' }
]

const designatedOrganizations = {
  506306: ['重庆大巴山自然保护区管理局'],
  506310: ['青海省绿色发起人生态保护中心'],
  896256: ['上海市慈善基金会', '北京乐平公益基金会'],
  506311: ['江苏省湿地保护协会'],
  506312: ['深圳市零废弃环保公益事业发展中心']
}

export const summaryRecruitments = availableProjects.concat(historicalRecruitments).map(recruitment => Object.assign({}, recruitment, {
  designatedOrganizations: designatedOrganizations[recruitment.id] || [],
  scope: recruitment.department.indexOf('项目组') === 0 ? 'group' : 'center'
}))

// 金额、提交时间为本页演示字段；不把状态变更时间误作提交时间。
const applicationRelations = [
  { projectId: 1, recruitmentId: 506306, amount: 200000, submittedAt: '2025-12-02 10:20:00' },
  { projectId: 7, recruitmentId: 506306, amount: 200000, submittedAt: '2025-12-03 14:30:00' },
  { projectId: 6, recruitmentId: 506310, amount: 98000, submittedAt: '2025-09-28 11:45:20' },
  { projectId: 2, recruitmentId: 896256, amount: 300000, submittedAt: '2025-11-22 15:31:42' },
  { projectId: 3, recruitmentId: 896256, amount: 180000, submittedAt: '2025-11-19 09:26:15' },
  { projectId: 4, recruitmentId: 506311, amount: 120000, submittedAt: '2025-02-08 18:20:03' },
  { projectId: 5, recruitmentId: 506312, amount: 80000, submittedAt: '2025-03-16 14:02:48' }
]

export const summaryApplications = applicationRelations.map(relation => Object.assign({}, appliedProjects.find(project => project.id === relation.projectId), relation))
