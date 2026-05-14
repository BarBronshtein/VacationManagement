<template>
  <form class="form" @submit.prevent="submit">
    <label>
      <span>Start date</span>
      <input v-model="form.startDate" type="date" />
    </label>

    <label>
      <span>End date</span>
      <input v-model="form.endDate" type="date" />
    </label>

    <label>
      <span>Reason</span>
      <textarea v-model="form.reason" rows="4" placeholder="Optional details"></textarea>
    </label>

    <button class="primary-btn" type="submit">Submit request</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const emit = defineEmits<{
  create: [payload: { startDate: string; endDate: string; reason: string }]
}>()

const form = reactive({
  startDate: '',
  endDate: '',
  reason: '',
})

function submit() {
  emit('create', { ...form })
  form.startDate = ''
  form.endDate = ''
  form.reason = ''
}
</script>