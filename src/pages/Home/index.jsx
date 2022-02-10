/* eslint-disable jsx-a11y/anchor-is-valid */
import { useMemo, useCallback, useEffect, useState } from 'react'
import './index.scss'
import Part from '../../components/Part'
import Community from '../../components/Community'
import Danmu from '../../components/Danmu'
import { ethers, Contract } from 'ethers'
import ERC20 from '../../basis-cash/ERC20'
import BigNumber from 'bignumber.js'
import {
  web3ProviderFrom,
  getTonumber,
  getNumberToFixed,
  $isFiniteNumber,
  $isPositiveNumber,
  formatValue
} from '../../utils'
import { config, debtDefinitions } from '../../utils/config'

import logo from '../../assets/images/logo.svg'
import featuresBg from '../../assets/images/features-bg.png'
import faqBg from '../../assets/images/faq-bg.png'

const Index = () => {
  const [total, setTotal] = useState('-')

  const featureList = useMemo(() => {
    return [
      {
        name: 'oracle',
        desc: 'ADOPT A COMPLETELY DECENTRALIZED NEST ORACLE TO ENSURE THAT THE PRICE OF MORTGAGE ASSETS IS REASONABLE.'
      },
      {
        name: 'Coll.ratio',
        desc: 'the mortgage rate mechanism designed based on asset volatility greatly reduces the probability of extreme market penetration.'
      },
      {
        name: 'insurance pool',
        desc: 'The insurance pool not only enjoys the stability fee, exchange handling fee and liquidation residual value, but also bears the risk of systematic cross position compensation.'
      },
      {
        name: 'liquidation',
        desc: 'The stable 10% return gives the liquidator enough motivation to complete the liquidation before the system crosses the position.'
      }
    ]
  }, [])

  const stabilityList = useMemo(() => {
    return [
      {
        name: 'Stability fee',
        desc: 'bond holders need to pay a growing stability fee to the insurance pool to hedge the insurer’s compensation risk.'
      },
      {
        name: '1 PUSD = 1 USDT',
        desc: 'the system always allows the underlying assets to be exchanged for parallel assets 1:1 through the insurance pool to ensure the stability of parallel assets'
      }
    ]
  }, [])

  const diversityList = useMemo(() => {
    return [
      {
        name: 'Mortgaged assets',
        desc: 'support the vast majority of mains team assets to mint prarallet assets'
      },
      {
        name: 'parallel assets',
        desc: 'Parallel assets are not unique. most mainstream assets have corresponding parallel assets.'
      }
    ]
  }, [])

  const faqList = useMemo(() => {
    return [
      {
        name: '○ what is parasset?',
        desc: 'Parasset is a new type of mortgage synthetic asset protocol, which is open to all on-chain native asset protocols and builds a new on-chain asset service platform. Users can mint parallels assets on Parasset by stake ETH/NEST, such as pETH, pUSD, etc.'
      },
      {
        name: '○ How to mint parallel assets?',
        desc: 'Just launch Parasset APP, mortgage ETH,NEST or other mainstream assets mint parallel assets, such as pETH, pUSD.Or use the underlying asset to quickly mint parallel assets in the exchange function module.'
      },
      {
        name: '○ How can I earn money on Parasset?',
        desc: 'Depositing ETH/USDT and other underlying assets in the insurance pool can earn stability fees, exchange fees and liquidation residual value, and at the same time stake LP tokens to mine ASET.'
      },
      {
        name: '○ Which institutions invest in paraset?',
        desc: "Parasset investment institutions include: Huobi Ventures, FBG Capital, OKEx Blockdream Ventures, 21DAO, AU21, Gravity Resource, LD Capital, Infinity Labs, HOT LABS, Kernel Ventures, LINKVC, Kyros Ventures, All For Ventures, 100X Capital, YBB. Foundation, 7 O'Clock Capital"
      }
    ]
  }, [])

  const scrollToAnchor = anchorName => {
    if (anchorName) {
      let anchorElement = document.getElementById(anchorName)
      if (anchorElement) {
        anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const provider = new ethers.providers.Web3Provider(
    web3ProviderFrom(config.defaultProvider),
    config.chainId
  )

  const fetchPools = useCallback(async () => {
    const contracts = {}
    for (const [name, deployment] of Object.entries(config.deployments)) {
      contracts[name] = new Contract(deployment.address, deployment.abi, provider)
    }
    const externalTokens = {}
    for (const [symbol, [address, decimal]] of Object.entries(config.externalTokens)) {
      externalTokens[symbol] = new ERC20(address, provider, symbol, decimal) // TODO: add decimal
    }

    const debts = []
    for (const debtInfo of Object.values(debtDefinitions)) {
      debts.push({
        ...debtInfo,
        address: config.deployments[debtInfo.contract].address,
        mortgagePoolContract: contracts[debtInfo.contract],
        mortgageToken: externalTokens[debtInfo.depositTokenName],
        uToken: externalTokens[debtInfo.earnTokenName]
      })
    }

    const balance0 = await provider.getBalance('0x505eFcC134552e34ec67633D1254704B09584227')
    const balance1 = await debts[1].mortgageToken.balanceOf(
      '0x505eFcC134552e34ec67633D1254704B09584227'
    )
    const balance2 = await debts[2].mortgageToken.balanceOf(
      '0x9a5C88aC0F209F284E35b4306710fEf83b8f9723'
    )

    const getAvgPrice = async () => {
      try {
        const { NestQuery } = contracts
        const { USDT } = externalTokens
        let { avgPrice } = await NestQuery.triggeredPriceInfo(USDT.address)
        return getTonumber(avgPrice, USDT.decimal)
      } catch (error) {
        return '0'
      }
    }

    const getNESTToUSDTPrice = async () => {
      try {
        const { NestQuery } = contracts
        const { USDT, NEST } = externalTokens
        let { avgPrice: avgPriceUSDT } = await NestQuery.triggeredPriceInfo(USDT.address)
        let { avgPrice: avgPriceNEST } = await NestQuery.triggeredPriceInfo(NEST.address)
        // avgPrice2/avgPrice1=NEST对u的价格
        return getNumberToFixed(
          new BigNumber(getTonumber(avgPriceUSDT, USDT.decimal)).div(
            getTonumber(avgPriceNEST, NEST.decimal)
          )
        )
      } catch (error) {
        return '0'
      }
    }

    const ETHAvgPrice = await getAvgPrice()
    const NESTToUSDTPrice = await getNESTToUSDTPrice()

    const tvl0 = new BigNumber(getTonumber(balance0, 18)).times(ETHAvgPrice).toNumber()
    const tvl1 = new BigNumber(getTonumber(balance1, 18)).times(NESTToUSDTPrice).toNumber()
    const tvl2 = new BigNumber(getTonumber(balance2, 18)).times(NESTToUSDTPrice).toNumber()

    const ETHTVL = $isPositiveNumber($isFiniteNumber(tvl0))
    const NESTTVL = $isPositiveNumber($isFiniteNumber(new BigNumber(tvl1).plus(tvl2).toNumber()))
    const totalmortgageAssetValue = $isFiniteNumber(new BigNumber(ETHTVL).plus(NESTTVL).toNumber())
    setTotal(formatValue(totalmortgageAssetValue))
  }, [provider])

  useEffect(() => {
    fetchPools()
  }, [fetchPools, total])

  return (
    <div className="wrapper flex">
      <aside className="left flex-shrink-0 bg-white">
        <section className="top flex items-center justify-center">
          <img src={logo} alt="logo" className="logo" />
        </section>
        <section className="bottom flex">
          <ul className="flex flex-row-reverse mx-auto">
            <li>
              <a onClick={() => scrollToAnchor('home')}>HOME</a>
            </li>
            <li>
              <a onClick={() => scrollToAnchor('features')}>FEATURES</a>
            </li>
            <li>
              <a onClick={() => scrollToAnchor('faq')}>FAQ</a>
            </li>
            <li>
              <a onClick={() => scrollToAnchor('community')}>CONMMUNITY</a>
            </li>
          </ul>
        </section>
      </aside>
      <div className="right flex-1">
        <section className="top bg-white" id="home"/>
        <section className="bottom">
          <div className="banner flex justify-center flex-col">
            <Danmu speed="10">stake your crypto</Danmu>
            <Danmu speed="12">assets to mint</Danmu>
            <Danmu speed="11">parallel assets</Danmu>
            <p className="desc">Value reengineering based on oracle</p>
            <a href="https://parasset.top/">
              <div className="button">app</div>
            </a>
          </div>
          <div className="total flex justify-between flex-col">
            <p>Total value locked</p>
            <p className="amount">${total}</p>
          </div>
        </section>
        <Part
          id="features"
          title="features"
          subTitle="security"
          list={featureList}
          titleBg={`url(${featuresBg}) center center / cover no-repeat #459EB5`}
        />
        <Part id="stability" title="stability" list={stabilityList} isRight />
        <Part title="diversity" list={diversityList} />
        <Part
          id="faq"
          title="FAQ"
          list={faqList}
          titleBg={`url(${faqBg}) center center / cover no-repeat #EF7F63`}
          collapse
        />
        <Community />
        <section className="footer"/>
      </div>
    </div>
  )
}

export default Index
