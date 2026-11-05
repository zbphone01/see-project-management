<template><budget-generated-table :budget="budget" kind="summary" :audit="audit" /></template>
<script>
import BudgetGeneratedTable from './BudgetGeneratedTable.vue'
export default {
  name: 'BudgetSummary',
  components: { BudgetGeneratedTable },
  props: { budget: { type: Object, required: true }, audit: { type: Boolean, default: false } }
}
</script>
