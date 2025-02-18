<template>
  <HocLoading :status="status" :show-loading="mappedMarkets.length === 0">
    <div>
      <VOverview v-if="mappedMarkets.length > 0" :markets="mappedMarkets" />
      <Markets :markets="mappedMarkets" />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken,
  zeroDerivativeMarketSummary
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import Markets from '~/components/partials/markets/index.vue'
import Overview from '~/components/partials/markets/overview.vue'
import { UiMarketAndSummaryWithVolumeInUsd, TokenUsdPriceMap } from '~/types'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    Markets,
    VOverview: Overview
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    derivativeMarketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    spotMarketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    upcomingMarkets(): Array<
      UiSpotMarketWithToken | UiDerivativeMarketWithToken
    > {
      return this.$accessor.exchange.upcomingMarkets
    },

    upcomingMarketSummaries(): Array<
      UiSpotMarketSummary | UiDerivativeMarketSummary
    > {
      return this.$accessor.exchange.upcomingMarketsSummaries
    },

    deprecatedMarkets(): Array<
      UiSpotMarketWithToken | UiDerivativeMarketWithToken
    > {
      return this.$accessor.exchange.deprecatedMarkets
    },

    deprecatedMarketSummaries(): Array<
      UiSpotMarketSummary | UiDerivativeMarketSummary
    > {
      return this.$accessor.exchange.deprecatedMarketsSummaries
    },

    tokenUsdPriceMap(): TokenUsdPriceMap {
      return this.$accessor.token.tokenUsdPriceMap
    },

    markets(): Array<UiSpotMarketWithToken | UiDerivativeMarketWithToken> {
      const {
        spotMarkets,
        derivativeMarkets,
        upcomingMarkets,
        deprecatedMarkets
      } = this

      return [
        ...derivativeMarkets,
        ...spotMarkets,
        ...upcomingMarkets,
        ...deprecatedMarkets
      ]
    },

    marketsSummary(): Array<UiSpotMarketSummary | UiDerivativeMarketSummary> {
      const {
        spotMarketsSummary,
        derivativeMarketsSummary,
        upcomingMarketSummaries,
        deprecatedMarketSummaries
      } = this

      return [
        ...derivativeMarketsSummary,
        ...spotMarketsSummary,
        ...upcomingMarketSummaries,
        ...deprecatedMarketSummaries,
        zeroDerivativeMarketSummary(
          '0x7ba77b6c69c15270bd9235f11a0068f3080017116aa3c57e17c16f49ea13f57f'
        ) /* TODO remove */,
        zeroDerivativeMarketSummary(
          '0x59d526be33d5b00e856903810a5cc7676892f47954267805721614a403862470'
        ) /* TODO remove */
      ]
    },

    mappedMarkets(): UiMarketAndSummaryWithVolumeInUsd[] {
      const { markets, marketsSummary, tokenUsdPriceMap } = this

      return markets
        .map((market) => {
          const summary = marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
          const quoteTokenUsdPrice = new BigNumberInBase(
            tokenUsdPriceMap[market.quoteToken.coinGeckoId]
          )
          const volumeInUsd = quoteTokenUsdPrice.multipliedBy(
            summary?.volume || '0'
          )

          return {
            market,
            volumeInUsd,
            summary
          }
        })
        .filter(
          ({ summary, volumeInUsd }) =>
            summary !== undefined &&
            !volumeInUsd.isNaN() &&
            volumeInUsd.isFinite()
        ) as UiMarketAndSummaryWithVolumeInUsd[]
    }
  },

  mounted() {
    this.setMarketSummariesPolling()
  },

  beforeDestroy() {
    clearInterval(this.interval)
  },

  methods: {
    getMarketSummariesAndQuoteTokenPrice(): Promise<void[]> {
      return Promise.all([
        this.$accessor.token.getTokenUsdPriceMap([
          ETH_COIN_GECKO_ID,
          USDT_COIN_GECKO_ID,
          UST_COIN_GECKO_ID
        ]),
        this.$accessor.app.pollMarkets()
      ])
    },

    setMarketSummariesPolling() {
      this.getMarketSummariesAndQuoteTokenPrice()
        .then(() => {
          this.interval = setInterval(async () => {
            await this.getMarketSummariesAndQuoteTokenPrice()
          }, 1000 * 10)
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
