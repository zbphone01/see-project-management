<template>
  <a-popover v-if="text" v-model="popupVisible" :overlay-class-name="overlayClassName" trigger="click" placement="topLeft">
    <template slot="content"><div class="review-comment-bubble"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ text }}</p></div><a-button size="small" type="primary" @click="popupVisible = false">关闭</a-button></div></template>
    <button type="button" class="review-comment-label"><slot /></button>
  </a-popover>
  <span v-else><slot /></span>
</template>
<script>
export default {
  name: 'ReviewCommentLabel',
  props: { comment: { default: '' }, overlayClassName: { type: String, default: '' }, open: { type: Boolean, default: undefined } },
  data () { return { visible: false } },
  computed: { text () { return typeof this.comment === 'string' ? this.comment.trim() : '' }, popupVisible: { get () { return this.open === undefined ? this.visible : this.open }, set (value) { this.visible = value; this.$emit('open-change', value) } } },
  watch: { text () { this.popupVisible = false } }
}
</script>
<style scoped>
.review-comment-label { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; cursor: pointer; }
.review-comment-label:focus-visible { outline: 2px solid #ff7875; outline-offset: 2px; }
.review-comment-bubble { width: 300px; max-width: 60vw; }
.review-comment-bubble > div { display: flex; gap: 10px; align-items: flex-start; }
.review-comment-bubble .anticon { margin-top: var(--review-comment-icon-offset, 3px); color: #faad14; font-size: var(--review-comment-icon-size, 14px); }
.review-comment-bubble p { flex: 1; min-width: 0; margin: 0 0 14px; font-size: var(--review-comment-font-size, 14px); line-height: var(--review-comment-line-height, 1.6); overflow-wrap: anywhere; white-space: pre-wrap; }
.review-comment-bubble .ant-btn { display: block; margin-left: auto; }
</style>
