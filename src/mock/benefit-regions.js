import example from './benefit-regions.json'

// 真实系统地区列表的本地展示快照，不调用线上接口。
export function getBenefitRegionCode (name) {
  const region = example.records.find(record => record.name === name)
  return region ? region.regionCode : null
}

export function getBenefitRegion (code) {
  const region = example.records.find(record => record.regionCode === code)
  return region ? Object.assign({}, region) : null
}

export function createBenefitRegions () {
  return example.records.map(record => Object.assign({}, record))
}
