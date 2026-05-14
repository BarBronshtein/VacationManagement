import { toRaw } from "vue"
import { COOKIE_NAME, LS_KEY } from "../constants/constat"
import { getTokenExpiryMs, useSession } from "./useSession"

export function setCookie(name: string, value: string, expiresAt: number) {
  const expires = new Date(expiresAt).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

export function bootstrap(){
  const token = loadToken();
  const { updateCurrUser } = useSession();
  updateCurrUser(token!);
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}


export function saveToken(token:string){
  const expiresAt = getTokenExpiryMs(token)
  try{
    localStorage.setItem(LS_KEY,token)
  }
  catch (ex){}
  setCookie(COOKIE_NAME, token, expiresAt || Date.now() + 3600_000)
}

export function clearToken() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    // ignore
  }
  deleteCookie(COOKIE_NAME)
}


export function loadToken(): string | null {
  let token: string | null = null
  try {
    token = localStorage.getItem(LS_KEY)
  } catch {
    // ignore
  }
  if (!token) token = getCookie(COOKIE_NAME)
  if (!token) return null
  if (toRaw(useSession().isTokenExpired(token))) {
    clearToken()
    return null
  }
  return token
}