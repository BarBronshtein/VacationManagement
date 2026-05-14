<template>
  <section class="dashboard-grid">
    <div class="card">
      <h2>Pending requests</h2>

      <PendingReviewList
        :requests="pendingRequests"
        @approve="handleApprove"
        @reject="openRejectModal"
      />

      <p v-if="message" class="message" :class="messageType">{{ message }}</p>
    </div>

    <RejectReasonModal
      :open="isRejectModalOpen"
      @close="closeRejectModal"
      @confirm="handleReject"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PendingReviewList from './PendingReviewList.vue'
import RejectReasonModal from './RejectReasonModal.vue'
import { useVacationRequests } from '../composables/useVacationRequests'

const {
  pendingRequests,
  loading,
  error,
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
} = useVacationRequests()

const isRejectModalOpen = ref(false)
const selectedRequestId = ref('')
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(async () => {
  const result = await fetchPendingRequests()
  console.log(result)
  if (!result.ok) {
    messageType.value = 'error'
    message.value = result.message ?? 'Failed to load pending requests.'
  }
})

async function handleApprove(requestId: string) {
  console.log('requestId:', requestId)
  const result = await approveRequest(requestId)

  messageType.value = result.ok ? 'success' : 'error'
  message.value = result.ok ? 'Request approved.' : result.message ?? 'Failed to approve request.'

  if (result.ok) {
    await fetchPendingRequests()
  }
}

function openRejectModal(requestId: string) {
  selectedRequestId.value = requestId
  isRejectModalOpen.value = true
}

function closeRejectModal() {
  isRejectModalOpen.value = false
  selectedRequestId.value = ''
}

async function handleReject(reason: string) {
  const result = await rejectRequest(selectedRequestId.value,reason)

  messageType.value = result.ok ? 'success' : 'error'
  message.value = result.ok ? 'Request rejected.' : result.message ?? 'Failed to reject request.'

  if (result.ok) {
    closeRejectModal()
    await fetchPendingRequests()
  }
}
</script>