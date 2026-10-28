<template>
  <section v-if="draft" class="standard-edit-scope organization-form-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <div v-if="errors.length" class="form-errors" role="alert"><strong>请完善以下内容后再提交</strong><ul><li v-for="error in errors" :key="error">{{ error }}</li></ul></div>
    <section v-for="group in visibleGroups" :key="group.key" class="panel">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon :type="group.icon" /></span><div><h2>{{ group.title }}</h2><p v-if="hasComments(group.fields)">请检查并修改标红的机构信息，点击信息小标题可查看具体审核意见</p></div></div>
      <div :class="[group.key === 'evaluation' ? 'editor-content' : 'organization-fields description-grid', { 'overview-fields': group.key === 'overview' }]">
        <div v-for="field in group.fields" :key="field.key" class="organization-field" :class="[field.kind === 'rich' ? {} : reviewClass(field.key), { full: ['textarea', 'rich', 'avatar'].includes(field.kind) }]">
          <label :for="'organization-' + field.key"><review-comment-label :comment="fieldComment(field)">{{ field.label }}</review-comment-label></label>
          <span v-if="field.kind === 'readonly' || (isChangeMode && field.key === 'inviterDepartment') || inherited(field) || (!isEdit && draft.nameChecked && field.key === 'name')" class="basic-field-value">{{ draft.fields[field.key] || '—' }}</span>
          <template v-else-if="field.kind === 'name'"><div class="inline-controls"><a-input :id="'organization-' + field.key" v-model="draft.fields.name" placeholder="请填写机构名称" @change="draft.nameChecked = false" /><a-button @click="queryName">查询</a-button></div><small v-if="draft.nameChecked">{{ draft.parentOrganizationId ? '已沿用注册机构信息，请填写二级组织名称' : '机构名称已确认（本地演示查询）' }}</small></template>
          <a-select dropdown-class-name="standard-edit-dropdown" v-else-if="field.kind === 'select'" :id="'organization-' + field.key" :value="draft.fields[field.key] || undefined" placeholder="请选择" @change="changeSelect(field, $event)"><a-select-option v-for="option in field.options" :key="option" :value="option">{{ option }}</a-select-option></a-select>
          <div v-else-if="field.kind === 'credit'" class="inline-controls"><a-input :id="'organization-' + field.key" v-model="draft.fields.creditCode" placeholder="请填写统一社会信用代码" /><a-select dropdown-class-name="standard-edit-dropdown" v-model="draft.fields.creditRegion" aria-label="统一社会信用代码所属地区"><a-select-option value="国内">国内</a-select-option><a-select-option value="国外">国外</a-select-option></a-select></div>
          <div v-else-if="field.kind === 'range'" class="inline-controls"><input v-model="draft.fields.validStart" type="date" aria-label="有效期限开始日期"><span>至</span><input v-model="draft.fields.validEnd" type="date" aria-label="有效期限结束日期"></div>
          <span v-else-if="field.kind === 'date' && restricted && qualificationDateDisabled(field.key)" class="basic-field-value">—</span>
          <input v-else-if="field.kind === 'date'" :id="'organization-' + field.key" v-model="draft.fields[field.key]" type="date" :aria-label="field.label" :disabled="qualificationDateDisabled(field.key)">
          <div v-else-if="field.key === 'otherLegalRoles'" class="legal-role-control"><a-checkbox :checked="draft.fields.otherLegalRoles === '是'" @change="draft.fields.otherLegalRoles = $event.target.checked ? '是' : '否'">是</a-checkbox><a-input v-if="draft.fields.otherLegalRoles === '是'" v-model="draft.fields.otherLegalOrganizations" placeholder="请填写机构名称" aria-label="担任法人其他机构名称" /><span v-else class="legal-role-hint">勾选是后填写</span></div>
          <div v-else-if="field.kind === 'qualification-date'" class="legal-role-control"><template v-if="restricted"><span class="basic-field-value">否</span></template><template v-else><a-checkbox :checked="draft.fields[field.key] === '是'" @change="draft.fields[field.key] = $event.target.checked ? '是' : '否'">是</a-checkbox><input v-if="draft.fields[field.key] === '是'" v-model="draft.fields[field.dateKey]" type="date" :aria-label="field.label"><span v-else class="legal-role-hint">勾选是后填写时间</span></template></div>
          <template v-else-if="['binary', 'qualification'].includes(field.kind)"><span v-if="field.kind === 'qualification' && restricted" class="basic-field-value">否</span><a-select dropdown-class-name="standard-edit-dropdown" v-else :id="'organization-' + field.key" v-model="draft.fields[field.key]" placeholder="请选择"><a-select-option value="是">是</a-select-option><a-select-option value="否">否</a-select-option></a-select></template>
          <a-textarea v-else-if="field.kind === 'textarea'" :id="'organization-' + field.key" v-model="draft.fields[field.key]" :rows="2" :placeholder="field.key === 'registeredAddress' ? '请填写登记证书的“住所”地址' : field.key === 'businessScope' ? '请填写登记证书的内容' : '请填写' + field.label" />
          <template v-else-if="field.kind === 'address'"><a-textarea :id="'organization-' + field.key" v-model="draft.fields.officeAddress" :rows="2" placeholder="请填写现办公地址" /><a-input v-model="draft.fields.postalCode" placeholder="请填写邮政编码" aria-label="邮政编码" /></template>
          <div v-else-if="field.kind === 'avatar'" class="avatar-editor"><div v-if="draft.fields.avatar" class="avatar-item"><button type="button" class="avatar-image-button" aria-label="预览机构头像" @click="avatarPreview = true"><img :src="draft.fields.avatar" alt="机构头像" /></button><div class="avatar-mask"><button type="button" class="avatar-delete" aria-label="删除机构头像" @click.stop="draft.fields.avatar = ''; avatarPreview = false"><a-icon type="delete" /> 删除</button></div></div><a-upload v-else accept="image/png,image/jpeg,image/webp" :multiple="false" :disabled="readingAvatar" :show-upload-list="false" :before-upload="selectAvatar"><button type="button" class="avatar-upload" :disabled="readingAvatar" aria-label="上传机构头像"><a-icon :type="readingAvatar ? 'loading' : 'plus'" /><span>{{ readingAvatar ? '上传中' : '上传' }}</span></button></a-upload><a-upload v-if="draft.fields.avatar" accept="image/png,image/jpeg,image/webp" :multiple="false" :disabled="readingAvatar" :show-upload-list="false" :before-upload="selectAvatar"><a-button type="link" :disabled="readingAvatar">更换头像</a-button></a-upload></div>
          <rich-editor v-else-if="field.kind === 'rich'" v-model="draft.fields[field.key]" :label="field.label" :class="{ 'rich-review-has-comment': !!comment(field.key) }" @input="markRich(field.key)" @busy="setEditorBusy(field.key, $event)" />
          <a-input v-else :id="'organization-' + field.key" v-model="draft.fields[field.key]" :placeholder="field.key === 'secondLoginPhone' ? '非必填，可在第一手机号不可用时登录修改' : field.key === 'organizationName' ? '非必填，不填时贵机构其他组织注册时将只能作为二级组织账号' : '请填写' + field.label" />
        </div>
      </div>
      <div v-if="group.key === 'overview'" class="editor-content member-sections">
        <div v-for="section in draft.members" :key="section.key" class="member-content">
          <h3>{{ section.title }}</h3>
          <div class="detail-table-wrap"><table class="detail-table members-table"><colgroup><col style="width:70px"><col style="width:140px"><col style="width:200px"><col><col style="width:130px"></colgroup><thead><tr><th>序号</th><th>姓名</th><th>身份证号</th><th>关联公司及对应的统一信用代码</th><th>操作</th></tr></thead><tbody>
            <tr v-for="(row, index) in section.rows" :key="row.id" :class="{ 'review-row-has-comment': rowComment(section.key, row) }" :role="rowComment(section.key, row) ? 'button' : undefined" :tabindex="rowComment(section.key, row) ? 0 : undefined" @click="showRowComment(section.key, row)" @keydown.enter.prevent="showRowComment(section.key, row)" @keydown.space.prevent="showRowComment(section.key, row)"><td><a-popover v-if="rowComment(section.key, row)" :visible="rowReview === section.key + '.' + row.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowReviewVisibility(section.key, row, visible)"><template slot="content"><div class="row-review-content"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ rowComment(section.key, row) }}</p></div><a-button size="small" type="primary" @click.stop="rowReview = ''">关闭</a-button></div></template><span class="row-review-anchor">{{ index + 1 }}</span></a-popover><template v-else>{{ index + 1 }}</template></td><td>{{ row.name }}</td><td>{{ row.identityNumber }}</td><td>{{ row.relatedCompanies }}</td><td class="row-actions" @click.stop @keydown.stop><a-button type="link" @click="openMember(section, row)">编辑</a-button><a-button type="link" class="danger-link" @click="removeMember(section, row)">删除</a-button></td></tr>
            <tr><td>{{ section.rows.length + 1 }}</td><td></td><td></td><td></td><td class="row-actions"><a-button type="link" @click="openMember(section)">新增</a-button></td></tr>
          </tbody></table></div>
        </div>
      </div>
    </section>
    <form v-if="!showFullForm" class="registration-query-bar" @submit.prevent="queryName"><a-input v-model="draft.fields.name" aria-label="要注册的机构名称" placeholder="请输入您要注册的机构名称，查询后如果机构已存在将预填机构注册信息" /><a-button type="primary" html-type="submit">查询</a-button></form>
    <section v-for="section in visibleAttachments" :key="section.key" class="panel attachment-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>{{ section.title }}</h2></div></div>
      <div class="editor-content attachment-content">
        <a-empty v-if="!section.files.length" class="attachment-empty-add" :description="section.key === 'otherAttachments' ? '点击添加附件' : '点击添加'" role="button" tabindex="0" @click="openUpload(section)" @keydown.enter.native.prevent="openUpload(section)" @keydown.space.native.prevent="openUpload(section)" />
        <template v-else>
          <div class="attachment-list form-attachment-list"><div v-for="file in section.files" :key="file.id">
            <div><strong>{{ file.name }}</strong><span>{{ attachmentMeta(section, file) }}</span></div>
            <a-button type="link" @click.stop="previewAttachment(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadAttachment(file)" @keydown.stop>下载</a-button><a-button v-if="canRemoveFile(section, file)" type="link" class="danger-link" @click.stop="removeFile(section, file)" @keydown.stop>删除</a-button>
          </div></div>
          <a-button class="add-more-attachment" type="dashed" icon="plus" @click="openUpload(section)">添加更多{{ section.title }}</a-button>
        </template>
      </div>
    </section>
    <section v-if="isEdit && draft.history.length" class="panel"><div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div><div class="editor-content organization-audit-content"><a-timeline class="audit-timeline"><a-timeline-item v-for="entry in draft.history" :key="entry.id" :color="entry.result === '通过' ? '#70B603' : '#FF4D4F'"><div class="audit-entry"><strong>审核结果：{{ entry.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ entry.auditedAt || entry.approvedAt || entry.submittedAt || '—' }} · {{ entry.reviewer || '—' }}</span></div><div class="audit-result-details"><p><b>审核备注：</b>{{ entry.remark || '—' }}</p></div></div></a-timeline-item></a-timeline></div></section>
    <footer v-if="showFullForm" class="form-footer"><span><a-icon type="info-circle" /> {{ dirty ? '填写内容尚未保存' : '可随时存为草稿' }}</span><div><a-button @click="goBack">取消</a-button><a-button icon="save" :disabled="busy" @click="save(false)">存为草稿</a-button><a-button type="primary" :disabled="busy" @click="save(true)">提交申请</a-button></div></footer>
    <avatar-crop-modal ref="avatarCrop" @busy="readingAvatar = $event" @confirm="draft.fields.avatar = $event" />
    <a-modal v-model="avatarPreview" title="机构头像" :width="650" :mask-closable="false" :footer="null"><img v-if="draft.fields.avatar" class="avatar-preview" :src="draft.fields.avatar" alt="机构头像" /></a-modal>
    <a-modal v-model="memberVisible" :title="editingMemberId ? '编辑成员' : '添加成员'" :width="550" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :mask-closable="false">
      <div class="member-dialog"><div class="dialog-row"><label for="member-name">姓名</label><a-input id="member-name" v-model="memberDraft.name" placeholder="填写姓名" /></div><div class="dialog-row"><label for="member-identity">身份证号</label><a-input id="member-identity" v-model="memberDraft.identityNumber" placeholder="填写身份证号" /></div><div v-for="(company, index) in memberDraft.companies" :key="company.id" class="dialog-row"><label :for="'company-' + company.id">关联公司</label><div class="company-fields"><a-input :id="'company-' + company.id" v-model="company.name" placeholder="填写公司名称" /><a-input v-model="company.code" placeholder="填写该公司统一信用代码" :aria-label="'第' + (index + 1) + '家关联公司的统一信用代码'" /><a-button v-if="memberDraft.companies.length > 1" type="link" @click="memberDraft.companies.splice(index, 1)">删除关联公司</a-button></div></div><a-button type="dashed" @click="memberDraft.companies.push(newCompany())">增加关联公司</a-button><p v-if="dialogError" class="form-error" role="alert">{{ dialogError }}</p></div><template slot="footer"><div class="dialog-actions"><a-button @click="memberVisible = false">关闭</a-button><a-button type="primary" @click="saveMember">{{ editingMemberId ? '保存' : '添加' }}</a-button></div></template>
    </a-modal>
    <a-modal v-model="uploadVisible" :title="'上传' + (uploadSection ? uploadSection.title : '附件')" :width="550" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :mask-closable="false" :closable="!uploading" :keyboard="!uploading" @afterClose="resetUpload">
      <div class="member-dialog">
        <div v-if="uploadSection && hasYear(uploadSection.key)" class="dialog-row"><label for="upload-year">报告年份</label><a-select dropdown-class-name="standard-edit-dropdown" id="upload-year" v-model="uploadDraft.year" :disabled="uploading" placeholder="请选择"><a-select-option v-for="year in reportYears" :key="year" :value="year">{{ year }}年</a-select-option></a-select></div>
        <div v-if="uploadSection && uploadSection.key === 'civilReports'" class="dialog-row"><label for="upload-civil">上报民政</label><a-select dropdown-class-name="standard-edit-dropdown" id="upload-civil" v-model="uploadDraft.civilStatus" :disabled="uploading" placeholder="请选择"><a-select-option value="已上报">已上报</a-select-option><a-select-option value="未上报">未上报</a-select-option></a-select></div>
        <div class="dialog-row"><label>{{ uploadSection && uploadSection.key === 'certificates' ? '登记证书' : uploadSection && uploadSection.key === 'otherAttachments' ? '附件文件' : '报告文件' }}</label><a-upload :file-list="selectedFiles" :before-upload="selectFile" :remove="clearSelectedFile" :disabled="uploading" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"><a-button icon="upload" :disabled="uploading">点击上传</a-button></a-upload></div>
        <p v-if="uploadError" class="form-error" role="alert">{{ uploadError }}</p>
      </div>
      <template slot="footer"><div class="dialog-actions"><a-button :disabled="uploading" @click="uploadVisible = false">关闭</a-button><a-button type="primary" :loading="uploading" @click="saveUpload">添加</a-button></div></template>
    </a-modal>
    <a-modal v-model="previewVisible" :title="previewName" :width="960" :mask-closable="false" :footer="null" @afterClose="clearPreview"><img v-if="previewType === 'image'" :src="previewUrl" :alt="previewName" class="attachment-preview-image" /><iframe v-else-if="previewType === 'pdf'" :src="previewUrl" :title="previewName" class="attachment-preview-pdf"></iframe><p v-else>此格式请下载后使用对应办公软件查看。</p></a-modal>
  </section>
