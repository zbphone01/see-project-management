<template>
  <section class="region-page">
    <section class="panel applied-table-panel">
      <div class="region-notes">
        <p>项目总数：代表涉及该地区的项目总数，如果带有括号，其中数字表示只在该地区执行的项目数。</p>
        <p>资助金额：如果带有 * 号，表示于该地区执行的项目涉及多个地区，但项目的主要执行为该地区，相关金额全部计入了该地区。金额单位：元。</p>
      </div>
      <a-table class="applied-table region-table" :columns="columns" :data-source="records" row-key="id" :pagination="pagination" :scroll="{ x: true }" :custom-row="regionRow" @change="changeTable">
        <template slot="projects" slot-scope="value, record">{{ formatNumber(value) }}<span v-if="record.exclusiveProjects !== null">（{{ formatNumber(record.exclusiveProjects) }}）</span></template>
        <template slot="grant" slot-scope="value, record"><span v-if="record.hasCrossRegionGrant" class="region-asterisk">* </span>{{ formatMoney(value) }}</template>
        <template slot="money" slot-scope="value">{{ formatMoney(value) }}</template>
        <template slot="number" slot-scope="value">{{ formatNumber(value) }}</template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { createBenefitRegions } from '../mock/benefit-regions'
export default {
  name: 'BenefitRegions',
  data () { return { records: createBenefitRegions(), page: 1, pageSize: 50, sortField: 'grantAmount', sortOrder: 'descend' } },
  computed: {
    columns () {
      const sortable = field => ({ sorter: (a, b) => a[field] - b[field], sortOrder: this.sortField === field ? this.sortOrder : false })
      return [
        { title: '省份/直辖市', dataIndex: 'name' },
        Object.assign({ title: '项目总数', dataIndex: 'projects', width: 200, align: 'center', scopedSlots: { customRender: 'projects' } }, sortable('projects')),
        Object.assign({ title: '资助金额', dataIndex: 'grantAmount', width: 200, align: 'right', scopedSlots: { customRender: 'grant' } }, sortable('grantAmount')),
        Object.assign({ title: '筹款金额', dataIndex: 'fundraisingAmount', width: 200, align: 'right', scopedSlots: { customRender: 'money' } }, sortable('fundraisingAmount')),
        { title: '执行团队人次', dataIndex: 'teamVisits', width: 200, align: 'center', scopedSlots: { customRender: 'number' } },
        { title: '产出数量', dataIndex: 'outputs', width: 200, align: 'center', scopedSlots: { customRender: 'number' } }
      ]
    },
    pagination () { return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } }
  },
  methods: {
    changeTable (pagination, filters, sorter) {
      const field = sorter.order ? sorter.field : 'grantAmount'
      const order = sorter.order || 'descend'
      this.page = field !== this.sortField || order !== this.sortOrder || pagination.pageSize !== this.pageSize ? 1 : pagination.current
      this.pageSize = pagination.pageSize
      this.sortField = field
      this.sortOrder = order
    },
    regionRow (record) {
      return { attrs: { tabindex: 0, 'aria-label': record.name + '，查看详情' }, on: {
        click: this.showDetails,
        keydown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.showDetails() } }
      } }
    },
    showDetails () { this.$message.info('待后续开发') },
    formatNumber (value) { return Number(value).toLocaleString('zh-CN') },
    formatMoney (value) { return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  }
}
</script>

<style scoped>
.region-page { min-width: 0; }
.region-notes { padding: 20px; color: #718095; line-height: 1.6; }
.region-notes p { margin: 0; }.region-notes p + p { margin-top: 8px; }
.region-table >>> .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.region-table >>> .ant-table-thead > tr > th, .region-table >>> .ant-table-tbody > tr > td { padding-left: 12px; padding-right: 12px; white-space: normal; overflow-wrap: anywhere; }
.region-table >>> .ant-table-thead > tr > th:first-child, .region-table >>> .ant-table-tbody > tr > td:first-child { padding-left: 20px; }
.region-table >>> .ant-table-tbody > tr { cursor: pointer; }
.region-table >>> .ant-table-tbody > tr:focus { outline: 2px solid #1677ff; outline-offset: -2px; }
.region-asterisk { color: #f59a23; }
</style>
