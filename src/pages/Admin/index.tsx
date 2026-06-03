import { Trans } from '@lingui/macro'
import AdminGuard from 'components/AdminGuard'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, BarChart2, DollarSign, Hash, TrendingUp, Users } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'
import { shortenAddress } from 'utils'
import { AdminDashboardData, getAdminDashboardData } from 'utils/adminApi'

// ─── Styled Components ───────────────────────────────────────────────────────

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 960px;
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
  margin-bottom: 1.5rem;
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
  gap: 6px;
`

const StatIconRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const StatIconWrapper = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ color }) => (color ? `${color}18` : 'transparent')};
  color: ${({ color, theme }) => color ?? theme.text3};
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

const RankBadge = styled.span<{ rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ theme, rank }) =>
    rank === 1 ? `${theme.yellow2}30` : rank === 2 ? `${theme.text3}20` : rank === 3 ? '#CD7F3220' : theme.bg2};
  color: ${({ theme, rank }) =>
    rank === 1 ? theme.yellow2 : rank === 2 ? theme.text3 : rank === 3 ? '#CD7F32' : theme.text2};
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

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 0;
`

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`

const RetryButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.primary1};
  border-radius: 10px;
  padding: 8px 20px;
  color: ${({ theme }) => theme.primary1};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  :hover {
    background: ${({ theme }) => theme.primary1}15;
  }
`

// ─── Component ────────────────────────────────────────────────────────────────

function AdminDashboardContent({ passkey }: { passkey: string }) {
  const { account } = useActiveWeb3React()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminDashboardData(passkey, account ?? '')
      setDashboardData(data)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [passkey, account])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const highAchievers: string[] = useMemo(() => {
    return dashboardData?.highAchievers ?? []
  }, [dashboardData])

  useEffect(() => {
    setCurrentPage(1)
  }, [highAchievers, rowsPerPage])

  const totalPages = Math.max(1, Math.ceil(highAchievers.length / rowsPerPage))
  const paginatedAchievers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return highAchievers.slice(start, start + rowsPerPage)
  }, [highAchievers, currentPage, rowsPerPage])

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

  const formatCurrency = (value: number) =>
    `$${(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatNumber = (value: number) => (value ?? 0).toLocaleString()

  if (isLoading) {
    return (
      <LoadingWrapper>
        <Loader size="32px" />
        <TYPE.body color="text3">
          <Trans>Loading dashboard data...</Trans>
        </TYPE.body>
      </LoadingWrapper>
    )
  }

  if (error || !dashboardData) {
    return (
      <ErrorWrapper>
        <TYPE.body color="text3">{error ?? 'Something went wrong'}</TYPE.body>
        <RetryButton onClick={fetchData}>
          <Trans>Retry</Trans>
        </RetryButton>
      </ErrorWrapper>
    )
  }

  return (
    <>
      {/* ── Overview Stats ── */}
      <SectionCard>
        <RowBetween align="flex-start">
          <AutoColumn gap="4px">
            <SectionTitle>
              <Trans>Program Overview</Trans>
            </SectionTitle>
            <SectionSubtitle>
              <Trans>Aggregate metrics for the referral program.</Trans>
            </SectionSubtitle>
          </AutoColumn>
        </RowBetween>

        <StatsGrid>
          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Referrers</Trans>
              </StatLabel>
              <StatIconWrapper color="#6C5CE7">
                <Users size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatNumber(dashboardData.numberOfReferrers)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Active Addresses</Trans>
              </StatLabel>
              <StatIconWrapper color="#00B894">
                <Activity size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatNumber(dashboardData.activeAddresses)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Total Volume</Trans>
              </StatLabel>
              <StatIconWrapper color="#0984E3">
                <DollarSign size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatCurrency(dashboardData.totalVolume)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Successful Txns</Trans>
              </StatLabel>
              <StatIconWrapper color="#00B894">
                <Hash size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatNumber(dashboardData.successfulTransactions)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Failed Txns</Trans>
              </StatLabel>
              <StatIconWrapper color="#D63031">
                <Hash size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatNumber(dashboardData.failedTransactions)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Remaining OP</Trans>
              </StatLabel>
              <StatIconWrapper color="#E17055">
                <BarChart2 size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{formatNumber(dashboardData.remainingOp)}</StatValue>
          </StatCard>

          <StatCard>
            <StatIconRow>
              <StatLabel>
                <Trans>Profitability</Trans>
              </StatLabel>
              <StatIconWrapper color="#00CEC9">
                <TrendingUp size={16} />
              </StatIconWrapper>
            </StatIconRow>
            <StatValue>{dashboardData.profitabilityMetric || '—'}</StatValue>
          </StatCard>
        </StatsGrid>
      </SectionCard>

      {/* ── High Achievers Table ── */}
      <SectionCard>
        <AutoColumn gap="4px" style={{ marginBottom: '1.25rem' }}>
          <SectionTitle>
            <Trans>Top Referrers</Trans>
          </SectionTitle>
          <SectionSubtitle>
            <Trans>Referrers ranked by earned rewards.</Trans>
          </SectionSubtitle>
        </AutoColumn>

        <TableWrapper>
          <StyledTable>
            <TableHead>
              <tr>
                <TableHeaderCell>
                  <Trans>Rank</Trans>
                </TableHeaderCell>
                <TableHeaderCell>
                  <Trans>Address</Trans>
                </TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {highAchievers.length === 0 ? (
                <EmptyTableRow>
                  <EmptyTableCell colSpan={2}>
                    <AutoColumn justify="center" style={{ gap: '8px' }}>
                      <TYPE.body color="text3">
                        <Trans>No referrer data available yet.</Trans>
                      </TYPE.body>
                    </AutoColumn>
                  </EmptyTableCell>
                </EmptyTableRow>
              ) : (
                paginatedAchievers.map((address, index) => {
                  const rank = (currentPage - 1) * rowsPerPage + index + 1
                  return (
                    <TableRow key={address}>
                      <TableCell>
                        <RankBadge rank={rank}>{rank}</RankBadge>
                      </TableCell>
                      <TableCell>
                        <Text fontSize={13} fontFamily="monospace">
                          {shortenAddress(address)}
                        </Text>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </StyledTable>
        </TableWrapper>

        {highAchievers.length > 0 && (
          <PaginationRow>
            <PaginationInfo>
              {(() => {
                const start = (currentPage - 1) * rowsPerPage + 1
                const end = Math.min(currentPage * rowsPerPage, highAchievers.length)
                return `${start}–${end} of ${highAchievers.length}`
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
    </>
  )
}

export default function Admin() {
  return (
    <PageWrapper>
      <AdminGuard>{(passkey) => <AdminDashboardContent passkey={passkey} />}</AdminGuard>
    </PageWrapper>
  )
}
