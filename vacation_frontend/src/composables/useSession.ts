import { computed, reactive, readonly } from 'vue'
import type { User, UserRole } from '../types'
import {jwtDecode} from 'jwt-decode'
import { clearToken, saveToken } from './storage.helper'
interface VerifyOtpResponse {
  token: string
}

interface JwtPayload {
  sub?: string
  email?: string
  name?: string
  role?: UserRole
  iat?: number
  exp?: number
}

interface RegisterInput {
  name: string
  email: string
  role: UserRole
}

interface VerifyOtpInput {
  email: string
  otp: string
}

const API_BASE_URL = 'http://localhost:3000/api/auth'

const state = reactive({
  currentUser: null as User | null,
  pendingEmail: '',
  isLoading: false,
  error: '',
  token:''
})

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

async function apiRequest<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed.')
  }

  return data as T
}

async function register(input: RegisterInput) {
  const email = normalizeEmail(input.email)
  const name = input.name.trim()

  if (!name || !email || !input.role) {
    return { ok: false, message: 'All fields are required.' }
  }

  state.isLoading = true
  state.error = ''

  try {
    const data = await apiRequest<User>(`${API_BASE_URL}/register`, {
      email,
      name,
      role: input.role,
    })

    state.currentUser = data
    state.pendingEmail = email

    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed.'
    state.error = message
    return { ok: false, message }
  } finally {
    state.isLoading = false
  }
}

async function requestOtp(email: string) {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    return { ok: false, message: 'Email is required.' }
  }

  state.isLoading = true
  state.error = ''

  try {
    const data = await apiRequest(`${API_BASE_URL}/request-otp`, {
      email: normalizedEmail,
    })

    state.pendingEmail = normalizedEmail

    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OTP request failed.'
    state.error = message
    return { ok: false, message }
  } finally {
    state.isLoading = false
  }
}
export function getTokenExpiryMs(token: string): number {
  const payload = jwtDecode<JwtPayload>(token)
  if (!payload?.exp) return 0
  return payload.exp * 1000
}

export function getTokenIssuedMs(token: string): number {
  const payload = jwtDecode<JwtPayload>(token)
  if (!payload?.iat) return Date.now()
  return payload.iat * 1000
}

export function isTokenExpired( token?:string): boolean {
  let payload
  if (token) { payload = jwtDecode<JwtPayload>(token) }
  else { payload = jwtDecode<JwtPayload>(state.token) }
  if (!payload?.exp) return true
  return Date.now() / 1000 >= payload.exp
}


function buildUserFromToken(token?: string): User | null {
  try {
    if (!token) return null
    const payload = jwtDecode<JwtPayload>(token)
    if (!payload.email || !payload.role) {
      return null
    }
    
    return {
      id: payload.sub ?? payload.email,
      email: payload.email,
      name: payload.name ?? payload.email,
      role: payload.role,
    }
  } catch {
    return null
  }
}

export function updateCurrUser(token?:string){
  if (!token) return null
  state.token = token
  state.currentUser = buildUserFromToken(token)
}

async function verifyOtp(input: VerifyOtpInput) {
  const email = normalizeEmail(input.email)
  const otp = input.otp.trim()

  if (!email || !otp) {
    return { ok: false, message: 'Email and OTP are required.' }
  }
  
  state.isLoading = true
  state.error = ''

  try {
    const data = await apiRequest<VerifyOtpResponse>(`${API_BASE_URL}/verify-otp`, {
      email,
      otp,
    })
    state.token = data.token
    state.currentUser = buildUserFromToken(data.token)
    state.pendingEmail = ''
    saveToken(data.token);

    return { ok: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OTP verification failed.'
    state.error = message
    return { ok: false, message }
  } finally {
    state.isLoading = false
  }
}

function logout() {
  clearToken()
  state.currentUser = null
  state.pendingEmail = ''
  state.error = ''
}

export function useSession() {
  return {
    state: readonly(state),
    currentUser: computed(() => state.currentUser),
    isAuthenticated: computed(() => !!state.currentUser),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    pendingEmail: computed(() => state.pendingEmail),
    register,
    login:requestOtp,
    verifyOtp,
    logout,
    isTokenExpired,
    updateCurrUser
  }
}

export function useSessionState() {
  return state
}
