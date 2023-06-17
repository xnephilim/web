import { btcAssetId, btcChainId, ethAssetId, ethChainId, jinxAssetId } from '@shapeshiftoss/caip'
import merge from 'lodash/merge'
import type { Asset } from 'lib/asset-service'

export const rune: Asset = {
  chainId: ethChainId,
  assetId: 'eip155:1/erc20:0x3155ba85d5f96b2d030a4966af206230e46849cb',
  name: 'THORChain  ERC20 ',
  precision: 18,
  color: '#FFFFFF',
  icon: 'https://assets.coingecko.com/coins/images/13677/thumb/IMG_20210123_132049_458.png?1612179252',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  symbol: 'RUNE',
}

export const ethereum: Asset = {
  chainId: ethChainId,
  assetId: ethAssetId,
  symbol: 'ETH',
  name: 'Ethereum',
  precision: 18,
  color: '#FFFFFF',
  icon: 'https://assets.coincap.io/assets/icons/eth@2x.png',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
}

export const usdc: Asset = {
  chainId: ethChainId,
  assetId: 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  symbol: 'ETH',
  name: 'USD Coin',
  precision: 6,
  color: '#FFFFFF',
  icon: 'https://assets.coingecko.com/coins/images/12367/thumb/oF1_9R1K_400x400.jpg?1599345463',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
}

export const zero: Asset = {
  chainId: ethChainId,
  assetId: 'eip155:1/erc20:0xf0939011a9bb95c3b791f0cb546377ed2693a574',
  color: '#FFFFFF',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  icon: 'https://assets.coingecko.com/coins/images/13706/thumb/0.exchange_%28logo%29.jpg?1617070530',
  name: '0 exchange',
  precision: 18,
  symbol: 'ZERO',
}

export const jinx: Asset = {
  chainId: ethChainId,
  assetId: jinxAssetId,
  color: '#FFFFFF',
  explorer: 'https://etherscan.io',
  explorerTxLink: 'https://etherscan.io/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  icon: 'https://assets.coincap.io/assets/icons/jinx@2x.png',
  name: 'Jinx',
  precision: 18,
  symbol: 'JINX',
}

export const bitcoin: Asset = {
  chainId: btcChainId,
  assetId: btcAssetId,
  name: 'bitcoin',
  precision: 8,
  color: '#FFFFFF',
  icon: 'https://assets.coincap.io/assets/icons/btc@2x.png',
  explorer: 'https://live.blockcypher.com',
  explorerTxLink: 'https://live.blockcypher.com/btc/tx/',
  explorerAddressLink: 'https://etherscan.io/address/',
  symbol: 'BTC',
}

export const mockAssetState = (obj?: Record<string, any>) =>
  merge(
    {
      byId: {
        [ethereum.assetId]: ethereum,
        [jinx.assetId]: jinx,
        [usdc.assetId]: usdc,
        [zero.assetId]: zero,
        [bitcoin.assetId]: bitcoin,
      },
      ids: [ethereum.assetId, jinx.assetId, usdc.assetId, bitcoin.assetId],
    },
    obj,
  )