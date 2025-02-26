import { ButtonPrimary } from 'components/Button'
import { PurpleCard } from 'components/Card'
import { Copy } from 'react-feather'
import styled from 'styled-components/macro'
import copyToClipboard from 'utils/copyToClipboard'

const CtaTitle = styled.h1`
  font-family: Inter;
  font-weight: 600;
  font-size: 30px;
  leading-trim: Cap height;
  line-height: 45px;
  letter-spacing: -4%;
  margin-bottom: 1px;
`

const CtaText = styled.p`
  font-family: Inter;
  font-weight: 400;
  font-size: 16px;
  line-height: 19.2px;
  letter-spacing: 0%;
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 15px;
`

const ButtonText = styled.span`
  font-family: Inter;
  font-weight: 600;
  font-size: 16px;
  leading-trim: Cap height;
  line-height: 19.2px;
  letter-spacing: 0%;
`

export default function CTA() {
  return (
    <PurpleCard style={{ backgroundColor: 'transparent', textAlign: 'center', marginBottom: '25px' }}>
      <CtaTitle>Kromatika Referral Program</CtaTitle>
      <CtaText>Invite friends to Kromatika and earn points, to gain rewards when they trade!</CtaText>
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', verticalAlign: 'middle', gap: '8px' }}
      >
        <ButtonPrimary
          style={{ width: '250px', height: 'fit', borderRadius: '10px', gap: '8px', padding: '10px 0' }}
          onClick={() => copyToClipboard('kromatika.finance/user/ref/7ehdag45')}
        >
          <Copy size={16} />
          <ButtonText>Copy Referral Link</ButtonText>
        </ButtonPrimary>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          verticalAlign: 'middle',
          gap: '8px',
        }}
      >
        <p style={{ color: '#FFFFFF7D', fontSize: '0.7rem' }}>https://kromatika.finance/user/ref/7ehdag45</p>{' '}
        <Copy size={16} />
      </div>
    </PurpleCard>
  )
}
