import Card from 'components/Card'

import { ProgressBar } from '.'

export default function EpochProgress() {
  return (
    <Card
      style={{
        // marginBottom: '0px',
        display: 'flex',
        alignContent: 'center',
        border: '1px solid #FF0000FF',
        borderRadius: '1px',
        padding: '37px 10px 38px 10px',
      }}
    >
      <div style={{ width: '100%' }}>
        <div
          style={{
            color: `rgba(255, 255, 255, 0.5)`,
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '17.5px',
            letterSpacing: '0%',
            textAlign: 'center',
            display: 'block',
          }}
        >
          17h 28m left
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', gap: '8px' }}>
          <span style={{ whiteSpace: 'nowrap' }}>Epoch 1</span>
          <ProgressBar>
            <div />
          </ProgressBar>
        </div>
      </div>
    </Card>
  )
}
