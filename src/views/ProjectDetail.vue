<template>
<section class="project-detail-page">
        <div class="detail-back-row">
          <a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button>
        </div>

        <section class="privacy-reminder" role="note" aria-label="信息安全提醒">
          <div class="privacy-reminder-head">
            <span class="privacy-icon" :class="{ 'audit-notice-icon': detailMode === 'audit' }"><a-icon :type="detailMode === 'audit' ? 'info-circle' : 'warning'" theme="filled" /></span>
            <div>
              <strong>{{ detailMode === 'audit' ? '请注意' : '请注意保护信息安全' }}</strong>
              <span>{{ detailMode === 'audit' ? '完成审核表示您代表SEE进行了项目申请书的审核，对审核结果负责' : '当前页面内容可能包含不适合公开的隐私资料' }}</span>
            </div>
            <a-icon class="privacy-watermark" type="exclamation-circle" />
          </div>
          <div class="privacy-reminder-body">
            <div class="privacy-reminder-copy">
              <template v-if="detailMode === 'audit'">
                <p>这是待审核的项目申请书，内容在审核通过前不会入库存档，下载用于线下审核时，资料会带有“待审核”相关标注。</p>
                <p class="ai-initial-review"><strong>AI初审结果</strong></p>
                <p v-for="item in detailTableData.aiInitialReview" :key="item.section" class="ai-initial-review-item"><span>{{ item.section }}：</span>{{ item.content }}</p>
              </template>
              <template v-else>
                <p>这是审核通过的项目申请书，查看和使用资料时，需遵循机构信息安全与保密要求！</p>
                <p>如需公开、转发、下载或用于其他场景，请先确认资料使用范围，并完成必要的内部授权。</p>
              </template>
            </div>
          </div>
        </section>

        <section id="detail-basic" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>项目基本信息</h2><div class="detail-basic-meta"><span class="project-code"><a-icon type="flag" /> {{ basicInfo.code }}</span><button class="project-recruitment" type="button" :title="basicInfo.recruitment" @click="notify(`打开招募详情：${basicInfo.recruitment}`)"><a-icon type="notification" /> {{ basicInfo.recruitment }}</button></div></div></div>
          <div class="description-grid">
            <div class="description-item wide project-name-item" :class="basicReviewClass('name')" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openBasicReview('name')" @keydown.enter.prevent="openBasicReview('name')" @keydown.space.prevent="openBasicReview('name')"><span>项目名称</span><strong>{{ basicInfo.name }}</strong></div>
            <div class="description-item"><span>项目类型</span><strong>{{ basicInfo.type }}</strong></div>
            <div class="description-item"><span>项目策略</span><strong>{{ basicInfo.strategy }}</strong></div>
            <div class="description-item"><span>项目议题</span><strong>{{ basicInfo.issue }}</strong></div>
            <div v-if="basicInfo.funding" class="description-item"><span>资金来源</span><strong>{{ basicInfo.funding }}</strong></div>
            <div class="description-item" :class="basicReviewClass('targets')" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openBasicReview('targets')" @keydown.enter.prevent="openBasicReview('targets')" @keydown.space.prevent="openBasicReview('targets')">
              <span>项目目标板块</span><strong>{{ basicInfo.targets }}</strong>
            </div>
            <div v-for="field in basicReviewFields.slice(2)" :key="field.key" class="description-item" :class="[field.wide ? 'wide' : '', basicReviewClass(field.key)]" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openBasicReview(field.key)" @keydown.enter.prevent="openBasicReview(field.key)" @keydown.space.prevent="openBasicReview(field.key)"><span>{{ field.label }}</span><strong :class="{ 'basic-field-multiline': field.multiline }">{{ basicInfo[field.valueKey] }}</strong></div>
          </div>
        </section>

        <section v-if="detailType === 'green-home' && detailTableData.organizationBasicInfo" id="detail-organization-basic" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="bank" /></span><div><h2>机构基本信息</h2></div></div>
          <div class="description-grid">
            <div class="description-item wide"><span>创业概述</span><strong class="basic-field-multiline">{{ detailTableData.organizationBasicInfo.entrepreneurshipOverview }}</strong></div>
            <div v-for="item in detailTableData.organizationBasicInfo.staffCounts" :key="item.label" class="description-item"><span>{{ item.label }}</span><strong>{{ item.count }}</strong></div>
          </div>
          <h3 class="table-subtitle">组织信息</h3>
          <div class="detail-table-wrap">
            <table class="detail-table team-table">
              <colgroup><col class="project-detail-index-col" /><col class="team-col-name" /><col class="team-col-role" /><col /><col class="organization-work-type-col" /></colgroup>
              <thead><tr><th>序号</th><th>姓名</th><th>职位</th><th>团队分工</th><th>工作性质</th></tr></thead>
              <tbody><tr v-for="(member, index) in detailTableData.organizationBasicInfo.members" :key="member.id"><td>{{ index + 1 }}</td><td>{{ member.name }}</td><td>{{ member.position }}</td><td>{{ member.responsibilities }}</td><td>{{ member.workType }}</td></tr></tbody>
            </table>
          </div>
        </section>

        <section v-if="detailType === 'green-home' && detailTableData.organizationDevelopment" id="detail-organization-background" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="solution" /></span><div><h2>创业背景 / 机构成长需求分析</h2></div></div>
          <article class="rich-content">
            <section v-for="item in detailTableData.organizationDevelopment.background" :key="item.title" class="rich-text-section">
              <h3>{{ item.title }}</h3>
              <div class="rich-text-field"><p v-for="(paragraph, index) in item.paragraphs" :key="index">{{ paragraph }}</p></div>
            </section>
          </article>
        </section>

        <section v-if="detailType === 'green-home' && detailTableData.organizationDevelopment" id="detail-organization-plan" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="compass" /></span><div><h2>发展目标与实施计划</h2></div></div>
          <article class="rich-content">
            <section v-for="item in detailTableData.organizationDevelopment.plan" :key="item.title" class="rich-text-section">
              <h3>{{ item.title }}</h3>
              <div class="rich-text-field"><p v-for="(paragraph, index) in item.paragraphs" :key="index">{{ paragraph }}</p></div>
            </section>
          </article>
        </section>

        <section v-if="detailType !== 'green-home'" id="detail-content" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="read" /></span><div><h2>附加信息</h2><p v-if="detailMode === 'audit'">点击信息小标题可添加审核意见</p></div></div>
          <article class="rich-content">
            <section class="rich-text-section" data-field="projectOverview">
              <h3 :class="{ 'review-heading': detailMode === 'audit' }"><button v-if="detailMode === 'audit'" type="button" @click="openContentReview('overview')">项目概述</button><template v-else>项目概述</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('overview')">
                <p>本项目拟通过对青海省玉树州治多县扎河乡牧户进行入户调研、宣传并指导零废弃家庭建设，推广高海拔地区零废弃社区建设经验，指导牧民研发资源再生利用产品。</p>
                <p>项目将从源头减少三江源环境脆弱地区不可降解垃圾的产生，缓解经济发展与生态保护之间的矛盾，<strong>调动牧民参与零废弃行动的积极性</strong>。</p>
              </div>
            </section>
            <section class="rich-text-section" data-field="projectBackground">
              <h3 :class="{ 'review-heading': detailMode === 'audit' }"><button v-if="detailMode === 'audit'" type="button" @click="openContentReview('background')">项目背景</button><template v-else>项目背景</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('background')">
                <h4>一、现状和问题</h4>
                <p>三江源是长江、黄河、澜沧江的发源地，被称为“中华水塔”。当地自然条件艰苦、基础设施薄弱，基本不具备完善的垃圾清理、转运和处理能力。<em>过度消耗资源的现代生活方式快速涌入后，塑料垃圾与生活垃圾可能长期无法降解。</em></p>
                <p>扎河乡平均海拔约 4750 米，社区居民以放牧为生且居住分散。当前社区缺少零废弃处理示范点、负责人和稳定的动员机制，生产生活垃圾正在对水源、草场和野生动物构成潜在威胁。</p>
                <figure class="rich-image">
                  <img src="/assets/project-suosuo.png" alt="三江源高原生态环境示例" />
                </figure>
                <h4>二、机构背景</h4>
                <p>青海省三江源生态环境保护协会长期围绕环保骨干培养、水源保护行动、零废弃社区与乡村生态文明建设开展工作。协会愿景是<u>传承青藏高原独特的生态智慧，使丰富的生命和多样的文化生生不息</u>。</p>
              </div>
            </section>
            <section class="rich-text-section" data-field="projectGoal">
              <h3 :class="{ 'review-heading': detailMode === 'audit' }"><button v-if="detailMode === 'audit'" type="button" @click="openContentReview('goal')">项目总目标</button><template v-else>项目总目标</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('goal')">
                <p>在三江源国家公园长江园区扎河乡口前村建立 20 户管护员家庭作为示范，使每户每年生活垃圾减少到 10 公斤以内，并共同制定和持续遵守禁塑减废制度。</p>
              </div>
            </section>
          </article>
        </section>

        <section v-if="detailType !== 'green-home'" id="detail-area" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="environment" /></span><div><h2>项目实施区域</h2><p v-if="detailMode === 'audit'">点击行任意位置可添加审核意见</p></div></div>
          <div class="detail-table-wrap"><table class="detail-table project-area-table"><colgroup><col class="project-detail-index-col" /><col /><col /><col /></colgroup><thead><tr><th>序号</th><th>省 / 直辖市</th><th>地级市 / 直辖市区</th><th>行政区</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.areas" :key="row.id" :class="reviewRowClass('areas', row.id)" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openRowReview('areas', row.id)" @keydown.enter.prevent="openRowReview('areas', row.id)" @keydown.space.prevent="openRowReview('areas', row.id)"><td>{{ rowIndex + 1 }}</td><td>{{ row.province }}</td><td>{{ row.city }}</td><td>{{ row.district }}</td></tr></tbody></table></div>
        </section>

        <section v-if="detailType !== 'green-home'" id="detail-team" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon violet"><a-icon type="team" /></span><div><h2>执行团队</h2><p v-if="detailMode === 'audit'">点击信息小标题或行任意位置可添加审核意见</p></div></div>
          <div class="detail-table-wrap">
            <table class="detail-table team-table">
              <colgroup><col class="project-detail-index-col" /><col class="team-col-name" /><col class="team-col-role" /><col /></colgroup>
              <thead><tr><th>序号</th><th>姓名</th><th>职位</th><th>工作内容</th></tr></thead>
              <tbody><tr v-for="(row, rowIndex) in detailTableData.team" :key="row.id" :class="reviewRowClass('team', row.id)" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openRowReview('team', row.id)" @keydown.enter.prevent="openRowReview('team', row.id)" @keydown.space.prevent="openRowReview('team', row.id)"><td>{{ rowIndex + 1 }}</td><td>{{ row.name }}</td><td>{{ row.position }}</td><td>{{ row.responsibilities }}</td></tr></tbody>
            </table>
          </div>
          <article class="rich-content team-rich-content">
            <section class="rich-text-section" data-field="teamManagementExperience">
              <h3 :class="{ 'review-heading': detailMode === 'audit' }"><button v-if="detailMode === 'audit'" type="button" @click="openContentReview('experience')">团队或成员项目管理执行经验</button><template v-else>团队或成员项目管理执行经验</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('experience')">
                <p>团队曾持续推动三江源地区零废弃家庭建设，具备<strong>社区动员、环境教育、物资管理与项目监测</strong>等综合经验。</p>
                <p>核心成员熟悉高海拔地区项目执行环境，能够协调当地社区与合作机构，并依据项目计划完成过程记录、风险跟踪和成果复盘。</p>
              </div>
            </section>
          </article>
        </section>

        <section id="detail-output" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>{{ detailType === 'green-home' ? '机构发展衡量指标及活动' : '项目产出 / 活动' }}</h2><p v-if="detailMode === 'audit'">点击产出或活动序号可添加审核意见</p></div></div>
          <div v-for="(output, outputIndex) in detailTableData.outputs" :key="output.id" class="output-block" :class="{ 'review-has-comment': hasReviewComment(outputReviewComments[outputReviewKey('output', output.id)]) }">
            <div class="output-title"><span :class="{ 'review-label-trigger': detailMode === 'audit' }" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openOutputReview('output', output.id)" @keydown.enter.prevent="openOutputReview('output', output.id)" @keydown.space.prevent="openOutputReview('output', output.id)">产出 {{ outputIndex + 1 }}</span><strong>{{ output.name }}</strong></div>
            <div class="output-standard"><span>产出衡量标准</span><div><p v-for="(paragraph, paragraphIndex) in output.standard.split('\n')" :key="paragraphIndex">{{ paragraph }}</p></div></div>
            <div v-for="(activity, activityIndex) in output.activities" :key="activity.id" class="activity-card" :class="{ 'review-has-comment': hasReviewComment(outputReviewComments[outputReviewKey('activity', activity.id)]) }"><div><span :class="{ 'review-label-trigger': detailMode === 'audit' }" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openOutputReview('activity', activity.id)" @keydown.enter.prevent="openOutputReview('activity', activity.id)" @keydown.space.prevent="openOutputReview('activity', activity.id)">活动 {{ outputIndex + 1 }}.{{ activityIndex + 1 }}</span><strong>{{ activity.name }}</strong></div><dl><div><dt>活动时间</dt><dd>{{ activity.start }} 至 {{ activity.end }}</dd></div><div><dt>活动地点</dt><dd>{{ activity.location }}</dd></div><div><dt>执行人员</dt><dd>{{ activity.people }}</dd></div></dl><p>{{ activity.content }}</p></div>
          </div>
        </section>

        <section id="detail-management" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="safety-certificate" /></span><div><h2>项目管理计划</h2><p v-if="detailMode === 'audit'">点击行任意位置可添加审核意见</p></div></div>
          <template v-if="detailType !== 'green-home'">
            <h3 class="table-subtitle">项目相关方</h3>
            <div class="detail-table-wrap">
              <table class="detail-table stakeholder-table">
                <colgroup><col class="stakeholder-col-index" /><col class="stakeholder-col-party" /><col class="stakeholder-col-interest" /><col class="stakeholder-col-impact" /><col /></colgroup>
                <thead><tr><th>序号</th><th>利益相关方</th><th>利益内容</th><th>产生影响</th><th>管理内容</th></tr></thead>
                <tbody><tr v-for="(row, rowIndex) in detailTableData.stakeholders" :key="row.id" :class="reviewRowClass('stakeholders', row.id)" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openRowReview('stakeholders', row.id)" @keydown.enter.prevent="openRowReview('stakeholders', row.id)" @keydown.space.prevent="openRowReview('stakeholders', row.id)"><td>{{ rowIndex + 1 }}</td><td>{{ row.party }}</td><td>{{ row.interest }}</td><td><span :class="{ 'positive-tag': row.impact === '积极', 'negative-tag': row.impact === '消极' }">{{ row.impact }}</span></td><td>{{ row.management }}</td></tr></tbody>
              </table>
            </div>
          </template>
          <h3 class="table-subtitle">项目风险</h3>
          <div class="detail-table-wrap"><table class="detail-table risk-table"><colgroup><col class="compact-index-col" /><col class="risk-level-col" /><col /><col /><col /></colgroup><thead><tr><th>序号</th><th>可能性</th><th>风险内容</th><th>应对措施</th><th>影响目标或活动</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.risks" :key="row.id" :class="reviewRowClass('risks', row.id)" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openRowReview('risks', row.id)" @keydown.enter.prevent="openRowReview('risks', row.id)" @keydown.space.prevent="openRowReview('risks', row.id)"><td>{{ rowIndex + 1 }}</td><td>{{ row.likelihood }}</td><td>{{ row.description }}</td><td>{{ row.response }}</td><td>{{ row.affectedActivities }}</td></tr></tbody></table></div>
          <template v-if="detailType !== 'green-home'">
            <h3 class="table-subtitle">监测评估计划</h3>
            <div class="detail-table-wrap"><table class="detail-table monitoring-table"><colgroup><col class="compact-index-col" /><col /><col /></colgroup><thead><tr><th>序号</th><th>监测评估目的</th><th>监测评估方法</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.monitoring" :key="row.id" :class="reviewRowClass('monitoring', row.id)" :role="detailMode === 'audit' ? 'button' : undefined" :tabindex="detailMode === 'audit' ? 0 : undefined" @click="openRowReview('monitoring', row.id)" @keydown.enter.prevent="openRowReview('monitoring', row.id)" @keydown.space.prevent="openRowReview('monitoring', row.id)"><td>{{ rowIndex + 1 }}</td><td>{{ row.purpose }}</td><td>{{ row.method }}</td></tr></tbody></table></div>
          </template>
        </section>

        <section id="detail-budget" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>在线预算表</h2><p>项目预算及执行情况概览</p></div></div>
          <budget-prototype :project-name="detailProject.name" :budget="detailTableData.budget" />
        </section>

        <section v-if="detailType !== 'green-home'" id="detail-attachments" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2><p>项目相关附件，如有需要请下载留存</p></div></div>
          <div class="attachment-list"><div><div><strong>项目预算表.xlsx</strong><span>预算表 · 2025-12-28 23:59</span></div><a-button type="link" @click="notify('预览项目预算表')">预览</a-button><a-button type="link" @click="notify('下载项目预算表')">下载</a-button></div><div><div><strong>项目实施方案.pdf</strong><span>其他附件 · 2025-12-28 23:59</span></div><a-button type="link" @click="notify('预览项目实施方案')">预览</a-button><a-button type="link" @click="notify('下载项目实施方案')">下载</a-button></div></div>
        </section>

        <section v-if="detailMode === 'audit'" id="detail-audit" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>审核</h2></div></div>
          <div class="project-audit-form">
            <div class="audit-form-grid">
            <div class="audit-form-column">
            <div class="audit-form-row">
              <label for="audit-result"><em>*</em> 审核结果：</label>
              <a-select id="audit-result" v-model="auditForm.result">
                <a-select-option value="approved">通过 - 项目状态将变更为“审核流程中”</a-select-option>
                <a-select-option value="rejected">驳回 - 项目状态将变更为“申请待修改”</a-select-option>
              </a-select>
            </div>
            <div class="audit-form-row audit-amount-row">
              <label for="audit-amount"><em>*</em> 审核通过金额：</label>
              <a-input id="audit-amount" v-model="auditForm.approvedAmount" suffix="元" placeholder="请输入审核通过金额" />
              <div class="audit-amount-uppercase">大写：{{ auditAmountUppercase }}</div>
            </div>
            <div class="audit-upload-field">
              <div class="audit-upload-heading"><label><em>*</em> 上传评审附件：</label><a-upload :before-upload="addAuditFile" :file-list="auditFiles" :show-upload-list="false"><a-button><a-icon type="upload" />点击上传</a-button></a-upload></div>
              <div v-for="file in auditFiles" :key="file.uid" class="audit-upload-item"><a-icon type="paper-clip" /><span>{{ file.name }}</span><button type="button" :aria-label="`移除${file.name}`" @click="removeAuditFile(file.uid)"><a-icon type="delete" /></button></div>
            </div>
            </div>
            <div class="audit-form-column">
            <div class="audit-form-row">
              <label for="audit-remark">审核备注信息：</label>
              <a-textarea id="audit-remark" v-model="auditForm.remark" :rows="5" placeholder="驳回时必填" />
            </div>
            <div class="audit-funding-hint">
              <div class="audit-hint-title">提示信息</div>
              <div><span>招募资助总额</span><strong>{{ auditFundingTotal.toLocaleString('en-US') }} 元</strong></div>
              <div><span>本项目通过后招募资助余额</span><strong :class="{ 'audit-balance-negative': auditFundingBalance < 0 }">{{ auditFundingBalance === null ? '—' : auditFundingBalance.toLocaleString('en-US') + ' 元' }}</strong></div>
            </div>
            </div>
            </div>
            <div class="audit-form-actions">
              <a-button @click="backToAppliedProjects">取消</a-button>
              <a-button type="primary" @click="submitProjectAudit">提交审核</a-button>
            </div>
          </div>
        </section>

        <section v-else id="detail-history" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div>
          <a-timeline class="audit-timeline">
            <a-timeline-item v-for="entry in detailTableData.auditHistory" :key="entry.id" color="blue">
              <div class="audit-entry">
                <strong>审核结果：{{ entry.result }}</strong>
                <div class="audit-result-row">
                  <span class="audit-info-chip audit-time">{{ entry.time }} · {{ entry.reviewer }}</span>
                  <span v-if="entry.approvedAmount" class="audit-info-chip audit-approved-amount">审核金额：{{ entry.approvedAmount }}</span>
                  <span v-if="entry.paymentAmount" class="audit-info-chip audit-requested-amount">请款金额：{{ entry.paymentAmount }}</span>
                  <button v-if="entry.review" class="audit-resource-link audit-review-resource" type="button" @click="notify('查看评审资料')">评审资料</button>
                  <button v-if="entry.agreement" class="audit-resource-link audit-agreement-resource" type="button" @click="notify('查看协议扫描件')">协议扫描件</button>
                  <button v-if="entry.snapshot" class="audit-resource-link audit-snapshot-resource" type="button" @click="notify('查看申请书快照')">申请书快照</button>
                </div>
                <div v-if="entry.remark" class="audit-result-details">
                  <p><b>审核备注：</b>{{ entry.remark }}</p>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </section>
      <a-modal v-if="detailMode === 'audit'" v-model="targetReviewVisible" title="编辑审核意见" :width="560" :mask-closable="false" @cancel="targetReviewVisible = false">
      <a-textarea v-model="targetReviewDraft" aria-label="审核意见" placeholder="请输入审核意见" :rows="5" />
      <template slot="footer">
        <a-button type="danger" @click="deleteTargetReview">删除</a-button>
        <a-button type="primary" @click="saveTargetReview">确定</a-button>
      </template>
    </a-modal>
