<template>
  <section v-if="application" class="project-detail-page plan-detail-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <a-alert v-if="mode === 'audit' && !isAudit" type="info" show-icon message="该申请当前不处于待审状态，已切换为只读查看。" />

    <section id="plan-basic" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="file-text" /></span><div><h2>筹款规划申请 - {{ application.planName }}</h2><div class="detail-basic-meta"><span class="plan-department"><a-icon type="cluster" /> {{ application.department }}</span></div><p v-if="isAudit">点击字段内容可添加审核意见</p></div></div>
      <div class="description-grid">
        <div v-for="field in basicFields" :key="field.key" class="description-item" :class="[fieldClass(field.key), { wide: field.wide, 'project-name-item': field.key === 'name' }]" v-bind="reviewAttributes()" @click="openReview(field.key)" @keydown="reviewKeydown($event, field.key)"><span>{{ field.label }}</span><strong>{{ field.value || '暂无' }}</strong></div>
      </div>
      <article class="rich-content">
        <p v-if="isAudit && hasComments(application.content.map(item => item.key))" class="plan-review-hint">请检查并修改标红的项目信息，点击信息小标题可添加具体审核意见</p>
        <section v-for="section in orderedContent" :key="section.key" class="rich-text-section">
          <h3><button v-if="isAudit" type="button" class="review-label-trigger" @click="openReview(section.key)">{{ section.title }}</button><template v-else>{{ section.title }}</template></h3>
          <div class="rich-text-field" :class="fieldClass(section.key)"><div v-if="section.html" class="plan-saved-rich" v-html="safeHtml(section.html)"></div><template v-else><p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p><p v-if="!section.paragraphs.length">暂无</p></template></div>
        </section>
      </article>
    </section>

    <section id="plan-outputs" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>项目产出</h2><p v-if="isAudit && hasRowComments(['outputs', 'activities'])">请检查并修改标红的项目信息，点击行任意位置可添加具体审核意见</p></div></div>
      <div v-for="(output, outputIndex) in application.outputs" :key="output.id" class="output-block plan-output-block">
        <div class="plan-output-summary">
          <div class="output-title" :class="rowClass('outputs', output)" v-bind="reviewAttributes(output)" @click="openRowReview('outputs', output)" @keydown="rowKeydown($event, 'outputs', output)"><span>产出 {{ outputIndex + 1 }}</span><strong>{{ output.name }}</strong></div>
          <div class="output-standard"><span>产出衡量标准</span><div>{{ output.standard || '暂无' }}</div></div>
        </div>
        <div class="detail-table-wrap plan-activities-table"><table class="detail-table"><colgroup><col style="width: 70px" /><col /><col style="width: 210px" /><col style="width: 210px" /></colgroup><thead><tr><th>序号</th><th>活动描述</th><th>活动时间</th><th>活动地点</th></tr></thead><tbody><tr v-for="(activity, index) in output.activities" :key="activity.id" :class="rowClass('activities', activity)" v-bind="reviewAttributes(activity)" @click="openRowReview('activities', activity)" @keydown="rowKeydown($event, 'activities', activity)"><td>{{ outputIndex + 1 }}.{{ index + 1 }}</td><td>{{ activity.description }}</td><td>{{ activity.time }}</td><td>{{ activity.location }}</td></tr><tr v-if="!output.activities.length"><td colspan="4">暂无活动</td></tr></tbody></table></div>
      </div>
      <p v-if="!application.outputs.length" class="plan-empty">暂无项目产出</p>
    </section>

    <section id="plan-budget" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>项目预算</h2></div></div>
      <budget-prototype :project-name="application.name" :budget="application.budget" />
    </section>

    <section id="plan-other" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="profile" /></span><div><h2>其他信息</h2><p v-if="isAudit && hasComments(application.otherContent.map(item => item.key))">请检查并修改标红的项目信息，点击信息小标题可添加具体审核意见</p></div></div>
      <article class="rich-content"><section v-for="section in application.otherContent" :key="section.key" class="rich-text-section"><h3><button v-if="isAudit" type="button" class="review-label-trigger" @click="openReview(section.key)">{{ section.title }}</button><template v-else>{{ section.title }}</template></h3><div class="rich-text-field" :class="fieldClass(section.key)"><div v-if="section.html" class="plan-saved-rich" v-html="safeHtml(section.html)"></div><template v-else><p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p><p v-if="!section.paragraphs.length">暂无</p></template></div></section></article>
    </section>

    <section id="plan-attachments" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2><p v-if="isAudit && hasRowComments(['attachments'])">请检查并修改标红的项目信息，点击行任意位置可添加具体审核意见</p></div></div>
      <div class="attachment-list"><div v-for="file in application.attachments" :key="file.id" :class="rowClass('attachments', file)" v-bind="reviewAttributes(file)" @click="openRowReview('attachments', file)" @keydown="rowKeydown($event, 'attachments', file)"><div><strong>{{ file.name }}</strong><span>{{ file.uploadedAt }}</span></div><a-button type="link" @click.stop="previewAttachment(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadAttachment(file)" @keydown.stop>下载</a-button></div><p v-if="!application.attachments.length" class="plan-empty">暂无附件</p></div>
    </section>

    <section id="plan-history" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <a-timeline v-if="application.auditHistory.length" class="audit-timeline"><a-timeline-item v-for="record in application.auditHistory" :key="record.id" :color="record.result === '通过' ? '#70B603' : '#FF4D4F'"><div class="audit-entry"><strong>审核结果：{{ record.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ record.time }} · {{ record.account }}</span></div><div class="audit-result-details"><p><b>审核备注：</b>{{ record.remark || '暂无' }}</p></div></div></a-timeline-item></a-timeline>
      <p v-else class="plan-empty">暂无审核信息</p>
    </section>

    <section v-if="isAudit" id="detail-audit" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>审核</h2></div></div>
      <form class="project-audit-form" @submit.prevent="confirmAudit">
        <div class="audit-form-grid">
          <div class="audit-form-column">
            <div class="audit-form-row"><label for="plan-audit-result"><em>*</em> 审核结果：</label><a-select id="plan-audit-result" v-model="auditForm.result" @change="saveAuditDraft"><a-select-option value="approved">通过</a-select-option><a-select-option value="rejected">驳回</a-select-option></a-select><p v-if="formErrors.result" class="plan-error" role="alert">{{ formErrors.result }}</p></div>
            <div class="audit-upload-field"><div class="audit-upload-heading"><label><em>*</em> 上传评审附件：</label><a-upload :before-upload="selectReviewAttachment" :show-upload-list="false" :disabled="uploading || submitting"><a-button :loading="uploading" :disabled="submitting" icon="upload">点击上传</a-button></a-upload></div><div v-for="file in auditForm.attachments" :key="file.id" class="audit-upload-item"><a-icon type="paper-clip" /><span>{{ file.name }}</span><button type="button" :aria-label="'预览' + file.name" @click="previewAttachment(file)"><a-icon type="eye" /></button><button type="button" :aria-label="'移除' + file.name" :disabled="uploading || submitting" @click="removeReviewAttachment(file)"><a-icon type="delete" /></button></div><p v-if="formErrors.attachments" class="plan-error" role="alert">{{ formErrors.attachments }}</p></div>
          </div>
          <div class="audit-form-column"><div class="audit-form-row"><label for="plan-audit-remark"><em v-if="auditForm.result === 'rejected'">*</em> 审核备注：</label><a-textarea id="plan-audit-remark" v-model="auditForm.remark" :rows="5" placeholder="驳回时必填" @change="saveAuditDraft" /><p v-if="formErrors.remark" class="plan-error" role="alert">{{ formErrors.remark }}</p></div></div>
        </div>
        <div class="audit-form-actions"><a-button :disabled="submitting" @click="goBack">取消</a-button><a-button type="primary" html-type="submit" :loading="submitting" :disabled="uploading">确认</a-button></div>
      </form>
    </section>

    <a-modal v-if="isAudit" v-model="reviewVisible" title="编辑审核意见" :width="560" :mask-closable="false">
      <a-textarea v-model="reviewText" aria-label="审核意见" :rows="5" placeholder="请输入审核意见" />
      <template slot="footer"><div class="review-dialog-actions"><a-button v-if="comment(reviewKey)" type="danger" @click="saveReview('')">删除</a-button><div class="review-dialog-actions-right"><a-button v-if="!comment(reviewKey)" @click="reviewVisible = false">取消</a-button><a-button type="primary" @click="saveReview(reviewText)">{{ comment(reviewKey) ? '修改' : '确认' }}</a-button></div></div></template>
    </a-modal>
    <a-modal v-model="rowCommentsVisible" title="行审核意见" :width="560" :mask-closable="false" :footer="null"><div v-for="item in rowCommentItems" :key="item.key" class="plan-comment-item"><p>{{ item.text }}</p><a-button v-if="isAudit" type="link" @click="editRowComment(item.key)">编辑</a-button></div><a-button v-if="isAudit" type="primary" @click="editRowComment(rowReviewKey)">编辑整行意见</a-button></a-modal>
    <a-modal :visible="!!previewFile" :title="previewFile ? previewFile.name : '附件预览'" :width="900" :mask-closable="false" :footer="null" @cancel="clearPreview"><template v-if="previewFile"><img v-if="previewType === 'image'" class="plan-preview-image" :src="previewUrl" :alt="previewFile.name" /><iframe v-else-if="previewType === 'pdf'" class="plan-preview-pdf" :src="previewUrl" :title="previewFile.name"></iframe><template v-else-if="previewUrl"><p>此格式请下载后使用对应软件查看。</p><a-button icon="download" @click="downloadAttachment(previewFile)">下载附件</a-button></template><p v-else>该原型示例未提供附件正文，暂无法预览或下载。审核时上传的评审附件可在本机保存、预览及下载。</p></template></a-modal>
  </section>
  <section v-else class="panel plan-not-found"><a-empty description="未找到对应的筹款规划申请"><a-button @click="goBack">返回申请列表</a-button></a-empty></section>
