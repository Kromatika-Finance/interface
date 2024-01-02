import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import styled from 'styled-components'
import { MEDIA_WIDTHS } from 'theme'

import { useActivePopups } from '../../state/application/hooks'
import { useURLWarningVisible } from '../../state/user/hooks'
import { AutoColumn } from '../Column'
import ClaimPopup from './ClaimPopup'
import PopupItem from './PopupItem'

const MobilePopupWrapper = styled.div<{ height: string | number }>`
  position: relative;
  max-width: 100%;
  height: ${({ height }) => height};
  margin: ${({ height }) => (height ? '0 auto;' : 0)};
  margin-bottom: ${({ height }) => (height ? '20px' : 0)};

  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: inline-block;
  `};
`

const MobilePopupInner = styled.div`
  height: 99%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: row;
  -webkit-overflow-scrolling: touch;

  ::-webkit-scrollbar {
    display: none;
  }
`

const StopOverflowQuery = `@media screen and (min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${
  MEDIA_WIDTHS.upToMedium + 500
}px)`

const FixedPopupColumn = styled(AutoColumn)<{ $extraPadding: boolean; $xlPadding: boolean }>`
  position: fixed;
  top: ${({ $extraPadding }) => ($extraPadding ? '90px' : '56px')};
  right: 1rem;
  max-width: 355px !important;
  width: 100%;
  z-index: 3;

  display: block;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};

  ${StopOverflowQuery} {
    top: ${({ $extraPadding, $xlPadding }) => ($xlPadding ? '90px' : $extraPadding ? '90px' : '56px')};
  }
`

export default function Popups() {
  // get all popups
  const activePopups = useActivePopups()

  const urlWarningActive = useURLWarningVisible()

  // need extra padding if network is not L1 Ethereum
  const { chainId } = useActiveWeb3React()
  const isNotOnMainnet = Boolean(chainId && chainId !== SupportedChainId.MAINNET)

  return (
    <>
      <FixedPopupColumn $gap="20px" $extraPadding={urlWarningActive} $xlPadding={isNotOnMainnet}>
        <ClaimPopup />
        {activePopups.map((item) => {
          return (
            <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
          )
        })}
      </FixedPopupColumn>
      <MobilePopupWrapper height={activePopups?.length > 0 ? 'fit-content' : 0}>
        <MobilePopupInner>
          {activePopups // reverse so new items up front
            .slice(0)
            .reverse()
            .map((item) => (
              <PopupItem key={item.key} content={item.content} popKey={item.key} removeAfterMs={item.removeAfterMs} />
            ))}
        </MobilePopupInner>
      </MobilePopupWrapper>
    </>
  )
}