</section>
</template>

<script>
import defaultTableData from '../mock/project-tables.json'
import greenHomeTableData from '../mock/project-green-home-detail.json'
import BudgetPrototype from '../components/BudgetPrototype.vue'
import { appliedProjects } from '../mock/projects'
const basicReviewFields = [
  { key: 'name', label: '项目名称', valueKey: 'name', wide: true },
  { key: 'targets', label: '项目目标板块', valueKey: 'targets' },
  { key: 'organization', label: '执行机构', valueKey: 'organization' },
  { key: 'thirdParties', label: '第三方', valueKey: 'thirdParties' },
  { key: 'executionPeriod', label: '执行周期', valueKey: 'period' },
  { key: 'rural', label: '是否在国家乡村振兴重点帮扶县开展项目', valueKey: 'rural' },
  { key: 'aid', label: '直接或委托其他组织资助给受益人款物', valueKey: 'aid' },
  { key: 'beneficiaries', label: '受益对象', valueKey: 'beneficiaries', wide: true },
  { key: 'publicBenefit', label: '项目公益性', valueKey: 'publicBenefit', wide: true },
  { key: 'total', label: '预算总金额', valueKey: 'total', wide: true },
  { key: 'requested', label: '申请 SEE 资金', valueKey: 'requested' },
  { key: 'matching', label: '配套金额', valueKey: 'matching' },
  { key: 'leader', label: '负责人', valueKey: 'leader' },
  { key: 'phone', label: '联系方式', valueKey: 'phone' }
]
const detailFieldVariants = {
  default: basicReviewFields,
  'green-home': (() => {
    const fields = basicReviewFields.map(field => {
      if (field.key === 'executionPeriod') return { ...field, label: '资助周期' }
      if (field.key === 'organization') return { ...field, label: '申请机构' }
      if (field.key === 'total') return { ...field, wide: false }
      if (field.key === 'matching') return { ...field, key: 'otherLocalFunding', label: '其他地方资助', valueKey: 'otherLocalFunding', multiline: true }
      return field
    }).filter(field => field.key !== 'beneficiaries' && field.key !== 'publicBenefit')
    fields.splice(fields.findIndex(field => field.key === 'organization') + 1, 0, { key: 'organizationCode', label: '机构信息编码', valueKey: 'organizationCode' })
    fields.splice(fields.findIndex(field => field.key === 'aid') + 1, 0, { key: 'environmentalFields', label: '从事的环保领域', valueKey: 'environmentalFields' })
    return fields
  })(),
  grass: basicReviewFields,
  'one-time-donation': basicReviewFields,
  'monthly-donation': basicReviewFields
}
const detailTableDataByType = {
  default: defaultTableData,
  'green-home': greenHomeTableData
}
export default {
  name: 'ProjectDetail',
  props: {
    projectId: { type: Number, required: true },
    mode: { type: String, default: 'view' },
    detailType: { type: String, default: 'default' },
    // 接口返回同结构 JSON 后可通过路由容器传入，或在此接入请求。
    tableData: { type: Object, default: null }
  },
  data () {
    const sourceTableData = this.tableData || detailTableDataByType[this.detailType] || defaultTableData
    const usesJsonReviewComments = Object.prototype.hasOwnProperty.call(sourceTableData, 'reviewComments')
    return {
    detailTableData: JSON.parse(JSON.stringify(sourceTableData)),
    targetReviewVisible: false,
    targetReviewDraft: '',
    basicReviewComments: usesJsonReviewComments ? { ...sourceTableData.reviewComments } : { targets: '请补充各项目目标板块对应的成果指标及衡量方式。' },
    contentReviewComments: usesJsonReviewComments ? { ...sourceTableData.reviewComments } : { overview: '请补充项目受益范围和社区参与方式。' },
    rowReviewComments: usesJsonReviewComments ? {} : { [`${this.projectId}:areas:areas-1`]: '请核实实施区域与活动地点的一致性。' },
    outputReviewComments: usesJsonReviewComments ? {} : { [`${this.projectId}:output:output-1`]: '请明确产出的数量、完成时间和验收依据。', [`${this.projectId}:activity:activity-2-1`]: '请补充活动实施安排及执行人员分工。' },
    reviewField: 'basic:targets',
    auditForm: {
        result: 'approved',
        approvedAmount: '5000',
        remark: ''
      },
    auditFiles: [],
    auditFundingTotal: 10000
  } },
  computed: {
    basicReviewFields () { return detailFieldVariants[this.detailType] || detailFieldVariants.default },
    selectedProjectId () { return this.projectId },
    detailMode () { return this.mode },
    basicInfo () { return this.detailTableData.basic },
    auditFundingBalance () {
      const value = this.auditForm.approvedAmount.trim()
      return /^\d{1,12}(\.\d{1,2})?$/.test(value) ? this.auditFundingTotal - Number(value) : null
    },
    auditAmountUppercase () {
      const value = this.auditForm.approvedAmount.trim()
      if (!value) return '—'
      if (!/^\d{1,12}(\.\d{1,2})?$/.test(value)) return '请输入有效金额（最多两位小数）'
      const digits = '零壹贰叁肆伍陆柒捌玖'
      const cents = Math.round(Number(value) * 100)
      let integer = Math.floor(cents / 100)
      const groups = []
      while (integer > 0) { groups.push(integer % 10000); integer = Math.floor(integer / 10000) }
      let result = ''
      let pendingZero = false
      for (let index = groups.length - 1; index >= 0; index--) {
        const group = groups[index]
        if (!group) { pendingZero = !!result; continue }
        if (result && (pendingZero || group < 1000)) result += '零'
        let part = ''
        let zero = false
        for (let place = 3; place >= 0; place--) {
          const digit = Math.floor(group / Math.pow(10, place)) % 10
          if (digit) { if (zero) part += '零'; part += digits[digit] + ['', '拾', '佰', '仟'][place]; zero = false } else if (part) zero = true
        }
        result += part + ['', '万', '亿'][index]
        pendingZero = false
      }
      result = (result || '零') + '元'
      const jiao = Math.floor(cents % 100 / 10)
      const fen = cents % 10
      if (!jiao && !fen) return result + '整'
      if (jiao) result += digits[jiao] + '角'
      if (fen) result += (jiao ? '' : '零') + digits[fen] + '分'
      return result
    },
    detailProject () {
      return appliedProjects.find(project => project.id === this.selectedProjectId) || appliedProjects[0]
    }
  },
  methods: {
    hasReviewComment (comment) { return this.detailMode === 'audit' && typeof comment === 'string' && comment.trim().length > 0 },
    goBack () {
      if (window.history.length > 1) this.$router.go(-1)
      else this.$router.push({ name: 'applied-projects' })
    },
    basicReviewKey (field) { return field },
    basicReviewClass (field) { return { 'review-label-trigger': this.detailMode === 'audit', 'review-has-comment': this.hasReviewComment(this.basicReviewComments[this.basicReviewKey(field)]) } },
    openBasicReview (field) {
      if (this.detailMode !== 'audit') return
      this.reviewField = `basic:${field}`
      this.targetReviewDraft = this.basicReviewComments[this.basicReviewKey(field)] || ''
      this.targetReviewVisible = true
    },
    contentReviewClass (field) { return { 'review-has-comment': this.hasReviewComment(this.contentReviewComments[field]) } },
    openContentReview (field) {
      if (this.detailMode !== 'audit') return
      this.reviewField = `content:${field}`
      this.targetReviewDraft = this.contentReviewComments[field] || ''
      this.targetReviewVisible = true
    },
    saveTargetReview () {
      const comments = this.getActiveReviewComments()
      this.$set(comments, this.activeReviewKey(), this.targetReviewDraft.trim())
      this.targetReviewVisible = false
    },
    deleteTargetReview () {
      const comments = this.getActiveReviewComments()
      this.$delete(comments, this.activeReviewKey())
      this.targetReviewDraft = ''
      this.targetReviewVisible = false
    },
    getActiveReviewComments () {
      if (this.reviewField.indexOf('output:') === 0 || this.reviewField.indexOf('activity:') === 0) return this.outputReviewComments
      if (this.reviewField.indexOf('row:') === 0) return this.rowReviewComments
      if (this.reviewField.indexOf('basic:') === 0) return this.basicReviewComments
      if (this.reviewField.indexOf('content:') === 0) return this.contentReviewComments
    },
    activeReviewKey () {
      if (this.reviewField.indexOf('row:') === 0) return `${this.selectedProjectId}:${this.reviewField.slice(4)}`
      if (this.reviewField.indexOf('basic:') === 0) return this.reviewField.slice(6)
      if (this.reviewField.indexOf('content:') === 0) return this.reviewField.slice(8)
      return this.reviewField.indexOf(':') > -1 ? `${this.selectedProjectId}:${this.reviewField}` : this.selectedProjectId
    },
    rowReviewKey (section, id) { return `${this.selectedProjectId}:${section}:${id}` },
    reviewRowClass (section, id) { return { 'review-row-trigger': this.detailMode === 'audit', 'review-row-has-comment': this.hasReviewComment(this.rowReviewComments[this.rowReviewKey(section, id)]) } },
    openRowReview (section, id) {
      if (this.detailMode !== 'audit') return
      this.reviewField = `row:${section}:${id}`
      this.targetReviewDraft = this.rowReviewComments[this.rowReviewKey(section, id)] || ''
      this.targetReviewVisible = true
    },
    outputReviewKey (kind, id) {
      return `${this.selectedProjectId}:${kind}:${id}`
    },
    openOutputReview (kind, id) {
      if (this.detailMode !== 'audit') return
      this.reviewField = `${kind}:${id}`
      this.targetReviewDraft = this.outputReviewComments[this.activeReviewKey()] || ''
      this.targetReviewVisible = true
    },
    addAuditFile (file) {
      this.auditFiles.push({ uid: file.uid, name: file.name, file })
      return false
    },
    removeAuditFile (uid) {
      this.auditFiles = this.auditFiles.filter(file => file.uid !== uid)
    },
    submitProjectAudit () {
      if (!this.auditForm.result) return this.$message.warning('请选择审核结果')
      if (this.auditForm.result === 'rejected' && !this.auditForm.remark.trim()) return this.$message.warning('驳回时请填写审核备注')
      if (this.auditForm.result === 'approved') {
        if (this.auditFundingBalance === null || Number(this.auditForm.approvedAmount) <= 0) return this.$message.warning('请输入大于零的有效审核通过金额，最多两位小数')
        if (!this.auditFiles.length) return this.$message.warning('请上传评审附件')
      }
      const resultLabel = this.auditForm.result === 'approved' ? '审核通过' : '审核驳回'
      this.$message.info(`本地审核校验通过：${resultLabel}；尚未提交至服务器`)
    },
    notify (label) { this.$message.info(label) }
  },
  components: { BudgetPrototype },
  deactivated () { this.targetReviewVisible = false },
}
</script>

<style scoped>
.organization-work-type-col { width: 150px; }
.detail-table tr.review-row-trigger { cursor: pointer; }
.detail-table tr.review-row-trigger:hover > td { background: #f8fbff; }
.detail-table tr.review-row-has-comment > td { background: #fff1f0; }
.detail-table tr.review-row-has-comment:hover > td { background: #ffe7e5; }
.detail-table tr.review-row-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
</style>
