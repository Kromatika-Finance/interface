import { useActiveWeb3React } from 'hooks/web3'
import { Navigate, useParams } from 'react-router-dom'

import { WRAPPED_NATIVE_CURRENCY } from '../../constants/tokens'
import AddLiquidity from './index'

interface DuplicateTokenInterface {
  currencyIdA: string
  currencyIdB: string
  feeAmount?: string
}

export function RedirectDuplicateTokenIds() {
  const { chainId } = useActiveWeb3React()
  const params = useParams()

  // prevent weth + eth
  const isETHOrWETHA =
    params.currencyIdA === 'ETH' ||
    (chainId !== undefined && params.currencyIdA === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
  const isETHOrWETHB =
    params.currencyIdB === 'ETH' ||
    (chainId !== undefined && params.currencyIdB === WRAPPED_NATIVE_CURRENCY[chainId]?.address)

  if (
    params.currencyIdA &&
    params.currencyIdB &&
    (params.currencyIdA.toLowerCase() === params.currencyIdB.toLowerCase() || (isETHOrWETHA && isETHOrWETHB))
  ) {
    return <Navigate to={`/add/${params.currencyIdA}`} />
  }
  return <AddLiquidity {...params} />
}
