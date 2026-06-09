import { useEffect } from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import { useAppDispatch } from 'state/hooks'

import { saveReferral } from '../../hooks/useReferral'
import { ApplicationModal, setOpenModal } from '../../state/application/reducer'

// Redirects to swap but only replace the pathname
export function RedirectPathToMarketOnly({ location }: RouteComponentProps) {
  return <Redirect to={{ ...location, pathname: '/market' }} />
}

// Captures the referral address/code from the URL, persists it, then redirects to /swap
export function RedirectToSwapWithReferral({
  match: {
    params: { referralAddress },
  },
  location,
}: RouteComponentProps<{ referralAddress: string }>) {
  useEffect(() => {
    if (referralAddress) {
      // Save both referralCode (string) and Ethereum addresses (0x...)
      saveReferral(referralAddress)
    }
  }, [referralAddress])

  return <Redirect to={{ ...location, pathname: '/swap' }} />
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToMarket(props: RouteComponentProps<{ outputCurrency: string }>) {
  const {
    location: { search },
    match: {
      params: { outputCurrency },
    },
  } = props

  return (
    <Redirect
      to={{
        ...props.location,
        pathname: '/swap',
        search:
          search && search.length > 1
            ? `${search}&outputCurrency=${outputCurrency}`
            : `?outputCurrency=${outputCurrency}`,
      }}
    />
  )
}

export function OpenClaimAddressModalAndRedirectToMarket(props: RouteComponentProps) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setOpenModal(ApplicationModal.ADDRESS_CLAIM))
  }, [dispatch])
  return <RedirectPathToMarketOnly {...props} />
}
