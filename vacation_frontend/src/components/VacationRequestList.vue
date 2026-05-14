<template>
  <div v-if="requests.length" class="stack">
    <article v-for="request in requests" :key="request.id" class="request-item">
      <div class="request-head">
        <strong>{{ request.startDate }} → {{ request.endDate }}</strong>
        <span class="status" :class="request.status">{{ request.status }}</span>
      </div>

      <p>{{ request.reason }}</p>

      <p v-if="request.managerComment" class="reject-note">
        Rejection reason: {{ request.managerComment }}
      </p>
    </article>
  </div>

  <p v-else class="empty-state">No requests yet.</p>
</template>

<script setup lang="ts">
import type { VacationRequest } from '../types'

defineProps<{
  requests: VacationRequest[]
}>()
</script>