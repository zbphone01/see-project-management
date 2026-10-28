<template>
<section class="project-detail-page" :class="{ 'project-snapshot-content': snapshotEntry }">
        <div v-if="!snapshotEntry" class="detail-back-row">
          <a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button>
        </div>

        <section v-if="!snapshotEntry" class="privacy-reminder" role="note" aria-label="信息安全提醒">
          <div class="privacy-reminder-head">
            <span class="privacy-icon" :class="{ 'audit-notice-icon': mode === 'audit' }"><a-icon :type="mode === 'audit' ? 'info-circle' : 'warning'" theme="filled" /></span>
            <div>
              <strong>{{ mode === 'audit' ? '请注意' : '请注意保护信息安全' }}</strong>
              <span>{{ mode === 'audit' ? '完成审核表示您代表SEE进行了项目申请书的审核，对审核结果负责' : '当前页面内容可能包含不适合公开的隐私资料' }}</span>
            </div>
            <a-icon class="privacy-watermark" type="exclamation-circle" />
          </div>
          <div class="privacy-reminder-body">
            <div class="privacy-reminder-copy">
              <template v-if="mode === 'audit'">
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
          <div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>项目基本信息</h2><div v-if="!snapshotEntry" class="detail-basic-meta"><span class="project-code"><a-icon type="flag" /> {{ basicInfo.code }}</span><button class="project-recruitment" type="button" :title="basicInfo.recruitment" @click="notify(`打开招募详情：${basicInfo.recruitment}`)"><a-icon type="notification" /> {{ basicInfo.recruitment }}</button></div><p v-if="mode === 'audit'" class="basic-review-hint review-hint">点击内容区域（伙伴填写）可添加审核意见，添加后该内容区域底色标红</p></div></div>
          <div class="description-grid">
            <div class="description-item wide project-name-item" :class="basicReviewClass('name')" v-bind="reviewAttributes('name')" v-on="reviewEvents('name')"><span>项目名称</span><strong>{{ basicInfo.name }}</strong></div>
            <div class="description-item"><span>项目类型</span><strong>{{ basicInfo.type }}</strong></div>
            <div class="description-item"><span>项目策略</span><strong>{{ basicInfo.strategy }}</strong></div>
            <div class="description-item"><span>项目议题/筹款方式</span><strong>{{ basicInfo.issue }}</strong></div>
            <div v-if="basicInfo.funding" class="description-item"><span>资金来源</span><strong>{{ basicInfo.funding }}</strong></div>
            <div class="description-item" :class="basicReviewClass('targets')" v-bind="reviewAttributes('targets')" v-on="reviewEvents('targets')">
              <span>项目目标板块</span><strong>{{ basicInfo.targets }}</strong>
            </div>
            <div v-for="field in basicReviewFields.slice(2)" :key="field.key" class="description-item" :class="[field.wide ? 'wide' : '', basicReviewClass(field.key)]" v-bind="reviewAttributes(field.key)" v-on="reviewEvents(field.key)"><span>{{ field.label }}<template v-if="detailType === 'monthly-donation' && mode === 'audit' && field.key === 'requested'">（预算调整比例 ±100%）</template></span><strong v-if="field.key === 'mailingAddress'" class="basic-field-multiline">{{ basicInfo.mailingAddress }}<br>邮编：{{ basicInfo.postalCode }}</strong><strong v-else :class="{ 'basic-field-multiline': field.multiline }">{{ basicInfo[field.valueKey] }}</strong></div>
          </div>
        </section>

        <section v-if="isGreenHomeExample && detailTableData.organizationBasicInfo" id="detail-organization-basic" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="bank" /></span><div><h2>机构基本信息</h2><p v-if="hasOrganizationReviewComments" class="review-hint">点击内容区域（伙伴填写）可添加审核意见，添加后该内容区域底色标红</p></div></div><div class="detail-module-content">
          <div class="description-grid">
            <div class="description-item wide" :class="basicReviewClass(organizationReviewKey('entrepreneurshipOverview'))" v-bind="reviewAttributes(organizationReviewKey('entrepreneurshipOverview'))" v-on="reviewEvents(organizationReviewKey('entrepreneurshipOverview'))"><span>{{ detailType === 'grass' ? '机构简介' : '创业概述' }}</span><strong class="basic-field-multiline">{{ detailTableData.organizationBasicInfo.entrepreneurshipOverview }}</strong></div>
            <div v-for="item in detailTableData.organizationBasicInfo.staffCounts" :key="item.key || item.label" class="description-item"><span>{{ item.label }}</span><strong>{{ item.count }}</strong></div>
          </div>
          <h3 class="table-subtitle">组织信息</h3>
          <div class="detail-table-wrap">
            <table class="detail-table team-table">
              <colgroup><col class="project-detail-index-col" /><col class="team-col-name" /><col class="team-col-role" /><col /><col class="organization-work-type-col" /></colgroup>
              <thead><tr><th>序号</th><th>姓名</th><th>职位</th><th>团队分工</th><th>工作性质</th></tr></thead>
              <tbody><tr v-for="(member, index) in detailTableData.organizationBasicInfo.members" :key="member.id" :class="reviewRowClass(organizationMemberSection, member.id)" v-bind="reviewAttributes(rowReviewKey(organizationMemberSection, member.id))" v-on="reviewEvents(rowReviewKey(organizationMemberSection, member.id))"><td><review-row-comments :comment="rowCellReviewComment(organizationMemberSection, member.id)">{{ index + 1 }}</review-row-comments></td><td>{{ member.name }}</td><td>{{ member.position }}</td><td>{{ member.responsibilities }}</td><td>{{ member.usesLingxi ? member.workType + ' / ' + (member.usesLingxi === '是' ? '领薪' : '不领薪') : member.workType }}</td></tr></tbody>
            </table>
          </div>
          <project-rich-content v-if="detailType === 'grass'" class="rich-content">
            <section class="project-rich-section"><h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(organizationReviewKey('businessLogic'))">业务逻辑</button><template v-else>业务逻辑</template></h3><div class="rich-text-field" :class="contentReviewClass(organizationReviewKey('businessLogic'))"><p v-for="(paragraph, index) in detailTableData.organizationBasicInfo.businessLogic" :key="index">{{ paragraph }}</p></div></section>
            <section class="project-rich-section"><h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(organizationReviewKey('coreProjects'))">核心项目/产品简介</button><template v-else>核心项目/产品简介</template></h3><div class="rich-text-field" :class="contentReviewClass(organizationReviewKey('coreProjects'))"><p v-for="(paragraph, index) in detailTableData.organizationBasicInfo.coreProjects" :key="index">{{ paragraph }}</p></div></section>
            <section v-if="detailType === 'grass' && detailTableData.organizationBasicInfo.governanceStructure" class="project-rich-section"><h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(organizationReviewKey('governanceStructure'))">工作 / 管理 / 治理结构图</button><template v-else>工作 / 管理 / 治理结构图</template></h3><div class="rich-text-field" :class="contentReviewClass(organizationReviewKey('governanceStructure'))"><p v-for="(paragraph, index) in detailTableData.organizationBasicInfo.governanceStructure.paragraphs" :key="index">{{ paragraph }}</p><img :src="detailTableData.organizationBasicInfo.governanceStructure.image" alt="示例结构图：理事会下设机构负责人，机构负责人管理项目执行组和行政财务组" style="display: block; width: 100%; max-width: 680px; height: auto; margin: 16px auto;" /></div></section>
          </project-rich-content>
          <div v-if="detailType === 'grass' && detailTableData.organizationBasicInfo.highestDecisionMakingBody" class="detail-table-wrap">
            <table class="detail-table"><thead><tr><th>机构最高决策层</th></tr></thead><tbody><tr v-for="item in detailTableData.organizationBasicInfo.highestDecisionMakingBody" :key="item.id" :class="reviewRowClass('highestDecisionMakingBody', item.id)" v-bind="reviewAttributes(rowReviewKey('highestDecisionMakingBody', item.id))" v-on="reviewEvents(rowReviewKey('highestDecisionMakingBody', item.id))"><td><review-row-comments :comment="rowCellReviewComment('highestDecisionMakingBody', item.id)">{{ item.content }}</review-row-comments></td></tr></tbody></table>
          </div>
          <template v-if="detailType === 'grass' && detailTableData.organizationBasicInfo.fundraising">
            <h3 class="table-subtitle">筹资情况</h3>
            <div class="detail-table-wrap"><table class="detail-table organization-fundraising-table"><colgroup><col style="width: 100px;" /><col /><col style="width: 180px;" /><col style="width: 130px;" /></colgroup><thead><tr><th>年份</th><th>主要资助方</th><th>筹资额度（单位：元）</th><th>支撑费比例</th></tr></thead><tbody><tr v-for="row in detailTableData.organizationBasicInfo.fundraising.rows" :key="row.id" :class="reviewRowClass('organizationFundraising', row.id)" v-bind="reviewAttributes(rowReviewKey('organizationFundraising', row.id))" v-on="reviewEvents(rowReviewKey('organizationFundraising', row.id))"><td><review-row-comments :comment="rowCellReviewComment('organizationFundraising', row.id)">{{ row.year }}</review-row-comments></td><td>{{ row.funders }}</td><td>{{ row.amount }}</td><td>{{ row.supportRatio }}</td></tr><tr><td>合计</td><td></td><td>{{ detailTableData.organizationBasicInfo.fundraising.total }}</td><td></td></tr></tbody></table></div>
          </template>
        </div></section>

        <section v-if="isGreenHomeExample && detailTableData.organizationDevelopment" id="detail-organization-background" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="solution" /></span><div><h2>{{ detailType === 'grass' ? '机构成长需求分析' : '创业背景 / 机构成长需求分析' }}</h2><p v-if="detailType === 'grass' ? mode === 'audit' : hasDevelopmentReviewComments('background')" class="review-hint">点击内容区域（伙伴填写）可添加审核意见，添加后该内容区域底色标红</p></div></div><div class="detail-module-content">
          <div v-if="detailType === 'grass'" class="description-grid grass-growth-details">
            <div v-for="item in detailTableData.organizationDevelopment.growthNeeds" :key="item.key" class="description-item wide" :class="basicReviewClass(item.key)" v-bind="reviewAttributes(item.key)" v-on="reviewEvents(item.key)"><span>{{ item.title }}</span><strong class="basic-field-multiline">{{ item.content }}</strong></div>
          </div>
          <project-rich-content v-else class="rich-content">
            <section v-for="item in detailTableData.organizationDevelopment.background" :key="item.key" class="project-rich-section">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(developmentReviewKey('background', item))">{{ item.title }}</button><template v-else>{{ item.title }}</template></h3>
              <div class="rich-text-field" :class="contentReviewClass(developmentReviewKey('background', item))"><p v-for="(paragraph, index) in item.paragraphs" :key="index">{{ paragraph }}</p></div>
            </section>
          </project-rich-content>
        </div></section>

        <section v-if="isGreenHomeExample && detailTableData.organizationDevelopment" id="detail-organization-plan" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="compass" /></span><div><h2>发展目标与实施计划</h2><p v-if="hasDevelopmentReviewComments('plan')" class="review-hint">点击内容区域（伙伴填写）可添加审核意见，添加后该内容区域底色标红</p></div></div><div class="detail-module-content">
          <project-rich-content class="rich-content">
            <section v-for="item in detailTableData.organizationDevelopment.plan" :key="item.key" class="project-rich-section">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(developmentReviewKey('plan', item))">{{ item.title }}</button><template v-else>{{ item.title }}</template></h3>
              <div class="rich-text-field" :class="contentReviewClass(developmentReviewKey('plan', item))"><p v-for="(paragraph, index) in item.paragraphs" :key="index">{{ paragraph }}</p></div>
            </section>
          </project-rich-content>
        </div></section>

        <section v-if="!isGreenHomeExample" id="detail-content" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="read" /></span><div><h2>{{ isDonationProject ? '详细资料' : '附加信息' }}</h2><p v-if="hasAdditionalReviewComments" class="review-hint">点击标题添加或编辑审核意见，添加审核意见后内容区域底色标红</p></div></div><div class="detail-module-content">
          <project-rich-content v-if="isDonationProject" class="rich-content">
            <section v-for="field in detailTableData.detailedMaterials" :key="field.key" class="project-rich-section" :data-field="field.key">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview(field.key)">{{ field.title }}</button><template v-else>{{ field.title }}</template></h3>
              <div class="rich-text-field" :class="contentReviewClass(field.key)"><p v-for="(paragraph, index) in field.paragraphs" :key="index">{{ paragraph }}</p></div>
            </section>
          </project-rich-content>
          <project-rich-content v-else class="rich-content">
            <section class="project-rich-section" data-field="projectOverview">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview('overview')">项目概述</button><template v-else>项目概述</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('overview')">
                <p>本项目拟通过对青海省玉树州治多县扎河乡牧户进行入户调研、宣传并指导零废弃家庭建设，推广高海拔地区零废弃社区建设经验，指导牧民研发资源再生利用产品。</p>
                <p>项目将从源头减少三江源环境脆弱地区不可降解垃圾的产生，缓解经济发展与生态保护之间的矛盾，<strong>调动牧民参与零废弃行动的积极性</strong>。</p>
              </div>
            </section>
            <section class="project-rich-section" data-field="projectBackground">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview('background')">项目背景</button><template v-else>项目背景</template></h3>
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
            <section class="project-rich-section" data-field="projectGoal">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview('goal')">项目总目标</button><template v-else>项目总目标</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('goal')">
                <p>在三江源国家公园长江园区扎河乡口前村建立 20 户管护员家庭作为示范，使每户每年生活垃圾减少到 10 公斤以内，并共同制定和持续遵守禁塑减废制度。</p>
              </div>
            </section>
          </project-rich-content>
        </div></section>

        <section v-if="!isGreenHomeExample" id="detail-area" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="environment" /></span><div><h2>项目实施区域</h2><p v-if="hasAreaReviewComments" class="review-hint">点击表格行添加或编辑审核意见，添加审核意见后行背景色标红</p></div></div><div class="detail-module-content">
          <div class="detail-table-wrap"><table class="detail-table project-area-table"><colgroup><col class="project-detail-index-col" /><col /><col /><col /></colgroup><thead><tr><th>序号</th><th>省 / 直辖市</th><th>地级市 / 直辖市区</th><th>行政区</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.areas" :key="row.id" :class="reviewRowClass('areas', row.id)" v-bind="reviewAttributes(rowReviewKey('areas', row.id))" v-on="reviewEvents(rowReviewKey('areas', row.id))"><td><review-row-comments :comment="rowCellReviewComment('areas', row.id)">{{ rowIndex + 1 }}</review-row-comments></td><td>{{ row.province }}</td><td>{{ row.city }}</td><td>{{ row.district }}</td></tr></tbody></table></div>
        </div></section>

        <section v-if="!isGreenHomeExample" id="detail-team" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon violet"><a-icon type="team" /></span><div><h2>执行团队</h2><p v-if="mode === 'audit'" class="review-hint">点击表格行、标题添加或编辑审核意见</p></div></div><div class="detail-module-content">
          <div class="detail-table-wrap">
            <table class="detail-table team-table">
              <colgroup><col class="project-detail-index-col" /><col class="team-col-name" /><col class="team-col-role" /><col /></colgroup>
              <thead><tr><th>序号</th><th>姓名</th><th>职位</th><th>工作内容</th></tr></thead>
              <tbody><tr v-for="(row, rowIndex) in detailTableData.team" :key="row.id" :class="reviewRowClass('team', row.id)" v-bind="reviewAttributes(rowReviewKey('team', row.id))" v-on="reviewEvents(rowReviewKey('team', row.id))"><td><review-row-comments :comment="rowCellReviewComment('team', row.id)">{{ rowIndex + 1 }}</review-row-comments></td><td>{{ row.name }}</td><td>{{ row.position }}</td><td>{{ row.responsibilities }}</td></tr></tbody>
            </table>
          </div>
          <project-rich-content class="rich-content">
            <section class="project-rich-section" data-field="teamManagementExperience">
              <h3 :class="{ 'review-heading': mode === 'audit' }"><button v-if="mode === 'audit'" type="button" @click="openReview('experience')">团队或成员项目管理执行经验</button><template v-else>团队或成员项目管理执行经验</template></h3>
              <div class="rich-text-field" :class="contentReviewClass('experience')">
                <p>团队曾持续推动三江源地区零废弃家庭建设，具备<strong>社区动员、环境教育、物资管理与项目监测</strong>等综合经验。</p>
                <p>核心成员熟悉高海拔地区项目执行环境，能够协调当地社区与合作机构，并依据项目计划完成过程记录、风险跟踪和成果复盘。</p>
              </div>
            </section>
          </project-rich-content>
        </div></section>

        <section id="detail-output" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>{{ isGreenHomeExample ? '机构发展衡量指标及活动' : '项目产出 / 活动' }}</h2><p v-if="hasOutputReviewComments" class="review-hint">点击产出标题或活动的内容区域，添加或编辑审核意见</p></div></div><div class="detail-module-content">
          <div v-for="(output, outputIndex) in detailTableData.outputs" :key="output.id" class="output-block">
            <div class="output-title" :class="outputReviewClass('output', output.id)" v-bind="reviewAttributes(outputReviewKey('output', output.id))" v-on="reviewEvents(outputReviewKey('output', output.id))"><span>产出 {{ outputIndex + 1 }}</span><strong><review-row-comments :comment="rowCellReviewComment('outputs', output.id)">{{ output.name }}</review-row-comments></strong></div>
            <div class="output-standard"><span>产出衡量标准</span><div><p v-for="(paragraph, paragraphIndex) in output.standard.split('\n')" :key="paragraphIndex">{{ paragraph }}</p></div></div>
            <div v-for="(activity, activityIndex) in output.activities" :key="activity.id" class="activity-card" :class="outputReviewClass('activity', activity.id)" v-bind="reviewAttributes(outputReviewKey('activity', activity.id))" v-on="reviewEvents(outputReviewKey('activity', activity.id))"><div><span>活动 {{ outputIndex + 1 }}.{{ activityIndex + 1 }}</span><strong><review-row-comments :comment="rowCellReviewComment('activities', activity.id)">{{ activity.name }}</review-row-comments></strong></div><dl><div><dt>活动时间</dt><dd>{{ activity.start }} 至 {{ activity.end }}</dd></div><div><dt>活动地点</dt><dd>{{ activity.location }}</dd></div><div><dt>执行人员</dt><dd>{{ activity.people }}</dd></div></dl><p>{{ activity.content }}</p></div>
          </div>
        </div></section>

        <section v-if="!isDonationProject" id="detail-management" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="safety-certificate" /></span><div><h2>项目管理计划</h2><p v-if="mode === 'audit' && (detailType !== 'grass' || detailTableData.risks.some(row => hasReviewComment(reviewComments[rowReviewKey('risks', row.id)])))" class="review-hint">点击表格行添加或编辑审核意见，添加审核意见后行背景色标红</p></div></div><div class="detail-module-content">
          <template v-if="!isGreenHomeExample">
            <h3 class="table-subtitle">项目相关方</h3>
            <div class="detail-table-wrap">
              <table class="detail-table stakeholder-table">
                <colgroup><col class="stakeholder-col-index" /><col class="stakeholder-col-party" /><col class="stakeholder-col-interest" /><col class="stakeholder-col-impact" /><col /></colgroup>
                <thead><tr><th>序号</th><th>利益相关方</th><th>利益内容</th><th>产生影响</th><th>管理内容</th></tr></thead>
                <tbody><tr v-for="(row, rowIndex) in detailTableData.stakeholders" :key="row.id" :class="reviewRowClass('stakeholders', row.id)" v-bind="reviewAttributes(rowReviewKey('stakeholders', row.id))" v-on="reviewEvents(rowReviewKey('stakeholders', row.id))"><td><review-row-comments :comment="rowCellReviewComment('stakeholders', row.id)">{{ rowIndex + 1 }}</review-row-comments></td><td>{{ row.party }}</td><td>{{ row.interest }}</td><td><span :class="{ 'positive-tag': row.impact === '积极', 'negative-tag': row.impact === '消极' }">{{ row.impact }}</span></td><td>{{ row.management }}</td></tr></tbody>
              </table>
            </div>
          </template>
          <h3 class="table-subtitle">项目风险</h3>
          <div class="detail-table-wrap"><table class="detail-table risk-table"><colgroup><col class="compact-index-col" /><col class="risk-level-col" /><col /><col /><col /></colgroup><thead><tr><th>序号</th><th>可能性</th><th>风险内容</th><th>应对措施</th><th>影响目标或活动</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.risks" :key="row.id" :class="reviewRowClass('risks', row.id)" v-bind="reviewAttributes(rowReviewKey('risks', row.id))" v-on="reviewEvents(rowReviewKey('risks', row.id))"><td><review-row-comments :comment="rowCellReviewComment('risks', row.id)">{{ rowIndex + 1 }}</review-row-comments></td><td>{{ row.likelihood }}</td><td>{{ row.description }}</td><td>{{ row.response }}</td><td>{{ row.affectedActivities }}</td></tr></tbody></table></div>
          <template v-if="!isGreenHomeExample">
            <h3 class="table-subtitle">监测评估计划</h3>
            <div class="detail-table-wrap"><table class="detail-table monitoring-table"><colgroup><col class="compact-index-col" /><col /><col /></colgroup><thead><tr><th>序号</th><th>监测评估目的</th><th>监测评估方法</th></tr></thead><tbody><tr v-for="(row, rowIndex) in detailTableData.monitoring" :key="row.id" :class="reviewRowClass('monitoring', row.id)" v-bind="reviewAttributes(rowReviewKey('monitoring', row.id))" v-on="reviewEvents(rowReviewKey('monitoring', row.id))"><td><review-row-comments :comment="rowCellReviewComment('monitoring', row.id)">{{ rowIndex + 1 }}</review-row-comments></td><td>{{ row.purpose }}</td><td>{{ row.method }}</td></tr></tbody></table></div>
          </template>
        </div></section>

        <section id="detail-budget" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>在线预算表</h2><p>项目预算及执行情况概览</p></div></div><div class="detail-module-content">
          <budget-prototype embedded shared-data editor-table :audit="mode === 'audit'" :donation-project="isDonationProject" :budget="displayBudget" />
        </div></section>

        <section v-if="!snapshotEntry && !isGreenHomeExample" id="detail-attachments" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2><p>项目相关附件，如有需要请下载留存</p></div></div><div class="detail-module-content">
          <div class="attachment-list"><div v-for="file in detailAttachments" :key="file.id"><div><strong>{{ file.name }}</strong><span>{{ file.type }} · {{ file.uploadedAt }}</span></div><a-button type="link" @click="notify('预览' + file.name + '（演示入口）')">预览</a-button><a-button type="link" @click="notify('下载' + file.name + '（演示入口）')">下载</a-button></div></div>
        </div></section>

        <section v-if="!snapshotEntry && detailTableData.auditHistory && detailTableData.auditHistory.length" id="detail-history" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon gray"><a-icon type="history" /></span><div><h2>审核信息</h2></div></div><div class="detail-module-content">
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
                  <button v-if="entry.snapshot" class="audit-resource-link audit-snapshot-resource" type="button" @click="openSnapshot(entry)">申请书快照</button>
                </div>
                <div v-if="entry.remark" class="audit-result-details">
                  <p><b>审核备注：</b>{{ entry.remark }}</p>
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </div></section>

        <section v-if="mode === 'audit'" id="detail-audit" :key="auditModule.type" :data-audit-type="auditModule.type" class="panel detail-section">
          <div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="audit" /></span><div><h2>{{ auditModule.title }}</h2></div></div><div class="detail-module-content">
          <div class="project-audit-form">
            <div class="audit-form-grid">
            <div class="audit-form-column">
            <div class="audit-form-row">
              <label for="audit-result"><em>*</em> 审核结果：</label>
              <a-select id="audit-result" v-model="auditForm.result">
                <a-select-option v-for="option in auditResultOptions" :key="option.value" :value="option.value">{{ option.label }}</a-select-option>
              </a-select>
            </div>
            <div v-if="!isPlanningAudit && basicInfo.type === '联合公益'" class="audit-form-row">
              <label for="audit-agreement-number"><em>*</em> 框架协议编号：</label>
              <a-input id="audit-agreement-number" v-model="auditForm.frameworkAgreementNumber" placeholder="请输入框架协议编号" />
            </div>
            <div v-else class="audit-form-row audit-amount-row">
              <label for="audit-amount"><em>*</em> {{ isPlanningAudit ? '资助总金额' : '审核通过金额' }}：</label>
              <a-input id="audit-amount" v-model="auditForm.approvedAmount" :disabled="auditModule.type === 'functional-department'" suffix="元" :placeholder="isPlanningAudit ? '请输入资助总金额' : '请输入审核通过金额'" />
              <div class="audit-amount-uppercase">大写：{{ auditAmountUppercase }}</div>
            </div>
            <div v-if="isPlanningAudit" class="audit-form-row audit-amount-row">
              <label for="audit-expected-amount"><em>*</em> 预计筹款金额：</label>
              <a-input id="audit-expected-amount" v-model="auditForm.expectedAmount" :disabled="auditModule.type === 'project-center'" suffix="元" :placeholder="auditModule.type === 'project-center' ? '金额由职能部门填写' : '请输入预计筹款金额'" />
              <div class="audit-amount-uppercase">大写：{{ auditExpectedAmountUppercase }}</div>
            </div>
            <div class="audit-upload-field">
              <div class="audit-upload-heading"><label><em>*</em> 上传评审附件：</label><a-upload :before-upload="addAuditFile" :file-list="auditFiles" :show-upload-list="false"><a-button><a-icon type="upload" />点击上传</a-button></a-upload></div>
              <div v-for="file in auditFiles" :key="file.uid" class="audit-upload-item"><a-icon type="paper-clip" /><span>{{ file.name }}</span><button type="button" :aria-label="`移除${file.name}`" @click="removeAuditFile(file.uid)"><a-icon type="delete" /></button></div>
            </div>
            </div>
            <div class="audit-form-column">
            <div class="audit-form-row">
              <label for="audit-remark"><em v-if="isPlanningAudit">*</em> 审核备注信息：</label>
              <a-textarea id="audit-remark" v-model="auditForm.remark" :rows="5" :placeholder="isPlanningAudit ? '请输入审核备注信息' : '驳回时必填'" />
            </div>
            <div class="audit-funding-hint">
              <div class="audit-hint-title">提示信息</div>
              <div><span>{{ basicInfo.type === '联合公益' ? '招募筹款目标' : '招募资助总额' }}</span><strong>{{ auditFundingTotal.toLocaleString('en-US') }} 元</strong></div>
              <template v-if="isPlanningAudit">
                <div><span>资助总额中包括筹款规划</span><strong>{{ auditPlannedFundingTotal.toLocaleString('en-US') }} 元</strong></div>
                <div><span>该招募执行中项目的资助总计</span><strong>{{ auditExecutingFundingTotal.toLocaleString('en-US') }} 元</strong></div>
              </template>
              <div v-else><span>本项目通过后招募资助余额</span><strong :class="{ 'audit-balance-negative': auditFundingBalance < 0 }">{{ auditFundingBalance === null ? '—' : auditFundingBalance.toLocaleString('en-US') + ' 元' }}</strong></div>
            </div>
            </div>
            </div>
            <div class="audit-form-actions">
              <a-button @click="$router.push({ name: 'applied-projects' })">取消</a-button>
              <a-button type="primary" @click="submitProjectAudit">提交审核</a-button>
            </div>
          </div>
        </div></section>

      <project-snapshot-window v-if="activeSnapshot" @close="activeSnapshot = null">
        <div slot="title-meta" class="audit-result-row"><span class="audit-info-chip audit-time">{{ activeSnapshot.time }} · {{ activeSnapshot.reviewer }}</span></div>
        <project-detail :project-id="projectId" :detail-type="detailType" :table-data="snapshotData" :snapshot-entry="activeSnapshot" mode="view" />
      </project-snapshot-window>

      <a-modal v-if="mode === 'audit'" v-model="targetReviewVisible" title="编辑审核意见" :width="560" :mask-closable="false" @cancel="targetReviewVisible = false">
      <a-textarea v-model="targetReviewDraft" aria-label="审核意见" placeholder="请输入审核意见" :rows="5" />
      <template slot="footer">
        <div class="review-dialog-actions">
        <a-button v-if="hasReviewComment(reviewComments[reviewField])" type="danger" @click="deleteTargetReview">删除</a-button>
        <div class="review-dialog-actions-right"><a-button v-if="!hasReviewComment(reviewComments[reviewField])" @click="targetReviewVisible = false">取消</a-button><a-button type="primary" @click="saveTargetReview">{{ hasReviewComment(reviewComments[reviewField]) ? '修改' : '确认' }}</a-button></div>
        </div>
      </template>
    </a-modal>
