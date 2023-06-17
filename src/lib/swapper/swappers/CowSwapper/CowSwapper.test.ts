import { ethChainId } from '@shapeshiftoss/caip'
import type { HDWallet } from '@shapeshiftoss/hdwallet-core'
import { KnownChainIds } from '@shapeshiftoss/types'
import {
  BTC,
  ETH,
  JINX_GNOSIS,
  JINX_MAINNET,
  WBTC,
  WETH,
  XDAI,
} from 'lib/swapper/swappers/utils/test-data/assets'

import { SwapperName } from '../../api'
import { setupBuildTrade, setupQuote } from '../utils/test-data/setupSwapQuote'
import { cowBuildTrade } from './cowBuildTrade/cowBuildTrade'
import { cowExecuteTrade } from './cowExecuteTrade/cowExecuteTrade'
import { cowGetTradeTxs } from './cowGetTradeTxs/cowGetTradeTxs'
import { CowSwapper } from './CowSwapper'
import { getCowSwapTradeQuote } from './getCowSwapTradeQuote/getCowSwapTradeQuote'
import type { CowChainId, CowTrade, CowTradeResult } from './types'

jest.mock('./utils/helpers/helpers')
jest.mock('state/slices/selectors', () => {
  const {
    BTC,
    ETH,
    JINX_MAINNET,
    JINX_GNOSIS,
    WBTC,
    WETH,
    XDAI,
  } = require('lib/swapper/swappers/utils/test-data/assets') // Move the import inside the factory function

  return {
    selectAssets: () => ({
      [BTC.assetId]: BTC,
      [ETH.assetId]: ETH,
      [JINX_MAINNET.assetId]: JINX_MAINNET,
      [JINX_GNOSIS.assetId]: JINX_GNOSIS,
      [WBTC.assetId]: WBTC,
      [WETH.assetId]: WETH,
      [XDAI.assetId]: XDAI,
    }),
  }
})

jest.mock('./getCowSwapTradeQuote/getCowSwapTradeQuote', () => ({
  getCowSwapTradeQuote: jest.fn(),
}))

jest.mock('./cowBuildTrade/cowBuildTrade', () => ({
  cowBuildTrade: jest.fn(),
}))

jest.mock('./cowExecuteTrade/cowExecuteTrade', () => ({
  cowExecuteTrade: jest.fn(),
}))

jest.mock('./cowGetTradeTxs/cowGetTradeTxs', () => ({
  cowGetTradeTxs: jest.fn(),
}))

const ASSET_IDS = [
  ETH.assetId,
  WBTC.assetId,
  WETH.assetId,
  BTC.assetId,
  JINX_MAINNET.assetId,
  XDAI.assetId,
]

const COW_SWAPPER_DEPS: CowChainId[] = [KnownChainIds.EthereumMainnet, KnownChainIds.GnosisMainnet]

