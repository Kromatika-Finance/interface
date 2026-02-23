import { useEffect, useState } from 'react'

export const REFERRAL_ADDRESS_KEY = 'kromatika_referral_address'

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/i
const REFERRAL_TTL_MS = 24 * 60 * 60 * 1000 // 1 day

interface StoredReferral {
  address: string
  expiresAt: number
}

/** Persists a referral address with a 1-day TTL. */
export function saveReferral(address: string): void {
  const payload: StoredReferral = { address, expiresAt: Date.now() + REFERRAL_TTL_MS }
  localStorage.setItem(REFERRAL_ADDRESS_KEY, JSON.stringify(payload))
}

/** Reads and validates the stored referral, evicting it if expired. */
function loadReferral(): string | null {
  try {
    const raw = localStorage.getItem(REFERRAL_ADDRESS_KEY)
    if (!raw) return null
    const parsed: StoredReferral = JSON.parse(raw)
    if (!ETH_ADDRESS_RE.test(parsed.address)) return null
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(REFERRAL_ADDRESS_KEY)
      return null
    }
    return parsed.address
  } catch {
    return null
  }
}

/**
 * Parses a referral Ethereum address from the current URL.
 *
 * Supported patterns (all hash-router based):
 *   /#/swap/r/0x...                   (path segment, handled by router redirect)
 *   /#/swap?ref=0x...                 (query param, short form)
 *   /#/swap?referral=0x...            (query param, long form)
 *   /#/swap/referral=0x...            (legacy fragment path form)
 */
function parseReferralFromUrl(): string | null {
  const hash = window.location.hash
  const href = window.location.href

  // Path segment: #/swap/r/0x... (normally intercepted by the router, but kept as fallback)
  const pathMatch = hash.match(/\/r\/(0x[a-fA-F0-9]{40})\b/i)
  if (pathMatch && ETH_ADDRESS_RE.test(pathMatch[1])) return pathMatch[1]

  // Query / fragment param: ?ref= | &ref= | ?referral= | &referral= | /referral=
  const paramMatch =
    hash.match(/[/?&]ref(?:erral)?=(0x[a-fA-F0-9]{40})\b/i) ?? href.match(/[/?&]ref(?:erral)?=(0x[a-fA-F0-9]{40})\b/i)
  if (paramMatch && ETH_ADDRESS_RE.test(paramMatch[1])) return paramMatch[1]

  return null
}

/**
 * Returns the referrer address for the current session.
 *
 * Priority:
 *  1. A valid address found in the current URL (persisted to localStorage with 1-day TTL)
 *  2. A previously persisted address from localStorage (if not expired)
 *
 * Self-referral is automatically excluded: if the stored address equals
 * `currentAccount` it is ignored and null is returned.
 */
export function useReferral(currentAccount?: string | null): string | null {
  const [referer, setReferer] = useState<string | null>(loadReferral)

  useEffect(() => {
    const fromUrl = parseReferralFromUrl()
    if (fromUrl) {
      saveReferral(fromUrl)
      setReferer(fromUrl)
    }
  }, [])

  // Never return self-referral
  if (referer && currentAccount && referer.toLowerCase() === currentAccount.toLowerCase()) {
    return null
  }
  return referer
}
