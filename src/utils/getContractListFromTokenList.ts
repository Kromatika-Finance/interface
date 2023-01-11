import { Provider } from '@ethersproject/abstract-provider'
import { Contract } from '@ethersproject/contracts'
import { Token } from '@uniswap/sdk-core'
import ERC20ABI from 'abis/erc20.json'
import { utils } from 'ethers/lib/ethers'

export const createERC20TokenContracts = (tokenList: string[], abi: any, provider: Provider) => {
  return tokenList
    .filter((token, i) => i === tokenList.findIndex((other) => token === other))
    .map((token) => new Contract(utils.getAddress(token), abi, provider))
}

export const getContractList = (tokenList: Token[], library: any, chainId: number) => {
  try {
    const filtered = tokenList.filter((v) => {
      //@ts-ignore
      if (v.tokenInfo != undefined) return v.tokenInfo.chainId == chainId
      else return v.chainId == chainId
    })
    const filtered_addresses = filtered.map((token) => {
      return token.address
    })

    const contractList = createERC20TokenContracts(filtered_addresses, ERC20ABI, library!)
    return contractList
  } catch (e) {
    console.log(e)
    return null
  }
}

export default getContractList
