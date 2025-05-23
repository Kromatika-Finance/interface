import baseLogo from 'assets/images/base-logo.png'
import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
import arbitrumLogoUrl from 'assets/svg/arbitrum_logo.svg'
import optimismLogoUrl from 'assets/svg/optimistic_ethereum.svg'
import polygonMaticLogo from 'assets/svg/polygon-matic-logo.svg'
import ms from 'ms.macro'

import { ARBITRUM_LIST, BASE_LIST, OPTIMISM_LIST } from './lists'

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,
  BASE = 8453,
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,

  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
}

export enum ChainName {
  ethereum = 1,
  arbitrum = 42161,
  optimism = 10,
  polygon = 137,
  bsc = 56,
  avalanche = 43114,
  fantom = 250,
  harmony = 1666600000,
  cronos = 25,
  aurora = 1313161554,
  moonriver = 1285,
  moonbeam = 1284,
  metis = 1088,
  xdai = 100,
  heco = 128,
  smartbch = 10000,
  arbitrumrinkeby = 421611,
  kovan = 42,
  base = 8453,
}

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
const ALCHEMY_KEY = process.env.REACT_APP_ALCHEMY_RPC_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.KOVAN,

  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.BASE,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
]

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
] as const

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]

export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
  SupportedChainId.BASE,
] as const

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]

export const INFURA_NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISM]: `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISTIC_KOVAN]: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON]: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON_MUMBAI]: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.BASE]: `https://base-mainnet.infura.io/v3/${INFURA_KEY}`,
}

export const ALCHEMY_NETWORK_URLS: { [key in SupportedChainId]: string } = {
  [SupportedChainId.MAINNET]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.OPTIMISM]: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.ARBITRUM_ONE]: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.POLYGON]: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.BASE]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.OPTIMISTIC_KOVAN]: `https://optimism-kovan.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.POLYGON_MUMBAI]: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
}
interface AddNetworkInfo {
  readonly rpcUrl: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly helpCenterUrl?: string
  readonly addNetworkInfo: AddNetworkInfo
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
}

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo }

export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ethereum',
    logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.MAINNET],
    },
  },
  [SupportedChainId.RINKEBY]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://rinkeby.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Rinkeby',
    logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: 'Rinkeby Ether', symbol: 'rETH', decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.RINKEBY],
    },
  },
  [SupportedChainId.ROPSTEN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://ropsten.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ropsten',
    logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: 'Ropsten Ether', symbol: 'ropETH', decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.ROPSTEN],
    },
  },
  [SupportedChainId.KOVAN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://kovan.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Kovan',
    logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: 'Kovan Ether', symbol: 'kovETH', decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.KOVAN],
    },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
    logoUrl: ethereumLogoUrl,
    addNetworkInfo: {
      nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
      rpcUrl: INFURA_NETWORK_URLS[SupportedChainId.GOERLI],
    },
  },
  [SupportedChainId.OPTIMISM]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://gateway.optimism.io/?chainId=1',
    defaultListUrl: OPTIMISM_LIST,
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism',
    label: 'Optimism',
    logoUrl: optimismLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    addNetworkInfo: {
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: 'https://mainnet.optimism.io',
    },
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://gateway.optimism.io/',
    defaultListUrl: OPTIMISM_LIST,
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism',
    label: 'Optimistic Kovan',
    logoUrl: optimismLogoUrl,
    statusPage: 'https://optimism.io/status',
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ',
    addNetworkInfo: {
      nativeCurrency: { name: 'Optimistic Kovan Ether', symbol: 'kovOpETH', decimals: 18 },
      rpcUrl: 'https://kovan.optimism.io',
    },
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum',
    label: 'Arbitrum',
    logoUrl: arbitrumLogoUrl,
    defaultListUrl: ARBITRUM_LIST,
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
    addNetworkInfo: {
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
    },
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum/',
    label: 'Arbitrum Rinkeby',
    logoUrl: arbitrumLogoUrl,
    defaultListUrl: ARBITRUM_LIST,
    helpCenterUrl: 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum',
    addNetworkInfo: {
      nativeCurrency: { name: 'Rinkeby Arbitrum Ether', symbol: 'rinkArbETH', decimals: 18 },
      rpcUrl: 'https://rinkeby.arbitrum.io/rpc',
    },
  },
  [SupportedChainId.POLYGON]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://wallet.polygon.technology/bridge',
    docs: 'https://polygon.io/',
    explorer: 'https://polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon',
    label: 'Polygon',
    logoUrl: polygonMaticLogo,
    addNetworkInfo: {
      rpcUrl: 'https://polygon-rpc.com/',
      nativeCurrency: { name: 'Polygon POLY', symbol: 'POLY', decimals: 18 },
    },
  },
  [SupportedChainId.POLYGON_MUMBAI]: {
    networkType: NetworkType.L1,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://wallet.polygon.technology/bridge',
    docs: 'https://polygon.io/',
    explorer: 'https://mumbai.polygonscan.com/',
    infoLink: 'https://info.uniswap.org/#/polygon',
    label: 'Polygon Mumbai',
    logoUrl: polygonMaticLogo,
    addNetworkInfo: {
      nativeCurrency: { name: 'Polygon Mumbai Poly', symbol: 'mPOLY', decimals: 18 },
      rpcUrl: 'https://rpc-endpoints.superfluid.dev/mumbai',
    },
  },
  [SupportedChainId.BASE]: {
    networkType: NetworkType.L2,
    blockWaitMsBeforeWarning: ms`10m`,
    bridge: 'https://bridge.base.org/deposit',
    docs: 'https://docs.base.org/',
    explorer: 'https://basescan.org/',
    infoLink: 'https://info.uniswap.org/#/base',
    label: 'Base',
    logoUrl: baseLogo,
    defaultListUrl: BASE_LIST,
    helpCenterUrl: 'https://support.uniswap.org/hc/en-us',
    addNetworkInfo: {
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrl: 'https://base.llamarpc.com',
    },
  },
}

export const ARBITRUM_HELP_CENTER_LINK = 'https://help.uniswap.org/en/collections/3137787-uniswap-on-arbitrum'
export const OPTIMISM_HELP_CENTER_LINK =
  'https://help.uniswap.org/en/collections/3137778-uniswap-on-optimistic-ethereum-oξ'
