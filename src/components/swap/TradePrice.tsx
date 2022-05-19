import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Price, Rounding, Token } from '@uniswap/sdk-core'
import { KROM } from 'constants/tokens'
import useUSDCPrice, { useUSDCValue } from 'hooks/useUSDCPrice'
import { useActiveWeb3React } from 'hooks/web3'
import { useCallback, useContext, useEffect } from 'react'
import { Text } from 'rebass'
import { tryParseAmount } from 'state/swap/hooks'
import styled, { ThemeContext } from 'styled-components/macro'
import { TYPE } from 'theme'

interface TradePriceProps {
  price: Price<Currency, Currency>
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

const StyledPriceContainer = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: grid;
  height: 24px;
  justify-content: center;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
`

function commafy(num: number | string | undefined) {
  if (num == undefined) return undefined
  const str = num.toString().split('.')
  if (str[0].length >= 4) {
    str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,')
  }
  return str.join('.')
}

function formatPrice(value: string | number | undefined) {
  if (value == undefined) return undefined

  if (Number(value) > 9) return commafy(Number(value).toFixed())
  const numberOfZeros = countZeroes(Number(value).toFixed(20))

  if (3 > numberOfZeros && numberOfZeros > 0) return commafy(Number(value).toFixed(3))

  if (Number(value) >= 1) return commafy(Number(value).toFixed(1))

  if (commafy(Number(value).toFixed(3)) != '0.000') return commafy(Number(value).toFixed(3))

  return 0
}
function countZeroes(x: string | number) {
  let counter = 0
  for (let i = 2; i < x.toString().length; i++) {
    if (x.toString().charAt(i) != '0') return counter

    counter++
  }
  return counter
}

const renderPrice = (price: Price<Currency, Token> | Price<Currency, Currency>) => {
  const number = +price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP)
  if (number < 0.1) return price.toSignificant(1, undefined, Rounding.ROUND_HALF_UP)

  if (number < 1) return price.toSignificant(2, undefined, Rounding.ROUND_HALF_UP)

  if (number < 1000) return price.toSignificant(3, undefined, Rounding.ROUND_HALF_UP)

  if (number < 100000) return price.toSignificant(4, undefined, Rounding.ROUND_HALF_UP)

  return price.toSignificant(6, undefined, Rounding.ROUND_HALF_UP)
}

export default function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useContext(ThemeContext)
  const { chainId } = useActiveWeb3React()
  const usdcPrice = useUSDCPrice(showInverted ? price.baseCurrency : price.quoteCurrency)
  const usdcPrice2 = useUSDCPrice(showInverted ? price.quoteCurrency : price.baseCurrency)

  let formattedPrice: string
  try {
    formattedPrice = showInverted ? renderPrice(price) : renderPrice(price.invert())
  } catch (error) {
    formattedPrice = '0'
  }

  const usdValue = usdcPrice2 ? Number(formattedPrice) * Number(renderPrice(usdcPrice2)) : 0
  const label = showInverted ? `${price.quoteCurrency?.symbol}` : `${price.baseCurrency?.symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.symbol} ` : `${price.quoteCurrency?.symbol}`
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + commafy(formattedPrice) ?? '-'} ${label}`

  return (
    <StyledPriceContainer onClick={flipPrice} title={text}>
      <Text fontWeight={500} fontSize={14} color={theme.text1}>
        {text}
      </Text>{' '}
      {usdValue ? (
        <TYPE.darkGray>
          <Trans>
            {Number(usdValue) ? (
              formatPrice(Number(usdValue)) != '0' ? (
                <span>(${formatPrice(Number(usdValue))})</span>
              ) : (
                ''
              )
            ) : (
              ''
            )}
          </Trans>
        </TYPE.darkGray>
      ) : null}
    </StyledPriceContainer>
  )
}
