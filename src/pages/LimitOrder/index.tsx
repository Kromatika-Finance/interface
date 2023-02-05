import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import { AdvancedSwapDetails } from 'components/swap/AdvancedSwapDetails'
import { AutoRouterLogo } from 'components/swap/RouterLabel'
import SwapRoute from 'components/swap/SwapRoute'
import TradePrice from 'components/swap/TradePrice'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { MouseoverTooltip, MouseoverTooltipContent } from 'components/Tooltip'
import { useV3Positions } from 'hooks/useV3Positions'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown, CheckCircle, HelpCircle, Info, X } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { V3TradeState } from 'state/validator/types'
import styled, { ThemeContext } from 'styled-components/macro'
import { PositionDetails } from 'types/position'

import AddressInputPanel from '../../components/AddressInputPanel'
import { ButtonConfirmed, ButtonError, ButtonLight, ButtonPrimary } from '../../components/Button'
import { MemoizedCandleSticks } from '../../components/CandleSticks'
import { GreyCard } from '../../components/Card'
import Collapsible from '../../components/Collapsible'
import { AutoColumn } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import CurrencyLogo from '../../components/CurrencyLogo'
import LimitOrdersList from '../../components/LimitOrdersList'
import Loader from '../../components/Loader'
import FullPositionCard from '../../components/PositionCard'
import Row, { AutoRow, RowFixed } from '../../components/Row'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import {
  ArrowWrapper,
  Dots,
  ResponsiveTooltipContainer,
  SwapCallbackError,
  Wrapper,
} from '../../components/swap/styleds'
import SwapHeader from '../../components/swap/SwapHeader'
import { SwitchLocaleLink } from '../../components/SwitchLocaleLink'
import Toggle from '../../components/Toggle'
import TokenWarningModal from '../../components/TokenWarningModal'
import { useAllTokens, useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useERC20PermitFromTrade, UseERC20PermitState } from '../../hooks/useERC20Permit'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useUSDCValue } from '../../hooks/useUSDCPrice'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useActiveWeb3React } from '../../hooks/web3'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  usePoolAddress,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useExpertModeManager, useNetworkGasPrice } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { computeFiatValuePriceImpact } from '../../utils/computeFiatValuePriceImpact'
import { getTradeVersion } from '../../utils/getTradeVersion'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'

const ClassicModeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  border: none;
  padding: 1rem 4rem 8rem;
  margin-top: 60px;
  width: calc(100% - 1rem);
  height: 100%;
  min-height: 75vh;
  z-index: 0;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem 1rem 8rem;
  `};

  :nth-child(4) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;

    > div:nth-child(1) {
      flex: 1;
      min-width: 280px;
      max-width: 475px;
      ${({ theme }) => theme.mediaWidth.upToMedium`
        min-width: 100%;
        max-width: 100%;
        order: 2;
      `};
    }

    > div:nth-child(2) {
      flex: 2;
      order: 0;
    }

    > div:nth-child(3) {
      flex: 1;
      min-width: 280px;
      max-width: 475px;
      ${({ theme }) => theme.mediaWidth.upToMedium`
        min-width: 100%;
        max-width: 100%;
        order: 1;
      `};
    }
  }
`

const SwapModalContainer = styled(AppBody)`
  flex: 1;
  width: 100%;
  max-width: 475px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
    max-width: 100%;
  `};
`

const LimitOrdersContainer = styled(AutoColumn)`
  gap: 10px;
  width: 100%;
  max-width: 100%;
