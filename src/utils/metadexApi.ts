/**
 * Metadex API helpers for transaction tracking (addTransaction + verifyTransaction).
 * Base URL can be overridden via REACT_APP_METADEXA_API_BASE (e.g. http://localhost:5000).
 */

const METADEXA_API_BASE =
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