</template>

<script>
import { draftFile } from '../mock/project-drafts'
import AvatarCropModal from '../components/AvatarCropModal.vue'
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import RichEditor from '../components/FundraisingRichEditor.vue'
import { accountFields, overviewFields, evaluationFields, registrationFields, restrictedTypes, loadOrganizationForm, setOrganizationType, findOrganizationByName, saveOrganizationForm, validateOrganizationForm } from '../mock/organization-form'
import { cleanFundraisingRichText, paragraphsToRichText } from '../utils/fundraising-rich-text'

let sequence = 0
const uid = prefix => prefix + '-' + Date.now() + '-' + (++sequence)
export default {
  name: 'OrganizationForm',
  components: { ReviewCommentLabel, RichEditor, AvatarCropModal },
  props: { organizationId: { type: String, default: 'new' } },
  data () { return { draft: loadOrganizationForm(this.organizationId, this.$route.query.review), errors: [], readingAvatar: false, avatarPreview: false, editorBusy: {}, memberVisible: false, memberSection: null, editingMemberId: '', memberDraft: { name: '', identityNumber: '', companies: [] }, dialogError: '', uploadVisible: false, uploadSection: null, uploadDraft: { year: undefined, civilStatus: undefined }, selectedFiles: [], uploadError: '', uploading: false, previewVisible: false, previewName: '', previewType: '', previewUrl: '', rowReview: '', existingAttachmentKeys: [], baseline: '' } },
  computed: {
    isEdit () { return this.organizationId !== 'new' },
    isChangeMode () { return this.isEdit && this.$route.query.change === '1' },
    dirty () { return JSON.stringify(this.draft) !== this.baseline },
    showFullForm () { return this.isEdit || !!this.draft.nameChecked },
    visibleGroups () { return this.showFullForm ? this.groups : this.groups.filter(group => group.key === 'account') },
    visibleAttachments () { return this.showFullForm ? this.draft.attachments : [] },
    restricted () { return restrictedTypes.includes(this.draft.fields.registrationType) },
    groups () { return [{ key: 'account', title: '账号信息', icon: 'user', fields: accountFields }, { key: 'registration', title: '机构注册信息', icon: 'bank', fields: registrationFields(this.draft.fields.registrationType, true).filter(field => !this.draft.isPrimaryAccount || field.key !== 'organizationName') }, { key: 'overview', title: '机构概况', icon: 'read', fields: overviewFields }, { key: 'evaluation', title: '社会评价信息', icon: 'star', fields: evaluationFields }] },
    reportYears () { const year = new Date().getFullYear() - 1; return [0, 1, 2, 3, 4].map(offset => year - offset) },
    busy () { return this.uploading || this.readingAvatar || Object.keys(this.editorBusy).some(key => this.editorBusy[key]) }
  },
  created () { this.prepareDraft() },
  watch: { '$route.query.review' () { this.draft = loadOrganizationForm(this.organizationId, this.$route.query.review); this.rowReview = ''; this.prepareDraft() }, organizationId () { if (this.$refs.avatarCrop) this.$refs.avatarCrop.cancel(); this.draft = loadOrganizationForm(this.organizationId, this.$route.query.review); this.errors = []; this.memberVisible = false; this.uploadVisible = false; this.previewVisible = false; this.clearPreview(); this.avatarPreview = false; this.rowReview = ''; this.prepareDraft() } },
  beforeDestroy () { this.clearPreview() },
  beforeRouteLeave (to, from, next) { if (this.uploading) { this.$message.info('附件正在保存，请稍候。'); next(false); return } if (JSON.stringify(this.draft) === this.baseline) { next(); return } this.$confirm({ title: '离开机构编辑页？', content: '尚未保存的内容将丢失。', maskClosable: false, okText: '离开', cancelText: '继续编辑', onOk: () => next(), onCancel: () => next(false) }) },
  methods: {
    prepareDraft () {
      if (!this.draft) return
      this.existingAttachmentKeys = this.draft.attachments.reduce((keys, section) => keys.concat(section.files.map(file => section.key + '.' + file.id)), [])
      evaluationFields.forEach(field => { if (!this.draft.richTextFields.includes(field.key)) this.draft.fields[field.key] = paragraphsToRichText((this.draft.fields[field.key] || '').split('\n\n')) })
      if (this.restricted) { this.draft.fields.isCharity = '否'; this.draft.fields.hasFundraisingQualification = '否' }
      this.baseline = JSON.stringify(this.draft)
    },
    goBack () { this.$router.push({ name: this.isEdit ? 'organization-list' : 'dashboard' }) },
    comment (key) { const value = this.draft.reviewComments[key]; return this.isEdit && typeof value === 'string' ? value.trim() : '' },
    fieldComment (field) { return [this.comment(field.key), field.dateKey ? this.comment(field.dateKey) : ''].filter(Boolean).join('\n\n') },
    reviewClass (key) { const dateKey = { isCharity: 'charityRegisteredAt', hasFundraisingQualification: 'fundraisingQualifiedAt' }[key]; return { 'review-has-comment': !!(this.comment(key) || (dateKey && this.comment(dateKey))) } },
    hasComments (fields) { return fields.some(field => this.fieldComment(field)) },
    rowComment (key, row) { const prefix = key + '.' + row.id; const fields = ['name', 'identityNumber', 'relatedCompanies'].map(field => prefix + '.' + field); const extra = Object.keys(this.draft.reviewComments).filter(key => key.indexOf(prefix + '.') === 0 && !fields.includes(key)).sort(); return [prefix].concat(fields, extra).map(key => this.comment(key)).filter(Boolean).join('\n\n') },
    hasMemberComments (section) { return section.rows.some(row => this.rowComment(section.key, row)) },
    showRowComment (key, row) { if (this.rowComment(key, row)) this.rowReview = key + '.' + row.id },
    changeRowReviewVisibility (key, row, visible) { if (visible) this.showRowComment(key, row); else if (this.rowReview === key + '.' + row.id) this.rowReview = '' },
    inherited (field) { return !!this.draft.parentOrganizationId && registrationFields(this.draft.fields.registrationType).some(item => item.key === field.key) && field.key !== 'organizationName' },
    qualificationDateDisabled (key) { return (key === 'charityRegisteredAt' && this.draft.fields.isCharity !== '是') || (key === 'fundraisingQualifiedAt' && this.draft.fields.hasFundraisingQualification !== '是') },
    changeSelect (field, value) { if (field.key === 'registrationType') setOrganizationType(this.draft, value); else this.$set(this.draft.fields, field.key, value) },
    queryName () {
      if (!this.draft.fields.name.trim()) { this.$message.warning('请先填写机构名称'); return }
      if (!this.isEdit) { this.draft.fields.name = this.draft.fields.name.trim(); this.draft.nameChecked = true; return }
      const match = findOrganizationByName(this.draft.fields.name)
      if (!match || (this.isEdit && (match.id === this.organizationId || match.fields.name === this.draft.fields.name))) { this.draft.nameChecked = true; this.$info({ title: '该机构可注册', content: '本地示例名称查询通过，尚未调用真实查重接口。', maskClosable: false, okText: '关闭' }); return }
      this.$confirm({ title: '该机构已注册，确认申请其二级组织', content: '请先确认机构名称无误，继续将沿用机构信息且无法修改。', maskClosable: false, okText: '继续', cancelText: '取消', onOk: () => { const parent = loadOrganizationForm(match.id); registrationFields(parent.fields.registrationType).forEach(field => { if (field.key !== 'organizationName') this.$set(this.draft.fields, field.key, parent.fields[field.key] || '') }); ['validStart', 'validEnd', 'creditRegion', 'otherLegalOrganizations', 'organizer', 'establishedAt'].forEach(key => { this.$set(this.draft.fields, key, parent.fields[key] || '') }); this.draft.parentOrganizationId = match.id; this.draft.nameChecked = true } })
    },
    markRich (key) { if (!this.draft.richTextFields.includes(key)) this.draft.richTextFields.push(key) },
    setEditorBusy (key, busy) { this.$set(this.editorBusy, key, busy) },
    selectAvatar (file) {
      if (this.readingAvatar) return false
      if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 1024 * 1024) { this.$message.warning('请选择1 MB以内的PNG、JPG或WebP图片'); return false }
      this.$refs.avatarCrop.open(file)
      return false
    },
    newCompany () { return { id: uid('company'), name: '', code: '' } },
    openMember (section, row) { this.memberSection = section; this.editingMemberId = row ? row.id : ''; const companies = row ? (row.relatedCompanies || '').split('\n').filter(Boolean).map(text => { const parts = text.split(' / '); return { id: uid('company'), name: parts[0], code: parts.slice(1).join(' / ') } }) : []; this.memberDraft = { name: row ? row.name : '', identityNumber: row ? row.identityNumber : '', companies: companies.length ? companies : [this.newCompany()] }; this.dialogError = ''; this.memberVisible = true },
    saveMember () { const value = this.memberDraft; if (!value.name.trim() || !value.identityNumber.trim()) { this.dialogError = '请填写姓名和身份证号'; return } if (value.companies.some(company => (!!company.name.trim()) !== (!!company.code.trim()))) { this.dialogError = '关联公司名称和统一信用代码须同时填写'; return } const row = { id: this.editingMemberId || uid(this.memberSection.key), name: value.name.trim(), identityNumber: value.identityNumber.trim(), relatedCompanies: value.companies.filter(company => company.name.trim()).map(company => company.name.trim() + ' / ' + company.code.trim()).join('\n') }; if (this.editingMemberId) { const index = this.memberSection.rows.findIndex(item => item.id === this.editingMemberId); this.$set(this.memberSection.rows, index, Object.assign({}, this.memberSection.rows[index], row)); this.memberVisible = false } else { this.memberSection.rows.push(row); this.memberDraft = { name: '', identityNumber: '', companies: [this.newCompany()] } } this.dialogError = '' },
    removeMember (section, row) { this.$confirm({ title: '确认删除该成员？', content: '其审核意见将保留在原JSON键中，不会转移到其他成员。', maskClosable: false, onOk: () => { section.rows.splice(section.rows.indexOf(row), 1) } }) },
    hasYear (key) { return ['civilReports', 'annualReports', 'auditReports'].includes(key) },
    openUpload (section) { this.uploadSection = section; this.uploadDraft = { year: this.reportYears[0], civilStatus: undefined }; this.selectedFiles = []; this.uploadError = ''; this.uploadVisible = true },
    clearSelectedFile () { if (this.uploading) return false; this.selectedFiles = []; return true },
    resetUpload () { this.selectedFiles = []; this.uploadError = '' },
    selectFile (file) {
      if (this.uploading) return false
      if (!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name) || file.size > 20 * 1024 * 1024) { this.uploadError = '请选择 20 MB 以内的 PDF、Word、Excel 或图片文件'; this.selectedFiles = []; return false }
      this.selectedFiles = [file]; this.uploadError = ''; return false
    },
    async saveUpload () {
      if (this.uploading || !this.uploadSection) return
      if (!this.selectedFiles.length || (this.hasYear(this.uploadSection.key) && !this.uploadDraft.year) || (this.uploadSection.key === 'civilReports' && !this.uploadDraft.civilStatus)) { this.uploadError = '请选择文件并完善报告信息'; return }
      const section = this.uploadSection
      const file = this.selectedFiles[0]
      const entry = { id: uid('organization-file'), name: file.name, size: file.size, type: file.type, localStored: true, year: this.uploadDraft.year, civilStatus: this.uploadDraft.civilStatus || '', uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }), url: '' }
      this.uploading = true
      try {
        await draftFile('put', entry.id, file)
        section.files.push(entry)
        this.uploadVisible = false
        this.$message.success('附件已加入，请存为草稿以保存附件列表')
      } catch (error) { this.uploadError = '附件保存失败，请检查浏览器存储后重试' } finally { this.uploading = false }
    },
    formatSize (size) { return size >= 1024 * 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB' },
    attachmentMeta (section, file) { return [this.hasYear(section.key) && file.year ? file.year + '年' : '', section.key === 'civilReports' ? (file.civilStatus === '已上报' ? '已上报民政' : file.civilStatus === '未上报' ? '未上报民政' : '—') : '', typeof file.size === 'number' ? this.formatSize(file.size) : '示例文件', file.uploadedAt].filter(Boolean).join(' · ') },
    async getAttachment (file) {
      if (!file.localStored) { this.$message.info('该附件仅为文件信息，请上传实际文件后预览或下载'); return null }
      try { const blob = await draftFile('get', file.id); if (!blob) throw new Error('missing'); return blob } catch (error) { this.$message.error('本地附件已不可用，请重新上传'); return null }
    },
    async previewAttachment (file) { if (!file.localStored) { this.$message.info('待技术开发'); return }; const blob = await this.getAttachment(file); if (!blob || this._isDestroyed) return; this.clearPreview(); this.previewName = file.name; this.previewType = /\.(png|jpe?g)$/i.test(file.name) ? 'image' : /\.pdf$/i.test(file.name) ? 'pdf' : 'office'; this.previewUrl = URL.createObjectURL(blob); this.previewVisible = true },
    downloadAttachment () { this.$message.info('待技术开发') },
    clearPreview () { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = ''; this.previewType = '' },
    canRemoveFile (section, file) { return !this.isChangeMode || !this.existingAttachmentKeys.includes(section.key + '.' + file.id) },
    removeFile (section, file) { if (!this.canRemoveFile(section, file)) return; this.$confirm({ title: '确认删除该附件信息？', maskClosable: false, onOk: () => { const index = section.files.findIndex(item => item.id === file.id); if (index !== -1 && this.canRemoveFile(section, file)) section.files.splice(index, 1) } }) },
    save (submit) {
      if (this.busy) return
      this.errors = submit ? validateOrganizationForm(this.draft) : []
      if (this.errors.length) { window.scrollTo(0, 0); return }
      evaluationFields.forEach(field => { this.draft.fields[field.key] = cleanFundraisingRichText(this.draft.fields[field.key]); this.markRich(field.key) })
      if (!saveOrganizationForm(this.draft, submit)) { this.$message.error('本地保存失败，可能存储空间不足；请保留当前页面重试'); return }
      if (submit) this.draft.status = '待审'
      this.baseline = JSON.stringify(this.draft)
      this.$message.info(submit ? '申请已记录在本地演示JSON中，尚未提交服务器' : '草稿已保存至当前浏览器')
    }
  }
}
</script>

