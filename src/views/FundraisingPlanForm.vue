<template>
  <section v-if="draft" class="project-detail-page plan-form-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="file-text" /></span><div><h2>筹款规划申请 - {{ draft.planName }}</h2><div class="detail-basic-meta"><span class="plan-department"><a-icon type="cluster" /> {{ draft.department }}</span></div><p v-if="hasComments(basicKeys)">{{ fieldHint }}</p></div></div>
      <div class="edit-grid">
        <div class="edit-field wide" :class="fieldClass('name')"><label for="plan-form-name"><em>*</em><review-comment-label :comment="comment('name')">筹款规划申请名称</review-comment-label></label><a-input id="plan-form-name" v-model="draft.name" :max-length="200" placeholder="自定义填写，名称不可重复" /></div>
        <div class="edit-field" :class="fieldClass('planningPeriod')"><label><em>*</em><review-comment-label :comment="comment('planningPeriod')">规划周期</review-comment-label></label><div class="date-pair"><a-select v-model="draft.planningStart" placeholder="选择年份" aria-label="规划开始年份" show-search allow-clear><a-select-option v-for="year in years" :key="year" :value="year">{{ year }}年</a-select-option></a-select><span>至</span><a-select v-model="draft.planningEnd" placeholder="请选择结束年份" aria-label="规划结束年份" show-search allow-clear><a-select-option v-for="year in years" :key="year" :value="year">{{ year }}年</a-select-option></a-select></div></div>
        <div class="edit-field" :class="fieldClass('executionPeriod')"><label for="plan-execution-start"><em>*</em><review-comment-label :comment="comment('executionPeriod')">执行周期</review-comment-label></label><div class="date-pair"><input id="plan-execution-start" v-model="draft.executionStart" :type="draft.executionStart ? 'date' : 'text'" class="ant-input" placeholder="开始日期" aria-label="执行开始日期" @focus="$event.target.type = 'date'" @blur="!draft.executionStart && ($event.target.type = 'text')" /><span>至</span><input v-model="draft.executionEnd" :type="draft.executionEnd ? 'date' : 'text'" class="ant-input" :min="draft.executionStart || undefined" placeholder="结束日期" aria-label="执行结束日期" @focus="$event.target.type = 'date'" @blur="!draft.executionEnd && ($event.target.type = 'text')" /></div></div>
        <div v-for="field in amountFields" :key="field.key" class="edit-field" :class="fieldClass(field.key)"><label :for="'plan-' + field.key"><em>*</em><review-comment-label :comment="comment(field.key)">{{ field.label }}</review-comment-label></label><div class="amount-input"><a-input-number :id="'plan-' + field.key" v-model="draft[field.key]" :min="0" :max="999999999999.99" :precision="2" placeholder="填写数字金额" /><span>元</span></div><small v-if="typeof draft[field.key] === 'number'">大写：{{ uppercaseMoney(draft[field.key]) }}</small></div>
        <div class="edit-field wide" :class="fieldClass('team')"><label for="plan-team"><em>*</em><review-comment-label :comment="comment('team')">执行团队</review-comment-label></label><a-input id="plan-team" v-model="draft.team" :max-length="200" placeholder="请填写执行团队" /></div>
        <div class="edit-field wide" :class="fieldClass('fundUsePlan')"><label for="plan-fund-use"><em>*</em><review-comment-label :comment="comment('fundUsePlan')">善款使用预案</review-comment-label></label><a-textarea id="plan-fund-use" v-model="draft.fundUsePlan" :rows="3" placeholder="请说明善款使用安排，以及筹款未达到最低执行额时的处理预案" /></div>
      </div>
      <div v-for="section in draft.content" :key="section.key" class="rich-section"><h3><em>*</em><review-comment-label :comment="comment(section.key)">{{ section.title }}</review-comment-label></h3><fundraising-rich-editor :value="sectionHtml(section)" :label="section.title" :placeholder="richHint(section.key)" :class="fieldClass(section.key)" @input="value => updateRich(section, value)" @busy="value => setEditorBusy(section.key, value)" /></div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>项目产出</h2><p v-if="hasRowComments(['outputs', 'activities'])">{{ rowHint }}</p></div></div>
      <div class="section-body outputs-body">
        <a-empty v-if="!draft.outputs.length" class="empty-add" description="点击添加产出" role="button" tabindex="0" @click="openOutput()" @keydown.enter.native.prevent="openOutput()" @keydown.space.native.prevent="openOutput()" />
        <div v-for="(output, outputIndex) in draft.outputs" :key="output.id" class="output-block">
          <div class="output-summary">
            <div class="output-heading" :class="rowClass('outputs', output)" v-bind="rowAttrs('outputs', output)" @click="openRowComments('outputs', output)" @keydown="rowKeydown($event, 'outputs', output)"><div class="output-title"><span><a-popover v-if="commentsFor('outputs', output).length" :visible="rowReviewKey === 'outputs.' + output.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowCommentsVisibility('outputs', output, visible)"><template slot="content"><div class="row-review-content" @click.stop @keydown.stop><div><a-icon type="exclamation-circle" theme="filled" /><div class="row-review-messages"><p v-for="item in commentsFor('outputs', output)" :key="item.key">{{ item.text }}</p></div></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span>产出 {{ outputIndex + 1 }}</span></a-popover><span v-else>产出 {{ outputIndex + 1 }}</span></span><strong>{{ output.name }}</strong></div><div class="row-actions" @click.stop @keydown.stop><a-button type="link" @click="openOutput(output)">编辑</a-button><a-button type="link" class="danger-link" @click="removeRow(draft.outputs, output, '产出及其活动')">删除</a-button></div></div>
            <div class="output-standard"><span>产出衡量标准</span><div>{{ output.standard }}</div></div>
          </div>
          <div class="detail-table-wrap"><table class="detail-table entry-table"><colgroup><col class="index-col" /><col /><col style="width: 210px" /><col style="width: 210px" /><col class="actions-col" /></colgroup><thead><tr><th>序号</th><th>活动描述</th><th>活动时间</th><th>活动地点</th><th>操作</th></tr></thead><tbody><tr v-for="(activity, index) in output.activities" :key="activity.id" :class="rowClass('activities', activity)" v-bind="rowAttrs('activities', activity)" @click="openRowComments('activities', activity)" @keydown="rowKeydown($event, 'activities', activity)"><td><a-popover v-if="commentsFor('activities', activity).length" :visible="rowReviewKey === 'activities.' + activity.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowCommentsVisibility('activities', activity, visible)"><template slot="content"><div class="row-review-content" @click.stop @keydown.stop><div><a-icon type="exclamation-circle" theme="filled" /><div class="row-review-messages"><p v-for="item in commentsFor('activities', activity)" :key="item.key">{{ item.text }}</p></div></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span>{{ outputIndex + 1 }}.{{ index + 1 }}</span></a-popover><span v-else>{{ outputIndex + 1 }}.{{ index + 1 }}</span></td><td class="multiline">{{ activity.description }}</td><td>{{ activity.time }}</td><td>{{ activity.location }}</td><td class="row-actions" @click.stop @keydown.stop><a-button type="link" @click="openActivity(output, activity)">编辑</a-button><a-button type="link" class="danger-link" @click="removeRow(output.activities, activity, '活动')">删除</a-button></td></tr><tr v-if="!output.activities.length"><td colspan="5" class="empty-cell">暂无活动</td></tr><tr class="add-activity-row"><td colspan="5"><a-button class="add-activity-button" type="link" icon="plus" @click="openActivity(output)">增加活动</a-button></td></tr></tbody></table></div>
        </div>
        <a-button v-if="draft.outputs.length" type="dashed" icon="plus" class="add-more add-output" @click="openOutput()">添加产出</a-button>
      </div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>项目预算</h2></div></div>
      <div class="budget-sheet-list"><div class="budget-sheet-row"><div class="budget-sheet-info"><strong>{{ draft.name ? draft.name + '-预算表' : '填写申请名称后自动生成预算表名称' }}</strong><span>{{ draft.budget.status }}<template v-if="draft.budget.updatedAt"> · 编辑日期：{{ draft.budget.updatedAt }}</template></span></div><a-button type="link" @click="openBudget">编辑</a-button><a-button type="link" @click="budgetPreview = true">查看</a-button></div></div>
    </section>

    <section class="panel detail-section other-info-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="profile" /></span><div><h2>其他信息</h2><p v-if="hasComments(draft.otherContent.map(item => item.key))">{{ fieldHint }}</p></div></div>
      <div v-for="section in draft.otherContent" :key="section.key" class="rich-section"><h3><em>*</em><review-comment-label :comment="comment(section.key)">{{ section.title }}</review-comment-label></h3><fundraising-rich-editor :value="sectionHtml(section)" :label="section.title" :placeholder="richHint(section.key)" :class="fieldClass(section.key)" @input="value => updateRich(section, value)" @busy="value => setEditorBusy(section.key, value)" /></div>
    </section>

    <section class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2><p v-if="hasRowComments(['attachments'])">{{ rowHint }}</p></div></div>
      <div class="section-body"><input ref="attachmentInput" class="hidden-input" type="file" aria-label="上传附件" @change="uploadAttachment" /><a-empty v-if="!draft.attachments.length" class="empty-add" description="点击添加附件" role="button" tabindex="0" @click="chooseAttachment" @keydown.enter.native.prevent="chooseAttachment" @keydown.space.native.prevent="chooseAttachment" />
        <div v-else class="attachment-list"><div v-for="file in draft.attachments" :key="file.id" :class="rowClass('attachments', file)" v-bind="rowAttrs('attachments', file)" @click="openRowComments('attachments', file)" @keydown="rowKeydown($event, 'attachments', file)"><div><strong><a-popover v-if="commentsFor('attachments', file).length" :visible="rowReviewKey === 'attachments.' + file.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowCommentsVisibility('attachments', file, visible)"><template slot="content"><div class="row-review-content" @click.stop @keydown.stop><div><a-icon type="exclamation-circle" theme="filled" /><div class="row-review-messages"><p v-for="item in commentsFor('attachments', file)" :key="item.key">{{ item.text }}</p></div></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span>{{ file.name }}</span></a-popover><span v-else>{{ file.name }}</span></strong><span>{{ file.uploadedAt }}</span></div><a-button type="link" @click.stop="previewAttachment(file)" @keydown.stop>预览</a-button><a-button type="link" @click.stop="downloadAttachment(file)" @keydown.stop>下载</a-button><a-button type="link" class="danger-link" @click.stop="removeRow(draft.attachments, file, '附件')" @keydown.stop>删除</a-button></div></div>
        <a-button v-if="draft.attachments.length" type="dashed" icon="upload" class="add-more add-more-attachment" :loading="uploading" @click="chooseAttachment">添加更多附件</a-button>
      </div>
    </section>
    <section v-if="draft.auditHistory.length" class="panel detail-section"><div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div><a-timeline class="audit-timeline"><a-timeline-item v-for="record in draft.auditHistory" :key="record.id"><div class="audit-entry"><strong>审核结果：{{ record.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ record.time }} · {{ record.account }}</span></div><p class="multiline">{{ record.remark || '暂无审核备注' }}</p></div></a-timeline-item></a-timeline></section>
    <footer class="form-footer"><span><a-icon type="info-circle" /> {{ busy ? '文件处理中，请稍候' : dirty ? '填写内容尚未保存' : draft.updatedAt ? '草稿内容已保留' : '请填写筹款规划申请，可随时存为草稿' }}</span><div><a-button :disabled="busy" @click="goBack">取消</a-button><a-button icon="save" :disabled="busy" @click="save(false)">存为草稿</a-button><a-button type="primary" :disabled="busy" @click="submit">提交</a-button></div></footer>

    <a-modal :visible="editor.visible" :title="editorTitle" :width="550" :mask-closable="false" class="plan-entry-modal" ok-text="保存" cancel-text="取消" @ok="saveEntry" @cancel="editor.visible = false">
      <div class="compact-modal-form">
        <template v-if="editor.type === 'output'"><div class="modal-field"><label for="output-name">产出</label><div><a-textarea id="output-name" v-model="editor.value.name" :rows="2" placeholder="请填写产出" /><p v-if="entryErrors.name" class="form-error">{{ entryErrors.name }}</p></div></div><div class="modal-field"><label for="output-standard">产出衡量标准</label><div><a-textarea id="output-standard" v-model="editor.value.standard" :rows="2" placeholder="请填写产出衡量标准" /><p v-if="entryErrors.standard" class="form-error">{{ entryErrors.standard }}</p></div></div></template>
        <template v-if="editor.type === 'activity' || !editor.id"><div class="modal-field" :class="{ 'initial-activity-field': editor.type === 'output' }"><label for="activity-description">活动描述</label><div><a-textarea id="activity-description" v-model="entryActivity.description" :rows="2" placeholder="请填写活动具体内容" /><p v-if="entryErrors.description" class="form-error">{{ entryErrors.description }}</p></div></div><div class="modal-field"><label for="activity-start">活动时间</label><div><div class="date-pair modal-date-pair"><input id="activity-start" v-model="entryActivity.start" class="ant-input" type="month" aria-label="活动开始月份" /><span>至</span><input v-model="entryActivity.end" class="ant-input" type="month" :min="entryActivity.start || undefined" aria-label="活动结束月份" /></div><p v-if="entryErrors.time" class="form-error">{{ entryErrors.time }}</p></div></div><div class="modal-field"><label for="activity-location">活动地点</label><div><div class="activity-nationwide"><a-checkbox id="activity-location" v-model="entryActivity.nationwide">全国</a-checkbox></div><div class="activity-location-inputs"><a-select :value="entryActivity.province || undefined" :disabled="entryActivity.nationwide" placeholder="省 / 直辖市" aria-label="省 / 直辖市" @change="changeActivityRegion('province', $event)"><a-select-option v-for="option in activityLocationOptions('province')" :key="option" :value="option">{{ option }}</a-select-option></a-select><a-select :value="entryActivity.city || undefined" :disabled="entryActivity.nationwide || !entryActivity.province" placeholder="地级市 / 直辖市区" aria-label="地级市 / 直辖市区" @change="changeActivityRegion('city', $event)"><a-select-option v-for="option in activityLocationOptions('city')" :key="option" :value="option">{{ option }}</a-select-option></a-select><a-select :value="entryActivity.district || undefined" :disabled="entryActivity.nationwide || !entryActivity.province || !entryActivity.city || entryActivity.city === '全部'" placeholder="县 / 行政区" aria-label="县 / 行政区" @change="entryActivity.district = $event"><a-select-option v-for="option in activityLocationOptions('district')" :key="option" :value="option">{{ option }}</a-select-option></a-select></div><p v-if="entryErrors.location" class="form-error">{{ entryErrors.location }}</p></div></div></template>
      </div>
    </a-modal>
    <a-modal v-model="budgetVisible" title="编辑项目预算" :width="1100" :mask-closable="false" ok-text="保存预算" cancel-text="取消" @ok="saveBudget">
      <div class="budget-editor"><p class="basic-field-value">{{ draft.name || '未命名筹款规划申请' }}-预算表 · 金额单位：元</p><div class="detail-table-wrap"><table class="detail-table entry-table"><colgroup><col class="index-col" /><col style="width: 165px" /><col style="width: 200px" /><col style="width: 130px" /><col v-for="i in 4" :key="i" style="width: 135px" /><col class="actions-col" /></colgroup><thead><tr><th>序号</th><th>预算科目</th><th>预算明细（单价*数量）</th><th>费用类型</th><th v-for="i in 4" :key="i">第{{ ['一', '二', '三', '四'][i - 1] }}期预算</th><th>操作</th></tr></thead><tbody><tr v-for="(row, index) in budgetRows" :key="row.id"><td>{{ index + 1 }}</td><td><a-input v-model="row.name" :aria-label="'第' + (index + 1) + '行预算科目'" placeholder="预算科目" /></td><td><a-textarea v-model="row.detail" :rows="2" :aria-label="'第' + (index + 1) + '行预算明细'" placeholder="单价与数量" /></td><td><a-input v-model="row.type" :aria-label="'第' + (index + 1) + '行费用类型'" placeholder="费用类型" /></td><td v-for="(value, i) in row.values" :key="i"><a-input-number :value="value" :min="0" :max="999999999" :precision="2" :aria-label="'第' + (index + 1) + '行第' + (i + 1) + '期预算'" @change="amount => $set(row.values, i, amount)" /></td><td><a-button type="link" class="danger-link" @click="budgetRows.splice(index, 1)">删除</a-button></td></tr><tr v-if="!budgetRows.length"><td colspan="9">暂无预算明细，请添加</td></tr></tbody></table></div><a-button type="dashed" icon="plus" class="add-more" @click="addBudgetRow">添加预算明细</a-button><p class="budget-total">预算合计：{{ money(budgetTotal) }} 元</p><p v-if="budgetError" class="form-error" role="alert">{{ budgetError }}</p></div>
    </a-modal>
    <a-modal v-model="budgetPreview" title="查看项目预算" :width="1100" :mask-closable="false" :footer="null"><budget-prototype :project-name="draft.name || '未命名筹款规划申请'" :budget="previewBudget" /></a-modal>
    <a-modal :visible="errors.length > 0" :footer="null" :closable="false" :mask-closable="false" :body-style="{ padding: '36px 28px 28px' }" @cancel="errors = []"><div class="validation-heading"><a-icon type="close-circle" /><strong>无法提交申请</strong></div><ul class="validation-errors"><li v-for="(error, index) in errors" :key="index">{{ error }}</li></ul><div class="validation-action"><a-button type="primary" @click="errors = []">关闭</a-button></div></a-modal>

    <a-modal :visible="!!previewFile" :title="previewFile ? previewFile.name : '附件预览'" :width="900" :mask-closable="false" :footer="null" @cancel="clearPreview"><template v-if="previewFile"><img v-if="previewType === 'image'" class="preview-image" :src="previewUrl" :alt="previewFile.name" /><iframe v-else-if="previewType === 'pdf'" class="preview-pdf" :src="previewUrl" :title="previewFile.name"></iframe><template v-else><p>此格式请下载后使用对应软件查看。</p><a-button icon="download" @click="downloadAttachment(previewFile)">下载附件</a-button></template></template></a-modal>
  </section>
  <section v-else class="panel missing-record"><a-empty :description="loadError || '未找到可编辑的筹款规划申请'"><a-button @click="goBack">返回列表</a-button></a-empty></section>
