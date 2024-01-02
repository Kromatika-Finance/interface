import { parse } from 'qs'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch } from 'state/hooks'

import { updateUserDarkMode } from '../state/user/actions'

export default function DarkModeQueryParamReader(): null {
  const params = useParams()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!params.search) return
    if (params.search.length < 2) return

    const parsed = parse(params.search, {
      parseArrays: false,
      ignoreQueryPrefix: true,
    })

    const theme = parsed.theme

    if (typeof theme !== 'string') return

    if (theme.toLowerCase() === 'light') {
      dispatch(updateUserDarkMode({ userDarkMode: false }))
    } else if (theme.toLowerCase() === 'dark') {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    }
  }, [dispatch, params.search])

  return null
}
