<template>
  <section class="panel detail-section form-section">
    <div class="detail-section-header"><span class="detail-section-icon green"><a-icon :type="part === 'goals' ? 'flag' : 'team'" /></span><div><h2>{{ part === 'community' ? '社群参与情况反馈' : part === 'goals' ? '项目目标及完成' : '人员分工' }}</h2><p v-if="part === 'organization' && !editing">人员为橙色时，表示该人员为新增或有属性变更</p><p v-if="hasComments && (!editing || part !== 'organization') && (editing || report.type === '结项报告')">{{ editing ? '请检查并修改标红的内容，点击信息小标题或行可查看审核意见' : '点击信息小标题或人员行可添加或编辑审核意见' }}</p></div></div>
    <div class="detail-module-content" :class="{ 'green-report-organization': part === 'organization', 'community-report-content': part === 'community' }">
      <div v-if="part === 'community'" class="description-grid">
        <div v-for="field in visibleSections" :key="field.key" class="description-item wide" :class="{ 'review-has-comment': (audit || editing) && !!comment('communitySections.' + field.key), 'review-label-trigger': audit }" v-bind="attrs(audit)" v-on="events('communitySections.' + field.key, audit)">
          <span><review-comment-label v-if="editing" overlay-class-name="report-edit-review-comment" :comment="comment('communitySections.' + field.key)">{{ field.title }}</review-comment-label><template v-else>{{ field.title }}</template></span>
          <a-textarea v-if="editing" :value="communityText(field)" :aria-label="field.title" :rows="3" :placeholder="'请填写' + field.title" @change="updateCommunity(field, $event.target.value)" />
          <strong v-else class="basic-field-multiline">{{ communityText(field) }}</strong>
        </div>
      </div>
      <article v-else-if="part === 'goals'" class="rich-content">
        <template v-for="(field, index) in visibleSections">
          <div v-if="index" :key="field.key + '-separator'" class="project-rich-separator" aria-hidden="true"><span class="project-rich-separator-dot"></span></div>
          <section :key="field.key" class="project-rich-section">
            <h3 :class="{ 'review-heading': audit && field.editable }"><review-comment-label v-if="editing" overlay-class-name="report-edit-review-comment" :comment="comment(sectionKey + '.' + field.key)">{{ field.title }}</review-comment-label><button v-else-if="audit && field.editable" type="button" @click="$emit('review', sectionKey + '.' + field.key)">{{ field.title }}</button><template v-else>{{ field.title }}</template></h3>
            <div class="rich-text-field" :class="{ 'review-has-comment': (audit || editing) && !!comment(sectionKey + '.' + field.key) }"><rich-editor v-if="editing && field.editable" v-model="field.content" :label="field.title" :placeholder="field.optional ? '如有调整请填写新的完整内容，无需调整不需要填写' : ''" /><template v-else><p v-for="(paragraph, paragraphIndex) in field.paragraphs" :key="paragraphIndex">{{ paragraph }}</p></template></div>
          </section>
        </template>
      </article>
      <template v-else>
        <div class="description-grid green-report-counts"><div v-for="item in staffCounts" :key="item.id" class="description-item" :class="{ 'review-has-comment': (audit || editing) && !!comment('staffCounts.' + item.id) }" v-bind="attrs(audit)" v-on="events('staffCounts.' + item.id, audit)"><span><review-comment-label v-if="editing" :comment="comment('staffCounts.' + item.id)">{{ item.label }}</review-comment-label><template v-else>{{ item.label }}</template></span><strong>{{ item.count }}</strong></div></div>
        <div class="detail-table-wrap"><table class="detail-table team-table green-report-members" :class="{ 'green-report-members-editing': editing }"><colgroup><col class="project-detail-index-col" /><col class="team-col-name" /><col class="team-col-role" /><col /><col class="organization-work-type-col" /><col v-if="editing" class="green-member-operation-col" /></colgroup><thead><tr><th>序号</th><th>姓名</th><th>职位</th><th>团队分工</th><th>工作性质</th><th v-if="editing" class="green-member-actions">操作</th></tr></thead><tbody><tr v-for="(member, index) in report.members" :key="member.id" :class="{ 'member-changed': isMemberChanged(member), 'review-row-has-comment': (audit || editing) && !!memberComment(member), 'review-row-trigger': audit || (editing && !!memberComment(member)) }" v-bind="attrs(audit || (editing && !!memberComment(member)))" v-on="events('members.' + member.id, audit || (editing && !!memberComment(member)))"><td>{{ index + 1 }}</td><td v-for="key in memberKeys" :key="key">{{ member[key] }}</td><td v-if="editing" class="green-member-actions" @click.stop @keydown.stop><a-button type="link" @click="openMember(member)">编辑</a-button><a-button v-if="!isOriginalMember(member)" type="link" class="danger-link" @click="removeMember(member)">删除</a-button></td></tr><tr v-if="editing"><td>{{ report.members.length + 1 }}</td><td v-for="key in memberKeys" :key="key"></td><td class="green-member-actions"><a-button type="link" @click="openMember()">新增</a-button></td></tr></tbody></table></div>
      </template>
    </div>
    <a-modal v-if="editing" v-model="memberVisible" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :title="memberId ? '编辑人员' : '增加人员'" :width="550" :mask-closable="false" @ok="saveMember" :ok-text="memberId ? '保存' : '添加'" cancel-text="取消">
      <div class="area-picker green-member-picker">
        <div v-for="key in memberKeys.filter(item => item !== 'workType')" :key="key" class="area-picker-row"><label :for="'report-member-' + key">{{ memberLabels[key] }}</label><a-textarea v-if="key === 'responsibilities'" :id="'report-member-' + key" v-model="memberDraft[key]" :rows="3" :placeholder="'请填写' + memberLabels[key]" /><a-input v-else :id="'report-member-' + key" v-model="memberDraft[key]" :placeholder="'请填写' + memberLabels[key]" /><p v-if="memberErrors[key]" class="green-member-error" role="alert">{{ memberErrors[key] }}</p></div>
        <div class="area-picker-row"><label for="report-member-work-type">工作类型</label><a-select id="report-member-work-type" v-model="memberDraft.workType" dropdown-class-name="standard-edit-dropdown" placeholder="请选择" style="width: 100%"><a-select-option v-for="type in workTypes" :key="type">{{ type }}</a-select-option></a-select><p v-if="memberErrors.workType" class="green-member-error" role="alert">{{ memberErrors.workType }}</p></div>
        <div v-if="memberDraft.workType !== '离职'" class="area-picker-row"><label for="report-member-paid">是否领薪</label><a-select id="report-member-paid" v-model="memberDraft.paid" dropdown-class-name="standard-edit-dropdown" placeholder="请选择" style="width: 100%"><a-select-option value="是">是</a-select-option><a-select-option value="否">否</a-select-option></a-select><p v-if="memberErrors.paid" class="green-member-error" role="alert">{{ memberErrors.paid }}</p></div>
      </div>
    </a-modal>
    <a-modal v-if="editing" v-model="reviewVisible" title="审核意见" :width="560" :mask-closable="false" :footer="null"><p class="green-review-text">{{ reviewContent }}</p><div class="green-review-actions"><a-button type="primary" @click="reviewVisible = false">关闭</a-button></div></a-modal>
  </section>
