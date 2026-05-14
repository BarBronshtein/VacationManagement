<template>
  <div v-if="requests.length" class="stack">
    <article v-for="request in requests" :key="request.id" class="request-item">
      <div class="request-head">
        <div>
          <strong>{{ request.employeeName }}</strong>
          <p>{{ request.startDate }} → {{ request.endDate }}</p>
        </div>
        <span class="status pending">pending</span>
      </div>

      <p>{{ request.reason }}</p>

      <div class="actions">
        <button class="primary-btn" type="button" @click="$emit('approve', request.id)">
          Approve
        </button>
        <button class="danger-btn" type="button" @click="$emit('reject', request.id)">
          Reject
        </button>
      </div>
    </article>
  </div>

  <p v-else class="empty-state">No pending requests.</p>
</template>

<script setup lang="ts">
import type { VacationRequest } from '../types'

defineProps<{
  requests: VacationRequest[]
}>()

defineEmits<{
  approve: [requestId: string]
  reject: [requestId: string]
}>()
</script>