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
              :class="{ active: activeNav === child.key || (['organization-detail', 'organization-form'].includes(activeNav) && child.key === 'organization-list') || (['project-detail', 'project-form'].includes(activeNav) && child.key === 'applied-projects') || (activeNav === 'report-detail' && child.key === 'project-reports') || (['recruitment-detail', 'recruitment-form'].includes(activeNav) && child.key === 'available-projects') }"
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
        <button v-if="['organization-detail', 'organization-form'].includes(activeNav)" class="breadcrumb-link" type="button" @click="navigate('organization-list')">机构列表</button>
        <button v-else-if="activeNav === 'project-form'" class="breadcrumb-link" type="button" @click="navigate($route.query.detailType === 'green-home' ? 'applied-projects' : 'dashboard')">{{ $route.query.detailType === 'green-home' ? '已申请项目' : '工作台' }}</button>
        <button v-else-if="activeNav === 'project-detail'" class="breadcrumb-link" type="button" @click="backToAppliedProjects">已申请项目</button>
        <button v-else-if="activeNav === 'report-detail'" class="breadcrumb-link" type="button" @click="navigate('project-reports')">进展/结项</button>
        <button v-else-if="['recruitment-detail', 'recruitment-form'].includes(activeNav)" class="breadcrumb-link" type="button" @click="navigate('available-projects')">可申请项目</button>
        <button v-else-if="['benefit-species-detail', 'benefit-list-detail', 'benefit-document-detail'].includes($route.name)" class="breadcrumb-link" type="button" @click="navigate('benefit-summary')">数据汇总</button>
        <span v-else>{{ breadcrumbLeaf }}</span>
        <template v-if="['benefit-species-detail', 'benefit-list-detail', 'benefit-document-detail'].includes($route.name)"><span>/</span><span>{{ $route.name === 'benefit-document-detail' ? '文件材料详情' : $route.name === 'benefit-list-detail' ? '名单详情' : '物种详情' }}</span></template>
        <template v-if="activeNav === 'project-detail'">
          <span>/</span>
          <span>项目详情</span>
        </template>
        <template v-if="activeNav === 'report-detail'"><span>/</span><span>{{ $route.query.mode === 'audit' ? '审核进展/结项' : '报告详情' }}</span></template>
        <template v-if="['organization-detail', 'organization-form'].includes(activeNav)"><span>/</span><span>{{ activeNav === 'organization-form' ? ($route.params.id === 'new' ? '申请机构' : '修改机构信息') : ($route.query.mode === 'audit' ? '审核机构' : '机构详情') }}</span></template>
        <template v-if="activeNav === 'recruitment-detail'"><span>/</span><span>招募详情</span></template>
        <template v-if="activeNav === 'recruitment-form'"><span>/</span><span>发布招募</span></template>
        <template v-if="activeNav === 'project-form'"><span>/</span><span>{{ $route.query.detailType === 'green-home' ? '编辑创绿家项目' : '填写项目申请' }}</span></template>
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
    <article v-for="notice in historyNotices" :key="notice.id" class="notice-history-item">
      <p>{{ notice.content }}</p>
      <time :datetime="notice.date">{{ notice.date }}</time>
    </article>
    <a-empty v-if="!historyNotices.length" description="暂无系统通知" />
  </div>
</a-modal>
</div>
</template>

