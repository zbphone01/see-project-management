<template>
  <section v-if="detail" class="project-detail-page organization-detail-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="privacy-reminder" role="note">
      <div class="privacy-reminder-head"><span class="privacy-icon"><a-icon type="warning" theme="filled" /></span><div><strong>{{ isAudit ? '请注意' : '请注意保护信息安全' }}</strong><span>{{ isAudit ? '完成审核表示您代表SEE进行了伙伴机构的资质审核，对审核结果负责' : '当前页面内容可能包含不适合公开的隐私资料' }}</span></div><a-icon class="privacy-watermark" type="exclamation-circle" /></div>
      <div class="privacy-reminder-body"><div v-if="isAudit" class="privacy-reminder-copy"><p>这是待审核的伙伴机构申请，请核对注册信息是否一致且正确，如有必要请联系法务确认该伙伴是否有经营风险。</p><p>机构制度要求您审核通过前必须阅读最新的年检年报并确认！</p></div><p v-else>这是2025-12-19审核通过的版本，非最新版本</p></div>
    </section>
    <template v-for="group in groups">
      <section :key="group.key" class="panel detail-section">
        <div class="detail-section-header"><span class="detail-section-icon green"><a-icon :type="group.icon" /></span><div><h2>{{ group.title }}</h2><p v-if="registrationComparison && group.key === 'registration'">橙色内容为有变更的注册信息，原注册信息可切换“现有注册信息”查看</p><p v-if="isAudit && canReviewGroup(group) && groupHasComments(group)" class="review-hint">{{ group.fields.some(field => field[2] === 'rich') ? '请检查标红的机构信息，点击信息小标题可添加或编辑审核意见' : '请检查标红的机构信息，点击字段内容可添加或编辑审核意见' }}</p></div></div>
        <a-tabs v-if="registrationComparison && group.key === 'registration'" v-model="registrationTab" class="shared-list-tabs registration-review-tabs"><a-tab-pane key="updated" tab="更新注册信息" /><a-tab-pane key="current" tab="现有注册信息" /></a-tabs>
        <div v-if="group.fields.some(item => item[2] !== 'rich')" class="description-grid organization-basic-content">
          <div v-for="field in group.fields.filter(item => item[2] !== 'rich')" :key="field[0]" class="description-item" :class="[canReviewGroup(group) ? reviewClass(field[0]) : {}, { wide: field[0] === 'businessScope' || field[2] === 'wide' }]" :role="isAudit && canReviewGroup(group) ? 'button' : undefined" :tabindex="isAudit && canReviewGroup(group) ? 0 : undefined" @click="openFieldReview(group, field[0])" @keydown.enter.prevent="openFieldReview(group, field[0])" @keydown.space.prevent="openFieldReview(group, field[0])">
            <span>{{ field[1] }}</span><img v-if="field[0] === 'avatar'" class="organization-avatar" :src="detail.fields.avatar" alt="机构头像" /><strong v-else-if="field[0] === 'officeAddress'" class="basic-field-multiline">{{ detail.fields.officeAddress }}<br>邮编：{{ detail.fields.postalCode }}</strong><strong v-else :class="{ 'registration-field-changed': registrationFieldChanged(group.key, field[0]) }">{{ fieldValue(field[0], group.key) }}</strong>
          </div>
        </div>
        <div v-if="group.fields.some(item => item[2] === 'rich')" class="detail-module-content"><article class="rich-content">
          <template v-for="(field, index) in group.fields.filter(item => item[2] === 'rich')"><div v-if="index" :key="field[0] + '-separator'" class="project-rich-separator" aria-hidden="true"><span class="project-rich-separator-dot"></span></div><section :key="field[0]" class="project-rich-section">
            <h3 :class="{ 'review-heading': isAudit }"><button v-if="isAudit" type="button" @click="openReview(field[0])">{{ field[1] }}</button><template v-else>{{ field[1] }}</template></h3>
            <div v-if="isRichField(field[0])" class="rich-text-field" :class="reviewClass(field[0])" v-html="richContent(field[0])"></div>
            <div v-else class="rich-text-field" :class="reviewClass(field[0])">{{ detail.fields[field[0]] || '-' }}</div>
            <!-- 前端接入说明：由接口返回的社会评价图片地址、替代文本和说明替换 evaluationImage；不使用演示标识作为真实荣誉材料。 -->
            <figure v-if="field[0] === 'honors' && detail.evaluationImage && detail.evaluationImage.src" class="evaluation-image">
              <img :src="detail.evaluationImage.src" :alt="detail.evaluationImage.alt" />
              <figcaption>{{ detail.evaluationImage.caption }}</figcaption>
            </figure>
          </section></template>
        </article></div>
      </section>
      <template v-if="group.key === 'overview'">
        <section v-for="section in detail.members" :key="section.key" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="team" /></span><div><h2>{{ section.title }}</h2><p v-if="isAudit && section.rows.some(row => rowHasComments(section.key, row.id))" class="review-hint">请检查标红的机构人员信息，点击行任意位置可添加或编辑审核意见</p></div></div>
          <div class="detail-module-content"><div class="detail-table-wrap"><table class="detail-table team-table"><colgroup><col class="project-detail-index-col" /><col style="width: 160px" /><col style="width: 240px" /><col /></colgroup><thead><tr><th>序号</th><th>姓名</th><th>身份证号</th><th>关联公司及对应的统一信用代码</th></tr></thead><tbody>
            <tr v-for="(row, index) in section.rows" :key="row.id" :class="rowClass(section.key, row.id)" :role="isAudit ? 'button' : undefined" :tabindex="isAudit ? 0 : undefined" @click="openReview(section.key + '.' + row.id)" @keydown.enter.prevent="openReview(section.key + '.' + row.id)" @keydown.space.prevent="openReview(section.key + '.' + row.id)"><td>{{ index + 1 }}</td><td>{{ row.name }}</td><td>{{ row.identityNumber }}</td><td>{{ row.relatedCompanies }}</td></tr>
            <tr v-if="!section.rows.length"><td colspan="4">暂无内容</td></tr>
          </tbody></table></div></div>
        </section>
      </template>
    </template>
    <section v-for="section in visibleAttachments" :key="section.key" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>{{ section.title }}</h2></div></div>
      <div class="detail-module-content"><div class="attachment-list">
        <div v-for="file in section.files" :key="file.id">
          <div><strong>{{ file.name }}</strong><span><template v-if="hasYear(section)">{{ file.year }}年 · </template><template v-if="section.key === 'civilReports'">{{ file.civilStatus === '已上报' ? '已上报民政' : file.civilStatus === '未上报' ? '未上报民政' : '-' }} · </template>{{ file.uploadedAt }}</span></div>
          <a-button type="link" @click.stop="previewFile(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadFile(file)" @keydown.stop>下载</a-button>
        </div>
        <p v-if="!section.files.length" class="attachment-empty">暂无内容</p>
      </div></div>
    </section>
    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <div class="detail-module-content"><a-timeline class="audit-timeline">
        <a-timeline-item v-for="entry in detail.history" :key="entry.id" :color="['通过', '通过且更新注册信息'].includes(entry.result) ? '#70B603' : '#FF4D4F'">
          <div class="audit-entry">
            <strong>审核结果：{{ entry.result }}</strong>
            <div class="audit-result-row"><span class="audit-info-chip audit-time">{{ entry.auditedAt || entry.approvedAt || entry.submittedAt }} · {{ entry.reviewer }}</span><button v-if="['通过', '通过且更新注册信息'].includes(entry.result) && entry.registrationSnapshot" type="button" class="audit-resource-link audit-snapshot-resource" @click="openRegistrationSnapshot(entry)">注册信息快照</button></div>
            <div v-if="entry.remark" class="audit-result-details"><p><b>审核备注：</b>{{ entry.remark }}</p></div>
          </div>
        </a-timeline-item>
      </a-timeline>
      <p v-if="!detail.history.length" class="attachment-empty">暂无内容</p></div>
    </section>
    <section v-if="isAudit" id="detail-audit" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>审核</h2></div></div>
      <div class="detail-module-content"><form class="project-audit-form" @submit.prevent="submitAudit">
        <div class="audit-form-grid"><div class="audit-form-column">
          <div class="audit-form-row"><label for="organization-audit-result">审核结果：</label><a-select id="organization-audit-result" v-model="auditForm.result"><a-select-option v-if="registrationComparison" value="approved-update">通过且更新注册信息</a-select-option><a-select-option value="approved">通过</a-select-option><a-select-option value="rejected">驳回</a-select-option></a-select></div>
          <div class="audit-form-row"><div class="report-confirmation-heading"><label for="organization-report-confirmation">您是否已阅读并确认最新的年检年报：</label><a-button type="link" @click="previewLatestReport">预览民政年检年报</a-button></div><a-select id="organization-report-confirmation" v-model="auditForm.confirmed"><a-select-option value="unconfirmed">未确认</a-select-option><a-select-option value="confirmed">已确认</a-select-option></a-select></div>
        </div><div class="audit-form-column"><div class="audit-form-row"><label for="organization-audit-remark">审核备注：</label><a-textarea id="organization-audit-remark" v-model="auditForm.remark" :rows="5" placeholder="驳回时必填" /></div></div></div>
        <div class="audit-form-actions"><a-button @click="goBack">取消</a-button><a-button type="primary" html-type="submit">确认</a-button></div>
      </form></div>
    </section>
    <project-snapshot-window v-if="activeRegistrationSnapshot" title="注册信息快照" @close="activeRegistrationSnapshot = null">
      <div slot="title-meta" class="audit-result-row"><span class="audit-info-chip audit-time">{{ activeRegistrationSnapshot.auditedAt || activeRegistrationSnapshot.approvedAt || activeRegistrationSnapshot.submittedAt }} · {{ activeRegistrationSnapshot.reviewer }}</span></div>
      <section class="panel detail-section">
        <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="bank" /></span><div><h2>机构注册信息</h2></div></div>
        <div class="description-grid organization-basic-content"><div v-for="field in snapshotRegistrationGroup.fields" :key="field[0]" class="description-item" :class="{ wide: field[0] === 'businessScope' || field[2] === 'wide' }"><span>{{ field[1] }}</span><strong>{{ fieldValue(field[0], 'registration', activeRegistrationSnapshot.registrationSnapshot.fields) }}</strong></div></div>
      </section>
    </project-snapshot-window>
    <a-modal v-if="isAudit" v-model="reviewVisible" title="编辑审核意见" :width="560" :mask-closable="false" @cancel="reviewVisible = false">
      <a-select v-if="reviewTargets.length" :value="reviewKey" class="qualification-review-target" aria-label="审核意见对应内容" @change="openReview"><a-select-option v-for="key in reviewTargets" :key="key" :value="key">{{ reviewTargetLabel(key) }}</a-select-option></a-select>
      <div v-if="rowReviewEntries.length" class="row-review-summary"><p v-for="entry in rowReviewEntries" :key="entry.key"><strong>{{ reviewTargetLabel(entry.key) }}</strong><br>{{ entry.comment }}</p></div>
      <a-textarea v-model="reviewDraft" aria-label="审核意见" placeholder="请输入审核意见" :rows="5" />
      <template slot="footer"><div class="review-dialog-actions"><a-button v-if="reviewComment(reviewKey)" type="danger" @click="deleteReview">删除</a-button><div class="review-dialog-primary"><a-button v-if="!reviewComment(reviewKey)" @click="reviewVisible = false">取消</a-button><a-button type="primary" @click="saveReview">{{ reviewComment(reviewKey) ? '修改' : '确认' }}</a-button></div></div></template>
    </a-modal>
    <a-modal :visible="!!preview" title="附件预览" :width="650" :mask-closable="false" :footer="null" @cancel="preview = null"><template v-if="preview"><p>{{ preview.name }}</p><p>此附件为文件信息示例，未提供实际文件内容，无法预览或下载。</p></template></a-modal>
    <a-modal :visible="!!selectedHistory" title="审核记录" :width="650" :mask-closable="false" :footer="null" @cancel="selectedHistory = null"><div v-if="selectedHistory" class="history-content"><p>{{ selectedHistory.versionLabel }}</p><p>审核结果：{{ selectedHistory.result }}</p><p>审核账号：{{ selectedHistory.reviewer }}</p><p>审核备注：{{ selectedHistory.remark || '-' }}</p><p v-for="(comment, key) in selectedHistory.reviewComments" :key="key">{{ fieldLabel(key) }}：{{ comment }}</p></div></a-modal>
    <a-modal v-model="warningVisible" :mask-closable="false" :closable="false" :footer="null" :width="500" class="organization-audit-warning"><div class="warning-heading"><a-icon type="close-circle" /><strong>审核失败</strong></div><p>{{ warningText }}</p><div class="warning-actions"><a-button type="primary" @click="warningVisible = false">关闭</a-button></div></a-modal>
  </section>
