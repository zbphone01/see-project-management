import example from './benefit-document-details.json'

// 本地文件材料示例，文件名不代表已提供附件正文。
export function createBenefitDocumentDetails () {
  return example.records.map(record => Object.assign({}, record))
}
