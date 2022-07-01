import { Currency, Token } from '@uniswap/sdk-core'

export type OrderInQuote = {
  makerToken: string
  makerAmount: string
  takerToken: string
  takerAmount: string
}

export interface GetQuote0xResult {
  to: string
  data: string
  value: string
  gas: string
  estimatedGas: string

  buyTokenAddress: string
  buyAmount: string

  sellTokenAddress: string
  sellAmount: string

  allowanceTarget: string
  orders: OrderInQuote[]
}

// ! this needs to be reviewed
export interface GetBetterTradeResult {
  chainId: number
  price: string
  guaranteedPrice: string
  estimatedPriceImpact: string
  to: string
  data: string
  value: string
  gas: number
  estimatedGas: number
  gasPrice: number
  protocolFee: number
  minimumProtocolFee: number
  buyTokenAddress: string
  sellTokenAddress: string
  buyAmount: number
  sellAmount: number
  sources: []
  orders: []
  allowanceTarget: string
  decodedUniqueId: string
  sellTokenToEthRate: number
  buyTokentoEthRate: string
}
