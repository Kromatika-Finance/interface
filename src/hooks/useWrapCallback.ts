import { Currency } from '@uniswap/sdk-core'
import { useMemo } from 'react'

import { WRAPPED_NATIVE_CURRENCY } from '../constants/tokens'
import { tryParseAmount } from '../state/swap/hooks'
import { TransactionType } from '../state/transactions/actions'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { CHAIN_NATIVE_TOKEN_SYMBOL } from './../constants/tokens'
import { useWETHContract } from './useContract'
import { useActiveWeb3React } from './web3'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
  typedValue: string | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency ?? undefined)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency ?? undefined), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
    const weth = WRAPPED_NATIVE_CURRENCY[chainId]
    if (!weth) return NOT_APPLICABLE

    const hasInputAmount = Boolean(inputAmount?.greaterThan('0'))
    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency.isNative && weth.equals(outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.quotient.toString(16)}` })
                  addTransaction(txReceipt, {
                    type: TransactionType.WRAP,
                    unwrapped: false,
                    currencyAmountRaw: inputAmount?.quotient.toString(),
                  })
                } catch (error) {
                  console.error('Could not deposit', error)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
          ? `Insufficient ${CHAIN_NATIVE_TOKEN_SYMBOL[chainId]} balance`
          : `Enter ${CHAIN_NATIVE_TOKEN_SYMBOL[chainId]} amount`,
      }
    } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.quotient.toString(16)}`)
                  addTransaction(txReceipt, {
                    type: TransactionType.WRAP,
                    unwrapped: true,
                    currencyAmountRaw: inputAmount?.quotient.toString(),
                  })
                } catch (error) {
                  console.error('Could not withdraw', error)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
          ? chainId !== 137
            ? 'Insufficient WETH balance'
            : 'Insufficient WPOLY balance'
          : chainId !== 137
          ? 'Enter WETH amount'
          : 'Enter WPOLY amount',
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction])
}
