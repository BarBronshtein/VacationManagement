<template>
  <div class="page-shell">
    <header class="topbar">
      <div>
        <h1>Vacation Requests</h1>
        <p>{{ currentUser?.name }} · {{ currentUser?.role }}</p>
      </div>

      <button class="secondary-btn" type="button" @click="handleLogout">
        Logout
      </button>
    </header>

    <main class="content">
      <EmployeeDashboard v-if="currentUser?.role === 'EMPLOYEE'" />
      <ManagerDashboard v-else-if="currentUser?.role === 'MANAGER'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import EmployeeDashboard from '../components/EmployeeDashboard.vue'
import ManagerDashboard from '../components/ManagerDashboard.vue'
import { useSession } from '../composables/useSession'

const router = useRouter()
const { currentUser, logout } = useSession()

function handleLogout() {
  logout()
  router.push('/auth')
}
</script>