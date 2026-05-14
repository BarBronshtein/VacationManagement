<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <h3>Reject request</h3>
      <p>Please explain why this request is rejected.</p>

      <textarea
        v-model="reason"
        rows="4"
        placeholder="Type rejection reason"
      ></textarea>

      <div class="actions">
        <button class="secondary-btn" type="button" @click="$emit('close')">
          Cancel
        </button>
        <button
          class="danger-btn"
          type="button"
          :disabled="!reason.trim()"
          @click="confirm"
        >
          Confirm rejection
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [reason: string]
}>()

const reason = ref('')

watch(
  () => props.open,
  (value) => {
    if (value) {
      reason.value = ''
    }
  },
)

function confirm() {
  emit('confirm', reason.value)
}
</script>