import { projectReports } from './reports'

export const paymentStatuses = ['申请中', '已完成', '待确认']
export const paymentReportTypes = ['进展报告', '结项报告']

// 金额以整数分保存；本地演示数据，不代表已连接 OA 财务系统。
export function parseAmount (value) {
  const text = String(value == null ? '' : value).trim()
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(text)) return null
  const parts = text.split('.')
  return Number(parts[0]) * 100 + Number(((parts[1] || '') + '00').slice(0, 2))
}

export function paymentStatus (record) {
  if (record.oaAmount === null) return '申请中'
  return record.oaAmount === record.reportAmount ? '已完成' : '待确认'
}

export function createPaymentApplications () {
  return projectReports.filter(report => ['进展已审', '进展通过', '结项已审', '结项通过'].includes(report.status)).map((report, index) => ({
    ...report,
    id: 'payment-' + report.reportCode,
    paymentCode: 'P-' + String(993 - index).padStart(6, '0'),
    reportAmount: index === 3 ? 3000000 : 10000000,
    oaAmount: index === 0 ? null : index === 2 ? 9000000 : index === 3 ? 3000000 : 10000000,
    manual: false
  }))
}
