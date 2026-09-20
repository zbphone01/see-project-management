<template>
  <section class="recruitment-form-page" :aria-busy="loading || saving">
    <div class="detail-back-row"><a-button class="detail-back" :disabled="saving" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <div v-if="errors.length" class="validation-summary" role="alert"><a-icon type="exclamation-circle" /><div><strong>请完善以下内容后再提交</strong><ul><li v-for="error in errors" :key="error">{{ error }}</li></ul></div></div>
    <a-spin :spinning="loading" tip="正在读取本地填写记录">
      <fieldset :disabled="loading || saving" class="form-body">
        <section class="panel form-section">
          <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>招募信息</h2></div></div>
          <div class="form-fields">
            <div class="field full"><label for="recruitment-name"><em>*</em> 招募名称</label><a-input id="recruitment-name" v-model="form.name" placeholder="请填写招募名称" :max-length="200" /></div>
            <div class="field"><span class="field-label">筹款规划申请名称</span><span class="readonly-value">{{ form.planningName }}</span></div>
            <div class="field"><span class="field-label">所属部门</span><span class="readonly-value">{{ form.department }}</span></div>
            <div class="field"><label for="recruitment-type"><em>*</em> 项目类型</label><a-select id="recruitment-type" v-model="form.type" placeholder="请选择项目类型" @change="changeType"><a-select-option value="项目">项目</a-select-option><a-select-option value="联合公益" :disabled="!account.functionalDepartment">联合公益</a-select-option></a-select></div>
            <div class="field"><label for="recruitment-strategy"><em>*</em> 项目策略</label><a-select id="recruitment-strategy" v-model="form.strategy" :disabled="!form.type" placeholder="请选择项目策略" @change="changeStrategy"><a-select-option v-for="option in strategies" :key="option">{{ option }}</a-select-option></a-select></div>
            <div class="field"><label for="recruitment-topic"><em>*</em> 项目议题</label><a-select id="recruitment-topic" v-model="form.topic" :disabled="!form.strategy" placeholder="请选择项目议题" @change="changeTopic"><a-select-option v-for="option in topics" :key="option">{{ option }}</a-select-option></a-select></div>
            <div class="field"><label for="recruitment-funding"><em>*</em> 资金来源</label><a-select v-if="!isJoint" id="recruitment-funding" v-model="form.fundingSource" :disabled="form.type !== '项目'" placeholder="请选择资金来源" @change="changeFundingSource"><a-select-option value="项目">项目</a-select-option><a-select-option value="项目+筹款">项目+筹款</a-select-option></a-select><span v-else class="readonly-value">筹款</span></div>
            <div class="field"><span class="field-label">筹款方式</span><span :class="['readonly-value', { 'empty-hint': !form.fundraisingMethod }]">{{ form.fundraisingMethod || '选择项目类型后自动带入' }}</span></div>
            <div class="field"><label for="recruitment-fee">公募机构管理费比例</label><span v-if="projectFundingOnly" class="readonly-value">不适用</span><a-select v-else id="recruitment-fee" v-model="form.managementFee"><a-select-option v-for="value in [5, 6, 7, 8, 9, 10]" :key="value" :value="value">{{ value }}%</a-select-option></a-select></div>
            <div class="field"><label for="recruitment-grant"><em v-if="!isJoint">*</em> 资助金额</label><div class="amount-input"><a-input-number id="recruitment-grant" v-model="form.grantAmount" :disabled="!canEditGrant" :min="0" :max="999999999.99" :precision="2" :placeholder="canEditGrant ? '请填写预计支出的总金额' : '当前资金来源不可填写'" /><span>元</span></div><small>大写：{{ uppercaseMoney(form.grantAmount) }}</small></div>
            <div class="field"><label for="recruitment-fundraising">筹款金额</label><span v-if="projectFundingOnly" class="readonly-value">不适用</span><template v-else><div class="amount-input"><a-input-number id="recruitment-fundraising" v-model="form.fundraisingAmount" :disabled="!canEditFundraising" :min="0" :max="999999999.99" :precision="2" :placeholder="canEditFundraising ? '请填写筹款金额' : '当前资金来源不可填写'" /><span>元</span></div><small>大写：{{ uppercaseMoney(form.fundraisingAmount) }}</small></template></div>
            <div class="field full"><label for="recruitment-summary">招募简述</label><a-textarea id="recruitment-summary" v-model="form.summary" :auto-size="{ minRows: 4, maxRows: 12 }" placeholder="请填写招募简述" /></div>
            <div class="field full"><div class="organization-selects"><div class="organization-select-control"><label for="recruitment-organization">指定机构</label><a-dropdown :visible="organizationDropdownVisible" :trigger="['click']" placement="bottomLeft" :overlay-style="{ width: organizationDropdownWidth + 'px' }" @visibleChange="changeOrganizationDropdown"><button id="recruitment-organization" ref="organizationTrigger" type="button" class="organization-trigger"><span>{{ selectedOrganizationName }}</span><a-icon type="down" /></button><div slot="overlay" class="organization-dropdown-panel" @mousedown.stop @click.stop><a-input ref="organizationSearchInput" v-model="organizationSearch" allow-clear placeholder="请输入机构名称搜索" aria-label="搜索指定机构" @keydown.native.stop /><div class="organization-options"><button type="button" :class="['organization-option', { selected: form.organizationId === unspecifiedOrganizationId }]" @click="selectOrganization(unspecifiedOrganizationId)">不指定</button><button v-for="organization in visibleOrganizations" :key="organization.id" type="button" :class="['organization-option', { selected: form.organizationId === organization.id }]" @click="selectOrganization(organization.id)">{{ organization.name }}</button><p v-if="organizationSearch.trim() && !visibleOrganizations.length">未找到匹配的机构</p></div></div></a-dropdown></div><div class="organization-select-control"><span class="field-label">指定机构的二级组织</span><a-select v-if="secondaryOrganizations.length" v-model="form.secondaryOrganizationId" aria-label="二级组织"><a-select-option :value="unspecifiedSecondaryOrganizationId">不指定</a-select-option><a-select-option v-for="organization in secondaryOrganizations" :key="organization.id" :value="organization.id">{{ organization.name }}</a-select-option></a-select><span v-else class="source-not-applicable">无可指定的二级组织</span></div></div></div>
            <div class="field"><label for="recruitment-start"><em>*</em> 招募开始日期</label><a-date-picker id="recruitment-start" v-model="form.startDate" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="请选择开始日期" /></div>
            <div class="field"><label for="recruitment-end"><em>*</em> 招募结束日期</label><a-date-picker id="recruitment-end" v-model="form.endDate" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :disabled-date="disabledEndDate" placeholder="请选择结束日期" /></div>
            <div class="field full cover-field"><label><em>*</em> 招募头图 <span class="label-note">优先选择方图，建议分辨率 300 × 300</span></label><div class="cover-picker"><div v-if="coverUrl" class="cover-preview" tabindex="0" aria-label="点击重新选择招募头图" @click="$refs.coverInput.click()" @keydown.enter="$refs.coverInput.click()" @keydown.space.prevent="$refs.coverInput.click()"><img :src="coverUrl" alt="招募头图预览" /><div class="cover-preview-mask"><button type="button" class="cover-delete-button" aria-label="删除招募头图" @click.stop="removeCover"><a-icon type="delete" /> 删除</button></div></div><button v-else type="button" class="cover-placeholder" aria-label="上传招募头图" @click="$refs.coverInput.click()"><a-icon type="plus" /><span>上传</span></button><div><p v-if="form.cover">{{ form.cover.name }}</p><small>支持 JPG、PNG、WebP，单张不超过 5 MB</small></div></div><input ref="coverInput" class="file-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="选择招募头图" @change="selectCover" /></div>
          </div>
        </section>
        <section class="panel form-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="contacts" /></span><div><h2>联系信息</h2></div></div>
          <div class="form-fields">
            <div class="field"><label for="recruitment-contact"><em>*</em> 联系人姓名</label><a-input id="recruitment-contact" v-model="form.contactName" placeholder="请填写联系人姓名" :max-length="80" /></div>
            <div class="field"><label for="recruitment-phone"><em>*</em> 联系手机号</label><div class="phone-input"><a-select v-model="form.phonePrefix" aria-label="手机国际区号"><a-select-option v-for="prefix in ['+86', '+1', '+852', '+853', '+886']" :key="prefix">{{ prefix }}</a-select-option></a-select><a-input id="recruitment-phone" v-model="form.phone" placeholder="请填写手机号码" :max-length="15" /></div></div>
            <div class="field"><label for="recruitment-landline">办公室座机</label><a-input id="recruitment-landline" v-model="form.landline" placeholder="请填写座机号码" :max-length="40" /></div>
            <div class="field"><label for="recruitment-email">联系邮箱</label><a-input id="recruitment-email" v-model="form.email" placeholder="请填写电子邮箱" :max-length="200" /></div>
          </div>
        </section>
        <section class="panel form-section">
          <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2></div></div>
          <a-empty v-if="!form.attachments.length" class="attachment-empty" description="点击添加附件" role="button" tabindex="0" @click="$refs.attachmentInput.click()" @keydown.enter.native.prevent="$refs.attachmentInput.click()" @keydown.space.native.prevent="$refs.attachmentInput.click()" />
          <template v-else><div class="attachment-list form-attachment-list"><div v-for="file in form.attachments" :key="file.id"><div><strong>{{ file.name }}</strong><span>附件 · {{ formatSize(file.file.size) }} · {{ file.time }}</span></div><a-button type="link" class="attachment-action" @click="previewAttachment(file)">预览</a-button><a-button type="link" class="attachment-action" @click="downloadAttachment(file)">下载</a-button><a-button type="link" class="attachment-action danger-link" @click="removeAttachment(file)">删除</a-button></div></div><a-button class="add-more-attachment" type="dashed" icon="plus" @click="$refs.attachmentInput.click()">添加更多附件</a-button></template>
          <input ref="attachmentInput" class="file-input" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip" aria-label="选择附件" @change="selectAttachments" />
          <p class="attachment-note">支持 PDF、Word、Excel、PowerPoint、图片及 ZIP，单个文件不超过 20 MB。</p>
        </section>
      </fieldset>
    </a-spin>
    <footer class="form-footer"><span><a-icon type="info-circle" /> {{ dirty ? '填写内容尚未提交' : savedAt ? '已保留本地提交记录，可继续修改' : '填写完成后提交招募信息' }}</span><div><a-button :disabled="saving" @click="goBack">取消</a-button><a-button type="primary" :loading="saving" :disabled="loading" @click="submit">提交</a-button></div></footer>
    <a-modal v-model="submittedVisible" title="招募信息已保存在本地" :mask-closable="false" :footer="null"><p>“{{ form.name }}”已通过填写校验。当前为前端演示，信息与附件仅保存在当前浏览器，尚未实际发布招募。</p><div class="result-actions"><a-button @click="submittedVisible = false">继续编辑</a-button><a-button type="primary" @click="goBack">返回</a-button></div></a-modal>
    <a-modal v-model="previewVisible" :title="previewName" :width="960" :mask-closable="false" :footer="null" @afterClose="clearPreview"><img v-if="previewType === 'image'" :src="previewUrl" :alt="previewName" class="attachment-preview-image" /><iframe v-else-if="previewType === 'pdf'" :src="previewUrl" :title="previewName" class="attachment-preview-pdf"></iframe><p v-else>此格式请下载后使用对应办公软件查看。</p></a-modal>
  </section>
