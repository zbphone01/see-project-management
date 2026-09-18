<template>
<div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark"><img src="/assets/see-logo.png" alt="SEE Logo" /></span>
        <span>项目管理系统</span>
      </div>

      <nav class="side-nav">
        <template v-for="item in navigation">
          <button
            :key="item.key"
            :title="item.label"
            class="nav-item"
            :class="{ active: !item.children && activeNav === item.key }"
            :aria-expanded="item.children ? !!expandedNav[item.key] : undefined"
            @click="selectNav(item)"
          >
            <a-icon :type="item.icon" />
            <span>{{ item.label }}</span>
            <a-icon v-if="item.children" class="nav-arrow" :type="expandedNav[item.key] ? 'up' : 'down'" />
          </button>
          <div v-if="item.children && expandedNav[item.key]" :key="`${item.key}-children`" class="nav-children">
            <button
              v-for="child in item.children"
              :key="child.key"
              :title="child.label"
              class="nav-child"
              :class="{ active: activeNav === child.key || (['project-detail', 'project-form'].includes(activeNav) && child.key === 'applied-projects') || (activeNav === 'report-detail' && child.key === 'project-reports') || (['recruitment-detail', 'recruitment-form'].includes(activeNav) && child.key === 'available-projects') }"
              @click="selectNav(child)"
            >
              <span>{{ child.label }}</span>
            </button>
          </div>
        </template>
      </nav>

      <button class="logout" title="退出登录" @click="notify('退出登录')">
        <a-icon type="logout" />
        <span>退出登录</span>
      </button>
    </aside>

    <header class="topbar">
      <div class="breadcrumb">
        <strong>{{ breadcrumbRoot }}</strong>
        <span>/</span>
        <button v-if="activeNav === 'project-form'" class="breadcrumb-link" type="button" @click="navigate('dashboard')">工作台</button>
        <button v-else-if="activeNav === 'project-detail'" class="breadcrumb-link" type="button" @click="backToAppliedProjects">已申请项目</button>
        <button v-else-if="activeNav === 'report-detail'" class="breadcrumb-link" type="button" @click="navigate('project-reports')">进展/结项</button>
        <button v-else-if="['recruitment-detail', 'recruitment-form'].includes(activeNav)" class="breadcrumb-link" type="button" @click="navigate('available-projects')">可申请项目</button>
        <span v-else>{{ breadcrumbLeaf }}</span>
        <template v-if="activeNav === 'project-detail'">
          <span>/</span>
          <span>项目详情</span>
        </template>
        <template v-if="activeNav === 'report-detail'"><span>/</span><span>{{ $route.query.mode === 'audit' ? '审核进展/结项' : '报告详情' }}</span></template>
        <template v-if="activeNav === 'recruitment-detail'"><span>/</span><span>招募详情</span></template>
        <template v-if="activeNav === 'recruitment-form'"><span>/</span><span>发布招募</span></template>
        <template v-if="activeNav === 'project-form'"><span>/</span><span>填写项目申请</span></template>
      </div>
      <div class="top-actions">
        <a-button class="icon-button" shape="circle" aria-label="查看历史系统通知" @click="openNoticeHistory"><a-icon type="bell" /></a-button>
        <div class="user-divider"></div>
        <button class="user-profile" type="button" aria-label="修改密码" @click="$refs.password.openPasswordDialog()">
          <a-avatar class="avatar" icon="user" />
          <div><strong>用户名</strong><span>伙伴管理员</span></div>
        </button>
      </div>
    </header>
<main class="main-content"><slot /></main>
<ChangePasswordModal ref="password" />
<a-modal v-model="noticeHistoryVisible" title="历史系统通知" :width="720" :mask-closable="false" :footer="null">
  <div ref="noticeHistoryList" class="notice-history-list">
    <article v-for="notice in pagedNotices" :key="notice.id" class="notice-history-item">
      <p>{{ notice.content }}</p>
      <time :datetime="notice.date">{{ notice.date }}</time>
    </article>
    <a-empty v-if="!historyNotices.length" description="暂无系统通知" />
  </div>
  <div class="notice-history-pagination">
    <a-pagination :current="noticePage" :total="historyNotices.length" :page-size="5" :show-total="total => `共 ${total} 条`" @change="changeNoticePage" />
  </div>
</a-modal>
</div>
</template>

