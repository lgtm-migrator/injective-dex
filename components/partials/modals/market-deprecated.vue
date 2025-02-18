<template>
  <VModal :is-open="isModalOpen" has-blur-bg sm @modal-closed="closeModal">
    <h3 slot="title" class="text-base">
      {{ $t('marketDeprecated.title') }}
    </h3>

    <div class="relative">
      <i18n path="marketDeprecated.description" tag="p" class="text-sm mb-3">
        <span slot="ticker" class="font-bold">{{ ticker }}</span>
      </i18n>

      <p v-if="isTerraNetwork" class="text-sm">
        {{ $t('marketDeprecated.terraDescription') }}
      </p>

      <ul v-else class="list-disc ml-4 text-xs">
        <li>{{ $t('marketDeprecated.subDescriptionOne', { ticker }) }}</li>
        <i18n path="marketDeprecated.subDescriptionTwo" tag="li" class="mt-2">
          <span slot="symbol" class="uppercase">{{ symbol }}</span>
          <span slot="network" class="capitalize">{{ network }}</span>
        </i18n>
      </ul>

      <div class="mt-6 flex flex-col gap-4">
        <nuxt-link :to="{ name: 'markets' }" class="">
          <VButton lg primary class="w-full rounded" @click.stop="() => {}">
            <span class="font-semibold">
              {{ $t('marketDeprecated.exploreOtherMarkets') }}
            </span>
          </VButton>
        </nuxt-link>

        <VButton
          v-if="!isTerraNetwork"
          lg
          outline
          class="rounded"
          @click.stop="() => {}"
        >
          <a
            :href="`https://hub.injective.network/bridge/?token=${symbol}`"
            target="_blank"
            class="flex items-center justify-center text-primary-500 hover:text-primary-600"
          >
            <span class="mr-2 font-semibold">
              {{ $t('marketDeprecated.injectiveBridge') }}
            </span>
            <IconExternalLink class="w-4 h-4" />
          </a>
        </VButton>
      </div>
    </div>
  </VModal>
</template>

<script lang="ts">
import {
  BridgingNetwork,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Vue, { PropType } from 'vue'
import { Modal } from '~/types'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    }
  },

  computed: {
    isTerraNetwork(): boolean {
      const { market } = this

      return ['luna-ust', 'luna-ust-perp'].includes(market.slug)
    },

    ticker(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      return market.ticker
    },

    symbol(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      return market.baseToken.symbol
    },

    network(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      // todo: expand conditions as required
      if (market.slug === 'huahua-usdt') {
        return BridgingNetwork.Chihuahua
      }

      return BridgingNetwork.Injective
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MarketDeprecated]
    }
  },

  beforeDestroy() {
    this.$accessor.modal.closeModal(Modal.MarketDeprecated)
  },

  methods: {
    closeModal() {
      this.$router.push({ name: 'index' })
    }
  }
})
</script>
