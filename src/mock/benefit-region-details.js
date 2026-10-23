import example from './benefit-region-details.json'
import { getBenefitRegion } from './benefit-regions'

// 所有地区共用北京市前 10 条真实记录的示例快照，不调用线上接口。
// 接口替换入口：入参 { regionCode, page, pageSize }，返回同名分页参数及 { total, records }。
export function getBenefitRegionDetails ({ regionCode, page = 1, pageSize = 50 }) {
  const currentPage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1
  const size = Number.isInteger(Number(pageSize)) && Number(pageSize) > 0 ? Math.min(Number(pageSize), 100) : 50
  const validRegion = getBenefitRegion(regionCode)
  return {
    regionCode,
    page: currentPage,
    pageSize: size,
    total: validRegion ? example.total : 0,
    records: validRegion ? example.records.slice((currentPage - 1) * size, currentPage * size).map(record => Object.assign({}, record)) : []
  }
}
