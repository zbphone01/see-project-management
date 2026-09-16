<template>
  <div class="dashboard-grid see-dashboard">
    <div class="primary-column">
      <section class="panel see-statistics">
        <div class="panel-header"><h2><i></i>系统数据</h2></div>
        <div class="see-stat-body">
          <div v-for="group in statistics" :key="group.key" class="see-stat-row" :class="group.key">
            <div v-for="metric in group.metrics" :key="metric.label" class="see-stat">
              <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="panel see-todos">
        <div class="panel-header"><h2><i></i>待办事项</h2></div>
        <div class="see-shortcuts">
          <a-button v-for="action in shortcuts" :key="action.label" :class="['see-shortcut', action.tone]" @click="previewAction(action.label)"><a-icon :type="action.icon" />{{ action.label }}</a-button>
        </div>
        <div class="see-todo-list" role="table" aria-label="待办项目">
          <div class="see-todo-head" role="row"><span role="columnheader">项目名称</span><span role="columnheader">项目状态</span><span role="columnheader">操作</span></div>
          <article v-for="project in projects" :key="project.id" class="see-todo-row" role="row">
            <div class="see-project" role="cell">
              <div class="see-cover" :class="project.cover"><img v-if="project.image" :src="project.image" alt="" /><a-icon v-else :type="project.icon" /></div>
              <div class="see-project-copy">
                <h3 :title="project.name">{{ project.name }}</h3>
                <div class="see-identifiers"><span class="see-code"><a-icon type="flag" />{{ project.code }}</span><span class="see-organization"><a-icon type="bank" />{{ project.organization }}</span></div>
              </div>
            </div>
            <div role="cell"><span class="status-chip" :class="project.tone">{{ project.status }}</span></div>
            <div class="see-row-actions" role="cell">
              <button v-for="action in project.actions" :key="action" type="button" :class="{ 'see-audit': action === '审核', 'see-reject': action === '驳回', 'see-agree': action === '同意' }" @click="previewAction(action, project)">{{ action }}<a-icon v-if="(project.actions.length === 1 && action !== '审核') || action.includes('上传') || action.includes('填写') || action.includes('变更') || action.includes('下载')" type="right" /></button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <aside class="secondary-column see-information">
      <section class="panel side-panel notice-panel">
        <div class="panel-header"><h2><a-icon class="side-title-icon notice-title-icon" type="sound" theme="filled" />系统通知</h2></div>
        <button v-for="notice in notices" :key="notice.title" class="notice-item" @click="openInformation(notice.title, notice.content, notice.date)"><span><strong :title="notice.title">{{ notice.title }}</strong><time>{{ notice.date }}</time></span></button>
      </section>
      <button class="ai-assistant-banner" type="button" aria-label="打开 AI 项目助手" @click="$emit('open-ai')">
        <img class="ai-banner-avatar" src="/assets/ai-agent.png" alt="AI 项目助手头像" />
        <span class="ai-banner-copy"><strong>AI 项目助手</strong><span>申请、执行、财务问题，随时问我</span></span><span class="ai-banner-action">立即对话</span>
      </button>
      <section class="panel side-panel">
        <div class="panel-header"><h2><a-icon class="side-title-icon question-title-icon" type="question-circle" theme="filled" />常见问题</h2></div>
        <button v-for="question in questions" :key="question.title" class="side-link" @click="openInformation(question.title, question.content)"><span :title="question.title">{{ question.title }}</span><a-icon type="right" /></button>
      </section>
    </aside>

    <a-modal v-model="dialog.visible" :title="dialog.title" :mask-closable="false" :footer="null" :width="560">
      <div class="see-dialog">
        <time v-if="dialog.date">{{ dialog.date }}</time>
        <p v-if="dialog.project"><strong>{{ dialog.project }}</strong></p>
        <p>{{ dialog.content }}</p>
        <a-button type="primary" @click="dialog.visible = false">关闭</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import seeDashboardContent from '../mock/see-dashboard-content.json'

export default {
  name: 'SeeDashboard',
  data () { return {
    statistics: seeDashboardContent.statistics,
    shortcuts: [{ label: '发起招募', icon: 'notification', tone: 'see-blue' }, { label: '发起筹款规划', icon: 'file-add', tone: 'see-green' }, { label: '申请筹款规划', icon: 'form', tone: 'see-orange' }, { label: '募捐申请待审', icon: 'audit', tone: 'see-pending' }],
    projects: seeDashboardContent.projects,
    notices: [
      { title: '关于做好项目进展材料审核工作的通知', date: '2026-03-03', content: '请各项目负责人及时关注待办事项，核对项目进展材料的完整性，并与伙伴机构保持沟通。具体审核要求以正式发布的通知为准。' },
      { title: '项目协议归档及扫描件上传提醒', date: '2026-03-03', content: '请核对协议金额与签署信息，并检查协议扫描件是否清晰、完整。具体归档安排以正式通知为准。' },
      { title: '年度项目数据核对工作安排', date: '2026-03-03', content: '请核对所属项目的执行状态、进展及结项信息。如发现数据差异，请联系系统管理员确认。' }
    ],
    questions: [
      { title: '为什么要发布招募？', content: '招募用于集中说明项目方向、申请条件和材料要求，为伙伴机构提供统一的申请入口。具体发布流程以机构管理制度为准。' },
      { title: '所属部门资助的项目需要申请筹款怎么办？', content: '可从“申请筹款规划”入口了解办理事项，并联系项目负责人确认筹款安排和所需材料。当前页面为前端演示，尚未接入申请业务。' },
      { title: '项目列表为什么看不到驳回的进展或结项？', content: '项目状态与单次进展、结项报告的审核状态可能不同。请进入对应项目详情，查看进展或结项记录及审核意见；具体显示规则以业务系统为准。' }
    ],
    dialog: { visible: false, title: '', content: '', date: '', project: '' }
  } },
  methods: {
    openInformation (title, content, date = '') { this.dialog = { visible: true, title, content, date, project: '' } },
    previewAction (action, project) {
      if (action === '审核' && project && project.status === '申请待审' && project.auditProjectId) {
        this.$router.push({ name: 'project-detail', params: { id: String(project.auditProjectId) }, query: { mode: 'audit' } })
        return
      }
      if (action === '审核' && project && project.status === '进展待审' && project.reportId) {
        this.$router.push({ name: 'report-detail', params: { id: project.reportId }, query: { mode: 'audit' } })
        return
      }
      this.dialog = { visible: true, title: action, project: project ? project.name : '', date: '', content: `“${action}”入口已预留。当前为前端演示，尚未接入对应业务接口，不会提交审批、修改项目或生成业务文件。` }
    }
  }
}
</script>

