<template>
  <section class="document-detail-page">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="panel applied-table-panel">
      <div class="document-title"><h2>文件材料详情</h2></div>
      <form class="filter-grid document-filters" @submit.prevent="applyFilters">
        <a-select v-model="filters.year" aria-label="年份"><a-select-option value="all">全部年份</a-select-option><a-select-option v-for="year in years" :key="year" :value="year">{{ year }}年</a-select-option></a-select>
        <a-select v-model="filters.department" aria-label="部门"><a-select-option value="all">全部部门</a-select-option><a-select-option v-for="department in departments" :key="department" :value="department">{{ department }}</a-select-option></a-select>
        <div class="filter-actions"><a-button type="primary" html-type="submit" icon="filter">筛选</a-button></div>
      </form>
      <a-table class="applied-table document-table" :columns="columns" :data-source="filteredRecords" row-key="id" :pagination="pagination" :scroll="{ x: true }" :locale="{ emptyText: '暂无符合条件的文件材料数据' }" @change="changePage">
        <template slot="file" slot-scope="value"><span v-if="!value">—</span><a v-else class="document-file-link" href="#" @click.prevent="showComingSoon">{{ value }}</a></template>
        <template slot="projectName" slot-scope="value"><a class="document-file-link" href="#" @click.prevent="showComingSoon">{{ value }}</a></template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { benefitDepartments } from '../mock/benefit-summary'
import { createBenefitDocumentDetails } from '../mock/benefit-document-details'
export default {
  name: 'BenefitDocumentDetail',
  data () {
    const currentYear = new Date().getFullYear()
    const requestedYear = this.$route.query.year
    const year = requestedYear === 'all' ? 'all' : Number(requestedYear) >= 2022 && Number(requestedYear) <= currentYear ? Number(requestedYear) : currentYear
    const department = benefitDepartments.includes(this.$route.query.department) ? this.$route.query.department : 'all'
    return {
      currentYear, departments: benefitDepartments, filters: { year, department }, appliedFilters: { year, department }, records: createBenefitDocumentDetails(), page: 1, pageSize: 50,
      columns: [
        { title: '文件名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'category', width: 240 },
        { title: '年份', dataIndex: 'year', width: 80, align: 'center' },
        { title: '文件', dataIndex: 'file', scopedSlots: { customRender: 'file' } },
        { title: '版号', dataIndex: 'edition', width: 200 },
        { title: '项目名称', dataIndex: 'projectName', scopedSlots: { customRender: 'projectName' } }
      ]
    }
  },
  computed: {
    years () { return Array.from({ length: Math.max(0, this.currentYear - 2022 + 1) }, (_, index) => this.currentYear - index) },
    filteredRecords () { return (this.appliedFilters.year === 'all' || this.appliedFilters.year === this.currentYear) && (this.appliedFilters.department === 'all' || this.appliedFilters.department === this.departments[0]) ? this.records : [] },
    pagination () { return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } }
  },
  methods: {
    applyFilters () { this.appliedFilters = Object.assign({}, this.filters); this.page = 1 },
    changePage (pagination) { this.page = pagination.pageSize === this.pageSize ? pagination.current : 1; this.pageSize = pagination.pageSize },
    showComingSoon () { this.$message.info('待后续开发') },
    goBack () { this.$router.push({ name: 'benefit-summary', query: { tab: 'document', year: String(this.appliedFilters.year), department: this.appliedFilters.department } }) }
  }
}
</script>

<style scoped>
.document-detail-page { min-width: 0; display: grid; gap: 20px; }
.document-title { padding: 20px; border-bottom: 1px solid #edf1f5; }
.document-title h2 { margin: 0; font-size: 16px; font-weight: 700; color: #18253c; }
.document-filters { padding: 20px; grid-template-columns: 200px 200px 88px; }
.document-filters .filter-actions { grid-template-columns: 1fr; }
.document-table >>> .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.document-table >>> .ant-table-thead > tr > th, .document-table >>> .ant-table-tbody > tr > td { padding-left: 8px; padding-right: 8px; white-space: normal; overflow-wrap: anywhere; }
.document-table >>> .ant-table-thead > tr > th:first-child, .document-table >>> .ant-table-tbody > tr > td:first-child { padding-left: 20px; }
.document-file-link { padding: 0; border: 0; color: inherit; background: transparent; text-align: left; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; cursor: pointer; }
.document-file-link:hover, .document-file-link:focus { color: inherit; text-decoration: underline; }
</style>
