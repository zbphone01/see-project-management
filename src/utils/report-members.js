export const reportMemberFields = ['name', 'position', 'responsibilities', 'workType']

export function reportStaffCounts (members) {
  const paid = member => member.usesLingxi ? member.usesLingxi === '是' : String(member.workType || '').split(' / ')[1] === '领薪'
  return [
    { id: 'fulltime', label: '全职领薪（人数）', count: members.filter(member => String(member.workType || '').indexOf('全职') === 0 && paid(member)).length },
    { id: 'parttime', label: '兼职领薪（人数）', count: members.filter(member => String(member.workType || '').indexOf('兼职') === 0 && paid(member)).length },
    { id: 'volunteers', label: '实习生（人数）', count: members.filter(member => /实习/.test(member.workType || '')).length }
  ]
}

export function reportMemberChanged (member, applicationMembers) {
  const original = applicationMembers.find(item => item.id === member.id)
  return !original || reportMemberFields.some(key => String(member[key] || '').trim() !== String(original[key] || '').trim())
}
