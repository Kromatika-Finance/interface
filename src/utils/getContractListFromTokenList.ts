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
    //@ts-ignore
    console.log(Object.keys(tokenList).length)
    console.log(tokenList)
    const filtered = tokenList.filter((v) => {
      //@ts-ignore
      // console.log(v._checksummedAddress)
      //@ts-ignore
      // console.log(v.tokenInfo.name)
      //@ts-ignore
      if (v.tokenInfo != undefined) return v.tokenInfo.chainId == chainId
      else return v.chainId == chainId
    })
    const filtered_addresses = filtered.map((token) => {
      return token.address
    })

    const contractList = createERC20TokenContracts(filtered_addresses, ERC20ABI, library!)
    // if (contractList.length != Object.keys(filtered).length) {
    //   console.log('error getting contract Address')
    //   return null
    // }
    return contractList
  } catch (e) {
    console.log(e)
    return null
  }
}

export default getContractList
