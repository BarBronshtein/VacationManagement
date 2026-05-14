import { computed, ref } from 'vue'
import type { VacationRequest } from '../types'
import { useSession, useSessionState } from './useSession'
import axios from 'axios';

interface CreateRequestInput {
  startDate: string
  endDate: string
  type: string
  reason: string
}

type Decision = 'APPROVE' | 'REJECT'

const API_BASE_URL = 'http://localhost:3000/api/vacation-requests'

const api = axios.create({
  baseURL : API_BASE_URL,
  headers:{
    'Content-Type':'application/json'
  },
  
})

api.interceptors.request.use((config)=>{
  const sessionState = useSessionState()
  const token = sessionState.token
  if (token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
},(error)=>Promise.reject(error))

export function useVacationRequests() {
  const sessionState = useSessionState()
  const { currentUser } = useSession()

  const requests = ref<VacationRequest[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const myRequests = computed(() => {
    if (!currentUser.value) return []
    
    return requests.value
      .filter((request) => request.employee.id === currentUser.value?.id)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  const pendingRequests = computed(() =>
    [...requests.value]
      .filter((request) => request.status === 'PENDING')
      .sort((a, b) => b.startDate.localeCompare(a.startDate)),
  )

  async function fetchMyRequests() {
    try {
      loading.value = true
      error.value = null

      const response = await api.get<VacationRequest[]>('/requests');
      requests.value = Array.isArray(response.data) ? response.data : []
      return { ok: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load requests.'
      return { ok: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingRequests() {
    try {
      loading.value = true
      error.value = null

      const { data }=await api.get<VacationRequest[]>('/pending')
      console.log("fetch pending request data: ",data)
      requests.value = Array.isArray(data) ? data : []
      return { ok: true , data}
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load pending requests.'
      return { ok: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function createRequest(input: CreateRequestInput) {
    const user = currentUser.value

    if (!user || user.role !== 'EMPLOYEE') {
      return { ok: false, message: 'Only employees can create requests.' }
    }

    if (!input.startDate || !input.endDate || !input.reason.trim()) {
      return { ok: false, message: 'All fields are required.' }
    }

    if (input.endDate < input.startDate) {
      return { ok: false, message: 'End date must be after start date.' }
    }

    try {
      error.value = null

      const response = await api.post<VacationRequest>('/',input)
      const createdRequest = response.data
      if (createdRequest) {
        requests.value.unshift(createdRequest)
      } else {
        await fetchMyRequests()
      }

      return { ok: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create request.'
      return { ok: false, message: error.value }
    }
  }

  async function decideRequest(requestId: string, decision: Decision,rejectReason:string) {
    try {
      error.value = null

      const response = await api.post<VacationRequest>(`/${requestId}/decision`,{decision,comment:rejectReason})

      const updatedRequest = response.data

      const index = requests.value.findIndex((item) => item.id === requestId)

      if (index !== -1 && updatedRequest) {
        requests.value[index] = updatedRequest
      } else {
        await fetchPendingRequests()
      }

      return { ok: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update request.'
      return { ok: false, message: error.value }
    }
  }

  async function approveRequest(requestId: string) {
    return decideRequest(requestId, 'APPROVE')
  }

  async function rejectRequest(requestId: string,reason:string) {
    return decideRequest(requestId, 'REJECT',reason)
  }

  return {
    requests,
    loading,
    error,
    myRequests,
    pendingRequests,
    fetchMyRequests,
    fetchPendingRequests,
    createRequest,
    approveRequest,
    rejectRequest,
  }
}