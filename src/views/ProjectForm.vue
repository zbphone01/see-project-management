<template>
  <section class="project-form-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <div v-if="errors.length" class="validation-summary" role="alert"><a-icon type="exclamation-circle" /><div><strong>请完善以下内容后再提交</strong><ul><li v-for="message in errors" :key="message">{{ message }}</li></ul></div></div>

    <section id="form-basic" class="panel form-section"><div class="detail-section-header"><span class="detail-section-icon"><a-icon type="profile" /></span><div><h2>项目基本信息</h2><p v-if="hasBasicReviewComments">请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见</p><p v-else>{{ draft.code }}</p></div></div>
      <div class="form-fields description-grid">
        <div class="field full" :class="reviewClass('name')"><label><review-comment-label :comment="reviewComment('name')"><em>*</em> 项目名称</review-comment-label></label><a-input id="application-name" v-model="draft.name" placeholder="请填写项目名称" :max-length="200" /></div>
        <template v-for="field in inheritedFields">
          <div :key="field.key" class="field"><span class="basic-field-label">{{ field.label }}</span><span class="basic-field-value" :class="{ 'empty-hint': field.key !== 'funding' && !draft[field.key] }">{{ field.key === 'funding' ? fundingSourceText : (draft[field.key] || '选择招募后自动带入') }}</span></div>
        </template>
        <div class="field" :class="reviewClass('targets')"><label><review-comment-label :comment="reviewComment('targets')"><em>*</em> 项目目标板块（多选）</review-comment-label></label><a-select id="application-targets" v-model="draft.targets" class="target-select" mode="multiple" placeholder="请选择项目目标板块"><a-select-option v-for="target in targetOptions" :key="target">{{ target }}</a-select-option></a-select></div>
        <div class="field" :class="reviewClass('organization')"><label><review-comment-label :comment="reviewComment('organization')"><em>*</em> 执行机构</review-comment-label></label><a-select id="application-organization" v-model="draft.organization" placeholder="请选择执行机构"><a-select-option value="青海省三江源生态环境保护协会">青海省三江源生态环境保护协会</a-select-option><a-select-option value="重庆江北飞地猫盟生态科普保护中心">重庆江北飞地猫盟生态科普保护中心</a-select-option></a-select></div>
        <div class="field" :class="reviewClass('thirdParties')"><label><review-comment-label :comment="reviewComment('thirdParties')">第三方</review-comment-label></label><button id="application-third-parties" type="button" class="third-parties third-parties-trigger" aria-haspopup="dialog" :aria-expanded="thirdVisible" @click="openThirdParties"><span :class="{ 'empty-hint': !draft.thirdParties.length }">{{ draft.thirdParties.length ? draft.thirdParties.join('、') : '请选择参与项目的第三方机构' }}</span><a-icon type="down" /></button></div>
        <div class="field execution-period" :class="reviewClass('executionPeriod')"><label><review-comment-label :comment="reviewComment('executionPeriod')"><em>*</em> 执行周期</review-comment-label></label><div class="date-pair"><input v-model="draft.start" :type="draft.start ? 'date' : 'text'" placeholder="请选择开始日期" @focus="$event.target.type = 'date'" @blur="!draft.start && ($event.target.type = 'text')" class="ant-input" aria-label="执行开始日期" /><span>至</span><input v-model="draft.end" :type="draft.end ? 'date' : 'text'" placeholder="请选择结束日期" @focus="$event.target.type = 'date'" @blur="!draft.end && ($event.target.type = 'text')" class="ant-input" aria-label="执行结束日期" /></div></div>
        <div class="field rural-field" :class="reviewClass('rural')"><label><review-comment-label :comment="reviewComment('rural')"><em>*</em> 是否在国家乡村振兴重点帮扶县开展项目</review-comment-label></label><a-radio-group id="application-rural" v-model="draft.rural" class="binary-choice"><a-radio value="否">否</a-radio><a-radio value="是">是</a-radio></a-radio-group></div>
        <div class="field" :class="reviewClass('aid')"><label><review-comment-label :comment="reviewComment('aid')"><em>*</em> 直接或委托其他组织资助给受益人款物</review-comment-label></label><a-radio-group id="application-aid" v-model="draft.aid" class="binary-choice"><a-radio value="否">否</a-radio><a-radio value="是">是</a-radio></a-radio-group></div>
        <div class="field full" :class="reviewClass('beneficiaries')"><label><review-comment-label :comment="reviewComment('beneficiaries')"><em>*</em> 受益对象</review-comment-label></label><a-textarea id="application-beneficiaries" v-model="draft.beneficiaries" class="resizable-textarea" :rows="1" placeholder="请填写受益对象" /></div>
        <div class="field full" :class="reviewClass('publicBenefit')"><label><review-comment-label :comment="reviewComment('publicBenefit')"><em>*</em> 项目公益性</review-comment-label></label><a-textarea id="application-publicBenefit" v-model="draft.publicBenefit" class="resizable-textarea" :rows="1" placeholder="请说明项目的公益目的、受益范围和成果共享方式" /></div>
        <div class="amount-fields full"><div v-for="field in amountFields" :key="field.key" class="field" :class="reviewClass(field.key)"><label><review-comment-label :comment="reviewComment(field.key)"><em>*</em> {{ field.label }}</review-comment-label></label><div class="amount-input"><a-input-number :id="'application-' + field.key" v-model="draft[field.key]" :placeholder="'请输入' + field.label" :min="0" :max="1000000000" :precision="2" /><span class="amount-unit-outside">元</span></div><small>{{ draft[field.key] === null ? '填写金额后自动显示大写' : '大写：' + uppercaseMoney(draft[field.key]) }}</small></div></div>
        <div class="field" :class="reviewClass('leader')"><label><review-comment-label :comment="reviewComment('leader')"><em>*</em> 负责人</review-comment-label></label><a-input id="application-leader" v-model="draft.leader" placeholder="请填写负责人姓名" /></div><div class="field" :class="reviewClass('phone')"><label><review-comment-label :comment="reviewComment('phone')"><em>*</em> 联系方式</review-comment-label></label><a-input id="application-phone" v-model="draft.phone" placeholder="请填写联系电话" /></div>
      </div>
    </section>

    <section class="panel form-section"><div class="detail-section-header"><span class="detail-section-icon green"><a-icon type="read" /></span><div><h2>附加信息</h2><p v-if="hasAdditionalReviewComments">请检查并修改标红的项目信息，点击信息小标题可查看具体审核意见</p></div></div><div class="rich-fields"><div v-for="field in richFields" :key="field.key" class="field"><label><review-comment-label :comment="reviewComment(field.key)"><em>*</em> {{ field.label }}</review-comment-label></label><rich-editor v-model="draft[field.key]" :label="field.label" :class="{ 'rich-review-has-comment': !!reviewComment(field.key) }" /></div></div></section>

    <section id="form-areas" class="panel form-section area-section"><div class="detail-section-header"><span class="detail-section-icon cyan"><a-icon type="environment" /></span><div><h2>项目实施区域</h2><p v-if="hasAreaReviewComments">请检查并修改标红的项目信息，点击行任意位置可查看具体审核意见</p></div></div>
      <div class="detail-table-wrap area-entry-wrap"><table class="detail-table area-entry-table"><thead><tr><th class="index-col">序号</th><th>省 / 直辖市</th><th>地级市 / 直辖市区</th><th>行政区</th><th class="action-col">操作</th></tr></thead><tbody><tr v-for="(row, index) in draft.areas" :key="row.id" :class="rowReviewClass('areas', row)" :role="rowReviewComment('areas', row) ? 'button' : undefined" :tabindex="rowReviewComment('areas', row) ? 0 : undefined" @click="openRowReview('areas', row)" @keydown.enter.prevent="openRowReview('areas', row)" @keydown.space.prevent="openRowReview('areas', row)"><td><a-popover v-if="rowReviewComment('areas', row)" :visible="rowReviewKey === 'areas.' + row.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowReviewVisibility('areas', row, visible)"><template slot="content"><div class="row-review-content"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ rowReviewComment('areas', row) }}</p></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span class="row-review-anchor">{{ index + 1 }}</span></a-popover><template v-else>{{ index + 1 }}</template></td><td :class="reviewClass('areas.' + row.id + '.province')"><review-comment-label :comment="reviewComment('areas.' + row.id + '.province')">{{ row.province }}</review-comment-label></td><td :class="reviewClass('areas.' + row.id + '.city')"><review-comment-label :comment="reviewComment('areas.' + row.id + '.city')">{{ row.city }}</review-comment-label></td><td :class="reviewClass('areas.' + row.id + '.district')"><review-comment-label :comment="reviewComment('areas.' + row.id + '.district')">{{ row.district }}</review-comment-label></td><td class="area-actions" @click.stop @keydown.stop><a-button type="link" class="danger-link" @click="removeRow('areas', index)">删除</a-button></td></tr><tr class="area-entry-row"><td>{{ draft.areas.length + 1 }}</td><td></td><td></td><td></td><td class="area-actions"><a-button type="link" @click="openAreaPicker">新增</a-button></td></tr></tbody></table></div>
    </section>

    <section v-for="section in tableSections.slice(1, 2)" :key="section.key" :id="'form-' + section.key" class="panel form-section team-section"><div class="detail-section-header"><span class="detail-section-icon" :class="section.tone"><a-icon :type="section.icon" /></span><div><h2>{{ section.title }}</h2><p v-if="hasTeamReviewComments">请检查并修改标红的项目信息，点击信息小标题或行任意位置可查看具体审核意见</p></div></div>
      <div class="detail-table-wrap"><table class="detail-table team-table team-entry-table"><colgroup><col class="team-col-index" /><col class="team-col-name" /><col class="team-col-role" /><col /><col class="team-col-actions" /></colgroup><thead><tr><th>序号</th><th v-for="field in section.fields" :key="field.key">{{ field.label }}</th><th>操作</th></tr></thead><tbody><tr v-for="(row, index) in draft[section.key]" :key="row.id" :class="rowReviewClass(section.key, row)" :role="rowReviewComment(section.key, row) ? 'button' : undefined" :tabindex="rowReviewComment(section.key, row) ? 0 : undefined" @click="openRowReview(section.key, row)" @keydown.enter.prevent="openRowReview(section.key, row)" @keydown.space.prevent="openRowReview(section.key, row)"><td><a-popover v-if="rowReviewComment(section.key, row)" :visible="rowReviewKey === section.key + '.' + row.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowReviewVisibility(section.key, row, visible)"><template slot="content"><div class="row-review-content"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ rowReviewComment(section.key, row) }}</p></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span class="row-review-anchor">{{ index + 1 }}</span></a-popover><template v-else>{{ index + 1 }}</template></td><td v-for="field in section.fields" :key="field.key" :class="reviewClass(section.key + '.' + row.id + '.' + field.key)"><review-comment-label :comment="reviewComment(section.key + '.' + row.id + '.' + field.key)">{{ row[field.key] || '—' }}</review-comment-label></td><td class="team-actions" @click.stop @keydown.stop><a-button type="link" @click="openRow(section.key, index)">编辑</a-button><a-button type="link" class="danger-link" @click="removeRow(section.key, index)">删除</a-button></td></tr><tr class="team-entry-row"><td>{{ draft[section.key].length + 1 }}</td><td v-for="field in section.fields" :key="field.key"></td><td class="team-actions"><a-button type="link" @click="openRow(section.key)">新增</a-button></td></tr></tbody></table></div>
      <div v-if="section.key === 'team'" class="team-experience field"><label><review-comment-label :comment="reviewComment('experience')"><em>*</em> 团队或成员项目管理执行经验</review-comment-label></label><rich-editor v-model="draft.experience" label="团队或成员项目管理执行经验" :class="{ 'rich-review-has-comment': !!reviewComment('experience') }" /></div>
    </section>

    <section id="form-outputs" class="panel form-section"><div class="detail-section-header"><span class="detail-section-icon orange"><a-icon type="project" /></span><div><h2>项目产出 / 活动</h2><p v-if="hasOutputReviewComments">请检查并修改标红的产出或活动内容，点击产出或活动序号彩色胶囊可查看具体审核意见</p></div></div>
      <div class="outputs-body"><a-empty v-if="!draft.outputs.length" class="output-empty-add" description="点击添加产出" role="button" tabindex="0" @click="openOutput()" @keydown.enter.native.prevent="openOutput()" @keydown.space.native.prevent="openOutput()" /><article v-for="(output, index) in draft.outputs" :key="output.id" class="output-block form-output" :class="reviewClass('outputs.' + output.id)"><div class="output-title"><span><review-comment-label :comment="reviewComment('outputs.' + output.id)">产出 {{ index + 1 }}</review-comment-label></span><strong>{{ output.name }}</strong><div class="row-actions"><a-button type="link" @click="openOutput(index)">编辑</a-button><a-button type="link" class="danger-link" @click="removeRow('outputs', index)">删除</a-button></div></div><div class="output-standard"><span>产出衡量标准</span><div><p v-for="(paragraph, paragraphIndex) in output.standard.split('\n')" :key="paragraphIndex">{{ paragraph }}</p></div></div>
        <div v-for="(activity, activityIndex) in output.activities" :key="activity.id" class="activity-card form-activity" :class="reviewClass('activities.' + activity.id)"><div><span><review-comment-label :comment="reviewComment('activities.' + activity.id)">活动 {{ index + 1 }}.{{ activityIndex + 1 }}</review-comment-label></span><strong>{{ activity.name }}</strong><div class="row-actions"><a-button type="link" @click="openActivity(index, activityIndex)">编辑</a-button><a-button type="link" class="danger-link" @click="removeActivity(index, activityIndex)">删除</a-button></div></div><dl><div><dt>活动时间</dt><dd>{{ activity.start }} 至 {{ activity.end }}</dd></div><div><dt>活动地点</dt><dd>{{ activity.location }}</dd></div><div><dt>执行人员</dt><dd>{{ activity.people }}</dd></div></dl><p>{{ activity.content }}</p></div>
        <a-button class="add-activity" type="dashed" icon="plus" @click="openActivity(index)">增加活动</a-button></article><a-button v-if="draft.outputs.length" class="add-output" type="dashed" icon="plus" @click="openOutput()">增加产出</a-button></div>
    </section>

    <section class="panel form-section"><div class="detail-section-header"><span class="detail-section-icon red"><a-icon type="safety-certificate" /></span><div><h2>项目管理计划</h2><p v-if="hasManagementReviewComments">请检查并修改标红的项目信息，点击行任意位置可查看具体审核意见</p></div></div><div v-for="section in tableSections.slice(2)" :key="section.key" class="management-section"><h3 class="table-subtitle">{{ section.title }}</h3><div class="detail-table-wrap management-table-wrap"><table class="detail-table management-entry-table"><colgroup><col class="management-col-index" /><col v-for="field in section.fields" :key="field.key" /><col class="management-col-actions" /></colgroup><thead><tr><th>序号</th><th v-for="field in section.fields" :key="field.key">{{ field.label }}</th><th>操作</th></tr></thead><tbody><tr v-for="(row, index) in draft[section.key]" :key="row.id" :class="rowReviewClass(section.key, row)" :role="rowReviewComment(section.key, row) ? 'button' : undefined" :tabindex="rowReviewComment(section.key, row) ? 0 : undefined" @click="openRowReview(section.key, row)" @keydown.enter.prevent="openRowReview(section.key, row)" @keydown.space.prevent="openRowReview(section.key, row)"><td><a-popover v-if="rowReviewComment(section.key, row)" :visible="rowReviewKey === section.key + '.' + row.id" trigger="click" placement="topLeft" @visibleChange="visible => changeRowReviewVisibility(section.key, row, visible)"><template slot="content"><div class="row-review-content"><div><a-icon type="exclamation-circle" theme="filled" /><p>{{ rowReviewComment(section.key, row) }}</p></div><a-button size="small" type="primary" @click.stop="rowReviewKey = ''">关闭</a-button></div></template><span class="row-review-anchor">{{ index + 1 }}</span></a-popover><template v-else>{{ index + 1 }}</template></td><td v-for="field in section.fields" :key="field.key" :class="reviewClass(section.key + '.' + row.id + '.' + field.key)"><review-comment-label :comment="reviewComment(section.key + '.' + row.id + '.' + field.key)">{{ row[field.key] }}</review-comment-label></td><td class="management-actions" @click.stop @keydown.stop><a-button type="link" @click="openRow(section.key, index)">编辑</a-button><a-button type="link" class="danger-link" @click="removeRow(section.key, index)">删除</a-button></td></tr><tr class="management-entry-row"><td>{{ draft[section.key].length + 1 }}</td><td v-for="field in section.fields" :key="field.key"></td><td class="management-actions"><a-button type="link" @click="openRow(section.key)">新增</a-button></td></tr></tbody></table></div></div></section>

        <section id="form-budget" class="panel form-section budget-section"><div class="detail-section-header"><span class="detail-section-icon gold"><a-icon type="fund" /></span><div><h2>预算表</h2></div></div><project-budget-editor v-model="draft.budget" :project-name="draft.name" /></section>

    <section class="panel form-section attachment-section"><div class="detail-section-header"><span class="detail-section-icon blue"><a-icon type="paper-clip" /></span><div><h2>附件</h2></div></div><a-empty v-if="!draft.attachments.length" class="output-empty-add attachment-empty-add" description="点击添加附件" role="button" tabindex="0" @click="openAttachmentPicker" @keydown.enter.native.prevent="openAttachmentPicker" @keydown.space.native.prevent="openAttachmentPicker" /><template v-else><div class="attachment-list form-attachment-list"><div v-for="file in draft.attachments" :key="file.id"><div><strong>{{ file.name }}</strong><span>{{ file.category }} · {{ formatSize(file.size) }} · {{ file.time }}</span></div><a-button type="link" @click="previewAttachment(file)">预览</a-button><a-button type="link" @click="downloadAttachment(file)">下载</a-button><a-button type="link" class="danger-link" @click="removeAttachment(file)">删除</a-button></div></div><a-button class="add-more-attachment" type="dashed" icon="plus" @click="openAttachmentPicker">添加更多附件</a-button></template></section>

    <footer class="form-footer"><span><a-icon type="info-circle" /> {{ dirty ? '填写内容尚未保存' : draft.savedAt ? '草稿内容已保留' : '请填写项目信息，可随时存为草稿' }}</span><div><a-button @click="goBack">取消</a-button><a-button icon="save" :disabled="uploading > 0" @click="save">存为草稿</a-button><a-button type="primary" :disabled="uploading > 0" @click="submit">提交申请</a-button></div></footer>

    <a-modal v-model="modal.visible" :title="modal.title" :width="modal.kind === 'team' || modal.kind === 'output' || modal.kind === 'activity' ? 550 : 620" :mask-closable="false" :body-style="modal.kind === 'output' ? { overflowY: 'visible' } : { maxHeight: '65vh', overflowY: 'auto' }">
      <div v-if="modal.kind === 'team'" class="area-picker team-picker"><div v-for="field in modal.fields" :key="field.key" class="area-picker-row"><label :for="'dialog-team-' + field.key">{{ field.label }}：</label><a-select v-if="field.options" :id="'dialog-team-' + field.key" v-model="modal.value[field.key]" placeholder="请选择..."><a-select-option v-for="option in field.options" :key="option">{{ option }}</a-select-option></a-select><a-textarea v-else-if="field.type === 'textarea'" :id="'dialog-team-' + field.key" v-model="modal.value[field.key]" :rows="3" :placeholder="'请填写' + field.label" /><a-input v-else :id="'dialog-team-' + field.key" v-model="modal.value[field.key]" :placeholder="'请填写' + field.label" /></div><p v-if="modal.error" class="form-error" role="alert">{{ modal.error }}</p></div>
      <div v-else class="modal-form" :class="{ 'output-modal-form': modal.kind === 'output' }"><div v-for="field in modal.fields" v-if="field.key !== 'end'" :key="field.key" class="modal-field" :class="{ 'activity-divider': field.key === 'name' && modal.kind === 'output' }"><label :for="'dialog-' + field.key">{{ field.key === 'start' ? '开展时间' : field.label }}</label>
        <a-select v-if="field.key === 'people'" :id="'dialog-' + field.key" v-model="modal.value[field.key]" class="people-select" mode="multiple" :disabled="!teamMemberOptions.length" :placeholder="teamMemberOptions.length ? '请选择活动执行人员' : '请先添加执行团队成员'"><a-select-option v-for="name in teamMemberOptions" :key="name" :value="name">{{ name }}</a-select-option></a-select>
        <a-select v-else-if="field.options" :id="'dialog-' + field.key" v-model="modal.value[field.key]" placeholder="请选择"><a-select-option v-for="option in field.options" :key="option">{{ option }}</a-select-option></a-select>
        <div v-else-if="field.key === 'start'" class="activity-period-inputs"><input id="dialog-start" v-model="modal.value.start" type="month" class="ant-input" /><span>至</span><input id="dialog-end" v-model="modal.value.end" type="month" class="ant-input" /></div>
        <a-auto-complete v-else-if="field.key === 'province'" :id="'dialog-' + field.key" v-model="modal.value[field.key]" :data-source="provinces" :filter-option="filterOption" placeholder="请选择或输入省 / 直辖市" @change="resetRegion" />
        <a-input v-else-if="field.key === 'city' || field.key === 'district'" :id="'dialog-' + field.key" v-model="modal.value[field.key]" :disabled="modal.value.province === '全国'" :placeholder="'请填写' + field.label + '（可留空）'" />
        <a-textarea v-else-if="field.type === 'textarea'" :id="'dialog-' + field.key" v-model="modal.value[field.key]" :rows="field.rows || 3" :placeholder="'请填写' + field.label" />
        <a-input v-else :id="'dialog-' + field.key" v-model="modal.value[field.key]" :placeholder="'请填写' + field.label" />
      </div></div><p v-if="modal.error && modal.kind !== 'team'" class="form-error" role="alert">{{ modal.error }}</p><template slot="footer"><a-button @click="modal.visible = false">{{ modal.kind === 'team' ? '关闭' : '取消' }}</a-button><a-button type="primary" @click="confirmModal">{{ modal.kind === 'team' ? (modal.index < 0 ? '添加' : '保存') : '确定' }}</a-button></template>
    </a-modal>

    <a-modal v-model="areaVisible" title="项目实施区域" :width="550" :mask-closable="false" ok-text="确定" cancel-text="关闭" @ok="confirmArea"><div class="area-picker"><div class="area-picker-row"><label>省 / 直辖市：</label><a-select v-model="areaSelection.province" placeholder="请选择..." @change="changeAreaProvince"><a-select-option v-for="option in regionOptions" :key="option.value" :value="option.value">{{ option.label }}</a-select-option></a-select></div><div class="area-picker-row"><label>地级市 / 直辖市区：</label><a-select v-model="areaSelection.city" :disabled="!areaSelection.province" placeholder="请选择..." @change="changeAreaCity"><a-select-option v-for="option in areaCityOptions" :key="option.value" :value="option.value">{{ option.label }}</a-select-option></a-select></div><div class="area-picker-row"><label>县 / 行政区：</label><a-select v-model="areaSelection.district" :disabled="!areaSelection.city" placeholder="请选择..."><a-select-option v-for="option in areaDistrictOptions" :key="option.value" :value="option.value">{{ option.label }}</a-select-option></a-select></div><p v-if="areaError" class="form-error" role="alert">{{ areaError }}</p></div></a-modal>

    <a-modal v-model="thirdVisible" title="编辑第三方名单" :width="600" :mask-closable="false" @ok="confirmThirdParties" ok-text="确定" cancel-text="取消"><p class="section-description">搜索并选择参与项目的第三方机构（本地示例名单）。</p><a-input-search v-model="thirdQuery" placeholder="请输入机构名称" enter-button="搜索" @search="thirdSearch = thirdQuery.trim()" /><div class="third-results"><div v-for="name in thirdResults" :key="name"><span>{{ name }}</span><a-button type="link" :disabled="thirdDraft.includes(name)" @click="thirdDraft.push(name)">{{ thirdDraft.includes(name) ? '已添加' : '添加' }}</a-button></div><a-empty v-if="!thirdResults.length" description="未找到匹配机构" /></div><h4>已选择（{{ thirdDraft.length }}）</h4><div v-for="(name, index) in thirdDraft" :key="name" class="third-selected"><span>{{ name }}</span><a-button type="link" class="danger-link" @click="thirdDraft.splice(index, 1)">移除</a-button></div><p v-if="!thirdDraft.length" class="section-description">无</p></a-modal>
    <a-modal v-model="attachmentVisible" title="添加附件" :width="550" :mask-closable="false" :confirm-loading="uploading > 0" ok-text="上传" cancel-text="取消" @ok="confirmAttachment" @afterClose="resetAttachmentPicker"><div class="area-picker attachment-picker"><div class="area-picker-row"><label for="attachment-category">附件类型：</label><a-select id="attachment-category" v-model="attachmentDraft.category" placeholder="请选择附件类型"><a-select-option v-for="category in attachmentCategories" :key="category" :value="category">{{ category }}</a-select-option></a-select></div><div class="area-picker-row"><label>选择文件：</label><div class="attachment-file-picker"><a-upload :before-upload="selectAttachment" :show-upload-list="false" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"><a-button icon="upload">选择文件</a-button></a-upload><span v-if="attachmentDraft.file">{{ attachmentDraft.file.name }}</span></div></div><p v-if="attachmentDraft.error" class="form-error" role="alert">{{ attachmentDraft.error }}</p></div></a-modal>
    <a-modal v-model="previewVisible" :title="previewName" :width="960" :mask-closable="false" :footer="null" @afterClose="clearPreview"><img v-if="previewType === 'image'" :src="previewUrl" :alt="previewName" class="attachment-preview-image" /><iframe v-else-if="previewType === 'pdf'" :src="previewUrl" :title="previewName" class="attachment-preview-pdf"></iframe><p v-else>此格式请下载后使用对应办公软件查看。</p></a-modal>
  </section>