</template>

<script>
import { createPlanApplications } from '../mock/fundraising-plans'
import { cleanFundraisingRichText } from '../utils/fundraising-rich-text'
import BudgetPrototype from '../components/BudgetPrototype.vue'
import { draftFile, uppercaseMoney } from '../mock/project-drafts'
import { clonePlan, createPlanDetail, loadPlanDetail, savePlanDetail, readPlanSnapshot, planReviewComment, planRowComments, validatePlanAudit, finishPlanAudit } from '../mock/fundraising-plan-detail'

const rowFields = { outputs: ['name', 'standard'], activities: ['description', 'time', 'location'], attachments: ['name', 'uploadedAt'] }
const timestamp = () => { const date = new Date(); const pad = value => String(value).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` }

export default {
  name: 'FundraisingPlanDetail',
  components: { BudgetPrototype },
  props: { applicationId: { type: String, required: true }, mode: { type: String, default: 'view' } },
  data () {
    return { application: null, auditForm: { result: 'approved', remark: '', attachments: [] }, formErrors: {}, reviewVisible: false, reviewKey: '', reviewText: '', rowCommentsVisible: false, rowCommentItems: [], rowReviewKey: '', previewFile: null, previewUrl: '', previewType: '', uploading: false, submitting: false, loadToken: 0, previewToken: 0 }
  },
  computed: {
    orderedContent () {
      const content = this.application ? this.application.content.slice() : []
      const overview = content.findIndex(item => item.key === 'overview')
      const background = content.findIndex(item => item.key === 'background')
      if (overview !== -1 && background !== -1 && background < overview) {
        const section = content[overview]
        content[overview] = content[background]
        content[background] = section
      }
      return content
    },
    isAudit () { return this.mode === 'audit' && this.application && this.application.status === '规划待审' },
    basicFields () {
      const app = this.application
      return [{ key: 'name', label: '筹款规划申请名称', value: app.name, wide: true }, { key: 'planningPeriod', label: '规划周期', value: app.planningPeriod }, { key: 'executionPeriod', label: '执行周期', value: app.executionPeriod }, { key: 'plannedAmount', label: '计划资金', value: this.money(app.plannedAmount) + ' 元（' + uppercaseMoney(app.plannedAmount) + '）' }, { key: 'minimumAmount', label: '最低执行额', value: this.money(app.minimumAmount) + ' 元（' + uppercaseMoney(app.minimumAmount) + '）' }, { key: 'team', label: '执行团队', value: app.team, wide: true }, { key: 'fundUsePlan', label: '善款使用预案', value: app.fundUsePlan, wide: true }]
    }
  },
  watch: { applicationId () { this.loadApplication() }, mode () { this.loadApplication() } },
  created () { this.loadApplication() },
  activated () { this.loadApplication() },
  deactivated () { this.loadToken++; this.clearPreview(); this.closeDialogs() },
  beforeDestroy () { this.loadToken++; this.clearPreview() },
  methods: {
    safeHtml: cleanFundraisingRichText,
    money (amount) { return Number(amount || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    loadApplication () {
      this.loadToken++; this.clearPreview(); this.closeDialogs(); this.formErrors = {}; this.uploading = false; this.submitting = false
      const record = createPlanApplications().find(item => item.id === this.applicationId)
      if (!record) { this.application = null; return }
      let saved
      try { saved = loadPlanDetail(record) } catch (error) { saved = createPlanDetail(record); this.$message.warning('本地记录无法读取，已展示原始示例，请检查浏览器存储') }
      this.application = saved.application; this.auditForm = saved.auditForm
    },
    closeDialogs () { this.reviewVisible = false; this.rowCommentsVisible = false },
    goBack () { this.$router.push({ name: 'fundraising-plans', query: { tab: 'applications' } }) },
    comment (key) { return planReviewComment(this.application.reviewComments, key) },
    hasComments (keys) { return keys.some(key => !!this.comment(key)) },
    hasRowComments (sections) { return Object.keys(this.application.reviewComments).some(key => sections.some(section => key.indexOf(section + '.') === 0) && !!this.comment(key)) },
    fieldClass (key) { return this.isAudit ? { 'review-has-comment': !!this.comment(key) } : {} },
    rowClass (section, row) { return this.isAudit && row.id ? { 'review-row-trigger': true, 'review-row-has-comment': !!planRowComments(this.application.reviewComments, section, row.id, rowFields[section]).length } : {} },
    reviewAttributes (row) { return this.isAudit && (!row || row.id) ? { role: 'button', tabindex: 0 } : {} },
    reviewKeydown (event, key) { if (this.isAudit && event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openReview(key) } },
    rowKeydown (event, section, row) { if (this.isAudit && event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openRowReview(section, row) } },
    openReview (key) { if (!this.isAudit) return; this.reviewKey = key; this.reviewText = this.comment(key); this.reviewVisible = true },
    openRowReview (section, row) {
      if (!this.isAudit || !row.id) return
      const key = section + '.' + row.id
      const comments = planRowComments(this.application.reviewComments, section, row.id, rowFields[section])
      if (comments.some(item => item.key !== key)) { this.rowReviewKey = key; this.rowCommentItems = comments; this.rowCommentsVisible = true } else this.openReview(key)
    },
    editRowComment (key) { this.rowCommentsVisible = false; this.openReview(key) },
    persist (application = this.application, auditForm = this.auditForm) {
      try { savePlanDetail(application, auditForm); return true } catch (error) { this.$message.error('本地保存失败，请检查浏览器存储空间或权限'); return false }
    },
    saveReview (value) {
      if (!this.isAudit) return
      const previous = Object.assign({}, this.application.reviewComments)
      const text = value.trim()
      if (text) this.$set(this.application.reviewComments, this.reviewKey, text)
      else this.$delete(this.application.reviewComments, this.reviewKey)
      if (!this.persist()) { this.application.reviewComments = previous; return }
      this.reviewVisible = false; this.$message.success('审核意见已保存到本地示例')
    },
    saveAuditDraft () { if (!this.isAudit) return; this.formErrors = {}; this.persist() },
    selectReviewAttachment (file) { this.storeReviewAttachment(file); return false },
    async storeReviewAttachment (file) {
      if (!this.isAudit || this.uploading || this.submitting) return
      const token = this.loadToken
      const id = 'review-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      const blobKey = 'plan-' + this.applicationId + '-' + id
      this.uploading = true
      try {
        await draftFile('put', blobKey, file)
        if (token !== this.loadToken) { await draftFile('delete', blobKey); return }
        const next = Object.assign({}, this.auditForm, { attachments: this.auditForm.attachments.concat({ id, blobKey, name: file.name, type: file.type, uploadedAt: timestamp() }) })
        if (!this.persist(this.application, next)) { await draftFile('delete', blobKey); return }
        this.auditForm = next; this.formErrors = {}; this.$message.success('评审附件已保存到本机')
      } catch (error) { if (token === this.loadToken) this.$message.error('附件保存失败，请检查浏览器存储空间或权限') } finally { if (token === this.loadToken) this.uploading = false }
    },
    async removeReviewAttachment (file) {
      if (!this.isAudit || this.uploading || this.submitting) return
      const next = Object.assign({}, this.auditForm, { attachments: this.auditForm.attachments.filter(item => item.id !== file.id) })
      if (!this.persist(this.application, next)) return
      this.auditForm = next
      if (this.previewFile && this.previewFile.id === file.id) this.clearPreview()
      try { await draftFile('delete', file.blobKey) } catch (error) { /* Detached local file can be removed with the site's stored data. */ }
    },
    async attachmentBlob (file) {
      if (!file.blobKey) return null
      const blob = await draftFile('get', file.blobKey)
      if (!blob) throw new Error('附件正文不存在')
      return blob
    },
    async previewAttachment (file) {
      this.clearPreview()
      const token = this.previewToken
      try {
        const blob = await this.attachmentBlob(file)
        if (token !== this.previewToken) return
        this.previewFile = file
        if (!blob) return
        this.previewUrl = URL.createObjectURL(blob)
        this.previewType = /^image\/(png|jpeg|gif|webp)$/.test(blob.type) ? 'image' : blob.type === 'application/pdf' ? 'pdf' : 'download'
      } catch (error) { if (token === this.previewToken) this.$message.error('本地附件已不可用，请重新上传') }
    },
    async downloadAttachment (file) {
      const token = this.loadToken
      try {
        const blob = await this.attachmentBlob(file)
        if (token !== this.loadToken) return
        if (!blob) { this.$message.info('该原型示例未提供附件正文，暂无法下载'); return }
        const url = URL.createObjectURL(blob), link = document.createElement('a')
        link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (error) { if (token === this.loadToken) this.$message.error('本地附件已不可用，请重新上传') }
    },
    clearPreview () { this.previewToken++; if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewFile = null; this.previewUrl = ''; this.previewType = '' },
    async confirmAudit () {
      if (!this.isAudit || this.uploading || this.submitting) return
      this.formErrors = validatePlanAudit(this.auditForm)
      if (Object.keys(this.formErrors).length) { this.$message.warning('请补全审核信息'); return }
      const token = this.loadToken
      const audit = clonePlan(this.auditForm)
      this.submitting = true
      try {
        for (const file of audit.attachments) { if (!await this.attachmentBlob(file)) throw new Error('请重新上传评审附件') }
        if (token !== this.loadToken) return
        const latest = readPlanSnapshot(this.applicationId)
        if (latest && latest.application.status !== '规划待审') { this.loadApplication(); this.$message.warning('该申请已完成审核，请查看最新记录'); return }
        const next = finishPlanAudit(this.application, audit, timestamp())
        if (!this.persist(next, { result: 'approved', remark: '', attachments: [] })) return
        this.application = next; this.closeDialogs()
        this.$message.success('审核结果已保存到本地示例，未提交服务器')
        this.$router.replace({ name: 'fundraising-plan-detail', params: { id: this.applicationId }, query: { mode: 'view' } })
      } catch (error) { if (token === this.loadToken) this.$message.error('审核未完成，请确认评审附件可用及本地存储正常') } finally { if (token === this.loadToken) this.submitting = false }
    }
  }
}
</script>

<style scoped>
.plan-detail-page .detail-section-header h2 { overflow-wrap: anywhere; }
.plan-department { padding: 3px 6px; border-radius: 3px; color: #52a61a; background: #f6ffed; white-space: normal; overflow-wrap: anywhere; }
.plan-detail-page .description-item strong, .plan-detail-page td, .plan-detail-page p { overflow-wrap: anywhere; white-space: pre-wrap; }
.rich-content h3 { font-size: 16px; }
.rich-text-field { padding: 8px; }
.rich-text-field p:last-child { margin-bottom: 0; }
.plan-saved-rich { overflow-wrap: anywhere; overflow-x: auto; }
.plan-saved-rich >>> img { display: block; max-width: min(400px, 100%); max-height: 400px; width: auto; height: auto; object-fit: contain; }
.plan-saved-rich >>> table { max-width: 100%; border-collapse: collapse; }
.plan-saved-rich >>> td, .plan-saved-rich >>> th { border: 1px solid #e6ebf2; padding: 8px; }
.review-label-trigger { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.review-label-trigger:hover { color: #cf1322; }
.description-item[role=button], .review-row-trigger { cursor: pointer; }
.description-item[role=button]:hover, .review-row-trigger:hover { background: #f8fbff; }
.review-row-trigger:hover > td { background: #f8fbff; }
.review-has-comment, .review-row-has-comment { background: #fff1f0 !important; }
.detail-table .review-row-has-comment > td { background: #fff1f0; }
.review-row-has-comment:hover, .detail-table .review-row-has-comment:hover > td { background: #ffe7e5 !important; }
.plan-output-summary.review-row-has-comment .output-title { background: transparent; }
.review-label-trigger:focus-visible, [role=button]:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.plan-output-summary .output-title { background: transparent; }
.plan-activities-table { margin: 0; border: 0; border-top: 1px solid #e6ebf2; border-radius: 0; }
.plan-activities-table table { table-layout: fixed; }
.plan-activities-table td:first-child, .plan-activities-table th:first-child { text-align: center; }
.plan-output-block .output-standard > div { min-width: 0; padding: 4px 0; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
.plan-empty { margin: 22px; color: #718095; }
.plan-error { margin: 8px 0 0; color: #ff4d4f; }
.plan-review-hint { color: #718095; }
.review-dialog-actions { display: flex; justify-content: space-between; align-items: center; }
.review-dialog-actions-right { display: flex; gap: 8px; margin-left: auto; }
.review-dialog-actions-right > .ant-btn + .ant-btn { margin-left: 0; }
.plan-comment-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.plan-comment-item p { flex: 1; min-width: 0; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.plan-comment-item .ant-btn { flex: none; }
.plan-preview-image { display: block; width: auto; height: auto; max-width: 100%; max-height: 70vh; margin: auto; }
.plan-preview-pdf { width: 100%; height: 65vh; border: 0; }
.plan-view-action, .plan-view-action:hover, .plan-view-action:focus { color: #70b603; }
.plan-not-found { padding: 50px; }
</style>
