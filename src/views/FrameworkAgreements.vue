<template>
  <section class="applied-page framework-agreements-page">
    <section class="panel applied-table-panel">
      <a-tabs v-model="activeTab" class="agreement-tabs">
        <a-tab-pane key="agreements" tab="框架协议">
          <form class="filter-grid agreement-filters" @submit.prevent="queryAgreements">
            <label for="agreement-organization"><span>机构名称</span><a-input id="agreement-organization" v-model="filters.organization" placeholder="请输入机构名称" allow-clear /></label>
            <label for="agreement-code"><span>协议编号</span><a-input id="agreement-code" v-model="filters.code" placeholder="请输入协议编号" allow-clear /></label>
            <div class="filter-actions agreement-query"><a-button type="primary" html-type="submit" icon="search">查询</a-button></div>
          </form>
          <a-table class="applied-table agreement-table" :columns="columns" :data-source="filteredAgreements" :pagination="pagination" :scroll="{ x: true }" row-key="id" :locale="{ emptyText: '暂无符合条件的框架协议' }" @change="changePage">
            <template slot="organization" slot-scope="text"><button class="agreement-link" type="button" @click="$message.info('链接机构详情页')">{{ text }}</button></template>
            <template slot="recruitment" slot-scope="text"><span class="agreement-name">{{ text }}</span></template>
            <template slot="status" slot-scope="status"><span :class="['status-chip', status === '正常' ? 'active-approved' : 'neutral']">{{ status }}</span></template>
            <template slot="operation" slot-scope="text, record">
              <a-dropdown v-if="record.status === '正常'" :trigger="['hover']" placement="bottomRight">
                <a-button class="operation-button" :aria-label="`${record.code}的操作`">操作<a-icon type="down" /></a-button>
                <a-menu slot="overlay" @click="handleAction($event.key, record)">
                  <a-menu-item key="end">结束框架协议</a-menu-item>
                  <a-menu-item key="pdf">下载机构pdf</a-menu-item>
                  <a-menu-item key="word">下载机构word</a-menu-item>
                  <a-menu-item key="view">查看募捐申请书</a-menu-item>
                </a-menu>
              </a-dropdown>
              <button v-else class="agreement-link" type="button" @click="changeStatus(record, '正常')">恢复框架协议</button>
            </template>
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="fundraising" tab="募捐申请书"><FundraisingApplications /></a-tab-pane>
      </a-tabs>
    </section>
    <a-modal :visible="!!selectedAgreement" title="查看框架协议" :width="550" :mask-closable="false" :footer="null" @cancel="selectedAgreement = null">
      <dl v-if="selectedAgreement" class="agreement-details">
        <dt>框架协议编号</dt><dd>{{ selectedAgreement.code }}</dd>
        <dt>机构名称</dt><dd>{{ selectedAgreement.organization }}</dd>
        <dt>招募名称</dt><dd>{{ selectedAgreement.recruitment }}</dd>
        <dt>状态</dt><dd>{{ selectedAgreement.status }}</dd>
      </dl>
      <p class="agreement-note">当前为原型演示数据，协议正文及文件尚未接入。</p>
    </a-modal>
  </section>
</template>

<script>
import { createFrameworkAgreements, filterFrameworkAgreements } from '../mock/framework-agreements'
import FundraisingApplications from '../components/FundraisingApplications.vue'
export default {
  name: 'FrameworkAgreements',
  components: { FundraisingApplications },
  data () {
    return {
      activeTab: this.$route.query.tab === 'fundraising' ? 'fundraising' : 'agreements', filters: { organization: '', code: '' }, appliedFilters: { organization: '', code: '' },
      agreements: createFrameworkAgreements(), page: 1, pageSize: 10, selectedAgreement: null,
      columns: [
        { title: '框架协议编号', dataIndex: 'code', key: 'code', width: 150, align: 'center' },
        { title: '机构名称', dataIndex: 'organization', key: 'organization', scopedSlots: { customRender: 'organization' } },
        { title: '招募名称', dataIndex: 'recruitment', key: 'recruitment', scopedSlots: { customRender: 'recruitment' } },
        { title: '状态', dataIndex: 'status', key: 'status', width: 150, align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'operation', fixed: 'right', width: 120, align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    filteredAgreements () { return filterFrameworkAgreements(this.agreements, this.appliedFilters) },
    pagination () { return { current: this.page, pageSize: this.pageSize, showSizeChanger: true, pageSizeOptions: ['10', '50', '100'], showTotal: total => `共 ${total} 条数据` } }
  },
  methods: {
    queryAgreements () { this.appliedFilters = Object.assign({}, this.filters); this.page = 1 },
    changePage (pagination) { this.page = pagination.pageSize === this.pageSize ? pagination.current : 1; this.pageSize = pagination.pageSize },
    showRecord (record) { this.selectedAgreement = record },
    handleAction (action, record) {
      if (action === 'view') this.$router.push({ name: 'fundraising-application-detail', params: { id: 'example' }, query: { from: 'agreements' } })
      else if (action === 'end') this.changeStatus(record, '结束')
      else this.$message.info('尚未接入机构文件，暂无法下载')
    },
    changeStatus (record, status) {
      this.$confirm({
        title: `${status === '正常' ? '恢复' : '结束'}框架协议`,
        content: `确认${status === '正常' ? '恢复' : '结束'} ${record.code}？当前操作仅影响本地演示，刷新后恢复。`,
        maskClosable: false, okText: '确定', cancelText: '取消',
        onOk: () => { record.status = status; this.$message.success('本地演示状态已更新') }
      })
    }
  }
}
</script>

<style scoped>
.agreement-tabs >>> .ant-tabs-bar { min-height: 76px; margin: 0; padding: 0 20px; border-bottom-color: #edf1f5; }
.agreement-tabs >>> .ant-tabs-nav .ant-tabs-tab { height: 76px; margin-right: 28px; padding: 0; display: inline-flex; align-items: center; box-sizing: border-box; }
.agreement-tabs >>> .ant-tabs-tab-active { color: #1677ff; font-weight: 600; }
.agreement-filters { padding: 20px; grid-template-columns: repeat(2, minmax(200px, 300px)) 88px; border-bottom: 1px solid #edf1f5; }
.agreement-query { grid-template-columns: 1fr; }
.agreement-query .ant-btn { width: 88px; }
.agreement-query .ant-btn >>> .anticon + span { margin-left: 8px; }
.agreement-table >>> .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; }
.agreement-table >>> .ant-table-thead > tr > th,
.agreement-table >>> .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; }
.agreement-link { padding: 0; border: 0; color: #1677ff; background: transparent; text-align: left; cursor: pointer; }
.agreement-link:hover, .agreement-link:focus { color: #0958d9; }
.agreement-name, .agreement-link { min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.operation-button { gap: 2px; }
.operation-button >>> span + .anticon { margin-left: 0; }
.agreement-details { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 16px; }
.agreement-details dt { color: #718095; }.agreement-details dd { margin: 0; overflow-wrap: anywhere; }
.agreement-note { margin: 20px 0 0; color: #718095; }
</style>