</template>

<script>
import ReviewCommentLabel from '../components/ReviewCommentLabel.vue'
import ProjectBudgetEditor from '../components/ProjectBudgetEditor.vue'
import { createDraft, loadDraft, saveDraft, clone, money, uppercaseMoney, budgetTotal, roundMoney, draftFile } from '../mock/project-drafts'

// 只保留编辑器提供的基础排版，粘贴内容不携带外部 HTML、脚本或样式。
function cleanRichText (html) {
  const source = document.createElement('div'); source.innerHTML = html
  const allowed = ['P', 'DIV', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'TABLE', 'TBODY', 'TR', 'TD', 'TH', 'IMG']
  Array.from(source.querySelectorAll('*')).reverse().forEach(element => {
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(element.tagName)) element.remove()
    else if (!allowed.includes(element.tagName)) element.replaceWith(...element.childNodes)
    else if (element.tagName === 'IMG') {
      if (!/^data:image\/(png|jpeg|gif|webp);base64,/i.test(element.getAttribute('src') || '')) element.remove()
      else Array.from(element.attributes).forEach(attribute => { if (!['src', 'alt'].includes(attribute.name)) element.removeAttribute(attribute.name) })
    } else Array.from(element.attributes).forEach(attribute => element.removeAttribute(attribute.name))
  })
  return source.innerHTML
}
const RichEditor = {
  props: ['value', 'label'],
  mounted () { this.$refs.editor.innerHTML = cleanRichText(this.value || '') },
  watch: { value (value) { if (this.$refs.editor.innerHTML !== value) this.$refs.editor.innerHTML = cleanRichText(value || '') } },
  methods: {
    update () { const editor = this.$refs.editor; this.$emit('input', editor.textContent.trim() || editor.querySelector('table,img') ? cleanRichText(editor.innerHTML) : '') },
    command (command) { this.$refs.editor.focus(); document.execCommand(command, false, null); this.update() },
    paste (event) {
      event.preventDefault()
      const clipboard = event.clipboardData
      if (!clipboard) return
      const images = Array.from(clipboard.items || []).filter(item => item.kind === 'file' && /^image\//i.test(item.type)).map(item => item.getAsFile()).filter(Boolean)
      if (images.length) { this.insertImages(images); return }
      document.execCommand('insertText', false, clipboard.getData('text/plain')); this.update()
    },
    chooseImage () { this.$refs.imageInput.click() },
    insertImage (event) {
      const file = event.target.files[0]; event.target.value = ''
      if (file) this.insertImages([file])
    },
    async insertImages (files) {
      const editor = this.$refs.editor
      const selection = window.getSelection()
      const range = selection.rangeCount && editor.contains(selection.getRangeAt(0).commonAncestorContainer) ? selection.getRangeAt(0).cloneRange() : null
      const fragments = []
      for (const file of files) {
        if (!/^image\/(png|jpeg|gif|webp)$/i.test(file.type) || file.size > 1024 * 1024) { this.$message.error('请选择 1 MB 以内的 PNG、JPG、GIF 或 WebP 图片'); continue }
        try {
          const data = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.onabort = reject
            reader.readAsDataURL(file)
          })
          fragments.push(`<img src="${data}" alt="${(file.name || '粘贴图片').replace(/["<>]/g, '')}"><p><br></p>`)
        } catch (error) { this.$message.error('图片读取失败，请重试') }
      }
      if (!fragments.length || this.$refs.editor !== editor) return
      editor.focus()
      if (range && editor.contains(range.commonAncestorContainer)) { selection.removeAllRanges(); selection.addRange(range) }
      document.execCommand('insertHTML', false, fragments.join('')); this.update()
    }
  },
  render (h) {
    const actions = [['bold', 'B', '加粗'], ['italic', 'I', '斜体'], ['underline', 'U', '下划线'], ['insertUnorderedList', '• 列表', '无序列表'], ['insertOrderedList', '1. 列表', '有序列表'], ['removeFormat', '清除格式', '清除格式']]
    const toolbar = actions.map(([command, text, label]) => h('button', { attrs: { type: 'button', title: label, 'aria-label': this.label + '：' + label }, on: { mousedown: event => event.preventDefault(), click: () => this.command(command) } }, text))
    toolbar.push(h('button', { attrs: { type: 'button', title: '插入图片', 'aria-label': this.label + '：插入图片' }, on: { mousedown: event => event.preventDefault(), click: this.chooseImage } }, '图片'))
    return h('div', { class: 'rich-editor' }, [h('div', { class: 'rich-toolbar' }, toolbar), h('input', { ref: 'imageInput', class: 'rich-image-input', attrs: { type: 'file', accept: 'image/png,image/jpeg,image/gif,image/webp', 'aria-label': this.label + '：选择图片' }, on: { change: this.insertImage } }), h('div', { ref: 'editor', class: 'rich-editable', attrs: { contenteditable: 'true', role: 'textbox', 'aria-label': this.label, 'aria-multiline': 'true' }, on: { input: this.update, paste: this.paste, drop: event => event.preventDefault() } })])
  }
}
const textField = (key, label, type = 'textarea', extra = {}) => ({ key, label, type, ...extra })
const activityFields = [textField('name', '产出活动', 'textarea', { rows: 2 }), textField('start', '开始月份', 'month'), textField('end', '结束月份', 'month'), textField('location', '活动地点', 'input'), textField('people', '活动执行人员', 'input'), textField('content', '活动具体内容', 'textarea', { rows: 3 })]
const tableSections = [
  { key: 'areas', title: '项目实施区域', icon: 'environment', tone: 'cyan', description: '可按全国、省市或具体行政区填写', fields: [textField('province', '省 / 直辖市', 'input'), textField('city', '地级市 / 直辖市区', 'input', { optional: true }), textField('district', '行政区', 'input', { optional: true })] },
  { key: 'team', title: '执行团队', icon: 'team', tone: 'violet', description: '填写团队成员、职位与工作内容', fields: [textField('name', '姓名', 'input'), textField('position', '职位', 'select', { options: ['正式员工', '兼职', '专家', '志愿者', '实习生'] }), textField('responsibilities', '工作内容')] },
  { key: 'stakeholders', title: '项目相关方', description: '分析与项目有利益关系的组织或群体，明确其利益、影响及管理方式。', fields: [textField('party', '利益相关方', 'input'), textField('interest', '利益内容'), textField('impact', '产生影响', 'select', { options: ['积极', '消极'] }), textField('management', '管理内容')] },
  { key: 'risks', title: '项目风险', description: '列明项目实施过程中可能出现的困难或风险，并制定应对措施。', fields: [textField('likelihood', '风险发生可能性', 'select', { options: ['低', '中', '高'] }), textField('description', '风险内容'), textField('response', '应对措施'), textField('affectedActivities', '风险影响的目标或活动')] },
  { key: 'monitoring', title: '监测评估计划', description: '帮助团队管理项目目标和指标、了解项目成果；请说明由谁实施、评估频率，以及如何反馈、汇总和分享。', fields: [textField('purpose', '监测评估目的'), textField('method', '如何监测评估')] }
]
export default {
  name: 'ProjectForm', components: { ProjectBudgetEditor, RichEditor, ReviewCommentLabel },
  data () { return {
    draft: createDraft(Number(this.$route.params.id)), savedSnapshot: '', errors: [], uploading: 0,
    tableSections, inheritedFields: [{ key: 'type', label: '项目类型' }, { key: 'strategy', label: '项目策略' }, { key: 'issue', label: '项目议题' }, { key: 'funding', label: '资金来源' }],
    richFields: [{ key: 'overview', label: '项目概述' }, { key: 'background', label: '项目背景' }, { key: 'goal', label: '项目总目标' }],
    amountFields: [{ key: 'total', label: '预算总金额' }, { key: 'requested', label: '申请 SEE 资金' }, { key: 'matching', label: '配套金额' }],
    // 原型展示物种、荒漠；详情页展示保护地、水，完整字典待后端提供。
    targetOptions: ['物种', '荒漠', '保护地', '水'],
    provinces: ['全国', '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区', '台湾省'],
    regionOptions: [
      { value: '青海省', label: '青海省', children: [{ value: '玉树藏族自治州', label: '玉树藏族自治州', children: [{ value: '治多县扎河乡', label: '治多县扎河乡' }, { value: '囊谦县', label: '囊谦县' }] }] },
      { value: '四川省', label: '四川省', children: [{ value: '成都市', label: '成都市', children: [{ value: '锦江区', label: '锦江区' }, { value: '青羊区', label: '青羊区' }] }] },
      { value: '云南省', label: '云南省', children: [{ value: '昆明市', label: '昆明市', children: [{ value: '五华区', label: '五华区' }, { value: '盘龙区', label: '盘龙区' }] }] }
    ],
    attachmentCategories: ['预算表', '其他附件'], attachmentVisible: false, attachmentDraft: { category: undefined, file: null, error: '' }, modal: { visible: false, kind: '', title: '', fields: [], value: {}, index: -1, parent: -1, error: '' },
    areaVisible: false, areaSelection: { province: undefined, city: undefined, district: undefined }, areaError: '', rowReviewKey: '', thirdVisible: false, thirdQuery: '', thirdSearch: '', thirdDraft: [], thirdOptions: ['武汉观鸟会', '青海省三江源生态环境保护协会', '社区生态保护合作组织'],
    previewVisible: false, previewName: '', previewUrl: '', previewType: ''
  } },
  computed: {
    dirty () { return JSON.stringify(this.draft) !== this.savedSnapshot },
    fundingSourceText () { const fundraising = String(this.draft.fundraising || '').trim(); return fundraising ? `资助+筹款（${fundraising}）` : '资助' },
    hasBasicReviewComments () { return ['name', 'targets', 'organization', 'thirdParties', 'executionPeriod', 'rural', 'aid', 'beneficiaries', 'publicBenefit', 'total', 'requested', 'matching', 'leader', 'phone'].some(key => !!this.reviewComment(key)) },
    hasAdditionalReviewComments () { return this.richFields.some(field => !!this.reviewComment(field.key)) },
    hasAreaReviewComments () { return this.hasReviewCommentsFor('areas') },
    hasTeamReviewComments () { return !!this.reviewComment('experience') || this.hasReviewCommentsFor('team') },
    hasManagementReviewComments () { return tableSections.slice(2).some(section => this.hasReviewCommentsFor(section.key)) },
    hasOutputReviewComments () { return this.hasReviewCommentsFor('outputs') || this.hasReviewCommentsFor('activities') },

    budgetDifference () { return roundMoney(budgetTotal(this.draft.budget) - Number(this.draft.total || 0)) },
    thirdResults () { return this.thirdOptions.filter(name => name.includes(this.thirdSearch)) },
    areaCityOptions () { const province = this.regionOptions.find(option => option.value === this.areaSelection.province); return province ? province.children || [] : [] },
    areaDistrictOptions () { const city = this.areaCityOptions.find(option => option.value === this.areaSelection.city); return city ? city.children || [] : [] },
    teamMemberOptions () { return [...new Set(this.draft.team.map(member => String(member.name || '').trim()).filter(Boolean))] }
  },
  created () {
    try { this.draft = loadDraft(Number(this.$route.params.id)) } catch (error) { this.$message.warning('无法读取本地草稿，已打开空白填写页。原保存内容尚未覆盖。') }
    for (const key of ['overview', 'background', 'goal', 'experience']) this.draft[key] = cleanRichText(this.draft[key])
    this.savedSnapshot = JSON.stringify(this.draft)
  },
  activated () { window.addEventListener('beforeunload', this.beforeUnload) },
  deactivated () { window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeDestroy () { this.clearPreview(); window.removeEventListener('beforeunload', this.beforeUnload) },
  beforeRouteLeave (to, from, next) {
    if (this.uploading) { this.$message.info('附件正在保存，请稍候。'); next(false); return }
    if (!this.dirty) { next(); return }
    this.$confirm({ title: '填写内容尚未保存', content: '是否保存为本地草稿后离开？', maskClosable: false, okText: '保存并离开', cancelText: '继续填写', onOk: () => { if (this.save()) next(); else next(false) }, onCancel: () => next(false) })
  },
  methods: {
    reviewComment (key) { const comments = this.draft.reviewComments; const value = comments && Object.prototype.hasOwnProperty.call(comments, key) ? comments[key] : ''; return typeof value === 'string' ? value.trim() : '' },
    hasReviewCommentsFor (prefix) { const comments = this.draft.reviewComments || {}; return Object.keys(comments).some(key => (key === prefix || key.indexOf(prefix + '.') === 0) && !!this.reviewComment(key)) },
    reviewClass (key) { return { 'review-has-comment': !!this.reviewComment(key) } },
    rowReviewComment (sectionKey, row) { if (!row || !row.id) return ''; const key = sectionKey + '.' + row.id; const direct = this.reviewComment(key); if (direct) return direct; const comments = this.draft.reviewComments || {}; return Object.keys(comments).filter(commentKey => commentKey.indexOf(key + '.') === 0).map(commentKey => this.reviewComment(commentKey)).filter(Boolean).join('；') },
    rowReviewClass (sectionKey, row) { return { 'review-row-has-comment': !!this.rowReviewComment(sectionKey, row) } },
    openRowReview (sectionKey, row) { if (!this.rowReviewComment(sectionKey, row)) return; this.rowReviewKey = sectionKey + '.' + row.id },
    changeRowReviewVisibility (sectionKey, row, visible) { this.rowReviewKey = visible ? sectionKey + '.' + row.id : '' },
    money, uppercaseMoney,
    uid () { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9) },
    beforeUnload (event) { if (this.dirty || this.uploading) { event.preventDefault(); event.returnValue = '' } },
    goBack () { this.$router.push({ name: 'dashboard' }) },
    filterOption (input, option) { return option.componentOptions.children[0].text.includes(input) },
    resetRegion () { this.modal.value.city = ''; this.modal.value.district = '' },
    openRow (key, index = -1) {
      const section = tableSections.find(item => item.key === key)
      const value = index < 0 ? Object.fromEntries(section.fields.map(field => [field.key, undefined])) : clone(this.draft[key][index])
      this.modal = { visible: true, kind: key, title: (index < 0 ? '增加' : '编辑') + (key === 'team' ? '执行团队成员' : section.title), fields: section.fields, value, index, parent: -1, error: '' }
    },
    openAreaPicker () { this.areaSelection = { province: undefined, city: undefined, district: undefined }; this.areaError = ''; this.areaVisible = true },
    changeAreaProvince () { this.areaSelection.city = undefined; this.areaSelection.district = undefined; this.areaError = '' },
    changeAreaCity () { this.areaSelection.district = undefined; this.areaError = '' },
    confirmArea () {
      const { province, city, district } = this.areaSelection
      if (!province || !city || !district) { this.areaError = '请完成省、市、区三级选择'; return }
      if (this.draft.areas.some(row => row.province === province && row.city === city && row.district === district)) { this.areaError = '该实施区域已添加'; return }
      this.draft.areas.push({ id: this.uid(), province, city, district })
      this.areaVisible = false
    },
    openOutput (index = -1) {
      const fields = [textField('outputName', '产出', 'textarea', { rows: 2 }), textField('standard', '产出衡量标准', 'textarea', { rows: 2 })]
      const value = index < 0 ? {} : { outputName: this.draft.outputs[index].name, standard: this.draft.outputs[index].standard }
      if (index < 0) fields.push(...activityFields)
      fields.forEach(field => { if (!(field.key in value)) value[field.key] = field.key === 'people' ? [] : '' })
      this.modal = { visible: true, kind: 'output', title: index < 0 ? '增加产出' : '编辑产出', fields, value, index, parent: -1, error: '' }
    },
    openActivity (parent, index = -1) {
      const value = index < 0 ? Object.fromEntries(activityFields.map(field => [field.key, field.key === 'people' ? [] : ''])) : clone(this.draft.outputs[parent].activities[index])
      value.people = String(value.people || '').split(/[、,，]/).map(name => name.trim()).filter(name => this.teamMemberOptions.includes(name))
      this.modal = { visible: true, kind: 'activity', title: index < 0 ? '增加活动' : '编辑活动', fields: activityFields, value, index, parent, error: '' }
    },
    confirmModal () {
      const { value, fields, kind, index, parent } = this.modal
      const missing = fields.filter(field => !field.optional && !String(value[field.key] || '').trim())
      if (missing.length) { this.modal.error = '请填写：' + missing.map(field => field.label).join('、'); return }
      if (value.start && (value.start > value.end || value.start < this.draft.start.slice(0, 7) || value.end > this.draft.end.slice(0, 7))) { this.modal.error = '活动结束月份不得早于开始月份，且活动时间应在项目执行周期内。'; return }
      if (kind === 'areas' && value.district && !value.city && !['北京市', '上海市', '天津市', '重庆市'].includes(value.province)) { this.modal.error = '填写行政区前请先填写地级市。'; return }
      if (kind === 'areas' && this.draft.areas.some((row, i) => i !== index && ['province', 'city', 'district'].every(key => (row[key] || '').trim() === (value[key] || '').trim()))) { this.modal.error = '该实施区域已添加。'; return }
      if (kind === 'output') {
        if (index < 0) this.draft.outputs.push({ id: this.uid(), name: value.outputName.trim(), standard: value.standard.trim(), activities: [{ ...clone(value), people: value.people.join('、'), id: this.uid() }] })
        else { this.draft.outputs[index].name = value.outputName.trim(); this.draft.outputs[index].standard = value.standard.trim() }
      } else {
        const list = kind === 'activity' ? this.draft.outputs[parent].activities : this.draft[kind]
        const row = clone(value); row.id = row.id || this.uid()
        if (kind === 'activity') row.people = row.people.join('、')
        Object.keys(row).forEach(key => { if (typeof row[key] === 'string') row[key] = row[key].trim() })
        if (index < 0) list.push(row); else this.$set(list, index, row)
        if (kind === 'team' && index < 0) {
          this.modal.value = Object.fromEntries(fields.map(field => [field.key, '']))
          this.modal.error = ''
          this.$message.success('团队成员已添加，可继续添加')
          return
        }
      }
      this.modal.visible = false
    },
    removeRow (key, index) { this.$confirm({ title: key === 'outputs' ? '删除该产出及其全部活动？' : '删除这条记录？', content: '删除后请存为草稿以保留更改。', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { this.draft[key].splice(index, 1) } }) },
    removeActivity (parent, index) { this.$confirm({ title: '删除该活动？', maskClosable: false, okText: '删除', okType: 'danger', cancelText: '取消', onOk: () => { this.draft.outputs[parent].activities.splice(index, 1) } }) },
    openThirdParties () { this.thirdDraft = [...this.draft.thirdParties]; this.thirdQuery = ''; this.thirdSearch = ''; this.thirdVisible = true },
    confirmThirdParties () { this.draft.thirdParties = [...this.thirdDraft]; this.thirdVisible = false },
    save () {
      if (this.uploading) { this.$message.info('请等待附件保存完成'); return false }
      try { this.draft.savedAt = saveDraft(this.draft); this.savedSnapshot = JSON.stringify(this.draft); this.$message.success('草稿已保存到当前浏览器'); return true } catch (error) { this.$message.error('保存失败：浏览器存储不可用或空间不足，请保留当前页面后重试。'); return false }
    },
    submit () {
      const errors = []
      const required = { name: '项目名称', organization: '执行机构', start: '执行开始日期', end: '执行结束日期', rural: '是否在重点帮扶县开展项目', aid: '是否资助给受益人款物', beneficiaries: '受益对象', publicBenefit: '项目公益性', leader: '负责人', phone: '联系方式' }
      Object.entries(required).forEach(([key, label]) => { if (!String(this.draft[key] || '').trim()) errors.push('请填写' + label) })
      if (!this.draft.targets.length) errors.push('请选择项目目标板块')
      if (this.draft.phone && !/^[+\d\s()-]{6,25}$/.test(this.draft.phone)) errors.push('请填写有效的联系电话')
      if (this.draft.start && this.draft.end && this.draft.start > this.draft.end) errors.push('执行结束日期不得早于开始日期')
      for (const key of ['overview', 'background', 'goal', 'experience']) { const element = document.createElement('div'); element.innerHTML = cleanRichText(this.draft[key]); if (!element.textContent.trim()) errors.push('请填写' + ({ overview: '项目概述', background: '项目背景', goal: '项目总目标', experience: '团队或成员项目管理执行经验' }[key])) }
      if (this.amountFields.some(field => this.draft[field.key] === null || this.draft[field.key] === '' || !Number.isFinite(Number(this.draft[field.key])) || Number(this.draft[field.key]) < 0 || Number(this.draft[field.key]) > 1000000000) || Number(this.draft.total) <= 0) errors.push('请完整填写金额，预算总金额须大于 0，三个金额均不得超过 10 亿元')
      if (roundMoney(Number(this.draft.requested) + Number(this.draft.matching)) !== roundMoney(this.draft.total)) errors.push('申请 SEE 资金与配套金额之和应等于预算总金额')
      if (this.budgetDifference) errors.push('在线预算合计与预算总金额不一致')
      if (!this.draft.areas.length) errors.push('请至少添加一个项目实施区域')
      if (!this.draft.team.length) errors.push('请至少添加一名执行团队成员')
      if (!this.draft.outputs.length || this.draft.outputs.some(output => !output.activities.length)) errors.push('请至少添加一个产出，并为每个产出添加活动')
      if (this.draft.outputs.some(output => output.activities.some(activity => activity.start > activity.end || activity.start < (this.draft.start || '').slice(0, 7) || activity.end > (this.draft.end || '').slice(0, 7)))) errors.push('请将所有活动时间调整到项目执行周期内')
      this.errors = errors
      if (errors.length) { this.$nextTick(() => this.$el.querySelector('.validation-summary').scrollIntoView({ behavior: 'smooth', block: 'center' })); return }
      this.$confirm({ title: '确认提交申请', content: '本次为前端演示，将保存本地草稿并展示提交结果，不会发送申请或改变真实项目状态。', maskClosable: false, okText: '确认提交', cancelText: '继续编辑', onOk: () => { if (this.save()) this.$success({ title: '申请校验通过', content: '演示提交已完成，资料已存为本地草稿，尚未发送到服务器。', maskClosable: false, okText: '返回填写页' }) } })
    },
    openAttachmentPicker () { this.resetAttachmentPicker(); this.attachmentVisible = true },
    resetAttachmentPicker () { this.attachmentDraft = { category: undefined, file: null, error: '' } },
    selectAttachment (file) {
      if (!/\.(pdf|docx?|xlsx?|png|jpe?g)$/i.test(file.name) || file.size > 20 * 1024 * 1024) { this.attachmentDraft.error = '请选择 20 MB 以内的 PDF、Word、Excel 或图片文件'; this.attachmentDraft.file = null; return false }
      this.attachmentDraft.file = file
      this.attachmentDraft.error = ''
      return false
    },
    confirmAttachment () {
      const { category, file } = this.attachmentDraft
      if (!category || !file) { this.attachmentDraft.error = !category ? '请选择附件类型' : '请选择需要上传的文件'; return }
      this.uploading++
      const id = this.uid()
      draftFile('put', id, file).then(() => { this.draft.attachments.push({ id, name: file.name, size: file.size, type: file.type, category, time: new Date().toLocaleString('zh-CN', { hour12: false }) }); this.attachmentVisible = false; this.$message.success('附件已加入，请存为草稿以保存附件列表') }).catch(() => { this.attachmentDraft.error = '附件保存失败，请检查浏览器存储后重试' }).finally(() => { this.uploading-- })
    },
    formatSize (size) { return size >= 1024 * 1024 ? (size / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(size / 1024)) + ' KB' },
    async getAttachment (file) { try { const blob = await draftFile('get', file.id); if (!blob) throw new Error('missing'); return blob } catch (error) { this.$message.error('本地附件已不可用，请重新上传'); return null } },
    async previewAttachment (file) { const blob = await this.getAttachment(file); if (!blob) return; this.clearPreview(); this.previewName = file.name; this.previewType = /\.(png|jpe?g)$/i.test(file.name) ? 'image' : /\.pdf$/i.test(file.name) ? 'pdf' : 'office'; this.previewUrl = URL.createObjectURL(blob); this.previewVisible = true },
    async downloadAttachment (file) { const blob = await this.getAttachment(file); if (!blob) return; const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) },
    clearPreview () { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); this.previewUrl = '' },
    removeAttachment (file) { const index = this.draft.attachments.findIndex(item => item.id === file.id); this.removeRow('attachments', index) }
  }
}
</script>

