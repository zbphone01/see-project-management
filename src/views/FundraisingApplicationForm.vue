<template>
  <section class="standard-edit-scope project-detail-page fundraising-form-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="file-text" /></span><div><h2>{{ draft.recruitment || '招募名称' }} - 募捐申请书</h2><p v-if="basicFieldsOrdered.some(field => comment(field.key)) || basicRichContent.some(section => comment(section.key))">{{ fieldReviewHint }}</p></div></div>
      <div class="edit-grid">
        <div v-for="field in basicFieldsOrdered" :key="field.key" class="edit-field" :class="[{ wide: field.key === 'name' }, reviewClass(field.key)]">
          <label :for="'fundraising-' + field.key"><em v-if="field.key !== 'organization'">*</em><review-comment-label :comment="comment(field.key)">{{ basicFieldLabel(field) }}</review-comment-label></label>
          <a-input v-if="field.key === 'name'" :id="'fundraising-' + field.key" v-model="field.value" :max-length="200" placeholder="建议9个字，项目名称需具有项目代表性，体现项目急需要解决的社会问题" />
          <div v-else-if="field.key === 'fundraisingPeriod'" class="date-pair">
            <input id="fundraising-fundraisingPeriod" v-model="draft.periodStart" :type="draft.periodStart ? 'date' : 'text'" class="ant-input" placeholder="开始日期" aria-label="预计筹款开始日期" @focus="$event.target.type = 'date'" @blur="!draft.periodStart && ($event.target.type = 'text')" />
            <span>至</span><input v-model="draft.periodEnd" :type="draft.periodEnd ? 'date' : 'text'" class="ant-input" :min="draft.periodStart || undefined" placeholder="结束日期" aria-label="预计筹款结束日期" @focus="$event.target.type = 'date'" @blur="!draft.periodEnd && ($event.target.type = 'text')" />
          </div>
          <span v-else-if="field.key === 'organization'" :id="'fundraising-' + field.key" class="basic-field-value">{{ draft.organization || '暂无' }}</span>
          <a-input v-else :id="'fundraising-' + field.key" v-model="field.value" :max-length="field.key === 'phone' ? 25 : 100" :placeholder="field.key === 'leader' ? '请负责人姓名' : field.key === 'phone' ? '请填写联系电话' : '请填写' + basicFieldLabel(field)" />
        </div>
      </div>
      <div class="application-edit-content">
      <div v-for="section in basicRichContent" :key="section.key" class="section-body organization-introduction">
        <h3><review-comment-label :comment="comment(section.key)">{{ section.title }}</review-comment-label></h3>
        <fundraising-rich-editor :value="sectionHtml(section)" :label="section.title" :placeholder="contentHints[section.key]" :class="reviewClass(section.key)" @input="value => changeRichText(section, value)" @busy="value => editorBusy(section.key, value)" />
      </div>
      <div v-if="annualFundsSection" class="section-body basic-annual-funds">
        <h3 class="basic-annual-title">{{ annualFundsSection.title }}</h3>
        <p v-if="sectionHasReview(annualFundsSection)" class="annual-review-hint">{{ rowReviewHint }}</p>
        <p class="input-hint">按照由近到远的年份，清晰列出本机构过往1-3年的主要资金来源及各资金来源的资金量占机构该年度总收入的占比情况</p>
        <div v-for="year in draft.annualFunds" :key="year.year" class="annual-group">
          <div class="subheading"><h3>{{ year.year }}</h3></div>
          <div class="detail-table-wrap"><table class="detail-table entry-table annual-entry-table">
            <colgroup><col class="col-index" /><col /><col style="width: 180px" /><col style="width: 180px" /><col class="col-actions" /></colgroup>
            <thead><tr><th>序号</th><th>资金来源描述</th><th>资金量（万元）</th><th>机构年度总收入占比</th><th>操作</th></tr></thead>
            <tbody>
              <tr v-for="(row, index) in year.rows" :key="row.id" :class="rowClass('annualFunds', row)" v-bind="rowAttrs('annualFunds', row)" @click="openRowReview('annualFunds', row)" @keydown.enter.prevent="openRowReview('annualFunds', row)" @keydown.space.prevent="openRowReview('annualFunds', row)">
                <td>{{ index + 1 }}</td><td>{{ row.source }}</td><td class="number-cell">{{ numberText(row.amount, 4) }}</td><td class="number-cell">{{ numberText(row.ratio, 2) }}%</td>
                <td class="row-actions" @click.stop @keydown.stop><a-button type="link" @click.stop="openRow('annualFunds', year, row)">编辑</a-button><a-button type="link" class="danger-link" @click.stop="removeRow(year.rows, row, '资金来源')">删除</a-button></td>
              </tr>
              <tr v-if="annualEntries[year.year]" class="annual-input-row">
                <td>{{ year.rows.length + 1 }}</td>
                <td><a-input v-model="annualEntries[year.year].source" :aria-label="year.year + '资金来源描述'" placeholder="请填写资金来源描述" /></td>
                <td><a-input-number v-model="annualEntries[year.year].amount" :min="0" :max="1000000000" :aria-label="year.year + '资金量（万元）'" placeholder="请填写资金量" /></td>
                <td><a-input-number v-model="annualEntries[year.year].ratio" :min="0" :max="100" :aria-label="year.year + '机构年度总收入占比（%）'" placeholder="请填写占比（%）" /></td>
                <td class="row-actions" @click.stop @keydown.stop><a-button type="link" @click.stop="addAnnualEntry(year)">增加</a-button></td>
              </tr>
              <tr class="total-row"><td colspan="2">合计</td><td class="number-cell">{{ numberText(amountTotal(year.rows), 4) }}</td><td class="number-cell" :class="{ 'form-error': ratioTotal(year.rows) !== 100 }">{{ numberText(ratioTotal(year.rows), 2) }}%</td><td></td></tr>
            </tbody>
          </table></div>
          <p v-if="ratioTotal(year.rows) !== 100" class="form-error">本年度收入占比合计须为 100%，当前为 {{ ratioTotal(year.rows) }}%。</p>
        </div>
      </div>

    <div v-for="section in remainingContent" :key="section.key" class="section-body merged-input-section">
      <div v-if="section.type !== 'amounts'" class="merged-input-heading">
        <div><h3><review-comment-label :comment="comment(section.key)">{{ section.title }}</review-comment-label></h3><p v-if="sectionHasReview(section)" class="annual-review-hint">{{ section.type === 'fundDirections' ? rowReviewHint : fieldReviewHint }}</p></div>
        <span v-if="section.key === 'purpose'" class="word-count" :class="{ 'word-count-error': plainText(section).replace(/\s/g, '').length > 100 }">{{ plainText(section).replace(/\s/g, '').length }} / 100 字</span>
      </div>
      <div v-if="section.type === 'text'" class="section-body">
        <fundraising-rich-editor :value="sectionHtml(section)" :label="section.title" :placeholder="contentHints[section.key]" :class="reviewClass(section.key)" @input="value => changeRichText(section, value)" @busy="value => editorBusy(section.key, value)" />
      </div>

      <div v-else-if="section.type === 'amounts'" class="section-body">
        <p v-if="sectionHasReview(section)" class="annual-review-hint">{{ fieldReviewHint }}</p>
        <div class="edit-grid amount-grid"><div v-for="field in draft.amountFields" :key="field.key" class="edit-field" :class="reviewClass(field.key)">
          <label :for="'fundraising-' + field.key"><em>*</em><review-comment-label :comment="comment(field.key)">{{ field.label }}</review-comment-label></label>
          <div class="amount-input"><a-input-number :id="'fundraising-' + field.key" v-model="field.amount" :min="0" :max="1000000000" :precision="2" placeholder="输入数字" /><span>元</span></div>
          <small>大写：{{ uppercaseMoney(field.amount) }}</small>
          <p v-if="field.key === 'fundraisingTarget'" class="input-hint amount-target-hint">此目标按照年度计算，最长可按照3年做目标计划，最短为1年，金额需参考贵机构年度收支情况，避免过高/过低目标金额。</p>
        </div></div>
      </div>

      <div v-else-if="section.type === 'fundDirections'" class="section-body">
        <p class="input-hint">填写公募资金的整体支出方向以及资金分配比例，请注意该比例将直接影响慈善中国募捐备案、各平台项目上线预算、资金筹资到后的预算</p>
        <div class="detail-table-wrap"><table class="detail-table entry-table fund-direction-entry-table">
          <colgroup><col class="col-index" /><col style="width: 220px" /><col style="width: 140px" /><col /><col class="col-actions" /></colgroup>
          <thead><tr><th>序号</th><th>资金使用方向</th><th>资金分配比例</th><th>详细说明（具体支出）</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="(row, index) in draft.fundDirections" :key="row.id" :class="rowClass('fundDirections', row)" v-bind="rowAttrs('fundDirections', row)" @click="openRowReview('fundDirections', row)" @keydown.enter.prevent="openRowReview('fundDirections', row)" @keydown.space.prevent="openRowReview('fundDirections', row)">
              <td>{{ index + 1 }}</td><td>{{ row.direction }}</td><td class="number-cell">{{ numberText(row.ratio, 2) }}%</td><td class="multiline">{{ row.description }}</td>
              <td class="row-actions" @click.stop @keydown.stop><template v-if="row.editable !== false"><a-button type="link" @click.stop="openRow('fundDirections', null, row)">编辑</a-button><a-button type="link" class="danger-link" @click.stop="removeRow(draft.fundDirections, row, '资金使用方向')">删除</a-button></template><span v-else class="muted"><a-icon type="lock" /> 固定</span></td>
            </tr>
            <tr class="fund-direction-input-row">
              <td>{{ draft.fundDirections.length + 1 }}</td>
              <td><a-input v-model="fundDirectionEntry.direction" aria-label="资金使用方向" placeholder="请填写资金使用方向" /></td>
              <td><a-input-number v-model="fundDirectionEntry.ratio" :min="0" :max="100" aria-label="资金分配比例（%）" placeholder="比例（%）" /></td>
              <td><a-textarea v-model="fundDirectionEntry.description" :rows="1" aria-label="详细说明（具体支出）" placeholder="请填写具体支出" /></td>
              <td class="row-actions" @click.stop @keydown.stop><a-button type="link" @click.stop="addFundDirectionEntry">增加</a-button></td>
            </tr>
            <tr class="total-row"><td colspan="2">合计</td><td class="number-cell" :class="{ 'form-error': ratioTotal(draft.fundDirections) !== 100 }">{{ ratioTotal(draft.fundDirections) }}%</td><td colspan="2"></td></tr>
          </tbody>
        </table></div>
        <p v-if="ratioTotal(draft.fundDirections) !== 100" class="form-error">资金分配比例合计须为 100%，当前为 {{ ratioTotal(draft.fundDirections) }}%。</p>
      </div>
    </div>
      </div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="picture" /></span><div><h2><review-comment-label :comment="comment('images')">筹款图片</review-comment-label></h2><p class="input-hint image-module-hint">请使用美观、突出项目亮点、经过授权的图片，建议6张</p><p v-if="comment('images')">{{ fieldReviewHint }}</p></div></div>
      <div class="section-body" :class="reviewClass('images')"><div class="image-editor">
        <div v-for="item in draft.images" :key="item.id" class="image-item">
          <button type="button" class="image-button" :aria-label="'预览图片：' + item.alt" @click="openImage(item)"><img v-if="imageSource(item)" :src="imageSource(item)" :alt="item.alt" /><span v-else class="image-unavailable">图片不可用</span></button>
          <div class="image-preview-mask"><button type="button" class="image-delete-button" :aria-label="'删除图片：' + item.alt" @click.stop="removeRow(draft.images, item, '图片')"><a-icon type="delete" /> 删除</button></div>
        </div>
        <a-upload accept="image/png,image/jpeg,image/gif,image/webp" :before-upload="addImage" :show-upload-list="false" :disabled="busy"><button type="button" class="image-upload-placeholder" :disabled="busy" aria-label="上传筹款图片"><a-icon :type="uploading ? 'loading' : 'plus'" /><span>{{ uploading ? '上传中' : '上传' }}</span></button></a-upload>
      </div></div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2><review-comment-label :comment="comment('attachments')">附件</review-comment-label></h2><p><a href="#" @click.prevent="downloadTemplate">下载诚信承诺函模板</a></p><p v-if="attachmentHasReview">请检查并修改标红的项目信息，点击信息小标题或行任意位置可查看具体审核意见</p></div></div>
      <div class="section-body" :class="reviewClass('attachments')">
        <a-empty v-if="!draft.attachments.length" class="attachment-empty-add" description="点击添加附件" role="button" tabindex="0" @click="openAttachment(attachmentTypes[0])" @keydown.enter.native.prevent="openAttachment(attachmentTypes[0])" @keydown.space.native.prevent="openAttachment(attachmentTypes[0])" />
        <template v-else>
          <div class="attachment-list form-attachment-list">
            <div v-for="file in draft.attachments" :key="file.id" :class="rowClass('attachments', file)" v-bind="rowAttrs('attachments', file)" @click="openRowReview('attachments', file)" @keydown.enter.prevent="openRowReview('attachments', file)" @keydown.space.prevent="openRowReview('attachments', file)">
              <div><strong>{{ file.name }}</strong><span>{{ file.type }} · {{ file.uploadedAt }}<template v-if="file.size"> · {{ formatSize(file.size) }}</template></span></div>
              <a-button type="link" @click.stop="previewAttachment(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadAttachment(file)" @keydown.stop>下载</a-button><a-button type="link" class="danger-link" @click.stop="removeRow(draft.attachments, file, '附件')" @keydown.stop>删除</a-button>
            </div>
          </div>
          <a-button class="add-more-attachment" type="dashed" icon="plus" @click="openAttachment(attachmentTypes[0])">添加更多附件</a-button>
        </template>
      </div>
      </div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <div class="section-body"><a-timeline v-if="draft.auditHistory.length" class="audit-timeline">
        <a-timeline-item v-for="record in draft.auditHistory" :key="record.id" color="blue">
          <div class="audit-entry">
            <strong>审核结果：{{ record.result }}</strong>
            <div class="audit-result-row"><span class="audit-info-chip audit-time">{{ record.time }} · {{ record.account }}</span></div>
            <div v-if="record.remark" class="audit-result-details"><p><b>审核备注：</b>{{ record.remark }}</p></div>
          </div>
        </a-timeline-item>
      </a-timeline>
      <p v-else class="muted">暂无审核信息</p></div>
    </section>

    <a-modal wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :visible="rowEditor.visible" :title="rowEditorTitle" :width="550" :mask-closable="false" ok-text="保存" cancel-text="取消" @ok="saveRow" @cancel="rowEditor.visible = false">
      <div class="compact-modal-form">
        <div v-for="field in rowEditorFields" :key="field.key" class="modal-field"><label :for="'fundraising-row-' + field.key">{{ field.label }}</label><div>
          <a-input-number v-if="field.numeric" :id="'fundraising-row-' + field.key" v-model="rowEditor.value[field.key]" :min="0" :max="field.key === 'ratio' ? 100 : 1000000000" :precision="field.key === 'ratio' ? 2 : 4" :placeholder="field.placeholder" />
          <a-textarea v-else :id="'fundraising-row-' + field.key" v-model="rowEditor.value[field.key]" :rows="field.key === 'description' ? 3 : 2" :placeholder="field.placeholder" />
          <p v-if="rowEditor.errors[field.key]" class="form-error" role="alert">{{ rowEditor.errors[field.key] }}</p>
        </div></div>
      </div>
    </a-modal>
    <a-modal wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :visible="attachmentPicker.visible" title="上传附件" :width="550" :mask-closable="false" :confirm-loading="uploading > 0" :closable="!uploading" :keyboard="!uploading" :cancel-button-props="{ props: { disabled: uploading > 0 } }" ok-text="上传" cancel-text="取消" @ok="confirmAttachment" @cancel="closeAttachment">
      <div class="compact-modal-form"><div class="modal-field"><label for="fundraising-file-type">附件类型</label><a-select dropdown-class-name="standard-edit-dropdown" id="fundraising-file-type" v-model="attachmentPicker.category" :disabled="uploading > 0"><a-select-option v-for="category in attachmentTypes" :key="category" :value="category">{{ category }}</a-select-option></a-select></div>
        <div class="modal-field"><label>选择文件</label><div><a-upload accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" :before-upload="selectAttachment" :show-upload-list="false" :disabled="uploading > 0"><a-button icon="upload" :disabled="uploading > 0">选择文件</a-button></a-upload><p v-if="attachmentPicker.file" class="picked-file">{{ attachmentPicker.file.name }}</p><p class="muted file-hint">支持 PDF、Word、Excel、PNG、JPG，单个文件不超过 20 MB。</p><p v-if="attachmentPicker.error" class="form-error" role="alert">{{ attachmentPicker.error }}</p></div></div>
      </div>
    </a-modal>
    <a-modal :visible="!!previewImage" title="筹款图片" :width="900" :mask-closable="false" :footer="null" @cancel="previewImage = null"><img v-if="previewImage" class="preview-image" :src="previewImage.src" :alt="previewImage.alt" /></a-modal>
    <a-modal :visible="!!previewFile" :title="previewFile ? previewFile.name : '附件预览'" :width="900" :mask-closable="false" :footer="null" @cancel="clearPreview">
      <img v-if="previewType === 'image'" class="preview-image" :src="previewUrl" :alt="previewFile && previewFile.name" /><iframe v-else-if="previewType === 'pdf'" class="preview-pdf" :src="previewUrl" :title="previewFile && previewFile.name"></iframe><p v-else-if="previewType === 'missing'" class="muted">该示例附件未提供文件正文，请重新上传文件后预览或下载。</p><template v-else><p class="muted">此格式请下载后使用对应办公软件查看。</p><a-button icon="download" @click="downloadAttachment(previewFile)">下载附件</a-button></template>
    </a-modal>
    <a-modal :visible="!!rowReviewText" title="审核意见" :width="560" :mask-closable="false" @cancel="rowReviewText = ''"><p class="review-text">{{ rowReviewText }}</p><template slot="footer"><a-button type="primary" @click="rowReviewText = ''">关闭</a-button></template></a-modal>
    <a-modal :visible="validationErrors.length > 0" :width="550" :mask-closable="false" :closable="false" :keyboard="false" :footer="null" :body-style="{ padding: '36px 28px 28px' }">
      <div class="validation-heading"><a-icon type="close-circle" theme="filled" /><strong>请完善申请信息</strong></div><ul class="validation-errors"><li v-for="(error, index) in validationErrors" :key="index">{{ error }}</li></ul><div class="validation-action"><a-button type="primary" @click="validationErrors = []">关闭</a-button></div>
    </a-modal>
    <footer class="form-footer"><span><a-icon type="info-circle" /> {{ busy ? '文件处理中，请稍候' : dirty ? '填写内容尚未保存' : saved ? '草稿内容已保留' : '请填写募捐申请书，可随时存为草稿' }}</span><div><a-button :disabled="busy" @click="goBack">取消</a-button><a-button icon="save" :disabled="busy" @click="save">存为草稿</a-button><a-button type="primary" :disabled="busy" @click="submit">提交申请</a-button></div></footer>
  </section>
