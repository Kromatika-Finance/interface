/**
 * Metadex API helpers for transaction tracking (addTransaction + verifyTransaction).
 * Base URL can be overridden via REACT_APP_METADEXA_API_BASE (e.g. http://localhost:5000).
 */

export const METADEXA_API_BASE =
  typeof process.env.REACT_APP_METADEXA_API_BASE === 'string' && process.env.REACT_APP_METADEXA_API_BASE.length > 0
    ? process.env.REACT_APP_METADEXA_API_BASE.replace(/\/$/, '')
    : 'https://api.metadexa.io'

export interface AddTransactionBody {
  transactionHash: string
  referrer: string
  from: string
  chainId: string
  amount: { hex: string }
  tokenFrom: string
  adapterData: string
}

/**
 * Notify Metadex API that a transaction was submitted (pending).
 * Call when the user has submitted the tx but it is not yet confirmed.
 */
export async function addTransactionToMetadex(body: AddTransactionBody): Promise<void> {
  const url = `${METADEXA_API_BASE}/v1/addTransaction`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.warn('[Metadex] addTransaction failed:', res.status, await res.text())
  }
}

export interface VerifyTransactionBody {
  chainId: string
  transactionHash: string
  from: string
}

/**
 * Notify Metadex API that a transaction has been verified (included in a block).
 * Call after the transaction receipt is available.
 */
export async function verifyTransactionWithMetadex(body: VerifyTransactionBody): Promise<void> {
  const url = `${METADEXA_API_BASE}/v1/verifyTransaction`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.warn('[Metadex] verifyTransaction failed:', res.status, await res.text())
  }
}

export interface CheckReferrerResult {
  isReferrer: boolean
}

/**
 * Check whether the given address is already registered as a referrer.
 * Returns { isRegistered: true } when the address has an active referral account.
 */
export async function checkReferrer(address: string): Promise<CheckReferrerResult> {
  const url = `${METADEXA_API_BASE}/v1/checkReferrer`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })
  if (!res.ok) {
    console.warn('[Metadex] checkReferrer failed:', res.status, await res.text())
    return { isReferrer: false }
  }
  return res.json()
}

/**
 * Registers the connected address as a referrer.
 * POST /v1/registerReferrer  { from: referrerAddress }
 */
export async function registerReferrer(referrerAddress: string): Promise<{ success: boolean; message?: string }> {
  const url = `${METADEXA_API_BASE}/v1/registerReferrer`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: referrerAddress }),
  })
  if (!res.ok) throw new Error('Registration failed')
  return res.json()
}

export interface ReferrerTransaction {
  id: number
  referrer: string
  from: string
  transaction_hash: string
  timestamp: string
  status: string
  rewards: number
  volume: number
  tier: number
  tokenFrom: string
  amount: string
  adapterData: string
}

export interface ReferrerStats {
  id: number
  eoaAddress: string
  referredUsers: number
  earnedRewards: number
  hasClaimedFunds: boolean
  cumulativeVolume: number
  referredTransactions: ReferrerTransaction[]
  referralCode?: string
}

export interface ReferrerStatsResponse {
  stats: ReferrerStats
}

/**
 * Fetches referral transaction history for the given referrer address.
 * POST /v1/referrer  { from: referrerAddress }
 */
export async function getReferrerStats(referrerAddress: string): Promise<ReferrerStatsResponse> {
  const url = `${METADEXA_API_BASE}/v1/referrer`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: referrerAddress }),
  })
  if (!res.ok) {
    console.warn('[Metadex] getReferrerStats failed:', res.status, await res.text())
    return {
      stats: {
        id: 0,
        eoaAddress: '',
        referredUsers: 0,
        earnedRewards: 0,
        hasClaimedFunds: false,
        cumulativeVolume: 0,
        referredTransactions: [],
      },
    }
  }
  return res.json()
}
