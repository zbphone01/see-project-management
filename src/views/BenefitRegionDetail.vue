<template>
  <section class="region-detail-page shared-list-detail">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="panel applied-table-panel">
      <div class="region-detail-title shared-list-title"><h2>{{ regionName }}地区数据</h2></div>
      <a-table class="applied-table region-detail-table shared-list-table shared-list-fixed shared-list-inset-8 shared-list-wrap shared-list-first-inset" :columns="columns" :data-source="records" row-key="id" :pagination="pagination" :scroll="{ x: true }" @change="changePage">
        <template slot="yearTitle"><span>年份<br />（项目结束）</span></template>
        <template slot="projectName" slot-scope="value, record">
          <div class="region-project-info">
            <a class="region-project-link" href="#" @click.prevent="showComingSoon">{{ value }}</a>
            <div class="region-project-meta"><span class="project-code"><a-icon type="flag" /> {{ record.id }}</span></div>
          </div>
        </template>
        <template slot="money" slot-scope="value">{{ formatMoney(value) }}</template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { getBenefitRegionDetails } from '../mock/benefit-region-details'
import { getBenefitRegion } from '../mock/benefit-regions'
export default {
  name: 'BenefitRegionDetail',
  data () {
    return {
      page: 1, pageSize: 50,
      columns: [
        { dataIndex: 'year', width: 150, align: 'center', slots: { title: 'yearTitle' } },
        { title: '项目名称', dataIndex: 'name', scopedSlots: { customRender: 'projectName' } },
        { title: '资助金额', dataIndex: 'grantAmount', width: 200, align: 'right', scopedSlots: { customRender: 'money' } },
        { title: '筹款金额', dataIndex: 'fundraisingAmount', width: 200, align: 'right', scopedSlots: { customRender: 'money' } },
        { title: '执行团队人次', dataIndex: 'teamVisits', width: 150, align: 'center' },
        { title: '产出数量', dataIndex: 'outputs', width: 150, align: 'center' }
      ]
    }
  },
  computed: {
    regionCode () { return this.$route.query.regionCode },
    regionName () { const region = getBenefitRegion(this.regionCode); return region ? region.name : '' },
    result () { return getBenefitRegionDetails({ regionCode: this.regionCode, page: this.page, pageSize: this.pageSize }) },
    records () { return this.result.records },
    pagination () { return { current: this.page, pageSize: this.pageSize, total: this.result.total, pageSizeOptions: ['50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } }
  },
  watch: {
    regionCode () { this.page = 1 }
  },
  methods: {
    goBack () { this.$router.push({ name: 'benefit-regions' }) },
    changePage (pagination) { this.page = pagination.pageSize === this.pageSize ? pagination.current : 1; this.pageSize = pagination.pageSize },
    formatMoney (value) { return value === null ? '-' : Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    showComingSoon () { this.$message.info('待后续开发') }
  }
}
</script>

<style scoped>

.region-project-info { min-width: 0; }
.region-project-meta { display: flex; min-width: 0; margin-top: 10px; gap: 8px; }
.region-project-meta .project-code { white-space: normal; overflow-wrap: anywhere; overflow: visible; }
.region-project-link { display: block; min-width: 0; color: inherit; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.region-project-link:hover, .region-project-link:focus { color: inherit; text-decoration: underline; }
</style>
