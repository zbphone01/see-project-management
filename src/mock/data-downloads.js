const validity = 48 * 60 * 60 * 1000

export function downloadExpired (record, now = Date.now()) {
  return now - record.appliedAt > validity
}

export function createDataDownloads () {
  const now = new Date('2026-10-19T16:00:00+08:00').getTime()
  const accounts = ['文梓涵', '高睿', '高睿', '李娜', '李娜', '巩欣宜', '靳培娟', '杨佳', '张敏', '王静', '陈晨', '刘洋']
  return accounts.map((account, index) => ({
    id: `demo-export-${index + 1}`,
    appliedAt: now - [1, 3, 6, 24, 47, 49, 72, 96, 120, 144, 168, 192][index] * 60 * 60 * 1000,
    account,
    rows: Array.from({ length: index + 3 }, (item, row) => ({ id: row + 1, name: `示例数据${row + 1}` }))
  }))
}