</section>
</template>

<script>
import { budgetKey, readBudgetProject, readSavedBudget, normalizeBudget } from '../utils/project-budget'
import defaultTableData from '../mock/project-tables.json'
import auditBudget0258 from '../mock/project-1764740258-budget.json'
import greenHomeTableData from '../mock/project-green-home-detail.json'
import grassTableData from '../mock/project-grass-detail.json'
import monthlyDonationTableData from '../mock/project-monthly-donation-detail.json'
import oneTimeDonationTableData from '../mock/project-one-time-donation-detail.json'
import ProjectSnapshotWindow from '../components/ProjectSnapshotWindow.vue'
import BudgetPrototype from '../components/BudgetPrototype.vue'
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'

// 同一容器统一插入真实分隔元素，兼容静态及 v-for 富文本区块。
const ReviewRowComments = {
  functional: true,
  props: ['comment'],
  render (h, context) {
    const children = context.children || []
    if (!context.props.comment) return h('span', children)
    return h('span', { class: 'review-row-summary' }, children.concat([
      h('span', { attrs: { title: '查看单元格审核意见' }, on: { click: event => event.stopPropagation(), keydown: event => event.stopPropagation() } }, [
        h(ReviewCommentLabel, { props: { comment: context.props.comment } }, [h('span', { attrs: { role: 'img', 'aria-label': '查看单元格审核意见' } }, [h('a-icon', { props: { type: 'exclamation-circle' } })])])
      ])
    ]))
  }
}
const ProjectRichContent = {
  functional: true,
  render (h, context) {
    const nodes = []
    let sections = 0
    ;(context.children || []).forEach(node => {
      if (node.tag === 'section') {
        if (sections++) nodes.push(h('div', { class: 'project-rich-separator', attrs: { 'aria-hidden': 'true' } }, [h('span', { class: 'project-rich-separator-dot' })]))
      }
      nodes.push(node)
    })
    return h('article', context.data, nodes)
  }
}
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
const organizationReviewFields = (() => {
    const fields = basicReviewFields.map(field => {
      if (field.key === 'executionPeriod') return { ...field, label: '资助周期' }
      if (field.key === 'organization') return { ...field, label: '申请机构', readonly: true }
      if (field.key === 'total') return { ...field, wide: false }
      if (field.key === 'matching') return { ...field, key: 'otherLocalFunding', label: '其他地方资助', valueKey: 'otherLocalFunding', multiline: true }
      return field
    }).filter(field => field.key !== 'beneficiaries' && field.key !== 'publicBenefit')
    fields.splice(fields.findIndex(field => field.key === 'organization') + 1, 0, { key: 'organizationCode', label: '机构信息编码', valueKey: 'organizationCode', readonly: true })
    fields.splice(fields.findIndex(field => field.key === 'aid') + 1, 0, { key: 'environmentalFields', label: '从事的环保领域', valueKey: 'environmentalFields' })
    fields.push({ key: 'email', label: '电子邮箱', valueKey: 'email' }, { key: 'mailingAddress', label: '邮寄地址', valueKey: 'mailingAddress', multiline: true })
    return fields
  })()
