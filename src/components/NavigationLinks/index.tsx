import { Trans } from '@lingui/macro'
import { darken } from 'polished'
import { NavLink } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { useTogglePerpModal } from '../../state/application/hooks'
import Badge, { BadgeVariant } from '../Badge'
import Row, { AutoRow } from '../Row'

const NavWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  order: 0;
  width: 100%;
  justify-content: space-between;
`

const NavFrame = styled(AutoRow)`
  padding: 2rem 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0;
  `};
`

const NavLinks = styled(Row)`
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  padding: 0;
  margin: 0;
  border-radius: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row;
    justify-content: space-between;
    justify-self: center;
    z-index: 99;
    position: fixed;
    bottom: 0; right: 50%;
    transform: translate(50%,-50%);
    margin: 0 auto;
    background-color: ${({ theme }) => theme.bg1};
    border: 1px solid ${({ theme }) => theme.bg2};
    box-shadow: 0px 6px 10px rgb(0 0 0 / 2%);
    width: fit-content;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: calc(100% - 32px);
  `};
`
const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: baseline;
  border-radius: 20px;
  outline: none;
  cursor: pointer;
  font-style: normal;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 16px 32px;
  word-break: break-word;
  white-space: nowrap;
  color: ${({ theme }) => theme.text2};
  gap: 10px;

  &.${activeClassName} {
    background-color: ${({ theme }) => theme.bg1};

    div {
      font-weight: 700;
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 12px 16px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    div:nth-child(2) {
      display: none;
    }
  `};
`

const StyledNavLinkAlt = styled.button`
  display: flex;
  gap: 10px;
  align-items: baseline;
  background-color: transparent;
  border-color: transparent;
  border-width: 0px;
  cursor: pointer;
  color: ${({ theme }) => theme.text2};
  font-style: normal;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 16px 32px;
  word-break: break-word;
  white-space: nowrap;

  &.${activeClassName} {
    border-radius: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
    text-decoration: none;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 12px 16px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    div:nth-child(2) {
      display: none;
    }
  `};
`

export default function NavigationLinks() {
  const togglePerpModal = useTogglePerpModal()

  const handleTogglePerpModal = () => {
    const tickingDate = localStorage.getItem('KromTOUTicked')

    if (tickingDate == null) {
      togglePerpModal()
    } else {
      const millis = Date.now() - (tickingDate as unknown as number)
      // External redirection
      if (Math.floor(millis / 1000 / 60 / 60 / 24) < 30) {
        window.open('https://perp.kromatika.finance/', '_blank')
      } else {
        togglePerpModal()
      }
    }
  }

  return (
    <NavWrapper>
      <NavFrame>
        <NavLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            <Text fontSize={[10, 14, 20]} fontWeight={400}>
              <Trans>Gasless Swap</Trans>
            </Text>
            <Badge variant={BadgeVariant.PRIMARY}>
              <Text fontSize={[10, 14, 20]} fontWeight={400}>
                <Trans>New!</Trans>
              </Text>
            </Badge>
          </StyledNavLink>
          <StyledNavLink id={`swap-nav-link`} to={'/limitorder'}>
            <Text fontSize={[10, 14, 20]} fontWeight={400}>
              <Trans>Limit/FELO</Trans>
            </Text>
          </StyledNavLink>
          <StyledNavLinkAlt id={`perp-nav-link`} onClick={() => handleTogglePerpModal()}>
            <Text fontSize={[10, 14, 20]} fontWeight={400}>
              <Trans>Futures</Trans>
            </Text>
            <Badge variant={BadgeVariant.PRIMARY}>
              <Text fontSize={[10, 14, 20]} fontWeight={400}>
                <Trans>New!</Trans>
              </Text>
            </Badge>
          </StyledNavLinkAlt>
        </NavLinks>
      </NavFrame>
    </NavWrapper>
  )
}