</template>

<script>
import { uppercaseMoney } from '../mock/project-drafts'
import { recruitmentAccount, projectRecruitmentStrategies, jointRecruitmentStrategy, jointRecruitmentTopics, unspecifiedOrganizationId, unspecifiedSecondaryOrganizationId, recruitmentDirections, recruitmentOrganizations, createRecruitmentForm, validateRecruitmentForm, recruitmentLocalRecord } from '../mock/recruitment-form'

export default {
  name: 'RecruitmentForm',
  data () {
    return { form: createRecruitmentForm(), account: recruitmentAccount, organizations: recruitmentOrganizations, unspecifiedOrganizationId, unspecifiedSecondaryOrganizationId, organizationSearch: '', organizationDropdownVisible: false, organizationDropdownWidth: 0, errors: [], dirty: false, loading: true, saving: false, submittedVisible: false, savedAt: '', coverUrl: '', attachmentSequence: 0, previewVisible: false, previewName: '', previewUrl: '', previewType: '' }
  },
  computed: {
    isJoint () { return this.form.type === '联合公益' },
    projectFundingOnly () { return this.form.type === '项目' && this.form.fundingSource === '项目' },
    canEditGrant () { return this.form.type === '项目' && ['项目', '项目+筹款'].includes(this.form.fundingSource) },
    canEditFundraising () { return this.isJoint || (this.form.type === '项目' && this.form.fundingSource === '项目+筹款') },
    strategies () { return this.form.type === '项目' ? projectRecruitmentStrategies : this.isJoint ? [jointRecruitmentStrategy] : [] },
    topics () { return this.isJoint && this.form.strategy === jointRecruitmentStrategy ? jointRecruitmentTopics : recruitmentDirections.filter(item => item.type === this.form.type && item.strategy === this.form.strategy).map(item => item.topic) },
    visibleOrganizations () { const search = this.organizationSearch.trim().toLowerCase(); return search ? this.organizations.filter(item => item.name.toLowerCase().includes(search)) : [] },
    selectedOrganizationName () { const organization = this.organizations.find(item => item.id === this.form.organizationId); return organization ? organization.name : '不指定' },
    secondaryOrganizations () { const organization = this.organizations.find(item => item.id === this.form.organizationId); return organization ? organization.children : [] }
  },
  watch: { form: { deep: true, handler () { if (!this.loading) this.dirty = true } } },
  async mounted () {
    window.addEventListener('beforeunload', this.beforeUnload)
    try {
      const saved = await recruitmentLocalRecord()
      if (saved) {
        this.form = Object.assign(createRecruitmentForm(), saved.form)
        if (!this.form.organizationId) this.form.organizationId = unspecifiedOrganizationId
        if (!this.form.secondaryOrganizationId) this.form.secondaryOrganizationId = unspecifiedSecondaryOrganizationId
        if (this.form.type === '联合公益') {
          this.form.fundingSource = '筹款'; this.form.grantAmount = null
          this.form.strategy = jointRecruitmentStrategy
          if (!jointRecruitmentTopics.includes(this.form.topic)) this.form.topic = undefined
          this.syncFundraisingMethod()
        } else if (this.form.type === '项目') {
          if (!['项目', '项目+筹款'].includes(this.form.fundingSource)) this.form.fundingSource = '项目'
          if (this.form.fundingSource === '项目') this.form.fundraisingAmount = null
        }
        this.savedAt = saved.savedAt
        if (this.form.cover) this.coverUrl = URL.createObjectURL(this.form.cover.file)
      }
    } catch (error) { this.$message.warning('无法读取本地记录，可继续填写；提交时将重新尝试保存') }
    await this.$nextTick()
    this.loading = false
  },
  beforeDestroy () { window.removeEventListener('beforeunload', this.beforeUnload); if (this.coverUrl) URL.revokeObjectURL(this.coverUrl); this.clearPreview() },
  beforeRouteLeave (to, from, next) {
    if (this.saving) { next(false); return }
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '放弃发布招募？', content: '本次未提交的填写内容不会保留。', maskClosable: false, okText: '放弃', cancelText: '继续填写', onOk: () => next(), onCancel: () => next(false) })
  },
  methods: {
    uppercaseMoney,
    changeType () {
      this.form.strategy = undefined; this.form.topic = undefined
      this.form.fundingSource = this.isJoint ? '筹款' : undefined
      this.form.fundraisingMethod = this.isJoint ? '' : '不适用'
      this.form.grantAmount = null; this.form.fundraisingAmount = null; this.form.managementFee = 5
    },
    changeFundingSource () { if (this.form.fundingSource === '项目') this.form.fundraisingAmount = null },
    changeStrategy () { this.form.topic = undefined; if (this.isJoint) this.form.fundraisingMethod = '' },
    changeTopic () { this.syncFundraisingMethod() },
    syncFundraisingMethod () {
      if (!this.isJoint) { this.form.fundraisingMethod = '不适用'; return }
      this.form.fundraisingMethod = this.form.topic === jointRecruitmentTopics[0] ? '月捐' : this.form.topic === jointRecruitmentTopics[1] ? '次捐' : ''
    },
    changeOrganization () { this.form.secondaryOrganizationId = unspecifiedSecondaryOrganizationId; this.organizationSearch = '' },
    selectOrganization (organizationId) { this.form.organizationId = organizationId; this.changeOrganization(); this.organizationDropdownVisible = false },
    changeOrganizationDropdown (visible) {
      if (visible && this.$refs.organizationTrigger) this.organizationDropdownWidth = this.$refs.organizationTrigger.offsetWidth
      this.organizationDropdownVisible = visible
      if (!visible) { this.organizationSearch = ''; return }
    },
    disabledEndDate (date) { return !!this.form.startDate && date.format('YYYY-MM-DD') < this.form.startDate },
    removeCover () { if (this.coverUrl) URL.revokeObjectURL(this.coverUrl); this.coverUrl = ''; this.form.cover = null },
    selectCover (event) {
      const file = event.target.files[0]; event.target.value = ''
      if (!file) return
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) { this.$message.error('请选择 5 MB 以内的有效 JPG、PNG 或 WebP 图片'); return }
      const url = URL.createObjectURL(file)
      const image = new Image()
      image.onload = () => { this.removeCover(); this.form.cover = { name: file.name, file }; this.coverUrl = url }
      image.onerror = () => { URL.revokeObjectURL(url); this.$message.error('图片无法读取，请重新选择') }
      image.src = url
    },
    selectAttachments (event) {
      const files = Array.from(event.target.files); event.target.value = ''
      files.forEach(file => {
        if (!/\.(pdf|docx?|xlsx?|pptx?|png|jpe?g|zip)$/i.test(file.name) || file.size > 20 * 1024 * 1024 || !file.size) { this.$message.error(file.name + '：文件格式不支持、内容为空或超过 20 MB'); return }
        if (this.form.attachments.some(item => item.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified)) { this.$message.info(file.name + ' 已添加'); return }
        this.attachmentSequence += 1
        this.form.attachments.push({ id: 'attachment-' + Date.now() + '-' + this.attachmentSequence, name: file.name, time: this.localTime(), file })
      })
    },
    formatSize (size) { return size >= 1024 * 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB' },
    previewAttachment (file) { this.clearPreview(); this.previewName = file.name; this.previewType = /\.(png|jpe?g)$/i.test(file.name) ? 'image' : /\.pdf$/i.test(file.name) ? 'pdf' : 'office'; this.previewUrl = URL.createObjectURL(file.file); this.previewVisible = true },
    downloadAttachment (file) { const url = URL.createObjectURL(file.file); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) },
    clearPreview () { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = '' },
    removeAttachment (file) { this.form.attachments = this.form.attachments.filter(item => item.id !== file.id) },
    localTime () { const now = new Date(); const pad = value => String(value).padStart(2, '0'); return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) },
    async submit () {
      if (this.saving || this.loading) return
      this.errors = validateRecruitmentForm(this.form)
      if (this.errors.length) { this.$nextTick(() => this.$el.querySelector('.validation-summary').scrollIntoView({ block: 'center', behavior: 'smooth' })); return }
      this.saving = true
      try {
        const savedAt = this.localTime()
        await recruitmentLocalRecord({ form: this.form, savedAt })
        this.savedAt = savedAt; this.dirty = false; this.submittedVisible = true
      } catch (error) { this.$message.error('本地保存失败，内容仍保留在页面中，请检查浏览器存储空间后重试') }
      finally { this.saving = false }
    },
    beforeUnload (event) { if (this.dirty || this.saving) { event.preventDefault(); event.returnValue = '' } },
    goBack () { this.$router.push({ name: this.$route.query.from === 'dashboard-see' ? 'dashboard-see' : 'available-projects' }) }
  }
}
</script>

