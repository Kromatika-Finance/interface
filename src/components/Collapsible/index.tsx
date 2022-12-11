import { Trans } from '@lingui/macro'
import { ReactNode, useState } from 'react'
import { ArrowDownCircle, ArrowLeft } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { ButtonGray } from '../Button'

const CollapsibleContainer = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-radius: 20px;
  box-shadow: 0 0 0 3px ${({ theme, isOpen }) => (isOpen ? theme.bg2 : 'none')};
  width: 480px;
  max-width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 90%;
  `};
`

const CollapsibleToggler = styled(ButtonGray)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  border: none;
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
`

const CollapsibleContentContainer = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  background: transparent;
  border-radius: 20px;
  padding: 2rem;
  overflow: auto;
  width: 100%;
  height: 480px;
  max-height: 100%;

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.bg1};
    border-radius: 20px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.bg2};
  }
`

const StyledArrow = styled(ArrowDownCircle)<{ isOpen: boolean }>`
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.25s ease-in;
`

interface CollapsibleProps {
  label: string
  children?: ReactNode
}

const Collapsible = ({ label, children }: CollapsibleProps) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <CollapsibleContainer isOpen={isOpen}>
      <CollapsibleToggler type="button" onClick={() => setOpen(!isOpen)}>
        <Text fontSize={[10, 14, 20]} fontWeight={400}>
          <Trans>{label}</Trans>
        </Text>
        <StyledArrow isOpen={isOpen}>
          <ArrowLeft />
        </StyledArrow>
      </CollapsibleToggler>
      <CollapsibleContentContainer isOpen={isOpen}>{children}</CollapsibleContentContainer>
    </CollapsibleContainer>
  )
}

export default Collapsible
