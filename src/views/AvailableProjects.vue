<template>
  <section class="applied-page available-projects-page">
    <section class="panel applied-table-panel">
      <a-tabs class="strategy-tabs" :active-key="activeStrategy" @change="switchStrategy">
        <a-tab-pane v-for="strategy in strategies" :key="strategy" :tab="strategy" />
      </a-tabs>
      <div class="recruitment-search">
        <div class="search-controls">
          <a-input class="search-input" v-model="keyword" aria-label="招募名称" placeholder="请输入招募名称" allow-clear @pressEnter="queryProjects" />
          <a-button class="search-button" type="primary" @click="queryProjects"><a-icon type="search" /> 查询</a-button>
        </div>
        <a-button class="launch-recruitment-button" @click="startRecruitment"><a-icon type="notification" /> 发起招募</a-button>
      </div>

      <a-table
        class="applied-table available-table"
        :columns="columns"
        :data-source="filteredProjects"
        :pagination="pagination"
        :scroll="{ x: true }"
        row-key="id"
        @change="handleTableChange"
      >
        <template slot="recruitment" slot-scope="text, project">
          <div class="table-project">
            <div :class="['table-project-cover', project.cover]">
              <img v-if="project.image" :src="project.image" :alt="project.name" />
              <a-icon v-else :type="project.icon" />
            </div>
            <div>
              <strong>{{ project.name }}{{ project.listNote || '' }}</strong>
              <div class="project-attributes">
                <span class="attribute-tag strategy-tag">策略：{{ project.strategy }}</span>
                <span class="attribute-tag topic-tag">议题：{{ project.topic }}</span>
              </div>
            </div>
          </div>
        </template>
        <template slot="type" slot-scope="type">
          <span :class="['project-type-chip', type === '联合公益' ? 'charity' : 'grant']">{{ type }}</span>
        </template>
        <template slot="period" slot-scope="text, project">
          <span class="updated-time"><span>{{ project.startDate }}</span><span>{{ project.endDate }}</span></span>
        </template>
        <template slot="operation" slot-scope="text, project">
          <div class="available-row-actions">
            <button type="button" @click="handleAction('detail', project)">查看</button>
            <button type="button" @click="handleAction('edit', project)">编辑</button>
            <button class="delete-action" type="button" @click="handleAction('delete', project)">删除</button>
          </div>
        </template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { availableProjects } from '../mock/projects'

export default {
  name: 'AvailableProjects',
  data () {
    return {
      availableProjects,
      strategies: ['全部', '荒漠化防治', '生态保护与自然教育', '气候变化与商业可持续', '海洋保护', '环保公益行业发展', '联合公益', '其他', '专项基金'],
      activeStrategy: '全部',
      keyword: '',
      appliedKeyword: '',
      page: 1,
      columns: [
        { title: '招募ID', dataIndex: 'code', key: 'code', width: 110, align: 'center', className: 'business-id-column' },
        { title: '招募项目', dataIndex: 'name', key: 'recruitment', scopedSlots: { customRender: 'recruitment' } },
        { title: '项目类型', dataIndex: 'type', key: 'type', width: 110, align: 'center', scopedSlots: { customRender: 'type' } },
        { title: '发起部门', dataIndex: 'department', key: 'department', width: 150, align: 'center' },
        { title: '起止时间', key: 'period', width: 120, align: 'center', scopedSlots: { customRender: 'period' } },
        { title: '操作', key: 'operation', fixed: 'right', width: 90, align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    filteredProjects () {
      const keyword = this.appliedKeyword.trim().toLowerCase()
      return this.availableProjects.filter(project => {
        const matchesStrategy = this.activeStrategy === '全部' || project.strategy === this.activeStrategy
        const matchesKeyword = !keyword || project.name.toLowerCase().includes(keyword)
        return matchesStrategy && matchesKeyword
      })
    },
    pagination () {
      return {
        current: this.page,
        pageSize: 10,
        pageSizeOptions: ['10', '50', '100'],
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: total => `共有 ${total} 条数据`
      }
    }
  },
  methods: {
    switchStrategy (strategy) {
      this.activeStrategy = strategy
      this.page = 1
    },
    queryProjects () {
      this.appliedKeyword = this.keyword
      this.page = 1
    },
    handleTableChange (pagination) { this.page = pagination.current },
    startRecruitment () { this.$router.push({ name: 'recruitment-form' }) },
    handleAction (key, project) {
      if (key === 'detail' && [506306, 896257, 896258].includes(project.id)) {
        this.$router.push({ name: 'recruitment-detail', params: { id: String(project.id) } })
        return
      }
      const actionLabels = { detail: '查看', edit: '编辑', delete: '删除' }
      this.$message.info(`${actionLabels[key]}招募：${project.name}（演示入口，尚未接入业务功能）`)
    }
  }
}
</script>

<style scoped>
.strategy-tabs { padding: 0 20px; }
.strategy-tabs ::v-deep .ant-tabs-bar { min-height: 76px; margin: 0; border-bottom-color: #edf1f5; }
.strategy-tabs ::v-deep .ant-tabs-nav .ant-tabs-tab { height: 76px; margin-right: 28px; padding: 0; display: inline-flex; align-items: center; box-sizing: border-box; }
.strategy-tabs ::v-deep .ant-tabs-tab-active { color: #1677ff; font-weight: 600; }
.recruitment-search { min-height: 72px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border-bottom: 1px solid #edf1f5; }
.search-controls { display: grid; grid-template-columns: 300px 88px; align-items: center; gap: 10px; }
.search-controls ::v-deep .search-input,
.search-controls ::v-deep .search-button { height: 32px; }
.recruitment-search ::v-deep .search-button { line-height: 30px; }
.recruitment-search ::v-deep .launch-recruitment-button { height: 32px; display: inline-flex; align-items: center; justify-content: center; border-color: #1677ff; border-radius: 5px; color: #fff; background: #1677ff; box-shadow: 0 2px 0 rgba(0,0,0,.043); line-height: 1; }
.recruitment-search ::v-deep .launch-recruitment-button .anticon { line-height: 1; }
.recruitment-search ::v-deep .launch-recruitment-button:hover,
.recruitment-search ::v-deep .launch-recruitment-button:focus,
.recruitment-search ::v-deep .launch-recruitment-button:active { border-color: #1677ff; color: #1677ff; background: #fff; }
.project-attributes { margin-top: 11px; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 6px; line-height: 1.4; text-align: left; }
.attribute-tag { max-width: 100%; padding: 3px 8px; border-radius: 4px; white-space: normal; overflow-wrap: anywhere; }
.strategy-tag { color: #08979c; background: #e6fffb; }
.topic-tag { color: #d48806; background: #fffbe6; }
.available-table ::v-deep .table-project > div:last-child { row-gap: 5px; }
.available-table ::v-deep .ant-table-thead > tr > th,
.available-table ::v-deep .ant-table-tbody > tr > td { padding-right: 8px; padding-left: 8px; }
.available-table ::v-deep .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.available-row-actions { display: grid; justify-items: center; gap: 0; }
.available-row-actions button { min-height: 24px; padding: 0 2px; border: 0; border-radius: 5px; color: #1677ff; background: transparent; cursor: pointer; }
.available-row-actions button:hover, .available-row-actions button:focus { color: #0958d9; background: #f0f7ff; }
.available-row-actions .delete-action { color: #ff4d4f; }
.available-row-actions .delete-action:hover, .available-row-actions .delete-action:focus { color: #ff4d4f; background: #fff1f0; }
.available-table ::v-deep td { overflow-wrap: anywhere; line-height: 1.55; }
</style>
