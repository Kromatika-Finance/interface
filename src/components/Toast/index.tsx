import { Trans } from '@lingui/macro'
import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import styled from 'styled-components'

import CliqueLogo from '../../assets/images/Clique.png'
import { isMobile } from '../../utils/userAgent'

export const setToast = () => {
  toast(
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        zIndex: 999,
      }}
    >
      <div className="" style={{ marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', color: 'white', textAlign: 'center', fontSize: '1.3vw' }}>
          $CLIQUE: WAR OF DEX
        </span>
      </div>
      <div>
        <span style={{ color: 'white', textAlign: 'center', fontSize: '0.9vw' }}>
          Stand a chance to win <b>25000 OP</b> when you swap
          <br /> or provide liquidity on Optimism network.
        </span>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', width: '100%' }}>
        <div
          style={{
            width: '60%',
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
            verticalAlign: 'middle',
          }}
        >
          <span
            style={{ color: '#475dc0', textAlign: 'center', fontSize: '1vw', fontWeight: 'bold' }}
            onClick={() => window.open('https://twitter.com/KromatikaFi/status/1740035551036891541', '_blank')}
          >
            More info
          </span>
        </div>
        <div
          style={{
            width: '40%',
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            verticalAlign: 'middle',
            marginRight: '-50px',
          }}
        >
          <img src={CliqueLogo} style={{ display: 'block' }} width="100%" height="100%" />
        </div>
      </div>
    </div>,
    {
      toastId: 'warofdex', // Prevent duplicate toasts // Closes windows on click
      autoClose: false, // Prevents toast from auto closing
    }
  )
}

const StyledToastContainer = styled(ToastContainer).attrs({
  autoClose: false,
  position: isMobile ? 'top-left' : 'bottom-right',
  toastStyle: {
    background: '#1e1e1e',
    borderRadius: '15px',
    padding: '20px',
    width: '400px',
    height: '160px',
    position: 'absolute',
    bottom: 0,
    right: '0px',
  },
})``

const CloseButton = ({ closeToast }: any) => (
  <p className="toastify__close" style={{ color: 'white', marginTop: '2px', fontWeight: 'bold' }} onClick={closeToast}>
    X
  </p>
)

export default function Toast() {
  const [closed, setClosed] = useState(false)
  return (
    <>
      {!closed && (
        <StyledToastContainer style={{ zIndex: 999 }} onClick={() => setClosed(true)} closeButton={CloseButton} />
      )}
    </>
  )
}