</template>

<script>
import { organizationFieldGroups, loadOrganizationDetail, saveOrganizationDetail, validateOrganizationAudit, applyOrganizationRegistrationAudit, createOrganizationRegistrationSnapshot } from '../mock/organization-detail'
import ProjectSnapshotWindow from '../components/ProjectSnapshotWindow.vue'
import { registrationFields } from '../mock/organization-form'
import { cleanFundraisingRichText } from '../utils/fundraising-rich-text'

export default {
  name: 'OrganizationDetail',
  components: { ProjectSnapshotWindow },
  props: { organizationId: { type: String, required: true }, mode: { type: String, default: 'view' }, registrationUpdate: { type: Boolean, default: false } },
  data () { return { detail: loadOrganizationDetail(this.organizationId), auditForm: { result: 'approved', confirmed: 'unconfirmed', remark: '' }, registrationTab: 'updated', activeRegistrationSnapshot: null, reviewVisible: false, reviewKey: '', reviewDraft: '', preview: null, selectedHistory: null, warningVisible: false, warningText: '' } },
  computed: {
    isAudit () { return this.mode === 'audit' },
    registrationComparison () { return this.isAudit && this.registrationUpdate },
    registrationDisplayFields () { const versions = this.detail.registrationVersions; return this.registrationComparison && versions ? versions[this.registrationTab] : this.detail.fields },
    groups () { return organizationFieldGroups.map(group => group.key === 'registration' ? this.registrationGroup(this.detail.fields, this.detail.formVersion) : group) },
    snapshotRegistrationGroup () { const snapshot = this.activeRegistrationSnapshot.registrationSnapshot; return this.registrationGroup(snapshot.fields, snapshot.formVersion) },
    rowReviewContext () {
      for (const section of this.detail.members) {
        for (const row of section.rows) {
          const prefix = section.key + '.' + row.id
          if (this.reviewKey === prefix || this.reviewKey.indexOf(prefix + '.') === 0) return { prefix }
        }
      }
      return null
    },
    rowReviewEntries () { return this.rowReviewContext ? this.rowReviewKeys(this.rowReviewContext.prefix).map(key => ({ key, comment: this.reviewComment(key) })).filter(entry => entry.comment) : [] },
    reviewTargets () {
      if (this.rowReviewContext) return [this.rowReviewContext.prefix].concat(this.rowReviewEntries.map(entry => entry.key).filter(key => key !== this.rowReviewContext.prefix))
      const pairs = [['isCharity', 'charityRegisteredAt'], ['hasFundraisingQualification', 'fundraisingQualifiedAt']]
      return pairs.find(pair => pair.includes(this.reviewKey)) || []
    },
    visibleAttachments () { return this.detail.attachments.filter(section => section.key !== 'otherAttachments' || section.files.length) }
  },
  watch: {
    organizationId () { this.detail = loadOrganizationDetail(this.organizationId); this.resetMode() },
    mode () { this.resetMode() },
    registrationUpdate () { this.resetMode() }
  },
  methods: {
    registrationGroup (values, formVersion) {
      const group = organizationFieldGroups.find(item => item.key === 'registration')
      const fields = formVersion ? registrationFields(values.registrationType).map(field => [field.key, field.label, field.kind === 'textarea' ? 'wide' : undefined]) : group.fields
      return Object.assign({}, group, { fields: fields.filter(field => !['charityRegisteredAt', 'fundraisingQualifiedAt'].includes(field[0])).map(field => field[0] === 'isCharity' ? ['isCharity', '是否为慈善组织（认定登记时间）'] : field[0] === 'hasFundraisingQualification' ? ['hasFundraisingQualification', '是否有公募资质（证书取得时间）'] : field) })
    },
    openRegistrationSnapshot (entry) { this.activeRegistrationSnapshot = JSON.parse(JSON.stringify(entry)) },
    isRichField (key) { return (this.detail.richTextFields || []).includes(key) },
    richContent (key) { return cleanFundraisingRichText(this.detail.fields[key] || '') },
    registrationFieldChanged (groupKey, key) {
      const versions = this.detail.registrationVersions
      if (groupKey !== 'registration' || !this.registrationComparison || this.registrationTab !== 'updated' || !versions) return false
      return [key, this.qualificationDateKey(key)].filter(Boolean).some(field => (versions.updated[field] || '') !== (versions.current[field] || ''))
    },
    canReviewGroup (group) { return group.key !== 'registration' || !this.registrationComparison || this.registrationTab === 'updated' },
    openFieldReview (group, key) { if (this.canReviewGroup(group)) this.openReview(key) },
    resetMode () { this.activeRegistrationSnapshot = null; this.registrationTab = 'updated'; this.auditForm = { result: 'approved', confirmed: 'unconfirmed', remark: '' }; this.reviewVisible = false; this.preview = null; this.selectedHistory = null; this.warningVisible = false },
    goBack () { this.$router.push({ name: 'organization-list' }) },
    reviewComment (key) { const value = this.detail.reviewComments[key]; return typeof value === 'string' ? value.trim() : '' },
    qualificationDateKey (key) { return { isCharity: 'charityRegisteredAt', hasFundraisingQualification: 'fundraisingQualifiedAt' }[key] },
    combinedComment (key) { return this.reviewComment(key) || (this.qualificationDateKey(key) && this.reviewComment(this.qualificationDateKey(key))) },
    groupHasComments (group) { return group.fields.some(field => this.combinedComment(field[0])) },
    rowReviewKeys (prefix) {
      const knownKeys = ['name', 'identityNumber', 'relatedCompanies'].map(field => prefix + '.' + field)
      const extraKeys = Object.keys(this.detail.reviewComments).filter(key => key.indexOf(prefix + '.') === 0 && !knownKeys.includes(key)).sort()
      return [prefix].concat(knownKeys, extraKeys)
    },
    reviewTargetLabel (key) {
      if (this.rowReviewContext) {
        if (key === this.rowReviewContext.prefix) return '整行意见'
        const field = key.slice(this.rowReviewContext.prefix.length + 1)
        return ({ name: '姓名', identityNumber: '身份证号', relatedCompanies: '关联公司及对应的统一信用代码' })[field] || field
      }
      return { isCharity: '是否为慈善组织', charityRegisteredAt: '慈善组织认定登记时间', hasFundraisingQualification: '是否有公募资质', fundraisingQualifiedAt: '公开募捐资格证书取得时间' }[key] || key },
    fieldValue (key, groupKey, sourceFields) { const fields = sourceFields || (groupKey === 'registration' ? this.registrationDisplayFields : this.detail.fields); const dateKey = this.qualificationDateKey(key); const value = fields[key]; if (!dateKey) return value || '-'; if (value !== '是') return value || '否'; const date = fields[dateKey] || ''; const match = date.match(/^(\d{4})[年-](\d{1,2})[月-](\d{1,2})日?$/); return '是（' + (match ? match[1] + '年' + ('0' + match[2]).slice(-2) + '月' + ('0' + match[3]).slice(-2) + '日' : date || '—') + '）' },
    reviewClass (key) { return { 'review-has-comment': this.isAudit && !!this.combinedComment(key) } },
    rowHasComments (section, id) { return this.rowReviewKeys(section + '.' + id).some(key => this.reviewComment(key)) },
    rowClass (section, id) { return { 'review-row-trigger': this.isAudit, 'review-row-has-comment': this.isAudit && this.rowHasComments(section, id) } },
    openReview (key) { if (!this.isAudit) return; this.reviewKey = key; this.reviewDraft = this.reviewComment(key); this.reviewVisible = true },
    persist () { if (!saveOrganizationDetail(this.detail)) this.$message.warning('浏览器存储不可用，本次修改仅保留在当前页面') },
    saveReview () { if (!this.isAudit) return; const value = this.reviewDraft.trim(); if (value) this.$set(this.detail.reviewComments, this.reviewKey, value); else this.$delete(this.detail.reviewComments, this.reviewKey); this.persist(); this.reviewVisible = false },
    deleteReview () { if (!this.isAudit) return; this.$delete(this.detail.reviewComments, this.reviewKey); this.persist(); this.reviewVisible = false },
    hasYear (section) { return ['civilReports', 'annualReports', 'auditReports'].includes(section.key) },
    previewFile (file) { this.$message.info('待技术开发') },
    downloadFile (file) { this.$message.info('待技术开发') },
    previewLatestReport () { const reports = this.detail.attachments.find(section => section.key === 'civilReports').files.slice().sort((a, b) => Number(b.year) - Number(a.year) || b.uploadedAt.localeCompare(a.uploadedAt)); if (reports.length) this.previewFile(reports[0]); else this.$message.warning('暂无年检年报') },
    fieldLabel (key) { const field = this.groups.reduce((fields, group) => fields.concat(group.fields), []).find(item => item[0] === key); return field ? field[1] : key },
    submitAudit () {
      if (!this.isAudit) return
      const error = validateOrganizationAudit(this.auditForm, this.registrationComparison)
      if (error) { this.warningText = error; this.warningVisible = true; return }
      const now = new Date().toLocaleString('zh-CN', { hour12: false })
      const approved = this.auditForm.result !== 'rejected'
      const registrationSnapshot = approved ? createOrganizationRegistrationSnapshot(this.detail, this.registrationComparison ? this.detail.registrationVersions.updated : this.detail.fields) : null
      if (this.registrationComparison) applyOrganizationRegistrationAudit(this.detail, this.auditForm.result)
      this.detail.history.unshift({ id: 'history-' + Date.now(), submittedAt: now, auditedAt: now, approvedAt: approved ? now : '', reviewer: '本地演示账号', result: this.registrationComparison && this.auditForm.result === 'approved-update' ? '通过且更新注册信息' : approved ? '通过' : '驳回', remark: this.auditForm.remark.trim(), versionLabel: '本地演示审核记录', registrationSnapshot, reviewComments: Object.assign({}, this.detail.reviewComments) })
      this.persist()
      this.auditForm.confirmed = 'unconfirmed'
      this.$message.info('审核结果及完整审核意见已记录在本地演示 JSON 中，尚未提交至服务器')
    }
  }
}
</script>

