import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { MouseoverTooltip } from 'components/Tooltip'
import { KROM } from 'constants/tokens'
import { useNewStakingContract } from 'hooks/useContract'
import JSBI from 'jsbi'
import { useState } from 'react'
import { HelpCircle } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import { useSingleCallResult } from 'state/multicall/hooks'
import styled from 'styled-components/macro'
import Web3 from 'web3-utils'

import { useTotalSupply } from '../../hooks/useTotalSupply'
import { useActiveWeb3React } from '../../hooks/web3'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TYPE } from '../../theme'
import { unwrappedToken } from '../../utils/unwrappedToken'
import { ButtonBlock, ButtonErrorStyle } from '../Button'
import { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import DoubleCurrencyLogo from '../DoubleLogo'
import { CardBGImage, CardNoise, CardSection, DataCard } from '../earn/styled'
import { RowBetween, RowFixed } from '../Row'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`
const AccountStatusWrapper = styled(AutoColumn)`
  width: 480px;
  max-width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
  `};
`

const AccountStatusCard = styled(AutoColumn)`
  background-color: ${({ theme }) => theme.bg1};
  border: 3px solid ${({ theme }) => theme.bg2};
  border-radius: 20px;
  overflow: hidden;
  padding: 48px;
`

const DepositRequiredButton = styled(ButtonErrorStyle)``

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: CurrencyAmount<Token> // optional balance to indicate that liquidity is deposited in mining pool
}

interface FundingCardProps {
  fundingBalance?: CurrencyAmount<Token>
  minBalance?: CurrencyAmount<Token>
  gasPrice?: CurrencyAmount<Currency>
}

export function MinimalPositionCard({ pair, showUnwrapped = false, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance &&
    !!totalPoolTokens &&
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? new Percent(userPoolBalance.quotient, totalPoolTokens.quotient)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.quotient, userPoolBalance.quotient)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false),
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.quotient, JSBI.BigInt(0)) ? (
        <GreyCard border={border}>
          <AutoColumn gap="12px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontWeight={400} fontSize={[10, 14, 20]}>
                  <Trans>Your position</Trans>
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow onClick={() => setShowMore(!showMore)}>
              <RowFixed>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Text fontWeight={400} fontSize={[10, 14, 20]}>
                  {currency0.symbol}/{currency1.symbol}
                </Text>
              </RowFixed>
              <RowFixed>
                <Text fontWeight={400} fontSize={[10, 14, 20]}>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Text>
              </RowFixed>
            </FixedHeightRow>
            <AutoColumn gap="4px">
              <FixedHeightRow>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  <Trans>Your pool share:</Trans>
                </Text>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                </Text>
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  {currency0.symbol}:
                </Text>
                {token0Deposited ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      {token0Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  {currency1.symbol}:
                </Text>
                {token1Deposited ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      {token1Deposited?.toSignificant(6)}
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      ) : (
        <LightCard>
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            <span role="img" aria-label="wizard-icon">
              ⭐️
            </span>{' '}
            <Trans>
              By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the
              pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
            </Trans>{' '}
          </TYPE.subHeader>
        </LightCard>
      )}
    </>
  )
}

