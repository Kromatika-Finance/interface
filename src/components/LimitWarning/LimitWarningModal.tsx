import { Trans } from '@lingui/macro'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'

import { CloseIcon, CustomLightSpinner, ExternalLink, TYPE } from '../../theme'
import { Break, CardSection, DataCard } from '../earn/styled'
import Modal from '../Modal'
import { RowBetween } from '../Row'

export default function LimitWarningModal({ isOpen, onDismiss }: { isOpen: boolean; onDismiss: () => void }) {
  function wrappedOnDismiss() {
    onDismiss()
  }

  const ModalUpper: any = styled(DataCard)`
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
  `

  const ContentWrapper = styled(AutoColumn)`
    width: 100%;
  `

  const LimitWarningHandler = () => {
    // Check if checkbox is ticked
    if (checked) {
      // We need to write into localStorage
      localStorage.setItem('KromPolyLimitWarningTicked', 'true')
    }
    wrappedOnDismiss()
  }

  const [checked, setChecked] = useState(false)
  const handleChange = () => {
    setChecked(!checked)
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <ModalUpper>
          <CardSection gap="md">
            <RowBetween>
              <TYPE.white fontWeight={500}>
                <Trans> Polygon User Warning </Trans>
              </TYPE.white>
              <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} stroke="white" />
            </RowBetween>
          </CardSection>
        </ModalUpper>

        <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0' }} justify="center">
          <TYPE.white fontWeight={500} fontSize={14}>
            <Trans>
              Due to the recent LastPass breach, there may be a potential security breach on Kromatika&apos;s Limit
              Order Contract on <b>Polygon Network only</b>.
            </Trans>
            <br />
            <br />
            <Trans>
              <strong>ALL OTHER CHAINS</strong> and <strong>FEATURES ARE SECURE</strong> (Polygon swaps & gasless swaps
              are also secure).
              <br /> <br />
              As a security measure, Limit Order UI is paused on <b>Polygon Network only</b>.
            </Trans>
            <br />
            <br />

            <Trans>
              FOR POLYGON KROMATIKA LIMIT ORDERS USERS -{' '}
              <strong>
                <span style={{ color: 'red' }}>ACTION REQUIRED</span>
              </strong>
              :
              <br />
              <Trans>a) Cancel Polygon chain limit orders</Trans>
              <br />
              <Trans>b) Withdraw deposited KROM on polygon</Trans>
              <br />
              <Trans>c) Revoke approval to old limit order manager contract directly from the limit order page</Trans>
            </Trans>
          </TYPE.white>
        </AutoColumn>
        <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0' }} justify="center">
          <TYPE.subHeader fontWeight={500}>
            <input type="checkbox" checked={checked} onChange={handleChange} />
            Don&apos;t show this message again.
          </TYPE.subHeader>

          <ButtonPrimary
            padding="16px 16px"
            width="100%"
            $borderRadius="12px"
            mt="1rem"
            onClick={() => LimitWarningHandler()}
          >
            <Trans>Agree</Trans>
          </ButtonPrimary>
        </AutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