<style scoped>
.organization-form-page { display: grid; gap: 20px; min-width: 0; }
.organization-form-page > .panel { overflow: hidden; }
.registration-query-bar { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 24px; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); }
.registration-query-bar .ant-input { min-width: 0; flex: 1; height: 40px; padding: 0 12px; }
.registration-query-bar .ant-input::placeholder { color: #5b8ff9; opacity: 1; }
.registration-query-bar .ant-btn { flex: none; min-width: 100px; height: 40px; }
.organization-fields { padding: 0 22px 22px; }
.organization-field { min-width: 0; min-height: 76px; padding: 17px 18px; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid #edf1f5; }
.organization-field.full { grid-column: 1 / -1; }
.organization-field > label { color: #7b899b; font-weight: 400; line-height: 1.6; }
.basic-field-value { color: #27384e; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
.organization-field > .ant-input, .organization-field > .ant-select >>> .ant-select-selection--single { min-height: 40px; }
.organization-field > .ant-select >>> .ant-select-selection__rendered { line-height: 38px; }
.organization-field > .ant-input {  }
.legal-role-control { display: flex; align-items: center; gap: 16px; min-height: 40px; }
.legal-role-control > .ant-checkbox-wrapper { flex: none; }
.legal-role-control > input[type="date"] { flex: 1; width: 0; }
.legal-role-control > .ant-input { flex: 1; min-width: 0; height: 40px; }
.legal-role-hint { color: #718095; }
.inline-controls { display: flex; align-items: center; gap: 12px; min-width: 0; }
.inline-controls > .ant-input { flex: 1; min-width: 0; height: 40px; }
.inline-controls > .ant-select { width: 100px; flex: none; }
.inline-controls > .ant-select >>> .ant-select-selection--single { height: 40px; }
.inline-controls > .ant-select >>> .ant-select-selection__rendered { line-height: 38px; }
input[type="date"] { min-width: 0; width: 100%; height: 40px; border: 1px solid transparent; border-radius: 4px; padding: 0 12px; color: #27384e; }
.organization-field >>> .ant-input, .organization-field input[type="date"], .organization-field >>> .ant-select-selection { border-color: transparent; background: transparent; box-shadow: none; }
.organization-field input[type="date"]:disabled { color: #718095; background: #f5f5f5; cursor: not-allowed; }
.organization-field >>> .ant-input:hover, .organization-field input[type="date"]:not(:disabled):hover, .organization-field >>> .ant-select-selection:hover { border-color: #d9e1eb; }
.organization-field >>> .ant-input:focus, .organization-field input[type="date"]:focus { outline: none; border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.organization-field >>> .ant-select-focused .ant-select-selection, .organization-field >>> .ant-select-open .ant-select-selection { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.organization-field small { color: #718095; }
.avatar-editor { display: flex; align-items: flex-start; }
.avatar-item { position: relative; width: 80px; height: 80px; border-radius: 13px; overflow: hidden; flex: none; }
.avatar-image-button { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
.avatar-image-button img { display: block; width: 100%; height: 100%; object-fit: cover; }
.avatar-mask { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(15,35,58,.62); opacity: 0; transition: opacity .18s ease; pointer-events: none; }
.avatar-item:hover .avatar-mask, .avatar-item:focus-within .avatar-mask { opacity: 1; }
.avatar-delete { pointer-events: auto; height: 32px; padding: 0 8px; border: 1px solid rgba(255,255,255,.78); border-radius: 4px; color: #fff; background: rgba(255,77,79,.88); cursor: pointer; }
.avatar-delete:hover, .avatar-delete:focus { background: #ff4d4f; }
.avatar-upload { display: grid; place-content: center; gap: 10px; width: 80px; height: 80px; border: 1px dashed #b9c9dd; border-radius: 13px; background: #f8fbff; color: #5b8ff9; cursor: pointer; }
.avatar-upload .anticon { font-size: 24px; }
.avatar-upload:hover { border-color: #1677ff; }
.avatar-upload:disabled { cursor: wait; opacity: .5; }
.avatar-upload:focus-visible, .avatar-image-button:focus-visible { outline: 2px solid #1677ff; outline-offset: -2px; }
.avatar-preview { display: block; max-width: 100%; height: auto; margin: auto; }
.editor-content { padding: 24px; }
.organization-audit-content { --detail-inner-padding: 0; }
.organization-audit-content .audit-result-details p { white-space: pre-wrap; overflow-wrap: anywhere; }
.editor-content > .organization-field { min-height: 0; padding: 0; border: 0; }
.editor-content > .organization-field + .organization-field { margin-top: 32px; }
.editor-content > .organization-field > label { font-weight: 500; }
.editor-content h3 { margin: 0 0 8px; line-height: 1.6; }
.organization-fields.overview-fields { padding-bottom: 0; }
.member-sections { padding-top: 32px; }
.member-content + .member-content { margin-top: 32px; }
.detail-table-wrap { margin: 0; }
.members-table { table-layout: fixed; }
.members-table th, .members-table td { vertical-align: middle; }
.row-review-anchor { display: block; width: 100%; }
.row-review-content { width: 300px; max-width: 60vw; }
.row-review-content > div { display: flex; align-items: flex-start; gap: 10px; }
.row-review-content .anticon { flex: none; margin-top: 3px; color: #faad14; }
.row-review-content p { flex: 1; min-width: 0; margin: 0 0 14px; line-height: 1.6; overflow-wrap: anywhere; white-space: pre-wrap; }
.row-review-content .ant-btn { display: block; margin-left: auto; }
.detail-table td { white-space: pre-wrap; overflow-wrap: anywhere; }
.members-table th:first-child, .members-table td:first-child, .detail-table th:last-child, .detail-table td:last-child { text-align: center; }
.row-actions { white-space: nowrap !important; }
.row-actions .ant-btn { padding: 0 7px; }
.danger-link { color: #ff4d4f; }
.review-row-has-comment { cursor: pointer; }
.review-row-has-comment:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.rich-review-has-comment >>> .rich-editable { background: #fff1f0; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 12px; }
.dialog-actions > .ant-btn + .ant-btn { margin-left: 0; }
.form-footer { position: sticky; bottom: 0; z-index: 5; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.form-footer > span { color: #718095; }
.form-footer > div { display: flex; gap: 12px; }
.form-footer .ant-btn { min-width: 100px; height: 32px; }
.member-dialog { width: 470px; max-width: 100%; margin: auto; padding: 0; display: grid; gap: 16px; }
.dialog-row { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 18px; align-items: start; }
.dialog-row > label { text-align: right; color: #27384e; }
.company-fields { display: grid; gap: 8px; }
.form-error, .form-errors { color: #cf1322; }
.form-errors { background: #fff1f0; border: 1px solid #ffccc7; border-radius: 8px; padding: 18px 24px; }
.form-errors ul { margin: 8px 0 0; }
.organization-field >>> input::placeholder, .organization-field >>> textarea::placeholder { color: #5b8ff9; opacity: 1; }
.organization-field >>> .ant-select-selection__placeholder { color: #5b8ff9; }
.attachment-section .detail-section-header > div { display: flex; min-height: 40px; align-items: center; }
.attachment-content .attachment-list, .attachment-content .attachment-empty-add { padding: 0; margin: 0; }
.form-attachment-list > div { grid-template-columns: minmax(0, 1fr) auto auto auto; }
.form-attachment-list > div:first-child { padding-top: 0; align-items: start; }
.form-attachment-list strong { overflow-wrap: anywhere; }
.form-attachment-list .ant-btn { padding: 0 6px; }
.attachment-empty-add { cursor: pointer; border-radius: 8px; }
.attachment-empty-add >>> .ant-empty-description { color: #5b8ff9; }
.attachment-empty-add:focus-visible { outline: 2px solid #1677ff; outline-offset: 4px; }
.add-more-attachment { width: 100%; margin: 16px 0 0; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }
.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }
.attachment-preview-image { max-width: 100%; display: block; margin: auto; }
.attachment-preview-pdf { width: 100%; height: 65vh; border: 0; }
</style>

<style scoped src="../styles/organization-review.css"></style>
