// Keep the same basic formatting and image rules as the project form editor.
export function cleanFundraisingRichText (html) {
  const source = document.createElement('div')
  source.innerHTML = html || ''
  const allowed = ['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'TABLE', 'TBODY', 'TR', 'TD', 'TH', 'IMG']
  Array.from(source.querySelectorAll('*')).reverse().forEach(element => {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(element.tagName)) element.remove()
    else if (!allowed.includes(element.tagName)) element.replaceWith(...element.childNodes)
    else if (element.tagName === 'IMG') {
      if (!/^data:image\/(png|jpeg|gif|webp);base64,/i.test(element.getAttribute('src') || '')) element.remove()
      else Array.from(element.attributes).forEach(attribute => { if (!['src', 'alt'].includes(attribute.name)) element.removeAttribute(attribute.name) })
    } else Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name))
  })
  return source.innerHTML
}

export function paragraphsToRichText (paragraphs) {
  const container = document.createElement('div')
  ;(Array.isArray(paragraphs) ? paragraphs : []).forEach(paragraph => {
    const node = document.createElement('p')
    node.textContent = paragraph || ''
    container.appendChild(node)
  })
  return container.innerHTML
}