const detailFieldVariants = {
  default: basicReviewFields,
  'green-home': organizationReviewFields.filter(field => !['email', 'mailingAddress'].includes(field.key)),
  grass: organizationReviewFields,
  'one-time-donation': (() => {
    const fields = basicReviewFields.map(field => {
      if (field.key === 'total') return { ...field, label: '筹款目标', wide: false }
      if (field.key === 'requested') return { ...field, label: '协议拨款额' }
      if (field.key === 'matching') return { ...field, label: '已拨付协议金额' }
      return field
    })
    const executionPeriod = fields.splice(fields.findIndex(field => field.key === 'executionPeriod'), 1)[0]
    fields.splice(fields.findIndex(field => field.key === 'targets') + 1, 0, executionPeriod)
    fields.splice(fields.findIndex(field => field.key === 'thirdParties') + 1, 0,
      { key: 'frameworkAgreementNumber', label: '框架协议编号', valueKey: 'frameworkAgreementNumber' },
      { key: 'onlineFundraisingPlatform', label: '互联网公开募捐平台', valueKey: 'onlineFundraisingPlatform' })
    fields.splice(fields.findIndex(field => field.key === 'total') + 1, 0,
      { key: 'fundraisingPeriod', label: '筹款周期', valueKey: 'fundraisingPeriod' })
    fields.splice(fields.findIndex(field => field.key === 'matching') + 1, 0,
      { key: 'minimumExecutionAmount', label: '最低执行额', valueKey: 'minimumExecutionAmount' },
      { key: 'publicFundraiserManagementFeeRatio', label: '公募机构管理费比例', valueKey: 'publicFundraiserManagementFeeRatio' },
      { key: 'donationUsePlan', label: '善款使用预案', valueKey: 'donationUsePlan', wide: true, multiline: true })
    return fields
  })(),
  'monthly-donation': null
}
detailFieldVariants['monthly-donation'] = detailFieldVariants['one-time-donation']
  .filter(field => !['total', 'fundraisingPeriod', 'minimumExecutionAmount', 'publicFundraiserManagementFeeRatio', 'donationUsePlan'].includes(field.key))
  .map(field => ['frameworkAgreementNumber', 'requested', 'matching'].includes(field.key) ? { ...field, readonly: true } : field)
