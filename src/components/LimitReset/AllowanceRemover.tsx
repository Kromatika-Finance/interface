import { Contract } from '@ethersproject/contracts'
import { Trans } from '@lingui/macro'
import ERC20ABI from 'abis/erc20.json'
import { ButtonPrimary } from 'components/Button'
import { useContext, useState } from 'react'
import { Inbox } from 'react-feather'
import styled, { ThemeContext } from 'styled-components/macro'
import getAllowanceList from 'utils/getAllowanceListFromContractList'
import getContractList from 'utils/getContractListFromTokenList'

import Circle from '../../assets/images/circle-grey.svg'
import { useActiveWeb3React } from '../../hooks/web3'
import { CustomLightSpinner, TYPE } from '../../theme'

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
  const NoLiquidity = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: auto;
    max-width: 300px;
    min-height: 25vh;
  `

  const DivWrapperNoPro = styled.div`
    max-height: 100%;
    margin-top: 160px;
    width: 75%;
    gap: 1.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: row;

    @media screen and (max-width: 1000px) {
      width: 100%;
      justify-content: flex-start;
      align-items: center;
      jusify-content: flex-start;
      flex-direction: column-reverse;
    }

    @media screen and (max-width: 1440px) {
      width: 90%;
    }

    @media screen and (max-width: 1000px) {
      margin-top: 30px;
    }
  `

  const MainContentWrapper = styled.main`
    background-color: ${({ theme }) => theme.bg0};
    padding: 8px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    max-width: 100%;
    width: 100%;
    // overflow: auto;
    margin-top: 100px;
    flex-grow: 0;
    overflow-x: hidden;
    justify-content: center;
    vertical-align: middle;
    align-items: center;
    padding-left: 15%;
    padding-right: 15%;

    @media screen and (max-width: 1592px) {
      gap: 0rem;

      margin-top: 0rem;
      flex: 1;
    }

    @media screen and (max-width: 900px) {
      margin-bottom: 80px;
    }

    /* width */
    ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px grey;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: grey;
      border-radius: 10px;
    }
  `

  const MainContentWrapperNoPro = styled.div`
    width: 100%;
    max-width: 800px;
    overflow: auto;
    max-height: 532px;
    overflow-x: hidden;
    padding: 15px;

    background-color: ${({ theme }) => theme.bg0};
    border-radius: 20px;

    @media screen and (max-width: 1000px) {
      width: 100%;
      max-width: 100%;
    }

    /* width */
    ::-webkit-scrollbar {
      width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      box-shadow: inset 0 0 5px grey;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: grey;
      border-radius: 10px;
    }
  `

  const theme = useContext(ThemeContext)
  const { library } = useActiveWeb3React()

  const [isUnfolded, setIsUnfolded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAllowanceLoaded, setIsAllowanceLoaded] = useState(false)
  const [AllowanceCount, setAllowanceCount] = useState(0)
  const [isAllowancesRemoved, setIsAllowancesRemoved] = useState(false)
  const [isError, setIsError] = useState(false)

  const AllowanceRemovalHandler = async () => {
    setIsAllowanceLoaded(false)
    setIsLoading(true)
    setIsError(false)

    const contractList: Contract[] = getContractList(tokenList, library, chainId!)!
    if (!contractList || contractList?.length == 0) {
      console.log('unable to get contract list')
      setIsLoading(false)
      return
    }

    const allowances = await getAllowanceList(contractList, account, spender)
    const txs = await Promise.all(
      Object.keys(allowances).map(async (tokenAddress: string) => {
        try {
          const contract = new Contract(tokenAddress, ERC20ABI, library)
          const libSign = library?.getSigner()

          const signer = contract.connect(libSign!)
          const tx = await signer.approve(spender, 0, { gasLimit: 100000 })
          const receipt = await library!.waitForTransaction(tx.hash, 1, 150000)
          return receipt
        } catch (e) {
          console.log(e)
          setIsError(true)
          return null
        }
      })
    )

    setIsLoading(false)
    setIsAllowanceLoaded(true)
    setAllowanceCount(Object.keys(allowances).length)
    setIsAllowancesRemoved(true)
    return true
  }
  return (
    <div
      style={
        isUnfolded
          ? {
              backgroundColor: theme.bg0,
              padding: '12px',
              marginTop: '35px',
              marginBottom: '60px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80%',
              cursor: 'pointer',
            }
          : {
              backgroundColor: theme.bg0,
              padding: '10px',
              marginTop: '35px',
              marginBottom: '60px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              verticalAlign: 'middle',
              width: '80%',
              cursor: 'pointer',
            }
      }
      onClick={() => setIsUnfolded(!isUnfolded)}
    >
      <div style={{ width: '100%' }}>
        {isUnfolded ? (
          <div>
            <div>
              <h4 style={{ textAlign: 'center', paddingBottom: '10px' }}>Polygon limit orders users warning</h4>
            </div>
            <div style={{ marginLeft: '10%', marginRight: '10%' }}>
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                Due to the recent LastPass breach, there may be a potential security breach on Kromatika&apos;s Limit
                Order Contract on Polygon Network only.
                <br /> <b>ALL OTHER CHAINS</b> and <b>FEATURES ARE SECURE</b> (Polygon swaps & gasless swaps are also
                secure).
                <br />
                As a security measure, Limit Order UI is paused on Polygon Network only.
                <br />
              </p>
              <p style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                <b>
                  FOR POLYGON KROMATIKA LIMIT ORDERS USERS <p style={{ color: 'red' }}>ACTION REQUIRED:</p>
                </b>
                a) Cancel Polygon chain limit orders
                <br />
                b) Withdraw deposited KROM on polygon
                <br />
                c) Revoke approval to old limit order manager contract directly from the limit order page
                <br />
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', verticalAlign: 'center', width: '100%' }}>
            <div style={{ width: '10%', paddingLeft: '20px', marginRight: '-5%' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="orange"
                style={{ width: '30px', height: '30px', fontWeight: 'bold' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
            <div style={{ width: '90%' }}>
              <h4 style={{ textAlign: 'center', color: 'orange', fontWeight: 'bold' }}>
                Polygon limit orders users warning
              </h4>
            </div>
          </div>
        )}

        {isAllowanceLoaded ? (
          AllowanceCount == 0 ? (
            <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}> No removal needed !</p>
          ) : isAllowancesRemoved ? (
            <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}> Removal succeeded ! 🎉🎉</p>
          ) : isError ? (
            <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}> Oops, something went wrong ! </p>
          ) : null
        ) : null}
        {!isLoading && isUnfolded ? (
          <ButtonPrimary onClick={AllowanceRemovalHandler} style={{ padding: '8px 16px', marginTop: '40px' }}>
            <Trans>Revoke permissions for old limit order manager</Trans>
          </ButtonPrimary>
        ) : isLoading && isUnfolded ? (
          <ButtonPrimary style={{ padding: '8px 16px' }}>
            <CustomLightSpinner src={Circle} alt="loader" size={'23px'} />
          </ButtonPrimary>
        ) : null}
      </div>
    </div>
  )
}
