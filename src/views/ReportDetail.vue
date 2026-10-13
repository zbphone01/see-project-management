<template>
  <section v-if="report" class="project-detail-page report-detail-page">
    <div class="report-page-heading detail-back-row">
      <a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button>
    </div>

    <section class="privacy-reminder" role="note" aria-label="信息安全提醒">
      <div class="privacy-reminder-head">
        <span class="privacy-icon" :class="{ 'audit-notice-icon': isAudit }"><a-icon :type="isAudit ? 'info-circle' : 'warning'" theme="filled" /></span>
        <div><strong>{{ isAudit ? '请注意' : '请注意保护信息安全' }}</strong><span>{{ isAudit ? '完成审核表示您代表SEE进行了项目进展/结项报告的审核，对审核结果负责' : '当前报告可能包含不适合公开的隐私资料' }}</span></div>
        <a-icon class="privacy-watermark" type="exclamation-circle" />
      </div>
      <div class="privacy-reminder-body">
        <div class="privacy-reminder-copy">
          <template v-if="isAudit">
            <p>这是待审核的{{ report.type }}，内容在审核通过前不会入库存档。如果报告需要请款，在OA流程完成后报告状态才会更新为“{{ report.type === '结项报告' ? '结项通过' : '进展通过' }}”。</p>
            <p class="ai-initial-review"><strong>AI初审结果</strong></p>
            <p v-for="item in report.aiInitialReview" :key="item.section" class="ai-initial-review-item"><span>{{ item.section }}：</span>{{ item.content }}</p>
          </template>
          <template v-else>
            <p>本报告除公开信息外，还可能包含联系人、联系方式、财务票据及受益人资料等敏感信息。</p>
            <p>如需公开或使用其中的内容，请先咨询您的上级领导，并确认资料使用范围。</p>
          </template>
        </div>
      </div>
    </section>

    <section id="report-basic" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>{{ report.type }}{{ report.requestedCents ? '（需要请款）' : '' }}</h2><p v-if="isAudit && basicFields.some(field => field.reviewable && reviewComment(field.key))">点击可修改字段的内容可添加或编辑审核意见</p><div class="detail-basic-meta"><span class="project-code"><a-icon type="flag" /> {{ report.projectCode }}</span><span class="report-code"><a-icon type="file-text" /> {{ report.id }}</span></div></div></div>
      <div class="description-grid">
        <div class="description-item wide project-name-item"><span>项目名称</span><strong>{{ report.projectName }}</strong></div>
        <div v-for="field in basicFields" :key="field.key" class="description-item" :class="[field.reviewable ? reportReviewClass(field.key) : {}, { wide: field.wide, 'review-label-trigger': isAudit && field.reviewable }]" v-bind="reviewAttrs(field.reviewable)" v-on="reviewEvents(field.key, field.reviewable)"><span>{{ field.label }}</span><strong>{{ field.value }}</strong></div>
      </div>
    </section>

    <section id="report-progress" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>项目执行进展</h2><p v-if="isAudit && report.outputs.some(output => reviewComment(outputReviewKey(output.id)) || output.activities.some(activity => reviewComment(activityReviewKey(activity.id))))">点击蓝色产出或绿色活动的最新进展行可添加或编辑审核意见</p></div></div>
      <div class="detail-module-content">
      <article v-for="output in report.outputs" :key="output.id" class="output-block">
        <div class="output-title"><span>产出 {{ output.id }}</span><strong>{{ output.name }}</strong></div>
        <div class="output-standard"><span>产出衡量标准</span><div><p v-for="(paragraph, index) in output.standard" :key="index">{{ paragraph }}</p></div></div>
        <div class="report-progress-records output-progress-records">
          <h3>产出执行进展</h3>
          <div class="output-progress-list">
            <div v-for="(entry, index) in output.progress" :key="entry.date" class="report-progress-entry" :class="progressReviewClass(outputReviewKey(output.id), index === output.progress.length - 1)" v-bind="reviewAttrs(index === output.progress.length - 1)" v-on="reviewEvents(outputReviewKey(output.id), index === output.progress.length - 1)"><time>{{ entry.date }}</time><p>{{ entry.content }}</p></div>
          </div>
        </div>
        <section v-for="activity in output.activities" :key="activity.id" class="activity-card">
          <div><span>活动 {{ activity.id }}</span><strong>{{ activity.name }}</strong></div>
          <dl><div><dt>活动时间</dt><dd>{{ activity.period }}</dd></div><div><dt>活动地点</dt><dd>{{ activity.location }}</dd></div><div><dt>执行人员</dt><dd>{{ activity.people }}</dd></div></dl>
          <h3 class="report-activity-label">活动内容</h3><p>{{ activity.content }}</p>
          <div class="report-progress-records activity-progress-records">
            <h3>活动执行进展</h3>
            <table class="activity-progress-table"><tbody><tr v-for="(entry, index) in activity.progress" :key="entry.date" :class="progressReviewClass(activityReviewKey(activity.id), index === activity.progress.length - 1)" v-bind="reviewAttrs(index === activity.progress.length - 1)" v-on="reviewEvents(activityReviewKey(activity.id), index === activity.progress.length - 1)"><td>{{ entry.date }}</td><td>{{ entry.content }}</td></tr></tbody></table>
          </div>
        </section>
      </article>
      </div>
    </section>

    <section id="report-other" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="read" /></span><div><h2>其他信息</h2><p v-if="isAudit && report.otherInformation.some(item => reviewComment('otherInformation.' + item.id))">点击信息小标题可添加或编辑审核意见</p></div></div>
      <div class="detail-module-content">
      <detail-rich-content class="rich-content">
        <section v-for="item in report.otherInformation" :key="item.id" class="rich-text-section"><h3 :class="{ 'review-heading': isAudit }"><button v-if="isAudit" type="button" @click="openReview('otherInformation.' + item.id)">{{ item.title }}</button><template v-else>{{ item.title }}</template></h3><div class="rich-text-field" :class="reportReviewClass('otherInformation.' + item.id)"><p v-for="(paragraph, paragraphIndex) in item.paragraphs" :key="paragraphIndex">{{ paragraph }}</p></div></section>
      </detail-rich-content>
      </div>
    </section>

    <section id="report-communication" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="notification" /></span><div><h2>传播信息</h2><p v-if="isAudit && reviewComment('communication')">点击信息小标题可添加或编辑审核意见</p></div></div>
      <div class="detail-module-content">
      <detail-rich-content class="rich-content"><section class="rich-text-section"><h3 :class="{ 'review-heading': isAudit }"><button v-if="isAudit" type="button" @click="openReview('communication')">项目传播情况</button><template v-else>项目传播情况</template></h3><div class="rich-text-field" :class="reportReviewClass('communication')"><p>{{ report.communication }}</p></div></section></detail-rich-content>
      </div>
    </section>

    <section id="report-budget" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>在线预算表</h2></div></div>
      <div class="detail-module-content">
      <budget-prototype embedded :project-name="report.projectName" :budget="reportBudgetTemplate" />
      </div>
    </section>

    <section id="report-attachments" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2></div></div>
      <div class="detail-module-content">
      <div v-if="report.attachments.length" class="attachment-list"><div v-for="file in report.attachments" :key="file.name"><div><strong>{{ file.name }}</strong><span>{{ file.type }} · {{ report.editedAt }}</span></div><a-button type="link" :aria-label="'预览' + file.name" @click="openAttachment(file, '预览')">预览</a-button><a-button type="link" :aria-label="'下载' + file.name" @click="openAttachment(file, '下载')">下载</a-button></div></div>
      <a-empty v-else class="report-empty" description="暂无附件" />
      </div>
    </section>

    <section id="report-benefits" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="environment" /></span><div><h2>收益指标成果</h2><p v-if="isAudit && report.benefits.some(item => benefitReviewComment(item))">点击行任意位置可添加或编辑审核意见</p></div></div>
      <div class="detail-module-content">
      <div class="detail-table-wrap"><table class="detail-table report-benefits-table"><colgroup><col class="report-benefit-indicator" /><col /><col /><col /><col /><col /></colgroup><thead><tr><th>收益指标</th><th>分类</th><th>中文名</th><th>拉丁文名</th><th>受益数量</th><th>备注</th></tr></thead><tbody><tr v-for="benefit in report.benefits" :key="benefit.id" :class="[{ 'review-has-comment': isAudit && !!benefitReviewComment(benefit) }, { 'review-row-trigger': isAudit }]" v-bind="reviewAttrs(!!benefit.id)" v-on="reviewEvents('benefits.' + benefit.id, !!benefit.id)"><td><span @click="isAudit && benefitReviewComment(benefit) && $event.stopPropagation()" @keydown="isAudit && benefitReviewComment(benefit) && $event.stopPropagation()"><review-comment-label :comment="isAudit ? benefitReviewComment(benefit) : ''">{{ benefit.indicator }}</review-comment-label></span></td><td>{{ benefit.category }}</td><td>{{ benefit.name }}</td><td><i>{{ benefit.latinName }}</i></td><td>{{ benefit.quantity }}</td><td>{{ benefit.remark }}</td></tr><tr v-if="!report.benefits.length"><td colspan="6" class="report-empty">暂无收益指标成果</td></tr></tbody></table></div>
      </div>
    </section>

    <section id="report-history" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
      <div class="detail-module-content">
      <a-timeline v-if="report.auditHistory.length" class="audit-timeline">
        <a-timeline-item v-for="entry in report.auditHistory" :key="entry.time" :color="entry.result === '通过' ? '#70B603' : '#FF4D4F'">
          <div class="audit-entry"><strong>审核结果：{{ entry.result }}</strong><div class="audit-result-row"><span class="audit-info-chip audit-time">{{ entry.time }} · {{ entry.reviewer }}</span></div><div class="audit-result-details"><p><b>审核备注：</b>{{ entry.remark || '—' }}</p></div></div>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else class="report-empty" description="暂无审核信息" />
      </div>
    </section>

    <section v-if="isAudit" id="report-audit" class="panel detail-section">
      <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>审核</h2></div></div>
      <div class="detail-module-content">
      <form class="project-audit-form" @submit.prevent="submitAudit">
        <div class="audit-form-grid">
          <div class="audit-form-column">
            <div class="audit-form-row" :class="{ 'report-field-error': formErrors.result }">
              <label id="report-result-label" for="report-result"><em>*</em> 审核结果：</label>
              <a-select id="report-result" v-model="auditForm.result" aria-labelledby="report-result-label" placeholder="请选择审核结果" @change="formErrors.result = ''"><a-select-option value="approved">通过</a-select-option><a-select-option value="rejected">驳回</a-select-option></a-select>
              <p v-if="formErrors.result" class="report-error" role="alert">{{ formErrors.result }}</p>
            </div>
            <div class="audit-form-row" :class="{ 'report-field-error': formErrors.payment }">
              <label id="report-payment-label" for="report-payment"><em>*</em> 请款确认：</label>
              <a-select id="report-payment" v-model="auditForm.paymentCents" aria-labelledby="report-payment-label" placeholder="请选择请款状态与金额" @change="formErrors.payment = ''"><a-select-option v-for="option in paymentOptions" :key="option.value" :value="option.value">{{ option.label }}</a-select-option></a-select>
              <p v-if="formErrors.payment" class="report-error" role="alert">{{ formErrors.payment }}</p>
            </div>
          </div>
          <div class="audit-form-column">
            <div class="audit-form-row" :class="{ 'report-field-error': formErrors.remark }"><label for="report-remark"><em v-if="auditForm.result === 'rejected'">*</em> 审核备注信息：</label><a-textarea id="report-remark" v-model="auditForm.remark" :rows="5" placeholder="驳回时必填" @change="formErrors.remark = ''" /><p v-if="formErrors.remark" class="report-error" role="alert">{{ formErrors.remark }}</p></div>
          </div>
        </div>
        <div class="audit-form-actions"><a-button @click="backToDashboard">取消</a-button><a-button type="primary" html-type="submit">确认</a-button></div>
      </form>
      </div>
    </section>

    <a-modal v-model="paymentMismatchVisible" :mask-closable="false" :closable="false" :width="480" :footer="null" class="report-mismatch-modal"><div class="report-mismatch-dialog"><div class="report-mismatch-heading"><a-icon type="close-circle" class="report-dialog-error-icon" /><h3>不能完成审核</h3></div><p class="report-mismatch-copy">请款状态确认与实际不符，请核实请款状态</p><div class="report-mismatch-actions"><a-button type="primary" @click="paymentMismatchVisible = false">关闭</a-button></div></div></a-modal>
    <a-modal v-model="aidConfirmationVisible" :mask-closable="false" :closable="false" :width="520" :footer="null" class="report-aid-modal"><div class="report-aid-dialog"><div class="report-aid-heading"><a-icon type="info-circle" class="report-dialog-info-icon" /><h3>本项目对受益人进行款物资助</h3></div><p class="report-aid-copy">{{ report.aidCompleted ? '已完成款物的资助' : '未完成款物的资助' }}</p><div class="report-aid-actions"><a-button @click="aidConfirmationVisible = false">取消</a-button><a-button type="primary" @click="finishAudit">确认</a-button></div></div></a-modal>
    <a-modal v-model="auditPreviewVisible" title="本地审核校验完成" :mask-closable="false" :width="520"><p>审核结果：{{ auditForm.result === 'approved' ? '通过' : '驳回' }}</p><p>当前为前端演示，审核信息尚未提交至服务器。</p><template slot="footer"><a-button type="primary" @click="auditPreviewVisible = false">关闭</a-button></template></a-modal>
    <a-modal v-if="isAudit" v-model="reviewVisible" title="编辑审核意见" :width="560" :mask-closable="false" @cancel="reviewVisible = false">
      <a-textarea v-model="reviewDraft" aria-label="审核意见" placeholder="请输入审核意见" :rows="5" />
      <template slot="footer"><div class="review-dialog-actions"><a-button v-if="reviewComment(reviewField)" type="danger" @click="deleteReview">删除</a-button><div class="review-dialog-actions-right"><a-button v-if="!reviewComment(reviewField)" @click="reviewVisible = false">取消</a-button><a-button type="primary" @click="saveReview">{{ reviewComment(reviewField) ? '修改' : '确认' }}</a-button></div></div></template>
    </a-modal>
    <a-modal v-model="attachmentDialog.visible" :title="attachmentDialog.action + '附件'" :mask-closable="false" :width="560"><div class="report-attachment-message"><strong>{{ attachmentDialog.name }}</strong><p>当前为前端演示，尚未接入附件服务，暂无可供{{ attachmentDialog.action }}的原始文件。</p></div><template slot="footer"><a-button @click="attachmentDialog.visible = false">关闭</a-button></template></a-modal>
    <a-modal v-model="budgetDialog.visible" :title="budgetDialog.name" :mask-closable="false" :width="1080" class="report-budget-modal">
      <div class="report-budget-heading"><strong>{{ report.projectName }}</strong><span>{{ report.organization }} · 金额单位：元</span></div>
      <div class="detail-table-wrap report-budget-preview">
        <table v-if="budgetDialog.id === 'detail'" class="detail-table"><thead><tr><th>预算科目</th><th>预算金额</th><th>已执行金额</th><th>执行率</th></tr></thead><tbody><tr v-for="row in report.budgetRows" :key="row.name"><td>{{ row.name }}</td><td>{{ money(row.budgetCents) }}</td><td>{{ money(row.executedCents) }}</td><td>{{ ratio(row.executedCents, row.budgetCents) }}</td></tr><tr class="report-budget-total"><td>合计</td><td>{{ money(report.fundingCents) }}</td><td>{{ money(executedCents) }}</td><td>{{ ratio(executedCents, report.fundingCents) }}</td></tr></tbody></table>
        <table v-else-if="budgetDialog.id === 'staff'" class="detail-table"><thead><tr><th>岗位</th><th>工作内容</th><th>分摊比例</th><th>已分摊金额</th></tr></thead><tbody><tr v-for="row in report.staffRows" :key="row.role"><td>{{ row.role }}</td><td>{{ row.work }}</td><td>{{ row.share }}</td><td>{{ money(row.cents) }}</td></tr><tr class="report-budget-total"><td colspan="3">合计</td><td>{{ money(report.staffRows.reduce((total, row) => total + row.cents, 0)) }}</td></tr></tbody></table>
        <table v-else class="detail-table"><thead><tr><th>申请SEE基金会资金</th><th>累计执行金额</th><th>剩余预算</th><th>项目预算总执行率</th></tr></thead><tbody><tr><td>{{ money(report.fundingCents) }}</td><td>{{ money(executedCents) }}</td><td>{{ money(report.fundingCents - executedCents) }}</td><td>{{ ratio(executedCents, report.fundingCents) }}</td></tr></tbody></table>
      </div><p class="report-budget-demo-note">以上为前端演示数据，正式预算以业务系统记录为准。</p><template slot="footer"><a-button @click="budgetDialog.visible = false">关闭</a-button></template>
    </a-modal>
  </section>
  <section v-else class="panel report-not-found"><a-empty description="未找到对应的进展/结项报告"><a-button type="primary" @click="goBack">返回</a-button></a-empty></section>