<style scoped>
.detail-section-header .review-hint { color: #aaaaaa; }
.row-review-summary { margin-bottom: 16px; max-height: 240px; overflow-y: auto; }
.row-review-summary p { margin: 0 0 12px; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
.row-review-summary p:last-child { margin-bottom: 0; }
.qualification-review-target { width: 100%; margin-bottom: 16px; }
.organization-basic-content { --detail-inner-padding: 0 22px 22px; }
.organization-basic-content .description-item { gap: 8px; }
.description-item > strong.registration-field-changed { color: #fa8c16; }
.rich-text-field >>> img { display: block; max-width: 100%; height: auto; }
.review-dialog-actions { display: flex; justify-content: space-between; align-items: center; }
.review-dialog-primary { display: flex; gap: 8px; margin-left: auto; }
.review-dialog-primary > .ant-btn + .ant-btn { margin-left: 0; }
.privacy-reminder-body { display: flex; align-items: center; }
.privacy-reminder-body > p { margin: 0; line-height: 1.75; overflow-wrap: anywhere; }
.organization-avatar { width: 80px; height: 80px; object-fit: cover; border-radius: 13px; }
.evaluation-image { margin: 20px 0 0; }
.evaluation-image img { display: block; width: 160px; max-width: 100%; height: auto; }
.evaluation-image figcaption { margin-top: 12px; color: #718095; line-height: 1.6; overflow-wrap: anywhere; }
.attachment-list strong, .attachment-list span { overflow-wrap: anywhere; }
.attachment-empty { margin: 0; padding: 24px 4px; color: #718095; }
.report-confirmation-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; }
.report-confirmation-heading label { color: #40536a; }
.report-confirmation-heading .ant-btn { padding: 0; height: 32px; }
.description-item, .rich-text-field, .detail-table td, .history-content { overflow-wrap: anywhere; white-space: pre-wrap; }
.description-item[role="button"], .review-row-trigger { cursor: pointer; }
.description-item[role="button"]:hover, .detail-table .review-row-trigger:hover > td { background: #f8fbff; }
[role="button"]:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.organization-audit-warning >>> .ant-modal-body { padding: 36px 28px 28px; }
.warning-heading { display: flex; gap: 12px; align-items: center; }
.warning-heading .anticon { color: #ff4d4f; font-size: 22px; }
.organization-audit-warning p { margin: 16px 0 24px 34px; color: #718095; line-height: 1.7; }
.warning-actions { display: flex; justify-content: flex-end; }
.warning-actions .ant-btn { height: 32px; }
</style>

<style scoped src="../styles/organization-review.css"></style>
