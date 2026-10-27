// 纯业务 JSON 适配与计算；不依赖 Vue、路由或浏览器存储。
export const copyBudgetData = value => JSON.parse(JSON.stringify(value))
export const budgetMoney = value => Math.round((Number(value) || 0) * 100) / 100
export function budgetNumber (value) {
  if (value === null || value === undefined || String(value).trim() === '' || value === '/') return null
  const number = Number(String(value).replace(/,/g, '').replace(/%$/, ''))
  if (!Number.isFinite(number)) throw new Error('预算中含无效数字')
  return number
}
export const budgetQuarterTotal = row => budgetMoney((row.quarters || []).reduce((sum, value) => sum + budgetMoney(value), 0))
export const budgetPersonnelAmount = row => budgetMoney(Number(row.monthly) * Number(row.months))
const statuses = ['pending', 'editing', 'completed']
const quarters = row => {
  if (row.quarters !== undefined && (!Array.isArray(row.quarters) || row.quarters.length !== 4)) throw new Error('预算分期必须为四期')
  return (row.quarters || [null, null, null, null]).map(budgetNumber)
}
export function normalizeBudget (value = {}, project = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('预算格式无效')
  if (value.schemaVersion !== undefined && value.schemaVersion !== 1) throw new Error('不支持的预算数据版本')
  if (value.rows !== undefined && !Array.isArray(value.rows)) throw new Error('费用明细格式无效')
  if (value.personnel !== undefined && !Array.isArray(value.personnel)) throw new Error('人力明细格式无效')
  const source = copyBudgetData(value)
  const groups = [], rows = [], legacyPersonnel = []
  let output = null, activity = null
  ;(source.rows || []).forEach(row => {
    if (row.kind === 'total') return
    if (row.kind === 'group') {
      if (String(row.code).indexOf('产出') === 0) {
        const matches = (project.outputs || []).filter(item => item.name === row.name)
        const linked = matches.length === 1 ? matches[0] : null
        output = { id: linked ? linked.id : row.id, name: row.name, activities: [] }; activity = null; groups.push(output)
      } else { output = null; activity = null }
      return
    }
    if (row.kind === 'activity' && row.price === undefined && String(row.code || '').indexOf('产出活动') === 0) {
      if (output) {
        const linked = ((project.outputs || []).find(item => item.id === output.id) || {}).activities || []
        const matches = linked.filter(item => item.name === row.name)
        activity = { id: matches.length === 1 ? matches[0].id : row.id, name: row.name }
        output.activities.push(activity)
      }
      return
    }
    const item = { ...row, quarters: quarters(row) }
    if (!item.id) throw new Error('费用明细缺少稳定 ID')
    if (row.kind === 'detail') {
      // 旧展示 JSON 只保留原始明细文字，不能反推缺失的单价、数量或人员。
      item.description = row.description || row.detail || ''
      item.kind = String(row.code).indexOf('1-支撑') === 0 ? 'support' : 'activity'
      item.outputId = row.outputId || (output && output.id) || null
      item.activityId = row.activityId || (activity && activity.id) || null
      if (String(row.code).indexOf('2-人力') === 0) {
        ;['price', 'quantity', 'adjustment', 'adjustedBudget', 'executed'].forEach(field => { item[field] = budgetNumber(row[field]) })
        delete item.total; delete item.detail; delete item.adjustmentRatio; delete item.executionRatio
        legacyPersonnel.push(item); return
      }
    }
    ;['price', 'quantity', 'adjustment', 'adjustedBudget', 'executed'].forEach(field => { item[field] = budgetNumber(row[field]) })
    if (!['support', 'activity'].includes(item.kind)) item.kind = 'activity'
    item.unit = row.unit || ''; item.description = item.description || row.detail || ''
    item.outputId = item.outputId || null; item.activityId = item.activityId || null
    // 展示合计和百分比仅由原始数值派生，不保存第二份可写金额。
    delete item.total; delete item.detail; delete item.adjustmentRatio; delete item.executionRatio
    rows.push(item)
  })
  const personnel = (source.personnel || []).map(row => {
    if (!row.id) throw new Error('人员明细缺少稳定 ID')
    const memberId = row.memberId || row.id
    const member = (project.organizationMembers || project.team || []).find(item => item.id === memberId)
    const item = { ...row, memberId, ...(member ? { name: member.name, position: member.position, responsibilities: member.responsibilities } : {}), quarters: quarters(row) }
    ;['monthly', 'months', 'ratio', 'adjustment', 'adjustedBudget', 'executed'].forEach(field => { item[field] = budgetNumber(row[field]) })
    item.nature = row.nature || null; item.remark = row.remark || null
    delete item.total
    return item
  })
  for (const list of [rows, personnel]) {
    if (new Set(list.map(row => row.id)).size !== list.length) throw new Error('预算明细 ID 重复')
  }
  return {
    schemaVersion: 1,
    revision: Number.isInteger(source.revision) && source.revision >= 0 ? source.revision : 0,
    editStatus: statuses.includes(source.editStatus) ? source.editStatus : 'pending',
    personnelStatus: statuses.includes(source.personnelStatus) ? source.personnelStatus : source.personnelUpdatedAt ? 'completed' : 'pending',
    updatedAt: source.updatedAt || '', personnelUpdatedAt: source.personnelUpdatedAt || '',
    rows, personnel,
    groups: groups.length ? groups : source.groups || [],
    legacyPersonnel: legacyPersonnel.length ? legacyPersonnel : source.legacyPersonnel || [],
    metadata: { organization: source.organization || '', period: source.period || '', partners: source.partners || '', executionCutoff: source.executionCutoff || '', ...(source.metadata || {}) }
  }
}
export function buildBudgetRows (project, value, editable = false) {
  const budget = normalizeBudget(value, project), costs = budget.rows, result = []
  const personnel = budget.personnel.length ? budget.personnel : budget.legacyPersonnel
  const aggregate = (key, kind, code, name, records, outputId) => {
    const sums = [0, 1, 2, 3].map(index => budgetMoney(records.reduce((sum, row) => sum + Number(row.quarters[index] || 0), 0)))
    const row = { key, id: key, kind, code, name, quarters: sums, total: budgetQuarterTotal({ quarters: sums }), outputId }
    ;['adjustment', 'adjustedBudget', 'executed'].forEach(field => { row[field] = records.some(item => item[field] != null) ? budgetMoney(records.reduce((sum, item) => sum + Number(item[field] || 0), 0)) : null })
    row.adjustmentRatio = row.adjustment === null || !row.total ? null : (row.adjustment / row.total * 100).toFixed(1) + '%'
    row.executionRatio = row.executed === null || !(row.adjustedBudget === null ? row.total : row.adjustedBudget) ? null : (row.executed / (row.adjustedBudget === null ? row.total : row.adjustedBudget) * 100).toFixed(1) + '%'
    return row
  }
  const detail = (row, code) => ({ ...aggregate(row.id, 'detail', code, row.name, [row]), type: row.type, cost: row, description: row.description })
  const support = costs.filter(row => row.kind === 'support')
  result.push(aggregate('total', 'total', '', '', costs.concat(personnel)))
  result.push(aggregate('support', 'group', '1-支撑', '项目支撑费用', support))
  support.forEach(row => result.push(detail(row, '1-支撑')))
  if (editable) result.push({ key: 'add-support', kind: 'action', costKind: 'support', action: '添加支撑费用', note: '如果没有支撑费用，可不进行添加' })
  result.push(aggregate('personnel', 'group', '2-人力', '项目执行团队人力成本', personnel))
  result.push({ ...aggregate('personnel-detail', 'detail', '2-人力', '项目人员人力成本', personnel), description: '详见人力成本分摊表', type: '工资薪金' })
  if (editable) result.push({ key: 'edit-personnel', kind: 'action', costKind: 'personnel', action: '编辑人力费用', note: '项目执行团队的人力成本在人力成本分摊表中填写' })
  const outputs = project.outputs || budget.groups
  outputs.forEach((output, outputIndex) => {
    result.push(aggregate('output:' + output.id, 'group', '产出' + (outputIndex + 1), output.name, costs.filter(row => row.outputId === output.id), output.id))
    ;(output.activities || []).forEach((activity, activityIndex) => {
      const code = (outputIndex + 1) + '.' + (activityIndex + 1)
      const records = costs.filter(row => row.outputId === output.id && row.activityId === activity.id)
      result.push(aggregate('activity:' + activity.id, 'activity', '产出活动' + code, activity.name, records, output.id))
      records.forEach((row, index) => result.push(detail(row, code + '.' + (index + 1))))
      if (editable) result.push({ key: 'add:' + activity.id, kind: 'action', costKind: 'activity', outputId: output.id, activityId: activity.id, activityName: code + ' ' + activity.name, action: '添加活动预算', note: '如果活动无需预算可不进行添加；建议按预算科目或类型逐条添加，以提高审核效率。预算明细采用单价 × 数量填写，明细说明可用于解释单价及数量。' })
    })
  })
  const orphaned = costs.filter(row => row.kind !== 'support' && !outputs.some(output => output.id === row.outputId && (output.activities || []).some(activity => activity.id === row.activityId)))
  if (orphaned.length) {
    result.push(aggregate('unlinked', 'group', '待处理', '原产出活动已删除或未关联，请检查费用明细', orphaned))
    orphaned.forEach(row => result.push(detail(row, row.code || '待处理')))
  }
  return result
}
