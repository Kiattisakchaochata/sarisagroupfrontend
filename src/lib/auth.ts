// src/lib/auth.ts
import { API_BASE } from './api'

export type User = {
  id: string
  name: string
  email: string
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error('เข้าสู่ระบบไม่สำเร็จ')
  }

  const data = await res.json()
  localStorage.setItem('token', data.token)
  return data.user
}

export async function getMe(): Promise<User> {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('ไม่มี token')

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')

  return res.json()
}

export function logout() {
  localStorage.removeItem('token')
}