</template>

<script>
import reports from '../mock/report-examples'
import { reviewText, rowReviewText } from '../utils/report-review'
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import BudgetPrototype from '../components/BudgetPrototype.vue'
import defaultTableData from '../mock/project-tables.json'
import progressReportDetails from '../mock/report-progress-detail.json'

// 本地报告场景与 SEE 工作台的待办项目对应，后续由报告详情接口替换。
// P-001006：需请款的进展报告；P-001007：无需请款且涉及款物资助的结项报告。
const reportBudgetTemplate = {
  ...defaultTableData.budget,
  organization: reports[0].organization,
  period: reports[0].projectPeriod,
  partners: '无',
  executionCutoff: '2026年06月03日',
  rows: [
    { id: 'report-total', kind: 'total', quarters: ['120,000.00', '120,000.00', '130,000.00', '130,000.00'], total: '500,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '500,000.00', executed: '194,000.00', executionRatio: '38.8%' },
    { id: 'report-support', kind: 'group', code: '1-支撑', name: '项目支撑费用', quarters: ['30,000.00', '30,000.00', '30,000.00', '30,000.00'], total: '120,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '120,000.00', executed: '44,000.00', executionRatio: '36.7%' },
    { id: 'report-staff', kind: 'detail', code: '1.1', name: '项目协调与数据管理', detail: '项目协调、监测数据整理及资料归档', type: '人力成本', quarters: ['30,000.00', '30,000.00', '30,000.00', '30,000.00'], total: '120,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '120,000.00', executed: '44,000.00', executionRatio: '36.7%' },
    { id: 'report-output-1', kind: 'group', code: '产出1', name: '建立大熊猫栖息地监测与巡护体系', quarters: ['60,000.00', '60,000.00', '70,000.00', '70,000.00'], total: '260,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '260,000.00', executed: '110,000.00', executionRatio: '42.3%' },
    { id: 'report-activity-1', kind: 'activity', code: '产出活动1.1', name: '开展红外相机监测与样线巡护', quarters: ['60,000.00', '60,000.00', '70,000.00', '70,000.00'], total: '260,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '260,000.00', executed: '110,000.00', executionRatio: '42.3%' },
    { id: 'report-equipment', kind: 'detail', code: '1.1.1', name: '监测设备与巡护物资', detail: '红外相机、存储设备及样线巡护物资', type: '设备及材料', quarters: ['35,000.00', '35,000.00', '45,000.00', '45,000.00'], total: '160,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '160,000.00', executed: '78,000.00', executionRatio: '48.8%' },
    { id: 'report-travel', kind: 'detail', code: '1.1.2', name: '监测巡护差旅', detail: '重点栖息地巡检、样线调查及社区走访', type: '交通差旅费', quarters: ['25,000.00', '25,000.00', '25,000.00', '25,000.00'], total: '100,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '100,000.00', executed: '32,000.00', executionRatio: '32.0%' },
    { id: 'report-output-2', kind: 'group', code: '产出2', name: '提升社区参与栖息地保护与可持续管护的能力', quarters: ['30,000.00', '30,000.00', '30,000.00', '30,000.00'], total: '120,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '120,000.00', executed: '40,000.00', executionRatio: '33.3%' },
    { id: 'report-activity-2', kind: 'activity', code: '产出活动2.1', name: '组织社区培训与保护实践活动', quarters: ['30,000.00', '30,000.00', '30,000.00', '30,000.00'], total: '120,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '120,000.00', executed: '40,000.00', executionRatio: '33.3%' },
    { id: 'report-training', kind: 'detail', code: '2.1.1', name: '社区培训与巡护支持', detail: '社区培训组织、巡护物资发放及现场实践', type: '活动费用', quarters: ['30,000.00', '30,000.00', '30,000.00', '30,000.00'], total: '120,000.00', adjustment: null, adjustmentRatio: null, adjustmentDetail: null, adjustedBudget: '120,000.00', executed: '40,000.00', executionRatio: '33.3%' }
  ]
}
const emptyForm = () => ({ result: undefined, paymentCents: undefined, remark: '' })
const emptyErrors = () => ({ result: '', payment: '', remark: '' })

// 仅在相邻可见内容区块之间插入装饰分隔线。
const DetailRichContent = {
  functional: true,
  render (h, context) {
    const nodes = []
    let count = 0
    ;(context.children || []).forEach(node => {
      if (node.tag === 'section' && count++) nodes.push(h('div', { class: 'detail-rich-separator', attrs: { 'aria-hidden': 'true' } }, [h('span', { class: 'detail-rich-separator-dot' })]))
      nodes.push(node)
    })
    return h('article', context.data, nodes)
  }
}

export default {
  name: 'ReportDetail',
  components: { BudgetPrototype, DetailRichContent, ReviewCommentLabel },
  props: { reportId: { type: String, required: true }, mode: { type: String, default: 'view' } },
  data () { return {
    reports, auditForm: emptyForm(), formErrors: emptyErrors(), paymentOptions: [],
    paymentMismatchVisible: false, aidConfirmationVisible: false, auditPreviewVisible: false,
    reviewVisible: false, reviewField: '', reviewDraft: '', reviewComments: {},
    budgetDialog: { visible: false, id: '', name: '' }, attachmentDialog: { visible: false, name: '', action: '' }, reportBudgetTemplate,
    budgetSheets: [{ id: 'detail', name: '预算及执行明细表', confirmed: true }, { id: 'staff', name: '人力成本分摊表', confirmed: true }, { id: 'summary', name: '预算及执行汇总表', confirmed: false }],
  } },
  computed: {
    report () { return this.reports.find(item => item.id === this.reportId) },
    isAudit () { return this.mode === 'audit' },
    executedCents () { return this.report ? this.report.budgetRows.reduce((total, row) => total + row.executedCents, 0) : 0 },
    basicFields () {
      if (!this.report) return []
      const keys = ['projectType', 'strategy', 'issue', 'organization', 'projectPeriod', 'reportPeriod', 'funding', 'executed', 'executionRate', 'request', 'requestRate', 'beneficiaryAid', 'aidCompleted', 'reporter', 'contact', 'filledAt']
      const reviewableKeys = ['reportPeriod', 'request', 'reporter', 'contact', 'filledAt']
      if (this.report.beneficiaryAid) reviewableKeys.push('aidCompleted')
      if (this.report.id === 'P-001006') return progressReportDetails['P-001006'].basic.fields.map((field, index) => ({ ...field, key: keys[index], reviewable: reviewableKeys.includes(keys[index]), wide: ['funding', 'filledAt'].includes(keys[index]) }))
      const r = this.report
      return [
        { key: 'projectType', label: '项目类型', value: r.projectType }, { key: 'strategy', label: '项目策略', value: r.strategy },
        { key: 'issue', label: '项目议题', value: r.issue }, { key: 'organization', label: '执行机构', value: r.organization },
        { key: 'projectPeriod', label: '项目执行周期', value: r.projectPeriod }, { key: 'reportPeriod', label: '本报告执行周期', value: r.reportPeriod, reviewable: true },
        { key: 'funding', label: '申请SEE基金会资金 / 筹款目标', value: this.moneyWithUppercase(r.fundingCents), wide: true },
        { key: 'executed', label: '已执行预算金额（包括本报告提交的执行额）', value: this.moneyWithUppercase(this.executedCents) },
        { key: 'executionRate', label: '项目预算总执行率', value: this.ratio(this.executedCents, r.fundingCents) },
        { key: 'request', label: '本次报告请款', value: r.requestedCents ? this.moneyWithUppercase(r.requestedCents) : '无需请款', reviewable: true },
        { key: 'requestRate', label: '本报告通过后请款比例', value: this.ratio(r.paidCents + r.requestedCents, r.fundingCents) },
        { key: 'beneficiaryAid', label: '直接或委托其他组织资助给受益人款物', value: r.beneficiaryAid ? '是' : '否' },
        { key: 'aidCompleted', label: '已完成对受益人款物的资助', value: r.beneficiaryAid ? (r.aidCompleted ? '是' : '否') : '不涉及', reviewable: !!r.beneficiaryAid },
        { key: 'reporter', label: '报告人', value: r.reporter, reviewable: true }, { key: 'contact', label: '联系方式', value: r.contact, reviewable: true }, { key: 'filledAt', label: '报告填写日期', value: r.filledAt, reviewable: true, wide: true }
      ]
    }
  },
  watch: {
    reportId: { immediate: true, handler () { this.resetReport() } },
    mode () { this.closeDialogs() }
  },
  methods: {
    money (cents) { return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    moneyWithUppercase (cents) {
      // 本地报告的已知金额；接入接口时可直接使用接口返回的大写金额。
      const uppercase = { 50000000: '伍拾万元整', 19400000: '壹拾玖万肆仟元整', 48500000: '肆拾捌万伍仟元整', 20000000: '贰拾万元整' }
      return this.money(cents) + ' 元' + (uppercase[cents] ? '（' + uppercase[cents] + '）' : '')
    },
    ratio (amount, total) { return total ? (amount / total * 100).toFixed(1) + ' %' : '—' },
    resetReport () {
      this.auditForm = emptyForm()
      this.formErrors = emptyErrors()
      this.closeDialogs()
      if (!this.report) { this.paymentOptions = []; return }
      let comments = { ...(this.report.reviewComments || {}) }
      try { const saved = JSON.parse(localStorage.getItem('see-report-review-example-' + this.reportId)); if (saved && saved.reviewComments && typeof saved.reviewComments === 'object' && !Array.isArray(saved.reviewComments)) comments = saved.reviewComments } catch (error) { /* Use report data if local data is invalid. */ }
      this.$set(this.report, 'reviewComments', comments)
      this.reviewComments = this.report.reviewComments
      const requested = this.report.requestedCents
      const alternative = (Math.floor(Math.random() * 9) + 1) * 1000000
      const amounts = requested ? [0, requested, requested + alternative] : [0, alternative, alternative + 10000000]
      // 按原型随机排列，金额不标注“正确/错误”，也不预选答案。
      for (let index = amounts.length - 1; index > 0; index--) {
        const swap = Math.floor(Math.random() * (index + 1))
        const value = amounts[index]; amounts[index] = amounts[swap]; amounts[swap] = value
      }
      this.paymentOptions = amounts.map(value => ({ value, label: value ? '请款 ' + this.money(value) + ' 元' : '无需请款' }))
    },
    closeDialogs () { this.paymentMismatchVisible = false; this.aidConfirmationVisible = false; this.auditPreviewVisible = false; this.reviewVisible = false; this.budgetDialog.visible = false; this.attachmentDialog.visible = false },
    goBack () {
      if (window.history.length > 1) this.$router.go(-1)
      else this.$router.push({ name: 'project-reports' })
    },
    backToDashboard () { this.$router.push({ name: 'dashboard-see' }) },
    openBudget (sheet) { this.budgetDialog = { visible: true, id: sheet.id, name: sheet.name } },
    openAttachment (file, action) { this.attachmentDialog = { visible: true, name: file.name, action } },
    outputReviewKey (id) { return `outputs.output-${String(id).replace(/\./g, '-')}` },
    activityReviewKey (id) { return `activities.activity-${String(id).replace(/\./g, '-')}` },
    reviewAttrs (enabled) { return this.isAudit && enabled ? { role: 'button', tabindex: 0 } : {} },
    reviewEvents (key, enabled) {
      if (!this.isAudit || !enabled) return {}
      return { click: () => this.openReview(key), keydown: event => { if (event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openReview(key) } } }
    },
    reviewComment (key) { return reviewText(this.reviewComments, key) },
    benefitReviewComment (row) { return rowReviewText(this.reviewComments, 'benefits.' + row.id, ['indicator', 'category', 'name', 'latinName', 'quantity', 'remark']) },
    progressReviewClass (key, latest) { return { 'is-latest': latest, 'review-row-trigger': this.isAudit && latest, 'review-has-comment': this.isAudit && latest && !!this.reviewComment(key) } },
    reportReviewClass (key) {
      return { 'review-has-comment': this.isAudit && !!this.reviewComment(key) }
    },
    openReview (key) {
      if (!this.isAudit) return
      this.reviewField = key
      this.reviewDraft = this.reviewComment(key)
      this.reviewVisible = true
    },
    saveReview () {
      if (!this.isAudit) return
      const previous = { ...this.reviewComments }
      const text = typeof this.reviewDraft === 'string' ? this.reviewDraft.trim() : ''
      if (text) this.$set(this.reviewComments, this.reviewField, text)
      else this.$delete(this.reviewComments, this.reviewField)
      if (!this.persistReviewComments(previous)) return
      this.reviewVisible = false
    },
    deleteReview () { this.reviewDraft = ''; this.saveReview() },
    persistReviewComments (previous) {
      try { localStorage.setItem('see-report-review-example-' + this.reportId, JSON.stringify({ reviewComments: this.reviewComments })); return true }
      catch (error) {
        Object.keys(this.reviewComments).forEach(key => this.$delete(this.reviewComments, key))
        Object.keys(previous).forEach(key => this.$set(this.reviewComments, key, previous[key]))
        this.$message.error('本地审核意见保存失败，请重试'); return false
      }
    },
    submitAudit () {
      if (!this.report || !this.isAudit) return
      this.formErrors = emptyErrors()
      if (!this.auditForm.result) this.formErrors.result = '请选择审核结果'
      if (this.auditForm.paymentCents === undefined) this.formErrors.payment = '请选择请款状态与金额'
      if (this.auditForm.result === 'rejected' && !this.auditForm.remark.trim()) this.formErrors.remark = '驳回时请填写审核备注'
      if (Object.values(this.formErrors).some(Boolean)) return
      if (this.auditForm.paymentCents !== this.report.requestedCents) { this.paymentMismatchVisible = true; return }
      if (this.report.type === '结项报告' && this.report.beneficiaryAid) { this.aidConfirmationVisible = true; return }
      this.finishAudit()
    },
    finishAudit () {
      if (!this.report || !this.isAudit) return
      this.aidConfirmationVisible = false
      this.$set(this.report, 'reviewComments', this.reviewComments)
      this.auditPreviewVisible = true
    }
  },
  deactivated () { this.closeDialogs() }
}
</script>

<style scoped>
.detail-module-content { padding: 24px; --detail-inner-padding: 0; --detail-inner-margin: 0; }
.description-grid { --detail-inner-padding: 0 22px 22px; }
.description-item { gap: 8px; }
.detail-module-content .output-block + .output-block { margin-top: 24px; }
.attachment-list > div:first-child { padding-top: 0; align-items: start; }
.rich-content > .rich-text-section { margin: 0; }
.rich-content > .rich-text-section > h3 { margin: 0 0 12px; }
.rich-content > .rich-text-section > h3::before, .rich-content > .rich-text-section > h3::after { content: none; }
.rich-text-field > p:last-child { margin-bottom: 0; }
.rich-content >>> .detail-rich-separator { position: relative; height: 1px; margin: 40px 0; background: linear-gradient(90deg, #b7dfcf 0%, #e4f2ec 42%, transparent 100%); }
.rich-content >>> .detail-rich-separator-dot { position: absolute; left: -4px; top: 50%; width: 7px; height: 7px; transform: translateY(-50%); border: 2px solid #fff; border-radius: 50%; background: #18a66a; box-shadow: 0 0 0 2px #ccebdd; }
#report-audit > .detail-module-content { background: #fff; }
.report-benefits-table { table-layout: fixed; }
.detail-module-content > .report-empty { padding: 0; margin: 0; }
.review-dialog-actions { display: flex; justify-content: space-between; align-items: center; }
.review-dialog-actions-right { margin-left: auto; display: flex; gap: 8px; }
.report-page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.report-code { flex: none; padding: 2px 7px; border-radius: 3px; color: #5b8ff9; background: #f0f5ff; }
.report-detail-page .description-item, .report-detail-page .output-title strong, .report-detail-page .activity-card strong { min-width: 0; overflow-wrap: anywhere; }
.report-detail-page .review-label-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.report-detail-page .rich-text-field.review-has-comment { background: #fff1f0; }
.report-benefits-table tr.review-row-trigger { cursor: pointer; }
.report-benefits-table tr.review-row-trigger:hover > td { background: #f8fbff; }
.report-benefits-table tr.review-has-comment > td { background: #fff1f0; }
.report-benefits-table tr.review-has-comment:hover > td { background: #ffe7e5; }
.report-benefits-table tr.review-row-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.report-detail-page .output-title > span { flex: none; }

.report-progress-records h3, .report-activity-label { margin: 0 0 12px; color: #18253c; font-size: 14px; font-weight: 600; }
.report-progress-entry { position: relative; display: grid; grid-template-columns: 94px minmax(0, 1fr); align-items: start; gap: 16px; padding: 3px 0 11px; border-top: 0; }
.report-progress-entry time { color: #18253c; font-variant-numeric: tabular-nums; line-height: 1.65; }
.report-progress-entry p { position: relative; margin: 0; min-width: 0; color: #18253c; line-height: 1.65; overflow-wrap: anywhere; }



.report-detail-page .output-standard > div { padding-top: 4px; }
.output-progress-records { display: grid; grid-template-columns: max-content minmax(0, 1fr); align-items: start; gap: 8px; margin: 0; padding: 16px 18px; border: 0; border-radius: 0; background: #fff; }
.output-progress-records > h3 { width: max-content; margin: 0; padding: 4px 9px; border-radius: 6px; color: #1677ff; background: #edf5ff; font-size: var(--text-14); line-height: 1.55; }
.output-progress-list { min-width: 0; padding-top: 0; }
.output-progress-list .report-progress-entry + .report-progress-entry { padding-top: 8px; border-top: 1px solid #edf1f5; }
.output-progress-list .report-progress-entry time, .output-progress-list .report-progress-entry p { font-size: var(--text-14); }
.output-progress-list .report-progress-entry p { white-space: normal; }

.output-progress-list .report-progress-entry.is-latest { min-height: 48px; padding-top: 12px; padding-bottom: 12px; }
.output-progress-list .report-progress-entry.is-latest time, .output-progress-list .report-progress-entry.is-latest p { color: #1677ff; }
.report-detail-page .activity-progress-records { margin: 18px 0 0; padding: 0; border: 0; border-radius: 0; background: transparent; }
.report-detail-page .activity-progress-records h3 { margin: 0 0 8px; color: #18a66a; }
.activity-progress-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.activity-progress-table td { padding: 10px 0; color: #18253c; vertical-align: top; line-height: 1.65; overflow-wrap: anywhere; }
.activity-progress-table tr + tr td { border-top: 1px solid #edf1f5; }
.activity-progress-table tr.is-latest td { color: #18a66a; }
.activity-progress-table td:first-child { width: 110px; padding-right: 16px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.report-activity-label { margin-bottom: 6px; }
.report-detail-page .activity-card > p { color: #18253c; }
.report-detail-page .activity-card > div:first-child > span { flex: none; }
.report-detail-page .rich-content h3 { font-size: 16px; }
.report-detail-page .rich-text-field { overflow-wrap: anywhere; }
.report-benefits-table td { overflow-wrap: anywhere; }
.report-benefits-table .report-benefit-indicator { width: 120px; }
.report-benefits-table th:first-child, .report-benefits-table td:first-child { text-align: center; }
.report-benefits-table th:nth-child(4), .report-benefits-table th:last-child { width: 24%; }
#report-audit { background: #fff6f6; border-color: #f1dede; }
#report-audit > .detail-section-header { background: #ffd9d9; border-bottom-color: #efbaba; }
#report-audit > .detail-section-header .detail-section-icon { color: #cf1322; background: #fff; }
.report-detail-page .audit-form-grid { column-gap: clamp(48px,8vw,160px); }
.report-detail-page .audit-form-row:last-child { margin-bottom: 0; }
.report-detail-page .audit-form-actions .ant-btn { box-shadow: 0 2px 0 rgba(0,0,0,.043); }
.report-error { margin: 0; color: #ff4d4f; line-height: 1.6; }
.report-field-error >>> .ant-select-selection, .report-field-error >>> textarea { border-color: #ff4d4f; }
.report-dialog-message { display: flex; align-items: flex-start; gap: 12px; }
.report-dialog-message > .anticon { font-size: 22px; }
.report-dialog-message p { margin: 0; line-height: 1.7; }
.report-dialog-error-icon { color: #ff4d4f; }.report-dialog-info-icon { color: #fa8c16; }
.report-mismatch-modal >>> .ant-modal-body { padding: 36px 28px 28px; }
.report-mismatch-heading { display: flex; align-items: center; gap: 12px; }
.report-mismatch-heading .anticon { font-size: 22px; }
.report-mismatch-dialog h3 { margin: 0; color: #18253c; font-size: 16px; font-weight: 700; line-height: 1.5; }
.report-mismatch-copy { margin: 8px 0 0 34px; color: #718095; line-height: 1.7; }
.report-mismatch-actions { display: flex; justify-content: flex-end; margin-top: 24px; }
.report-mismatch-actions .ant-btn { min-width: 72px; height: 32px; box-shadow: 0 2px 0 rgba(0,0,0,.043); }
.report-aid-modal >>> .ant-modal-body { padding: 36px 28px 28px; }
.report-aid-heading { display: flex; align-items: center; gap: 12px; }
.report-aid-heading .anticon { font-size: 22px; }
.report-aid-dialog h3 { margin: 0; color: #18253c; font-size: 16px; font-weight: 700; line-height: 1.5; }
.report-aid-copy { margin: 8px 0 0 34px; color: #718095; line-height: 1.7; }
.report-aid-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.report-aid-actions .ant-btn { min-width: 72px; height: 32px; box-shadow: 0 2px 0 rgba(0,0,0,.043); }
.report-attachment-message strong, .report-budget-heading strong { display: block; overflow-wrap: anywhere; line-height: 1.7; }
.report-attachment-message p { margin: 12px 0 0; color: #718095; line-height: 1.7; }
.report-budget-heading span { display: block; margin-top: 8px; color: #718095; }
.report-budget-preview { margin: 20px 0; }
.report-budget-preview table { table-layout: fixed; }
.report-budget-preview td { overflow-wrap: anywhere; }
.report-budget-total { background: #f7f9fc; font-weight: 600; }
.report-budget-demo-note { margin: 0; color: #718095; }
.report-empty { padding: 24px; text-align: center; color: #718095; }
.report-not-found { padding: 72px 24px; }
.review-dialog-actions-right > .ant-btn + .ant-btn { margin-left: 0; }
.report-progress-entry.review-row-trigger, .activity-progress-table .review-row-trigger { cursor: pointer; }
.report-progress-entry.review-row-trigger:hover, .activity-progress-table .review-row-trigger:hover > td { background: #f8fbff; }
.report-progress-entry.review-has-comment:hover, .activity-progress-table .review-has-comment:hover > td { background: #ffe7e5 !important; }
.activity-progress-table .review-has-comment > td { background: #fff1f0; }
.report-progress-entry.review-row-trigger:focus-visible, .activity-progress-table .review-row-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
</style>
