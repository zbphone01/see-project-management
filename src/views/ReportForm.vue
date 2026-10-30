<template>
  <section class="standard-edit-scope project-form-page report-form-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>

    <section class="panel form-section">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>{{ draft.type }}{{ draft.requestNeeded ? '（需要请款）' : '' }}</h2><p v-if="hasBasicReviewComments">请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见</p><div class="basic-meta"><span class="project-code"><a-icon type="flag" /> {{ draft.projectCode }}</span><span class="report-code"><a-icon type="file-text" /> {{ draft.reportCode }}</span></div></div></div>
      <div class="form-fields description-grid">
        <div class="field full project-name-field project-name-item"><span class="basic-field-label">项目名称</span><span class="basic-field-value">{{ draft.projectName }}</span></div>
        <div class="field"><span class="basic-field-label">项目类型</span><span class="basic-field-value">{{ draft.projectType }}</span></div>
        <div class="field"><span class="basic-field-label">项目策略</span><span class="basic-field-value">{{ draft.strategy }}</span></div>
        <div class="field"><span class="basic-field-label">项目议题</span><span class="basic-field-value">{{ draft.issue }}</span></div>
        <div class="field"><span class="basic-field-label">执行机构</span><span class="basic-field-value">{{ draft.organization }}</span></div>
        <div class="field"><span class="basic-field-label">项目执行周期</span><span class="basic-field-value">{{ draft.projectPeriod }}</span></div>
        <div class="field execution-period" :class="reviewClass('reportPeriod')"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('reportPeriod')"><em>*</em> 本报告执行周期</review-comment-label></label><div class="date-pair"><a-date-picker class="execution-date-picker" :value="draft.periodStart || null" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="请选择开始日期" aria-label="报告开始日期" :locale="executionDateLocale" :month-cell-content-render="renderExecutionMonth" dropdown-class-name="project-execution-calendar" @change="draft.periodStart = $event || ''" /><span>至</span><a-date-picker class="execution-date-picker" :value="draft.periodEnd || null" value-format="YYYY-MM-DD" format="YYYY-MM-DD" placeholder="请选择结束日期" aria-label="报告结束日期" :locale="executionDateLocale" :month-cell-content-render="renderExecutionMonth" dropdown-class-name="project-execution-calendar" @change="draft.periodEnd = $event || ''" /></div></div>
        <div class="field full"><span class="basic-field-label">申请SEE基金会资金 / 筹款目标</span><span class="basic-field-value">{{ money(draft.funding) }} 元</span></div>
        <div class="field"><span class="basic-field-label">已执行预算金额（包括本报告提交的执行额）</span><span class="basic-field-value">{{ money(draft.executed) }} 元</span></div>
        <div class="field"><span class="basic-field-label">项目预算总执行率</span><span class="basic-field-value">{{ executionRate }}</span></div>
        <div class="field request-field" :class="reviewClass('request')"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('request')">本次报告请款</review-comment-label></label><div class="request-control"><a-checkbox v-model="draft.requestNeeded" @change="changeRequestNeeded">需要请款</a-checkbox><div class="amount-input"><a-input-number v-model="draft.requested" :disabled="!draft.requestNeeded" :min="0" :precision="2" placeholder="请输入请款金额" /><span>元</span></div></div></div>
        <div class="field"><span class="basic-field-label">本报告通过后请款比例</span><span class="basic-field-value">{{ requestRate }}</span></div>
        <div v-if="isCompletion" class="field"><span class="basic-field-label">直接或委托其他组织资助给受益人款物</span><span class="basic-field-value">{{ draft.beneficiaryAid }}</span></div>
        <div v-if="isCompletion" class="field" :class="draft.beneficiaryAid === '是' ? reviewClass('aidCompleted') : {}"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="draft.beneficiaryAid === '是' ? reviewComment('aidCompleted') : ''"><em>*</em> 已完成对受益人款物的资助</review-comment-label></label><div class="choice-with-hint"><a-radio-group v-model="draft.aidCompleted" class="binary-choice" :disabled="draft.beneficiaryAid !== '是'"><a-radio value="否">否</a-radio><a-radio value="是">是</a-radio></a-radio-group><span v-if="!draft.aidCompleted" class="empty-hint">请选择资助完成状态</span></div></div>
        <div class="field" :class="reviewClass('reporter')"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('reporter')"><em>*</em> 报告人</review-comment-label></label><a-input v-model="draft.reporter" placeholder="请填写报告人姓名" /></div>
        <div class="field" :class="reviewClass('contact')"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('contact')"><em>*</em> 联系方式</review-comment-label></label><a-input v-model="draft.contact" placeholder="请填写联系电话" /></div>
        <div class="field full report-filled-date" :class="reviewClass('filledAt')"><div class="report-filled-date-control"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('filledAt')"><em>*</em> 报告填写日期</review-comment-label></label><input v-model="draft.filledAt" :type="draft.filledAt ? 'date' : 'text'" placeholder="请选择报告填写日期" class="ant-input" aria-label="报告填写日期" @focus="$event.target.type = 'date'" @blur="!draft.filledAt && ($event.target.type = 'text')" /></div></div>
      </div>
    </section>

    <section class="panel form-section detail-section report-progress-section">
      <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>项目执行进展</h2><p v-if="hasProgressReviewComments">请检查并修改标红的最新进展内容，点击最新进展日期可查看具体审核意见</p></div></div>
      <div class="detail-module-content report-module-content">
      <div class="outputs-body">
        <article v-for="(output, outputIndex) in draft.outputs" :key="output.id" class="output-block">
          <div class="output-title"><span>产出 {{ outputIndex + 1 }}</span><strong>{{ output.name }}</strong></div>
          <div class="output-standard"><span>产出衡量标准</span><div><p>{{ output.standard }}</p></div></div>
          <div class="report-progress-records output-progress-records"><h3>产出执行进展</h3><div class="output-progress-list"><div v-for="entry in output.progressHistory" :key="entry.date" class="report-progress-entry"><time>{{ entry.date }}</time><p>{{ entry.content }}</p></div><div class="report-progress-entry is-latest"><time :class="{ 'report-date-hint': !draft.filledAt }"><review-comment-label overlay-class-name="report-edit-review-comment" :comment="progressReviewComment('outputs', output)">{{ draft.filledAt || '同报告填写日期' }}</review-comment-label></time><a-textarea v-model="output.progress" :class="progressReviewClass('outputs', output)" :rows="2" placeholder="请填写本报告周期内的产出执行进展" /></div></div></div>
          <section v-for="(activity, activityIndex) in output.activities" :key="activity.id" class="activity-card">
            <div><span>活动 {{ outputIndex + 1 }}.{{ activityIndex + 1 }}</span><strong>{{ activity.name }}</strong></div>
            <dl><div><dt>活动时间</dt><dd>{{ activity.period }}</dd></div><div><dt>活动地点</dt><dd>{{ activity.location }}</dd></div><div><dt>执行人员</dt><dd>{{ activity.people }}</dd></div></dl>
            <h3 class="report-activity-label">活动内容</h3><p>{{ activity.content }}</p>
            <div class="report-progress-records activity-progress-records"><h3>活动执行进展</h3><table class="activity-progress-table"><tbody><tr v-for="entry in activity.progressHistory" :key="entry.date"><td>{{ entry.date }}</td><td>{{ entry.content }}</td></tr><tr class="is-latest"><td :class="{ 'report-date-hint': !draft.filledAt }"><review-comment-label overlay-class-name="report-edit-review-comment" :comment="progressReviewComment('activities', activity)">{{ draft.filledAt || '同报告填写日期' }}</review-comment-label></td><td><a-textarea v-model="activity.progress" :class="progressReviewClass('activities', activity)" :rows="2" placeholder="请填写本报告周期内的活动执行进展" /></td></tr></tbody></table></div>
          </section>
        </article>
      </div>
      </div>
    </section>

    <section class="panel form-section other-info-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="read" /></span><div><h2>其他信息</h2><p v-if="hasOtherReviewComments">请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见</p></div></div>
      <div class="detail-module-content report-module-content">
      <div class="rich-fields"><div v-for="field in richFields" :key="field.key" class="field"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('otherInformation.' + field.key)">{{ field.label }}</review-comment-label></label><rich-editor v-model="draft[field.key]" :label="field.label" :class="reviewClass('otherInformation.' + field.key)" /></div></div>
      </div>
    </section>

    <section class="panel form-section communication-section">
      <div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="notification" /></span><div><h2>传播信息</h2><p v-if="reviewComment('communication')">请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见</p></div></div>
      <div class="detail-module-content report-module-content">
      <div class="rich-fields"><div class="field"><label><review-comment-label overlay-class-name="report-edit-review-comment" :comment="reviewComment('communication')">项目传播情况</review-comment-label></label><rich-editor v-model="draft.communication" :class="reviewClass('communication')" label="项目传播情况" /></div></div>
      </div>
    </section>

    <section class="panel form-section budget-section"><div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>在线预算表</h2></div></div><div class="detail-module-content report-module-content"><project-budget-editor v-model="draft.budget" :project-name="draft.projectName" report-mode hide-cost-type-analysis @open="openReportBudget" /></div></section>

    <section class="panel form-section benefits-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="environment" /></span><div><h2>收益指标成果</h2><p v-if="hasBenefitReviewComments">请检查并修改标红的项目信息，点击行任意位置可查看具体审核意见</p></div></div>
      <div class="detail-module-content report-module-content">
      <div class="benefit-groups"><a-button class="add-benefit-type" type="dashed" icon="plus" @click="addBenefitType">新增收益</a-button><section v-for="section in benefitSections" :key="section.key" class="benefit-group"><table class="detail-table benefits-table"><colgroup><col class="benefit-indicator" /><col v-for="column in section.columns" :key="column.key" /><col class="benefit-actions" /></colgroup><thead><tr><th>收益指标</th><th v-for="column in section.columns" :key="column.key">{{ column.label }}</th><th>操作</th></tr></thead><tbody><tr v-for="row in section.rows" :key="row.id" :class="{ 'review-row-has-comment': !!benefitReviewComment(section, row) }" v-bind="benefitReviewAttrs(section, row)" @click="openBenefitReview(section, row)" @keydown.enter.self.prevent="openBenefitReview(section, row)" @keydown.space.self.prevent="openBenefitReview(section, row)"><td>{{ section.title }}</td><td v-for="column in section.columns" :key="column.key">{{ section.key === 'document' && column.key === 'file' ? [row.file, row.edition].filter(Boolean).join(' / ') || '—' : row[column.key] === 0 ? 0 : row[column.key] || '—' }}{{ ['amount', 'distance'].includes(section.key) && column.key === section.key && row[column.key] !== null && row[column.key] !== undefined && row[column.key] !== '' ? (section.key === 'amount' ? ' 万元' : ' 公里') : '' }}{{ section.key === 'area' && column.key === 'area' ? ' ' + (row.areaUnit || '平方公里') : section.key === 'weight' && column.key === 'weight' ? ' ' + (row.weightUnit || '吨') : '' }}</td><td><a-button v-if="['roster', 'document'].includes(section.key)" type="link" @click.stop="$message.info('待后续技术开发')" @keydown.stop>查看</a-button><a-button v-else type="link" @click.stop="editBenefitExample(section, row)" @keydown.stop>编辑</a-button><a-button type="link" class="danger-link" @click.stop="removeBenefitExample(section, row)" @keydown.stop>删除</a-button></td></tr><tr class="benefit-add-row"><td :colspan="section.columns.length + 2"><a-button type="link" @click="addBenefitExample(section)">添加更多成果</a-button></td></tr></tbody></table></section></div>
      </div>
    </section>

    <section class="panel form-section attachment-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2></div></div>
      <div class="detail-module-content report-module-content">
      <a-empty v-if="!draft.attachments.length" class="output-empty-add attachment-empty-add" description="点击添加附件" role="button" tabindex="0" @click="openAttachmentModal" @keydown.enter.native.prevent="openAttachmentModal" @keydown.space.native.prevent="openAttachmentModal" />
      <template v-else><div class="attachment-list form-attachment-list"><div v-for="file in draft.attachments" :key="file.id"><div><strong>{{ file.name }}</strong><span>{{ file.category }} · {{ formatSize(file.size) }} · {{ file.time }}</span></div><a-button type="link" class="danger-link" @click="removeAttachment(file)">删除</a-button></div></div><a-button class="add-more-attachment" type="dashed" icon="plus" @click="openAttachmentModal">添加更多附件</a-button></template>
      </div>
    </section>

    <section v-if="draft.auditHistory.length" class="panel form-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <div class="detail-module-content report-module-content">
      <a-timeline class="audit-timeline">
        <a-timeline-item v-for="entry in draft.auditHistory" :key="entry.id" color="blue">
          <div class="audit-entry"><strong>审核结果：{{ entry.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ entry.time }} · {{ entry.reviewer || entry.account }}</span></div><div v-if="entry.remark" class="audit-result-details"><p><b>审核备注：</b>{{ entry.remark }}</p></div></div>
        </a-timeline-item>
      </a-timeline>
      </div>
    </section>

    <footer class="form-footer"><span><a-icon type="info-circle" /> {{ draft.savedAt ? '草稿内容已保留' : `请填写${draft.type}，可随时存为草稿` }}</span><div><a-button @click="goBack">取消</a-button><a-button icon="save" @click="save">存为草稿</a-button><a-button type="primary" @click="submit">提交{{ draft.type.replace('报告', '') }}</a-button></div></footer>

    <a-modal v-model="benefitReviewVisible" title="审核意见" :width="560" :mask-closable="false" :footer="null"><p class="benefit-review-text">{{ benefitReviewText }}</p><div class="benefit-review-actions"><a-button type="primary" @click="benefitReviewVisible = false">关闭</a-button></div></a-modal>
    <a-modal v-model="attachmentVisible" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" title="添加附件" :width="550" :mask-closable="false" :keyboard="false" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @ok="confirmAttachment" ok-text="上传" cancel-text="取消">
      <div class="area-picker attachment-picker"><div class="area-picker-row"><label for="report-attachment-category">附件类型</label><a-select dropdown-class-name="standard-edit-dropdown" id="report-attachment-category" v-model="attachmentDraft.category" placeholder="请选择附件类型"><a-select-option value="传播信息附件">传播信息附件</a-select-option><a-select-option value="财务票据">财务票据</a-select-option><a-select-option value="预算表">预算表</a-select-option><a-select-option value="其他附件">其他附件</a-select-option></a-select></div><div class="area-picker-row"><label>选择文件</label><div class="attachment-file-picker"><a-upload :before-upload="selectAttachment" :show-upload-list="false" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"><a-button icon="upload">选择文件</a-button></a-upload><span v-if="attachmentDraft.file">{{ attachmentDraft.file.name }}</span></div></div><p v-if="attachmentDraft.error" class="form-error" role="alert">{{ attachmentDraft.error }}</p></div>
    </a-modal>
    <a-modal v-model="benefitVisible" :wrap-class-name="'standard-form-modal standard-edit-scope standard-edit-modal' + (benefitMode === 'edit' ? ' report-benefit-edit-modal' : '')" :title="benefitMode === 'edit' ? '编辑收益' : '新增收益'" :width="550" :mask-closable="false" :keyboard="false" :body-style="{ maxHeight: '65vh', overflowY: 'auto' }" @ok="confirmBenefit" :ok-text="benefitMode === 'edit' ? '确认' : '添加'" :cancel-text="benefitMode === 'edit' ? '取消' : '关闭'">
      <div class="modal-form">
        <div class="modal-field"><label>收益指标</label><a-select dropdown-class-name="standard-edit-dropdown" v-model="benefitSectionKey" :disabled="benefitMode !== 'new'" placeholder="请选择" @change="changeBenefitIndicator"><a-select-option v-for="section in benefitSections" :key="section.key" :value="section.key">{{ section.title }}</a-select-option></a-select></div>
        <div v-for="field in activeBenefitFields" :key="field.key" class="modal-field"><label :for="'benefit-' + field.key">{{ field.label }}</label><div class="benefit-control">
          <a-select dropdown-class-name="standard-edit-dropdown" v-if="field.kind === 'select'" :id="'benefit-' + field.key" v-model="benefitDraft[field.key]" :disabled="benefitFieldLocked(field)" placeholder="请选择" :show-search="field.key === 'name'" option-filter-prop="children" @change="benefitOptionChanged(field)"><a-select-option v-for="option in benefitOptions(field)" :key="option" :value="option">{{ option }}</a-select-option></a-select>
          <a-input v-if="field.kind === 'select' && benefitDraft[field.key] === '其他'" v-model="benefitDraft[field.key + 'Other']" :disabled="benefitFieldLocked(field)" placeholder="选择其他时填写" />
          <a-cascader popup-class-name="standard-edit-dropdown" v-else-if="field.kind === 'region'" :id="'benefit-' + field.key" v-model="benefitDraft.regionPath" :options="benefitRegions" :disabled="benefitFieldLocked(field)" placeholder="请选择" @change="setBenefitRegion" />
          <div v-else-if="field.kind === 'number'" class="benefit-number"><a-input-number :id="'benefit-' + field.key" v-model="benefitDraft[field.key]" :min="0" :precision="field.integer ? 0 : 2" :placeholder="(benefitSectionKey === 'area' && field.key === 'planting') || (benefitSectionKey === 'species' && field.key === 'quantity') || (benefitSectionKey === 'people' && field.key === 'volunteers') ? '选填' : '请输入'" /><template v-if="benefitSectionKey === 'area' && field.key === 'area'"><span v-if="benefitDraft.ecosystem === '海洋'">平方公里</span><a-select dropdown-class-name="standard-edit-dropdown" v-else v-model="benefitDraft.areaUnit" class="benefit-area-unit" :disabled="benefitMode === 'edit'" aria-label="面积数量单位"><a-select-option value="亩">亩</a-select-option><a-select-option value="公顷">公顷</a-select-option><a-select-option v-if="benefitMode === 'edit' && benefitDraft.areaUnit === '平方公里'" value="平方公里">平方公里</a-select-option></a-select></template><span v-else-if="benefitSectionKey === 'weight' && field.key === 'weight'">{{ benefitDraft.weightUnit }}</span><span v-else-if="field.unit">{{ field.unit }}</span></div>
          <div v-else-if="field.kind === 'file'" class="benefit-file"><a-upload :before-upload="selectBenefitFile" :show-upload-list="false" :disabled="benefitFieldLocked(field)" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"><a-button icon="upload" :disabled="benefitFieldLocked(field)">点击上传</a-button></a-upload><span v-if="benefitDraft.file">{{ benefitDraft.file }}</span></div>
          <a-textarea v-else-if="field.key === 'remark'" :id="'benefit-' + field.key" v-model="benefitDraft[field.key]" :rows="2" :placeholder="benefitSectionKey === 'area' ? '填写种植数量后必填' : benefitSectionKey === 'species' ? '填写受益数量后必填' : '选填'" />
          <a-input v-else-if="field.kind !== 'select'" :id="'benefit-' + field.key" v-model="benefitDraft[field.key]" :disabled="benefitFieldLocked(field) || (field.key === 'latinName' && benefitDraft.name !== '其他')" :placeholder="field.key === 'latinName' ? '如有自动显示，中文名其他时选填' : field.key === 'edition' ? '选填' : '请填写' + field.label" />
          <p v-if="benefitErrors[field.key]" class="benefit-error" role="alert">{{ benefitErrors[field.key] }}</p>
        </div></div>
      </div>
    </a-modal>
  </section>