<style scoped>
.project-form-page { display: grid; gap: 20px; min-width: 0; color: #18253c; padding-bottom: 18px; }.form-top { display: flex; justify-content: space-between; align-items: center; gap: 20px; }.form-top > span { color: #718095; font-size: 12px; }.form-top b { font-weight: 400; color: #d48806; }.form-intro { padding: 24px; }.form-intro > div { display: flex; align-items: center; gap: 16px; }.intro-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 14px; background: #eaf3ff; color: #1677ff; font-size: 24px; }.form-intro h1 { display: flex; gap: 16px; align-items: center; margin: 0 0 8px; font-size: 20px; font-weight: 700; }.form-intro p { margin: 0; }.form-intro > div p { color: #b081d0; }.intro-note { margin-top: 20px !important; color: #536277; }.demo-note { color: #8491a3; font-size: 12px; margin-top: 8px !important; }.form-section { overflow: hidden; }.form-section .detail-section-header > .ant-btn { height: 32px; border-radius: 6px; }.form-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 32px; padding: 26px 24px; }.field { min-width: 0; display: flex; flex-direction: column; gap: 9px; }.field label { font-weight: 500; line-height: 1.6; }.full { grid-column: 1 / -1; }em { color: #ff4d4f; font-style: normal; margin-right: 3px; }.field > .ant-select,.field > .ant-input-number { width: 100%; }.third-parties { display: flex; align-items: flex-start; gap: 12px; min-height: 32px; }.third-parties span { flex: 1; overflow-wrap: anywhere; padding-top: 5px; }.third-parties .ant-btn { padding-right: 0; }.date-pair { display: flex; gap: 12px; align-items: center; }.date-pair .ant-input { min-width: 0; width: 50%; }.date-pair > span:not(.ant-calendar-picker) { color: #718095; }.amount-fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 20px; background: #f8fbff; border-radius: 10px; }.amount-input { position: relative; display: flex; align-items: center; border: 1px solid transparent; border-radius: 4px; }.amount-input:hover { border-color: #d9e1eb; }.amount-input:focus-within { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }.amount-input .ant-input-number { width: 100%; }.amount-unit { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #536277; font-size: 16px; line-height: 1; pointer-events: none; }.amount-unit i { visibility: hidden; font-style: normal; }.field small { color: #718095; font-size: 14px; line-height: 1.6; }.rich-fields { padding: 24px; display: grid; gap: 28px; }.field >>> .rich-editor { border: 1px solid #d9e1eb; border-radius: 6px; overflow: hidden; }.field >>> .rich-toolbar { display: flex; gap: 8px; align-items: center; padding: 8px 12px; background: #fafbfd; border-bottom: 1px solid #e6ebf2; }.field >>> .rich-toolbar button { border: none; border-radius: 4px; padding: 3px 9px; background: transparent; color: #536277; cursor: pointer; }.field >>> .rich-toolbar button:hover { color: #1677ff; background: #eaf3ff; }.field >>> .rich-toolbar button:first-child { font-weight: 800; }.field >>> .rich-toolbar button:nth-child(2) { font-style: italic; }.field >>> .rich-toolbar button:nth-child(3) { text-decoration: underline; }.field >>> .rich-editable { min-height: 138px; padding: 16px; line-height: 1.8; outline: none; overflow-wrap: anywhere; }.field >>> .rich-editable:focus { box-shadow: inset 0 0 0 1px #1677ff; }.field >>> .rich-editable p:last-child { margin-bottom: 0; }
.danger-link { color: #ff4d4f; }.team-experience { padding: 24px; }.outputs-body { padding: 24px; display: grid; gap: 24px; }.form-output + .form-output { padding-top: 24px; border-top: 1px solid #edf1f5; }.output-heading,.activity-heading { display: flex; gap: 12px; align-items: flex-start; }.output-heading h3 { flex: 1; min-width: 0; font-size: 16px; line-height: 1.65; margin: 0; overflow-wrap: anywhere; font-weight: 600; }.output-number { flex-shrink: 0; background: #fff3e3; color: #c97916; padding: 3px 10px; border-radius: 5px; }.row-actions { display: flex; flex-shrink: 0; }.row-actions .ant-btn { padding: 0 8px; }.output-measure { display: flex; gap: 16px; margin: 18px 0; }.output-measure > span { color: #ba791b; flex-shrink: 0; }.output-measure p { margin: 0; white-space: pre-line; line-height: 1.8; }.form-activity { padding: 18px 20px; margin-bottom: 12px; background: #f8fbff; border: 1px solid #e9eff7; border-radius: 10px; }.activity-heading > span { color: #1677ff; flex-shrink: 0; padding-top: 4px; }.activity-heading strong { flex: 1; min-width: 0; padding-top: 4px; overflow-wrap: anywhere; }.form-activity dl { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 14px 0; }.form-activity dt { color: #8491a3; font-size: 12px; margin-bottom: 5px; }.form-activity dd { margin: 0; overflow-wrap: anywhere; }.form-activity p { line-height: 1.8; margin: 0; white-space: pre-line; }.add-activity { width: 100%; color: #1677ff; }.management-section { padding: 24px; }.management-section + .management-section { border-top: 1px solid #edf1f5; }.subheading { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 12px; }.subheading h3 { font-size: 14px; font-weight: 600; margin: 0; }.section-description { color: #718095; line-height: 1.8; }.management-table-wrap { margin: 18px 0 0; }.management-entry-table { table-layout: fixed; }.management-entry-table .management-col-index { width: 70px; }.management-entry-table .management-col-actions { width: 130px; }.management-entry-table th:first-child, .management-entry-table td:first-child, .management-entry-table th:last-child, .management-entry-table td:last-child { text-align: center; }.management-entry-table td { white-space: pre-line; overflow-wrap: anywhere; }.management-entry-table .management-entry-row td { vertical-align: middle; background: #fff; }.management-entry-table th:last-child, .management-entry-table .management-actions { padding-right: 12px; padding-left: 12px; }.management-entry-table .management-actions { white-space: nowrap; }.management-entry-table .management-actions .ant-btn { height: auto; padding: 0 7px; }.budget-warning { padding: 14px 24px; margin: 0; color: #d48806; background: #fffbe6; }.attachment-section .detail-section-header { align-items: center; }.attachment-section .detail-section-header > div { display: flex; min-height: 40px; align-items: center; }.attachment-section .detail-section-header h2 { margin: 0; }.attachment-empty-add { margin: 22px; }.form-attachment-list > div { grid-template-columns: minmax(0, 1fr) auto auto auto; }.form-attachment-list strong { overflow-wrap: anywhere; }.form-attachment-list .ant-btn { padding: 0 6px; }.attachment-picker .area-picker-row { grid-template-columns: 90px minmax(0, 1fr); }.attachment-file-picker { min-width: 0; display: flex; align-items: center; gap: 12px; }.attachment-file-picker > span { min-width: 0; color: #536277; overflow-wrap: anywhere; }.attachment-picker > .form-error { margin-left: 108px; }.form-footer { position: sticky; bottom: 0; z-index: 5; border: 1px solid #e6ebf2; border-radius: 12px; background: rgba(255,255,255,.98); box-shadow: 0 -4px 22px rgba(23,56,92,.07); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }.form-footer > span { color: #718095; }.form-footer > div { display: flex; gap: 12px; }.form-footer .ant-btn { min-width: 100px; }.validation-summary { background: #fff6f5; color: #cf1322; border: 1px solid #ffd3d0; border-radius: 12px; padding: 20px 24px; display: flex; gap: 12px; }.validation-summary .anticon { margin-top: 4px; }.validation-summary ul { padding-left: 18px; margin: 8px 0 0; line-height: 1.8; }.modal-form { display: grid; gap: 20px; padding: 4px 4px 12px; }.modal-field { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 16px; align-items: start; }.modal-field label { text-align: right; padding-top: 6px; line-height: 1.6; }.modal-field > .ant-calendar-picker,.modal-field > .ant-select { width: 100%; }.form-error { color: #ff4d4f; margin: 10px 0 0; }.third-results { margin: 20px 0; border-bottom: 1px solid #edf1f5; }.third-results > div,.third-selected { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; }.third-results span,.third-selected span { overflow-wrap: anywhere; }.attachment-preview-image { max-width: 100%; display: block; margin: auto; }.attachment-preview-pdf { width: 100%; height: 65vh; border: 0; }
.management-section { display: contents; }
.management-section + .management-section { border-top: 0; }
.management-section + .management-section .table-subtitle { margin-top: 48px; }
.management-table-wrap { margin: 22px; }
@media(max-width: 1440px) { .form-fields { gap: 22px 24px; }.modal-field { grid-template-columns: 120px minmax(0, 1fr); } }
/* 基本信息沿用详情页的双列列表，长内容独占一行。 */
.form-fields.description-grid { padding: 4px 22px 22px; gap: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.form-fields > .field, .form-fields .amount-fields > .field { min-height: 76px; padding: 17px 18px; display: grid; align-content: center; gap: 7px; border-bottom: 1px solid #edf1f5; }
.form-fields .field > label, .basic-field-label { color: #7b899b; font-weight: 400; }
.basic-field-value { color: #27384e; font-weight: 500; line-height: 1.6; }
.form-fields .amount-fields { display: contents; }
.form-fields .amount-fields > .field:first-child { grid-column: 1 / -1; }
.form-fields .amount-fields small { grid-column: 1 / -1; font-size: 14px; }
.form-fields .amount-input { position: static; max-width: none; gap: 8px; border: 0; box-shadow: none; }
.form-fields .amount-input:hover, .form-fields .amount-input:focus-within { border: 0; box-shadow: none; }
.form-fields .amount-input .ant-input-number { flex: none; width: 190px; }
.form-fields .amount-input .ant-input-number:hover { border-color: #d9e1eb; }
.form-fields .amount-input .ant-input-number-focused { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.amount-unit-outside { flex: none; color: #536277; font-size: 16px; }
.form-fields .third-parties { align-items: center; }
.form-fields .third-parties span { padding-top: 0; }
.form-fields .third-parties-trigger { width: 100%; min-height: 40px; padding: 7px 12px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: #27384e; font-family: inherit; font-size: 16px; line-height: 24px; text-align: left; cursor: pointer; }
.form-fields .third-parties-trigger:hover { border-color: #d9e1eb; }
.form-fields .third-parties-trigger:focus-visible { outline: none; border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.third-parties-trigger > .anticon { flex-shrink: 0; color: #bfbfbf; font-size: 12px; }
.form-fields >>> .binary-choice { line-height: 32px; }
.binary-choice >>> .ant-radio-wrapper,
.binary-choice >>> .ant-radio-wrapper > span:last-child { font-size: 18px; }
.binary-choice >>> .ant-radio-wrapper + .ant-radio-wrapper { margin-left: 32px; }
.form-fields .execution-period .date-pair { width: 100%; }
.form-fields .rural-field { grid-column: 1; }
.form-fields .field > .ant-input, .form-fields .date-pair .ant-input, .form-fields .amount-input .ant-input-number { border-color: transparent; background: transparent; box-shadow: none; }
.form-fields .field > .ant-input:hover, .form-fields .date-pair .ant-input:hover { border-color: #d9e1eb; }
.form-fields .field > .ant-input:focus, .form-fields .date-pair .ant-input:focus { border-color: #1677ff; box-shadow: 0 0 0 2px rgba(22,119,255,.12); }
.form-fields >>> .ant-select-selection { border-color: transparent; background: transparent; }
.form-fields >>> .ant-select-selection:hover { border-color: #d9e1eb; }
.form-fields >>> .ant-select-focused .ant-select-selection { border-color: #1677ff; }
.form-fields .field > .ant-input { padding-left: 12px; padding-right: 12px; }
.form-fields >>> .ant-select-selection__rendered { margin-left: 12px; margin-right: 12px; }
.empty-hint { color: #bfbfbf; font-weight: 400; }
.field >>> .rich-editable:empty::before { content: '请填写' attr(aria-label); color: #bfbfbf; pointer-events: none; }
/* 本页与填写弹窗统一输入字号、内边距和单行垂直对齐。 */
.project-form-page >>> input.ant-input,
.modal-form >>> input.ant-input,
.ant-input-search >>> input.ant-input { height: 40px; padding: 0 12px; font-size: 16px; line-height: normal; }
.project-form-page >>> textarea.ant-input,
.modal-form >>> textarea.ant-input { padding: 10px 12px; font-size: 16px; line-height: 1.6; }
.project-form-page >>> .ant-input-number { height: 40px; font-size: 16px; }
.project-form-page >>> .ant-input-number-input { height: 38px; padding: 0 12px; font-size: 16px; line-height: 38px; }
.project-form-page >>> .ant-select,
.modal-form >>> .ant-select { font-size: 16px; }
.project-form-page >>> .ant-select-selection--single,
.modal-form >>> .ant-select-selection--single { height: 40px; }
.project-form-page >>> .ant-select-selection__rendered,
.modal-form >>> .ant-select-selection__rendered { margin-left: 12px; margin-right: 12px; line-height: 38px; }
.project-form-page >>> .ant-select-selection--multiple { min-height: 40px; padding-bottom: 0; }
.project-form-page >>> .ant-select-selection--multiple .ant-select-selection__rendered { min-height: 38px; }
.project-form-page >>> .ant-select-selection--multiple .ant-select-selection__choice { height: 28px; margin-top: 5px; line-height: 26px; }
.project-form-page >>> .ant-select-selection--multiple .ant-select-search--inline { height: 38px; margin-top: 0; }
.project-form-page >>> .ant-select-search__field { font-size: 16px; }
.field >>> .rich-editable { padding: 12px; font-size: 16px; line-height: 1.6; }
.field >>> .rich-image-input { display: none; }
.field >>> .rich-editable table { width: 100%; margin: 10px 0; border-collapse: collapse; table-layout: fixed; }
.field >>> .rich-editable td, .field >>> .rich-editable th { min-width: 80px; height: 36px; padding: 6px 8px; border: 1px solid #d9e1eb; vertical-align: top; }
.field >>> .rich-editable img { display: block; width: auto; max-width: 400px; height: auto; max-height: 400px; margin: 10px 0; border-radius: 6px; object-fit: contain; }
.modal-form >>> .ant-select-auto-complete .ant-input { height: 40px; padding: 0 12px; font-size: 16px; }
.modal-form >>> .ant-select-auto-complete .ant-select-selection__rendered { margin: 0; }
.ant-input-search >>> .ant-input-search-button { height: 40px; }
.form-fields >>> textarea.resizable-textarea { height: 40px; min-height: 40px; padding: 7px 12px; line-height: 24px; resize: vertical; overflow: auto; }
/* 可填写区域的空值提示使用统一的提醒蓝色。 */
.project-form-page >>> input::placeholder,
.project-form-page >>> textarea::placeholder,
.modal-form >>> input::placeholder,
.modal-form >>> textarea::placeholder,
.ant-input-search >>> input::placeholder { color: #5b8ff9; opacity: 1; }
.project-form-page >>> .ant-select-selection__placeholder,
.modal-form >>> .ant-select-selection__placeholder,
.empty-hint,
.field >>> .rich-editable:empty::before { color: #5b8ff9; }

/* 基本信息填写态与查看态对齐：无水平缩进，已填文字使用同一颜色和字重。 */
.form-fields >>> input.ant-input {
  padding-left: 12px;
  padding-right: 12px;
  color: #27384e;
  font-weight: 500;
  line-height: 38px;
}
.form-fields >>> textarea.ant-input {
  padding-left: 12px;
  padding-right: 12px;
  color: #27384e;
  font-weight: 500;
}
.form-fields >>> .ant-input-number-input {
  padding-left: 12px;
  padding-right: 12px;
  color: #27384e;
  font-weight: 500;
}
.form-fields >>> .ant-select-selection__rendered {
  margin-left: 12px;
  margin-right: 12px;
}
.form-fields >>> .ant-select-selection-selected-value,
.form-fields >>> .ant-select-selection__choice__content {
  color: #27384e;
  font-weight: 500;
}
.form-fields .third-parties-trigger {
  padding-left: 12px;
  padding-right: 12px;
  font-weight: 500;
}
.form-fields >>> .target-select .ant-select-selection__choice {
  height: 38px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 38px;
}
.form-fields >>> .target-select .ant-select-selection__choice__content {
  max-width: none;
  overflow: visible;
}
.form-fields >>> .target-select .ant-select-selection__choice__content::after { content: '、'; }
.form-fields >>> .target-select .ant-select-selection__choice:nth-last-child(2) .ant-select-selection__choice__content::after { content: ''; }
.form-fields >>> .target-select .ant-select-selection__choice__remove { display: none; }
.revision-review-field { background: #fff1f0; }
.revision-review-trigger { width: max-content; max-width: 100%; padding: 0; border: 0; background: transparent; color: #7b899b; font: inherit; text-align: left; cursor: pointer; }
.revision-review-trigger:hover { color: #cf1322; }
.revision-review-trigger:focus-visible { outline: 2px solid #ff7875; outline-offset: 2px; }
.revision-review-content { width: 300px; max-width: 60vw; }
.revision-review-message { display: flex; align-items: flex-start; gap: 10px; }
.revision-review-message > .anticon { flex: none; margin-top: 3px; color: #faad14; }
.revision-review-content p { margin: 0 0 14px; color: #536277; line-height: 1.6; overflow-wrap: anywhere; }
.revision-review-content .ant-btn { display: block; margin-left: auto; }
.modal-form >>> .people-select .ant-select-selection__choice { height: 38px; margin: 0; padding: 0; border: 0; background: transparent; line-height: 38px; }
.modal-form >>> .people-select .ant-select-selection__choice__content { max-width: none; overflow: visible; color: #27384e; font-weight: 500; }
.modal-form >>> .people-select .ant-select-selection__choice__content::after { content: '、'; }
.modal-form >>> .people-select .ant-select-selection__choice:nth-last-child(2) .ant-select-selection__choice__content::after { content: ''; }
.modal-form >>> .people-select .ant-select-selection__choice__remove { display: none; }
.budget-section .detail-section-header { align-items: center; }
.budget-section .detail-section-header > div { display: flex; align-items: center; min-height: 40px; }
.budget-section .detail-section-header h2 { margin: 0; }
.area-section .detail-section-header { align-items: center; }
.area-section .detail-section-header > div { display: block; min-height: 0; }
.area-section .detail-section-header h2 { margin: 0 0 4px; }
.area-entry-wrap { margin: 22px; }
.area-entry-table { table-layout: fixed; }
.area-entry-table .index-col { width: 70px; }
.area-entry-table .action-col { width: 110px; }
.area-entry-table th:first-child, .area-entry-table td:first-child, .area-entry-table th:last-child, .area-entry-table td:last-child { text-align: center; }
.area-entry-table .area-entry-row td { vertical-align: middle; background: #fff; }
.area-entry-table .action-col, .area-entry-table .area-actions { padding-right: 12px; padding-left: 12px; }
.area-entry-table .area-actions { white-space: nowrap; }
.area-entry-table .area-actions .ant-btn { height: auto; padding: 0 7px; }
.detail-table tr.review-row-has-comment { cursor: pointer; }
.detail-table tr.review-row-has-comment > td { background: #fff1f0; }
.detail-table tr.review-row-has-comment:hover > td { background: #ffe7e5; }
.detail-table tr.review-row-has-comment:focus-visible { outline: 2px solid #ff7875; outline-offset: -2px; }
.row-review-anchor { display: block; width: 100%; }
.row-review-content { width: 300px; max-width: 60vw; }
.row-review-content > div { display: flex; align-items: flex-start; gap: 10px; }
.row-review-content .anticon { flex: none; margin-top: 3px; color: #faad14; }
.row-review-content p { flex: 1; min-width: 0; margin: 0 0 14px; line-height: 1.6; overflow-wrap: anywhere; white-space: pre-wrap; }
.row-review-content .ant-btn { display: block; margin-left: auto; }
.area-picker { display: grid; width: 470px; max-width: 100%; gap: 16px; margin: 0 auto; padding: 16px 0 12px; }
.area-picker-row { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 18px; align-items: center; }
.area-picker-row label { display: flex; min-height: 32px; align-items: center; justify-content: flex-end; color: #27384e; text-align: right; white-space: nowrap; }
.area-picker-row .ant-select { width: 100%; }
.area-picker > .form-error { margin: -4px 0 0 158px; }
.team-section .detail-section-header > div { display: block; min-height: 0; }
.team-section .detail-section-header h2 { margin: 0 0 4px; }
.team-entry-table .team-col-index { width: 70px; }
.team-entry-table .team-col-actions { width: 110px; }
.team-entry-table th:first-child, .team-entry-table td:first-child, .team-entry-table th:last-child, .team-entry-table td:last-child { text-align: center; }
.team-entry-table td { white-space: pre-line; }
.team-entry-table .team-entry-row td { vertical-align: middle; background: #fff; }
.team-entry-table th:last-child, .team-entry-table .team-actions { padding-right: 12px; padding-left: 12px; }
.team-entry-table .team-actions { white-space: nowrap; }
.team-entry-table .team-actions .ant-btn { height: auto; padding: 0 7px; }
.team-picker .area-picker-row { grid-template-columns: 90px minmax(0, 1fr); align-items: start; }
.team-picker .area-picker-row label { padding-top: 5px; line-height: 22px; }
.team-picker .ant-input { width: 100%; }
.team-picker > .form-error { margin-left: 108px; }
.output-empty-add { margin: 22px; padding: 24px 0; cursor: pointer; border-radius: 8px; }
.output-empty-add:focus-visible { outline: 2px solid #1677ff; outline-offset: 4px; }
.modal-field { grid-template-columns: 110px minmax(0, 1fr); }
.output-modal-form { gap: 14px; }
.modal-field.activity-divider { margin-top: 2px; padding-top: 16px; border-top: 1px dashed #d9e1eb; }
.activity-period-inputs { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 10px; }
.activity-period-inputs .ant-input { min-width: 0; }
.activity-period-inputs span { color: #718095; }
.outputs-body { padding: 0; display: block; }
.form-output + .form-output { padding-top: 0; border-top: 0; }
.form-output .row-actions { display: flex; flex: none; margin-left: auto; }
.form-output .row-actions .ant-btn { height: auto; padding: 0 7px; }
.form-output .row-actions .ant-btn + .ant-btn { margin-left: 0; }
.form-output > .output-title .row-actions .danger-link { color: #ff4d4f !important; }
.form-output > .output-title .row-actions .danger-link > span { color: #ff4d4f !important; }
.form-output .activity-card > p { white-space: pre-line; }
.form-output .add-activity { width: calc(100% - 32px); margin: 0 16px 16px; color: #1677ff; }
.form-output .form-activity { background: #fff; }
.form-output .form-activity .row-actions .ant-btn:first-child { padding: 4px 9px; border-radius: 6px; color: #168b5a; background: #e8f8f0; }
.form-output .form-activity .row-actions { gap: 8px; }
.form-output .form-activity .row-actions .danger-link { border-radius: 6px; color: #ff4d4f !important; background: #e8f8f0; font-weight: 400 !important; }
.form-output .form-activity .row-actions .danger-link:hover, .form-output .form-activity .row-actions .danger-link:focus { color: #ff4d4f !important; background: #fff; }
.form-output .add-activity { border-color: #b7ebd0; border-style: dashed; color: #168b5a !important; background: #e8f8f0; }
.form-output .add-activity:hover, .form-output .add-activity:focus { border-color: #18a66a; color: #168b5a !important; background: #fff; }
.add-output { width: calc(100% - 44px); margin: 0 22px 22px; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }
.add-output:hover, .add-output:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }
.add-more-attachment { width: calc(100% - 44px); margin: 0 22px 22px; border-color: #91d5ff; border-style: dashed; color: #096dd9 !important; background: #e6f7ff; }
.add-more-attachment:hover, .add-more-attachment:focus { border-color: #40a9ff; color: #096dd9 !important; background: #fff; }
.form-output .row-actions { gap: 8px; }
.form-output .row-actions .ant-btn { padding: 4px 9px; border-radius: 6px; font-weight: 400 !important; }
.form-output > .output-title .row-actions .ant-btn { background: #e6f7ff; }
.form-output > .output-title .row-actions .ant-btn:first-child { color: #096dd9; }
.form-output > .output-title .row-actions .danger-link { color: #ff4d4f !important; }
.form-output >>> .row-actions .ant-btn > span { padding: 0; border-radius: 0; color: inherit !important; background: transparent; font-weight: 400 !important; }
.field >>> .rich-editor.rich-review-has-comment .rich-editable { background: #fff1f0; }
</style>
