import { Box } from 'rebass/styled-components'
import styled from 'styled-components/macro'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; $borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  padding: ${({ padding }) => padding ?? '1rem'};
  border-radius: ${({ $borderRadius }) => $borderRadius ?? '16px'};
  border: ${({ border }) => border};
`
export default Card

export const PurpleCard = styled(Card)`
  background-color: ${({ theme }) => theme.purple2};
  border: 0.5px solid ${({ theme }) => theme.purple2};
  padding: 0px;
`
export const LightCard = styled(Card)`
  border: 2px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg6};
`

export const LightGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg2};
`

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg3};
`

export const DarkGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg2};
`

export const DarkCard = styled(Card)`
  background-color: ${({ theme }) => theme.bg1};
`

export const OutlineCard = styled(Card)`
  border: 2px solid ${({ theme }) => theme.bg3};
`

export const YellowCard = styled(Card)`
  background-color: rgba(243, 132, 30, 0.05);
  color: ${({ theme }) => theme.yellow3};
  font-weight: 500;
`

export const BlueCard = styled(Card)`
  background-color: ${({ theme }) => theme.primary5};
  color: ${({ theme }) => theme.blue2};
  border-radius: 20px;
`

export const StatsCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 0.5px solid ${({ theme }) => theme.purple2};
`

export const StatsLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`

export const StatsValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 600;
`
