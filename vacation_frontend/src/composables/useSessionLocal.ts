import { computed, reactive, readonly } from 'vue'
import type { User, UserRole } from '../types'

interface RegisterInput {
  name: string
  email: string
  role: UserRole
}

const state = reactive({
  users: [] as User[],
  requests: [],
  currentUser: null as User | null,
})

function generateId() {
  return crypto.randomUUID()
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function login(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const user = state.users.find((item) => item.email.toLowerCase() === normalizedEmail)

  if (!user) {
    return { ok: false, message: 'User not found.' }
  }

  state.currentUser = user
  return { ok: true }
}

function register(input: RegisterInput) {
  const email = normalizeEmail(input.email)
  const name = input.name.trim()

  if (!name || !email) {
    return { ok: false, message: 'All fields are required.' }
  }

  const exists = state.users.some((item) => item.email.toLowerCase() === email)

  if (exists) {
    return { ok: false, message: 'Email already exists.' }
  }

  const user: User = {
    id: generateId(),
    name,
    email,
    role: input.role,
  }

  state.users.push(user)
  state.currentUser = user

  return { ok: true }
}

function logout() {
  state.currentUser = null
}

export function useSession() {
  return {
    state: readonly(state),
    currentUser: computed(() => state.currentUser),
    isAuthenticated: computed(() => !!state.currentUser),
    login,
    register,
    logout,
  }
}

export function useSessionState() {
  return state
}