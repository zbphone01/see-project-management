<template>
  <section class="project-detail-page fundraising-detail-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="privacy-reminder" role="note">
      <div class="privacy-reminder-head"><span class="privacy-icon"><a-icon :type="isAudit ? 'info-circle' : 'warning'" theme="filled" /></span><div><strong>{{ isAudit ? '请注意' : '请注意保护信息安全' }}</strong><span>{{ isAudit ? '完成审核表示您代表SEE进行了募捐申请书的审核，对审核结果负责' : '当前页面内容可能包含不适合公开的隐私资料' }}</span></div><a-icon class="privacy-watermark" type="exclamation-circle" /></div>
      <div class="privacy-reminder-body"><div class="privacy-reminder-copy"><p class="application-notice-text">{{ application.noticeText }}</p></div></div>
    </section>

    <section class="panel detail-section application-document">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="file-text" /></span><div><h2>{{ application.organization }}</h2><div class="detail-basic-meta"><span class="application-version">{{ application.version }}</span><span class="application-agreement"><a-icon type="file-protect" /> {{ application.agreementCode || '暂无框架协议编号' }}</span><span class="project-recruitment"><a-icon type="notification" /> {{ application.recruitment }}</span></div><p v-if="isAudit">点击字段内容、信息小标题或表格行可添加审核意见</p></div></div>
      <div class="description-grid">
        <div v-for="field in application.basicFields" :key="field.key" class="description-item" :class="[fieldClass(field.key), { 'wide project-name-item': field.key === 'name' }]" v-bind="reviewAttributes()" @click="openReview(field.key)" @keydown.enter.prevent="openReview(field.key)" @keydown.space.prevent="openReview(field.key)"><span>{{ field.label }}</span><strong>{{ field.value || '暂无' }}</strong></div>
      </div>
      <article class="rich-content application-content">

        <section v-for="section in application.content" :key="section.key" class="rich-text-section">
          <h3><button v-if="isAudit && section.type === 'text'" type="button" class="review-label-trigger" @click="openReview(section.key)">{{ section.title }}</button><template v-else>{{ section.title }}</template></h3>
          <div v-if="section.type === 'text'" class="rich-text-field" :class="fieldClass(section.key)"><p v-for="(paragraph, index) in section.paragraphs" :key="index">{{ paragraph }}</p><p v-for="link in section.links || []" :key="link.url"><a :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.label }}：{{ link.url }}</a></p></div>
          <template v-else-if="section.type === 'annualFunds'">
            <div v-for="year in application.annualFunds" :key="year.year"><h4>{{ year.year }}</h4><div class="detail-table-wrap"><table class="detail-table annual-funds-table"><colgroup><col /><col style="width: 180px" /><col style="width: 240px" /></colgroup><thead><tr><th>资金来源描述</th><th>资金量（万元）</th><th>机构年度总收入占比（%）</th></tr></thead><tbody><tr v-for="row in year.rows" :key="row.id" :class="rowClass('annualFunds', row)" v-bind="reviewAttributes(row)" @click="openRowReview('annualFunds', row)" @keydown.enter.prevent="openRowReview('annualFunds', row)" @keydown.space.prevent="openRowReview('annualFunds', row)"><td>{{ row.source }}</td><td>{{ row.amount }}</td><td>{{ row.ratio }}</td></tr></tbody></table></div></div>
          </template>
          <div v-else-if="section.type === 'amounts'" class="description-grid application-amounts"><div v-for="field in application.amountFields" :key="field.key" class="description-item" :class="fieldClass(field.key)" v-bind="reviewAttributes()" @click="openReview(field.key)" @keydown.enter.prevent="openReview(field.key)" @keydown.space.prevent="openReview(field.key)"><span>{{ field.label }}</span><strong>{{ field.value }}</strong></div></div>
          <div v-else-if="section.type === 'fundDirections'" class="detail-table-wrap"><table class="detail-table fund-directions-table"><colgroup><col style="width: 220px" /><col style="width: 150px" /><col /></colgroup><thead><tr><th>资金使用方向</th><th>资金分配比例</th><th>详细说明（具体支出）</th></tr></thead><tbody><tr v-for="row in application.fundDirections" :key="row.id" :class="rowClass('fundDirections', row)" v-bind="reviewAttributes(row)" @click="openRowReview('fundDirections', row)" @keydown.enter.prevent="openRowReview('fundDirections', row)" @keydown.space.prevent="openRowReview('fundDirections', row)"><td>{{ row.direction }}</td><td>{{ row.ratio }}</td><td class="multiline">{{ row.description }}</td></tr></tbody></table></div>
        </section>
      </article>
    </section>

    <section id="detail-images" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="picture" /></span><div><h2><button v-if="isAudit" type="button" class="review-label-trigger" @click="openReview('images')">筹款图片</button><template v-else>筹款图片</template></h2><p v-if="isAudit">点击标题可添加审核意见，点击图片可查看大图</p></div></div>
      <div class="fundraising-images fundraising-image-module" :class="fieldClass('images')"><button v-for="item in application.images" :key="item.id" type="button" class="fundraising-image-button" :aria-label="'查看筹款图片大图：' + item.alt" @click="previewImage = item"><img class="organization-avatar" :src="item.src" :alt="item.alt" /></button><strong v-if="!application.images.length">暂无</strong></div>
    </section>
    <section id="detail-attachments" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2><p>{{ isAudit ? '点击附件行可添加审核意见' : '项目相关附件，如有需要请下载留存' }}</p></div></div>
      <div class="attachment-list"><div v-for="file in application.attachments" :key="file.id" :class="rowClass('attachments', file)" v-bind="reviewAttributes(file)" @click="openRowReview('attachments', file)" @keydown.enter.prevent="openRowReview('attachments', file)" @keydown.space.prevent="openRowReview('attachments', file)"><div><strong>{{ file.name }}</strong><span>{{ file.type }} · {{ file.uploadedAt }}</span></div><a-button type="link" @click.stop="previewAttachment(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadAttachment(file)" @keydown.stop>下载</a-button></div><p v-if="!application.attachments.length">暂无附件</p></div>
    </section>

    <section id="detail-history" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <a-timeline class="audit-timeline"><a-timeline-item v-for="record in application.auditHistory" :key="record.id" :color="record.result === '通过' ? '#70B603' : '#FF4D4F'"><div class="audit-entry"><strong>审核结果：{{ record.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ formatAuditTime(record.time) }} · {{ record.account }}</span></div><div v-if="record.remark" class="audit-result-details"><p><b>审核备注：</b>{{ record.remark }}</p></div></div></a-timeline-item></a-timeline>
      <p v-if="!application.auditHistory.length" class="application-history-empty">暂无审核信息</p>
    </section>

    <section v-if="isAudit" id="detail-audit" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>审核</h2></div></div>
      <div class="project-audit-form">
        <div class="audit-form-grid">
          <div class="audit-form-column">
            <div class="audit-form-row"><label for="application-audit-result"><em>*</em> 审核结果：</label><a-select id="application-audit-result" v-model="auditForm.result"><a-select-option value="approved">通过</a-select-option><a-select-option value="rejected">驳回</a-select-option></a-select></div>
            <div class="audit-form-row"><label for="application-agreement"><em v-if="auditForm.result === 'approved'">*</em> 框架协议编号：</label><a-input id="application-agreement" v-model="auditForm.agreementCode" placeholder="请输入框架协议编号" /></div>
            <div class="audit-upload-field"><div class="audit-upload-heading"><label><em>*</em> 上传评审附件：</label><a-upload :before-upload="selectReviewAttachment" :show-upload-list="false"><a-button><a-icon type="upload" />点击上传</a-button></a-upload></div><div v-if="auditForm.reviewAttachment" class="audit-upload-item"><a-icon type="paper-clip" /><span>{{ auditForm.reviewAttachment }}</span><button type="button" aria-label="移除评审附件" @click="auditForm.reviewAttachment = ''"><a-icon type="delete" /></button></div></div>
            <div class="audit-upload-field"><div class="audit-upload-heading"><label><em v-if="auditForm.result === 'approved'">*</em> 上传框架协议扫描件：</label><a-upload accept=".pdf,.jpg,.jpeg,.png" :before-upload="selectAgreementScan" :show-upload-list="false"><a-button><a-icon type="upload" />点击上传</a-button></a-upload></div><div v-if="auditForm.agreementScan" class="audit-upload-item"><a-icon type="paper-clip" /><span>{{ auditForm.agreementScan }}</span><button type="button" aria-label="移除框架协议扫描件" @click="auditForm.agreementScan = ''"><a-icon type="delete" /></button></div></div>
          </div>
          <div class="audit-form-column"><div class="audit-form-row"><label for="application-audit-remark"><em>*</em> 审核备注信息：</label><a-textarea id="application-audit-remark" v-model="auditForm.remark" :rows="5" placeholder="请输入审核备注信息" /></div><div class="audit-funding-hint"><div class="audit-hint-title">提示信息</div><div><span>招募筹款目标</span><strong>{{ application.auditHints.recruitmentTarget }}</strong></div><div><span>审核通过后本招募筹款目标差</span><strong>{{ application.auditHints.targetDifference }}</strong></div></div></div>
        </div>
        <div class="audit-form-actions"><a-button @click="goBack">取消</a-button><a-button type="primary" @click="confirmAudit">确认</a-button></div>
      </div>
    </section>

    <a-modal v-model="reviewVisible" title="编辑审核意见" :width="560" :mask-closable="false" @ok="saveReview">
      <a-textarea v-model="reviewText" aria-label="审核意见" :rows="5" placeholder="请输入审核意见" />
      <template slot="footer"><div class="review-dialog-actions"><a-button v-if="comment(reviewKey)" type="danger" @click="deleteReview">删除</a-button><div class="review-dialog-actions-right"><a-button v-if="!comment(reviewKey)" @click="reviewVisible = false">取消</a-button><a-button type="primary" @click="saveReview">{{ comment(reviewKey) ? '修改' : '确认' }}</a-button></div></div></template>
    </a-modal>
    <a-modal :visible="!!previewImage" title="筹款图片" :width="900" :mask-closable="false" :footer="null" @cancel="previewImage = null"><img v-if="previewImage" class="fundraising-image-preview" :src="previewImage.src" :alt="previewImage.alt" /></a-modal>
    <a-modal :visible="!!previewFile" title="附件预览" :width="550" :mask-closable="false" :footer="null" @cancel="previewFile = null"><template v-if="previewFile"><p>{{ previewFile.name }}</p><p>附件类型：{{ previewFile.type }}</p><p>上传时间：{{ previewFile.uploadedAt }}</p><p>当前 JSON 未提供附件正文或文件地址，仅展示文件信息。</p></template></a-modal>
  </section>