</template>

<script>
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import FundraisingRichEditor from '../components/FundraisingRichEditor.vue'
import BudgetPrototype from '../components/BudgetPrototype.vue'
import { createFundraisingPlans, createPlanApplications, applicationActions } from '../mock/fundraising-plans'
import { clonePlan, readPlanSnapshot, planReviewComment, planRowComments } from '../mock/fundraising-plan-detail'
import { createPlanDraft, savePlanDraft, validatePlanDraft, buildPlanBudget, syncPlanPeriods, planRichFields, planUid, planTimestamp } from '../mock/fundraising-plan-drafts'
import { uppercaseMoney, draftFile } from '../mock/project-drafts'
import { cleanFundraisingRichText, paragraphsToRichText } from '../utils/fundraising-rich-text'

const rowFields = { outputs: ['name', 'standard'], activities: ['description', 'time', 'location'], attachments: ['name', 'uploadedAt'] }
export default {
  name: 'FundraisingPlanForm',
  components: { ReviewCommentLabel, FundraisingRichEditor, BudgetPrototype },
  data () {
    return { draft: null, snapshot: '', loadError: '', errors: [], entryErrors: {}, uploading: false, busyEditors: {}, leaving: false,
      editor: { visible: false, type: 'output', id: '', parentId: '', value: {}, firstActivity: { description: '', start: '', end: '', location: '', nationwide: false, province: '', city: '', district: '' } }, budgetVisible: false, budgetPreview: false, budgetRows: [], budgetError: '',
      rowReviewKey: '', previewFile: null, previewUrl: '', previewType: '', previewToken: 0,
      amountFields: [{ key: 'plannedAmount', label: '计划资金' }, { key: 'minimumAmount', label: '最低执行额' }],
      basicKeys: ['name', 'planningPeriod', 'executionPeriod', 'plannedAmount', 'minimumAmount', 'team', 'fundUsePlan', 'overview', 'background', 'goal', 'strategy'],
      fieldHint: '请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见', rowHint: '请检查并修改标红的项目信息，点击行任意位置可查看具体审核意见' }
  },
  computed: {
    dirty () { return !!this.draft && JSON.stringify(this.draft) !== this.snapshot },
    busy () { return this.uploading || Object.keys(this.busyEditors).some(key => this.busyEditors[key]) },
    years () { const year = new Date().getFullYear(); return Array.from({ length: 11 }, (_, index) => year - 5 + index) },
    editorTitle () { return (this.editor.id ? '编辑' : '增加') + (this.editor.type === 'output' ? '产出' : '活动') },
    entryActivity () { return this.editor.type === 'output' ? this.editor.firstActivity : this.editor.value },
    budgetTotal () { return this.budgetRows.reduce((total, row) => total + row.values.reduce((sum, value) => sum + Math.round((Number(value) || 0) * 100), 0), 0) / 100 },
    previewBudget () { return syncPlanPeriods(clonePlan(this.draft)).budget }
  },
  watch: { '$route' (to, from) { if (to.name === 'fundraising-plan-form' && from.name === to.name) this.load() } },
  activated () { this.load(); window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { this.clearPreview(); window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeDestroy () { this.clearPreview(); window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeRouteLeave (to, from, next) { this.confirmLeave(next) },
  beforeRouteUpdate (to, from, next) { this.confirmLeave(next) },
  methods: {
    uppercaseMoney,
    money (value) { return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    load () {
      this.clearPreview(); this.editor.visible = false; this.budgetVisible = false; this.budgetPreview = false; this.rowReviewKey = ''; this.errors = []; this.loadError = ''; this.leaving = false; this.busyEditors = {}
      try {
        const id = this.$route.params.id, records = createPlanApplications(), record = records.find(item => item.id === id)
        if (id !== 'new' && (!record || !applicationActions(record).includes('编辑'))) { this.draft = null; this.loadError = record ? '该申请当前状态不支持编辑，请返回列表查看' : ''; return }
        const saved = record && readPlanSnapshot(record.id)
        const planId = record ? record.planId : this.$route.query.planId
        const plan = createFundraisingPlans().find(item => item.id === planId) || (saved && { id: saved.application.planId, name: saved.application.planName })
        if (!plan) { this.draft = null; return }
        const draft = createPlanDraft(record, plan)
        draft.content.concat(draft.otherContent).forEach(section => { section.html = cleanFundraisingRichText(typeof section.html === 'string' ? section.html : paragraphsToRichText(section.paragraphs)) })
        this.draft = draft; this.snapshot = JSON.stringify(draft)
      } catch (error) { this.draft = null; this.loadError = '本地记录无法读取，请检查浏览器存储后重试'; this.$message.error(this.loadError) }
    },
    goBack () { this.$router.push({ name: 'fundraising-plans', query: { tab: this.$route.params.id === 'new' ? 'plans' : 'applications' } }) },
    confirmLeave (next) {
      if (this.busy) { this.$message.info('文件处理中，请稍候'); next(false); return }
      if (this.leaving || !this.dirty) { next(); return }
      this.$confirm({ title: '离开编辑页？', content: '填写内容尚未保存，离开将丢失本次修改。', maskClosable: false, okText: '离开', cancelText: '继续编辑', onOk: () => next(), onCancel: () => next(false) })
    },
    beforeUnload (event) { if (this.dirty || this.busy) { event.preventDefault(); event.returnValue = '' } },
    richHint (key) { return planRichFields.find(item => item.key === key).hint },
    sectionHtml (section) { return section.html || '' },
    updateRich (section, html) { this.$set(section, 'html', cleanFundraisingRichText(html)); section.paragraphs = [] },
    setEditorBusy (key, busy) { this.$set(this.busyEditors, key, busy) },
    textOf (section) { const element = document.createElement('div'); element.innerHTML = cleanFundraisingRichText(section.html || paragraphsToRichText(section.paragraphs)); return element.textContent || '' },
    comment (key) { return planReviewComment(this.draft.reviewComments, key) },
    hasComments (keys) { return keys.some(key => !!this.comment(key)) },
    fieldClass (key) { return { 'review-has-comment': !!this.comment(key) } },
    hasRowComments (sections) { return Object.keys(this.draft.reviewComments).some(key => sections.some(section => key.indexOf(section + '.') === 0) && !!this.comment(key)) },
    commentsFor (section, row) { return planRowComments(this.draft.reviewComments, section, row.id, rowFields[section]) },
    rowClass (section, row) { return { 'review-row-has-comment': !!this.commentsFor(section, row).length } },
    rowAttrs (section, row) { return this.commentsFor(section, row).length ? { role: 'button', tabindex: 0, 'aria-label': '查看审核意见' } : {} },
    openRowComments (section, row) { const comments = this.commentsFor(section, row); if (!comments.length) return; this.rowReviewKey = section + '.' + row.id },
    changeRowCommentsVisibility (section, row, visible) { const key = section + '.' + row.id; if (visible) this.openRowComments(section, row); else if (this.rowReviewKey === key) this.rowReviewKey = '' },
    rowKeydown (event, section, row) { if (event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openRowComments(section, row) } },
    openOutput (output) { this.entryErrors = {}; this.editor = { visible: true, type: 'output', id: output ? output.id : '', parentId: '', value: output ? clonePlan(output) : { name: '', standard: '', activities: [] }, firstActivity: { description: '', start: '', end: '', location: '', nationwide: false, province: '', city: '', district: '' } } },
    openActivity (output, activity) {
      const value = activity ? clonePlan(activity) : { description: '', location: '', time: '' }
      const regions = (value.location || '').split(/\s*-\s*/)
      value.nationwide = typeof value.nationwide === 'boolean' ? value.nationwide : value.location === '全国'
      value.province = value.province || (value.nationwide ? '' : regions[0]) || ''
      value.city = value.city || (value.nationwide ? '' : regions[1]) || ''
      value.district = value.district || (value.nationwide ? '' : regions.slice(2).join(' - ')) || ''
      const months = (value.time.match(/\d{4}年\d{1,2}月/g) || []).map(item => item.replace('年', '-').replace('月', '').split('-').map((n, i) => i ? n.padStart(2, '0') : n).join('-'))
      value.start = value.start || months[0] || ''; value.end = value.end || months[1] || ''
      this.entryErrors = {}; this.editor = { visible: true, type: 'activity', id: activity ? activity.id : '', parentId: output.id, value }
    },
    activityLocationOptions (field) {
      const examples = {
        '北京市': { '北京市区': ['朝阳区', '海淀区'] },
        '广东省': { '广州市': ['天河区', '越秀区'], '深圳市': ['南山区', '福田区'] },
        '新疆维吾尔自治区': { '伊犁哈萨克自治州': ['察布查尔锡伯自治县', '伊宁市'] }
      }
      const activity = this.entryActivity, cities = examples[activity.province] || {}
      let options = field === 'province' ? Object.keys(examples) : field === 'city' ? (activity.province ? ['全部'].concat(Object.keys(cities)) : []) : (activity.city ? ['全部'].concat(cities[activity.city] || []) : [])
      const current = activity[field]
      if (current && options.indexOf(current) === -1) options.push(current)
      return options
    },
    changeActivityRegion (field, value) {
      this.entryActivity[field] = value
      if (field === 'province') this.entryActivity.city = ''
      if (field === 'province' || field === 'city') this.entryActivity.district = ''
    },
    validateEntryActivity (value) {
      const errors = {}
      if (!value.description.trim()) errors.description = '请填写活动描述'
      value.location = value.nationwide ? '全国' : [value.province, value.city, value.district].map(item => (item || '').trim()).filter(Boolean).join(' - ')
      if (!value.location) errors.location = '请填写活动地点'
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value.start) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value.end) || value.start > value.end) errors.time = '请选择有效的活动起止月份'
      else if ((this.draft.executionStart && value.start < this.draft.executionStart.slice(0, 7)) || (this.draft.executionEnd && value.end > this.draft.executionEnd.slice(0, 7))) errors.time = '活动时间应在项目执行周期内'
      return errors
    },
    saveEntry () {
      const value = clonePlan(this.editor.value), errors = {}
      if (this.editor.type === 'output') {
        if (!value.name.trim()) errors.name = '请填写产出'
        if (!value.standard.trim()) errors.standard = '请填写产出衡量标准'
        if (!this.editor.id) {
          const activity = clonePlan(this.editor.firstActivity)
          Object.assign(errors, this.validateEntryActivity(activity))
          if (!Object.keys(errors).length) {
            activity.id = planUid('activity')
            activity.time = `${activity.start.replace('-', '年')}月 至 ${activity.end.replace('-', '年')}月`
            value.activities = [activity]
          }
        }
      } else {
        Object.assign(errors, this.validateEntryActivity(value))
        value.time = `${value.start.replace('-', '年')}月 至 ${value.end.replace('-', '年')}月`
      }
      this.entryErrors = errors; if (Object.keys(errors).length) return
      const list = this.editor.type === 'output' ? this.draft.outputs : this.draft.outputs.find(item => item.id === this.editor.parentId).activities
      value.id = this.editor.id || planUid(this.editor.type)
      const index = list.findIndex(item => item.id === value.id)
      if (index === -1) list.push(value); else this.$set(list, index, value)
      this.editor.visible = false
    },
    removeRow (list, row, label) { this.$confirm({ title: '删除' + label + '？', content: '保存草稿后生效。', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { const index = list.findIndex(item => item.id === row.id); if (index !== -1) list.splice(index, 1) } }) },
    openBudget () {
      this.budgetRows = this.draft.budget.rows.filter(row => row.kind === 'detail').map(row => Object.assign(clonePlan(row), { values: row.quarters.map(value => Number(String(value).replace(/,/g, ''))) }))
      this.budgetError = ''; this.budgetVisible = true
    },
    addBudgetRow () { this.budgetRows.push({ id: planUid('budget'), name: '', detail: '', type: '', values: [0, 0, 0, 0] }) },
    saveBudget () {
      if (!this.budgetRows.length || this.budgetRows.some(row => !row.name.trim() || !row.detail.trim() || !row.type.trim() || row.values.some(value => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 999999999)) || this.budgetTotal <= 0) { this.budgetError = '请补全预算科目、明细和费用类型；各期金额须为有效非负数，预算合计须大于 0。'; return }
      this.draft.budget = buildPlanBudget(this.draft.budget, this.budgetRows); this.budgetVisible = false
    },
    chooseAttachment () { if (!this.busy) this.$refs.attachmentInput.click() },
    async uploadAttachment (event) {
      const file = event.target.files[0]; event.target.value = ''; if (!file || this.busy) return
      if (file.size > 20 * 1024 * 1024) { this.$message.error('请选择 20 MB 以内的附件'); return }
      const id = planUid('attachment'), blobKey = this.draft.id + '-' + id
      this.uploading = true
      try { await draftFile('put', blobKey, file); this.draft.attachments.push({ id, blobKey, name: file.name, size: file.size, type: file.type, uploadedAt: planTimestamp() }) } catch (error) { this.$message.error('附件保存失败，请检查浏览器存储空间或权限') } finally { this.uploading = false }
    },
    async getFile (file) { try { if (!file.blobKey) throw new Error('示例无正文'); const blob = await draftFile('get', file.blobKey); if (!blob) throw new Error('missing'); return blob } catch (error) { this.$message.error('附件正文不可用，请重新上传'); return null } },
    clearPreview () { this.previewToken++; if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = ''; this.previewFile = null; this.previewType = '' },
    async previewAttachment (file) {
      this.clearPreview(); const token = this.previewToken, blob = await this.getFile(file)
      if (!blob || token !== this.previewToken) return
      this.previewType = /^image\/(png|jpeg|gif|webp)$/i.test(blob.type) ? 'image' : blob.type === 'application/pdf' ? 'pdf' : 'other'
      this.previewUrl = this.previewType === 'other' ? '' : URL.createObjectURL(blob); this.previewFile = file
    },
    async downloadAttachment (file) { const blob = await this.getFile(file); if (!blob) return; const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) },
    save (submitted) {
      if (this.busy) return false
      if (this.draft.name.trim() && createPlanApplications().some(item => item.id !== this.draft.id && item.name.trim().toLowerCase() === this.draft.name.trim().toLowerCase())) { this.$message.error('筹款规划申请名称不可重复'); return false }
      try {
        this.draft = savePlanDraft(this.draft, submitted); this.snapshot = JSON.stringify(this.draft)
        this.$message.success(submitted ? '申请已在本地提交，状态更新为规划待审' : '草稿已保存到当前浏览器')
        if (!submitted && this.$route.params.id === 'new') this.$router.replace({ name: 'fundraising-plan-form', params: { id: this.draft.id } })
        return true
      } catch (error) { this.$message.error(error.message === '申请已提交审核，请返回列表查看最新状态' ? error.message : '本地保存失败，请检查浏览器存储空间或权限'); return false }
    },
    async submit () {
      if (this.busy) return
      this.errors = validatePlanDraft(this.draft, createPlanApplications(), this.textOf)
      if (this.errors.length) return
      this.uploading = true
      try {
        for (const file of this.draft.attachments) {
          if (file.blobKey && !await draftFile('get', file.blobKey)) this.errors.push('附件已不可用，请重新上传：' + file.name)
        }
      } catch (error) { this.errors.push('无法读取本地附件，请检查浏览器存储后重试') } finally { this.uploading = false }
      if (this.errors.length) return
      this.$confirm({ title: '确认提交筹款规划申请？', content: '本地演示：确认后保存申请并将状态更新为“规划待审”，未连接真实后台。', maskClosable: false, okText: '确认提交', cancelText: '继续编辑', onOk: () => { if (this.save(true)) { this.leaving = true; this.$router.push({ name: 'fundraising-plans', query: { tab: 'applications' } }) } } })
    }
  }
}
</script>

