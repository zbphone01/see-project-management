// 本地原型演示；工作台与列表共享内存数据，刷新后恢复，不关联真实权限或后台。
export const planDepartments = ['项目综合运营与拓展项目组', '生态保护项目中心', '联合公益项目组']
let sessionPlans
let nextPlanId = 1

export function createFundraisingPlans () {
  if (!sessionPlans) sessionPlans = [
    { id: 'plan-yangtze', name: '2025年点绿长江项目筹款招募', targetAmount: 3000000, restriction: planDepartments[0], editable: true, recruitmentCount: 0 },
    { id: 'plan-local', name: '在地环保项目筹款规划', targetAmount: 4000000, restriction: '公开', editable: false, recruitmentCount: 1 }
  ]
  return sessionPlans
}

export function appendFundraisingPlan (values) {
  const plan = Object.assign({ id: `plan-local-new-${nextPlanId++}`, editable: true, recruitmentCount: 0 }, values)
  createFundraisingPlans().unshift(plan)
  return plan
}

export function createPlanApplications () {
  return [
    { id: 'plan-application-1', planId: 'plan-yangtze', name: '2025年点绿长江项目筹款招募', actualAmount: 0, targetAmount: 3000000, department: planDepartments[0], status: '草稿', updatedAt: '2025-12-11 09:30:00', hasRecruitment: false },
    { id: 'plan-application-2', planId: 'plan-local', name: '在地环保项目筹款规划', actualAmount: 0, targetAmount: 4000000, department: planDepartments[1], status: '规划待审', updatedAt: '2025-12-10 14:20:00', hasRecruitment: false },
    { id: 'plan-application-3', planId: 'plan-local', name: '在地环保项目筹款规划', actualAmount: 0, targetAmount: 4000000, department: planDepartments[2], status: '规划驳回', updatedAt: '2025-12-09 10:15:00', hasRecruitment: false },
    { id: 'plan-application-4', planId: 'plan-local', name: '在地环保项目筹款规划', actualAmount: 0, targetAmount: 4000000, department: planDepartments[0], status: '规划通过', updatedAt: '2025-12-08 16:45:00', hasRecruitment: false },
    { id: 'plan-application-5', planId: 'plan-local', name: '在地环保项目筹款规划', actualAmount: 3400000, targetAmount: 4000000, department: planDepartments[1], status: '规划通过', updatedAt: '2025-12-07 11:00:00', hasRecruitment: true }
  ]
}

export function filterPlans (records, filters) {
  const keyword = (filters.name || '').trim().toLowerCase()
  return records.filter(record => record.name.toLowerCase().includes(keyword) && (!filters.department || record.department === filters.department))
}

export function applicationActions (record) {
  if (record.status === '草稿') return ['编辑']
  if (record.status === '规划待审') return ['审核']
  if (record.status === '规划驳回') return ['查看', '编辑']
  if (record.status === '规划通过') return record.hasRecruitment ? ['查看', '调整预算'] : ['查看', '编辑', '发起招募']
  return ['查看']
}

export function validatePlan (draft) {
  const errors = {}
  if (!draft.name || !draft.name.trim()) errors.name = '请输入筹款规划名称'
  if (!['公开'].concat(planDepartments).includes(draft.restriction)) errors.restriction = '请选择规划申请限制'
  if (typeof draft.targetAmount !== 'number' || !Number.isFinite(draft.targetAmount) || draft.targetAmount <= 0 || draft.targetAmount > 999999999999.99) errors.targetAmount = '请输入大于 0 且不超过 999,999,999,999.99 元的金额'
  return errors
}
