import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import axios from 'axios'
import { ChainName } from 'constants/chains'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD, TWO_PERCENT } from 'constants/misc'
import { assertValidExecutionArguments } from 'graphql/execution/execute'
import { useMemo, useState } from 'react'
import { useBetterTradeAPITrade } from 'state/quote/useQuoteAPITrade'
import { OneInchTransaction, SwapTransaction, V3TradeState, ZeroXTransaction } from 'state/routing/types'
import { useInchQuoteAPITrade } from 'state/routing/useRoutingAPITrade'
import { useRoutingAPIEnabled } from 'state/user/hooks'
import { isTradeBetter } from 'utils/isTradeBetter'

import { useClientSideV3Trade } from './useClientSideV3Trade'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'
import { useUSDCValue } from './useUSDCPrice'
import { useActiveWeb3React } from './web3'

async function fetchBetterTrade() {
  const obj = await axios.post('http://localhost:4000/getSwap', {
    fromTokenAddress: '0x3af33bEF05C2dCb3C7288b77fe1C8d2AeBA4d789',
    toTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    amount: '1000000000000000000',
    fromAddress: '0x24eB627ee33429d8213b60701deB2950145E0F83',
    slippage: '0.5',
  })

  const data = obj.data
  return Promise.resolve(data)
}

function GetBetterTrade(): SwapTransaction | undefined {
  const response = fetchBetterTrade()

  const [betterTrades, setBetterTrades] = useState()

  response.then((response) => setBetterTrades(response)).catch((e) => console.log(e))
  console.log(betterTrades)

  return undefined // {
  // from: betterTrades ? betterTrades.sellTokenAddress : undefined,
  // to: betterTrades ? betterTrades.buyTokenAddress : undefined,
  // data: betterTrades ? betterTrades.betterTrades : undefined,
  // value: betterTrades ? betterTrades.value : undefined,
  // gas: betterTrades ? betterTrades.gas : undefined,
  // type: 3,
  // gasUseEstimateUSD: betterTrades ? betterTrades.estimatedGas : undefined, //

  //}
}

function thirtySecondsPassed(lastRequest: number) {
  const secondBetweenTwoDate = Math.abs((new Date().getTime() - lastRequest) / 1000)

  return secondBetweenTwoDate >= 30 ? true : false
}

function requestParamsChanged(oldRequest: any, newRequest: any) {
  return oldRequest == newRequest ? false : true
}

export function useBestMarketTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: V3TradeState
  trade: V3Trade<Currency, Currency, typeof tradeType> | undefined
  tx: SwapTransaction | undefined
  savings: CurrencyAmount<Token> | null
} {
  const isWindowVisible = useIsWindowVisible()

  const { chainId } = useActiveWeb3React()
  const debouncedAmount = useDebounce(amountSpecified, 100)

  const routingAPIEnabled = useRoutingAPIEnabled()
  // const [lastRequestTimestamp, setLastRequestTimestamp] = useState(new Date().getTime())

  // if (thirtySecondsPassed(lastRequestTimestamp) || requestParamsChanged(1, 1)) {
  //   const response = fetchBetterTrade()
  //   response.then((response) => setBetterTrades(response)).catch((e) => console.log(e))
  //   console.log('!------ MAKING REQUEST -------!')
  //   setLastRequestTimestamp(new Date().getTime())
  //   // cache the request
  // }

  // const [betterTrades, setBetterTrades] = useState<any>()

  // // this should be adapted for 1inch
  // const txn = {
  //   from: betterTrades ? betterTrades.sellTokenAddress : undefined,
  //   to: betterTrades ? betterTrades.buyTokenAddress : undefined,
  //   data: betterTrades ? betterTrades.betterTrades : undefined,
  //   value: betterTrades ? betterTrades.value : undefined,
  //   gas: betterTrades ? betterTrades.gas : undefined,
  //   type: 3,
  //   gasUseEstimateUSD: betterTrades ? betterTrades.estimatedGas : undefined, // not true at the moment
  // }

  // ============================================================================
  const betterTrade = useBetterTradeAPITrade(
    tradeType,
    null,
    true,
    false,
    routingAPIEnabled && isWindowVisible ? debouncedAmount : undefined,
    otherCurrency
  )
  const nameOfNetwork = useMemo(() => {
    if (!chainId) return undefined
    return ChainName[chainId]
  }, [chainId])

  const protocols = useMemo(() => {
    if (!nameOfNetwork) return undefined

    if (nameOfNetwork === 'ethereum') {
      return 'UNISWAP_V2,UNISWAP_V3'
    }
    return nameOfNetwork.toUpperCase().concat('_UNISWAP_V2,').concat(nameOfNetwork.toUpperCase()).concat('_UNISWAP_V3')
  }, [nameOfNetwork])

  const uniswapAPITrade = useInchQuoteAPITrade(
    tradeType,
    routingAPIEnabled && isWindowVisible ? debouncedAmount : undefined,
    otherCurrency,
    protocols
  )
  // ============================================================================

  // const swapAPITrade = useInchQuoteAPITrade(
  //   tradeType,
  //   routingAPIEnabled && isWindowVisible ? debouncedAmount : undefined,
  //   otherCurrency
  // )

  // const isLoading = routingAPITrade.state === V3TradeState.LOADING || swapAPITrade.state === V3TradeState.LOADING

  // const betterTrade = useMemo(() => {
  //   try {
  //     // compare if tradeB is better than tradeA
  //     return !isLoading
  //       ? isTradeBetter(swapAPITrade.trade, routingAPITrade.trade, BETTER_TRADE_LESS_HOPS_THRESHOLD)
  //         ? routingAPITrade
  //         : swapAPITrade
  //       : undefined
  //   } catch (e) {
  //     // v3 trade may be debouncing or fetching and have different
  //     // inputs/ouputs than v2
  //     console.log('Error')
  //     return undefined
  //   }
  // }, [isLoading, routingAPITrade, swapAPITrade])

  const savings = useUSDCValue(uniswapAPITrade.trade?.outputAmount)

  return useMemo(
    () => ({
      state: betterTrade?.state ? V3TradeState.VALID : V3TradeState.LOADING, //V3TradeState.VALID, //response ? (response != undefined ? V3TradeState.VALID : V3TradeState.INVALID) : V3TradeState.LOADING,
      trade: betterTrade?.trade,
      tx: betterTrade?.tx,
      savings,
    }),
    [betterTrade, savings]
  )
}

/**
 * Returns the best v3 trade for a desired swap.
 * Uses optimized routes from the Routing API and falls back to the v3 router.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestV3Trade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency
): {
  state: V3TradeState
  trade: V3Trade<Currency, Currency, typeof tradeType> | null
} {
  const [debouncedAmount, debouncedOtherCurrency] = useDebounce([amountSpecified, otherCurrency], 200)

  const isLoading = amountSpecified !== undefined && debouncedAmount === undefined

  // use client side router
  const bestV3Trade = useClientSideV3Trade(tradeType, debouncedAmount, debouncedOtherCurrency)

  return {
    ...bestV3Trade,
    ...(isLoading ? { state: V3TradeState.LOADING } : {}),
  }
}