</template>

<script>
import example from '../mock/fundraising-application-detail.json'
const storageKey = 'see-fundraising-application-example-v1'
const clone = value => JSON.parse(JSON.stringify(value))
const rowFields = { annualFunds: ['source', 'amount', 'ratio'], fundDirections: ['direction', 'ratio', 'description'], attachments: ['name', 'type', 'uploadedAt'] }
export default {
  name: 'FundraisingApplicationDetail',
  props: { mode: { type: String, default: 'view' } },
  data () {
    return { application: clone(example), auditForm: { result: 'approved', agreementCode: example.agreementCode, reviewAttachment: '', agreementScan: '', remark: '' }, reviewVisible: false, reviewKey: '', reviewLabel: '', reviewText: '', relatedComments: '', previewFile: null, previewImage: null }
  },
  computed: { isAudit () { return this.mode === 'audit' } },
  created () {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null')
      if (saved && saved.application && saved.application.id === example.id) {
        const comments = saved.application.reviewComments
        this.application.reviewComments = Object.assign({}, example.reviewComments, comments && typeof comments === 'object' && !Array.isArray(comments) ? comments : {})
        if (Array.isArray(saved.application.auditHistory)) this.application.auditHistory = saved.application.auditHistory
        if (typeof saved.application.status === 'string') this.application.status = saved.application.status
        if (typeof saved.application.agreementCode === 'string') this.application.agreementCode = saved.application.agreementCode
        if (saved.auditForm) this.auditForm = Object.assign({}, this.auditForm, saved.auditForm)
      }
    } catch (error) { this.$message.warning('本地示例记录无法读取，已使用默认 JSON') }
  },
  methods: {
    goBack () { this.$router.push({ name: 'framework-agreements', query: { tab: this.$route.query.from === 'fundraising' ? 'fundraising' : 'agreements' } }) },
    formatAuditTime (value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value) ? value + ':00' : value },
    comment (key) { const value = this.application.reviewComments[key]; return typeof value === 'string' ? value.trim() : '' },
    fieldClass (key) { return this.isAudit ? { 'review-has-comment': !!this.comment(key) } : {} },
    reviewAttributes (row) { return this.isAudit && (!row || (row.id && row.editable !== false)) ? { role: 'button', tabindex: 0 } : {} },
    rowComment (section, row) {
      const prefix = section + '.' + row.id
      const known = (rowFields[section] || []).map(field => prefix + '.' + field)
      const extra = Object.keys(this.application.reviewComments).filter(key => key.indexOf(prefix + '.') === 0 && known.indexOf(key) < 0).sort()
      return [prefix].concat(known, extra).map(key => this.comment(key)).filter(Boolean).join('\n')
    },
    rowClass (section, row) { return this.isAudit && row.editable !== false ? { 'review-row-has-comment': !!this.rowComment(section, row), 'review-row-trigger': true } : {} },
    openRowReview (section, row) {
      if (!this.isAudit || !row.id || row.editable === false) return
      this.openReview(section + '.' + row.id, row.source || row.direction || row.name)
      const prefix = section + '.' + row.id
      const known = (rowFields[section] || []).map(field => prefix + '.' + field)
      const extra = Object.keys(this.application.reviewComments).filter(key => key.indexOf(prefix + '.') === 0 && known.indexOf(key) < 0).sort()
      this.relatedComments = known.concat(extra).map(key => this.comment(key)).filter(Boolean).join('\n')
    },
    openReview (key, label) {
      if (!this.isAudit) return
      const field = this.application.basicFields.concat(this.application.amountFields, this.application.content).find(item => item.key === key)
      this.reviewKey = key; this.reviewLabel = label || (field && (field.label || field.title)) || '筹款图片'; this.reviewText = this.comment(key); this.relatedComments = ''; this.reviewVisible = true
    },
    persist () {
      try { window.localStorage.setItem(storageKey, JSON.stringify({ application: this.application, auditForm: this.auditForm })); return true } catch (error) { this.$message.error('本地保存失败，请检查浏览器存储空间或权限'); return false }
    },
    saveReview () {
      if (!this.isAudit) return
      const previous = Object.assign({}, this.application.reviewComments)
      const text = this.reviewText.trim()
      if (text) this.$set(this.application.reviewComments, this.reviewKey, text)
      else this.$delete(this.application.reviewComments, this.reviewKey)
      if (!this.persist()) { this.application.reviewComments = previous; return }
      this.reviewVisible = false; this.$message.success('审核意见已保存到本地示例')
    },
    deleteReview () { this.reviewText = ''; this.saveReview() },
    selectReviewAttachment (file) { this.auditForm.reviewAttachment = file.name; return false },
    selectAgreementScan (file) { this.auditForm.agreementScan = file.name; return false },
    previewAttachment (file) { this.previewFile = file },
    downloadAttachment () { this.$message.info('示例附件未提供真实文件，暂无法下载') },
    confirmAudit () {
      if (!this.isAudit) return
      if (!['approved', 'rejected'].includes(this.auditForm.result)) return this.$message.warning('请选择审核结果')
      if (!this.auditForm.remark.trim()) return this.$message.warning('请输入审核备注信息')
      if (!this.auditForm.reviewAttachment) return this.$message.warning('请选择评审附件')
      if (this.auditForm.result === 'approved' && !this.auditForm.agreementCode.trim()) return this.$message.warning('请输入框架协议编号')
      if (this.auditForm.result === 'approved' && !this.auditForm.agreementScan) return this.$message.warning('请选择框架协议扫描件')
      const previous = clone(this.application)
      const date = new Date(); const pad = value => String(value).padStart(2, '0')
      const time = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      this.application.status = this.auditForm.result === 'approved' ? '待生效' : '募捐申请驳回'
      if (this.auditForm.result === 'approved') this.application.agreementCode = this.auditForm.agreementCode.trim()
      this.application.auditHistory.unshift({ id: 'local-audit-' + Date.now(), time, result: this.auditForm.result === 'approved' ? '通过' : '驳回', account: '本地演示账号', remark: this.auditForm.remark.trim() })
      if (!this.persist()) { this.application = previous; return }
      this.$message.success('审核结果已保存到本地示例，未提交服务器')
      this.$router.replace({ name: 'fundraising-application-detail', params: { id: 'example' }, query: { from: this.$route.query.from || 'fundraising' } })
    }
  }
}
</script>