const detailTableDataByType = {
  default: defaultTableData,
  'green-home': greenHomeTableData,
  grass: grassTableData,
  'one-time-donation': oneTimeDonationTableData,
  'monthly-donation': monthlyDonationTableData
}
export default {
  name: 'ProjectDetail',
  props: {
    projectId: { type: Number, required: true },
    snapshotEntry: { type: Object, default: null },
    mode: { type: String, default: 'view' },
    auditType: { type: String, default: 'default' },
    detailType: { type: String, default: 'default' },
    // 接口返回同结构 JSON 后可通过路由容器传入，或在此接入请求。
    tableData: { type: Object, default: null }
  },
  data () {
    const typeTableData = detailTableDataByType[this.detailType] || defaultTableData
    const sourceTableData = (this.tableData ? { ...typeTableData, ...this.tableData, basic: { ...typeTableData.basic, ...(this.tableData.basic || {}) } } : null) || (['one-time-donation', 'monthly-donation'].includes(this.detailType)
      ? { ...defaultTableData, ...typeTableData, basic: { ...defaultTableData.basic, ...typeTableData.basic } }
      : typeTableData)
    const comments = Object.prototype.hasOwnProperty.call(sourceTableData, 'reviewComments') ? { ...sourceTableData.reviewComments } : { targets: '请补充各项目目标板块对应的成果指标及衡量方式。', overview: '请补充项目受益范围和社区参与方式。', 'areas.areas-1': '请核实实施区域与活动地点的一致性。', 'outputs.output-1': '请明确产出的数量、完成时间和验收依据。', 'activities.activity-2-1': '请补充活动实施安排及执行人员分工。' }
    try {
      const saved = JSON.parse(localStorage.getItem('see-project-review-example-' + this.projectId))
      if (!this.tableData && saved && saved.reviewComments && typeof saved.reviewComments === 'object' && !Array.isArray(saved.reviewComments)) { Object.keys(comments).forEach(key => delete comments[key]); Object.assign(comments, saved.reviewComments) }
    } catch (error) { /* Invalid local data does not prevent opening the page. */ }
    return {
    detailTableData: { ...JSON.parse(JSON.stringify(sourceTableData)), reviewComments: comments },
    budgetProject: null,
    activeSnapshot: null,
    snapshotData: null,
    targetReviewVisible: false,
    targetReviewDraft: '',
    reviewField: 'targets',
    auditForm: {
        result: 'approved',
        frameworkAgreementNumber: sourceTableData.basic.frameworkAgreementNumber || '',
        approvedAmount: '5000',
        expectedAmount: '',
        remark: ''
      },
    auditFiles: [],
    // 招募汇总及筹款金额暂为本地演示数据，后续由接口带入。
    auditFundingTotal: 10000,
    auditPlannedFundingTotal: 5000,
    auditExecutingFundingTotal: 5000
  } },
  computed: {
    displayBudget () {
      if (this.budgetProject) return this.budgetProject.budget
      if (!this.tableData && !this.snapshotEntry && this.projectId === 6 && this.detailType === 'default') return auditBudget0258
      return this.detailTableData.budget
    },
    isDonationProject () { return ['one-time-donation', 'monthly-donation'].includes(this.detailType) },
    reviewComments () { return this.detailTableData.reviewComments },
    detailAttachments () {
      if (this.isDonationProject) {
        const order = ['诚信承诺函', '上线文案', '预算表', '其他附件']
        return (this.detailTableData.attachments || []).slice().sort((a, b) => {
          const rank = type => { const index = order.indexOf(type); return index < 0 ? order.length : index }
          return rank(a.type) - rank(b.type)
        })
      }
      return [
        { id: 'budget', name: '项目预算表.xlsx', type: '预算表', uploadedAt: '2025-12-28 23:59' },
        { id: 'plan', name: '项目实施方案.pdf', type: '其他附件', uploadedAt: '2025-12-28 23:59' }
      ]
    },
    organizationMemberSection () { return this.detailType === 'grass' ? 'organizationMembers' : 'organizationBasicInfo.members' },
    hasOrganizationReviewComments () {
      const keys = (this.detailType === 'grass' ? ['entrepreneurshipOverview', 'businessLogic', 'coreProjects'] : ['entrepreneurshipOverview']).map(this.organizationReviewKey)
      keys.push(...this.reviewRowKeys(this.organizationMemberSection, this.detailTableData.organizationBasicInfo.members))
      if (this.detailType === 'grass') { keys.push('governanceStructure', ...this.reviewRowKeys('highestDecisionMakingBody', this.detailTableData.organizationBasicInfo.highestDecisionMakingBody), ...this.reviewRowKeys('organizationFundraising', this.detailTableData.organizationBasicInfo.fundraising.rows)) }
      return this.hasModuleReviewComments(keys)
    },
    hasAdditionalReviewComments () { return this.hasModuleReviewComments(this.isDonationProject ? this.detailTableData.detailedMaterials.map(field => field.key) : ['overview', 'background', 'goal']) },
    hasAreaReviewComments () { return this.hasModuleReviewComments(this.reviewRowKeys('areas', this.detailTableData.areas)) },
    hasTeamReviewComments () { return this.hasModuleReviewComments(['experience'].concat(this.reviewRowKeys('team', this.detailTableData.team))) },
    hasOutputReviewComments () { return this.hasModuleReviewComments(this.reviewRowKeys('outputs', this.detailTableData.outputs).concat(...(this.detailTableData.outputs || []).map(output => this.reviewRowKeys('activities', output.activities)))) },
    hasManagementReviewComments () { const sections = this.isGreenHomeExample ? ['risks'] : ['stakeholders', 'risks', 'monitoring']; return this.hasModuleReviewComments([].concat(...sections.map(section => this.reviewRowKeys(section, this.detailTableData[section])))) },
    auditModule () {
      if (this.auditType === 'project-center') return { type: 'project-center', title: '项目组或中心审核' }
      if (this.auditType === 'functional-department') return { type: 'functional-department', title: '职能部门审核' }
      return { type: 'default', title: '审核' }
    },
    isPlanningAudit () { return this.auditModule.type !== 'default' },
    auditResultOptions () {
      if (this.auditModule.type === 'project-center') return [
        { value: 'approved', label: '通过 - 由筹款部门确认筹款数额' },
        { value: 'revision', label: '修改 - 项目状态将变更为“申请待修改”' },
        { value: 'pending', label: '待定 - 项目状态将变更为“申请待定”' },
        { value: 'eliminated', label: '淘汰 - 项目状态将变更为“申请淘汰”' }
      ]
      return [
        { value: 'approved', label: '通过 - 项目状态将变更为“审核流程中”' },
        this.isPlanningAudit
          ? { value: 'revision', label: '修改 - 项目状态将变更为“申请待修改”' }
          : { value: 'rejected', label: '驳回 - 项目状态将变更为“申请待修改”' }
      ]
    },
    auditExpectedAmountUppercase () { return this.formatAuditAmount(this.auditForm.expectedAmount) },
    basicReviewFields () { return detailFieldVariants[this.detailType] || detailFieldVariants.default },
    isGreenHomeExample () { return this.detailType === 'green-home' || this.detailType === 'grass' },
    basicInfo () { return this.detailTableData.basic },
    auditFundingBalance () {
      const value = this.auditForm.approvedAmount.trim()
      return /^\d{1,12}(\.\d{1,2})?$/.test(value) ? this.auditFundingTotal - Number(value) : null
    },
    auditAmountUppercase () { return this.formatAuditAmount(this.auditForm.approvedAmount) },
    detailProject () {
      return appliedProjects.find(project => project.id === this.projectId) || appliedProjects[0]
    }
  },
  methods: {
    loadSharedBudget () {
      this.budgetProject = null
      if (this.snapshotEntry || this.tableData) return
      try {
        const key = budgetKey(this.$route)
        const project = readBudgetProject(key)
        if (project) { this.budgetProject = project; return }
        const saved = readSavedBudget(key)
        if (saved) {
          this.budgetProject = { budget: normalizeBudget(saved) }
        }
      } catch (error) { this.$message.error('无法读取当前项目预算，请检查已保存数据。'); this.budgetProject = { budget: normalizeBudget({}) } }
    },
    isValidAuditAmount (value) { return typeof value === 'string' && /^\d{1,12}(\.\d{1,2})?$/.test(value.trim()) },
    formatAuditAmount (amount) {
      const value = amount.trim()
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

    hasReviewComment (comment) { return this.mode === 'audit' && typeof comment === 'string' && comment.trim().length > 0 },
    goBack () {
      if (window.history.length > 1) this.$router.go(-1)
      else this.$router.push({ name: 'applied-projects' })
    },
    reviewComment (key) { const value = this.reviewComments[key]; return typeof value === 'string' ? value.trim() : '' },
    basicReviewClass (field) { return this.mode === 'audit' && this.isReviewable(field) ? { 'review-label-trigger': true, 'review-has-comment': this.hasReviewComment(this.reviewComment(field)) } : {} },
    contentReviewClass (field) { return this.mode === 'audit' ? { 'review-has-comment': this.hasReviewComment(this.reviewComment(field)) } : {} },
    openReview (key) {
      if (this.mode !== 'audit' || !this.isReviewable(key)) return
      this.reviewField = key
      this.targetReviewDraft = this.reviewComment(key)
      this.targetReviewVisible = true
    },
    saveTargetReview () {
      const comments = this.reviewComments
      const key = this.reviewField, text = this.targetReviewDraft.trim()
      const previous = { ...comments }
      if (text) this.$set(comments, key, text)
      else this.$delete(comments, key)
      if (!this.persistReviewComments()) { Object.keys(comments).forEach(item => this.$delete(comments, item)); Object.keys(previous).forEach(item => this.$set(comments, item, previous[item])); return }
      this.targetReviewVisible = false
    },
    deleteTargetReview () {
      const comments = this.reviewComments
      const previous = { ...comments }
      this.$delete(comments, this.reviewField)
      if (!this.persistReviewComments()) { Object.keys(previous).forEach(item => this.$set(comments, item, previous[item])); return }
      this.targetReviewDraft = ''
      this.targetReviewVisible = false
    },
    persistReviewComments () {
      try { localStorage.setItem('see-project-review-example-' + this.projectId, JSON.stringify({ reviewComments: this.detailTableData.reviewComments })); return true }
      catch (error) { this.$message.error('本地审核意见保存失败，请重试'); return false }
    },
    organizationReviewKey (field) { return this.detailType === 'grass' ? field : 'organizationBasicInfo.' + field },
    developmentReviewKey (section, item) { return this.detailType === 'grass' ? item.key : 'organizationDevelopment.' + section + '.' + item.key },
    hasDevelopmentReviewComments (section) { const items = this.detailTableData.organizationDevelopment[section] || []; return this.hasModuleReviewComments(items.map(item => this.developmentReviewKey(section, item))) },
    isReviewable (key) { if (!key || ['type', 'strategy', 'issue', 'funding', 'organizationCode', 'fullTimeStaff', 'partTimeStaff', 'internAndVolunteers'].includes(key)) return false; const field = this.basicReviewFields.find(field => field.key === key); return !field || !field.readonly },
    reviewAttributes (key) { return this.mode === 'audit' && this.isReviewable(key) ? { role: 'button', tabindex: 0 } : {} },
    reviewEvents (key) { if (this.mode !== 'audit' || !this.isReviewable(key)) return {}; return { click: () => this.openReview(key), keydown: event => { if (event.target === event.currentTarget && ['Enter', ' ', 'Spacebar'].includes(event.key)) { event.preventDefault(); this.openReview(key) } } } },
    hasModuleReviewComments (keys) { return this.mode === 'audit' && keys.filter(Boolean).some(key => this.hasReviewComment(this.reviewComment(key)) || Object.keys(this.reviewComments).some(child => child.indexOf(key + '.') === 0 && this.hasReviewComment(this.reviewComment(child)))) },
    reviewRowKeys (section, rows) { return (rows || []).filter(row => row.id).map(row => this.rowReviewKey(section, row.id)) },
    rowReviewKey (section, id) { return id ? section + '.' + id : null },
    rowCellReviewComment (section, id) {
      if (this.mode !== 'audit' || !id) return ''
      const key = this.rowReviewKey(section, id)
      const fields = { areas: ['province', 'city', 'district'], team: ['name', 'position', 'responsibilities'], organizationMembers: ['name', 'position', 'responsibilities', 'workType'], 'organizationBasicInfo.members': ['name', 'position', 'responsibilities', 'workType'], highestDecisionMakingBody: ['content'], organizationFundraising: ['year', 'funders', 'amount', 'supportRatio'], stakeholders: ['party', 'interest', 'impact', 'management'], risks: ['likelihood', 'description', 'response', 'affectedActivities'], monitoring: ['purpose', 'method'], outputs: ['name', 'standard'], activities: ['name', 'start', 'end', 'location', 'people', 'content'] }
      const known = (fields[section] || []).map(field => key + '.' + field)
      const extra = Object.keys(this.reviewComments).filter(child => child.indexOf(key + '.') === 0 && !known.includes(child)).sort()
      return known.concat(extra).map(child => this.reviewComment(child)).filter(Boolean).join('\n')
    },
    rowReviewComment (section, id) { return [this.reviewComment(this.rowReviewKey(section, id)), this.rowCellReviewComment(section, id)].filter(Boolean).join('\n') },
    reviewRowClass (section, id) { return this.mode === 'audit' && id ? { 'review-row-trigger': true, 'review-row-has-comment': this.hasReviewComment(this.rowReviewComment(section, id)) } : {} },
    outputReviewKey (kind, id) { return this.rowReviewKey(kind === 'output' ? 'outputs' : 'activities', id) },
    outputReviewClass (kind, id) { return this.mode === 'audit' && id ? { 'output-review-trigger': true, 'review-has-comment': this.hasReviewComment(this.rowReviewComment(kind === 'output' ? 'outputs' : 'activities', id)) } : {} },
    addAuditFile (file) {
      this.auditFiles.push({ uid: file.uid, name: file.name, file })
      return false
    },
    removeAuditFile (uid) {
      this.auditFiles = this.auditFiles.filter(file => file.uid !== uid)
    },
    submitProjectAudit () {
      if (this.isPlanningAudit) {
        const selected = this.auditResultOptions.find(option => option.value === this.auditForm.result)
        if (!selected) return this.$message.warning('请选择有效的审核结果')
        if (!this.isValidAuditAmount(this.auditForm.approvedAmount) || Number(this.auditForm.approvedAmount) <= 0) return this.$message.warning('请输入大于零的有效资助总金额，最多两位小数')
        if (this.auditModule.type === 'functional-department' && !this.isValidAuditAmount(this.auditForm.expectedAmount)) return this.$message.warning('请输入有效预计筹款金额，最多两位小数，可为零')
        if (!this.auditFiles.length) return this.$message.warning('请上传评审附件')
        if (!this.auditForm.remark.trim()) return this.$message.warning('请填写审核备注信息')
        return this.$message.info(`本地审核校验通过：${this.auditModule.title} · ${selected.label}；尚未提交至服务器`)
      }
      if (!this.auditForm.result) return this.$message.warning('请选择审核结果')
      if (this.auditForm.result === 'rejected' && !this.auditForm.remark.trim()) return this.$message.warning('驳回时请填写审核备注')
      if (this.auditForm.result === 'approved') {
        if (this.basicInfo.type === '联合公益') {
          if (!this.auditForm.frameworkAgreementNumber.trim()) return this.$message.warning('请输入框架协议编号')
        } else if (this.auditFundingBalance === null || Number(this.auditForm.approvedAmount) <= 0) return this.$message.warning('请输入大于零的有效审核通过金额，最多两位小数')
        if (!this.auditFiles.length) return this.$message.warning('请上传评审附件')
      }
      const resultLabel = this.auditForm.result === 'approved' ? '审核通过' : '审核驳回'
      this.$message.info(`本地审核校验通过：${resultLabel}；尚未提交至服务器`)
    },
    openSnapshot (entry) {
      this.snapshotData = JSON.parse(JSON.stringify(this.detailTableData))
      this.activeSnapshot = { id: entry.id, time: entry.time, reviewer: entry.reviewer }
    },
    notify (label) { this.$message.info(label) }
  },
  components: { ProjectSnapshotWindow, BudgetPrototype, ProjectRichContent, ReviewRowComments },
  activated () { this.loadSharedBudget() },
  watch: {
    '$route.fullPath' () { this.loadSharedBudget() },
    tableData () { this.loadSharedBudget() },
    auditType () {
      // 同一详情页切换审核角色时，恢复演示带入值，避免上一个角色的输入污染只读金额。
      this.auditForm.result = 'approved'
      this.auditForm.approvedAmount = '5000'
      this.auditForm.expectedAmount = ''
      this.auditForm.remark = ''
      this.auditFiles = []
    }
  },
  deactivated () { this.targetReviewVisible = false; this.activeSnapshot = null },
}
</script>

<style scoped>
.detail-section-header .basic-review-hint { margin-top: 8px; }
.detail-section-header .review-hint { color: #AAAAAA; }
.project-snapshot-content { min-width: 0; }
#detail-audit ::v-deep #audit-amount.ant-input-disabled,
#detail-audit ::v-deep #audit-expected-amount.ant-input-disabled { background-color: #f5f5f5; color: #718095; }
.audit-upload-item { border-radius: 6px; }
.review-dialog-actions { display: flex; justify-content: space-between; align-items: center; }

.review-dialog-actions-right { margin-left: auto; display: flex; gap: 8px; }
.organization-work-type-col { width: 150px; }
.organization-fundraising-table th:nth-child(1),
.organization-fundraising-table td:nth-child(1),
.organization-fundraising-table th:nth-child(3),
.organization-fundraising-table td:nth-child(3),
.organization-fundraising-table th:nth-child(4),
.organization-fundraising-table td:nth-child(4) { text-align: center; }
.detail-table tr.review-row-trigger { cursor: pointer; }
.detail-table tr.review-row-trigger:hover > td { background: #f8fbff; }
.detail-table tr.review-row-has-comment > td { background: #fff1f0; }
.detail-table tr.review-row-has-comment:hover > td { background: #ffe7e5; }
.detail-table tr.review-row-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.review-dialog-actions-right > .ant-btn + .ant-btn { margin-left: 0; }
.output-review-trigger { cursor: pointer; }
.output-review-trigger:hover { background-color: #f8fbff; }
.output-review-trigger.review-has-comment:hover { background-color: #ffe7e5 !important; }
.output-review-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }

/* 本页内容容器负责外围留白，共用组件内部内容仍沿用业务样式。 */
.detail-module-content .output-block + .output-block { margin-top: 24px; }
.detail-module-content > .table-subtitle:first-child { margin-top: 0; }
.detail-module-content > .rich-content:not(:first-child) { margin-top: 32px; }
#detail-basic > .description-grid { --detail-inner-padding: 0 22px 22px; }
#detail-basic .description-item { gap: 8px; }

.detail-module-content .table-subtitle { font-family: inherit; line-height: 1.6; }
#detail-organization-basic .description-grid > .description-item:first-child,
.grass-growth-details > .description-item:first-child { min-height: 0; padding-top: 0; align-content: start; }
.review-row-summary { display: inline; }
.review-row-summary > span { margin-left: 6px; color: #cf1322; }
</style>
