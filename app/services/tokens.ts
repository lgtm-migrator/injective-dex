import { AccountAddress, ChainId } from '@injectivelabs/ts-types'
import { Web3Exception } from '@injectivelabs/exceptions'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BaseCurrencyContract } from '@injectivelabs/contracts/dist/contracts/BaseCurrency'
import { PeggyComposer } from '@injectivelabs/chain-consumer'
import {
  erc20TokenMeta,
  Erc20TokenMetaFactory,
  TokenMeta
} from '@injectivelabs/token-metadata'
import { contractAddresses } from '@injectivelabs/contracts'
import { alchemyApi } from '../web3/alchemy'
import { coinGeckoApi } from '../singletons/CoinGeckoApi'
import { fetchDenomTrace } from './ibc'
import { TxProvider } from '~/app/providers/TxProvider'
import { peggyDenomToContractAddress } from '~/app/transformers/peggy'
import { getContracts } from '~/app/singletons/Contracts'
import {
  CHAIN_ID,
  GAS_LIMIT_MULTIPLIER,
  INJECTIVE_DENOM,
  MAXIMUM_TRANSFER_ALLOWED,
  NETWORK,
  TRANSFER_RESTRICTIONS_ENABLED,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '~/app/utils/constants'
import { getTransactionOptions } from '~/app/utils/transaction'
import { getWeb3Strategy, transactionReceiptAsync } from '~/app/web3'
import { Token, TokenWithBalance } from '~/types'
import { AccountMetrics } from '~/types/metrics'

export const getTokenBalanceAndAllowance = async ({
  address,
  token
}: {
  address: AccountAddress
  token: Token
}): Promise<TokenWithBalance> => {
  let balance = ZERO_TO_STRING
  let priceInUsd = ZERO_TO_STRING
  let allowance = ZERO_TO_STRING

  try {
    const tokenBalances = await alchemyApi.fetchTokenBalances({
      address,
      contractAddresses: [token.address]
    })
    const tokenBalance = tokenBalances.tokenBalances
      .filter((tokenBalance) => tokenBalance.tokenBalance)
      .find((tokenBalance) => {
        return (
          ((tokenBalance as unknown) as {
            contractAddress: string
          }).contractAddress.toLowerCase() === token.address.toLowerCase()
        )
      })
    const actualBalance = tokenBalance ? tokenBalance.tokenBalance || 0 : 0

    balance = new BigNumberInWei(actualBalance || 0).toFixed()
  } catch (e) {
    balance = ZERO_TO_STRING
  }

  try {
    const allowanceResponse = await alchemyApi.fetchTokenAllowance({
      owner: address,
      spender: contractAddresses[CHAIN_ID].peggy,
      contract: token.address
    })

    allowance = new BigNumberInWei(allowanceResponse || 0).toFixed()
  } catch (e) {
    allowance = ZERO_TO_STRING
  }

  try {
    priceInUsd = (
      await getUsdtTokenPriceFromCoinGecko(token.coinGeckoId)
    ).toString()
  } catch (e: any) {
    priceInUsd = ZERO_TO_STRING
  }

  return {
    ...token,
    balance,
    allowance,
    priceInUsd: new BigNumberInBase(priceInUsd || 0).toNumber()
  }
}

export const getIbcTokenBalanceAndAllowance = async (
  token: Token
): Promise<TokenWithBalance> => {
  const allowance = ZERO_TO_STRING
  const balance = ZERO_TO_STRING
  let priceInUsd

  try {
    priceInUsd = (
      await getUsdtTokenPriceFromCoinGecko(token.coinGeckoId)
    ).toString()
  } catch (e: any) {
    priceInUsd = ZERO_TO_STRING
  }

  return {
    ...token,
    balance,
    allowance,
    priceInUsd: new BigNumberInBase(priceInUsd || 0).toNumber()
  }
}

export const getCoinGeckoId = (symbol: string): string => {
  return erc20TokenMeta.getCoinGeckoIdFromSymbol(symbol)
}

export const getUsdtTokenPriceFromCoinGecko = async (coinId: string) => {
  if (!coinId) {
    return 0
  }

  const priceInUsd = await coinGeckoApi.fetchUsdPrice(coinId)

  if (!priceInUsd) {
    return 0
  }

  return new BigNumberInBase(priceInUsd).toNumber()
}

export const setTokenAllowance = async ({
  address,
  amount,
  gasPrice,
  tokenAddress
}: {
  address: AccountAddress
  amount: string // BigNumberInWei
  gasPrice: string // BigNumberInWei
  tokenAddress: string
}) => {
  const contracts = getContracts()
  const web3Strategy = getWeb3Strategy()
  const erc20Contract = new BaseCurrencyContract({
    web3Strategy,
    address: tokenAddress,
    chainId: CHAIN_ID
  })
  const setAllowanceOfContractFunction = erc20Contract.setAllowanceOf({
    amount,
    contractAddress: contracts.peggy.address,
    transactionOptions: getTransactionOptions({
      gasPrice: ZERO_IN_BASE.toFixed(),
      from: address
    })
  })

  const data = setAllowanceOfContractFunction.getABIEncodedTransactionData()
  const gas = new BigNumberInWei(
    await setAllowanceOfContractFunction.estimateGasAsync()
  )

  try {
    const txHash = await web3Strategy.sendTransaction(
      {
        from: address,
        to: tokenAddress,
        gas: new BigNumberInWei(gas.times(GAS_LIMIT_MULTIPLIER).toFixed(0))
          .toNumber()
          .toString(16),
        maxFeePerGas: new BigNumberInWei(gasPrice).toNumber().toString(16),
        maxPriorityFeePerGas: null,
        data
      },
      { address, chainId: CHAIN_ID }
    )

    await transactionReceiptAsync(txHash)
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
}

export const transfer = async ({
  amount,
  address,
  denom,
  gasPrice
}: {
  amount: string // BigNumberInWei
  gasPrice: string // BigNumberInWei
  denom: string
  address: AccountAddress
}) => {
  const contracts = getContracts()
  const web3Strategy = getWeb3Strategy()
  const contractAddress = peggyDenomToContractAddress(denom)
  const depositForContractFunction = contracts.peggy.sendToCosmos({
    amount,
    contractAddress,
    address: `0x${'0'.repeat(24)}${address.slice(2)}`,
    transactionOptions: getTransactionOptions({
      gasPrice: ZERO_IN_BASE.toFixed(),
      from: address
    })
  })

  const data = depositForContractFunction.getABIEncodedTransactionData()
  const gas = new BigNumberInWei(
    await depositForContractFunction.estimateGasAsync()
  )

  try {
    const txHash = await web3Strategy.sendTransaction(
      {
        from: address,
        to: contracts.peggy.address,
        gas: new BigNumberInWei(gas.times(GAS_LIMIT_MULTIPLIER).toFixed(0))
          .toNumber()
          .toString(16),
        maxFeePerGas: new BigNumberInWei(gasPrice).toNumber().toString(16),
        maxPriorityFeePerGas: null,
        data
      },
      { address, chainId: CHAIN_ID }
    )
    await transactionReceiptAsync(txHash)
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
}

export const withdraw = async ({
  address,
  denom,
  amount,
  bridgeFee,
  injectiveAddress,
  destinationAddress
}: {
  amount: BigNumberInWei
  address: AccountAddress
  denom: string
  bridgeFee: BigNumberInWei
  destinationAddress: string
  injectiveAddress: AccountAddress
}) => {
  const message = PeggyComposer.withdraw({
    denom,
    amount: amount.minus(bridgeFee).toFixed(0, BigNumberInWei.ROUND_DOWN),
    bridgeFeeAmount: bridgeFee.toFixed(0, BigNumberInWei.ROUND_DOWN),
    bridgeFeeDenom: denom,
    address: destinationAddress,
    injectiveAddress
  })

  try {
    const txProvider = new TxProvider({
      address,
      message,
      bucket: AccountMetrics.SendToEth,
      chainId: CHAIN_ID
    })

    await txProvider.broadcast()
  } catch (error: any) {
    throw new Web3Exception(error.message)
  }
}

export const validateTransferRestrictions = async (
  amount: BigNumberInBase,
  token: TokenWithBalance
) => {
  if (!TRANSFER_RESTRICTIONS_ENABLED) {
    return
  }

  if (token.denom === INJECTIVE_DENOM) {
    return
  }

  const { data: coins } = await coinGeckoApi.fetchCoins()
  const coin = coins.find(
    (coin) => coin.symbol.toLowerCase() === token.symbol.toLowerCase()
  )

  if (!coin) {
    throw new Error("Asset's data couldn't be fetched.")
  }

  if (!coin.id) {
    throw new Error("Asset's data couldn't be fetched.")
  }

  const { market_data: marketData } = await coinGeckoApi.fetchCoin(coin.id)

  if (!marketData) {
    throw new Error("Asset's market data couldn't be fetched.")
  }

  const { current_price: currentPrice } = marketData

  if (!currentPrice) {
    throw new Error("Asset's prices couldn't be fetched.")
  }

  if (!currentPrice.usd) {
    throw new Error("Asset's USD price couldn't be fetched.")
  }

  const usdPrice = currentPrice.usd

  if (amount.times(usdPrice).gt(MAXIMUM_TRANSFER_ALLOWED)) {
    throw new Error(
      `You cannot transfer more than $${MAXIMUM_TRANSFER_ALLOWED.toFixed()} worth of assets to our Canary Chain.`
    )
  }
}

export const getTokenMetaData = (denom: string): TokenMeta | undefined => {
  const address = denom.startsWith('peggy') ? denom.replace('peggy', '') : denom
  const erc20Address =
    address.toLowerCase() === 'inj'
      ? getTokenMetaDataBySymbol('INJ')!.address
      : address

  const meta = Erc20TokenMetaFactory.make(NETWORK).getMetaByAddress(
    erc20Address
  )

  if (!meta) {
    return
  }

  return meta
}

export const getIbcTokenMetaData = async (
  denom: string
): Promise<TokenMeta | undefined> => {
  const { baseDenom: symbol } = await fetchDenomTrace(denom)
  const meta = Erc20TokenMetaFactory.make(NETWORK).getMetaBySymbol(symbol)

  if (!meta) {
    return
  }

  return meta
}

export const getTokenMetaDataWithIbc = async (
  denom: string
): Promise<TokenMeta | undefined> => {
  return denom.startsWith('ibc/')
    ? await getIbcTokenMetaData(denom)
    : await getTokenMetaData(denom)
}

export const getTokenMetaDataBySymbol = (
  symbol: string
): TokenMeta | undefined => {
  return Erc20TokenMetaFactory.make(NETWORK).getMetaBySymbol(symbol)
}
