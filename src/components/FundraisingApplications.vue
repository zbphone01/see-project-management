<template>
  <div class="fundraising-applications">
    <form class="filter-grid application-filters" @submit.prevent="queryApplications">
      <label for="fundraising-organization"><span>机构名称</span><a-input id="fundraising-organization" v-model="filters.organization" placeholder="请输入机构名称" allow-clear /></label>
      <label for="fundraising-recruitment"><span>招募名称</span><a-input id="fundraising-recruitment" v-model="filters.recruitment" placeholder="请输入招募名称" allow-clear /></label>
      <div class="filter-actions application-filter-actions">
        <a-button icon="reload" @click="resetFilters">重置</a-button>
        <a-button type="primary" html-type="submit" icon="search">查询</a-button>
      </div>
    </form>
    <a-table class="applied-table fundraising-table" :columns="columns" :data-source="filteredApplications" :pagination="pagination" :scroll="{ x: true }" row-key="id" :locale="{ emptyText: '暂无符合条件的募捐申请书' }" @change="changePage">
      <template slot="name" slot-scope="text"><span class="application-name">{{ text }}</span></template>
      <template slot="organization" slot-scope="text"><button class="application-organization-link" type="button" @click="$message.info('链接机构详情页')">{{ text }}</button></template>
      <template slot="code" slot-scope="text">{{ text || '—' }}</template>
      <template slot="count" slot-scope="count">{{ count === null ? '—' : count }}</template>
      <template slot="status" slot-scope="status"><span :class="['status-chip', states[status].tone]">{{ status }}</span></template>
      <template slot="operation" slot-scope="text, record">
        <a-dropdown v-if="states[record.status].actions.length > 1" :trigger="['hover']" placement="bottomRight">
          <a-button class="operation-button" :aria-label="`${record.organization} ${record.version} ${record.status}的操作`">操作<a-icon type="down" /></a-button>
          <a-menu slot="overlay" @click="handleAction($event.key, record)"><a-menu-item v-for="action in states[record.status].actions" :key="action">{{ action }}</a-menu-item></a-menu>
        </a-dropdown>
        <button v-else type="button" class="application-row-action" :class="{ 'application-view-action': states[record.status].actions[0] === '查看' }" @click="handleAction(states[record.status].actions[0], record)">{{ states[record.status].actions[0] }}</button>
      </template>
    </a-table>
  </div>
</template>

<script>
import { applicationStates, createFundraisingApplications, filterFundraisingApplications } from '../mock/fundraising-applications'
export default {
  name: 'FundraisingApplications',
  data () {
    return {
      filters: { organization: '', recruitment: '' }, appliedFilters: { organization: '', recruitment: '' },
      applications: createFundraisingApplications(), states: applicationStates, page: 1, pageSize: 10,
      columns: [
        { title: '招募名称', dataIndex: 'recruitment', key: 'recruitment', scopedSlots: { customRender: 'name' } },
        { title: '机构名称', dataIndex: 'organization', key: 'organization', scopedSlots: { customRender: 'organization' } },
        { title: '募捐申请书版本', dataIndex: 'version', key: 'version', width: 160, align: 'center' },
        { title: '框架协议编号', dataIndex: 'agreementCode', key: 'agreementCode', width: 150, align: 'center', scopedSlots: { customRender: 'code' } },
        { title: '项目数量', dataIndex: 'projectCount', key: 'projectCount', width: 100, align: 'center', scopedSlots: { customRender: 'count' } },
        { title: '申请状态', dataIndex: 'status', key: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'operation', fixed: 'right', width: 120, align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    filteredApplications () { return filterFundraisingApplications(this.applications, this.appliedFilters) },
    pagination () { return { current: this.page, pageSize: this.pageSize, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'], showTotal: total => `共 ${total} 条数据` } }
  },
  methods: {
    queryApplications () { this.appliedFilters = Object.assign({}, this.filters); this.page = 1 },
    resetFilters () { this.filters = { organization: '', recruitment: '' }; this.queryApplications() },
    changePage (pagination) { this.page = pagination.pageSize === this.pageSize ? pagination.current : 1; this.pageSize = pagination.pageSize },
    handleAction (action, record) {
      if (action === '查看' || action === '审核') {
        this.$router.push({ name: 'fundraising-application-detail', params: { id: 'example' }, query: { from: 'fundraising', mode: action === '审核' ? 'audit' : 'view' } }); return
      }
      if (action === '手动生效') {
        this.$confirm({ title: '手动生效', content: '确认将该申请书设为生效中？仅更新本地演示，刷新后恢复。', maskClosable: false, okText: '确定', cancelText: '取消', onOk: () => { record.status = '生效中'; this.$message.success('本地演示状态已更新') } })
        return
      }
      this.$message.info(action === '下载pdf' ? '申请书文件尚未接入，暂无法下载' : `${action}页面尚未实现`)
    }
  }
}
</script>

<style scoped>
.application-filters { padding: 20px; grid-template-columns: repeat(2, minmax(200px, 300px)) 188px; border-bottom: 1px solid #edf1f5; }
.application-filter-actions { gap: 12px; }.application-filter-actions .ant-btn { width: 88px; }
.application-filter-actions >>> .anticon + span { margin-left: 8px; }
.fundraising-table >>> .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; }
.fundraising-table >>> .ant-table-thead > tr > th,
.fundraising-table >>> .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; }
.fundraising-table >>> .ant-table-thead > tr > th:first-child,
.fundraising-table >>> .ant-table-tbody > tr > td:first-child { padding-left: 20px; }
.application-name { min-width: 0; display: block; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.application-organization-link { padding: 0; border: 0; color: #1677ff; background: transparent; text-align: left; cursor: pointer; min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.application-organization-link:hover, .application-organization-link:focus { color: #0958d9; }
.operation-button { gap: 2px; }.operation-button >>> span + .anticon { margin-left: 0; }
.application-view-action, .application-view-action:hover, .application-view-action:focus { color: #70b603; }
.application-row-action { min-height: 24px; padding: 0 2px; border: 0; border-radius: 5px; color: #1677ff; background: transparent; cursor: pointer; }
.application-row-action:hover, .application-row-action:focus { color: #0958d9; background: #f0f7ff; }
.application-row-action.application-view-action { color: #70b603; }
.application-row-action.application-view-action:hover, .application-row-action.application-view-action:focus { color: #70b603; background: #f8ffed; }
.application-details { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 16px; }
.application-details dt { color: #718095; }.application-details dd { margin: 0; overflow-wrap: anywhere; }
.application-note { margin: 20px 0 0; color: #718095; }
</style>
