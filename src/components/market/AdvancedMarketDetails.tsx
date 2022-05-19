import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Rounding, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { LoadingRows } from 'components/Loader/styled'
import { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components/macro'

import { TYPE } from '../../theme'
import { computeRealizedLPFeePercent } from '../../utils/prices'
import { AutoColumn } from '../Column'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from '../swap/FormattedPriceImpact'
import { TransactionDetailsLabel } from './styleds'

interface AdvancedMarketDetailsProps {
  trade?: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  allowedSlippage: Percent
  syncing?: boolean
}

function commafy(num: number | string | undefined) {
  if (num == undefined) return undefined
  const str = num.toString().split('.')
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }
  return str.join('.')
}

const renderPrice = (price: CurrencyAmount<Currency>) => {
  const number = +price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP)
  if (number < 0.1) return commafy(price.toSignificant(1, undefined, Rounding.ROUND_HALF_UP))

  if (number < 1) return commafy(price.toSignificant(2, undefined, Rounding.ROUND_HALF_UP))

  if (number < 1000) return commafy(price.toSignificant(3, undefined, Rounding.ROUND_HALF_UP))

  if (number < 100000) return commafy(price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP))

  return commafy(price.toSignificant(6, undefined, Rounding.ROUND_HALF_UP))
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

export function AdvancedMarketDetails({ trade, allowedSlippage, syncing = false }: AdvancedMarketDetailsProps) {
  const theme = useContext(ThemeContext)

  const { realizedLPFee, priceImpact } = useMemo(() => {
    if (!trade) return { realizedLPFee: undefined, priceImpact: undefined }

    const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
    const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent)
    const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent)
    return { priceImpact, realizedLPFee }
  }, [trade])

  return !trade ? null : (
    <AutoColumn gap="8px">
      <TransactionDetailsLabel fontWeight={500} fontSize={14}>
        <Trans>Transaction Details</Trans>
      </TransactionDetailsLabel>

      <RowBetween>
        <RowFixed>
          <TYPE.subHeader color={theme.text1}>
            <Trans>Allowed Slippage</Trans>
          </TYPE.subHeader>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={45}>
          <TYPE.black textAlign="right" fontSize={14}>
            {allowedSlippage.toFixed(2)}%
          </TYPE.black>
        </TextWithLoadingPlaceholder>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <TYPE.subHeader color={theme.text1}>
            {trade.tradeType === TradeType.EXACT_INPUT ? <Trans>Minimum received</Trans> : <Trans>Maximum sent</Trans>}
          </TYPE.subHeader>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <TYPE.black textAlign="right" fontSize={14}>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${renderPrice(trade.minimumAmountOut(allowedSlippage))} ${trade.outputAmount.currency.symbol}`
              : `${renderPrice(trade.maximumAmountIn(allowedSlippage))} ${trade.inputAmount.currency.symbol}`}
          </TYPE.black>
        </TextWithLoadingPlaceholder>
      </RowBetween>
    </AutoColumn>
  )
}