<script>
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
import systemNotices from '../mock/system-notices.json'
export default {
  name: 'PartnerLayout',
  data () { return {
    noticeHistoryVisible: false,
    // 本地演示通知；接入接口后由服务端提供历史记录。
    historyNotices: systemNotices,
    expandedNav: {},
    navigation: [
        { key: 'dashboard', label: '工作台', icon: 'desktop' },
        { key: 'dashboard-see', label: '工作台-SEE', icon: 'dashboard' },
        { key: 'organization', label: '机构管理', icon: 'bank', children: [{ key: 'organization-list', label: '机构列表' }] },
        { key: 'projects', label: '项目管理', icon: 'project', children: [{ key: 'recruitment-summary', label: '招募汇总' }, { key: 'fundraising-plans', label: '筹款规划' }, { key: 'framework-agreements', label: '框架协议' }, { key: 'available-projects', label: '可申请项目' }, { key: 'applied-projects', label: '已申请项目' }, { key: 'project-reports', label: '进展/结项' }, { key: 'payment-applications', label: '请款申请' }] },
        { key: 'donation', label: '透明捐', icon: 'safety-certificate' },
        { key: 'download', label: '数据下载', icon: 'download' },
        { key: 'benefit', label: '收益数据', icon: 'database', children: [
          { key: 'benefit-summary', label: '数据汇总' },
          { key: 'benefit-projects', label: '项目收益' },
          { key: 'benefit-departments', label: '部门填报' },
          { key: 'benefit-regions', label: '地区数据' }
        ] },
        { key: 'admin', label: '管理员功能', icon: 'idcard' },
        { key: 'ngo-database', label: '环保NGO调研数据库', icon: 'global', children: [
          { key: 'ngo-organizations', label: '组织信息列表' },
          { key: 'ngo-analysis', label: '数据分析' },
          { key: 'ngo-users', label: '用户管理' }
        ] }
      ]
  } },
  computed: {
    activeNav () { if (this.$route.name === 'benefit-region-detail') return 'benefit-regions'; if (['benefit-species-detail', 'benefit-list-detail', 'benefit-document-detail'].includes(this.$route.name)) return 'benefit-summary'; return ['fundraising-plan-detail', 'fundraising-plan-form'].includes(this.$route.name) ? 'fundraising-plans' : ['fundraising-application-detail', 'fundraising-application-form'].includes(this.$route.name) ? 'framework-agreements' : this.$route.name },
    breadcrumbRoot () {
      if (['benefit-summary', 'benefit-regions'].includes(this.activeNav)) return '收益数据'
      if (['organization-list', 'organization-detail', 'organization-form'].includes(this.activeNav)) return '机构管理'
      return ['recruitment-summary', 'available-projects', 'recruitment-detail', 'recruitment-form', 'applied-projects', 'fundraising-plans', 'framework-agreements', 'project-detail', 'project-form', 'project-reports', 'payment-applications', 'report-detail'].includes(this.activeNav) ? '项目管理' : '工作台'
    },
    breadcrumbLeaf () {
      if (this.activeNav === 'benefit-summary') return '数据汇总'
      if (this.activeNav === 'benefit-regions') return '地区数据'
      if (this.activeNav === 'download') return '数据下载'
      if (this.$route.name === 'fundraising-plan-form') return this.$route.params.id === 'new' ? '申请筹款规划' : '编辑筹款规划申请'
      if (this.$route.name === 'fundraising-plan-detail') return this.$route.query.mode === 'audit' ? '审核筹款规划' : '查看筹款规划'
      if (this.$route.name === 'fundraising-application-detail') return this.$route.query.mode === 'audit' ? '审核募捐申请书' : '查看募捐申请书'
      if (this.$route.name === 'fundraising-application-form') return '编辑募捐申请书'
      if (this.activeNav === 'organization-list') return '机构列表'
      if (this.activeNav === 'fundraising-plans') return '筹款规划'
      if (this.activeNav === 'payment-applications') return '请款申请'
      if (this.activeNav === 'framework-agreements') return '框架协议'
      return this.activeNav === 'recruitment-summary' ? '招募汇总' : this.activeNav === 'project-reports' ? '进展/结项' : this.activeNav === 'dashboard-see' ? 'SEE首页' : this.activeNav === 'available-projects' ? '可申请项目' : this.activeNav === 'applied-projects' ? '已申请项目' : '伙伴首页'
    }
  },
  methods: {
    openNoticeHistory () {
      this.noticeHistoryVisible = true
      this.$nextTick(() => { if (this.$refs.noticeHistoryList) this.$refs.noticeHistoryList.scrollTop = 0 })
    },
    navigate (name) { if (this.$route.name !== name) this.$router.push({ name }) },
    backToAppliedProjects () { this.navigate('applied-projects') },
    selectNav (item) {
      if (['benefit-summary', 'benefit-regions'].includes(item.key)) { this.navigate(item.key); return }
      if (item.key === 'download') { this.navigate(item.key); return }
      if (item.key === 'organization-list') { this.navigate(item.key); return }
      if (item.children) {
        this.$set(this.expandedNav, item.key, !this.expandedNav[item.key])
      } else if (['dashboard', 'dashboard-see', 'recruitment-summary', 'available-projects', 'applied-projects', 'fundraising-plans', 'framework-agreements', 'project-reports', 'payment-applications'].includes(item.key)) this.navigate(item.key)
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
</style>
