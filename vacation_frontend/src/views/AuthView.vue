<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-header">
        <h1>Vacation Requests</h1>
        <p>Minimal demo with role-based access.</p>
      </div>

      <div class="auth-tabs">
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'login' }"
          @click="switchMode('login')"
        >
          Login
        </button>
        <button
          type="button"
          class="tab"
          :class="{ active: mode === 'register' }"
          @click="switchMode('register')"
        >
          Register
        </button>
      </div>

      <form
        v-if="mode === 'login' && loginStep === 'email'"
        class="form"
        @submit.prevent="handleRequestOtp"
      >
        <label>
          <span>Email</span>
          <input
            v-model="loginEmail"
            type="email"
            placeholder="employee@test.com"
          />
        </label>

        <button class="primary-btn" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Sending...' : 'Send OTP' }}
        </button>
      </form>

      <form
        v-else-if="mode === 'login' && loginStep === 'otp'"
        class="form"
        @submit.prevent="handleVerifyOtp"
      >
        <label>
          <span>Email</span>
          <input v-model="loginEmail" type="email" readonly />
        </label>

        <label>
          <span>OTP Code</span>
          <input
            v-model="loginOtp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="Enter 6-digit code"
          />
        </label>

        <button class="primary-btn" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
        </button>

        <button
          type="button"
          class="secondary-btn"
          :disabled="isLoading"
          @click="handleBackToEmail"
        >
          Change email
        </button>
      </form>

      <form v-else class="form" @submit.prevent="handleRegister">
        <label>
          <span>Name</span>
          <input v-model="registerForm.name" type="text" placeholder="Your name" />
        </label>

        <label>
          <span>Email</span>
          <input v-model="registerForm.email" type="email" placeholder="name@test.com" />
        </label>

        <label>
          <span>Role</span>
          <select v-model="registerForm.role">
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
          </select>
        </label>

        <button class="primary-btn" type="submit" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p v-if="infoMessage" class="message success">{{ infoMessage }}</p>
      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

      <div class="demo-box">
        <strong>Login flow</strong>
        <p>1. Enter email</p>
        <p>2. Receive OTP</p>
        <p>3. Verify OTP</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { UserRole } from '../types'
import { useSession } from '../composables/useSession'

const router = useRouter()
const { register, login, verifyOtp, isLoading } = useSession()

const mode = ref<'login' | 'register'>('login')
const loginStep = ref<'email' | 'otp'>('email')

const loginEmail = ref('')
const loginOtp = ref('')
const errorMessage = ref('')
const infoMessage = ref('')

const registerForm = reactive<{
  name: string
  email: string
  role: UserRole
}>({
  name: '',
  email: '',
  role: 'EMPLOYEE',
})

function resetMessages() {
  errorMessage.value = ''
  infoMessage.value = ''
}

function switchMode(nextMode: 'login' | 'register') {
  mode.value = nextMode
  resetMessages()

  if (nextMode === 'login') {
    loginStep.value = 'email'
    loginOtp.value = ''
  }
}

function handleBackToEmail() {
  loginStep.value = 'email'
  loginOtp.value = ''
  resetMessages()
}

async function handleRequestOtp() {
  resetMessages()

  const result = await login(loginEmail.value)

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  infoMessage.value = 'OTP sent to your email.'
  loginStep.value = 'otp'
}

async function handleVerifyOtp() {
  resetMessages()

  const result = await verifyOtp({
    email: loginEmail.value,
    otp: loginOtp.value,
  })

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }
  console.log('result:', result)
  await router.push('/app')
}

async function handleRegister() {
  resetMessages()

  const result = await register({
    name: registerForm.name,
    email: registerForm.email,
    role: registerForm.role,
  })

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  infoMessage.value = 'Registration successful. You can now verify with OTP.'
  mode.value = 'login'
  loginStep.value = 'email'
  loginEmail.value = registerForm.email
}
</script>