</template>

<script>
import example from '../mock/fundraising-application-detail.json'
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import FundraisingRichEditor from '../components/FundraisingRichEditor.vue'
import { cleanFundraisingRichText, paragraphsToRichText } from '../utils/fundraising-rich-text'
import { attachmentTypes, contentHints, clone, ratioTotal, loadFundraisingDraft, normalizeFundraising, saveFundraisingDraft, validateFundraising } from '../mock/fundraising-drafts'
import { uppercaseMoney, draftFile } from '../mock/project-drafts'

const rowFields = { annualFunds: ['source', 'amount', 'ratio'], fundDirections: ['direction', 'ratio', 'description'], attachments: ['name', 'type', 'uploadedAt'] }
export default {
  name: 'FundraisingApplicationForm',
  components: { ReviewCommentLabel, FundraisingRichEditor },
  data () {
    return {
      draft: normalizeFundraising(example), savedSnapshot: '', saved: false, rowReviewText: '', validationErrors: [], uploading: 0, busyEditors: {},
      attachmentTypes, contentHints, annualEntries: {}, fundDirectionEntry: { direction: '', ratio: null, description: '' },
      fieldReviewHint: '请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见',
      rowReviewHint: '请检查并修改标红的项目信息，点击行任意位置可查看具体审核意见',
      rowEditor: { visible: false, kind: '', year: '', id: '', value: {}, errors: {} },
      attachmentPicker: { visible: false, category: attachmentTypes[0], file: null, error: '' },
      previewImage: null, previewFile: null, previewUrl: '', previewType: '', imageUrls: {}
    }
  },
  computed: {
    dirty () { return JSON.stringify(this.draft) !== this.savedSnapshot },
    pendingAnnualEntries () { return Object.keys(this.annualEntries).some(key => { const row = this.annualEntries[key]; return !!row.source || (row.amount !== null && row.amount !== '') || (row.ratio !== null && row.ratio !== '') }) },
    pendingFundDirectionEntry () { const row = this.fundDirectionEntry; return !!row.direction || !!row.description || (row.ratio !== null && row.ratio !== '') },
    pendingEdits () { return (this.rowEditor.visible && JSON.stringify(this.rowEditor.value) !== this.rowEditor.snapshot) || (this.attachmentPicker.visible && !!this.attachmentPicker.file) },
    busy () { return this.uploading > 0 || Object.keys(this.busyEditors).some(key => this.busyEditors[key]) },
    basicFieldsOrdered () {
      const fields = this.draft.basicFields.filter(field => field.key !== 'organization')
      const periodIndex = fields.findIndex(field => field.key === 'fundraisingPeriod')
      fields.splice(periodIndex < 0 ? 1 : periodIndex + 1, 0, { key: 'organization', label: '申请机构', value: this.draft.organization })
      return fields
    },
    basicRichContent () { return ['organizationIntroduction', 'businessAchievements', 'experience'].map(key => this.draft.content.find(section => section.key === key)).filter(Boolean) },
    annualFundsSection () { return this.draft.content.find(section => section.key === 'annualFunds') },
    remainingContent () { return this.draft.content.filter(section => !['organizationIntroduction', 'businessAchievements', 'experience', 'annualFunds'].includes(section.key)) },
    basicHasReview () { return this.basicFieldsOrdered.some(field => !!this.comment(field.key)) || this.basicRichContent.some(section => !!this.comment(section.key)) },
    attachmentHasReview () { return !!this.comment('attachments') || this.draft.attachments.some(file => !!this.rowComment('attachments', file)) },
    rowEditorTitle () { return (this.rowEditor.id ? '编辑' : '新增') + (this.rowEditor.kind === 'annualFunds' ? '资金来源' : '资金使用方向') },
    rowEditorFields () {
      return this.rowEditor.kind === 'annualFunds'
        ? [{ key: 'source', label: '资金来源', placeholder: '请填写资金来源描述' }, { key: 'amount', label: '资金量', placeholder: '请填写金额（万元）', numeric: true }, { key: 'ratio', label: '收入占比', placeholder: '请填写比例（%）', numeric: true }]
        : [{ key: 'direction', label: '使用方向', placeholder: '请填写资金使用方向' }, { key: 'ratio', label: '分配比例', placeholder: '请填写比例（%）', numeric: true }, { key: 'description', label: '详细说明', placeholder: '请填写具体支出' }]
    }
  },
  created () { this.load() },
  mounted () { window.addEventListener('beforeunload', this.beforeUnload) },
  activated () { if (!this.dirty) this.load(); window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { window.removeEventListener('beforeunload', this.beforeUnload); this.clearPreview(); this.clearImages() },
  beforeDestroy () { window.removeEventListener('beforeunload', this.beforeUnload); this.clearPreview(); this.clearImages() },
  beforeRouteLeave (to, from, next) {
    if (this.pendingFundDirectionEntry) { this.$message.warning('请先增加或清空资金使用方向表格中的录入内容'); next(false); return }
    if (this.pendingAnnualEntries) { this.$message.warning('请先增加或清空年度资金表格中的录入内容'); next(false); return }
    if (this.busy) { this.$message.warning('文件正在处理中，请稍后再离开'); next(false); return }
    if (this.pendingEdits) { this.$message.warning('请先保存或取消弹窗中的修改'); next(false); return }
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '填写内容尚未保存', content: '是否保存为草稿后离开？', maskClosable: false, okText: '保存并离开', cancelText: '继续填写', onOk: () => next(this.save()), onCancel: () => next(false) })
  },
  methods: {
    uppercaseMoney, ratioTotal,
    load () {
      try { this.draft = loadFundraisingDraft(this.$route.params.id, this.$route.query.recruitment); this.saved = !!this.draft.savedAt } catch (error) { this.$message.warning('本地草稿无法读取，已保留当前资料，请检查浏览器存储') }
      const pastFundraising = this.draft.content.find(section => section.key === 'pastFundraising')
      if (pastFundraising && Array.isArray(pastFundraising.links) && pastFundraising.links.length) {
        const links = pastFundraising.links.map(link => [link.label, link.url].filter(Boolean).join('：'))
        this.$set(pastFundraising, 'html', this.sectionHtml(pastFundraising) + paragraphsToRichText(links))
        this.$delete(pastFundraising, 'links')
      }
      try {
        const demoKey = 'see-fundraising-organization-review-demo-v1'
        if (this.$route.params.id !== 'new-2' && !window.localStorage.getItem(demoKey)) {
          if (!this.comment('organizationIntroduction')) {
            this.$set(this.draft.reviewComments, 'organizationIntroduction', '请补充机构组织规模及主要业务内容。')
            this.draft.savedAt = saveFundraisingDraft(this.draft)
            this.saved = true
          }
          window.localStorage.setItem(demoKey, 'done')
        }
      } catch (error) { this.$message.warning('演示审核意见未能保存，请检查浏览器存储空间或权限') }
      this.savedSnapshot = JSON.stringify(this.draft)
      this.annualEntries = {}
      this.fundDirectionEntry = { direction: '', ratio: null, description: '' }
      this.draft.annualFunds.forEach(year => this.$set(this.annualEntries, year.year, { source: '', amount: null, ratio: null }))
      this.loadImages()
    },
    beforeUnload (event) { if (this.dirty || this.busy || this.pendingEdits || this.pendingAnnualEntries || this.pendingFundDirectionEntry) { event.preventDefault(); event.returnValue = '' } },
    goBack () { this.$router.push(this.$route.query.from === 'dashboard' ? { name: 'dashboard' } : { name: 'framework-agreements', query: { tab: 'fundraising' } }) },
    basicFieldLabel (field) { return field.label },
    comment (key) { const value = this.draft.reviewComments[key]; return typeof value === 'string' ? value.trim() : '' },
    reviewClass (key) { return { 'review-has-comment': !!this.comment(key) } },
    rowComment (section, row) {
      if (!row.id) return ''
      const prefix = section + '.' + row.id, known = (rowFields[section] || []).map(field => prefix + '.' + field)
      const extra = Object.keys(this.draft.reviewComments).filter(key => key.indexOf(prefix + '.') === 0 && known.indexOf(key) < 0).sort()
      return [prefix].concat(known, extra).map(key => this.comment(key)).filter(Boolean).join('\n')
    },
    rowClass (section, row) { return { 'review-row-has-comment': !!this.rowComment(section, row) } },
    rowAttrs (section, row) { return this.rowComment(section, row) ? { role: 'button', tabindex: 0, 'aria-label': '查看审核意见' } : {} },
    openRowReview (section, row) { const text = this.rowComment(section, row); if (text) this.rowReviewText = text },
    sectionHasReview (section) {
      if (section.type === 'annualFunds') return this.draft.annualFunds.some(year => year.rows.some(row => !!this.rowComment('annualFunds', row)))
      if (section.type === 'fundDirections') return this.draft.fundDirections.some(row => !!this.rowComment('fundDirections', row))
      if (section.type === 'amounts') return this.draft.amountFields.some(field => !!this.comment(field.key))
      return !!this.comment(section.key)
    },
    sectionHtml (section) { return Object.prototype.hasOwnProperty.call(section, 'html') ? cleanFundraisingRichText(section.html) : paragraphsToRichText(section.paragraphs) },
    plainText (section) { const node = document.createElement('div'); node.innerHTML = this.sectionHtml(section); return node.textContent || '' },
    changeRichText (section, value) { this.$set(section, 'html', cleanFundraisingRichText(value)) },
    editorBusy (key, value) { this.$set(this.busyEditors, key, value) },
    numberText (value, digits) { return value === null || value === '' ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: digits }) },
    amountTotal (rows) { return Math.round(rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) * 10000) / 10000 },
    nextId (prefix) { return 'fundraising-' + prefix + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) },
    addAnnualEntry (year) {
      const entry = this.annualEntries[year.year]
      if (!entry || !entry.source.trim()) return this.$message.warning('请填写资金来源描述')
      const validNumber = (value, max, precision) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && Math.abs(value * Math.pow(10, precision) - Math.round(value * Math.pow(10, precision))) < 0.00001
      if (!validNumber(entry.amount, 1000000000, 4)) return this.$message.warning('请填写有效资金量：0 至 10 亿元，最多四位小数')
      if (!validNumber(entry.ratio, 100, 2)) return this.$message.warning('请填写有效占比：0 至 100，最多两位小数')
      year.rows.push({ id: this.nextId('annualFunds'), source: entry.source.trim(), amount: entry.amount, ratio: entry.ratio })
      this.$set(this.annualEntries, year.year, { source: '', amount: null, ratio: null })
    },
    addFundDirectionEntry () {
      const entry = this.fundDirectionEntry
      if (!entry.direction.trim()) return this.$message.warning('请填写资金使用方向')
      if (typeof entry.ratio !== 'number' || !Number.isFinite(entry.ratio) || entry.ratio < 0 || entry.ratio > 100 || Math.abs(entry.ratio * 100 - Math.round(entry.ratio * 100)) >= 0.00001) return this.$message.warning('请填写有效比例：0 至 100，最多两位小数')
      if (!entry.description.trim()) return this.$message.warning('请填写具体支出')
      this.draft.fundDirections.push({ id: this.nextId('fundDirections'), direction: entry.direction.trim(), ratio: entry.ratio, description: entry.description.trim() })
      this.fundDirectionEntry = { direction: '', ratio: null, description: '' }
    },
    openRow (kind, year, row) {
      if (row && row.editable === false) return
      this.rowEditor = { visible: true, kind, year: year ? year.year : '', id: row ? row.id : '', value: row ? clone(row) : kind === 'annualFunds' ? { source: '', amount: null, ratio: null } : { direction: '', ratio: null, description: '' }, errors: {} }
      this.rowEditor.snapshot = JSON.stringify(this.rowEditor.value)
    },
    saveRow () {
      const editor = this.rowEditor, value = clone(editor.value), errors = {}
      this.rowEditorFields.forEach(field => {
        if (field.numeric) {
          const max = field.key === 'ratio' ? 100 : 1000000000
          if (typeof value[field.key] !== 'number' || !Number.isFinite(value[field.key]) || value[field.key] < 0 || value[field.key] > max) errors[field.key] = '请填写 0 至 ' + max + ' 之间的有效数值'
        } else { value[field.key] = String(value[field.key] || '').trim(); if (!value[field.key]) errors[field.key] = field.placeholder }
      })
      editor.errors = errors
      if (Object.keys(errors).length) return
      const year = this.draft.annualFunds.find(item => item.year === editor.year)
      const rows = editor.kind === 'annualFunds' ? year.rows : this.draft.fundDirections
      if (editor.id) { const index = rows.findIndex(row => row.id === editor.id); if (index >= 0) rows.splice(index, 1, value) }
      else { value.id = this.nextId(editor.kind); rows.push(value) }
      editor.visible = false
    },
    removeRow (rows, row, label) {
      if (row.editable === false) return
      this.$confirm({ title: '确认删除' + label, content: '删除后请存为草稿以保留修改。', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { const index = rows.findIndex(item => item.id === row.id); if (index >= 0) rows.splice(index, 1) } })
    },
    addImage (file) {
      if (this.busy) return false
      if (!/^image\/(png|jpeg|gif|webp)$/i.test(file.type) || !file.size || file.size > 1024 * 1024) { this.$message.warning('请选择 1 MB 以内的 PNG、JPG、GIF 或 WebP 图片'); return false }
      this.uploading++
      const id = this.nextId('image')
      draftFile('put', id, file).then(() => {
        this.$set(this.imageUrls, id, URL.createObjectURL(file))
        this.draft.images.push({ id, blobKey: id, src: '', alt: file.name })
      }).catch(() => this.$message.error('图片保存失败，请检查浏览器存储后重试')).finally(() => { this.uploading-- })
      return false
    },
    imageSource (item) { return item.blobKey ? this.imageUrls[item.id] || '' : item.src },
    openImage (item) { const src = this.imageSource(item); if (src) this.previewImage = { src, alt: item.alt }; else this.$message.warning('图片文件不可用，请重新上传') },
    clearImages () { this._imageLoadToken = {}; Object.keys(this.imageUrls).forEach(key => URL.revokeObjectURL(this.imageUrls[key])); this.imageUrls = {}; this.previewImage = null },
    loadImages () {
      this.clearImages()
      const token = this._imageLoadToken
      this.draft.images.filter(item => item.blobKey).forEach(async item => {
        try { const blob = await draftFile('get', item.blobKey); if (blob && token === this._imageLoadToken) this.$set(this.imageUrls, item.id, URL.createObjectURL(blob)) } catch (error) { /* Missing files show a re-upload affordance without blocking the draft. */ }
      })
    },
    filesIn (category) { return this.draft.attachments.filter(file => (attachmentTypes.indexOf(file.type) >= 0 ? file.type : '其他附件') === category) },
    openAttachment (category) { this.attachmentPicker = { visible: true, category, file: null, error: '' } },
    closeAttachment () { if (!this.uploading) this.attachmentPicker.visible = false },
    selectAttachment (file) {
      if (!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name) || file.size > 20 * 1024 * 1024) { this.attachmentPicker.error = '请选择 20 MB 以内的 PDF、Word、Excel 或图片文件'; this.attachmentPicker.file = null; return false }
      this.attachmentPicker.file = file; this.attachmentPicker.error = ''; return false
    },
    async confirmAttachment () {
      if (this.uploading) return
      const { file, category } = this.attachmentPicker
      if (!file) { this.attachmentPicker.error = '请选择需要上传的文件'; return }
      this.uploading++
      try {
        const id = this.nextId('file')
        await draftFile('put', id, file)
        this.draft.attachments.push({ id, blobKey: id, name: file.name, type: category, mime: file.type, size: file.size, uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }) })
        this.attachmentPicker.visible = false; this.$message.success('附件已加入，请存为草稿以保存附件列表')
      } catch (error) { this.attachmentPicker.error = '附件保存失败，请检查浏览器存储后重试' } finally { this.uploading-- }
    },
    formatSize (size) { return size >= 1024 * 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB' },
    async getFile (file) {
      if (!file || !file.blobKey) { this.$message.info('该示例附件未提供文件正文，请重新上传'); return null }
      try { const blob = await draftFile('get', file.blobKey); if (!blob) throw new Error('missing'); return blob } catch (error) { this.$message.error('本地附件已不可用，请重新上传'); return null }
    },
    async previewAttachment (file) {
      this.clearPreview()
      if (!file.blobKey) { this.previewType = 'missing'; this.previewFile = file; return }
      const blob = await this.getFile(file)
      if (!blob) return
      this.previewUrl = URL.createObjectURL(blob); this.previewType = /\.(png|jpe?g)$/i.test(file.name) ? 'image' : /\.pdf$/i.test(file.name) ? 'pdf' : 'office'; this.previewFile = file
    },
    async downloadAttachment (file) {
      const blob = await this.getFile(file); if (!blob) return
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
    },
    clearPreview () { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = ''; this.previewFile = null; this.previewType = '' },
    downloadTemplate () { this.$message.info('下载文件（作为示例）') },
    save () {
      if (this.busy) return false
      try { const savedAt = saveFundraisingDraft(this.draft); this.$set(this.draft, 'savedAt', savedAt); this.savedSnapshot = JSON.stringify(this.draft); this.saved = true; this.$message.success('草稿已保存到当前浏览器'); return true } catch (error) { this.$message.error('草稿保存失败，请检查浏览器存储空间或权限'); return false }
    },
    async submit () {
      if (this.busy) return
      const availableFiles = []
      this.uploading++
      try {
        for (const file of this.draft.attachments.filter(file => ['诚信承诺函', '项目上线文案'].includes(file.type) && file.blobKey)) {
          const blob = await draftFile('get', file.blobKey)
          if (blob && blob.size > 0) availableFiles.push(file.id)
        }
      } catch (error) { this.$message.error('必需附件无法读取，请重新上传后提交'); return } finally { this.uploading-- }
      const text = {}; this.draft.content.filter(section => section.type === 'text').forEach(section => { text[section.key] = this.plainText(section) })
      this.validationErrors = validateFundraising(this.draft, text, availableFiles)
      if (this.validationErrors.length) return
      this.$confirm({ title: '确认提交申请', content: '当前为本地演示。确认后保存申请资料并完成提交校验，尚未连接服务器。', maskClosable: false, okText: '确认提交', cancelText: '继续编辑', onOk: () => { if (this.save()) this.$success({ title: '申请校验通过', content: '资料已保存为本地草稿，尚未发送到服务器。', maskClosable: false, okText: '知道了' }) } })
    }
  }
}
</script>

