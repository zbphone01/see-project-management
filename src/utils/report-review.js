// Opinion aggregation is display-only; preserve original JSON keys and values.
export function reviewText (comments, key) {
  const value = (comments || {})[key]
  return typeof value === 'string' ? value.trim() : ''
}

export function rowReviewText (comments, prefix, fields = []) {
  const known = fields.map(field => prefix + '.' + field)
  const extra = Object.keys(comments || {}).filter(key => key.indexOf(prefix + '.') === 0 && known.indexOf(key) < 0).sort()
  return [prefix].concat(known, extra).map(key => reviewText(comments, key)).filter(Boolean).join('\n')
}
