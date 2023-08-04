import { Contract } from '@ethersproject/contracts'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { SignatureData } from 'hooks/useERC20Permit'

export const computeSignatureCalldata = (
  parsedAmount: CurrencyAmount<Currency>,
  signatureData: SignatureData | undefined | null,
  calldatas: string[],
  limitOrderManager: Contract
): string[] => {
  if (signatureData) {
    // create call data
    const inputTokenPermit =
      'allowed' in signatureData
        ? {
            expiry: signatureData.deadline,
            nonce: signatureData.nonce,
            s: signatureData.s,
            r: signatureData.r,
            v: signatureData.v as any,
          }
        : {
            deadline: signatureData.deadline,
            amount: signatureData.amount,
            s: signatureData.s,
            r: signatureData.r,
            v: signatureData.v as any,
          }

    if ('nonce' in inputTokenPermit) {
      calldatas.push(
        limitOrderManager.interface.encodeFunctionData('selfPermitAllowed', [
          parsedAmount.currency.isToken ? parsedAmount.currency.address : undefined,
          inputTokenPermit.nonce,
          inputTokenPermit.expiry,
          inputTokenPermit.v,
          inputTokenPermit.r,
          inputTokenPermit.s,
        ])
      )
    } else {
      calldatas.push(
        limitOrderManager.interface.encodeFunctionData('selfPermit', [
          parsedAmount.currency.isToken ? parsedAmount.currency.address : undefined,
          inputTokenPermit.amount,
          inputTokenPermit.deadline,
          inputTokenPermit.v,
          inputTokenPermit.r,
          inputTokenPermit.s,
        ])
      )
    }
  }
  return calldatas
}