export default function FullPositionCard({ fundingBalance, minBalance, gasPrice }: FundingCardProps) {
  const { chainId } = useActiveWeb3React()
  const kromToken = chainId ? KROM[chainId] : undefined
  const isUnderfunded = fundingBalance ? !minBalance?.lessThan(fundingBalance?.quotient) : true

  return (
    <AccountStatusWrapper gap="10px">
      <AccountStatusCard>
        <AutoColumn gap="20px">
          <AutoColumn gap="5px">
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  <TYPE.darkGray>
                    <Trans>Account Status:</Trans>
                  </TYPE.darkGray>
                </Text>
              </RowFixed>
              <RowFixed>
                <MouseoverTooltip
                  text={
                    <Trans>
                      Please deposit KROM up to the minimum balance. Recommendation is to deposit at least twice the
                      minimum balance.
                    </Trans>
                  }
                >
                  <HelpCircle size="24" color={'white'} style={{ marginLeft: '8px' }} />
                </MouseoverTooltip>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow>
              {isUnderfunded ? (
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={500}>
                    <TYPE.error error>KROM deposit required</TYPE.error>
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
            <RowFixed>
              <DepositRequiredButton as={Link} to={`/add/${kromToken?.address}`}>
                <Text fontSize={[10, 14, 20]} fontWeight={700}>
                  <Trans>Deposit</Trans>
                </Text>
              </DepositRequiredButton>
            </RowFixed>
          </AutoColumn>
          <AutoColumn>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  <TYPE.darkGray>
                    <Trans>Deposit Balance:</Trans>
                  </TYPE.darkGray>
                </Text>
              </RowFixed>
              <RowFixed>
                <MouseoverTooltip
                  text={
                    <Trans>
                      Your account is actively processing trades. Recommendation is to deposit at least twice the
                      minimum minimum balance.
                    </Trans>
                  }
                >
                  <HelpCircle size="24" color={'white'} style={{ marginLeft: '8px' }} />
                </MouseoverTooltip>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow>
              {fundingBalance ? (
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={500}>
                    <TYPE.white>
                      {fundingBalance?.toSignificant(6)} {fundingBalance?.currency.symbol}
                    </TYPE.white>
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
          </AutoColumn>
          <AutoColumn>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  <TYPE.darkGray>
                    <Trans>Minimum Balance:</Trans>
                  </TYPE.darkGray>
                </Text>
              </RowFixed>
              <RowFixed>
                <MouseoverTooltip
                  text={
                    <Trans>
                      You will need to maintain a minimum KROM balance to cover for the service fees. Recommendation is
                      is to deposit at least twice the minimum balance.
                    </Trans>
                  }
                >
                  <HelpCircle size="24" color={'white'} style={{ marginLeft: '8px' }} />
                </MouseoverTooltip>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow>
              {fundingBalance ? (
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={500}>
                    <TYPE.white>
                      {minBalance?.toSignificant(6)} {minBalance?.currency.symbol}
                    </TYPE.white>
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
          </AutoColumn>
          <AutoColumn>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={[10, 14, 20]} fontWeight={400}>
                  <TYPE.darkGray>
                    <Trans>Total LP Fees Earned:</Trans>
                  </TYPE.darkGray>
                </Text>
              </RowFixed>
              <RowFixed>
                <MouseoverTooltip text={<Trans>The total amount of LP fees earned as a liquidity provider</Trans>}>
                  <HelpCircle size="24" color={'white'} style={{ marginLeft: '8px' }} />
                </MouseoverTooltip>
              </RowFixed>
            </FixedHeightRow>
            <FixedHeightRow>
              {fundingBalance ? (
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={500}>
                    <TYPE.purple>
                      {/* TODO: Show Total Fees Earned */}
                      {minBalance?.toSignificant(6)} {minBalance?.currency.symbol}
                    </TYPE.purple>
                  </Text>
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>
          </AutoColumn>
        </AutoColumn>
      </AccountStatusCard>
      <ButtonBlock as={Link} to={`/add/${kromToken?.address}/remove`}>
        <Text fontSize={[10, 14, 20]} fontWeight={700}>
          <Trans>Withdraw KROM</Trans>
        </Text>
      </ButtonBlock>
    </AccountStatusWrapper>
  )
}

export function StakePositionCard({ fundingBalance, minBalance, gasPrice }: FundingCardProps) {
  const stakeManager = useNewStakingContract()
  const showMore = true

  const { account } = useActiveWeb3React()

  let result = useSingleCallResult(stakeManager, 'getEarnedSKrom', [account?.toString()])
  const earnedBalance = result.result ? Web3.fromWei(result.result.toString()) : ''

  result = useSingleCallResult(stakeManager, 'getDepositedAmount', [account?.toString()])
  const stakedBalance = result.result ? Web3.fromWei(result.result.toString()) : ''

  result = useSingleCallResult(stakeManager, 'supplyInWarmup', [])
  const totalValueLocked = result.result ? Web3.fromWei(result.result.toString()) : ''

  return (
    <VoteCard>
      <CardBGImage />
      <CardNoise />
      <CardSection>
        <AutoColumn gap="md">
          <FixedHeightRow>
            <RowFixed gap="2px" style={{ marginRight: '10px' }} />
          </FixedHeightRow>

          {showMore && (
            <AutoColumn gap="8px">
              <FixedHeightRow>
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={400}>
                    <TYPE.white>
                      <Trans>Staked Balance:</Trans>
                    </TYPE.white>
                  </Text>
                </RowFixed>
                {stakedBalance != null ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      <TYPE.white>{stakedBalance} KROM</TYPE.white>
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={400}>
                    <TYPE.white>
                      <Trans>Earned Balance:</Trans>
                    </TYPE.white>
                  </Text>
                </RowFixed>
                {earnedBalance ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      <TYPE.white>{earnedBalance} KROM </TYPE.white>
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={400}>
                    <TYPE.white>
                      <Trans>APY:</Trans>
                    </TYPE.white>
                  </Text>
                  <MouseoverTooltip
                    text={
                      <Trans>
                        APY is calculated as participating percentage in the total value staked. The APY percentage is
                        therefore applied on total amount collected in the Fee Treasury.
                      </Trans>
                    }
                  >
                    <HelpCircle size="24" color={'white'} style={{ marginLeft: '8px' }} />
                  </MouseoverTooltip>
                </RowFixed>
                {fundingBalance ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      <TYPE.white>
                        {fundingBalance?.toSignificant(6)} {fundingBalance?.currency.symbol}
                      </TYPE.white>
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
              <FixedHeightRow>
                <RowFixed>
                  <Text fontSize={[10, 14, 20]} fontWeight={400}>
                    <TYPE.white>
                      <Trans>Total Value Locked:</Trans>
                    </TYPE.white>
                  </Text>
                </RowFixed>
                {totalValueLocked != null ? (
                  <RowFixed>
                    <Text fontSize={[10, 14, 20]} fontWeight={400} marginLeft={'6px'}>
                      <TYPE.white>{totalValueLocked} KROM</TYPE.white>
                    </Text>
                  </RowFixed>
                ) : (
                  '-'
                )}
              </FixedHeightRow>
            </AutoColumn>
          )}
        </AutoColumn>
      </CardSection>
    </VoteCard>
  )
}

function setCollectMigrationHash(hash: any) {
  throw new Error('Function not implemented.')
}

function setCollecting(arg0: boolean) {
  throw new Error('Function not implemented.')
}
