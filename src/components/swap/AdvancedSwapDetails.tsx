import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Price, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { LoadingRows } from 'components/Loader/styled'

import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import { TransactionDetailsLabel } from './styleds'

interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  serviceFee: CurrencyAmount<Currency> | undefined
  priceAmount: Price<Currency, Currency> | undefined
  syncing?: boolean
  outputAmount: CurrencyAmount<Currency> | undefined
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

export function AdvancedSwapDetails({
  trade,
  serviceFee,
  outputAmount,
  priceAmount,
  syncing = false,
}: AdvancedSwapDetailsProps) {
  return trade && priceAmount ? (
    <AutoColumn gap="8px">
      <TransactionDetailsLabel fontWeight={400} fontSize={14}>
        <Trans>Transaction Details</Trans>
      </TransactionDetailsLabel>
      <RowBetween>
        <RowFixed>
          <TYPE.darkGray fontSize={14}>
            <Trans>Service Fee</Trans>
          </TYPE.darkGray>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <TYPE.darkGray textAlign="right" fontSize={14}>
            {serviceFee ? `${serviceFee.toSignificant(8)} ${serviceFee.currency.symbol}` : '-'}
          </TYPE.darkGray>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <TYPE.darkGray fontSize={14}>
            <Trans>Minimum received</Trans>
          </TYPE.darkGray>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <TYPE.darkGray textAlign="right" fontSize={14}>
            {outputAmount?.toSignificant(6)} {outputAmount?.currency.symbol}
          </TYPE.darkGray>
        </TextWithLoadingPlaceholder>
      </RowBetween>
    </AutoColumn>
  ) : null
}
