<template>
  <section class="recruitment-detail-page">
    <div class="detail-back-row">
      <a-button class="detail-back" @click="backToList"><a-icon type="arrow-left" /> 返回</a-button>
    </div>

    <div v-if="recruitment" class="recruitment-detail-grid">
      <section class="panel recruitment-overview" aria-labelledby="recruitment-title">
        <header class="detail-section-header">
          <span class="detail-section-icon"><a-icon type="profile" /></span>
          <div><h2 id="recruitment-title">招募基本信息</h2></div>
          <a-button class="recruitment-apply action-button action-approved" :disabled="period.state !== 'active'" @click="applyProject"><a-icon type="file-add" /> 申请项目</a-button>
        </header>
        <div class="recruitment-overview-content">
          <div class="recruitment-cover">
            <img v-if="recruitment.image && !imageFailed" :src="recruitment.image" :alt="recruitment.name" @error="imageFailed = true" />
            <div v-else class="cover-placeholder"><a-icon type="picture" /><span>暂无招募封面</span></div>
          </div>
          <div class="recruitment-summary">
            <h1>{{ recruitment.name }}</h1>
            <div class="recruitment-attributes">
              <span :class="['recruitment-attribute', 'type-tag', { 'charity-type-tag': recruitment.type === '联合公益' }]">类型：{{ recruitment.type }}</span>
              <span class="recruitment-attribute strategy-tag">策略：{{ recruitment.strategy }}</span>
              <span class="recruitment-attribute topic-tag">议题：{{ recruitment.topic }}</span>
            </div>
            <div class="recruitment-meta">
              <p><a-icon :type="recruitment.departmentIcon || 'team'" /><span>{{ recruitment.department }}</span></p>
              <p><a-icon type="wallet" /><span>资金来源：{{ recruitment.fundingSource || '暂未提供' }}</span></p>
            </div>
            <section class="recruitment-description" aria-labelledby="description-title">
              <header class="recruitment-section-heading description-heading"><h3 id="description-title">招募简述</h3></header>
              <div class="description-content">
                <p v-for="(paragraph, index) in recruitment.description" :key="index">{{ paragraph }}</p>
                <p v-if="!recruitment.description.length" class="empty-copy">暂无招募简述</p>
              </div>
            </section>
            <div class="recruitment-info-row">
              <section class="recruitment-contact" aria-labelledby="contact-title">
                <header class="recruitment-section-heading contact-heading"><h3 id="contact-title">联系信息</h3></header>
                <dl class="contact-list">
                  <dt>联系人</dt><dd>{{ recruitment.contact.name || '暂未提供' }}</dd>
                  <dt>联系号码</dt><dd>{{ recruitment.contact.phone || '暂未提供' }}</dd>
                  <dt>座机号码</dt><dd>{{ recruitment.contact.landline || '暂未提供' }}</dd>
                  <dt>联系邮箱</dt><dd>{{ recruitment.contact.email || '暂未提供' }}</dd>
                </dl>
              </section>
              <section :class="['recruitment-period', 'period-' + period.state]" aria-labelledby="period-title">
                <header class="recruitment-section-heading period-heading"><h3 id="period-title">申请起止时间</h3></header>
                <div class="period-content">
                  <div class="period-dates">
                    <time :datetime="recruitment.startDate">{{ recruitment.startDate || '待公布' }}</time>
                    <time :datetime="recruitment.endDate">{{ recruitment.endDate || '待公布' }}</time>
                  </div>
                  <div class="period-track" role="progressbar" aria-label="招募周期进度" :aria-valuenow="period.percent" :aria-valuetext="period.summary" :aria-valuemin="0" :aria-valuemax="100">
                    <span class="period-fill" :style="{ width: period.percent + '%' }"></span>
                    <span class="period-node start-node" :class="{ reached: period.state === 'active' || period.state === 'ended' }"></span>
                    <span v-if="period.state === 'active'" class="period-current" :style="{ left: period.percent + '%' }"></span>
                    <span class="period-node end-node" :class="{ reached: period.state === 'ended' }"></span>
                  </div>
                  <div class="period-labels"><span>开始日期</span><strong>{{ period.label }}</strong><span>结束日期</span></div>
                  <p class="period-caption">{{ period.summary }}</p>
                  <p v-if="applicationHint" class="application-hint">{{ applicationHint }}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section v-if="recruitment.attachments && recruitment.attachments.length" class="panel recruitment-attachments" aria-labelledby="attachments-title">
        <header class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2 id="attachments-title">附件</h2></div></header>
        <div class="recruitment-panel-content">
          <ul class="attachment-list">
            <li v-for="attachment in recruitment.attachments" :key="attachment.id">
              <button type="button" class="attachment-entry" :aria-label="'下载附件：' + attachment.name" @click="downloadAttachment(attachment)">
                <span class="attachment-file-icon"><a-icon type="file-pdf" /></span>
                <span class="attachment-name">{{ attachment.name }}</span>
                <a-icon class="attachment-download" type="download" />
              </button>
            </li>
          </ul>
        </div>
      </section>
    </div>
    <a-empty v-else description="该招募详情暂不可用" />
  </section>
