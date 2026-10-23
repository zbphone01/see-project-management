<template>
  <section class="species-detail-page shared-list-detail">
    <div class="detail-back-row"><a-button class="detail-back" @click="goBack"><a-icon type="arrow-left" /> 返回</a-button></div>
    <section class="panel applied-table-panel">
      <div class="species-title shared-list-title"><h2>物种详情</h2></div>
      <form class="filter-grid species-filters shared-list-detail-filters" @submit.prevent="applyFilters">
        <a-select v-model="filters.year" aria-label="年份"><a-select-option value="all">全部年份</a-select-option><a-select-option v-for="year in years" :key="year" :value="year">{{ year }}年</a-select-option></a-select>
        <a-select v-model="filters.department" aria-label="部门"><a-select-option value="all">全部部门</a-select-option><a-select-option v-for="department in departments" :key="department" :value="department">{{ department }}</a-select-option></a-select>
        <div class="filter-actions"><a-button type="primary" html-type="submit" icon="filter">筛选</a-button></div>
      </form>
      <a-table class="applied-table species-table shared-list-table shared-list-fixed shared-list-inset-8 shared-list-wrap shared-list-first-inset" :columns="columns" :data-source="filteredRecords" row-key="id" :pagination="pagination" :scroll="{ x: true }" :locale="{ emptyText: '暂无符合条件的物种数据' }" @change="changePage">
        <template slot="name" slot-scope="text, record"><div class="species-name">{{ record.name }}</div><div class="species-latin">{{ record.latinName }}</div></template>
        <template slot="number" slot-scope="value">{{ formatNumber(value) }}</template>
        <template slot="completion" slot-scope="text, record"><span class="species-completion">{{ completion(record) }}</span></template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { benefitDepartments } from '../mock/benefit-summary'
import { createSpeciesDetails } from '../mock/benefit-species-details'
export default {
  name: 'BenefitSpeciesDetail',
  data () {
    const currentYear = new Date().getFullYear()
    const requestedYear = this.$route.query.year
    const year = requestedYear === 'all' ? 'all' : Number(requestedYear) >= 2022 && Number(requestedYear) <= currentYear ? Number(requestedYear) : currentYear
    const department = benefitDepartments.includes(this.$route.query.department) ? this.$route.query.department : 'all'
    return {
      currentYear, departments: benefitDepartments, filters: { year, department }, appliedFilters: { year, department }, records: createSpeciesDetails(), page: 1, pageSize: 50,
      columns: [
        { title: '物种名称', key: 'name', scopedSlots: { customRender: 'name' } },
        { title: '物种分类', dataIndex: 'category', width: 100, align: 'center' },
        { title: '保护级别', dataIndex: 'protection', width: 100, align: 'center' },
        { title: 'IUCN濒危等级', dataIndex: 'iucn', width: 150, align: 'center' },
        { title: '项目收益数量', dataIndex: 'project', width: 150, align: 'center', defaultSortOrder: 'descend', sorter: (a, b) => (a.project === null ? -1 : a.project) - (b.project === null ? -1 : b.project), scopedSlots: { customRender: 'number' } },
        { title: '部门填报', dataIndex: 'department', width: 150, align: 'center', sorter: (a, b) => (a.department === null ? -1 : a.department) - (b.department === null ? -1 : b.department), scopedSlots: { customRender: 'number' } },
        { title: '完成比例', key: 'completion', width: 100, align: 'center', scopedSlots: { customRender: 'completion' } },
        { title: '涉及项目', dataIndex: 'projects', width: 100, align: 'center' }
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
    formatNumber (value) { return value === null ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) },
    completion (record) { return record.project === null || record.department === null ? '—' : record.department ? (record.project / record.department * 100).toFixed(1) + '%' : '0.0%' },
    goBack () { this.$router.push({ name: 'benefit-summary', query: { tab: 'species', year: String(this.appliedFilters.year), department: this.appliedFilters.department } }) }
  }
}
</script>

<style scoped>

.species-name, .species-latin { min-width: 0; white-space: normal; overflow-wrap: anywhere; line-height: 1.6; }
.species-latin { margin-top: 4px; color: #718095; }
.species-completion { color: #1677ff; }
</style>
