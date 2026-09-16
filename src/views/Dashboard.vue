<template>
<div class="dashboard-grid">
        <div class="primary-column">
          <section class="registration-banner" aria-labelledby="registration-banner-title">
            <div class="registration-banner-copy">
              <h2 id="registration-banner-title"><a-icon type="warning" theme="filled" aria-hidden="true" />请注意</h2>
              <p>只有完成伙伴机构注册才能进行项目的申请</p>
              <a-button class="registration-banner-action" @click="notify('注册申请入口暂未配置')">注册</a-button>
            </div>
          </section>
          <section class="panel project-panel">
            <div class="panel-header">
              <h2><i></i>进行中的项目</h2>
              <button class="text-link" @click="notify('我的全部项目申请')">我的全部项目申请 <a-icon type="right-circle" /></button>
            </div>

            <article
              v-for="project in projects"
              :key="project.id"
              class="project-row"
              :class="{ overdue: project.overdue }"
            >
              <div class="project-cover" :class="project.cover"><span></span></div>
              <div class="project-info">
                <div class="project-title-line">
                  <h3>{{ project.title }}</h3>
                  <span class="status-chip" :class="project.statusTone">{{ project.status }}</span>
                  <span v-if="project.overdue" class="overdue-label"><a-icon type="exclamation-circle" /> 已逾期</span>
                </div>
                <p>{{ project.description }}</p>
                <div class="project-bottom">
                  <div class="project-time"><a-icon type="clock-circle" /> {{ project.updatedAt }}</div>
                  <div v-if="project.actions.length" class="project-actions">
                    <a-button v-for="action in project.actions" :key="action.label" :class="['action-button', `action-${action.tone}`]" @click="handleProjectAction(project, action)">
                      <a-icon :type="action.icon" /> {{ action.label }}
                    </a-button>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section class="panel donation-panel">
            <div class="panel-header"><h2><i></i>募捐申请</h2></div>
            <article v-for="item in donationApplications" :key="item.id" class="donation-row">
              <div class="project-cover" :class="item.cover"><span></span></div>
              <div class="donation-info">
                <div class="project-title-line">
                  <h3>{{ item.title }}</h3>
                  <span class="status-chip" :class="item.statusTone">{{ item.status }}</span>
                </div>
                <div class="project-time"><a-icon type="clock-circle" /> {{ item.updatedAt }}</div>
              </div>
              <a-button v-if="item.action" :class="['donation-action', 'action-button', `action-${item.actionTone}`]" @click="notify(item.action)">
                <a-icon :type="item.actionIcon" /> {{ item.action }}
              </a-button>
            </article>
          </section>

          <section class="panel recruitment-panel">
            <div class="panel-header"><h2><i></i>招募推荐</h2></div>
            <div class="recommend-grid">
              <button v-for="item in recommendations" :key="item.title" class="recommend-card" @click="notify(item.title)">
                <div class="recommend-image" :class="item.theme">
                  <img v-if="item.image" :src="item.image" :alt="item.title" />
                  <a-icon v-else :type="item.icon" />
                </div>
                <div class="recommend-copy"><strong>{{ item.title }}</strong></div>
              </button>
            </div>
          </section>

          <section class="panel latest-panel">
            <div class="panel-header latest-header">
              <h2><i></i>最新招募</h2>
              <a-input v-model="keyword" class="search-input" placeholder="输入招募名称" @pressEnter="search">
                <a-icon slot="prefix" type="search" />
              </a-input>
              <a-button type="primary" @click="search"><a-icon type="search" /> 搜索</a-button>
            </div>

            <article v-for="item in filteredRecruitments" :key="item.id" class="recruit-row">
              <div class="project-cover ocean"><span></span></div>
              <div class="recruit-info">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <div class="recruit-meta">
                  <span><a-icon type="calendar" /> {{ item.date }}</span>
                  <span><a-icon type="phone" /> {{ item.phone }}</span>
                  <span><a-icon type="mail" /> {{ item.email }}</span>
                  <span><a-icon type="cluster" /> {{ item.group }}</span>
                </div>
              </div>
              <a-button type="primary" :class="['recruit-action', 'action-button', `action-${item.actionTone}`]" @click="notify(item.action)"><a-icon :type="item.actionIcon" /> {{ item.action }}</a-button>
            </article>

            <div class="pagination"><a-pagination :current="1" :total="50" :page-size="10" /></div>
          </section>
        </div>

        <aside ref="secondaryColumn" class="secondary-column">
          <section class="panel side-panel notice-panel">
            <div class="panel-header"><h2><a-icon class="side-title-icon notice-title-icon" type="sound" theme="filled" />系统通知</h2></div>
            <button v-for="notice in notices" :key="notice.id" class="notice-item" @click="notify(notice.title)">
              <span><strong>{{ notice.title }}</strong><time>{{ notice.date }}</time></span>
            </button>
          </section>

          <button class="ai-assistant-banner" type="button" aria-label="打开 AI 项目助手" @click="$emit('open-ai')">
            <img class="ai-banner-avatar" src="/assets/ai-agent.png" alt="AI 项目助手头像" />
            <span class="ai-banner-copy">
              <strong>AI 项目助手</strong>
              <span>申请、执行、财务问题，随时问我</span>
            </span>
            <span class="ai-banner-action">立即对话</span>
          </button>

          <section class="panel side-panel organization-panel">
            <div class="panel-header"><h2><a-icon class="side-title-icon organization-title-icon" type="idcard" theme="filled" />机构信息</h2></div>
            <div class="organization-body">
              <div class="organization-title"><span class="organization-icon"><img src="/assets/organization-avatar-seal.png" alt="机构头像" /></span><div><strong>湛江市霞山区文化旅游体育局</strong><span>政府部门 / 事业单位</span></div></div>
              <div class="organization-stats">
                <button @click="notify('项目申请')"><strong>5</strong><span>项目申请</span></button>
                <button @click="notify('执行中项目')"><strong>10</strong><span>执行中项目</span></button>
                <button @click="notify('已结项')"><strong>100</strong><span>已结项</span></button>
              </div>
              <div class="contact-list"><span><a-icon type="phone" /> 010-12345678</span><span><a-icon type="mail" /> test@see.org.cn</span></div>
              <div class="last-login"><a-icon type="clock-circle" /> 最近登录时间：2026-03-03 12:59:59</div>
            </div>
          </section>

          <section class="panel side-panel">
            <div class="panel-header"><h2><a-icon class="side-title-icon question-title-icon" type="question-circle" theme="filled" />常见问题</h2></div>
            <button v-for="question in questions" :key="question" class="side-link" @click="notify(question)"><span>{{ question }}</span><a-icon type="right" /></button>
          </section>

          <section class="panel side-panel">
            <div class="panel-header"><h2><a-icon class="side-title-icon policy-title-icon" type="safety-certificate" theme="filled" />合规及制度文件</h2></div>
            <button v-for="file in files" :key="file" class="side-link" @click="notify(file)"><span>{{ file }}</span><a-icon type="right" /></button>
          </section>

        </aside>
      </div>
