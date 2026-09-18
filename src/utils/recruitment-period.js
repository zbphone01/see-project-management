const DAY = 24 * 60 * 60 * 1000

function parseLocalDate (value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '')
  if (!parts) return null
  const year = Number(parts[1])
  const month = Number(parts[2]) - 1
  const day = Number(parts[3])
  const date = new Date(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null
}

function calendarDay (date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY
}

// 按浏览器本地日期计算，截止日包含当天；同日起止也具有完整的一天。
export function getRecruitmentPeriod (startDate, endDate, now = new Date()) {
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  if (!start || !end || end < start || !(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return { state: 'unknown', label: '待公布', percent: 0, summary: '招募起止时间待公布' }
  }
  const deadline = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  if (now < start) {
    return { state: 'upcoming', label: '未开始', percent: 0, summary: `距招募开始还有 ${calendarDay(start) - calendarDay(now)} 天` }
  }
  if (now >= deadline) {
    return { state: 'ended', label: '已结束', percent: 100, summary: '招募周期已结束 · 申请已截止' }
  }
  const percent = Math.min(99, Math.floor((now - start) / (deadline - start) * 100))
  const days = calendarDay(end) - calendarDay(now)
  return {
    state: 'active', label: '进行中', percent,
    summary: `招募周期已进行 ${percent}% · ${days === 0 ? '今日截止' : `剩余 ${days} 天`}`
  }
}
