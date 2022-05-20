import { formatEther, formatUnits } from '@ethersproject/units'
import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Price, Rounding, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { LoadingRows } from 'components/Loader/styled'
import { useContext, useMemo } from 'react'
import { useNetworkGasPrice } from 'state/user/hooks'
import { ThemeContext } from 'styled-components/macro'

import { TYPE } from '../../theme'
import { computeRealizedLPFeePercent } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { TransactionDetailsLabel } from './styleds'

interface AdvancedSwapDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  serviceFee: CurrencyAmount<Currency> | undefined
  priceAmount: Price<Currency, Currency> | undefined
  syncing?: boolean
  outputAmount: CurrencyAmount<Currency> | undefined
}

function commafy(num: number | string | undefined) {
  if (num == undefined) return undefined
  const str = num.toString().split('.')
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }
  return str.join('.')
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
  const theme = useContext(ThemeContext)

  const gasAmount = useNetworkGasPrice()

  const renderPrice = (price: CurrencyAmount<Currency>) => {
    const number = +price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP)
    if (number < 0.1) return commafy(price.toSignificant(1, undefined, Rounding.ROUND_HALF_UP))

    if (number < 1) return commafy(price.toSignificant(2, undefined, Rounding.ROUND_HALF_UP))

    if (number < 10) return commafy(price.toSignificant(3, undefined, Rounding.ROUND_HALF_UP))

    if (number < 100) return commafy(price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP))

    if (number < 1000) return commafy(price.toSignificant(5, undefined, Rounding.ROUND_HALF_UP))

    if (number < 10000) return commafy(price.toSignificant(6, undefined, Rounding.ROUND_HALF_UP))

    if (number < 100000) return commafy(price.toSignificant(7, undefined, Rounding.ROUND_HALF_UP))

    return commafy(price.toSignificant(6, undefined, Rounding.ROUND_HALF_UP))
  }

  return trade && priceAmount ? (
    <AutoColumn gap="8px">
      <TransactionDetailsLabel fontWeight={500} fontSize={14}>
        <Trans>Transaction Details</Trans>
      </TransactionDetailsLabel>
      <RowBetween>
        <RowFixed>
          <TYPE.subHeader color={theme.text1}>
            <Trans>Service Fee</Trans>
          </TYPE.subHeader>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <TYPE.black textAlign="right" fontSize={14}>
            {serviceFee ? `${renderPrice(serviceFee)} ${serviceFee.currency.symbol}` : '-'}
          </TYPE.black>
        </TextWithLoadingPlaceholder>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.subHeader color={theme.text1}>
            <Trans>Minimum received</Trans>
          </TYPE.subHeader>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <TYPE.black textAlign="right" fontSize={14}>
            {outputAmount && renderPrice(outputAmount)} {outputAmount?.currency.symbol}
          </TYPE.black>
        </TextWithLoadingPlaceholder>
      </RowBetween>
    </AutoColumn>
  ) : null
}
