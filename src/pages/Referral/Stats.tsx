import { StatsCard, StatsLabel, StatsValue } from 'components/Card'

import { StatsGrid } from '.'

export default function Stats() {
  return (
    <StatsGrid>
      <StatsCard>
        <StatsLabel>Points Earned</StatsLabel>
        <StatsValue>987</StatsValue>
      </StatsCard>
      <StatsCard>
        <StatsLabel>Volume Referred</StatsLabel>
        <StatsValue>$123,451.69</StatsValue>
      </StatsCard>
      <StatsCard>
        <StatsLabel>Number of Referrals</StatsLabel>
        <StatsValue>651</StatsValue>
      </StatsCard>
      <StatsCard>
        <StatsLabel>Value Earned</StatsLabel>
        <StatsValue>$541</StatsValue>
      </StatsCard>
      <StatsCard>
        <StatsLabel>Referral Conversion Rate</StatsLabel>
        <StatsValue>45%</StatsValue>
      </StatsCard>
      <StatsCard>
        <StatsLabel>Referrer</StatsLabel>
        <StatsValue>0x8171...6bca</StatsValue>
      </StatsCard>
    </StatsGrid>
  )
}
