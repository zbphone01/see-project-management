// Square crop geometry shared by preview and Canvas export.
export function avatarCropGeometry (width, height, zoom, x, y, viewport = 256) {
  const scale = Math.max(viewport / width, viewport / height) * Math.max(1, Math.min(3, zoom))
  const limitX = Math.max(0, (width * scale - viewport) / 2)
  const limitY = Math.max(0, (height * scale - viewport) / 2)
  const offsetX = Math.max(-limitX, Math.min(limitX, x))
  const offsetY = Math.max(-limitY, Math.min(limitY, y))
  const left = (viewport - width * scale) / 2 + offsetX
  const top = (viewport - height * scale) / 2 + offsetY
  return { scale, left, top, offsetX, offsetY, sourceX: -left / scale, sourceY: -top / scale, sourceSize: viewport / scale }
}
