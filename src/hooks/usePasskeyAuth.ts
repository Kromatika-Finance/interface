import { useCallback, useEffect, useState } from 'react'
import { verifyPasskey } from 'utils/adminApi'

const STORAGE_KEY = 'admin_passkey'
const STORAGE_EXPIRY_KEY = 'admin_passkey_expiry'
const TTL_MS = 60 * 60 * 1000 // 1 hour

function getStoredPasskey(): string | null {
  const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY)
  if (!expiry || Date.now() > Number(expiry)) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_EXPIRY_KEY)
    return null
  }
  return localStorage.getItem(STORAGE_KEY)
}

function storePasskey(passkey: string) {
  localStorage.setItem(STORAGE_KEY, passkey)
  localStorage.setItem(STORAGE_EXPIRY_KEY, String(Date.now() + TTL_MS))
}

function clearStoredPasskey() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_EXPIRY_KEY)
}

interface PasskeyAuthState {
  isAuthenticated: boolean
  isAuthenticating: boolean
  error: string | null
  passkey: string | null
  authenticate: (passkey: string) => Promise<boolean>
}

export function usePasskeyAuth(): PasskeyAuthState {
  const [storedPasskey, setStoredPasskey] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = getStoredPasskey()
    if (saved) {
      setStoredPasskey(saved)
      setIsAuthenticated(true)
    }
  }, [])

  const authenticate = useCallback(async (passkey: string): Promise<boolean> => {
    if (!passkey.trim()) {
      setError('Please enter an auth key')
      return false
    }

    setIsAuthenticating(true)
    setError(null)

    try {
      const valid = await verifyPasskey(passkey)
      if (valid) {
        storePasskey(passkey)
        setStoredPasskey(passkey)
        setIsAuthenticated(true)
        return true
      }
      setError('Invalid auth key')
      return false
    } catch (err: any) {
      setError(err?.message ?? 'Verification failed')
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  return { isAuthenticated, isAuthenticating, error, passkey: storedPasskey, authenticate }
}

export { clearStoredPasskey }