<style scoped>
.plan-form-page { min-width: 0; color: #18253c; padding-bottom: 18px; }
.detail-section-header h2 { overflow-wrap: anywhere; }
.plan-department { padding: 3px 6px; border-radius: 3px; color: #52a61a; background: #f6ffed; white-space: normal; overflow-wrap: anywhere; }
.edit-grid { padding: 4px 22px 22px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.edit-field { min-width: 0; min-height: 76px; padding: 17px 18px; display: grid; align-content: start; gap: 7px; border-bottom: 1px solid #edf1f5; }
.edit-field.wide { grid-column: 1 / -1; }.edit-field > label { color: #7b899b; line-height: 1.6; font-weight: 400; }
em { color: #ff4d4f; font-style: normal; margin-right: 6px; }
.edit-field > .ant-input, .date-pair > .ant-input, .amount-input >>> .ant-input-number, .date-pair >>> .ant-select-selection { border-color: transparent; background: transparent; box-shadow: none; }
.edit-field > .ant-input:hover, .date-pair > .ant-input:hover, .amount-input >>> .ant-input-number:hover, .date-pair >>> .ant-select-selection:hover { border-color: #d9e1eb; }
.edit-field > .ant-input:focus, .date-pair > .ant-input:focus, .amount-input >>> .ant-input-number-focused { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.edit-grid >>> input.ant-input { height: 40px; padding: 8px 12px; line-height: 22px; }
.edit-grid >>> .ant-input, .edit-grid >>> .ant-input-number-input { color: #27384e; font-size: 16px; }
.plan-form-page >>> input::placeholder, .plan-form-page >>> textarea::placeholder, .plan-form-page >>> .ant-select-selection__placeholder { color: #5b8ff9; font-size: 14px; opacity: 1; }
.date-pair { display: flex; align-items: center; gap: 12px; }.date-pair > .ant-input, .date-pair > .ant-select { flex: 1; min-width: 0; width: calc(50% - 20px); }.date-pair > span { color: #718095; }
.amount-input { display: flex; align-items: center; gap: 8px; }.amount-input .ant-input-number { width: 210px; max-width: calc(100% - 30px); }.edit-field small { color: #718095; font-size: 14px; line-height: 1.6; }
.rich-section { padding: 0 24px 24px; }.rich-section h3 { margin: 0 0 9px; font-size: 10pt; font-weight: 400; line-height: 1.6; }
.rich-section + .rich-section { padding-top: 4px; }
.other-info-section > .detail-section-header + .rich-section { padding-top: 24px; }
.section-body { padding: 0 24px 24px; }.empty-add { padding: 20px 0; cursor: pointer; }.empty-add >>> .ant-empty-description { color: #5b8ff9; }.empty-add:focus-visible { outline: 2px solid #1677ff; }
.add-more { width: 100%; margin-top: 14px; }.output-block { margin: 0; padding: 0; }.output-block + .output-block { margin-top: 24px; }
.output-summary { padding: 0; }.output-heading { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-right: 12px; }.output-title { min-width: 0; flex: 1; background: transparent; }.output-title strong { white-space: pre-wrap; overflow-wrap: anywhere; }
.outputs-body { padding: 22px; }
.output-standard > div { min-width: 0; padding: 4px 0; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }
.output-heading .output-title { display: flex; align-items: center; }.output-heading .output-title > span, .output-heading .output-title > strong { align-self: center; }
.output-block > .detail-table-wrap { border: 0; border-top: 1px solid #e6ebf2; border-radius: 0; }.output-block .entry-table td { vertical-align: middle; }
.detail-table-wrap { margin: 0; overflow-x: auto; }.entry-table { width: 100%; min-width: 850px; table-layout: fixed; }.index-col { width: 70px; }.actions-col { width: 130px; }.entry-table td { overflow-wrap: anywhere; vertical-align: middle; }.entry-table th:first-child, .entry-table td:first-child { text-align: center; }.budget-list th:first-child, .budget-list td:first-child { text-align: left; }
.row-actions { flex-shrink: 0; white-space: nowrap; }.row-actions .ant-btn { padding: 0 7px; }.danger-link { color: #ff4d4f; }.multiline { white-space: pre-wrap; }.empty-cell { color: #718095; text-align: center; }
.output-block .add-activity-row > td { padding: 0; background: #e8f8f0; vertical-align: middle; }
.add-activity-button { display: block; width: 100%; height: 32px; padding: 0 16px; color: #168b5a; border-radius: 0; }
.add-activity-button:hover, .add-activity-button:focus { color: #168b5a; background: #fff; }
.add-output { border-color: #91d5ff; color: #096dd9; background: #e6f7ff; }
.add-output:hover, .add-output:focus { border-color: #40a9ff; color: #096dd9; background: #fff; }
.row-review-content { width: 300px; max-width: 60vw; }
.output-title > span >>> span { padding: 0; border-radius: 0; color: inherit; background: transparent; }
.row-review-content > div { display: flex; align-items: flex-start; gap: 10px; }
.row-review-content .anticon { flex: none; margin-top: 3px; color: #faad14; }
.row-review-messages { flex: 1; min-width: 0; }
.row-review-messages p { margin: 0 0 14px; line-height: 1.6; overflow-wrap: anywhere; white-space: pre-wrap; }
.row-review-content .ant-btn { display: block; margin-left: auto; }
.budget-sheet-list { padding: 4px 22px 22px; }
.budget-sheet-row { min-height: 72px; padding: 12px 4px; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 12px; }
.budget-sheet-info { min-width: 0; display: grid; gap: 5px; }
.budget-sheet-info strong { color: #18253c; font-weight: 600; overflow-wrap: anywhere; }
.budget-sheet-info span { color: #8390a2; line-height: 1.55; overflow-wrap: anywhere; }
.budget-sheet-row .ant-btn { padding: 0 8px; }
.add-more-attachment { border-color: #91d5ff; border-style: dashed; color: #096dd9; background: #e6f7ff; }
.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9; background: #fff; }
.attachment-list { padding: 0; }.attachment-list > div { grid-template-columns: minmax(0, 1fr) auto auto auto; }.attachment-list strong { overflow-wrap: anywhere; }.attachment-list .ant-btn { padding: 0 6px; }.hidden-input { display: none; }.file-hint { color: #718095; margin: 12px 0 0; }
.basic-field-value { color: #27384e; font-weight: 500; line-height: 1.6; overflow-wrap: anywhere; }
.form-footer { position: sticky; bottom: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 18px 24px; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); }.form-footer > span { color: #718095; }.form-footer > div { display: flex; gap: 12px; }.form-footer .ant-btn { min-width: 100px; height: 32px; }
.compact-modal-form { width: 470px; max-width: 100%; margin: auto; padding: 0; display: grid; gap: 16px; }.modal-field { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 18px; align-items: start; }.modal-field > label { text-align: right; line-height: 22px; padding-top: 5px; }.compact-modal-form >>> input, .compact-modal-form >>> textarea { font-size: 14px; }.compact-modal-form >>> input::placeholder, .compact-modal-form >>> textarea::placeholder { color: #bfbfbf; font-size: 14px; }.modal-date-pair { gap: 6px; }.modal-date-pair > .ant-input { border-color: #d9d9d9; padding-left: 5px; padding-right: 5px; }
.plan-entry-modal >>> .ant-modal-body { padding: 32px 24px; }.plan-entry-modal >>> .ant-modal-header, .plan-entry-modal >>> .ant-modal-footer { height: 55px; box-sizing: border-box; }.plan-entry-modal >>> .ant-modal-header { display: flex; align-items: center; }.plan-entry-modal >>> .ant-modal-close-x { height: 55px; line-height: 55px; }.plan-entry-modal >>> .ant-modal-footer { display: flex; justify-content: flex-end; align-items: center; }
.activity-nationwide { height: 32px; display: flex; align-items: center; }.activity-location-inputs >>> .ant-select { width: 100%; }.activity-location-inputs { display: grid; gap: 8px; margin-top: 12px; }
.compact-modal-form .initial-activity-field { padding-top: 16px; border-top: 1px dashed #d9e1eb; }
.budget-editor .entry-table { min-width: 1235px; }.budget-editor .ant-input-number { width: 100%; }.budget-total { margin: 16px 0 0; text-align: right; font-weight: 600; }.form-error { margin: 7px 0 0; color: #ff4d4f; line-height: 1.6; }
.review-has-comment, .review-row-has-comment, .entry-table .review-row-has-comment > td { background: #fff1f0 !important; }.review-row-has-comment { cursor: pointer; }.review-row-has-comment:hover, .entry-table .review-row-has-comment:hover > td { background: #ffe7e5 !important; }.review-row-has-comment:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }.review-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
.validation-heading { display: flex; align-items: center; gap: 12px; font-size: 16px; }.validation-heading .anticon { font-size: 22px; color: #ff4d4f; }.validation-errors { margin: 14px 0 24px 34px; padding-left: 18px; color: #718095; line-height: 1.7; max-height: 50vh; overflow: auto; }.validation-action { display: flex; justify-content: flex-end; }
.preview-image { display: block; max-width: 100%; max-height: 70vh; margin: auto; object-fit: contain; }.preview-pdf { width: 100%; height: 65vh; border: 0; }.missing-record { padding: 60px 24px; }
</style>
