<template>
  <PartnerLayout>
    <keep-alive>
      <router-view :key="pageKey" @open-ai="$refs.ai.openAiChat()" />
    </keep-alive>
    <AiAssistant ref="ai" />
  </PartnerLayout>
</template>

<script>
import PartnerLayout from './layouts/PartnerLayout.vue'
import AiAssistant from './components/AiAssistant.vue'
import { budgetKey } from './utils/project-budget'

export default {
  name: 'App',
  components: { PartnerLayout, AiAssistant },
  computed: {
    pageKey () {
      if (['project-budget-form', 'project-personnel-form'].includes(this.$route.name)) return this.$route.name + '-' + budgetKey(this.$route) + '-' + (this.$route.query.mode || 'edit') + '-' + (this.$route.query.sheet || 'detail') + '-' + (this.$route.query.budgetType || this.$route.query.detailType || 'project')
      return ['project-detail', 'project-form'].includes(this.$route.name) ? this.$route.name + '-' + this.$route.params.id + (this.$route.name === 'project-form' && (['green-home', 'grass', 'one-time-donation', 'monthly-donation'].includes(this.$route.query.detailType) || this.$route.params.id === '12') && this.$route.query.fresh === '1' ? '-fresh' : '') + (this.$route.name === 'project-form' && this.$route.query.example === 'filled' ? '-dashboard-filled' : '') : this.$route.name
    }
  }
}
</script>
