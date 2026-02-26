import { Trans } from '@lingui/macro'
import { ButtonLight, ButtonPrimary } from 'components/Button'
import { GreyCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import Row, { RowBetween } from 'components/Row'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Copy, ExternalLink } from 'react-feather'
import { Text } from 'rebass'
import { useWalletModalToggle } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'
import { shortenAddress } from 'utils'
import { checkReferrer, getReferrerStats, ReferrerTransaction, registerReferrer } from 'utils/metadexApi'

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 800px;
  padding: 1.5rem 1rem 8rem 1rem;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 1rem 8rem 1rem;
  `};
`

const SectionCard = styled.div`
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 12px 6px ${({ theme }) => theme.shadow2};
  border-radius: 20px;
  width: 100%;
  padding: 1.5rem;
`

const SectionTitle = styled(Text)`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 0.25rem;
`

const SectionSubtitle = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.text2};
  margin-top: 0.5rem;
  margin-bottom: 2rem;
`

const StatusBadge = styled.div<{ variant: 'success' | 'warning' | 'idle' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  background-color: ${({ theme, variant }) =>
    variant === 'success' ? `${theme.green1}22` : variant === 'warning' ? `${theme.red1}22` : theme.bg2};
  color: ${({ theme, variant }) =>
    variant === 'success' ? theme.green1 : variant === 'warning' ? theme.red1 : theme.text2};
`

const ReferralLinkBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg2};
  border-radius: 12px;
  padding: 10px 14px;
  gap: 10px;
  margin-top: 1rem;
`

const ReferralLinkText = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.text2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 10px;
  padding: 5px 12px;
  color: ${({ theme }) => theme.primary1};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  :hover {
    background: ${({ theme }) => theme.primary1}22;
  }
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${({ theme }) => theme.bg3};
  margin: 0.4rem 0;
`

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`

const TableHead = styled.thead``

const TableBody = styled.tbody``

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.bg3};

  :last-child {
    border-bottom: none;
  }

  :hover td {
    background: ${({ theme }) => theme.bg2};
  }
`

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 10px 12px;
  color: ${({ theme }) => theme.text3};
  font-weight: 500;
  font-size: 13px;
  white-space: nowrap;
`

const TableCell = styled.td`
  padding: 12px 12px;
  color: ${({ theme }) => theme.text2};
  white-space: nowrap;
`

const EmptyTableRow = styled.tr``

const EmptyTableCell = styled.td`
  padding: 2.5rem 0;
  text-align: center;
  color: ${({ theme }) => theme.text3};
  font-size: 14px;
`

const TxLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.primary1};
  text-decoration: none;
  font-size: 13px;

  :hover {
    text-decoration: underline;
  }
`

const PaginationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`

const PaginationInfo = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.text3};
`

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const PageButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme, active }) => (active ? theme.primary1 : theme.bg3)};
  background: ${({ theme, active }) => (active ? `${theme.primary1}22` : 'transparent')};
  color: ${({ theme, active }) => (active ? theme.primary1 : theme.text2)};
  font-size: 13px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  cursor: pointer;

  :hover:not(:disabled) {
    border-color: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.primary1};
  }

  :disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`

const RowsPerPageSelect = styled.select`
  background: ${({ theme }) => theme.bg2};
  border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 8px;
  color: ${({ theme }) => theme.text2};
  font-size: 13px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;

  :hover {
    border-color: ${({ theme }) => theme.primary1};
  }
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
  `};
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.bg2};
  border-radius: 14px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatLabel = styled(Text)`
  font-size: 12px;
  color: ${({ theme }) => theme.text3};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const StatValue = styled(Text)`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function Referral() {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [transactions, setTransactions] = useState<ReferrerTransaction[]>([])
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [totalRewards, setTotalRewards] = useState<number>(0)
  const [cumulativeVolume, setCumulativeVolume] = useState<number>(0)
  const [isFetchingStats, setIsFetchingStats] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  useEffect(() => {
    let cancelled = false
    setIsCheckingRegistration(true)
    checkReferrer(account ?? '')
      .then((result) => {
        if (result.isReferrer) setIsRegistered(true)
        else setIsRegistered(false)
      })
      .catch(() => {
        if (!cancelled) setIsRegistered(false)
      })
      .finally(() => {
        if (!cancelled) setIsCheckingRegistration(false)
      })
    return () => {
      cancelled = true
    }
  }, [account])

  useEffect(() => {
    if (!account) return
    let cancelled = false
    setIsFetchingStats(true)
    getReferrerStats(account)
      .then((data) => {
        if (cancelled) return
        const s = data.stats
        setTransactions(s.referredTransactions ?? [])
        setTotalReferrals(s.referredUsers ?? 0)
        setTotalRewards(s.earnedRewards ?? 0)
        setCumulativeVolume(s.cumulativeVolume ?? 0)
      })
      .catch(() => {
        if (!cancelled) setTransactions([])
      })
      .finally(() => {
        if (!cancelled) setIsFetchingStats(false)
      })
    return () => {
      cancelled = true
    }
  }, [account])

  const referralLink = account ? `${window.location.origin}/swap/r/${account}` : ''

  const handleRegister = useCallback(async () => {
    if (!account) return
    setIsRegistering(true)
    setRegisterError(null)
    try {
      await registerReferrer(account)
      setIsRegistered(true)
    } catch (err: any) {
      setRegisterError(err?.message ?? 'Registration failed. Please try again.')
    } finally {
      setIsRegistering(false)
    }
  }, [account])

  const handleCopy = useCallback(() => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }, [referralLink])

  // Reset to first page whenever the dataset or page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [transactions, rowsPerPage])

  const totalPages = Math.max(1, Math.ceil(transactions.length / rowsPerPage))
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return transactions.slice(start, start + rowsPerPage)
  }, [transactions, currentPage, rowsPerPage])

  const pageNumbers = useMemo(() => {
    const delta = 2
    const pages: (number | '...')[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }, [totalPages, currentPage])

  return (
    <PageWrapper>
      {/* ── Registration Card ── */}
      <SectionCard>
        <RowBetween align="flex-start">
          <AutoColumn gap="4px">
            <SectionTitle>
              <Trans>Referral Program</Trans>
            </SectionTitle>
            <SectionSubtitle>
              <Trans>Invite friends and earn rewards on their trades.</Trans>
            </SectionSubtitle>
          </AutoColumn>
          {account && (
            <StatusBadge variant={isRegistered ? 'success' : 'idle'}>
              {isCheckingRegistration ? (
                <Trans>Checking...</Trans>
              ) : isRegistered ? (
                <>
                  <CheckCircle size={13} />
                  <Trans>Registered</Trans>
                </>
              ) : (
                <Trans>Not registered</Trans>
              )}
            </StatusBadge>
          )}
        </RowBetween>

        {!account ? (
          <ConnectWalletWrapper>
            <TYPE.body color="text3">
              <Trans>Connect your wallet to join the referral program.</Trans>
            </TYPE.body>
            <ButtonLight onClick={toggleWalletModal} style={{ width: 'fit-content', padding: '10px 28px' }}>
              <Trans>Connect Wallet</Trans>
            </ButtonLight>
          </ConnectWalletWrapper>
        ) : (
          <AutoColumn gap="md">
            <StatsGrid>
              <StatCard>
                <StatLabel>
                  <Trans>Total Referrals</Trans>
                </StatLabel>
                <StatValue>{isFetchingStats ? '—' : totalReferrals}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>
                  <Trans>Total Volume</Trans>
                </StatLabel>
                <StatValue>
                  {isFetchingStats
                    ? '—'
                    : `$${Number(cumulativeVolume).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`}
                </StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>
                  <Trans>Rewards</Trans>
                </StatLabel>
                <StatValue>{isFetchingStats ? '—' : `${totalRewards} points`}</StatValue>
              </StatCard>
            </StatsGrid>

            <Divider />

            {isCheckingRegistration ? (
              <TYPE.body color="text3" fontSize={14}>
                <Trans>Checking registration status...</Trans>
              </TYPE.body>
            ) : !isRegistered ? (
              <AutoColumn gap="sm">
                <TYPE.body color="text2" fontSize={14}>
                  <Trans>
                    Register once to activate your referral link and start earning rewards when your referees trade on
                    Kromatika.
                  </Trans>
                </TYPE.body>
                {registerError && (
                  <GreyCard style={{ padding: '10px 14px' }}>
                    <Row style={{ gap: '6px' }}>
                      <AlertCircle size={14} color="#FF4343" />
                      <TYPE.small color="red1">{registerError}</TYPE.small>
                    </Row>
                  </GreyCard>
                )}
                <ButtonPrimary onClick={handleRegister} disabled={isRegistering} style={{ marginTop: '0.25rem' }}>
                  {isRegistering ? <Trans>Registering...</Trans> : <Trans>Register</Trans>}
                </ButtonPrimary>
              </AutoColumn>
            ) : (
              <AutoColumn gap="sm">
                <TYPE.body color="text2" fontSize={14}>
                  <Trans>Share your referral link to start earning rewards.</Trans>
                </TYPE.body>
                <ReferralLinkBox>
                  <ReferralLinkText>{referralLink}</ReferralLinkText>
                  <CopyButton onClick={handleCopy}>
                    <Copy size={13} />
                    {copied ? <Trans>Copied!</Trans> : <Trans>Copy</Trans>}
                  </CopyButton>
                </ReferralLinkBox>
              </AutoColumn>
            )}
          </AutoColumn>
        )}
      </SectionCard>

      {/* ── Transactions Table Card ── */}
      <SectionCard>
        <AutoColumn gap="4px" style={{ marginBottom: '1.25rem' }}>
          <SectionTitle>
            <Trans>Referral Transactions</Trans>
          </SectionTitle>
          <SectionSubtitle>
            <Trans>History of trades made by your referees.</Trans>
          </SectionSubtitle>
        </AutoColumn>

        <TableWrapper>
          <StyledTable>
            <TableHead>
              <tr>
                <TableHeaderCell>
                  <Trans>Date</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Referee</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Action</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Volume</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Token</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Tx</Trans>
                </TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {isFetchingStats ? (
                <EmptyTableRow>
                  <EmptyTableCell colSpan={6}>
                    <TYPE.body color="text3">
                      <Trans>Loading transactions...</Trans>
                    </TYPE.body>
                  </EmptyTableCell>
                </EmptyTableRow>
              ) : transactions.length === 0 ? (
                <EmptyTableRow>
                  <EmptyTableCell colSpan={6}>
                    <AutoColumn justify="center" style={{ gap: '8px' }}>
                      <TYPE.body color="text3">
                        <Trans>No referral transactions yet.</Trans>
                      </TYPE.body>
                      <TYPE.small color="text3">
                        <Trans>Transactions from your referees will appear here.</Trans>
                      </TYPE.small>
                    </AutoColumn>
                  </EmptyTableCell>
                </EmptyTableRow>
              ) : (
                paginatedTransactions.map((tx) => {
                  const date = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : '—'
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>{date}</TableCell>
                      <TableCell>
                        <Text fontSize={13} fontFamily="monospace">
                          {tx.from ? shortenAddress(tx.from) : '—'}
                        </Text>
                      </TableCell>
                      <TableCell>{tx.status ?? '—'}</TableCell>
                      <TableCell>
                        <Text fontSize={13} fontWeight={500}>
                          {tx.volume != null
                            ? `$${Number(tx.volume).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : '—'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text fontSize={13} fontFamily="monospace">
                          {tx.tokenFrom ? shortenAddress(tx.tokenFrom) : '—'}
                        </Text>
                      </TableCell>
                      <TableCell>
                        {tx.transaction_hash ? (
                          <TxLink
                            href={`https://optimistic.etherscan.io/tx/${tx.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.transaction_hash.slice(0, 8)}…
                            <ExternalLink size={12} />
                          </TxLink>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </StyledTable>
        </TableWrapper>

        {transactions.length > 0 && (
          <PaginationRow>
            <PaginationInfo>
              {(() => {
                const start = (currentPage - 1) * rowsPerPage + 1
                const end = Math.min(currentPage * rowsPerPage, transactions.length)
                return `${start}–${end} of ${transactions.length}`
              })()}
            </PaginationInfo>

            <PaginationControls>
              <PageButton onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                ‹
              </PageButton>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <PageButton key={`ellipsis-${i}`} disabled>
                    …
                  </PageButton>
                ) : (
                  <PageButton key={p} active={p === currentPage} onClick={() => setCurrentPage(p as number)}>
                    {p}
                  </PageButton>
                )
              )}
              <PageButton onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                ›
              </PageButton>
            </PaginationControls>

            <RowsPerPageSelect value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </RowsPerPageSelect>
          </PaginationRow>
        )}
      </SectionCard>
    </PageWrapper>
  )
}