<style scoped>
.review-dialog-actions { display: flex; justify-content: space-between; align-items: center; }
.review-dialog-actions-right { margin-left: auto; display: flex; gap: 8px; }
.application-version, .application-agreement { flex: none; padding: 2px 7px; border-radius: 3px; font-weight: 400; }
.application-version { color: #c41d7f; background: #fff0f6; }
.application-agreement { color: #873800; background: #fff4e8; }
.organization-avatar { display: block; width: 80px; height: 80px; object-fit: cover; border-radius: 13px; }
.fundraising-images { display: flex; flex-wrap: wrap; gap: 12px; }
.fundraising-image-module { padding: 22px; }
.fundraising-image-button { padding: 0; border: 0; border-radius: 13px; background: transparent; cursor: zoom-in; }
.fundraising-image-button:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.fundraising-image-preview { display: block; max-width: 100%; max-height: 70vh; width: auto; height: auto; margin: 0 auto; object-fit: contain; }
.fund-directions-table th:nth-child(2), .fund-directions-table td:nth-child(2) { text-align: center; }
.annual-funds-table th:nth-child(2), .annual-funds-table td:nth-child(2) { text-align: right; }
.annual-funds-table th:last-child, .annual-funds-table td:last-child { text-align: center; }
.application-notice-text { white-space: pre-line; overflow-wrap: anywhere; }
.application-content { padding-top: 12px; }
.application-content .detail-table-wrap { margin: 16px 0 0; }
.application-content h3 { font-size: 16px; }
.application-content p, .detail-table td { overflow-wrap: anywhere; }
.application-amounts { padding: 0; }
.review-label-trigger { padding: 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.description-item[role=button], .review-row-trigger { cursor: pointer; }
.description-item[role=button]:hover, .review-row-trigger:hover > td { background: #f8fbff; }
.review-has-comment { background: #fff1f0 !important; }
.detail-table tr.review-row-has-comment > td { background: #fff1f0; }
.detail-table tr.review-row-has-comment:hover > td { background: #ffe7e5; }
.review-label-trigger:focus-visible, .description-item[role=button]:focus-visible, .review-row-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.review-label-trigger:hover { color: #cf1322; }
.multiline { white-space: pre-wrap; }
.rich-image figcaption { padding: 8px 12px; color: #718095; }
.attachment-list > .review-row-has-comment { background: #fff1f0; }
.attachment-list > .review-row-has-comment:hover { background: #ffe7e5; }
.application-history-empty { margin: 22px; color: #718095; }

.detail-table .ant-btn-link { padding: 0 4px; height: 32px; }
.audit-upload-item { border-radius: 6px; }
.audit-upload-field + .audit-upload-field { margin-top: 28px; }
</style>
