import { useEffect, useState } from 'react'

export const REFERRAL_ADDRESS_KEY = 'kromatika_referral_address'

const ETH_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/i
const REFERRAL_TTL_MS = 24 * 60 * 60 * 1000 // 1 day

interface StoredReferral {
  referral: string // Can be either an address (0x...) or a referralCode
  expiresAt: number
}

/** Persists a referral address or code with a 1-day TTL. */
export function saveReferral(referral: string): void {
  const payload: StoredReferral = { referral, expiresAt: Date.now() + REFERRAL_TTL_MS }
  localStorage.setItem(REFERRAL_ADDRESS_KEY, JSON.stringify(payload))
}

/** Reads and validates the stored referral, evicting it if expired. */
function loadReferral(): string | null {
  try {
    const raw = localStorage.getItem(REFERRAL_ADDRESS_KEY)
    if (!raw) return null
    const parsed: StoredReferral = JSON.parse(raw)
    if (!parsed.referral) return null
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(REFERRAL_ADDRESS_KEY)
      return null
    }
    return parsed.referral
  } catch {
    return null
  }
}

/**
 * Parses a referral code or Ethereum address from the current URL.
 *
 * Supported patterns (all hash-router based):
 *   /#/swap/r/referralCode            (path segment, handled by router redirect)
 *   /#/swap/r/0x...                   (path segment with address, handled by router redirect)
 *   /#/swap?ref=code                  (query param, short form)
 *   /#/swap?referral=code             (query param, long form)
 *   /#/swap/referral=code             (legacy fragment path form)
 */
function parseReferralFromUrl(): string | null {
  const hash = window.location.hash
  const href = window.location.href

  // Path segment: #/swap/r/... (normally intercepted by the router, but kept as fallback)
  const pathMatch = hash.match(/\/r\/([^/?&#]+)/i)
  if (pathMatch && pathMatch[1]) return pathMatch[1]

  // Query / fragment param: ?ref= | &ref= | ?referral= | &referral= | /referral=
  const paramMatch = hash.match(/[/?&]ref(?:erral)?=([^/?&#]+)/i) ?? href.match(/[/?&]ref(?:erral)?=([^/?&#]+)/i)
  if (paramMatch && paramMatch[1]) return paramMatch[1]

  return null
}

/**
 * Returns the referrer code or address for the current session.
 *
 * Priority:
 *  1. A valid referral code/address found in the current URL (persisted to localStorage with 1-day TTL)
 *  2. A previously persisted referral code/address from localStorage (if not expired)
 *
 * Self-referral is automatically excluded: if the stored referral equals
 * `currentAccount` (case-insensitive Ethereum address comparison) it is ignored and null is returned.
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

  // Never return self-referral (if the referral is an Ethereum address matching current account)
  if (
    referer &&
    currentAccount &&
    ETH_ADDRESS_RE.test(referer) &&
    referer.toLowerCase() === currentAccount.toLowerCase()
  ) {
    return null
  }
  return referer
}
