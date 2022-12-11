import { useActiveWeb3React } from 'hooks/web3'
import { useEffect } from 'react'
import { useDarkModeManager } from 'state/user/hooks'

import { SupportedChainId } from '../constants/chains'

const initialStyles = {
  width: '200vw',
  height: '200vh',
  transform: 'translate(-50vw, -100vh)',
}
const backgroundResetStyles = {
  width: '100vw',
  height: '100vh',
  transform: 'unset',
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles

const backgroundLinearGradientElement = document.getElementById('background-linear-gradient')

const setBackground = (newValues: TargetBackgroundStyles) =>
  Object.entries(newValues).forEach(([key, value]) => {
    if (backgroundLinearGradientElement) {
      backgroundLinearGradientElement.style[key as keyof typeof backgroundResetStyles] = value
    }
  })

export default function LinearGradientByChainUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const [darkMode] = useDarkModeManager()
  // manage background color
  useEffect(() => {
    if (!backgroundLinearGradientElement) {
      return
    }

    switch (chainId) {
      case SupportedChainId.ARBITRUM_ONE:
      case SupportedChainId.ARBITRUM_RINKEBY:
        setBackground(backgroundResetStyles)
        const arbitrumLightGradient = 'linear-gradient(to right bottom, #CDE8FB 0%, #FCF3F9 40%, #FFFFFF 100%)'
        const arbitrumDarkGradient = 'linear-gradient(to right bottom, #0A294B 0%, #221E30 40%, #1F2128 100%)'
        backgroundLinearGradientElement.style.background = darkMode ? arbitrumDarkGradient : arbitrumLightGradient
        break
      case SupportedChainId.OPTIMISM:
      case SupportedChainId.OPTIMISTIC_KOVAN:
        setBackground(backgroundResetStyles)
        const optimismLightGradient = 'linear-gradient(to right bottom, #FFFBF2 2%, #FFF4F9 43%, #FFFFFF 100%)'
        const optimismDarkGradient = 'linear-gradient(to right bottom, #3E2E38 2%, #2C1F2D 43%, #1F2128 100%)'
        backgroundLinearGradientElement.style.background = darkMode ? optimismDarkGradient : optimismLightGradient
        break
      default:
        setBackground(initialStyles)
        const defaultLightGradient = 'linear-gradient(to right bottom, #CDE8FB 0%, #FCF3F9 40%, #FFFFFF 100%)'
        const defaultDarkGradient =
          'linear-gradient(103.87deg, rgba(29, 24, 32, 0.8) 0%, rgba(29, 26, 31, 0.8) 47.92%, rgba(26, 31, 38, 0.8) 100%)'
        backgroundLinearGradientElement.style.background = darkMode ? defaultDarkGradient : defaultLightGradient
    }
  }, [darkMode, chainId])
  return null
}
