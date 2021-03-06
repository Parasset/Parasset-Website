export const config = {
  chainId: 1,
  etherscanUrl: "https://etherscan.io/",
  defaultProvider:
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  deployments: require("../basis-cash/deployments/deployments.mainnet.json"),
  externalTokens: {
    ASET: ["0x139cec55d1ec47493dfa25ca77c9208aba4d3c68", 18],
    USDT: ["0xdac17f958d2ee523a2206206994597c13d831ec7", 6],
    NEST: ["0x04abEdA201850aC0124161F037Efd70c74ddC74C", 18],
    PUSD: ["0xCCEcC702Ec67309Bc3DDAF6a42E9e5a6b8Da58f0", 18],
    PETH: ["0x53f878Fb7Ec7B86e4F9a0CB1E9a6c89C0555FbbD", 18],
    ETH: ["0x53f878Fb7Ec7B86e4F9a0CB1E9a6c89C0555FbbD", 18],
  },
  refreshInterval: 1000,
  asetPrice:2
}

export const debtDefinitions = {
  ETHPUSD: {
    name: "ETH-PUSD",
    key:'ETHPUSD',
    icon1: "ETH",
    icon2: "PUSD",
    contract: "PUSDMorPool",
    depositTokenName: "ETH",
    earnTokenName: "PUSD",
    liqUnit:'USDT'
  },
  NESTPUSD: {
    name: "NEST-PUSD",
    key:'NESTPUSD',
    icon1: "NEST",
    icon2: "PUSD",
    contract: "PUSDMorPool",
    depositTokenName: "NEST",
    earnTokenName: "PUSD",
    liqUnit:'USDT'
  },

  NESTPETH: {
    name: "NEST-PETH",
    key:'NESTPETH',
    icon1: "NEST",
    icon2: "PETH",
    contract: "PETHMorPool",
    depositTokenName: "NEST",
    earnTokenName: "PETH",
    liqUnit:'ETH'
  },
};