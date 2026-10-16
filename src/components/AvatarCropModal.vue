<template>
  <a-modal :visible="visible" wrap-class-name="standard-form-modal" :title="title" :width="500" :mask-closable="false" :confirm-loading="loading" :ok-button-props="{ props: { disabled: loading } }" ok-text="确认" cancel-text="取消" @ok="confirm" @cancel="cancel">
    <div class="avatar-crop-content">
      <p>拖动图片调整方形内容，使用滑块缩放；也可聚焦图片后使用方向键调整。</p>
      <div class="avatar-crop-stage">
        <div class="avatar-crop-outside" aria-hidden="true"><img v-if="source" :src="source" :style="imageStyle" alt="" draggable="false" /></div>
        <div class="avatar-crop-viewport" tabindex="0" role="group" :aria-label="imageLabel + '方形裁剪区域，使用方向键移动图片'" @pointerdown="startDrag" @pointermove="drag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="dragging = false" @keydown.left.prevent="move(8, 0)" @keydown.right.prevent="move(-8, 0)" @keydown.up.prevent="move(0, 8)" @keydown.down.prevent="move(0, -8)">
        <img v-if="source" :src="source" :style="imageStyle" :alt="'待裁剪' + imageLabel" draggable="false" />
        <span v-if="loading" class="avatar-crop-loading"><a-icon type="loading" /> 读取图片中</span>
        <div class="avatar-crop-grid" aria-hidden="true"></div>
        </div>
      </div>
      <label class="avatar-crop-zoom"><span>缩放</span><input type="range" min="1" max="3" step="0.01" :value="zoom" :disabled="loading" :aria-label="imageLabel + '缩放'" @input="changeZoom(Number($event.target.value))"><span>{{ Math.round(zoom * 100) }}%</span></label>
    </div>
  </a-modal>
</template>

<script>
import { avatarCropGeometry } from '../utils/avatar-crop'

export default {
  name: 'AvatarCropModal',
  props: { title: { type: String, default: '裁剪头像' }, imageLabel: { type: String, default: '头像' } },
  data () { return { visible: false, loading: false, source: '', width: 256, height: 256, zoom: 1, x: 0, y: 0, dragging: false, pointerX: 0, pointerY: 0 } },
  computed: {
    geometry () { return avatarCropGeometry(this.width, this.height, this.zoom, this.x, this.y) },
    imageStyle () { return { width: this.width * this.geometry.scale + 'px', height: this.height * this.geometry.scale + 'px', left: this.geometry.left + 'px', top: this.geometry.top + 'px' } }
  },
  beforeDestroy () { this.clear() },
  methods: {
    open (file) {
      this.clear()
      const token = {}; this._loadToken = token
      this.visible = true; this.loading = true; this.$emit('busy', true)
      const reader = new FileReader(); this._reader = reader
      reader.onload = () => {
        if (this._loadToken !== token) return
        const image = new Image()
        image.onload = () => {
          if (this._loadToken !== token) return
          if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 40000000) { this.fail(); return }
          this._image = image; this.width = image.naturalWidth; this.height = image.naturalHeight; this.source = reader.result; this.loading = false
        }
        image.onerror = () => { if (this._loadToken === token) this.fail() }
        image.src = reader.result
      }
      reader.onerror = () => { if (this._loadToken === token) this.fail() }
      reader.readAsDataURL(file)
    },
    clear () { this._loadToken = null; if (this._reader && this._reader.readyState === 1) this._reader.abort(); this._reader = null; this._image = null; this.source = ''; this.zoom = 1; this.x = 0; this.y = 0; this.dragging = false; this.loading = false; this.visible = false },
    cancel () { this.clear(); this.$emit('busy', false) },
    fail () { this.$message.error('图片无法读取或尺寸过大，请选择其他图片'); this.cancel() },
    move (x, y) { if (this.loading) return; const geometry = avatarCropGeometry(this.width, this.height, this.zoom, this.x + x, this.y + y); this.x = geometry.offsetX; this.y = geometry.offsetY },
    changeZoom (zoom) { const ratio = zoom / this.zoom; const geometry = avatarCropGeometry(this.width, this.height, zoom, this.geometry.offsetX * ratio, this.geometry.offsetY * ratio); this.zoom = zoom; this.x = geometry.offsetX; this.y = geometry.offsetY },
    startDrag (event) { if (this.loading || (event.pointerType === 'mouse' && event.button !== 0)) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); this.dragging = true; this.pointerX = event.clientX; this.pointerY = event.clientY },
    drag (event) { if (!this.dragging) return; this.move(event.clientX - this.pointerX, event.clientY - this.pointerY); this.pointerX = event.clientX; this.pointerY = event.clientY },
    endDrag () { this.dragging = false },
    confirm () {
      if (this.loading || !this._image) return
      try {
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512
        const context = canvas.getContext('2d'); const geometry = this.geometry
        context.drawImage(this._image, geometry.sourceX, geometry.sourceY, geometry.sourceSize, geometry.sourceSize, 0, 0, 512, 512)
        const result = canvas.toDataURL('image/png')
        this.$emit('confirm', result); this.cancel()
      } catch (error) { this.$message.error('图片裁剪失败，请重试或选择其他图片') }
    }
  }
}
</script>

<style scoped>
.avatar-crop-content { display: grid; justify-items: center; gap: 20px; }
.avatar-crop-content > p { margin: 0; color: #718095; line-height: 1.6; }
.avatar-crop-stage { position: relative; display: grid; place-items: center; width: 100%; min-width: 256px; height: 336px; overflow: hidden; background: #f4f7fb; }
.avatar-crop-outside { position: absolute; left: 50%; top: 50%; width: 256px; height: 256px; transform: translate(-50%, -50%); opacity: .3; pointer-events: none; }
.avatar-crop-outside img, .avatar-crop-viewport img { position: absolute; max-width: none; pointer-events: none; }
.avatar-crop-viewport { position: relative; width: 256px; height: 256px; overflow: hidden; background: #f4f7fb; cursor: grab; touch-action: none; user-select: none; }
.avatar-crop-viewport:active { cursor: grabbing; }
.avatar-crop-viewport:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.avatar-crop-grid { position: absolute; inset: 0; border: 1px solid #1677ff; pointer-events: none; background-image: linear-gradient(to right, transparent 33%, rgba(255,255,255,.55) 33%, rgba(255,255,255,.55) 33.5%, transparent 33.5%, transparent 66%, rgba(255,255,255,.55) 66%, rgba(255,255,255,.55) 66.5%, transparent 66.5%), linear-gradient(to bottom, transparent 33%, rgba(255,255,255,.55) 33%, rgba(255,255,255,.55) 33.5%, transparent 33.5%, transparent 66%, rgba(255,255,255,.55) 66%, rgba(255,255,255,.55) 66.5%, transparent 66.5%); }
.avatar-crop-loading { display: grid; place-content: center; height: 100%; color: #718095; }
.avatar-crop-zoom { display: flex; align-items: center; gap: 12px; width: 256px; }
.avatar-crop-zoom input { flex: 1; min-width: 0; }
.avatar-crop-zoom > span:last-child { width: 40px; text-align: right; }
</style>