</template>

<script>
import { availableProjects } from '../mock/projects'
import recruitmentDetails from '../mock/recruitment-details.json'
import { getRecruitmentPeriod } from '../utils/recruitment-period'

export default {
  name: 'RecruitmentDetail',
  props: { recruitmentId: { type: String, required: true } },
  data () { return { now: new Date(), clockTimer: null, imageFailed: false } },
  computed: {
    recruitment () {
      const project = availableProjects.find(item => String(item.id) === this.recruitmentId)
      const detail = recruitmentDetails[this.recruitmentId]
      return project && detail ? { ...project, ...detail } : null
    },
    period () {
      const recruitment = this.recruitment || {}
      return getRecruitmentPeriod(recruitment.startDate, recruitment.endDate, this.now)
    },
    applicationHint () {
      if (this.period.state === 'unknown') return '招募时间待公布，暂不可申请'
      return ''
    }
  },
  watch: { recruitmentId () { this.imageFailed = false; this.now = new Date() } },
  mounted () { this.startClock() },
  activated () { this.startClock() },
  deactivated () { this.stopClock() },
  beforeDestroy () { this.stopClock() },
  methods: {
    backToList () { this.$router.push({ name: 'available-projects' }) },
    startClock () {
      this.stopClock()
      this.now = new Date()
      this.clockTimer = setInterval(() => { this.now = new Date() }, 60000)
    },
    stopClock () { clearInterval(this.clockTimer); this.clockTimer = null },
    applyProject () {
      if (this.period.state !== 'active') return
      this.$message.info('申请项目为演示入口，暂未开放在线申请')
    },
    downloadAttachment (attachment) {
      this.$message.info(`“${attachment.name}”为示例附件，暂未提供下载文件`)
    }
  }
}
</script>

