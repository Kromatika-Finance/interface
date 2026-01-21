import React from 'react'
import styled, { keyframes } from 'styled-components/macro'

import KromatikaLogo from '../../assets/images/KROM_Transparent_1.png'
import { ReactComponent as PhoneScreenLogo } from '../../assets/svg/phone-logo.svg'

const PageLoader = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const UniIcon = styled.div`
  transition: transform 0.3s ease;
  overflow: hidden;
  animation: ${pulse} 1.5s infinite;
`

const MainLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 40px;
  img {
    width: auto;
    height: 40px;
  }
  svg {
    height: 54px;
    width: 54px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      height: 48px;
      width: 48px;
   `};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

const PhoneLogo = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
  `}
`

export default function AppPageLoader() {
  return (
    <PageLoader>
      <UniIcon>
        <MainLogo>
          <img src={KromatikaLogo} alt={'Kromatika logo'} />
        </MainLogo>
        <PhoneLogo>
          <PhoneScreenLogo width="48px" height="48px" title="logo" z-index="1" />
        </PhoneLogo>
      </UniIcon>
    </PageLoader>
  )
}
