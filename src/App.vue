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

export default {
  name: 'App',
  components: { PartnerLayout, AiAssistant },
  computed: {
    pageKey () { return ['project-detail', 'project-form'].includes(this.$route.name) ? this.$route.name + '-' + this.$route.params.id + (this.$route.name === 'project-form' && ['green-home', 'grass', 'one-time-donation', 'monthly-donation'].includes(this.$route.query.detailType) && this.$route.query.fresh === '1' ? '-fresh' : '') + (this.$route.name === 'project-form' && this.$route.query.example === 'filled' ? '-dashboard-filled' : '') : this.$route.name }
  }
}
</script>
