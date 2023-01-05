import { Contract } from '@ethersproject/contracts'

export const getAllowanceList = async (contractList: Contract[], account: string, spender: string) => {
  const potential_malicious_allowances = await Promise.all(
    contractList.map(async (ERC20contract: any) => {
      try {
        const allowance = Number((await ERC20contract.allowance(account, spender))._hex)
        return { [ERC20contract.address]: allowance }
      } catch (e) {
        console.log(e)
        return { [ERC20contract.address]: null }
      }
    })
  )

  // Only keep non-null allowances
  const filtered_malicious_allowances: { [id: string]: number } = {}
  for (const i in potential_malicious_allowances) {
    const key = Object.keys(potential_malicious_allowances[i])[0]
    const value = Object.values(potential_malicious_allowances[i])[0]
    if (value != null && value > 0) {
      filtered_malicious_allowances[key] = value!
    }
  }
  return filtered_malicious_allowances
}

export default getAllowanceList
