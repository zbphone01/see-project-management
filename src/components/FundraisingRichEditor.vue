<template>
  <div class="rich-editor">
    <div class="rich-toolbar">
      <button v-for="action in actions" :key="action.command" type="button" :disabled="reading" :title="action.label" :aria-label="label + '：' + action.label" @mousedown.prevent @click="command(action.command)">{{ action.text }}</button>
      <button type="button" :disabled="reading" title="插入图片" :aria-label="label + '：插入图片'" @mousedown.prevent @click="chooseImage">图片</button>
    </div>
    <input ref="imageInput" class="rich-image-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp" :aria-label="label + '：选择图片'" @change="insertImage" />
    <div ref="editor" class="rich-editable" :class="{ 'is-empty': empty }" :contenteditable="reading ? 'false' : 'true'" role="textbox" :aria-label="label" :data-placeholder="placeholder || '请填写' + label" :aria-busy="reading ? 'true' : 'false'" aria-multiline="true" @input="update" @compositionstart="composing = true" @compositionend="composing = false; update()" @keyup="rememberSelection" @mouseup="rememberSelection" @blur="rememberSelection" @paste="paste" @drop.prevent></div>
  </div>
</template>

<script>
import { cleanFundraisingRichText } from '../utils/fundraising-rich-text'
export default {
  name: 'FundraisingRichEditor',
  props: { value: { type: String, default: '' }, label: { type: String, required: true }, placeholder: { type: String, default: '' } },
  data () { return { empty: true, composing: false, reading: false, savedRange: null, actions: [{ command: 'bold', text: 'B', label: '加粗' }, { command: 'italic', text: 'I', label: '斜体' }, { command: 'underline', text: 'U', label: '下划线' }, { command: 'insertUnorderedList', text: '• 列表', label: '无序列表' }, { command: 'insertOrderedList', text: '1. 列表', label: '有序列表' }, { command: 'removeFormat', text: '清除格式', label: '清除格式' }] } },
  mounted () { this.syncValue(this.value) },
  watch: { value (value) { this.syncValue(value) } },
  methods: {
    syncValue (value) {
      const editor = this.$refs.editor
      if (!editor || this.composing) return
      const html = cleanFundraisingRichText(value)
      if (cleanFundraisingRichText(editor.innerHTML) !== html) { editor.innerHTML = html; this.savedRange = null }
      this.empty = !editor.textContent.trim() && !editor.querySelector('table,img')
    },
    update () { if (this.composing) return; const editor = this.$refs.editor; this.empty = !editor.textContent.trim() && !editor.querySelector('table,img'); this.$emit('input', this.empty ? '' : cleanFundraisingRichText(editor.innerHTML)); this.rememberSelection() },
    rememberSelection () { const selection = window.getSelection(); if (selection.rangeCount && this.$refs.editor.contains(selection.getRangeAt(0).commonAncestorContainer)) this.savedRange = selection.getRangeAt(0).cloneRange() },
    restoreSelection () {
      const editor = this.$refs.editor, selection = window.getSelection()
      editor.focus()
      const range = this.savedRange && editor.contains(this.savedRange.commonAncestorContainer) ? this.savedRange : document.createRange()
      if (range !== this.savedRange) { range.selectNodeContents(editor); range.collapse(false) }
      selection.removeAllRanges(); selection.addRange(range)
    },
    command (command) { this.restoreSelection(); document.execCommand(command, false, null); this.update() },
    paste (event) {
      event.preventDefault()
      const clipboard = event.clipboardData
      if (!clipboard) return
      const images = Array.from(clipboard.items || []).filter(item => item.kind === 'file' && /^image\//i.test(item.type)).map(item => item.getAsFile()).filter(Boolean)
      if (images.length) { this.insertImages(images); return }
      document.execCommand('insertText', false, clipboard.getData('text/plain')); this.update()
    },
    chooseImage () { this.rememberSelection(); this.$refs.imageInput.click() },
    insertImage (event) { const file = event.target.files[0]; event.target.value = ''; if (file) this.insertImages([file]) },
    async insertImages (files) {
      if (this.reading) return
      this.rememberSelection()
      const editor = this.$refs.editor, fragments = []
      this.reading = true; this.$emit('busy', true)
      try {
        for (const file of files) {
          if (!/^image\/(png|jpeg|gif|webp)$/i.test(file.type) || file.size > 1024 * 1024) { this.$message.error('请选择 1 MB 以内的 PNG、JPG、GIF 或 WebP 图片'); continue }
          try {
            const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.onabort = reject; reader.readAsDataURL(file) })
            fragments.push(`<img src="${data}" alt="${(file.name || '粘贴图片').replace(/["<>]/g, '')}"><p><br></p>`)
          } catch (error) { this.$message.error('图片读取失败，请重试') }
        }
        this.reading = false
        await this.$nextTick()
        if (!fragments.length || this.$refs.editor !== editor) return
        this.restoreSelection()
        document.execCommand('insertHTML', false, fragments.join('')); this.update()
      } finally { this.reading = false; this.$emit('busy', false) }
    }
  }
}
</script>

<style scoped>
.rich-editor { border: 1px solid #d9e1eb; border-radius: 6px; overflow: hidden; }
.rich-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px 12px; background: #fafbfd; border-bottom: 1px solid #e6ebf2; }
.rich-toolbar button { border: none; border-radius: 4px; padding: 3px 9px; background: transparent; color: #536277; cursor: pointer; }
.rich-toolbar button:hover, .rich-toolbar button:focus-visible { color: #1677ff; background: #eaf3ff; }
.rich-toolbar button:first-child { font-weight: 800; }
.rich-toolbar button:nth-child(2) { font-style: italic; }
.rich-toolbar button:nth-child(3) { text-decoration: underline; }
.rich-image-input { display: none; }
.rich-editable { position: relative; min-height: 138px; padding: 12px; color: #27384e; font-size: 16px; line-height: 1.6; outline: none; overflow-wrap: anywhere; }
.rich-editable.is-empty::before { display: block; content: attr(data-placeholder); color: #5b8ff9; font-size: 14px; white-space: pre-wrap; pointer-events: none; }
.rich-editable:focus { box-shadow: inset 0 0 0 1px #1677ff; }
.rich-editable >>> p:last-child { margin-bottom: 0; }
.rich-editable >>> img { display: block; max-width: min(400px, 100%); max-height: 400px; width: auto; height: auto; margin: 10px 0; border-radius: 6px; object-fit: contain; }
.rich-editable >>> table { width: 100%; margin: 10px 0; border-collapse: collapse; table-layout: fixed; }
.rich-editable >>> td, .rich-editable >>> th { padding: 6px 8px; border: 1px solid #d9e1eb; }
.rich-toolbar button:disabled { cursor: wait; opacity: .5; }
</style>