<style scoped>
.recruitment-form-page { display: grid; gap: 20px; min-width: 0; color: #18253c; padding-bottom: 18px; }
.form-body { display: grid; gap: 20px; min-width: 0; padding: 0; margin: 0; border: 0; }.form-body:disabled { pointer-events: none; }
.form-section { overflow: hidden; }.form-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 4px 22px 22px; }
.field { display: grid; align-content: center; gap: 7px; min-width: 0; min-height: 76px; padding: 17px 18px; border-bottom: 1px solid #edf1f5; }.full { grid-column: 1 / -1; }
.field label, .field-label { color: #7b899b; font-weight: 400; line-height: 1.6; }em { color: #ff4d4f; font-style: normal; margin-right: 3px; }
.readonly-value { display: block; padding: 7px 12px; color: #27384e; font-size: 16px; font-weight: 500; overflow-wrap: anywhere; }
.field > .ant-select, .field > .ant-calendar-picker { width: 100%; }.field small { color: #718095; font-size: 14px; line-height: 1.6; }
.field >>> .ant-input, .field >>> .ant-input-number, .field >>> .ant-select-selection { border-color: transparent; background: transparent; box-shadow: none; }
.field >>> .ant-input:hover, .field >>> .ant-input-number:hover, .field >>> .ant-select-selection:hover { border-color: #d9e1eb; }
.field >>> .ant-input:focus, .field >>> .ant-input-number-focused, .field >>> .ant-select-focused .ant-select-selection { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.field >>> input.ant-input, .field >>> .ant-input-number-input { height: 40px; padding: 0 12px; font-size: 16px; font-weight: 500; color: #27384e; }.field >>> .ant-input-number { height: 40px; }
.field >>> textarea.ant-input { padding: 7px 12px; color: #27384e; font-size: 16px; line-height: 1.7; }
.field >>> .ant-select-selection--single { height: 40px; }.field >>> .ant-select-selection__rendered { margin: 0 12px; line-height: 38px; font-size: 16px; color: #27384e; font-weight: 500; }
.field >>> input::placeholder, .field >>> textarea::placeholder { font-size: 14px; color: #5b8ff9; opacity: 1; }.field >>> .ant-select-selection__placeholder, .empty-hint { color: #5b8ff9; font-size: 14px; font-weight: 400; }
.field >>> .ant-select-disabled .ant-select-selection, .field >>> .ant-input-number-disabled { background: #f8fafc; }
.source-not-applicable { display: block; padding: 7px 12px; color: #5b8ff9; font-size: 14px; font-weight: 400; line-height: 24px; }
.amount-input { display: flex; align-items: center; gap: 8px; }.amount-input .ant-input-number { width: 260px; max-width: calc(100% - 28px); }
.organization-selects { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px; }.organization-select-control { display: grid; align-content: start; gap: 7px; min-width: 0; }.organization-select-control > .ant-select { width: 100%; }.organization-trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; height: 40px; padding: 0 12px; border: 1px solid transparent; border-radius: 4px; color: #27384e; background: transparent; font-size: 16px; font-weight: 500; text-align: left; cursor: pointer; }.organization-trigger:hover { border-color: #d9e1eb; }.organization-trigger:focus { border-color: #1677ff; outline: 0; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }.organization-trigger .anticon { color: rgba(0,0,0,.25); font-size: 12px; }.organization-dropdown-panel { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 4px; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.15); }.organization-options { max-height: 240px; margin-top: 8px; overflow-y: auto; }.organization-option { display: block; width: 100%; min-height: 36px; padding: 7px 12px; border: 0; color: rgba(0,0,0,.65); background: transparent; text-align: left; cursor: pointer; }.organization-option:hover, .organization-option:focus { background: #e6f7ff; outline: 0; }.organization-option.selected { color: #1890ff; font-weight: 500; background: #fafafa; }.organization-options p { margin: 0; padding: 10px 12px; color: #9aa7b7; }.phone-input { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; }
.label-note { margin-left: 8px; font-size: 14px; color: #718095; }.cover-picker { display: flex; align-items: center; gap: 20px; padding: 8px 12px; }.cover-preview, .cover-placeholder { width: 112px; height: 112px; flex: none; border-radius: 10px; }.cover-preview { position: relative; overflow: hidden; cursor: pointer; }.cover-preview img { display: block; width: 100%; height: 100%; object-fit: cover; }.cover-preview-mask { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(15, 35, 58, .62); opacity: 0; transition: opacity .18s ease; }.cover-preview:hover .cover-preview-mask, .cover-preview:focus .cover-preview-mask, .cover-preview:focus-within .cover-preview-mask { opacity: 1; }.cover-delete-button { height: 32px; padding: 0 12px; border: 1px solid rgba(255,255,255,.78); border-radius: 4px; color: #fff; background: rgba(255,77,79,.88); cursor: pointer; }.cover-delete-button:hover, .cover-delete-button:focus { background: #ff4d4f; }.cover-picker > div { min-width: 0; }.cover-picker p { margin: 8px 0; overflow-wrap: anywhere; }.cover-picker small { display: block; }.cover-placeholder { display: grid; place-content: center; gap: 10px; border: 1px dashed #b9c9dd; background: #f8fbff; color: #5b8ff9; cursor: pointer; }.cover-placeholder .anticon { font-size: 24px; }.cover-placeholder:hover { border-color: #1677ff; }
.file-input { display: none; }.danger-link { color: #ff4d4f; }.attachment-empty { margin: 22px; padding: 24px 0; cursor: pointer; border-radius: 8px; }.attachment-empty >>> .ant-empty-description { color: #5b8ff9; font-size: 14px; }.attachment-empty:focus-visible, .cover-placeholder:focus-visible, .cover-preview:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.form-attachment-list > div { grid-template-columns: minmax(0, 1fr) auto auto auto; }.form-attachment-list strong { overflow-wrap: anywhere; }.form-attachment-list .attachment-action { height: auto; padding: 0 6px; border: 0; border-radius: 0; color: #1890ff; background: transparent; box-shadow: none; font-weight: 400; }.form-attachment-list .attachment-action:hover, .form-attachment-list .attachment-action:focus { color: #40a9ff; background: transparent; }.form-attachment-list .attachment-action.danger-link, .form-attachment-list .attachment-action.danger-link:hover, .form-attachment-list .attachment-action.danger-link:focus { color: #ff4d4f; }.add-more-attachment { width: calc(100% - 44px); margin: 0 22px 12px; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }.attachment-note { margin: 0 24px 22px; color: #718095; }.attachment-preview-image { display: block; max-width: 100%; margin: auto; }.attachment-preview-pdf { width: 100%; height: 65vh; border: 0; }
.form-footer { position: sticky; bottom: 0; z-index: 5; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }.form-footer > span { color: #718095; }.form-footer > div, .result-actions { display: flex; gap: 12px; }.result-actions { justify-content: flex-end; margin-top: 24px; }.form-footer .ant-btn { min-width: 100px; }.ant-btn { height: 32px; box-shadow: 0 2px 0 rgba(0,0,0,.043); }.recruitment-form-page .detail-back { height: 38px; padding: 0 16px; box-shadow: 0 3px 10px rgba(23,56,92,.05); }
.validation-summary { background: #fff6f5; color: #cf1322; border: 1px solid #ffd3d0; border-radius: 12px; padding: 20px 24px; display: flex; gap: 12px; }.validation-summary .anticon { margin-top: 4px; }.validation-summary ul { padding-left: 18px; margin: 8px 0 0; line-height: 1.8; }
</style>