<script>
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
export default {
  name: 'PartnerLayout',
  data () { return {
    noticeHistoryVisible: false,
    noticePage: 1,
    // 本地演示通知；接入接口后由服务端提供历史记录。
    historyNotices: [
      { id: 1, title: '关于做好项目进展材料审核工作的通知', date: '2026-03-03', content: '请各项目负责人及时关注待办事项，核对项目进展材料的完整性，并与伙伴机构保持沟通。具体审核要求以正式发布的通知为准。' },
      { id: 2, title: '项目协议归档及扫描件上传提醒', date: '2026-03-03', content: '请核对协议金额与签署信息，并检查协议扫描件是否清晰、完整。具体归档安排以正式通知为准。' },
      { id: 3, title: '年度项目数据核对工作安排', date: '2026-03-03', content: '请核对所属项目的执行状态、进展及结项信息。如发现数据差异，请联系系统管理员确认。' },
      { id: 4, title: '项目进展报告填报提醒', date: '2026-02-25', content: '请按照项目协议约定的时间提交进展报告，并附上对应的活动记录和成果材料。' },
      { id: 5, title: '伙伴机构联系信息核对提醒', date: '2026-02-18', content: '请检查机构联系人、联系电话和电子邮箱，确保项目沟通信息准确。信息发生变化时，请及时更新。' },
      { id: 6, title: '项目预算材料整理提示', date: '2026-02-10', content: '请按预算科目整理项目支出材料，并核对预算表与相关附件中的金额，便于后续审核。' },
      { id: 7, title: '项目结项材料准备提醒', date: '2026-02-03', content: '临近执行期限的项目，请提前整理结项报告、财务材料及成果附件，并与项目负责人确认提交安排。' },
      { id: 8, title: '项目资料上传注意事项', date: '2026-01-26', content: '上传前请检查文件是否可正常打开，扫描内容是否清晰完整，文件名称是否能准确说明材料内容。' },
      { id: 9, title: '项目受益数据填报提醒', date: '2026-01-19', content: '请结合实际执行情况填报受益数据，并保留相关记录，以便项目负责人核对。' },
      { id: 10, title: '招募申请材料准备提示', date: '2026-01-12', content: '申请前请阅读招募要求，核对机构资质、项目方案及预算材料，并在规定时间内提交。' },
      { id: 11, title: '年度项目资料归档提醒', date: '2026-01-05', content: '请按项目整理本年度协议、报告和审核记录，确保归档材料与系统记录一致。' }
    ],
    expandedNav: { projects: true },
    navigation: [
        { key: 'dashboard', label: '工作台', icon: 'desktop' },
        { key: 'dashboard-see', label: '工作台-SEE', icon: 'dashboard' },
        { key: 'organization', label: '机构管理', icon: 'bank' },
        { key: 'projects', label: '项目管理', icon: 'project', children: [{ key: 'available-projects', label: '可申请项目' }, { key: 'applied-projects', label: '已申请项目' }, { key: 'project-reports', label: '进展/结项' }] },
        { key: 'donation', label: '透明捐', icon: 'safety-certificate' },
        { key: 'download', label: '数据下载', icon: 'download' },
        { key: 'benefit', label: '受益数据', icon: 'database' },
        { key: 'admin', label: '管理员功能', icon: 'idcard' },
        { key: 'ngo-database', label: '环保NGO调研数据库', icon: 'global', children: [
          { key: 'ngo-organizations', label: '组织信息列表' },
          { key: 'ngo-analysis', label: '数据分析' },
          { key: 'ngo-users', label: '用户管理' }
        ] }
      ]
  } },
  computed: {
    pagedNotices () { return this.historyNotices.slice((this.noticePage - 1) * 5, this.noticePage * 5) },
    activeNav () { return this.$route.name },
    breadcrumbRoot () {
      return ['available-projects', 'recruitment-detail', 'recruitment-form', 'applied-projects', 'project-detail', 'project-form', 'project-reports', 'report-detail'].includes(this.activeNav) ? '项目管理' : '工作台'
    },
    breadcrumbLeaf () {
      return this.activeNav === 'project-reports' ? '进展/结项' : this.activeNav === 'dashboard-see' ? 'SEE首页' : this.activeNav === 'available-projects' ? '可申请项目' : this.activeNav === 'applied-projects' ? '已申请项目' : '伙伴首页'
    }
  },
  watch: {
    '$route.name': {
      immediate: true,
      handler () {
      if (['available-projects', 'recruitment-detail', 'recruitment-form', 'applied-projects', 'project-detail', 'project-form', 'project-reports', 'report-detail'].includes(this.activeNav)) {
        this.$set(this.expandedNav, 'projects', true)
      }
      }
    }
  },
  methods: {
    openNoticeHistory () { this.noticeHistoryVisible = true; this.changeNoticePage(1) },
    changeNoticePage (page) {
      this.noticePage = page
      this.$nextTick(() => { if (this.$refs.noticeHistoryList) this.$refs.noticeHistoryList.scrollTop = 0 })
    },
    navigate (name) { if (this.$route.name !== name) this.$router.push({ name }) },
    backToAppliedProjects () { this.navigate('applied-projects') },
    selectNav (item) {
      if (item.children) {
        this.$set(this.expandedNav, item.key, !this.expandedNav[item.key])
      } else if (['dashboard', 'dashboard-see', 'available-projects', 'applied-projects', 'project-reports'].includes(item.key)) this.navigate(item.key)
      else this.notify(item.label)
    },
    notify (label) { this.$message.info(label) }
  },
  components: { ChangePasswordModal },
}
</script>

<style scoped>
.notice-history-list { max-height: 55vh; overflow-y: auto; }
.notice-history-item { padding: 18px 4px; border-bottom: 1px solid #edf1f5; }
.notice-history-item:first-child { padding-top: 0; }.notice-history-item:last-child { border-bottom: 0; }
.notice-history-item time { display: block; margin-top: 8px; color: #718095; }
.notice-history-item p { margin: 0; color: #536277; line-height: 1.7; white-space: pre-line; overflow-wrap: anywhere; }
.notice-history-pagination { display: flex; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #e6ebf2; }
</style>
