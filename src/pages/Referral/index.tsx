import Card from 'components/Card'
import AppBody from 'pages/AppBody'
import styled from 'styled-components/macro'

import { isMobile } from '../../utils/userAgent'
import CTA from './cta'
import EpochProgress from './EpochProgress'
import Leaderboard from './Leaderboard'
import Stats from './Stats'
import TransactionTable from './TransactionsTable'

export const Container = styled.div`
  min-height: 100vh;
  background: #0a0a0f;
  color: white;
  padding: 24px;
`

export const Header = styled(Card)`
  text-align: center;
  margin-bottom: 24px;
`

export const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 8px;
`

export const Title2 = styled.h2`
  font-family: Inter;
  font-weight: 500;
  font-size: 28px;
  leading-trim: Cap height;
  line-height: 42px;
  letter-spacing: -4%;
`

export const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
  margin-bottom: 24px;
`

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;

  div {
    width: 30%;
    height: 100%;
    background: linear-gradient(89.99deg, #7d6ff6 0.91%, #ab83d9 103.07%);
    border-radius: 4px;
  }
`
export default function Referral() {
  return (
    <>
      <AppBody>
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              marginTop: '20px',
              gap: '20px',
            }}
          >
            <div id="referral-col-1">
              <CTA />
              <Stats />
            </div>
            <div id="referral-col-2">
              <EpochProgress />
              <Leaderboard />
            </div>
          </div>
          <TransactionTable />
        </Container>
      </AppBody>
    </>
  )
}
