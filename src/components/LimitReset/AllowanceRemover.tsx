import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import ERC20ABI from 'abis/erc20.json'
import { ButtonPrimary } from 'components/Button'
import { utils } from 'ethers/lib/ethers'
import { useState } from 'react'
import getAllowanceList from 'utils/getAllowanceListFromContractList'
import getContractList from 'utils/getContractListFromTokenList'

import Circle from '../../assets/images/circle-grey.svg'
import { useActiveWeb3React } from '../../hooks/web3'
import { CustomLightSpinner } from '../../theme'

export default function AllowanceRemover({
  account,
  chainId,
  spender,
  tokenList,
}: {
  account: string
  chainId: number
  spender: string
  tokenList: any
}) {
  // const allTokens = useAllTokens()
  const { library } = useActiveWeb3React()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingDone, setIsLoadingDone] = useState(false)
  const [maliciousAllowanceCount, setMaliciousAllowanceCount] = useState(0)
  const [isMaliciousAllowancesRemoved, setIsMaliciousAllowancesRemoved] = useState(false)

  const AllowanceRemovalHandler = async () => {
    setIsLoadingDone(false)
    setIsLoading(true)

    const contractList = getContractList(tokenList, library, chainId!)
    if (!contractList || contractList?.length == 0) {
      console.log('unable to get contract list')
      // setIsLoadingDone(true)
      setIsLoading(false)
      return
    }
    const malicious_allowances = await getAllowanceList(contractList, account, spender)

    // if (Object.keys(malicious_allowances).length == 0)
    //   console.log('You have ' + Object.keys(malicious_allowances).length + ' bad allowances')

    const result: any = Object.keys(malicious_allowances).map(async (tokenAddress: string) => {
      const contract = new Contract(tokenAddress, ERC20ABI, library)
      const libSign = library?.getSigner()
      if (libSign) {
        const signer = contract.connect(libSign)
        const tx: Boolean = await signer.approve(spender, 0)
        return tx
      }
    })

    setIsLoading(false)
    setIsLoadingDone(true)
    setMaliciousAllowanceCount(Object.keys(malicious_allowances).length)

    for (const i in result) {
      if (result[i] != true) {
        return
      }
    }
    setIsMaliciousAllowancesRemoved(true)
  }
  return (
    <>
      {!isLoading ? (
        <ButtonPrimary onClick={AllowanceRemovalHandler} style={{ marginTop: '2em', padding: '8px 16px' }}>
          <Trans>Revoke malicious permission</Trans>
        </ButtonPrimary>
      ) : (
        <ButtonPrimary style={{ marginTop: '2em', padding: '8px 16px' }}>
          <CustomLightSpinner src={Circle} alt="loader" size={'23px'} />
        </ButtonPrimary>
      )}
      {isLoadingDone ? (
        isLoadingDone && maliciousAllowanceCount == 0 ? (
          <p style={{ color: 'green' }}>
            {' '}
            You don&apos;t have any bad allowances on this account related to Kromatika ! 🎉🎉
          </p>
        ) : isLoadingDone && isMaliciousAllowancesRemoved ? (
          <p style={{ color: 'green' }}> Malicious allowances have been removed! 🎉🎉</p>
        ) : (
          <p style={{ color: 'red' }}> An error has occured ! 🎉🎉</p>
        )
      ) : null}
    </>
  )
}