<style scoped>
.fundraising-form-page { min-width: 0; color: #18253c; padding-bottom: 18px; }
.basic-field-value { color: #27384e; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
.edit-grid { padding: 0 22px 22px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; }
.edit-grid .wide { grid-column: 1 / -1; }
.edit-field { min-width: 0; min-height: 76px; padding: 17px 18px; display: grid; align-content: center; gap: 8px; border-bottom: 1px solid #edf1f5; }
.edit-field > label { color: #7b899b; font-weight: 400; line-height: 1.6; }
.edit-field >>> input.ant-input { height: 40px; padding: 0 12px; line-height: normal; }
em { color: #ff4d4f; font-style: normal; margin-right: 6px; }
.edit-field > .ant-input, .date-pair .ant-input, .amount-input >>> .ant-input-number { border-color: transparent; background: transparent; box-shadow: none; }
.edit-field > .ant-input:hover, .date-pair .ant-input:hover, .amount-input >>> .ant-input-number:hover { border-color: #d9e1eb; }
.edit-field > .ant-input:focus, .date-pair .ant-input:focus, .amount-input >>> .ant-input-number-focused { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.date-pair { display: flex; gap: 12px; align-items: center; }
.date-pair .ant-input { min-width: 0; width: calc(50% - 20px); }
.date-pair > span, .muted, .edit-field small { color: #718095; }
.edit-grid >>> .ant-input, .edit-grid >>> .ant-input-number-input { color: #27384e; }
.fundraising-form-page >>> input::placeholder, .fundraising-form-page >>> textarea::placeholder { color: #5b8ff9; opacity: 1; }
.section-body { padding: 24px; margin: 0; --detail-inner-padding: 0; }
.application-edit-content { padding: 24px; display: grid; gap: 32px; }
.application-edit-content .section-body { padding: 0; }
.organization-introduction h3 { margin: 0 0 8px; line-height: 1.6; }
.merged-input-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.merged-input-heading > div { flex: 1; min-width: 0; }
.merged-input-heading h3 { margin: 0 0 8px; line-height: 1.6; }
.word-count { flex: none; color: #718095; line-height: 1.6; white-space: nowrap; }
.word-count-error { color: #ff4d4f; }
.basic-annual-title { margin: 0 0 8px; line-height: 1.6; }
.annual-entry-table th:nth-child(3), .annual-entry-table td:nth-child(3) { text-align: right; }
.annual-entry-table th:nth-child(4), .annual-entry-table td:nth-child(4) { text-align: center; }
.annual-input-row .ant-input-number { width: 100%; }
.annual-input-row td:nth-child(3) >>> input, .annual-input-row td:nth-child(4) >>> input { text-align: left; }
.annual-review-hint { margin: 0 0 9px; color: #718095; line-height: 1.6; }
.input-hint { color: #5b8ff9; line-height: 1.7; margin: 0 0 16px; }
.subheading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
.subheading h3 { margin: 0; font-family: inherit; line-height: 1.6; }
.annual-group + .annual-group { margin-top: 16px; }
.detail-table-wrap { margin: 0; overflow-x: auto; }
.entry-table { table-layout: fixed; min-width: 760px; }
.col-index { width: 70px; }.col-actions { width: 130px; }
.entry-table td { vertical-align: middle; overflow-wrap: anywhere; }
.entry-table th:first-child, .entry-table td:first-child, .entry-table th:last-child, .entry-table td:last-child { text-align: center; }
.entry-table .number-cell { text-align: right; }
.fund-direction-entry-table th:nth-child(3), .fund-direction-entry-table td:nth-child(3) { text-align: center; }
.fund-direction-input-row .ant-input-number { width: 100%; }
.fund-direction-input-row td:nth-child(3) >>> input { text-align: left; }
.entry-table .row-actions { display: table-cell; white-space: nowrap; padding: 12px; }
.row-actions .ant-btn { padding: 0 7px; height: auto; }
.total-row > td { background: #f8fbff; font-weight: 600; }
.entry-table .total-row > td:first-child { text-align: left; }
.multiline { white-space: pre-wrap; }
.amount-grid { padding: 0; }
.amount-grid .edit-field { align-content: start; }
.amount-input { display: inline-flex; justify-self: start; align-items: center; gap: 8px; }
.amount-input >>> .ant-input-number { flex: none; width: 190px; height: 40px; }
.amount-input >>> .ant-input-number-input { height: 38px; padding: 0 12px; line-height: 38px; }
.amount-target-hint { margin: 0; }
.amount-input > span { color: #536277; }
.edit-field small { line-height: 1.6; }
.image-editor { display: flex; gap: 20px; flex-wrap: wrap; align-items: flex-start; }
.image-item { position: relative; flex: none; width: 112px; height: 112px; border-radius: 10px; overflow: hidden; }
.image-button { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; cursor: zoom-in; }
.image-button img { display: block; width: 100%; height: 100%; object-fit: cover; }
.image-unavailable { display: grid; place-items: center; width: 100%; height: 100%; border: 1px dashed #d9e1eb; color: #718095; }
.image-preview-mask { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(15,35,58,.62); opacity: 0; transition: opacity .18s ease; pointer-events: none; }
.image-item:hover .image-preview-mask, .image-item:focus-within .image-preview-mask { opacity: 1; }
.image-delete-button { pointer-events: auto; height: 32px; padding: 0 12px; border: 1px solid rgba(255,255,255,.78); border-radius: 4px; color: #fff; background: rgba(255,77,79,.88); cursor: pointer; }
.image-delete-button:hover, .image-delete-button:focus { background: #ff4d4f; }
.image-upload-placeholder { display: grid; place-content: center; gap: 10px; width: 112px; height: 112px; border: 1px dashed #b9c9dd; border-radius: 10px; background: #f8fbff; color: #5b8ff9; cursor: pointer; }
.image-upload-placeholder .anticon { font-size: 24px; }
.image-upload-placeholder:hover { border-color: #1677ff; }
.image-upload-placeholder:disabled { cursor: wait; opacity: .5; }
.image-upload-placeholder:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.detail-section-header .image-module-hint { color: #718095; margin: 4px 0 0; }
.image-button:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.form-attachment-list { padding: 0; }
.attachment-empty-add { margin: 0; cursor: pointer; }
.form-attachment-list > div:first-child { padding-top: 0; align-items: start; }
.attachment-empty-add >>> .ant-empty-description { color: #5b8ff9; }
.attachment-empty-add:focus-visible { outline: 2px solid #1677ff; outline-offset: 3px; }
.add-more-attachment { width: 100%; margin: 16px 0 0; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }
.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }
.form-attachment-list > div { grid-template-columns: minmax(0, 1fr) auto auto auto; }
.form-attachment-list strong { overflow-wrap: anywhere; }
.form-attachment-list .ant-btn { padding: 0 6px; }
.compact-modal-form { display: grid; gap: 16px; width: 470px; max-width: 100%; margin: 0 auto; padding: 0; }
.modal-field { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 18px; align-items: start; }
.modal-field > label { text-align: right; }
.modal-field .ant-input-number, .modal-field > .ant-select { width: 100%; }
.compact-modal-form >>> input::placeholder, .compact-modal-form >>> textarea::placeholder { color: #5b8ff9; }
.picked-file { margin: 10px 0 0; overflow-wrap: anywhere; }
.file-hint { margin: 10px 0 0; line-height: 1.6; }
.form-error { color: #ff4d4f !important; margin: 8px 0 0; line-height: 1.6; }
.preview-image { display: block; max-width: 100%; max-height: 70vh; margin: auto; object-fit: contain; }
.preview-pdf { width: 100%; height: 65vh; border: 0; }
.review-has-comment { background: #fff1f0 !important; }
.detail-table tr.review-row-has-comment > td, .form-attachment-list > .review-row-has-comment { background: #fff1f0; }
.detail-table tr.review-row-has-comment:hover > td, .form-attachment-list > .review-row-has-comment:hover { background: #ffe7e5; }
.review-row-has-comment { cursor: pointer; }
.review-row-has-comment:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.review-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
.validation-heading { display: flex; align-items: center; gap: 12px; }
.validation-heading .anticon { color: #ff4d4f; font-size: 22px; }
.validation-errors { margin: 14px 0 24px 34px; padding-left: 18px; color: #718095; line-height: 1.7; max-height: 50vh; overflow: auto; }
.validation-action { display: flex; justify-content: flex-end; }
.danger-link { color: #ff4d4f; }
.form-footer { position: sticky; bottom: 0; z-index: 5; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.form-footer > span { color: #718095; }.form-footer > div { display: flex; gap: 12px; }.form-footer .ant-btn { min-width: 100px; }
</style>
