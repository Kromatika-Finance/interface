// eslint-disable-next-line no-restricted-imports
import 'react-toastify/dist/ReactToastify.css'

import ToastContainer, { setToast } from 'components/Toast'
import ApeModeQueryParamReader from 'hooks/useApeModeQueryParamReader'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import CliqueLogo from '../assets/images/Clique.png'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import AddressClaimModal from '../components/claim/AddressClaimModal'
import ErrorBoundary from '../components/ErrorBoundary'
import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import { ApplicationModal } from '../state/application/reducer'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { RedirectDuplicateTokenIds } from './AddLiquidity/redirects'
import LimitOrder from './LimitOrder'
import { RedirectPathToLimitOrderOnly } from './LimitOrder/redirects'
import Market from './Market'
import { PositionPage } from './Pool/PositionPage'
import SwapWidget from './SwapWidget'

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  min-height: 100vh;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg0};
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}

  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  order: 0;
  width: 100%;
  justify-content: space-between;
`

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  background: ${({ theme }) =>
    theme.darkMode
      ? 'url(images/Dapp-background-final-dark.png) no-repeat fixed'
      : 'url(images/Dapp-background-final-white.png) no-repeat fixed'};
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  background-position: left bottom;

  @media screen and (max-width: 1280px) {
    background-position: left 0 bottom 90px;
    background-size: 100% auto;
  }
`
const TopLevelModals = () => {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export default function App() {
  const { pathname } = useLocation()
  const showFallbackRoute =
    !pathname.includes('swap') && !pathname.includes('limitorder') && !pathname.includes('balance')

  setToast({
    title: '$CLIQUE: WAR OF DEX',
    description: `Stand a chance to win 25000 OP when you swap \r\nor provide liquidity on Optimism network.`,
    ctaText: 'More Info',
    ctaUrl: 'https://x.com/KromatikaFi/status/1740035551036891541',
    toastId: 'warofdex',
    imageUrl: CliqueLogo,
  })

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<GoogleAnalyticsReporter />} />
        <Route element={<DarkModeQueryParamReader />} />
        <Route element={<ApeModeQueryParamReader />} />
      </Routes>
      <Web3ReactManager>
        <>
          <Routes>
            <Route path="/darkswapwidget" element={<SwapWidget />} />
            <Route path="/lightswapwidget" element={<SwapWidget />} />
          </Routes>
          <AppWrapper>
            <ToastContainer />
            <HeaderWrapper>
              <Header />
            </HeaderWrapper>
            <BodyWrapper>
              <Popups />
              <Polling />
              <TopLevelModals />
              <Routes>
                <Route
                  path="/balance/:action/:currencyIdA?/:currencyIdB?/:feeAmount?"
                  element={<RedirectDuplicateTokenIds />}
                />
                <Route index element={<Navigate to="/limitorder" replace />} />
                <Route path="/limitorder" element={<LimitOrder />} />
                <Route path="/limitorder/:tokenId" element={<PositionPage />} />
                <Route path="/swap" element={<Market />} />
                {showFallbackRoute && <Route element={<RedirectPathToLimitOrderOnly />} />}
              </Routes>
            </BodyWrapper>
          </AppWrapper>
        </>
      </Web3ReactManager>
    </ErrorBoundary>
  )
}