<style scoped>
.recruitment-detail-page { display: grid; gap: 20px; }
.recruitment-detail-grid { display: grid; gap: 20px; min-width: 0; }
.recruitment-overview { overflow: hidden; }
.recruitment-overview-content { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 24px; padding: 22px; align-items: start; }
.recruitment-cover { position: relative; width: 150px; height: 150px; overflow: hidden; border-radius: 13px; background: #f1f6f4; }
.recruitment-cover img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #718095; }
.cover-placeholder .anticon { font-size: 36px; color: #18a66a; }
.recruitment-summary { min-width: 0; }
.recruitment-summary h1 { margin: 0 0 18px; color: #18253c; font-size: 16px; font-weight: 700; line-height: 1.6; white-space: normal; overflow-wrap: anywhere; }
.recruitment-attributes { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 6px; line-height: 1.4; }
.recruitment-attribute { max-width: 100%; padding: 3px 8px; border-radius: 4px; white-space: normal; overflow-wrap: anywhere; }
.type-tag { color: #722ed1; background: #f9f0ff; }
.type-tag.charity-type-tag { color: #00a870; background: #f0fff8; }
.strategy-tag { color: #08979c; background: #e6fffb; }
.topic-tag { color: #d48806; background: #fffbe6; }
.recruitment-meta { margin-top: 22px; }
.recruitment-meta p { display: flex; align-items: flex-start; gap: 9px; margin: 0 0 12px; color: #718095; line-height: 1.65; overflow-wrap: anywhere; }
.recruitment-meta p:last-child { margin-bottom: 0; }
.recruitment-meta .anticon { flex: none; margin-top: 4px; }
.recruitment-section-heading { display: flex; align-items: center; min-height: 42px; padding: 9px 14px; border-radius: 8px; }
.recruitment-section-heading h3 { margin: 0; font-size: 16px; font-weight: 700; line-height: 1.5; }
.description-heading { background: #e8f8f0; }
.description-heading h3 { color: #168b5a; }
.contact-heading { background: #fff3e8; }
.contact-heading h3 { color: #d46b08; }
.period-heading { background: #e6fffb; }
.period-heading h3 { color: #08979c; }
.recruitment-description { margin-top: 22px; padding-top: 22px; }
.description-content { margin: 0 14px; padding-top: 16px; color: #18253c; line-height: 1.65; overflow-wrap: anywhere; }
.description-content p { margin: 0 0 12px; white-space: pre-line; }
.description-content p:last-child { margin-bottom: 0; }
.recruitment-apply { min-width: 112px; height: 32px; border-radius: 999px; }
.recruitment-apply[disabled] { color: #7f7f7f; border-color: #e6ebf2; background: #f2f2f2; }
.application-hint { margin: 14px 0 0; color: #718095; }
.recruitment-info-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; margin-top: 22px; padding-top: 22px; }
.recruitment-contact, .recruitment-period { min-width: 0; }
.period-content { margin: 0 14px; }
.period-dates { display: flex; justify-content: space-between; gap: 16px; margin-top: 20px; color: #18253c; font-variant-numeric: tabular-nums; }
.period-track { position: relative; height: 8px; margin: 18px 8px 0; border-radius: 999px; background: #e6ebf2; }
.period-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: inherit; background: #1677ff; }
.period-node, .period-current { position: absolute; top: 50%; width: 16px; height: 16px; border: 2px solid #a8b6c8; border-radius: 50%; background: white; transform: translate(-50%, -50%); }
.start-node { left: 0; }.end-node { left: 100%; }
.period-node.reached { background: #1677ff; border-color: #1677ff; }
.period-current { z-index: 1; width: 18px; height: 18px; border-color: #fff; background: #1677ff; box-shadow: 0 0 0 3px #e6f4ff; }
.period-active .period-fill, .period-active .period-node.reached { background: #5ac7b0; border-color: #5ac7b0; }
.period-active .period-current { background: #5ac7b0; box-shadow: 0 0 0 3px rgba(90,199,176,.18); }
.period-labels { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 16px; color: #718095; }
.period-labels strong { color: #1677ff; font-weight: 500; }
.period-active .period-labels strong { color: #5ac7b0; }
.period-ended .period-fill, .period-ended .period-node.reached { background: #a4afbd; border-color: #a4afbd; }
.period-ended .period-labels strong, .period-upcoming .period-labels strong, .period-unknown .period-labels strong { color: #7f7f7f; }
.period-caption { margin: 14px 0 0; color: #718095; line-height: 1.65; text-align: center; }
.recruitment-attachments { overflow: hidden; }
.recruitment-panel-content { padding: 20px; }
.contact-list { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 5px 12px; margin: 16px 14px 0; line-height: 1.5; }
.contact-list dt { color: #718095; font-weight: 400; }
.contact-list dd { margin: 0; color: #18253c; overflow-wrap: anywhere; }
.attachment-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
.attachment-entry { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 52px; padding: 10px; border: 1px solid #edf1f5; border-radius: 9px; color: #18253c; background: #f4f7fb; text-align: left; }
.attachment-entry:hover { border-color: #b9d7ff; background: #edf5ff; }
.attachment-entry:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.attachment-file-icon { display: grid; place-items: center; flex: none; width: 30px; height: 34px; border-radius: 5px; color: #ff4d4f; background: #fff1f0; font-size: 20px; }
.attachment-name { flex: 1; min-width: 0; line-height: 1.55; overflow-wrap: anywhere; }
.attachment-download { flex: none; font-size: 18px; }
.empty-copy { margin: 0; color: #718095; }
</style>
