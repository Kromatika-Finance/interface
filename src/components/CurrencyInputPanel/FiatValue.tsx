import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Rounding } from '@uniswap/sdk-core'
import HoverInlineText from 'components/HoverInlineText'
import { useMemo } from 'react'

import useTheme from '../../hooks/useTheme'
import { TYPE } from '../../theme'
import { warningSeverity } from '../../utils/prices'

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

export function FiatValue({
  fiatValue,
  priceImpact,
}: {
  fiatValue: CurrencyAmount<Currency> | null | undefined
  priceImpact?: Percent
}) {
  const theme = useTheme()
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined
    if (priceImpact.lessThan('0')) return theme.green1
    const severity = warningSeverity(priceImpact)
    if (severity < 1) return theme.text3
    if (severity < 3) return theme.yellow1
    return theme.red1
  }, [priceImpact, theme.green1, theme.red1, theme.text3, theme.yellow1])

  return (
    <TYPE.body fontSize={14} color={fiatValue ? theme.text2 : theme.text4}>
      {fiatValue && renderPrice(fiatValue)?.toString() != '0' ? (
        <Trans>
          $
          <HoverInlineText text={renderPrice(fiatValue)?.toString()} />
        </Trans>
      ) : (
        ''
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          (<Trans>{priceImpact.multiply(-1).toSignificant(3)}%</Trans>)
        </span>
      ) : null}
    </TYPE.body>
  )
}
