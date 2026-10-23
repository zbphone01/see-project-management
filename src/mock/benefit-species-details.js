import example from './benefit-species-details.json'

// 物种详情本地示例，未连接后端统计接口。
export function createSpeciesDetails () {
  return example.records.map(record => Object.assign({}, record))
}