</template>

<script>
import { paragraphsToRichText } from '../utils/fundraising-rich-text'
import RichEditor from './FundraisingRichEditor.vue'
import ReviewCommentLabel from './ReviewCommentLabel.vue'
import { reviewText, rowReviewText } from '../utils/report-review'
import { reportMemberChanged, reportStaffCounts } from '../utils/report-members'

export default {
  name: 'GreenHomeReportSections',
  components: { RichEditor, ReviewCommentLabel },
  props: { report: { type: Object, required: true }, comments: { type: Object, default: () => ({}) }, audit: Boolean, editing: Boolean, part: { type: String, default: 'goals' } },
  data () { return { memberVisible: false, memberId: '', memberDraft: {}, memberErrors: {}, workTypes: ['全职', '兼职', '实习生', '核心志愿者', '离职'], reviewVisible: false, reviewContent: '', memberKeys: ['name', 'position', 'responsibilities', 'workType'], memberLabels: { name: '姓名', position: '职位', responsibilities: '团队分工', workType: '工作性质' } } },
  computed: {
    staffCounts () { return this.editing ? reportStaffCounts(this.report.members) : this.report.staffCounts },
    sectionKey () { return this.part === 'community' ? 'communitySections' : 'organizationSections' },
    visibleSections () { return (this.report[this.sectionKey] || []).filter(field => this.editing || !field.optional || field.paragraphs.some(text => text.trim())) },
    hasComments () { return (this.audit || this.editing) && (this.part !== 'organization' ? (this.report[this.sectionKey] || []).some(field => field.editable && this.comment(this.sectionKey + '.' + field.key)) : this.report.members.some(member => this.memberComment(member)) || this.report.staffCounts.some(item => this.comment('staffCounts.' + item.id))) }
  },
  methods: {
    communityText (field) {
      if (!this.editing) return (field.paragraphs || []).join('\n')
      const node = document.createElement('div')
      node.innerHTML = String(field.content || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n')
      return (node.textContent || '').replace(/\n$/, '')
    },
    updateCommunity (field, value) { this.$set(field, 'content', paragraphsToRichText(value.split('\n'))) },
    isOriginalMember (member) { return (this.report.applicationMembers || []).some(item => item.id === member.id) },
    isMemberChanged (member) { return Array.isArray(this.report.applicationMembers) ? reportMemberChanged(member, this.report.applicationMembers) : member.changedFromApplication === true },
    openMember (member) {
      if (!this.editing) return
      this.memberId = member ? member.id : ''
      const parts = String(member ? member.workType : '').split(' / ')
      this.memberDraft = { name: member ? member.name : '', position: member ? member.position : '', responsibilities: member ? member.responsibilities : '', workType: parts[0] || undefined, paid: parts[1] === '领薪' ? '是' : parts[1] === '不领薪' ? '否' : undefined }
      this.memberErrors = {}; this.memberVisible = true
    },
    saveMember () {
      const errors = {}
      ;['name', 'position', 'responsibilities', 'workType'].forEach(key => { if (!String(this.memberDraft[key] || '').trim()) errors[key] = '请填写' + (key === 'workType' ? '工作类型' : this.memberLabels[key]) })
      if (this.memberDraft.workType !== '离职' && !this.memberDraft.paid) errors.paid = '请选择是否领薪'
      this.memberErrors = errors
      if (Object.keys(errors).length) return
      const index = this.report.members.findIndex(item => item.id === this.memberId)
      if (this.memberId && index < 0) { this.$message.error('人员记录已变更，请重新打开编辑'); return }
      const value = { ...(index < 0 ? {} : this.report.members[index]), id: index < 0 ? 'report-member-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) : this.memberId, name: this.memberDraft.name.trim(), position: this.memberDraft.position.trim(), responsibilities: this.memberDraft.responsibilities.trim(), workType: this.memberDraft.workType === '离职' ? '离职' : this.memberDraft.workType + ' / ' + (this.memberDraft.paid === '是' ? '领薪' : '不领薪') }
      value.changedFromApplication = this.isMemberChanged(value)
      if (index < 0) this.report.members.push(value)
      else this.$set(this.report.members, index, value)
      this.$set(this.report, 'staffCounts', reportStaffCounts(this.report.members))
      this.memberVisible = false
    },
    removeMember (member) {
      if (!this.editing || this.isOriginalMember(member)) return
      this.$confirm({ title: '删除该人员？', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { const index = this.report.members.findIndex(item => item.id === member.id); if (index >= 0 && !this.isOriginalMember(member)) { this.report.members.splice(index, 1); this.$set(this.report, 'staffCounts', reportStaffCounts(this.report.members)) } } })
    },
    comment (key) { return reviewText(this.comments, key) },
    memberComment (member) { return rowReviewText(this.comments, 'members.' + member.id, this.memberKeys) },
    attrs (enabled) { return enabled ? { role: 'button', tabindex: 0 } : {} },
    events (key, enabled) { return enabled ? { click: () => this.openReview(key), keydown: event => { if (event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openReview(key) } } } : {} },
    openReview (key) {
      if (this.audit) { this.$emit('review', key); return }
      if (!this.editing) return
      this.reviewContent = key.indexOf('members.') === 0 ? rowReviewText(this.comments, key, this.memberKeys) : this.comment(key)
      if (this.reviewContent) this.reviewVisible = true
    }
  }
}
</script>

<style scoped>
.community-report-content { padding: 0; }
.community-report-content .description-grid { --detail-inner-padding: 0 22px 22px; }
.community-report-content .description-item { min-width: 0; gap: 8px; overflow-wrap: anywhere; }
.green-report-organization { padding-top: 0; }
.green-report-counts { padding: 0; margin-bottom: 24px; }
.green-report-members { table-layout: fixed; }
.green-member-operation-col { width: 130px; }
.green-member-actions { text-align: center; white-space: nowrap; }
.green-member-actions .ant-btn { height: auto; padding: 0 7px; }
.green-member-actions .danger-link { color: #ff4d4f; }
.green-member-error { grid-column: 2; margin: 4px 0 0; color: #ff4d4f; }
.green-report-members-editing .project-detail-index-col { width: 70px; }
.green-report-members-editing .team-col-name { width: 13%; }
.green-report-members-editing .team-col-role { width: 15%; }
.green-report-members-editing th:first-child, .green-report-members-editing td:first-child { text-align: center; }
.green-member-picker { display: grid; width: 470px; max-width: 100%; margin: 0 auto; padding: 0; grid-template-columns: max-content minmax(0, 1fr); gap: 16px 18px; }
.green-member-picker .area-picker-row { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; column-gap: 18px; align-items: start; }
.green-member-picker .area-picker-row > label { min-width: 0; max-width: 140px; min-height: 40px; margin: 0; padding-top: 9px; text-align: right; line-height: 22px; white-space: normal; overflow-wrap: anywhere; }
.green-member-picker .area-picker-row > :not(label) { min-width: 0; }
.green-member-picker >>> input.ant-input { box-sizing: border-box; height: 40px; padding: 0 12px; line-height: normal; }

.green-report-members .organization-work-type-col { width: 150px; }
.green-report-members .member-changed > td:not(:first-child) { color: #f59a23; }
.green-report-members tr.review-row-trigger { cursor: pointer; }
.green-report-members tr.review-row-has-comment > td { background: #fff1f0; }
.green-report-members tr:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.review-has-comment { background: #fff1f0; }
.review-has-comment >>> .rich-editable { background: #fff1f0; }
.green-review-text { font-size: var(--text-16); line-height: 24px; white-space: pre-wrap; overflow-wrap: anywhere; }
.green-review-actions { display: flex; justify-content: flex-end; }
</style>
