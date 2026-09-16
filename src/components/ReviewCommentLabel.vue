<template>
  <a-popover v-if="text" v-model="visible" trigger="click" placement="topLeft">
    <template slot="content"><div class="review-comment-bubble"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ text }}</p></div><a-button size="small" type="primary" @click="visible = false">关闭</a-button></div></template>
    <button type="button" class="review-comment-label"><slot /></button>
  </a-popover>
  <span v-else><slot /></span>
</template>
<script>
export default {
  name: 'ReviewCommentLabel',
  props: { comment: { default: '' } },
  data () { return { visible: false } },
  computed: { text () { return typeof this.comment === 'string' ? this.comment.trim() : '' } },
  watch: { text () { this.visible = false } }
}
</script>
<style scoped>
.review-comment-label { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: inherit; cursor: pointer; }
.review-comment-label:focus-visible { outline: 2px solid #ff7875; outline-offset: 2px; }
.review-comment-bubble { width: 300px; max-width: 60vw; }
.review-comment-bubble > div { display: flex; gap: 10px; align-items: flex-start; }
.review-comment-bubble .anticon { margin-top: 3px; color: #faad14; }
.review-comment-bubble p { flex: 1; min-width: 0; margin: 0 0 14px; line-height: 1.6; overflow-wrap: anywhere; white-space: pre-wrap; }
.review-comment-bubble .ant-btn { display: block; margin-left: auto; }
</style>
