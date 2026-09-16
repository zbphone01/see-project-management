<template>
<a-modal v-model="passwordVisible" title="修改密码" :width="480" :mask-closable="false" ok-text="确定" cancel-text="取消" @ok="submitPasswordChange" @cancel="closePasswordDialog">
      <form class="password-form" @submit.prevent="submitPasswordChange">
        <label for="current-password">原密码</label>
        <a-input-password id="current-password" v-model="passwordForm.current" autocomplete="current-password" placeholder="请输入原密码" />
        <label for="new-password">新密码</label>
        <a-input-password id="new-password" v-model="passwordForm.next" autocomplete="new-password" placeholder="请输入新密码" />
        <label for="confirm-password">确认新密码</label>
        <a-input-password id="confirm-password" v-model="passwordForm.confirm" autocomplete="new-password" placeholder="请再次输入新密码" />
        <p v-if="passwordError" class="password-error" role="alert">{{ passwordError }}</p>
      </form>
    </a-modal>
</template>

<script>

export default {
  name: 'ChangePasswordModal',
  data () { return {
    passwordVisible: false,
    passwordForm: { current: '', next: '', confirm: '' },
    passwordError: ''
  } },
  computed: {
    
  },
  methods: {
    openPasswordDialog () {
      this.passwordForm = { current: '', next: '', confirm: '' }
      this.passwordError = ''
      this.passwordVisible = true
    },
    closePasswordDialog () {
      this.passwordVisible = false
      this.passwordForm = { current: '', next: '', confirm: '' }
      this.passwordError = ''
    },
    submitPasswordChange () {
      const { current, next, confirm } = this.passwordForm
      if (!current || !next || !confirm) { this.passwordError = '请完整填写原密码、新密码和确认新密码'; return }
      if (next === current) { this.passwordError = '新密码不能与原密码相同'; return }
      if (next !== confirm) { this.passwordError = '两次输入的新密码不一致'; return }
      this.closePasswordDialog()
      this.$message.info('表单校验通过，尚未连接修改密码接口，密码未实际更改')
    }
  },
  
}
</script>