`

const LimitOrdersWrapper = styled(AutoColumn)<{ direction?: string }>`
  gap: 10px;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: ${({ direction }) => (direction ? direction : 'row')};

  & > div {
    flex: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
    max-width: 100%;
    flex-direction: column;
  `};
`

const ButtonStyle = styled.div`
  margin-top: 0px;
`

const StyledSwap = styled.div`
  flex-grow: 1;
  max-width: 100%;
  width: 100%;

  @media screen and (max-width: 1592px) {
    flex: 0 0 475px;
  }
`

const StyledInfo = styled(Info)`
  height: 16px;
  width: 16px;
  margin-left: 4px;
  color: ${({ theme }) => theme.text3};

  :hover {
    color: ${({ theme }) => theme.text1};
  }
`

const GridContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr fit-content();
  grid-template-columns: minmax(min(100%, 475px), 1fr) minmax(min(100%, 475px), 475px);
  row-gap: 2rem;
  column-gap: 2rem;
  margin-top: 60px;

  border: none;
  padding: 1rem 4rem 8rem;
  width: 100%;
  height: 100%;
  min-height: 75vh;
  z-index: 0;

  & > :nth-child(n + 2) {
    height: fit-content;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: minmax(min(100%, 475px), 1fr);
    padding: 1rem 1rem 8rem;
  `};
`

const StyledRow = styled.div`
  display: grid;
  grid-auto-flow: row dense;
  grid-auto-columns: 1fr;
  grid-auto-rows: 1fr;
  grid-template-columns: 1fr 4fr 24px;
  grid-template-rows: 1fr;
  grid-template-areas: '. . .';
  justify-content: space-between;
  align-content: space-between;
  justify-items: stretch;
  align-items: start;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export default function LimitOrder({ history }: RouteComponentProps) {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const [expertMode] = useExpertModeManager()

  const theme = useContext(ThemeContext)

  const { positions, fundingBalance, minBalance, gasPrice } = useV3Positions(account)

  const [openPositions, closedPositions] = positions?.reduce<[PositionDetails[], PositionDetails[]]>(
    (acc, p) => {
      acc[p.processed ? 1 : 0].push(p)
      return acc
    },
    [[], []]
  ) ?? [[], []]
  Boolean(!account)

  const loadedUrlParams = useDefaultsFromURLSearch()

  const allTransactions = useAllTransactions()

  useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v3Trade: { state: v3TradeState },
    bestTrade: trade,
    serviceFee,
    currencyBalances,
    price,
    minPrice,
    currencies,
    parsedAmounts,
    formattedAmounts,
    inputError: swapInputError,
  } = useDerivedSwapInfo()

  const fee = trade?.route.pools[0].fee

  const aToken = currencies && currencies[Field.INPUT] ? currencies[Field.INPUT] : undefined
  const bToken = currencies && currencies[Field.OUTPUT] ? currencies[Field.OUTPUT] : undefined

  const { poolAddress, networkName } = usePoolAddress(aToken, bToken, fee)

  const gasAmount = useNetworkGasPrice()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)

  const [routeNotFound, routeIsLoading, routeIsSyncing] = useMemo(
    () => [
      trade instanceof V3Trade ? !trade?.swaps : undefined,
      V3TradeState.LOADING === v3TradeState,
      V3TradeState.SYNCING === v3TradeState,
    ],
    [trade, v3TradeState]
  )

  const fiatValueInput = useUSDCValue(parsedAmounts.input)
  const fiatValueOutput = useUSDCValue(parsedAmounts.output)
  const priceImpact = routeIsSyncing ? undefined : computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  const handleTypePrice = useCallback(
    (value: string) => {
      onUserInput(Field.PRICE, value)
    },
    [onUserInput]
  )

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    history.push('/limitorder/')
  }, [history])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: V3Trade<Currency, Currency, TradeType> | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] &&
      currencies[Field.OUTPUT] &&
      (independentField === Field.INPUT || independentField === Field.OUTPUT)
  )

  // check whether the user has approved the router on the input token
  const [approvalState, approveCallback] = useApproveCallbackFromTrade(trade, undefined, undefined)
  const {
    state: signatureState,
    signatureData,
    gatherPermitSignature,
  } = useERC20PermitFromTrade(trade, undefined, false)

  const handleApprove = useCallback(async () => {
    if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
      try {
        await gatherPermitSignature()
      } catch (error) {
        // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
        if (error?.code !== 4001) {
          await approveCallback()
        }
      }
    } else {
      await approveCallback()

      ReactGA.event({
        category: 'Trade',
        action: 'Approve',
        label: [trade?.inputAmount.currency.symbol].join('/'),
      })
    }
  }, [approveCallback, gatherPermitSignature, signatureState, trade?.inputAmount.currency.symbol])

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approvalState === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approvalState, approvalSubmitted])

  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts.input?.equalTo(maxInputAmount))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(
    trade,
    gasAmount,
    recipient,
    signatureData,
    parsedAmounts.input,
    price,
    serviceFee
  )

  const handleSwap = useCallback(() => {
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
        ReactGA.event({
          category: 'Trade',
          action:
            recipient === null
              ? 'Trade w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Trade w/o Send + recipient'
              : 'Trade w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade),
            'MH',
          ].join('/'),
        })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [swapCallback, tradeToConfirm, showConfirm, recipient, recipientAddress, account, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(true)

  const isArgentWallet = useIsArgentWallet()

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !isArgentWallet &&
    !swapInputError &&
    (approvalState === ApprovalState.NOT_APPROVED ||
      approvalState === ApprovalState.PENDING ||
      (approvalSubmitted && approvalState === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      history.push('/limitorder/')
    }
  }, [attemptingTxn, history, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false)
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toExact())
  }, [maxInputAmount, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
    },
    [onCurrencySelection]
  )
  const swapIsUnsupported = useIsSwapUnsupported(currencies[Field.INPUT], currencies[Field.OUTPUT])

  if (expertMode) {
    return (
      <>
        <GridContainer>
          <MemoizedCandleSticks networkName={networkName} poolAddress={poolAddress} />
          <StyledSwap>
            <TokenWarningModal
              isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
              tokens={importTokensNotInDefault}
              onConfirm={handleConfirmTokenWarning}
              onDismiss={handleDismissTokenWarning}
            />
            <SwapModalContainer>
              <SwapHeader />
              <Wrapper id="swap-page">
                <ConfirmSwapModal
                  isOpen={showConfirm}
                  trade={trade}
                  originalTrade={tradeToConfirm}
                  onAcceptChanges={handleAcceptChanges}
                  attemptingTxn={attemptingTxn}
                  txHash={txHash}
                  recipient={recipient}
                  serviceFee={serviceFee}
                  priceAmount={price}
                  onConfirm={handleSwap}
                  swapErrorMessage={swapErrorMessage}
                  onDismiss={handleConfirmDismiss}
                  inputAmount={parsedAmounts.input}
                  outputAmount={parsedAmounts.output}
                />

                <AutoColumn gap={'md'}>
                  <div style={{ display: 'relative' }}>
                    <CurrencyInputPanel
                      actionLabel="You send"
                      label={
                        independentField === Field.OUTPUT && !showWrap ? (
                          <Trans>From (at most)</Trans>
                        ) : (
                          <Trans>From</Trans>
                        )
                      }
                      value={formattedAmounts.input}
                      showMaxButton={showMaxButton}
                      currency={currencies[Field.INPUT]}
                      onUserInput={handleTypeInput}
                      onMax={handleMaxInput}
                      fiatValue={fiatValueInput ?? undefined}
                      onCurrencySelect={handleInputSelect}
                      otherCurrency={currencies[Field.OUTPUT]}
                      showCommonBases={true}
                      id="swap-currency-input"
                      loading={independentField === Field.OUTPUT && routeIsSyncing}
                    />

                    <ArrowWrapper clickable={false}>
                      <X size="16" />
                    </ArrowWrapper>

                    <CurrencyInputPanel
                      value={formattedAmounts.price}
                      onUserInput={handleTypePrice}
                      label={<Trans>Target Price+++</Trans>}
                      showMaxButton={false}
                      hideBalance={true}
                      currency={currencies[Field.OUTPUT] ?? null}
                      otherCurrency={currencies[Field.INPUT]}
                      id="target-price"
                      showCommonBases={false}
                      locked={false}
                      showCurrencySelector={false}
                      showRate={true}
                      isInvertedRate={showInverted}
                      price={price}
                      loading={independentField === Field.INPUT && routeIsSyncing}
                    />

                    <ArrowWrapper clickable>
                      <ArrowDown
                        size="16"
                        onClick={() => {
                          setApprovalSubmitted(false) // reset 2 step UI for approvals
                          onSwitchTokens()
                        }}
                        color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.text1 : theme.text3}
                      />
                    </ArrowWrapper>

                    <CurrencyInputPanel
                      actionLabel="You receive at least"
                      value={formattedAmounts.output}
                      onUserInput={handleTypeOutput}
                      label={
                        independentField === Field.INPUT && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>
                      }
                      showMaxButton={false}
                      hideBalance={false}
                      fiatValue={fiatValueOutput ?? undefined}
                      priceImpact={priceImpact}
                      currency={currencies[Field.OUTPUT]}
                      onCurrencySelect={handleOutputSelect}
                      otherCurrency={currencies[Field.INPUT]}
                      showCommonBases={true}
                      id="swap-currency-output"
                      loading={independentField === Field.INPUT && routeIsSyncing}
                    />
                  </div>

                  {recipient !== null && !showWrap ? (
                    <>
                      <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                        <ArrowWrapper clickable={false}>
                          <ArrowDown size="16" color={theme.text2} />
                        </ArrowWrapper>
                        <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                          <Trans>- Remove recipient</Trans>
                        </LinkStyledButton>
                      </AutoRow>
                      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                    </>
                  ) : null}
                  {!showWrap && trade && minPrice && (
                    <>
                      <Row justify={'flex-end'}>
                        <RowFixed style={{ position: 'relative' }}>
                          <Toggle
                            id="toggle-buy-sell"
                            isActive={showInverted}
                            toggle={() => setShowInverted((showInverted) => !showInverted)}
                            checked={<Trans>Input</Trans>}
                            unchecked={<Trans>Output</Trans>}
                          />
                        </RowFixed>
                      </Row>
                      <StyledRow>
                        <RowFixed style={{ position: 'relative', marginRight: 'auto' }}>
                          <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                            <Trans>Current Price</Trans>
                          </TYPE.body>
                        </RowFixed>
                        <RowFixed style={{ justifySelf: 'end' }}>
                          <LoadingOpacityContainer $loading={routeIsSyncing}>
                            <TradePrice
                              price={trade.route.midPrice}
                              showInverted={showInverted}
                              setShowInverted={setShowInverted}
                            />
                          </LoadingOpacityContainer>
                        </RowFixed>
                        <RowFixed style={{ position: 'relative' }}>
                          <MouseoverTooltipContent
                            wrap={false}
                            content={
                              <ResponsiveTooltipContainer>
                                <SwapRoute trade={trade} syncing={routeIsSyncing} />
                              </ResponsiveTooltipContainer>
                            }
                            placement="bottom"
                            onOpen={() =>
                              ReactGA.event({
                                category: 'Swap',
                                action: 'Router Tooltip Open',
                              })
                            }
                          >
                            <AutoRow gap="4px" width="auto">
                              <AutoRouterLogo />
                              <LoadingOpacityContainer $loading={routeIsSyncing}>
                                {trade.swaps.length > 1 && (
                                  <TYPE.blue fontSize={14}>{trade.swaps.length} routes</TYPE.blue>
                                )}
                              </LoadingOpacityContainer>
                            </AutoRow>
                          </MouseoverTooltipContent>
                        </RowFixed>
                      </StyledRow>
                      <StyledRow>
                        <RowFixed style={{ position: 'relative', marginRight: 'auto' }}>
                          <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                            <Trans>Min Price</Trans>
                          </TYPE.body>
                        </RowFixed>
                        <RowFixed style={{ justifySelf: 'end' }}>
                          <LoadingOpacityContainer $loading={routeIsSyncing}>
                            <TradePrice
                              price={minPrice}
                              showInverted={showInverted}
                              setShowInverted={setShowInverted}
                            />
                          </LoadingOpacityContainer>
                        </RowFixed>
                        <RowFixed style={{ position: 'relative' }}>
                          {' '}
                          <MouseoverTooltipContent
                            wrap={false}
                            content={
                              <ResponsiveTooltipContainer origin="top right" width={'295px'}>
                                <AdvancedSwapDetails
                                  trade={trade}
                                  serviceFee={serviceFee}
                                  priceAmount={price}
                                  outputAmount={parsedAmounts.output}
                                  syncing={routeIsSyncing}
                                />
                              </ResponsiveTooltipContainer>
                            }
                            placement="bottom"
                            onOpen={() =>
                              ReactGA.event({
                                category: 'Trade',
                                action: 'Transaction Details Tooltip Open',
                              })
                            }
                          >
                            <StyledInfo />
                          </MouseoverTooltipContent>
                        </RowFixed>
                      </StyledRow>
                    </>
                  )}
                  {!trade && !minPrice && (
                    <>
                      <Row justify={'flex-end'}>
                        <RowFixed style={{ position: 'relative' }}>
                          <Toggle
                            id="toggle-buy-sell"
                            isActive={showInverted}
                            toggle={() => setShowInverted((showInverted) => !showInverted)}
                            checked={<Trans>Input</Trans>}
                            unchecked={<Trans>Output</Trans>}
                          />
                        </RowFixed>
                      </Row>
                      <Row justify={'end'} style={{ height: '24px' }}>
                        <RowFixed style={{ position: 'relative' }} />
                        <RowFixed style={{ position: 'relative' }}>
                          <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                            <Trans>Current Price: 0</Trans>
                          </TYPE.body>
                        </RowFixed>
                      </Row>
                      <Row justify={'end'} style={{ height: '24px' }}>
                        <RowFixed style={{ position: 'relative' }} />
                        <RowFixed style={{ position: 'relative' }}>
                          <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                            <Trans>Min Price: 0</Trans>
                          </TYPE.body>
                        </RowFixed>
                      </Row>
                    </>
                  )}
                  {swapIsUnsupported ? (
                    <ButtonPrimary disabled={true}>
                      <TYPE.main mb="4px">
                        <Trans>Unsupported Asset</Trans>
                      </TYPE.main>
                    </ButtonPrimary>
                  ) : !account ? (
                    <ButtonLight onClick={toggleWalletModal}>
                      <Trans>Connect Wallet</Trans>
                    </ButtonLight>
                  ) : showWrap ? (
                    <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                      {wrapInputError ??
                        (wrapType === WrapType.WRAP ? (
                          <Trans>Wrap</Trans>
                        ) : wrapType === WrapType.UNWRAP ? (
                          <Trans>Unwrap</Trans>
                        ) : null)}
                    </ButtonPrimary>
                  ) : routeIsSyncing || routeIsLoading ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <TYPE.main mb="4px">
                        <Dots>
                          <Trans>Loading</Trans>
                        </Dots>
                      </TYPE.main>
                    </GreyCard>
                  ) : routeNotFound && userHasSpecifiedInputOutput ? (
                    <GreyCard style={{ textAlign: 'center' }}>
                      <TYPE.main mb="4px">
                        <Trans>Insufficient liquidity for this trade.</Trans>
                      </TYPE.main>
                    </GreyCard>
                  ) : showApproveFlow ? (
                    <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                      <AutoColumn style={{ width: '100%' }} gap="md">
                        <ButtonConfirmed
                          onClick={handleApprove}
                          disabled={
                            approvalState !== ApprovalState.NOT_APPROVED ||
                            approvalSubmitted ||
                            signatureState === UseERC20PermitState.SIGNED
                          }
                          width="100%"
                          altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                          confirmed={
                            approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED
                          }
                        >
                          <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <CurrencyLogo
                                currency={currencies[Field.INPUT]}
                                size={'20px'}
                                style={{ marginRight: '8px', flexShrink: 0 }}
                              />
                              {/* we need to shorten this string on mobile */}
                              {approvalState === ApprovalState.APPROVED ||
                              signatureState === UseERC20PermitState.SIGNED ? (
                                <Trans>You can now trade {currencies[Field.INPUT]?.symbol}</Trans>
                              ) : (
                                <Trans>Allow Kromatika to use your {currencies[Field.INPUT]?.symbol}</Trans>
                              )}
                            </span>
                            {approvalState === ApprovalState.PENDING ? (
                              <Loader stroke="white" />
                            ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                              signatureState === UseERC20PermitState.SIGNED ? (
                              <CheckCircle size="20" color={theme.green1} />
                            ) : (
                              <MouseoverTooltip
                                text={
                                  <Trans>
                                    You must give the Kromatika smart contracts permission to use your{' '}
                                    {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                                  </Trans>
                                }
                              >
                                <HelpCircle size="20" color={'white'} style={{ marginLeft: '8px' }} />
                              </MouseoverTooltip>
                            )}
                          </AutoRow>
                        </ButtonConfirmed>
                        <ButtonError
                          onClick={() => {
                            setSwapState({
                              tradeToConfirm: trade,
                              attemptingTxn: false,
                              swapErrorMessage: undefined,
                              showConfirm: true,
                              txHash: undefined,
                            })
                          }}
                          width="100%"
                          id="swap-button"
                          disabled={
                            !isValid ||
                            !approvalState ||
                            (approvalState !== ApprovalState.APPROVED && signatureState !== UseERC20PermitState.SIGNED)
                          }
                          error={isValid}
                        >
                          <Text fontSize={16} fontWeight={400}>
                            {<Trans>Trade</Trans>}
                          </Text>
                        </ButtonError>
                      </AutoColumn>
                    </AutoRow>
                  ) : (
                    <ButtonError
                      onClick={() => {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }}
                      id="swap-button"
                      disabled={!isValid || !!swapCallbackError}
                      error={isValid && !swapCallbackError}
                    >
                      <Text fontSize={16} fontWeight={400}>
                        {swapInputError ? swapInputError : <Trans>Trade</Trans>}
                      </Text>
                    </ButtonError>
                  )}
                  {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                </AutoColumn>
              </Wrapper>
            </SwapModalContainer>
            <SwitchLocaleLink />
            {!swapIsUnsupported ? null : (
              <UnsupportedCurrencyFooter
                show={swapIsUnsupported}
                currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
              />
            )}
          </StyledSwap>
          <LimitOrdersContainer>
            <LimitOrdersWrapper direction={'row'}>
              <Collapsible label="Open Orders" initState={openPositions.length > 0}>
                <LimitOrdersList orders={openPositions} fundingBalance={fundingBalance} minBalance={minBalance} />
              </Collapsible>
              <Collapsible label="Executed Orders" initState={closedPositions.length > 0}>
                <LimitOrdersList orders={closedPositions} fundingBalance={fundingBalance} minBalance={minBalance} />
              </Collapsible>
            </LimitOrdersWrapper>
            <AutoRow justify="center" textAlign="center" padding="0 1rem">
              <Text fontSize={16} fontWeight={400}>
                <TYPE.main>
                  <Trans>Any missing order? Try switching between</Trans>
                  <TYPE.blue as={'span'}>
                    {' '}
                    <Trans>networks.</Trans>
                  </TYPE.blue>
                </TYPE.main>
              </Text>
            </AutoRow>
          </LimitOrdersContainer>
          <FullPositionCard fundingBalance={fundingBalance} minBalance={minBalance} gasPrice={gasPrice} />
        </GridContainer>
      </>
    )
  }

  return (
    <ClassicModeContainer>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
        onDismiss={handleDismissTokenWarning}
      />
      <FullPositionCard fundingBalance={fundingBalance} minBalance={minBalance} gasPrice={gasPrice} />
      <SwapModalContainer>
        <SwapHeader />
        <Wrapper id="swap-page">
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            serviceFee={serviceFee}
            priceAmount={price}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
            inputAmount={parsedAmounts.input}
            outputAmount={parsedAmounts.output}
          />

          <AutoColumn gap={'md'}>
            <div style={{ display: 'relative' }}>
              <CurrencyInputPanel
                actionLabel="You send"
                label={
                  independentField === Field.OUTPUT && !showWrap ? <Trans>From (at most)</Trans> : <Trans>From</Trans>
                }
                value={formattedAmounts.input}
                showMaxButton={showMaxButton}
                currency={currencies[Field.INPUT]}
                onUserInput={handleTypeInput}
                onMax={handleMaxInput}
                fiatValue={fiatValueInput ?? undefined}
                onCurrencySelect={handleInputSelect}
                otherCurrency={currencies[Field.OUTPUT]}
                showCommonBases={true}
                id="swap-currency-input"
                loading={independentField === Field.OUTPUT && routeIsSyncing}
              />

              <ArrowWrapper clickable={false}>
                <X size="16" />
              </ArrowWrapper>

              <CurrencyInputPanel
                value={formattedAmounts.price}
                onUserInput={handleTypePrice}
                label={<Trans>Target Price---</Trans>}
                showMaxButton={false}
                hideBalance={true}
                currency={currencies[Field.OUTPUT] ?? null}
                otherCurrency={currencies[Field.INPUT]}
                id="target-price"
                showCommonBases={false}
                locked={false}
                showCurrencySelector={false}
                showRate={true}
                isInvertedRate={showInverted}
                price={price}
                loading={independentField === Field.INPUT && routeIsSyncing}
              />

              <ArrowWrapper clickable>
                <ArrowDown
                  size="16"
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                  color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.text1 : theme.text3}
                />
              </ArrowWrapper>

              <CurrencyInputPanel
                actionLabel="You receive at least"
                value={formattedAmounts.output}
                onUserInput={handleTypeOutput}
                label={independentField === Field.INPUT && !showWrap ? <Trans>To (at least)</Trans> : <Trans>To</Trans>}
                showMaxButton={false}
                hideBalance={false}
                fiatValue={fiatValueOutput ?? undefined}
                priceImpact={priceImpact}
                currency={currencies[Field.OUTPUT]}
                onCurrencySelect={handleOutputSelect}
                otherCurrency={currencies[Field.INPUT]}
                showCommonBases={true}
                id="swap-currency-output"
                loading={independentField === Field.INPUT && routeIsSyncing}
              />
            </div>

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                    <Trans>- Remove recipient</Trans>
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}
            {!showWrap && trade && minPrice && (
              <>
                <Row justify={'flex-end'}>
                  <RowFixed style={{ position: 'relative' }}>
                    <Toggle
                      id="toggle-buy-sell"
                      isActive={showInverted}
                      toggle={() => setShowInverted((showInverted) => !showInverted)}
                      checked={<Trans>Input</Trans>}
                      unchecked={<Trans>Output</Trans>}
                    />
                  </RowFixed>
                </Row>
                <StyledRow>
                  <RowFixed style={{ position: 'relative', marginRight: 'auto' }}>
                    <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                      <Trans>Current Price</Trans>
                    </TYPE.body>
                  </RowFixed>
                  <RowFixed style={{ justifySelf: 'end' }}>
                    <LoadingOpacityContainer $loading={routeIsSyncing}>
                      <TradePrice
                        price={trade.route.midPrice}
                        showInverted={showInverted}
                        setShowInverted={setShowInverted}
                      />
                    </LoadingOpacityContainer>
                  </RowFixed>
                  <RowFixed style={{ position: 'relative' }}>
                    <MouseoverTooltipContent
                      wrap={false}
                      content={
                        <ResponsiveTooltipContainer>
                          <SwapRoute trade={trade} syncing={routeIsSyncing} />
                        </ResponsiveTooltipContainer>
                      }
                      placement="bottom"
                      onOpen={() =>
                        ReactGA.event({
                          category: 'Swap',
                          action: 'Router Tooltip Open',
                        })
                      }
                    >
                      <AutoRow gap="4px" width="auto">
                        <AutoRouterLogo />
                        <LoadingOpacityContainer $loading={routeIsSyncing}>
                          {trade.swaps.length > 1 && <TYPE.blue fontSize={14}>{trade.swaps.length} routes</TYPE.blue>}
                        </LoadingOpacityContainer>
                      </AutoRow>
                    </MouseoverTooltipContent>
                  </RowFixed>
                </StyledRow>
                <StyledRow>
                  <RowFixed style={{ position: 'relative', marginRight: 'auto' }}>
                    <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                      <Trans>Min Price</Trans>
                    </TYPE.body>
                  </RowFixed>
                  <RowFixed style={{ justifySelf: 'end' }}>
                    <LoadingOpacityContainer $loading={routeIsSyncing}>
                      <TradePrice price={minPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
                    </LoadingOpacityContainer>
                  </RowFixed>
                  <RowFixed style={{ position: 'relative' }}>
                    {' '}
                    <MouseoverTooltipContent
                      wrap={false}
                      content={
                        <ResponsiveTooltipContainer origin="top right" width={'295px'}>
                          <AdvancedSwapDetails
                            trade={trade}
                            serviceFee={serviceFee}
                            priceAmount={price}
                            outputAmount={parsedAmounts.output}
                            syncing={routeIsSyncing}
                          />
                        </ResponsiveTooltipContainer>
                      }
                      placement="bottom"
                      onOpen={() =>
                        ReactGA.event({
                          category: 'Trade',
                          action: 'Transaction Details Tooltip Open',
                        })
                      }
                    >
                      <StyledInfo />
                    </MouseoverTooltipContent>
                  </RowFixed>
                </StyledRow>
              </>
            )}
            {!trade && !minPrice && (
              <>
                <Row justify={'flex-end'}>
                  <RowFixed style={{ position: 'relative' }}>
                    <Toggle
                      id="toggle-buy-sell"
                      isActive={showInverted}
                      toggle={() => setShowInverted((showInverted) => !showInverted)}
                      checked={<Trans>Input</Trans>}
                      unchecked={<Trans>Output</Trans>}
                    />
                  </RowFixed>
                </Row>
                <Row justify={'end'} style={{ height: '24px' }}>
                  <RowFixed style={{ position: 'relative' }}>
                    <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                      <Trans>Current Price: 0</Trans>
                    </TYPE.body>
                  </RowFixed>
                </Row>
                <Row justify={'end'} style={{ height: '24px' }}>
                  <RowFixed style={{ position: 'relative' }}>
                    <TYPE.body color={theme.text2} fontWeight={400} fontSize={14}>
                      <Trans>Min Price: 0</Trans>
                    </TYPE.body>
                  </RowFixed>
                </Row>
              </>
            )}

            <ButtonStyle>
              {swapIsUnsupported ? (
                <ButtonPrimary disabled={true}>
                  <TYPE.main mb="4px">
                    <Trans>Unsupported Asset</Trans>
                  </TYPE.main>
                </ButtonPrimary>
              ) : !account ? (
                <ButtonLight onClick={toggleWalletModal}>
                  <Trans>Connect Wallet</Trans>
                </ButtonLight>
              ) : showWrap ? (
                <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={onWrap}>
                  {wrapInputError ??
                    (wrapType === WrapType.WRAP ? (
                      <Trans>Wrap</Trans>
                    ) : wrapType === WrapType.UNWRAP ? (
                      <Trans>Unwrap</Trans>
                    ) : null)}
                </ButtonPrimary>
              ) : routeIsSyncing || routeIsLoading ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <TYPE.main mb="4px">
                    <Dots>
                      <Trans>Loading</Trans>
                    </Dots>
                  </TYPE.main>
                </GreyCard>
              ) : routeNotFound && userHasSpecifiedInputOutput ? (
                <GreyCard style={{ textAlign: 'center' }}>
                  <TYPE.main mb="4px">
                    <Trans>Insufficient liquidity for this trade.</Trans>
                  </TYPE.main>
                </GreyCard>
              ) : showApproveFlow ? (
                <AutoRow style={{ flexWrap: 'nowrap', width: '100%' }}>
                  <AutoColumn style={{ width: '100%' }} gap="md">
                    <ButtonConfirmed
                      onClick={handleApprove}
                      disabled={
                        approvalState !== ApprovalState.NOT_APPROVED ||
                        approvalSubmitted ||
                        signatureState === UseERC20PermitState.SIGNED
                      }
                      width="100%"
                      altDisabledStyle={approvalState === ApprovalState.PENDING} // show solid button while waiting
                      confirmed={
                        approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED
                      }
                    >
                      <AutoRow justify="space-between" style={{ flexWrap: 'nowrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <CurrencyLogo
                            currency={currencies[Field.INPUT]}
                            size={'20px'}
                            style={{ marginRight: '8px', flexShrink: 0 }}
                          />
                          {/* we need to shorten this string on mobile */}
                          {approvalState === ApprovalState.APPROVED || signatureState === UseERC20PermitState.SIGNED ? (
                            <Trans>You can now trade {currencies[Field.INPUT]?.symbol}</Trans>
                          ) : (
                            <Trans>Allow Kromatika to use your {currencies[Field.INPUT]?.symbol}</Trans>
                          )}
                        </span>
                        {approvalState === ApprovalState.PENDING ? (
                          <Loader stroke="white" />
                        ) : (approvalSubmitted && approvalState === ApprovalState.APPROVED) ||
                          signatureState === UseERC20PermitState.SIGNED ? (
                          <CheckCircle size="20" color={theme.green1} />
                        ) : (
                          <MouseoverTooltip
                            text={
                              <Trans>
                                You must give the Kromatika smart contracts permission to use your{' '}
                                {currencies[Field.INPUT]?.symbol}. You only have to do this once per token.
                              </Trans>
                            }
                          >
                            <HelpCircle size="20" color={'white'} style={{ marginLeft: '8px' }} />
                          </MouseoverTooltip>
                        )}
                      </AutoRow>
                    </ButtonConfirmed>
                    <ButtonError
                      onClick={() => {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          showConfirm: true,
                          txHash: undefined,
                        })
                      }}
                      width="100%"
                      id="swap-button"
                      disabled={
                        !isValid ||
                        (approvalState !== ApprovalState.APPROVED && signatureState !== UseERC20PermitState.SIGNED)
                      }
                      error={isValid}
                    >
                      <Text fontSize={16} fontWeight={400}>
                        {<Trans>Trade</Trans>}
                      </Text>
                    </ButtonError>
                  </AutoColumn>
                </AutoRow>
              ) : (
                <ButtonError
                  onClick={() => {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined,
                    })
                  }}
                  id="swap-button"
                  disabled={!isValid || !!swapCallbackError}
                  error={isValid && !swapCallbackError}
                >
                  <Text fontSize={16} fontWeight={400}>
                    {swapInputError ? swapInputError : <Trans>Trade</Trans>}
                  </Text>
                </ButtonError>
              )}
              {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </ButtonStyle>
          </AutoColumn>
        </Wrapper>
      </SwapModalContainer>
      {!swapIsUnsupported ? null : (
        <UnsupportedCurrencyFooter
          show={swapIsUnsupported}
          currencies={[currencies[Field.INPUT], currencies[Field.OUTPUT]]}
        />
      )}
      <LimitOrdersContainer>
        <LimitOrdersWrapper direction={'column'}>
          <Collapsible label="Open Orders" initState={openPositions.length > 0}>
            <LimitOrdersList orders={openPositions} fundingBalance={fundingBalance} minBalance={minBalance} />
          </Collapsible>
          <Collapsible label="Executed Orders" initState={closedPositions.length > 0}>
            <LimitOrdersList orders={closedPositions} fundingBalance={fundingBalance} minBalance={minBalance} />
          </Collapsible>
        </LimitOrdersWrapper>
        <AutoRow justify="center" textAlign="center" padding="0 1rem">
          <Text fontSize={16} fontWeight={400}>
            <TYPE.main>
              <Trans>Any missing order? Try switching between</Trans>
              <TYPE.blue as={'span'}>
                {' '}
                <Trans>networks.</Trans>
              </TYPE.blue>
            </TYPE.main>
          </Text>
        </AutoRow>
      </LimitOrdersContainer>
      <SwitchLocaleLink />
    </ClassicModeContainer>
  )
}
