<template>
  <section class="applied-page downloads-page">
    <section class="panel applied-table-panel">
      <a-table class="applied-table" :columns="columns" :data-source="downloadRecords" :pagination="pagination" :scroll="{ x: true }" row-key="id" @change="changePage">
        <template slot="appliedAt" slot-scope="value"><span class="download-time">{{ formatTime(value).join(' ') }}</span></template>
        <template slot="account" slot-scope="value"><span class="download-account">{{ value }}</span></template>
        <template slot="status" slot-scope="text, record"><span :class="['status-chip', record.expired ? 'neutral' : 'active-approved']">{{ record.expired ? '已过期' : '已生成' }}</span></template>
        <template slot="operation" slot-scope="text, record"><a-button v-if="!record.expired" class="operation-button" type="link" @click="download(record)">下载</a-button></template>
      </a-table>
    </section>
  </section>
</template>

<script>
import { createDataDownloads, downloadExpired } from '../mock/data-downloads'

export default {
  name: 'DataDownloads',
  data () {
    return {
      records: createDataDownloads(), now: Date.now(), page: 1, pageSize: 10,
      columns: [
        { title: '申请时间', dataIndex: 'appliedAt', width: '20%', align: 'center', scopedSlots: { customRender: 'appliedAt' } },
        { title: '导出账号', dataIndex: 'account', width: '20%', align: 'center', scopedSlots: { customRender: 'account' } },
        { title: '数据条数', dataIndex: 'count', width: '20%', align: 'center' },
        { title: '状态', key: 'status', width: '20%', align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '操作', key: 'operation', width: '20%', align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    }
  },
  computed: {
    downloadRecords () { return this.records.map(record => ({ ...record, count: record.rows.length, expired: downloadExpired(record, this.now) })) },
    pagination () { return { current: this.page, pageSize: this.pageSize, pageSizeOptions: ['10', '50', '100'], showSizeChanger: true, showTotal: total => `共有 ${total} 条数据` } }
  },
  mounted () {
    this.expiryTimer = window.setInterval(this.refreshTime, 1000)
    window.addEventListener('focus', this.refreshTime)
    document.addEventListener('visibilitychange', this.refreshTime)
  },
  beforeDestroy () {
    window.clearInterval(this.expiryTimer)
    window.removeEventListener('focus', this.refreshTime)
    document.removeEventListener('visibilitychange', this.refreshTime)
  },
  methods: {
    refreshTime () { this.now = Date.now() },
    formatTime (value) {
      const date = new Date(value)
      const pad = number => String(number).padStart(2, '0')
      return [`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`]
    },
    changePage (pagination) { this.page = pagination.pageSize !== this.pageSize ? 1 : pagination.current; this.pageSize = pagination.pageSize },
    download (record) {
      this.refreshTime()
      if (downloadExpired(record, this.now)) { this.$message.info('申请时间已超过48小时，下载已过期'); return }
      this.$message.info('下载功能演示，暂不生成文件')
    }
  }
}
</script>

<style scoped>
.downloads-page ::v-deep .ant-table-scroll table { width: 100% !important; min-width: 1140px !important; table-layout: fixed; }
.downloads-page ::v-deep .ant-table-thead > tr > th,
.downloads-page ::v-deep .ant-table-tbody > tr > td { padding-left: 8px; padding-right: 8px; }
.downloads-page ::v-deep .ant-table-thead > tr > th:first-child,
.downloads-page ::v-deep .ant-table-tbody > tr > td:first-child { padding-left: 20px; }
.download-account { white-space: normal; overflow-wrap: anywhere; }
.download-time { color: #6f7f92; white-space: nowrap; }
</style>