describe('CowSwapper', () => {
  const wallet = {} as HDWallet
  const swapper = new CowSwapper(COW_SWAPPER_DEPS)

  describe('name', () => {
    it('returns the correct human readable swapper name', () => {
      expect(swapper.name).toEqual(SwapperName.CowSwap)
    })
  })

  describe('filterAssetIdsBySellable', () => {
    it('returns empty array when called with an empty array', () => {
      expect(swapper.filterAssetIdsBySellable([])).toEqual([])
    })

    it('returns array filtered out of non erc20 tokens', () => {
      expect(swapper.filterAssetIdsBySellable(ASSET_IDS)).toEqual([
        WBTC.assetId,
        WETH.assetId,
        JINX_MAINNET.assetId,
      ])
    })

    it('returns array filtered out of unsupported tokens', () => {
      const assetIds = [
        JINX_MAINNET.assetId,
        JINX_GNOSIS.assetId,
        'eip155:1/erc20:0xdc49108ce5c57bc3408c3a5e95f3d864ec386ed3',
      ]

      expect(swapper.filterAssetIdsBySellable(assetIds)).toEqual([
        JINX_MAINNET.assetId,
        JINX_GNOSIS.assetId,
      ])
    })
  })

  describe('filterBuyAssetsBySellAssetId', () => {
    it('returns empty array when called with an empty assetIds array', () => {
      expect(
        swapper.filterBuyAssetsBySellAssetId({ assetIds: [], sellAssetId: WETH.assetId }),
      ).toEqual([])
    })

    it('returns empty array when called with sellAssetId that is not sellable', () => {
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds: ASSET_IDS,
          sellAssetId: ETH.assetId,
        }),
      ).toEqual([])
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds: ASSET_IDS,
          sellAssetId: 'eip155:1/erc20:0xdc49108ce5c57bc3408c3a5e95f3d864ec386ed3',
        }),
      ).toEqual([])
    })

    it('returns array filtered out of non erc20 tokens when called with a sellable sellAssetId', () => {
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds: ASSET_IDS,
          sellAssetId: WETH.assetId,
        }),
      ).toEqual([ETH.assetId, WBTC.assetId, JINX_MAINNET.assetId])
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds: ASSET_IDS,
          sellAssetId: WBTC.assetId,
        }),
      ).toEqual([ETH.assetId, WETH.assetId, JINX_MAINNET.assetId])
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds: ASSET_IDS,
          sellAssetId: JINX_MAINNET.assetId,
        }),
      ).toEqual([ETH.assetId, WBTC.assetId, WETH.assetId])
    })

    it('returns array filtered out of unsupported tokens when called with a sellable sellAssetId', () => {
      const assetIds = [
        JINX_MAINNET.assetId,
        'eip155:1/erc20:0xdc49108ce5c57bc3408c3a5e95f3d864ec386ed3',
      ]
      expect(
        swapper.filterBuyAssetsBySellAssetId({
          assetIds,
          sellAssetId: WETH.assetId,
        }),
      ).toEqual([JINX_MAINNET.assetId])
      expect(
        swapper.filterBuyAssetsBySellAssetId({ assetIds, sellAssetId: JINX_MAINNET.assetId }),
      ).toEqual([])
    })
  })

  describe('getTradeQuote', () => {
    it('calls getCowSwapTradeQuote on swapper.getTradeQuote', async () => {
      const { quoteInput } = setupQuote()
      await swapper.getTradeQuote(quoteInput)
      expect(getCowSwapTradeQuote).toHaveBeenCalledTimes(1)
      expect(getCowSwapTradeQuote).toHaveBeenCalledWith(quoteInput, COW_SWAPPER_DEPS)
    })
  })

  describe('buildTrade', () => {
    it('calls cowBuildTrade on swapper.buildTrade', async () => {
      const { buildTradeInput } = setupBuildTrade()
      const args = { ...buildTradeInput, wallet }
      await swapper.buildTrade(args)
      expect(cowBuildTrade).toHaveBeenCalledTimes(1)
      expect(cowBuildTrade).toHaveBeenCalledWith(args, COW_SWAPPER_DEPS)
    })
  })

  describe('executeTrade', () => {
    it('calls executeTrade on swapper.buildTrade for Ethereum', async () => {
      const cowSwapTrade: CowTrade<KnownChainIds.EthereumMainnet> = {
        sellAmountBeforeFeesCryptoBaseUnit: '1000000000000000000',
        buyAmountBeforeFeesCryptoBaseUnit: '14501811818247595090576',
        sources: [{ name: SwapperName.CowSwap, proportion: '1' }],
        buyAsset: JINX_MAINNET,
        sellAsset: WETH,
        accountNumber: 0,
        receiveAddress: 'address11',
        feeAmountInSellTokenCryptoBaseUnit: '14557942658757988',
        rate: '14716.04718939437505555958',
        feeData: {
          protocolFees: {},
          networkFeeCryptoBaseUnit: '14557942658757988',
        },
        sellAmountDeductFeeCryptoBaseUnit: '985442057341242012',
        id: '1',
        minimumBuyAmountAfterFeesCryptoBaseUnit: '14501811818247595090576',
      }
      const args = { trade: cowSwapTrade, wallet }
      await swapper.executeTrade(args)
      expect(cowExecuteTrade).toHaveBeenCalledTimes(1)
      expect(cowExecuteTrade).toHaveBeenCalledWith(args, COW_SWAPPER_DEPS)
    })

    it('calls executeTrade on swapper.buildTrade for Gnosis', async () => {
      const cowSwapTrade: CowTrade<KnownChainIds.GnosisMainnet> = {
        sellAmountBeforeFeesCryptoBaseUnit: '1000000000000000000',
        buyAmountBeforeFeesCryptoBaseUnit: '14501811818247595090576',
        sources: [{ name: SwapperName.CowSwap, proportion: '1' }],
        buyAsset: JINX_GNOSIS,
        sellAsset: XDAI,
        accountNumber: 0,
        receiveAddress: 'address11',
        feeAmountInSellTokenCryptoBaseUnit: '14557942658757988',
        rate: '14716.04718939437505555958',
        feeData: {
          protocolFees: {},
          networkFeeCryptoBaseUnit: '14557942658757988',
        },
        sellAmountDeductFeeCryptoBaseUnit: '985442057341242012',
        id: '1',
        minimumBuyAmountAfterFeesCryptoBaseUnit: '14501811818247595090576',
      }
      const args = { trade: cowSwapTrade, wallet }
      await swapper.executeTrade(args)
      expect(cowExecuteTrade).toHaveBeenCalledTimes(1)
      expect(cowExecuteTrade).toHaveBeenCalledWith(args, COW_SWAPPER_DEPS)
    })
  })

  describe('getTradeTxs', () => {
    it('calls cowGetTradeTxs on swapper.getTradeTxs', async () => {
      const args: CowTradeResult = {
        tradeId: 'tradeId789456',
        chainId: ethChainId,
      }
      await swapper.getTradeTxs(args)
      expect(cowGetTradeTxs).toHaveBeenCalledTimes(1)
      expect(cowGetTradeTxs).toHaveBeenCalledWith(args)
    })
  })
})
