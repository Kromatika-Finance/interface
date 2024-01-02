import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAppDispatch } from 'state/hooks'

import { ApplicationModal, setOpenModal } from '../../state/application/reducer'

// Redirects to swap but only replace the pathname
export function RedirectPathToLimitOrderOnly() {
  return <Navigate to="/limitorder" />
}

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToLimitOrder() {
  const params = useParams()

  return (
    <Navigate
      to={{
        pathname: '/limitorder',
        search:
          params.search && params.search.length > 1
            ? `${params.search}&outputCurrency=${params.outputCurrency}`
            : `?outputCurrency=${params.outputCurrency}`,
      }}
    />
  )
}

export function OpenClaimAddressModalAndRedirectToLimitOrder() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    dispatch(setOpenModal(ApplicationModal.ADDRESS_CLAIM))
  }, [dispatch])
  return <RedirectPathToLimitOrderOnly />
}
