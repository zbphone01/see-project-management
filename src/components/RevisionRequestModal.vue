<template>
  <a-modal v-model="visible" title="请求修订" wrap-class-name="standard-form-modal standard-edit-scope standard-edit-modal" :width="550" :mask-closable="false" :keyboard="false" ok-text="确定" cancel-text="取消" @ok="confirm">
    <div class="revision-request-form budget-modal-form">
      <label for="request-review-result">审核结果</label><a-select id="request-review-result" v-model="result" dropdown-class-name="standard-edit-dropdown" placeholder="请选择" @change="operation = '正常修订'"><a-select-option value="同意">同意</a-select-option><a-select-option value="驳回">驳回</a-select-option></a-select>
      <template v-if="result === '同意'"><label for="request-review-operation" :class="{ 'budget-readonly-label': !canSelectOperation }">修订操作</label><a-select v-if="canSelectOperation" id="request-review-operation" v-model="operation" dropdown-class-name="standard-edit-dropdown" placeholder="请选择"><a-select-option value="正常修订">正常修订</a-select-option><a-select-option value="修订并发布进展">修订并发布进展</a-select-option></a-select><span v-else class="request-readonly">正常修订</span></template>
      <label for="request-review-remark">审核备注</label><a-textarea id="request-review-remark" v-model="remark" :rows="5" placeholder="请填写备注" />
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'RevisionRequestModal',
  data () { return { visible: false, project: null, result: '同意', operation: '正常修订', remark: '' } },
  computed: {
    canSelectOperation () { return !['项目组', '项目中心'].includes((this.project || {}).reviewDepartment) }
  },
  methods: {
    open (project, result = '同意') { this.project = project; this.result = result; this.operation = '正常修订'; this.remark = ''; this.visible = true },
    confirm () {
      if (!this.project || this.project.status !== '请求修订') return
      this.$emit('confirm', { project: this.project, result: this.result, remark: this.remark.trim(), operation: this.result === '同意' ? (this.canSelectOperation ? this.operation : '正常修订') : '' })
      this.visible = false
    }
  }
}
</script>

<style scoped>
.revision-request-form { width: 470px; max-width: 100%; margin: 0 auto; }
.revision-request-form label { text-align: right; }
.revision-request-form .ant-select { width: 100%; }
.request-readonly { color: #27384e; font-weight: 500; line-height: 1.6; }
</style>
