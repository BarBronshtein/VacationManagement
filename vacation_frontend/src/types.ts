export type UserRole = 'EMPLOYEE' | 'MANAGER'
export type VacationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface VacationRequest {
  id: string
  startDate: string
  endDate: string
  reason: string
  status: VacationRequestStatus
  employee : User
  rejectionReason?: string
}