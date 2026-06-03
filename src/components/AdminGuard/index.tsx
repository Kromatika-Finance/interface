import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { usePasskeyAuth } from 'hooks/usePasskeyAuth'
import { ReactNode, useCallback, useState } from 'react'
import { AlertCircle, Key } from 'react-feather'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'

const GuardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
  text-align: center;
`

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};
`

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.red1 : theme.bg3)};
  background: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text1};
  font-size: 16px;
  font-weight: 500;
  outline: none;
  transition: border-color 150ms ease;

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }

  :focus {
    border-color: ${({ theme, hasError }) => (hasError ? theme.red1 : theme.primary1)};
  }
`

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  background: ${({ theme }) => `${theme.red1}15`};
  color: ${({ theme }) => theme.red1};
  font-size: 13px;
  width: 100%;
  text-align: left;
`

interface AdminGuardProps {
  children: ReactNode | ((passkey: string) => ReactNode)
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAuthenticating, error, passkey: storedPasskey, authenticate } = usePasskeyAuth()
  const [inputValue, setInputValue] = useState('')
  const [rejected, setRejected] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const MAX_ATTEMPTS = 5

  const handleSubmit = useCallback(async () => {
    const success = await authenticate(inputValue)
    if (!success) {
      const next = attempts + 1
      setAttempts(next)
      if (next >= MAX_ATTEMPTS) {
        setRejected(true)
      }
    }
  }, [authenticate, inputValue, attempts])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isAuthenticating) {
        handleSubmit()
      }
    },
    [handleSubmit, isAuthenticating]
  )

  if (rejected) {
    return <Redirect to="/swap" />
  }

  if (isAuthenticated && storedPasskey) {
    return <>{typeof children === 'function' ? children(storedPasskey) : children}</>
  }

  return (
    <GuardWrapper>
      <IconWrapper>
        <Key size={28} />
      </IconWrapper>
      <AutoColumn gap="sm" justify="center">
        <TYPE.mediumHeader>
          <Trans>Admin Authentication</Trans>
        </TYPE.mediumHeader>
        <TYPE.body color="text3" fontSize={14}>
          <Trans>Enter the admin auth key to access the dashboard.</Trans>
        </TYPE.body>
      </AutoColumn>

      <InputWrapper>
        <StyledInput
          type="password"
          placeholder="Auth key"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          hasError={!!error}
          autoFocus
          autoComplete="off"
        />

        {error && (
          <ErrorBox>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap', opacity: 0.7 }}>
                {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} left
              </span>
            )}
          </ErrorBox>
        )}

        <ButtonPrimary onClick={handleSubmit} disabled={isAuthenticating || !inputValue.trim()}>
          {isAuthenticating ? <Trans>Verifying...</Trans> : <Trans>Authenticate</Trans>}
        </ButtonPrimary>
      </InputWrapper>
    </GuardWrapper>
  )
}
