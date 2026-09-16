<template>
<div>
<transition name="ai-chat-rise">
      <section v-if="isAiOpen" class="ai-chat-panel" :style="aiPanelStyle" role="dialog" aria-modal="true" aria-label="AI 项目助手">
        <header class="ai-chat-header" @mousedown="startAiDrag">
          <img src="/assets/ai-agent.png" alt="" class="ai-chat-avatar" />
          <div class="ai-chat-title">
            <strong>AI 项目助手</strong>
            <span><i></i>在线 · 通常秒回</span>
          </div>
          <div class="ai-chat-actions">
            <button type="button" aria-label="最小化" @click="closeAiChat"><a-icon type="minus" /></button>
          </div>
        </header>

        <div ref="aiMessages" class="ai-messages" aria-live="polite">
          <template v-for="message in aiMessages">
            <div :key="`message-${message.id}`" class="ai-message-row" :class="`is-${message.role}`">
              <img v-if="message.role === 'assistant'" src="/assets/ai-agent.png" alt="" class="ai-message-avatar" />
              <div class="ai-message-bubble">
                {{ message.content }}
                <span v-if="message.source" class="ai-source-chip"><a-icon type="book" />依据：{{ message.source }}</span>
              </div>
            </div>
            <div v-if="message.id === 1" :key="`prompts-${message.id}`" class="ai-quick-prompts" aria-label="快捷问题">
              <button v-for="prompt in aiQuickPrompts" :key="prompt" type="button" @click="chooseAiPrompt(prompt)">
                <a-icon type="robot" />{{ prompt }}
              </button>
            </div>
          </template>
        </div>

        <footer class="ai-composer">
          <div class="ai-input-shell">
            <button type="button" class="ai-attach-button" aria-label="添加附件"><a-icon type="paper-clip" /></button>
            <input v-model="aiDraft" type="text" placeholder="输入你的问题" aria-label="输入问题" @keyup.enter="sendAiMessage" />
            <button type="button" class="ai-send-button" aria-label="发送" @click="sendAiMessage"><a-icon type="arrow-up" /></button>
          </div>
          <small>AI 内容仅供参考，请以平台制度为准</small>
        </footer>
      </section>
    </transition>
</div>
</template>

<script>

export default {
  name: 'AiAssistant',
  data () { return {
    isAiOpen: false,
    aiPanelPosition: null,
    aiDragOffset: null,
    aiDraft: '',
    aiQuickPrompts: [
        '如何注册成为伙伴机构？',
        '项目申请需要哪些材料？',
        '帮我检查财务报销规则'
      ],
    aiMessages: [
        { id: 1, role: 'assistant', content: '你好，我是你的项目助手。可以帮你查询制度、梳理申请流程，也能定位项目执行问题。' },
        { id: 2, role: 'user', content: '项目申请的流程是什么？' },
        { id: 3, role: 'assistant', content: '通常分为 4 步：选择项目、提交申请、机构审核、签约执行。要我根据你当前的项目生成材料清单吗？', source: '伙伴项目管理制度' }
      ]
  } },
  computed: {
    aiPanelStyle () {
      if (!this.aiPanelPosition) return null
      return {
        left: `${this.aiPanelPosition.left}px`,
        top: `${this.aiPanelPosition.top}px`,
        right: 'auto'
      }
    }
  },
  methods: {
    openAiChat () { this.isAiOpen = true },
    closeAiChat () { this.isAiOpen = false },
    startAiDrag (event) {
      if (event.button !== 0 || event.target.closest('button')) return
      const panel = event.currentTarget.parentElement
      const rect = panel.getBoundingClientRect()
      this.aiPanelPosition = { left: rect.left, top: rect.top }
      this.aiDragOffset = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      window.addEventListener('mousemove', this.dragAiPanel)
      window.addEventListener('mouseup', this.stopAiDrag)
      event.preventDefault()
    },
    dragAiPanel (event) {
      if (!this.aiDragOffset) return
      const panel = this.$el.querySelector('.ai-chat-panel')
      if (!panel) return
      const maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8)
      const maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8)
      this.aiPanelPosition = {
        left: Math.min(Math.max(8, event.clientX - this.aiDragOffset.x), maxLeft),
        top: Math.min(Math.max(8, event.clientY - this.aiDragOffset.y), maxTop)
      }
    },
    stopAiDrag () {
      this.aiDragOffset = null
      window.removeEventListener('mousemove', this.dragAiPanel)
      window.removeEventListener('mouseup', this.stopAiDrag)
    },
    chooseAiPrompt (prompt) { this.aiDraft = prompt },
    sendAiMessage () {
      const content = this.aiDraft.trim()
      if (!content) return
      this.aiMessages.push({ id: Date.now(), role: 'user', content })
      this.aiDraft = ''
      this.$nextTick(() => {
        const messages = this.$refs.aiMessages
        if (messages) messages.scrollTop = messages.scrollHeight
      })
    }
  },
  beforeDestroy () { this.stopAiDrag() },
}
</script>