</template>

<script>
import dashboardContent from '../mock/dashboard-content.json'

export default {
  name: 'Dashboard',
  data () { return {
    keyword: '',
    projects: dashboardContent.projects,
    donationApplications: dashboardContent.donationApplications,
    recommendations: [
        { title: '荒漠化防治', image: '/assets/recommend-desertification.jpg', theme: 'desert' },
        { title: '生态保护与自然教育', image: '/assets/recommend-ecology.jpg', theme: 'forest' },
        { title: '气候变化与商业可持续', image: '/assets/recommend-climate.jpg', theme: 'climate' },
        { title: '海洋保护', image: '/assets/recommend-ocean.jpg', theme: 'ocean' },
        { title: '环保行业发展', image: '/assets/recommend-industry.jpg', theme: 'industry' },
        { title: '最新一个指定该机构的招募名称', icon: 'notification', theme: 'featured' }
      ],
    recruitments: dashboardContent.recruitments,
    notices: [
        { id: 1, title: '这里是通知内容这里是通知内容这里是通知内容', date: '2026-03-03' },
        { id: 2, title: '这里是通知内容这里是通知内容这里是通知内容', date: '2026-03-03' },
        { id: 3, title: '这里是通知内容这里是通知内容这里是通知内容', date: '2026-03-03' }
      ],
    questions: ['如何注册成为伙伴机构？', '什么是项目招募？', '项目申请的流程是什么？'],
    files: ['北京市企业环保基金会资助项目财务管理制度', '北京市企业环保基金会反性骚扰机制', '北京市企业环保基金会品牌管理规范']
  } },
  computed: {
    filteredRecruitments () {
      const keyword = this.keyword.trim()
      if (!keyword) return this.recruitments
      return this.recruitments.filter(item => item.title.includes(keyword))
    }
  },
  methods: {
    handleProjectAction (project, action) {
      if (project.id === 1 && action.label === '提交进展') {
        this.$router.push({ name: 'report-form', params: { id: project.id }, query: { type: 'progress' } }); return
      }
      if (project.id === 1 && action.label === '提交结项') {
        this.$router.push({ name: 'report-form', params: { id: project.id }, query: { type: 'completion' } }); return
      }
      if ((project.status === '草稿' && action.label === '编辑草稿') || (project.status === '申请待修改' && action.label === '修改申请')) this.$router.push({ name: 'project-form', params: { id: project.id } })
      else this.notify(action.label)
    },
    search () { this.$message.success(this.keyword ? `正在搜索：${this.keyword}` : '请输入招募名称') },
    syncSecondaryScroll () {
      const column = this.$refs.secondaryColumn
      if (!column || window.innerWidth < 1280 || window.innerHeight < 720) return
      const maxScroll = Math.max(0, column.scrollHeight - column.clientHeight)
      column.scrollTop = Math.min(Math.max(window.pageYOffset, 0), maxScroll)
    },
    notify (label) { this.$message.info(label) }
  },
  activated () { window.addEventListener('scroll', this.syncSecondaryScroll, { passive: true }); window.addEventListener('resize', this.syncSecondaryScroll, { passive: true }); this.$nextTick(this.syncSecondaryScroll) },
  deactivated () { window.removeEventListener('scroll', this.syncSecondaryScroll); window.removeEventListener('resize', this.syncSecondaryScroll) },
  beforeDestroy () { window.removeEventListener('scroll', this.syncSecondaryScroll); window.removeEventListener('resize', this.syncSecondaryScroll) },
}
</script>

