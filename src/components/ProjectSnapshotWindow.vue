<template>
  <div class="snapshot-overlay" @keydown.esc.stop="$emit('close')">
    <section ref="window" class="snapshot-window" role="dialog" aria-label="申请书快照" :style="{ transform: 'translate(' + x + 'px, ' + y + 'px)' }">
      <header class="snapshot-header" @pointerdown="startDrag" @pointermove="drag" @pointerup="endDrag" @pointercancel="endDrag" @lostpointercapture="endDrag">
        <div class="snapshot-title"><strong>申请书快照</strong><slot name="title-meta" /></div>
        <a-button ref="close" class="snapshot-close" aria-label="关闭申请书快照" @pointerdown.stop @click="$emit('close')"><a-icon type="close" /></a-button>
      </header>
      <div class="snapshot-body"><slot /></div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ProjectSnapshotWindow',
  data () { return { x: 0, y: 0, dragging: false, pointerX: 0, pointerY: 0 } },
  mounted () {
    this._previousFocus = document.activeElement
    this.$refs.close.$el.focus()
    window.addEventListener('resize', this.resetPosition)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resetPosition)
    if (this.$refs.window.contains(document.activeElement) && this._previousFocus && document.contains(this._previousFocus)) this._previousFocus.focus()
  },
  methods: {
    resetPosition () { this.x = 0; this.y = 0; this.dragging = false },
    startDrag (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      this.pointerX = event.clientX
      this.pointerY = event.clientY
      this.dragging = true
    },
    drag (event) {
      if (!this.dragging) return
      const rect = this.$refs.window.getBoundingClientRect()
      const dx = Math.max(-rect.left, Math.min(window.innerWidth - rect.right, event.clientX - this.pointerX))
      const dy = Math.max(-rect.top, Math.min(window.innerHeight - rect.bottom, event.clientY - this.pointerY))
      this.x += dx
      this.y += dy
      this.pointerX = event.clientX
      this.pointerY = event.clientY
    },
    endDrag () { this.dragging = false }
  }
}
</script>

<style scoped>
.snapshot-overlay { position: fixed; inset: 0; z-index: 1100; display: flex; align-items: flex-end; justify-content: flex-end; padding: 24px; pointer-events: none; }
.snapshot-window { width: min(1180px, calc(100vw - 80px)); height: 50vh; display: flex; flex-direction: column; overflow: hidden; pointer-events: auto; border: 1px solid #e6ebf2; border-radius: 16px; background: #f4f7fb; box-shadow: 0 16px 48px rgba(23, 56, 92, .2); }
.snapshot-header { flex-shrink: 0; min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 20px; border-bottom: 1px solid #e6ebf2; background: #fff; color: #18253c; cursor: move; touch-action: none; user-select: none; }
.snapshot-title { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; min-width: 0; }
.snapshot-close { border: 0; background: transparent; box-shadow: none; }
.snapshot-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 20px; }
</style>