</template>

<script>
import { loadReportDraft, loadReviewedReportExample, saveReportDraft } from '../mock/report-drafts'
import { reviewText, rowReviewText } from '../utils/report-review'
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import ProjectBudgetEditor from '../components/ProjectBudgetEditor.vue'
import { budgetKey, readBudgetContext, normalizeBudget } from '../utils/project-budget'
import datePickerZhCN from 'ant-design-vue/es/date-picker/locale/zh_CN'

function cleanRichText (html) {
  const source = document.createElement('div'); source.innerHTML = html
  const allowed = ['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'TABLE', 'TBODY', 'TR', 'TD', 'TH', 'IMG']
  Array.from(source.querySelectorAll('*')).reverse().forEach(element => {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(element.tagName)) element.remove()
    else if (!allowed.includes(element.tagName)) element.replaceWith(...element.childNodes)
    else if (element.tagName === 'IMG') {
      if (!/^data:image\/(png|jpeg|gif|webp);base64,/i.test(element.getAttribute('src') || '')) element.remove()
      else Array.from(element.attributes).forEach(attribute => { if (!['src', 'alt'].includes(attribute.name)) element.removeAttribute(attribute.name) })
    } else Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name))
  })
  return source.innerHTML
}
const RichEditor = {
  props: ['value', 'label'],
  data () { return { composing: false, lastEmittedValue: null, lastInputHtml: null } },
  mounted () { this.$refs.editor.innerHTML = cleanRichText(this.value || '') },
  watch: {
    value (value) {
      if (this.composing || value === this.lastEmittedValue) return
      const editor = this.$refs.editor
      if (editor.innerHTML !== (value || '')) editor.innerHTML = cleanRichText(value || '')
      this.lastInputHtml = null
      this.lastEmittedValue = null
    }
  },
  methods: {
    update (event) {
      if (this.composing || (event && event.isComposing)) return
      const editor = this.$refs.editor
      const html = editor.innerHTML
      if (html === this.lastInputHtml) return
      this.lastInputHtml = html
      const value = editor.textContent.trim() || editor.querySelector('table,img') ? cleanRichText(html) : ''
      this.lastEmittedValue = value
      if (value !== this.value) this.$emit('input', value)
    },
    compositionStart () { this.composing = true },
    compositionEnd () { this.composing = false; this.update() },
    command (command) { this.$refs.editor.focus(); document.execCommand(command, false, null); this.update() },
    paste (event) {
      event.preventDefault()
      const clipboard = event.clipboardData
      if (!clipboard) return
      const images = Array.from(clipboard.items || []).filter(item => item.kind === 'file' && /^image\//i.test(item.type)).map(item => item.getAsFile()).filter(Boolean)
      if (images.length) { this.insertImages(images); return }
      document.execCommand('insertText', false, clipboard.getData('text/plain')); this.update()
    },
    chooseImage () { this.$refs.imageInput.click() },
    insertImage (event) { const file = event.target.files[0]; event.target.value = ''; if (file) this.insertImages([file]) },
    async insertImages (files) {
      const fragments = []
      for (const file of files) {
        if (!/^image\/(png|jpeg|gif|webp)$/i.test(file.type) || file.size > 1024 * 1024) { this.$message.error('请选择 1 MB 以内的 PNG、JPG、GIF 或 WebP 图片'); continue }
        const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) })
        fragments.push(`<img src="${data}" alt="${(file.name || '插入图片').replace(/["<>]/g, '')}"><p><br></p>`)
      }
      if (!fragments.length) return
      this.$refs.editor.focus(); document.execCommand('insertHTML', false, fragments.join('')); this.update()
    }
  },
  render (h) {
    const actions = [['bold', 'B', '加粗'], ['italic', 'I', '斜体'], ['underline', 'U', '下划线'], ['insertUnorderedList', '• 列表', '无序列表'], ['insertOrderedList', '1. 列表', '有序列表'], ['removeFormat', '清除格式', '清除格式']]
    const toolbar = actions.map(([command, text, label]) => h('button', { attrs: { type: 'button', title: label, 'aria-label': this.label + '：' + label }, on: { mousedown: event => event.preventDefault(), click: () => this.command(command) } }, text))
    toolbar.push(h('button', { attrs: { type: 'button', title: '插入图片', 'aria-label': this.label + '：插入图片' }, on: { mousedown: event => event.preventDefault(), click: this.chooseImage } }, '图片'))
    return h('div', { class: 'rich-editor' }, [h('div', { class: 'rich-toolbar' }, toolbar), h('input', { ref: 'imageInput', class: 'rich-image-input', attrs: { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp', 'aria-label': this.label + '：选择图片' }, on: { change: this.insertImage } }), h('div', { ref: 'editor', class: 'rich-editable', attrs: { contenteditable: 'true', role: 'textbox', 'aria-label': this.label, 'aria-multiline': 'true' }, on: { input: this.update, compositionstart: this.compositionStart, compositionend: this.compositionEnd, paste: this.paste, drop: event => event.preventDefault() } })])
  }
}
const emptyBenefit = () => ({ indicator: '', category: '', name: '', latinName: '', quantity: '', remark: '' })
const benefitSections = [
  { key: 'species', title: '物种', columns: [{ key: 'category', label: '分类' }, { key: 'name', label: '中文名' }, { key: 'latinName', label: '拉丁文名' }, { key: 'quantity', label: '受益数量' }, { key: 'remark', label: '备注' }], rows: [{ id: 'species-1', category: '动物', name: '东黑冠长臂猿', latinName: 'Nomascus nasutus', quantity: '12', remark: '完成重点栖息地监测' }] },
  { key: 'area', title: '面积', columns: [{ key: 'region', label: '地区' }, { key: 'name', label: '名称' }, { key: 'type', label: '类型' }, { key: 'ecosystem', label: '生态系统' }, { key: 'area', label: '面积' }, { key: 'planting', label: '种植数量' }, { key: 'remark', label: '备注' }], rows: [{ id: 'area-1', region: '四川省-雅安市-荥经县', name: '大熊猫栖息地', type: '生态修复', ecosystem: '森林', area: '100', planting: '—', remark: '重点修复区域' }] },
  { key: 'people', title: '人数', columns: [{ key: 'region', label: '地区' }, { key: 'type', label: '类型' }, { key: 'sessions', label: '场次' }, { key: 'participants', label: '参与人数' }, { key: 'reach', label: '触达人数' }, { key: 'volunteers', label: '志愿者数' }, { key: 'remark', label: '备注' }], rows: [{ id: 'people-1', region: '四川省-雅安市-荥经县', type: '自然教育', sessions: '10', participants: '1000', reach: '10000', volunteers: '10', remark: '社区公众参与' }] },
  { key: 'weight', title: '重量', columns: [{ key: 'type', label: '类型' }, { key: 'weight', label: '重量' }, { key: 'remark', label: '备注' }], rows: [{ id: 'weight-1', type: '减排碳当量', weight: '100', remark: '按项目核算口径统计' }] },
  { key: 'amount', title: '金额', columns: [{ key: 'type', label: '类型' }, { key: 'amount', label: '金额' }, { key: 'remark', label: '备注' }], rows: [{ id: 'amount-1', type: '生态系统服务价值', amount: '100', remark: '阶段评估值' }] },
  { key: 'distance', title: '距离', columns: [{ key: 'region', label: '地区' }, { key: 'type', label: '活动类型' }, { key: 'sessions', label: '活动次数' }, { key: 'participants', label: '参与人数' }, { key: 'distance', label: '距离' }, { key: 'remark', label: '备注' }], rows: [{ id: 'distance-1', region: '四川省-雅安市-荥经县', type: '巡护/监测', sessions: '10', participants: '20', distance: '1000', remark: '累计巡护里程' }] },
  { key: 'roster', title: '名单', columns: [{ key: 'name', label: '名称' }, { key: 'type', label: '类型' }, { key: 'description', label: '名单说明' }, { key: 'file', label: '名单文件' }, { key: 'remark', label: '备注' }], rows: [{ id: 'roster-1', name: '社区巡护员名单', type: '社区', description: '参与项目巡护的社区成员', file: '社区巡护员名单.xlsx', remark: '已核验' }] },
  { key: 'document', title: '文件材料', columns: [{ key: 'name', label: '名称' }, { key: 'type', label: '类型' }, { key: 'year', label: '年份' }, { key: 'file', label: '名单文件 / 版号' }, { key: 'remark', label: '备注' }], rows: [{ id: 'document-1', name: '栖息地监测报告', type: 'SEE支持出版—公开发行出版物', year: '2026', file: 'ISBNxxxxxxxxxxxxx', remark: '阶段成果材料' }] }
]

const benefitSelect = (key, label, options, required = true) => ({ key, label, kind: 'select', options, required })
const benefitNumber = (key, label, unit = '', required = true, integer = true) => ({ key, label, kind: 'number', unit, required, integer })
const benefitText = (key, label, required = true) => ({ key, label, kind: 'text', required })
const benefitRegion = { key: 'region', label: '地区', kind: 'region', required: true }
const benefitRemark = benefitText('remark', '备注', false)
const benefitSchemas = {
  species: [benefitSelect('category', '分类', ['保护动物', '保护植物']), benefitSelect('name', '中文名', []), benefitText('latinName', '拉丁文名', false), benefitNumber('quantity', '受益数量', '', false), benefitRemark],
  area: [benefitRegion, benefitText('name', '名称'), benefitSelect('type', '类型', ['生态修复', '保护地', '其他']), benefitSelect('ecosystem', '生态系统', ['森林', '草原', '海洋', '湿地', '农田', '城市', '荒漠']), benefitNumber('area', '面积数量', '平方公里', true, false), benefitNumber('planting', '种植数量', '', false), benefitRemark],
  people: [benefitRegion, benefitSelect('type', '活动类型', ['自然教育', '公众倡导', '会议/论坛', '培训', '其他']), benefitNumber('sessions', '场次'), benefitNumber('participants', '参与人数'), benefitNumber('reach', '触达人数'), benefitNumber('volunteers', '志愿者数', '', false), benefitRemark],
  weight: [benefitSelect('type', '类型', ['碳汇当量', '减排碳当量', '水效应量', '垃圾重量', '粮食重量', '其他']), benefitNumber('weight', '重量', '吨', true, false), benefitRemark],
  amount: [benefitSelect('type', '类型', ['绿色采购额', '生态系统服务价值', '其他']), benefitNumber('amount', '金额', '万元', true, false), benefitRemark],
  distance: [benefitRegion, benefitSelect('type', '活动类型', ['巡护/监测', '调查', '其他']), benefitNumber('sessions', '活动次数'), benefitNumber('participants', '参与人数'), benefitNumber('distance', '距离', '公里', true, false), benefitRemark],
  roster: [benefitText('name', '名称'), benefitSelect('type', '类型', ['社区', '企业', '行业', '商家', '伙伴', '其他']), benefitText('description', '名单说明'), { key: 'file', label: '上传名单', kind: 'file', required: true }, benefitRemark],
  document: [benefitText('name', '名称'), benefitSelect('type', '类型', ['行业标准', '科研论文', '提案', '倡导文件', 'SEE支持出版——公开发行出版物', 'SEE合作出版——公开发行出版物', 'SEE自行出版——公开发行出版物', '其他']), benefitText('year', '年份'), benefitSelect('materialType', '材料类型', ['电子版', '出版物（版号）']), benefitText('edition', '版号', false), { key: 'file', label: '上传材料', kind: 'file', required: false }, benefitRemark]
}
const benefitSpecies = [{ name: '蜂猴', latinName: 'Nycticebus bengalensis', category: '保护动物' }, { name: '东黑冠长臂猿', latinName: 'Nomascus nasutus', category: '保护动物' }, { name: '银杏', latinName: 'Ginkgo biloba', category: '保护植物' }]
const benefitRegions = [
  { value: '四川省', label: '四川省', children: [{ value: '雅安市', label: '雅安市', children: [{ value: '荥经县', label: '荥经县' }] }, { value: '成都市', label: '成都市', children: [{ value: '锦江区', label: '锦江区' }, { value: '青羊区', label: '青羊区' }] }] },
  { value: '青海省', label: '青海省', children: [{ value: '玉树藏族自治州', label: '玉树藏族自治州', children: [{ value: '囊谦县', label: '囊谦县' }, { value: '治多县扎河乡', label: '治多县扎河乡' }] }] },
  { value: '云南省', label: '云南省', children: [{ value: '昆明市', label: '昆明市', children: [{ value: '五华区', label: '五华区' }, { value: '盘龙区', label: '盘龙区' }] }] }
]

export default {
  name: 'ReportForm',
  components: { ProjectBudgetEditor, RichEditor, ReviewCommentLabel },
  props: { projectId: { type: [String, Number], required: true }, type: { type: String, default: 'progress' } },
  data () { return { draft: ['P-001006', 'P-001007'].includes(this.$route.query.example) ? loadReviewedReportExample(this.projectId, this.$route.query.example) : loadReportDraft(this.projectId, this.type, this.$route.query.draftId), benefitSections: JSON.parse(JSON.stringify(benefitSections)), attachmentVisible: false, attachmentDraft: { category: undefined, file: null, error: '' }, benefitVisible: false, benefitMode: 'new', benefitErrors: {}, benefitOriginal: null, benefitRegions, benefitSectionKey: null, benefitDraft: emptyBenefit(), benefitReviewVisible: false, benefitReviewText: '' } },
  created () {
    this.draft.type = this.type === 'completion' ? '结项报告' : '进展报告'
    if (this.draft.benefitsInitialized || this.draft.exampleReportId || this.draft.benefits.length) this.benefitSections.forEach(section => { section.rows = this.draft.benefits.filter(row => row.sectionKey === section.key || (!row.sectionKey && row.indicator === section.title)) })
  },
  activated () {
    if (String(this.draft.projectId) !== String(this.projectId) || this.draft.draftId !== this.$route.query.draftId || this.draft.type !== (this.type === 'completion' ? '结项报告' : '进展报告') || this.draft.exampleReportId !== this.$route.query.example) {
      this.draft = ['P-001006', 'P-001007'].includes(this.$route.query.example) ? loadReviewedReportExample(this.projectId, this.$route.query.example) : loadReportDraft(this.projectId, this.type, this.$route.query.draftId)
      this.benefitSections = JSON.parse(JSON.stringify(benefitSections))
      if (this.draft.benefitsInitialized || this.draft.exampleReportId || this.draft.benefits.length) this.benefitSections.forEach(section => { section.rows = this.draft.benefits.filter(row => row.sectionKey === section.key || (!row.sectionKey && row.indicator === section.title)) })
    }
    this.draft.type = this.type === 'completion' ? '结项报告' : '进展报告'
    const context = readBudgetContext(budgetKey({ params: { id: this.projectId }, query: { ...this.$route.query, reportBudget: '1' } }))
    if (context && context.report) { this.draft.budget = normalizeBudget(context.draft.budget); this.draft.executed = context.draft.executed }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.query.draftId !== from.query.draftId || to.params.id !== from.params.id || to.query.type !== from.query.type || to.query.example !== from.query.example) {
      this.draft = ['P-001006', 'P-001007'].includes(to.query.example) ? loadReviewedReportExample(to.params.id, to.query.example) : loadReportDraft(to.params.id, to.query.type === 'completion' ? 'completion' : 'progress', to.query.draftId)
      if (['progress', 'completion'].includes(to.query.type)) this.draft.type = to.query.type === 'completion' ? '结项报告' : '进展报告'
      this.benefitSections = JSON.parse(JSON.stringify(benefitSections))
      if (this.draft.benefitsInitialized || this.draft.exampleReportId || this.draft.benefits.length) this.benefitSections.forEach(section => { section.rows = this.draft.benefits.filter(row => row.sectionKey === section.key || (!row.sectionKey && row.indicator === section.title)) })
    }
    next()
  },
  computed: {
    executionDateLocale () { return { ...datePickerZhCN, lang: { ...datePickerZhCN.lang, monthFormat: 'M月' } } },
    hasBasicReviewComments () { return ['reportPeriod', 'request', 'reporter', 'contact', 'filledAt'].concat(this.isCompletion && this.draft.beneficiaryAid === '是' ? ['aidCompleted'] : []).some(key => !!this.reviewComment(key)) },
    richFields () { return [{ key: 'followup', label: '后续项目活动安排' }, { key: 'risks', label: '项目风险及其影响' }, { key: 'summary', label: '此阶段项目的优点、不足及其他需要说明的情况' }] },
    hasOtherReviewComments () { return this.richFields.some(field => !!this.reviewComment('otherInformation.' + field.key)) },
    hasBenefitReviewComments () { return this.benefitSections.some(section => section.rows.some(row => !!this.benefitReviewComment(section, row))) },
    hasProgressReviewComments () { return this.draft.outputs.some(output => !!this.progressReviewComment('outputs', output) || output.activities.some(activity => !!this.progressReviewComment('activities', activity))) },
    activeBenefitFields () { return benefitSchemas[this.benefitSectionKey] || [] },
    isCompletion () { return this.type === 'completion' },
    executionRate () { return this.ratio(this.draft.executed, this.draft.funding) },
    requestRate () { return this.ratio(Number(this.draft.paid || 0) + (this.draft.requestNeeded ? Number(this.draft.requested || 0) : 0), this.draft.funding) }
  },
  methods: {
    openReportBudget (event) {
      this.draft.benefits = this.benefitSections.reduce((rows, section) => rows.concat(section.rows.map(row => ({ ...row, sectionKey: section.key, indicator: section.title }))), [])
      this.draft.benefitsInitialized = true
      const query = { ...this.$route.query, reportBudget: '1', type: this.type, sheet: event.title === '人力成本分摊表' ? 'personnel' : event.title === '预算及执行汇总表' ? 'summary' : 'detail', mode: event.action === '填写执行' ? 'execution' : event.action === '预算调整' ? 'adjustment' : 'view' }
      const key = budgetKey({ params: { id: this.projectId }, query })
      try {
        saveReportDraft(this.draft)
        sessionStorage.setItem('see-budget-context:' + key, JSON.stringify({ report: true, draft: this.draft, returnTo: { name: 'report-form', params: { id: this.projectId }, query: { ...this.$route.query } } }))
        this.$router.push({ name: 'project-budget-form', params: { id: this.projectId }, query })
      } catch (error) { this.$message.error('无法保存报告预算上下文，请保留当前页面后重试') }
    },
    renderExecutionMonth (value) { return value.format('M月') },
    reviewComment (key) { return reviewText(this.draft.reviewComments, key) },
    reviewClass (key) { return { 'review-has-comment': !!this.reviewComment(key) } },
    benefitReviewComment (section, row) { return rowReviewText(this.draft.reviewComments, 'benefits.' + row.id, ['indicator'].concat(section.columns.map(column => column.key))) },
    benefitReviewAttrs (section, row) { return this.benefitReviewComment(section, row) ? { role: 'button', tabindex: 0 } : {} },
    openBenefitReview (section, row) { const text = this.benefitReviewComment(section, row); if (text) { this.benefitReviewText = text; this.benefitReviewVisible = true } },
    progressReviewComment (section, row) { return this.reviewComment(section + '.' + row.id) },
    progressReviewClass (section, row) { return { 'review-has-comment': !!this.progressReviewComment(section, row) } },
    goBack () { this.$router.go(-1) },
    money (value) { return (Number(value) || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    ratio (value, total) { return Number(total) ? (Number(value || 0) / Number(total) * 100).toFixed(1) + ' %' : '—' },
    changeRequestNeeded (event) { if (!event.target.checked) this.draft.requested = 0 },
    save () { this.draft.benefits = this.benefitSections.reduce((rows, section) => rows.concat(section.rows.map(row => ({ ...row, sectionKey: section.key, indicator: section.title }))), []); this.draft.benefitsInitialized = true; this.draft.savedAt = saveReportDraft(this.draft); this.$message.success('报告草稿已保存到当前浏览器') },
    submit () { this.$confirm({ title: `确认提交${this.isCompletion ? '结项' : '进展'}报告`, content: '提交报告后，项目状态将变更为进展或结项待审。如果本报告同时请款，报告审核通过后基金会进入付款流程，项目状态将自动变更为进展或结项已审。', maskClosable: false, okText: '确认提交', cancelText: '继续编辑' }) },
    openAttachmentModal () { this.attachmentDraft = { category: undefined, file: null, error: '' }; this.attachmentVisible = true },
    selectAttachment (file) { if (!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name) || file.size > 20 * 1024 * 1024) { this.attachmentDraft.error = '请选择 20 MB 以内的 PDF、Word、Excel 或图片文件'; this.attachmentDraft.file = null; return false }; this.attachmentDraft.file = file; this.attachmentDraft.error = ''; return false },
    confirmAttachment () { const { category, file } = this.attachmentDraft; if (!category || !file) { this.attachmentDraft.error = !category ? '请选择附件类型' : '请选择需要上传的文件'; return }; this.draft.attachments.push({ id: `attachment-${Date.now()}`, name: file.name, size: file.size, type: file.type, category, time: new Date().toLocaleString('zh-CN', { hour12: false }) }); this.attachmentVisible = false; this.$message.success('附件已加入，请存为草稿以保存附件列表') },
    formatSize (size) { return size >= 1024 * 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round((size || 0) / 1024)) + ' KB' },
    removeAttachment (file) { this.draft.attachments = this.draft.attachments.filter(item => item.id !== file.id) },
    openBenefitModal (section, row) {
      this.benefitMode = row ? 'edit' : section ? 'append' : 'new'
      this.benefitSectionKey = section ? section.key : 'species'
      this.benefitOriginal = row ? { ...row } : null
      this.resetBenefitDraft(row)
      this.benefitVisible = true
    },
    resetBenefitDraft (row) {
      const value = { regionPath: [], region: '', file: '', weightUnit: row ? row.weightUnit || '吨' : '吨', areaUnit: row ? row.areaUnit || '平方公里' : '亩' }
      this.activeBenefitFields.forEach(field => { value[field.key] = field.kind === 'number' ? null : undefined; if (field.kind === 'select') value[field.key + 'Other'] = '' })
      this.benefitDraft = Object.assign(value, row || {})
      this.activeBenefitFields.filter(field => field.kind === 'number').forEach(field => {
        const raw = this.benefitDraft[field.key]
        this.benefitDraft[field.key] = raw === '' || raw === null || raw === undefined || !isFinite(Number(raw)) ? null : Number(raw)
      })
      if (this.benefitSectionKey === 'species' && row) {
        if (row.category === '动物') this.benefitDraft.category = '保护动物'
        if (row.category === '植物') this.benefitDraft.category = '保护植物'
      }
      if (row && row.region) this.benefitDraft.regionPath = row.region.split('-')
      this.activeBenefitFields.filter(field => field.kind === 'select').forEach(field => {
        if (this.benefitDraft[field.key] && this.benefitOptions(field).indexOf(this.benefitDraft[field.key]) < 0) {
          this.benefitDraft[field.key + 'Other'] = this.benefitDraft[field.key]
          this.benefitDraft[field.key] = '其他'
        }
      })
      this.benefitErrors = {}
    },
    changeBenefitIndicator () { this.resetBenefitDraft() },
    benefitFieldLocked (field) { return this.benefitMode === 'edit' && field.kind !== 'number' && field.key !== 'remark' },
    benefitOptions (field) { return field.key === 'name' ? ['其他'].concat(benefitSpecies.filter(item => !this.benefitDraft.category || item.category === this.benefitDraft.category).map(item => item.name)) : field.options },
    benefitOptionChanged (field) {
      if (this.benefitSectionKey === 'weight' && field.key === 'type') this.benefitDraft.weightUnit = ['垃圾重量', '粮食重量'].indexOf(this.benefitDraft.type) >= 0 ? '公斤' : '吨'
      if (this.benefitSectionKey === 'area' && field.key === 'ecosystem') this.benefitDraft.areaUnit = this.benefitDraft.ecosystem === '海洋' ? '平方公里' : '亩'
      if (field.key === 'category') { this.benefitDraft.name = undefined; this.benefitDraft.nameOther = ''; this.benefitDraft.latinName = '' }
      if (field.key === 'name') { const species = benefitSpecies.find(item => item.name === this.benefitDraft.name); this.benefitDraft.latinName = species ? species.latinName : '' }
    },
    setBenefitRegion (values) { this.benefitDraft.region = values.join('-') },
    selectBenefitFile (file) {
      if (!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name) || file.size > 20 * 1024 * 1024) { this.$set(this.benefitErrors, 'file', '请选择20MB以内的PDF、Word、Excel或图片文件'); return false }
      this.benefitDraft.file = file.name; this.$delete(this.benefitErrors, 'file'); return false
    },
    confirmBenefit () {
      const section = this.benefitSections.find(item => item.key === this.benefitSectionKey)
      if (!section) return
      const errors = {}, value = this.benefitMode === 'edit' ? { ...this.benefitOriginal } : {}
      this.activeBenefitFields.forEach(field => {
        if (this.benefitFieldLocked(field)) return
        const raw = this.benefitDraft[field.key]
        const resolved = raw === '其他' ? this.benefitDraft[field.key + 'Other'] : raw
        if (field.required && (resolved === undefined || resolved === null || String(resolved).trim() === '')) errors[field.key] = '请填写' + field.label
        if (field.kind === 'number' && raw !== undefined && raw !== null && raw !== '' && (!isFinite(Number(raw)) || Number(raw) < 0 || (field.integer && Number(raw) % 1 !== 0))) errors[field.key] = '请输入有效的非负' + (field.integer ? '整数' : '数值')
        value[field.key] = resolved === undefined || resolved === null ? '' : resolved
      })
      if (this.benefitSectionKey === 'species' && this.benefitDraft.quantity !== null && this.benefitDraft.quantity !== undefined && this.benefitDraft.quantity !== '' && !String(this.benefitDraft.remark || '').trim()) errors.remark = '填写受益数量后必填'
      if (this.benefitSectionKey === 'area' && this.benefitDraft.planting !== null && this.benefitDraft.planting !== undefined && this.benefitDraft.planting !== '' && !String(this.benefitDraft.remark || '').trim()) errors.remark = '填写种植数量后请填写备注'
      if (this.benefitSectionKey === 'document' && this.benefitMode !== 'edit' && !/^\d{4}$/.test(String(this.benefitDraft.year || ''))) errors.year = '请输入四位年份'
      if (this.benefitSectionKey === 'area' && this.benefitMode !== 'edit') {
        value.areaUnit = this.benefitDraft.ecosystem === '海洋' ? '平方公里' : this.benefitDraft.areaUnit
        if (this.benefitDraft.ecosystem !== '海洋' && ['亩', '公顷'].indexOf(value.areaUnit) < 0) errors.area = '请选择亩或公顷'
      }
      if (this.benefitSectionKey === 'weight' && this.benefitMode !== 'edit') value.weightUnit = ['垃圾重量', '粮食重量'].indexOf(this.benefitDraft.type) >= 0 ? '公斤' : '吨'
      this.benefitErrors = errors
      if (Object.keys(errors).length) return
      if (this.benefitMode === 'edit') { const index = section.rows.findIndex(item => item.id === this.benefitOriginal.id); if (index < 0) return; this.$set(section.rows, index, value) }
      else { value.id = section.key + '-' + Date.now() + '-' + section.rows.length; section.rows.push(value) }
      this.benefitVisible = false
      this.$message.success('成果已更新，请存为草稿以保留修改')
    },
    addBenefitExample (section) { this.openBenefitModal(section) },
    editBenefitExample (section, row) { this.openBenefitModal(section, row) }
    ,removeBenefitExample (section, row) { section.rows = section.rows.filter(item => item.id !== row.id) }
    ,addBenefitType () { this.openBenefitModal() }
  }
}
</script>

<style scoped>
.project-form-page { display: grid; gap: 20px; min-width: 0; padding-bottom: 18px; color: #18253c; }
.form-section { overflow: hidden; }.form-section .detail-section-header > .ant-btn { height: 32px; border-radius: 6px; }
.basic-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 7px; }.basic-meta > span { padding: 2px 7px; border-radius: 3px; line-height: 20px; font-weight: 400; }.basic-meta .anticon { margin-right: 5px; }.project-code { color: #62bfe6; background: #effaff; }.report-code { color: #5b8ff9; background: #f0f5ff; }
.form-fields.description-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; padding: 0 22px 22px; }.field { min-width: 0; display: flex; flex-direction: column; gap: 8px; }.full { grid-column: 1 / -1; }.form-fields > .field { min-height: 76px; padding: 17px 18px; display: grid; align-content: center; gap: 8px; border-bottom: 1px solid #edf1f5; }.field label, .basic-field-label { color: #7b899b; font-weight: 400; line-height: 1.6; }.basic-field-value { color: #27384e; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; } em { margin-right: 3px; color: #ff4d4f; font-style: normal; }

.report-filled-date-control { width: calc(50% - 18px); display: grid; gap: 8px; }
.date-pair { display: flex; gap: 12px; align-items: center; }.date-pair >>> .execution-date-picker { flex: 1; min-width: 0; width: 0; }.date-pair >>> .execution-date-picker .ant-input { width: 100%; }.date-pair > span { color: #718095; }.form-fields >>> input.ant-input, .form-fields .date-pair .ant-input { padding: 0 12px; border-color: transparent; background: transparent; color: #27384e; font-weight: 500; line-height: normal; box-shadow: none; }.form-fields >>> input.ant-input:hover, .form-fields .date-pair .ant-input:hover { border-color: #d9e1eb; }.form-fields >>> input.ant-input:focus, .form-fields .date-pair .ant-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.amount-input { display: flex; align-items: center; gap: 8px; }.amount-input >>> .ant-input-number { width: 190px; height: 40px; border-color: transparent; background: transparent; box-shadow: none; }.amount-input >>> .ant-input-number:hover { border-color: #d9e1eb; }.amount-input >>> .ant-input-number-focused { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }.amount-input >>> .ant-input-number-input { height: 38px; padding: 0 12px; color: #27384e; }.amount-input > span { color: #718095; }.form-fields >>> .binary-choice { min-height: 40px; line-height: 40px; }
.form-fields >>> .binary-choice .ant-radio-wrapper { display: inline-flex; align-items: center; line-height: 24px; }
.binary-choice >>> .ant-radio { display: block; flex: none; vertical-align: middle; }
.binary-choice >>> .ant-radio + span { display: block; line-height: 24px; }
.binary-choice >>> .ant-radio-wrapper + .ant-radio-wrapper { margin-left: 32px; }
.request-control { display: flex; align-items: center; gap: 16px; min-height: 40px; }.request-control > .ant-checkbox-wrapper { flex: none; }.request-control .amount-input { flex: 1; }.request-control .amount-input >>> .ant-input-number { width: 100%; max-width: 240px; }.request-control .amount-input >>> .ant-input-number-disabled { border-color: transparent; background: #f5f7fa; }
.choice-with-hint { display: flex; align-items: center; gap: 14px; min-height: 40px; }.empty-hint { color: #5b8ff9 !important; font-weight: 400; }
.report-date-hint { color: #5b8ff9 !important; font-weight: 400; }
.rich-fields .field { gap: 8px; }
.rich-fields { display: grid; gap: 32px; padding: 0; }
.other-info-section .rich-fields .field > label, .communication-section .rich-fields .field > label { color: #18253c; font-weight: 500; line-height: 1.6; }
.field >>> .rich-editor { overflow: hidden; border: 1px solid #d9e1eb; border-radius: 6px; }.field >>> .rich-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #e6ebf2; background: #fafbfd; }.field >>> .rich-toolbar button { padding: 3px 9px; border: 0; border-radius: 4px; background: transparent; color: #536277; cursor: pointer; }.field >>> .rich-toolbar button:hover { color: #1677ff; background: #eaf3ff; }.field >>> .rich-toolbar button:first-child { font-weight: 800; }.field >>> .rich-toolbar button:nth-child(2) { font-style: italic; }.field >>> .rich-toolbar button:nth-child(3) { text-decoration: underline; }.field >>> .rich-image-input { display: none; }.field >>> .rich-editable { min-height: 138px; padding: 12px; line-height: 24px; outline: none; overflow-wrap: anywhere; }.field >>> .rich-editable:empty::before { content: '请填写' attr(aria-label); color: #5b8ff9; pointer-events: none; }.field >>> .rich-editable:focus { box-shadow: inset 0 0 0 1px #1677ff; }.field >>> .rich-editable p:last-child { margin-bottom: 0; }.field >>> .rich-editable table { width: 100%; margin: 10px 0; border-collapse: collapse; table-layout: fixed; }.field >>> .rich-editable td, .field >>> .rich-editable th { min-width: 80px; height: 36px; padding: 6px 8px; border: 1px solid #d9e1eb; vertical-align: top; }.field >>> .rich-editable img { display: block; width: auto; max-width: 400px; height: auto; max-height: 400px; margin: 10px 0; border-radius: 6px; object-fit: contain; }

.report-module-content .output-block + .output-block { margin-top: 24px; }
.report-module-content >>> .budget-sheet-list { padding: 0; }
.report-module-content >>> .budget-sheet-row:first-child { padding-top: 0; min-height: 60px; align-items: start; }
.form-attachment-list > div:first-child { min-height: 0; }
.outputs-body { display: block; padding: 0; }.report-progress-section .output-title strong, .report-progress-section .activity-card strong { min-width: 0; overflow-wrap: anywhere; }.report-progress-section .output-standard > div { padding-top: 4px; }.report-progress-section .activity-card > p { color: #18253c; white-space: pre-line; }.report-progress-section .activity-card > div:first-child > span { flex: none; }
.report-progress-records h3, .report-activity-label { margin: 0 0 12px; color: #18253c; }.report-progress-entry { position: relative; display: grid; grid-template-columns: 94px minmax(0, 1fr); align-items: start; gap: 16px; padding: 3px 0 11px; border-top: 0; }.report-progress-entry time { color: #18253c; font-variant-numeric: tabular-nums; line-height: 1.65; }.report-progress-entry p { position: relative; margin: 0; color: #18253c; line-height: 1.65; overflow-wrap: anywhere; }
.output-progress-records { display: grid; grid-template-columns: max-content minmax(0, 1fr); align-items: start; gap: 8px; margin: 0; padding: 16px 18px; border: 0; border-radius: 0; background: #fff; }.output-progress-records > h3 { width: max-content; margin: 0; padding: 4px 9px; border-radius: 6px; color: #1677ff; background: #edf5ff; line-height: 1.55; }.output-progress-list { min-width: 0; padding-top: 0; }.output-progress-list .report-progress-entry + .report-progress-entry { padding-top: 8px; border-top: 1px solid #edf1f5; }.output-progress-list .report-progress-entry.is-latest time { color: #1677ff; }
.activity-progress-records { margin: 18px 0 0; padding: 0; border: 0; border-radius: 0; background: transparent; }.activity-progress-records h3 { margin: 0 0 8px; color: #18a66a; }.activity-progress-table { width: 100%; border-collapse: collapse; table-layout: fixed; }.activity-progress-table td { padding: 10px 0; color: #18253c; vertical-align: top; line-height: 1.65; overflow-wrap: anywhere; }.activity-progress-table tr + tr td { border-top: 1px solid #edf1f5; }.activity-progress-table tr.is-latest td { color: #18a66a; }.activity-progress-table td:first-child { width: 110px; padding-right: 16px; font-variant-numeric: tabular-nums; white-space: nowrap; }.report-activity-label { margin-bottom: 6px; }
.report-progress-entry >>> textarea.ant-input, .activity-progress-table >>> textarea.ant-input { min-height: 54px; padding: 7px 10px; border-color: #d9e1eb; border-radius: 6px; color: #18253c; line-height: 24px; resize: vertical; }.report-progress-entry >>> textarea.ant-input:focus, .activity-progress-table >>> textarea.ant-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.attachment-section .detail-section-header { align-items: center; }.attachment-section .detail-section-header > div { display: flex; align-items: center; min-height: 40px; }.attachment-section .detail-section-header h2 { margin: 0; }.attachment-empty-add { margin: 0; padding: 24px; border: 1px dashed #d9e1eb; border-radius: 10px; cursor: pointer; }.attachment-empty-add >>> .ant-empty-description { color: #5b8ff9; }.attachment-empty-add:hover, .attachment-empty-add:focus { border-color: #1677ff; background: #f8fbff; outline: none; }.form-attachment-list > div { grid-template-columns: minmax(0, 1fr) auto; }.form-attachment-list strong { overflow-wrap: anywhere; }.form-attachment-list .ant-btn { padding: 0 6px; }.add-more-attachment { width: 100%; margin: 16px 0 0; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }.attachment-file-picker { min-width: 0; display: flex; align-items: center; gap: 12px; }.attachment-file-picker >>> .ant-upload .ant-btn { height: 40px; }
.attachment-file-picker > span { min-width: 0; color: #536277; overflow-wrap: anywhere; }.attachment-picker .form-error { grid-column: 2; margin: -4px 0 0; color: #ff4d4f; }.attachment-picker { display: grid; width: 470px; max-width: 100%; gap: 16px 18px; margin: 0 auto; padding: 0; grid-template-columns: max-content minmax(0, 1fr); }.attachment-picker .area-picker-row { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; column-gap: 18px; align-items: start; }.attachment-picker .area-picker-row .ant-select { width: 100%; }.danger-link { color: #ff4d4f; }
.budget-section .detail-section-header, .benefits-section .detail-section-header { align-items: center; }.budget-section .detail-section-header > div, .benefits-section .detail-section-header > div { min-height: 40px; display: flex; flex-direction: column; justify-content: center; }.budget-section .detail-section-header h2, .benefits-section .detail-section-header h2 { margin: 0; }.benefit-groups { display: grid; gap: 24px; padding: 0; }.benefit-group { min-width: 0; overflow-x: auto; overflow-y: hidden; border: 1px solid #e6ebf2; border-radius: 10px; background: #fff; }.benefits-table { min-width: 980px; table-layout: fixed; border: 0; }.benefits-table .benefit-indicator { width: 120px; }.benefits-table .benefit-actions { width: 130px; }.benefits-table th:first-child, .benefits-table td:first-child, .benefits-table th:last-child, .benefits-table td:last-child { text-align: center; }.benefits-table td { white-space: normal; line-height: 1.55; overflow-wrap: anywhere; }.benefits-table td:last-child { white-space: nowrap; }.benefits-table td:last-child .ant-btn { height: auto; padding: 0 7px; }.benefit-add-row td { padding: 8px 12px; text-align: center !important; background: #fff; }.benefit-add-row .ant-btn { height: 32px; }.add-benefit-type { width: 100%; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }.add-benefit-type:hover, .add-benefit-type:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }
.form-footer { position: sticky; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 24px; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); }.form-footer > span { color: #718095; }.form-footer > div { display: flex; gap: 12px; }.form-footer .ant-btn { min-width: 100px; }
.modal-form { display: grid; width: 470px; max-width: 100%; margin: 0 auto; gap: 16px 18px; padding: 0; grid-template-columns: max-content minmax(0, 1fr); }.modal-form .modal-field { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; column-gap: 18px; align-items: start; }.modal-form .modal-field > label, .attachment-picker .area-picker-row > label { display: block; min-width: 0; max-width: 140px; min-height: 40px; padding-top: 9px; color: #27384e; text-align: right; line-height: 22px; white-space: normal; overflow-wrap: anywhere; }
.modal-form .modal-field > :not(label), .attachment-picker .area-picker-row > :not(label) { min-width: 0; }.modal-field > .ant-select { width: 100%; }
@media (max-width: 1440px) { .form-fields.description-grid { padding-right: 18px; padding-left: 18px; }.form-activity dl { gap: 14px; } }

.benefit-control { min-width: 0; display: grid; gap: 8px; }
.benefit-control >>> .ant-select, .benefit-control >>> .ant-cascader-picker { width: 100%; }

.benefit-number { display: flex; gap: 8px; align-items: center; }
.benefit-number >>> .ant-input-number { flex: 1; min-width: 0; }

.benefit-number > span { white-space: nowrap; }
.benefit-file { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.benefit-file > span { overflow-wrap: anywhere; }
.benefit-error { margin: 0; color: #ff4d4f; line-height: 22px; }

.benefit-number >>> .benefit-area-unit { flex: 0 0 88px; width: 88px; }

.field >>> .rich-editor.review-has-comment .rich-editable { background: #fff1f0; }
.benefits-table tr.review-row-has-comment { cursor: pointer; }
.benefits-table tr.review-row-has-comment > td { background: #fff1f0; }
.benefits-table tr.review-row-has-comment:hover > td { background: #ffe7e5; }
.benefits-table tr.review-row-has-comment:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.benefit-review-text { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 16px; line-height: 24px; }
.benefit-review-actions { display: flex; justify-content: flex-end; }
</style>

<style>
.report-edit-review-comment { --review-comment-font-size: 16px; --review-comment-line-height: 24px; --review-comment-icon-size: 16px; --review-comment-icon-offset: 0px; }
.report-edit-review-comment .review-comment-bubble .anticon { flex: none; display: inline-flex; align-items: center; justify-content: center; height: 24px; }
</style>

<style>
.report-benefit-edit-modal .ant-input[disabled],
.report-benefit-edit-modal .ant-select-disabled .ant-select-selection-selected-value,
.report-benefit-edit-modal .ant-cascader-picker-disabled .ant-cascader-picker-label,
.report-benefit-edit-modal .ant-input-number-disabled .ant-input-number-input { color: rgba(0, 0, 0, 0.65); -webkit-text-fill-color: rgba(0, 0, 0, 0.65); }
</style>
