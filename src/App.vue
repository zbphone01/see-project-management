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
    pageKey () { return ['project-detail', 'project-form'].includes(this.$route.name) ? this.$route.name + '-' + this.$route.params.id : this.$route.name }
  }
}
</script>
