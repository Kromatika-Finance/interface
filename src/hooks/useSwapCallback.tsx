import { BigNumber } from '@ethersproject/bignumber'
// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { BigintIsh, Currency, CurrencyAmount, Percent, Price, Token, TradeType } from '@uniswap/sdk-core'
import { computePoolAddress, encodeSqrtRatioX96, Trade as V3Trade } from '@uniswap/v3-sdk'
import { toHex } from '@uniswap/v3-sdk'
import { useTokenComparator } from 'components/SearchModal/sorting'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { poll } from 'ethers/lib/utils'
import JSBI from 'jsbi'
import { ReactNode, useMemo } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useUserSlippageToleranceWithDefault, useUserTickSize } from 'state/user/hooks'
import { calculateSlippageAmount } from 'utils/calculateSlippageAmount'

import { TransactionType } from '../state/transactions/actions'
import { useTransactionAdder } from '../state/transactions/hooks'
import approveAmountCalldata from '../utils/approveAmountCalldata'
import { calculateGasMargin } from '../utils/calculateGasMargin'
import { currencyId } from '../utils/currencyId'
import isZero from '../utils/isZero'
import { useArgentWalletContract } from './useArgentWalletContract'
import useENS from './useENS'
import { SignatureData, UseERC20PermitState } from './useERC20Permit'
import { useGaslessCallback } from './useGaslessCallback'
import { useActiveWeb3React } from './web3'

const DEFAULT_REMOVE_LIQUIDITY_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  address: string
  calldata: string
  value: string
}

interface SwapCallEstimate {
  call: SwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall
  gasEstimate: BigNumber
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall
  error: Error
}
