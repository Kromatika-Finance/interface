import { METADEXA_API_BASE } from './metadexApi'

export interface AdminDashboardData {
  remainingOp: number
  numberOfReferrers: number
  activeAddresses: number
  totalVolume: number
  successfulTransactions: number
  failedTransactions: number
  profitabilityMetric: string
  highAchievers: string[]
}

export async function verifyPasskey(passkey: string): Promise<boolean> {
  const url = `${METADEXA_API_BASE}/v1/verifyPasskey`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey }),
  })
  if (!res.ok) return false
  const data = await res.json()
  return !!data.isValid
}

export async function getAdminDashboardData(passkey: string, from: string): Promise<AdminDashboardData> {
  const url = `${METADEXA_API_BASE}/v1/admin/dashboard`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passkey, from }),
  })
  if (!res.ok) {
    throw new Error(`Admin dashboard fetch failed: ${res.status}`)
  }
  return res.json()
}
