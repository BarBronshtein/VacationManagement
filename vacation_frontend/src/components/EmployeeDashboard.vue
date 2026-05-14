<template>
  <section class="dashboard-grid">
    <div class="card">
      <h2>New request</h2>
      <VacationRequestForm @create="handleCreate" />
      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
    </div>

    <div class="card">
      <h2>My requests</h2>
      <VacationRequestList :requests="myRequests" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VacationRequestForm from './VacationRequestForm.vue'
import VacationRequestList from './VacationRequestList.vue'
import { useVacationRequests } from '../composables/useVacationRequests'
const { myRequests, createRequest , fetchMyRequests } = useVacationRequests()


onMounted(async () => {
  const result = await fetchMyRequests()
  console.log(result)
  if (!result.ok) {
    messageType.value = 'error'
    message.value = result.message ?? 'Failed to load pending requests.'
  }
})

const message = ref('')
const messageType = ref<'success' | 'error'>('success')

function handleCreate(payload: { startDate: string; endDate: string; reason: string }) {
  const result = createRequest(payload)
  messageType.value = result.ok ? 'success' : 'error'
  message.value = result.ok ? 'Request created.' : result.message
}
</script>