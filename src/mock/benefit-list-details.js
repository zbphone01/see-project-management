import example from './benefit-list-details.json'

// 本地名单详情示例；附件仅提供文件名，未连接真实文件服务。
export function createBenefitListDetails () {
  return example.records.map(record => Object.assign({}, record))
}
