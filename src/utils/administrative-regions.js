import snapshot from '../mock/administrative-regions.json'

export const REGION_ALL = '全部'
export const REGION_LABELS = ['省 / 直辖市', '地级市 / 直辖市区', '县 / 行政区']
const municipalities = ['北京市', '天津市', '上海市', '重庆市']
const regions = snapshot.regions
export const isMunicipality = province => municipalities.includes(province)
const option = name => ({ value: name, label: name })

export function normalizeRegionPath (value) {
  const path = Array.isArray(value) ? value.map(item => String(item || '').trim()).slice(0, 3) : []
  while (path.length && !path[path.length - 1]) path.pop()
  if (isMunicipality(path[0]) && path[1] && path[1] !== REGION_ALL) {
    if (['市辖区', '县', path[0], path[0].replace(/市$/, '市区')].includes(path[1])) path[1] = '市辖区'
    else path.splice(1, 0, '市辖区')
  }
  return path[1] === REGION_ALL ? path.slice(0, 2) : path.slice(0, 3)
}

export function formatRegionPath (value) {
  const path = normalizeRegionPath(value)
  return path.filter((name, index) => name && name !== REGION_ALL && !(index === 1 && isMunicipality(path[0]))).join(' - ')
}

export function regionPathComplete (value) {
  const path = normalizeRegionPath(value)
  return !!path[0] && (path[1] === REGION_ALL || (path.length === 3 && !!path[1] && !!path[2]))
}

export function parseRegionText (text) {
  const value = String(text || '').trim()
  if (!value) return []
  if (value === '全国') return ['全国']
  let path
  if (value.includes('-')) path = value.split(/\s*-\s*/)
  else {
    const province = Object.keys(regions).find(name => value.indexOf(name) === 0)
    if (!province) return value.match(/.+?(?:省|自治区|特别行政区|市|自治州|地区|盟|区|县|旗)/g) || [value]
    let rest = value.slice(province.length)
    if (isMunicipality(province)) {
      rest = rest.replace(/^(市辖区|北京市区|天津市区|上海市区|重庆市区)/, '')
      path = rest ? [province, '市辖区', rest] : [province]
    } else {
      const city = Object.keys(regions[province]).find(name => rest.indexOf(name) === 0)
      path = city ? [province, city].concat(rest.slice(city.length) ? [rest.slice(city.length)] : []) : [province]
    }
  }
  path = normalizeRegionPath(path)
  if (path.length === 1) path.push(REGION_ALL)
  else if (path.length === 2 && path[1] !== REGION_ALL && !isMunicipality(path[0])) path.push(REGION_ALL)
  return path
}

// Both cascaders and separate selects consume the same tree. “全部” is a leaf.
// Preserve historical selections as local fallback options without altering the snapshot.
export function createRegionOptions (legacyPaths = []) {
  const result = Object.keys(regions).map(province => {
    const cities = regions[province]
    const children = isMunicipality(province)
      ? [{ ...option('市辖区'), children: [].concat(...Object.keys(cities).map(city => cities[city])).map(option) }]
      : Object.keys(cities).map(city => ({ ...option(city), children: [option(REGION_ALL)].concat(cities[city].map(option)) }))
    return { ...option(province), children: [option(REGION_ALL)].concat(children) }
  })
  legacyPaths.forEach(value => {
    const path = normalizeRegionPath(value)
    if (!path[0] || path[0] === '全国') return
    let list = result
    path.forEach((name, index) => {
      let node = list.find(item => item.value === name)
      if (!node) { node = option(name); list.push(node) }
      if (index < path.length - 1 && name !== REGION_ALL) {
        if (!node.children) node.children = index === 0 || !isMunicipality(path[0]) ? [option(REGION_ALL)] : []
        list = node.children
      }
    })
  })
  return result
}

export function regionFieldOptions (field, selection, legacyPaths = []) {
  const tree = createRegionOptions(legacyPaths)
  if (field === 'province') return tree
  const province = tree.find(item => item.value === selection.province)
  const cities = province ? province.children || [] : []
  if (field === 'city') return cities
  if (selection.city === REGION_ALL) return []
  const city = cities.find(item => item.value === selection.city)
  return city ? city.children || [] : []
}