<style scoped>
.see-stat-body { padding: 0 20px; }
.see-stat-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; padding: 16px 0; border-bottom: 1px solid #edf1f5; }
.see-stat-row:last-child { border-bottom: 0; }
.see-stat { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.see-stat > span { color: #718095; min-height: 42px; line-height: 21px; display: flex; align-items: center; }
.see-stat strong { font-size: 18px; line-height: 28px; font-weight: 600; font-variant-numeric: tabular-nums; color: #87d068; }
.funded strong { color: #02a7f0; }.joint strong { color: #8080ff; }
.see-todos .panel-header h2 > i { background: #ff4d4f; }
.see-shortcuts { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 20px; padding: 22px 0; border-bottom: 1px solid #edf1f5; }
.see-shortcut { height: 32px; border-radius: 5px; box-shadow: 0 2px 0 rgba(0,0,0,.043); }
.see-blue { --shortcut-color: #1677ff; }.see-green { --shortcut-color: #18a66a; }.see-orange { --shortcut-color: #fa8c16; }.see-pending { --shortcut-color: #8080ff; }
.see-shortcut { color: #fff; border-color: var(--shortcut-color); background: var(--shortcut-color); }
.see-shortcut:hover,.see-shortcut:focus,.see-shortcut:active { color: var(--shortcut-color); border-color: var(--shortcut-color); background: #fff; }
.see-todo-list { padding: 20px; }
.see-todo-head,.see-todo-row { display: grid; grid-template-columns: minmax(0, 1fr) 112px 136px; gap: 20px; align-items: center; }
.see-todo-head { padding: 12px 0; background: #f8fafc; color: #718095; }
.see-todo-head > :first-child { padding-left: 12px; }.see-todo-head > :not(:first-child) { text-align: center; }
.see-todo-row { padding: 20px 0; border-bottom: 1px solid #edf1f5; }.see-todo-row:last-child { border-bottom: 0; padding-bottom: 0; }
.see-project { display: flex; gap: 16px; align-items: center; min-width: 0; }
.see-cover { width: 80px; height: 80px; border-radius: 13px; flex: none; overflow: hidden; display: grid; place-items: center; font-size: 28px; }
.see-cover img { width: 100%; height: 100%; object-fit: cover; }.see-forest { background: #e2f1e6; color: #59966e; }.see-mountain { background: #e4eff2; color: #598693; }.see-report { background: #e8eef8; color: #678cb3; }.see-desert { background: #f4ecd7; color: #a58b4f; }
.see-project-copy { min-width: 0; flex: 1; }.see-project-copy h3 { margin: 0 0 16px; font-size: 16px; font-weight: 400; color: #18253c; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.see-identifiers { display: flex; flex-wrap: wrap; gap: 8px; }.see-identifiers > span { display: inline; padding: 2px 7px; border-radius: 3px; line-height: 20px; overflow-wrap: anywhere; }.see-identifiers .anticon { margin-right: 5px; }.see-code { color: #62bfe6; background: #effaff; }.see-organization { color: #61bd98; background: #f1fbf5; }
.see-dashboard .status-chip { border: 1px solid currentColor; font-size: 14px; padding: 0; }.see-dashboard .status-chip.neutral { color: #7f7f7f; background: #f2f2f2; }.see-dashboard .status-chip.pending { color: #fa8c16; background: #fff7e6; }
.see-row-actions { display: grid; justify-items: center; gap: 0; }.see-row-actions button { min-height: 24px; padding: 0 2px; border: 0; background: transparent; color: #1677ff; border-radius: 5px; }.see-row-actions button:hover { background: #f0f7ff; }.see-row-actions .anticon { margin-left: 4px; font-size: 10px; }.see-row-actions .see-reject { color: #ff4d4f; }.see-row-actions .see-agree { color: #70b603; }
.see-row-actions .see-audit { color: #fa8c16; }.see-row-actions .see-audit:hover,.see-row-actions .see-audit:focus { color: #fa8c16; background: #fff7e6; }
.see-information { overflow-y: auto; }.see-dialog p { line-height: 1.8; overflow-wrap: anywhere; }.see-dialog time { display: block; margin-bottom: 16px; color: #718095; }
</style>