<style scoped>
.registration-banner {
  position: relative;
  min-width: 0;
  min-height: 220px;
  aspect-ratio: 3.1 / 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 24px 4.8%;
  border-radius: 16px;
  background: #fff7e2 url('/assets/registration-banner-background.png') center / cover no-repeat;
}
.registration-banner-copy { width: 61%; min-width: 0; }
.registration-banner-copy h2 {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 12px;
  color: #ff6224;
  font-size: clamp(28px, 2.4vw, 44px);
  font-weight: 800;
  line-height: 1.25;
}
.registration-banner-copy h2 .anticon { color: #ffb600; font-size: 1.2em; }
.registration-banner-copy p {
  margin: 0 0 20px;
  color: #363632;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.65;
  overflow-wrap: anywhere;
}
.registration-banner-action.ant-btn {
  height: 32px;
  min-width: 154px;
  padding: 0 24px;
  border: 1px solid #ff7626;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(180deg, #ff8729, #ff6420);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 0 rgba(0,0,0,.043);
}
.registration-banner-action.ant-btn:hover,
.registration-banner-action.ant-btn:focus { color: #dc5117; border-color: #ff7626; background: #fff; }
.registration-banner-action.ant-btn:focus-visible { outline: 2px solid #c94b14; outline-offset: 3px; }
</style>
