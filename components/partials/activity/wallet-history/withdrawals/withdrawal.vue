<template>
  <tr data-cy="wallet-history-table-row">
    <td class="h-8 font-mono">
      <span
        class="text-gray-400 text-xs"
        data-cy="wallet-history-time-table-data"
      >
        {{ time }}
      </span>
    </td>

    <td
      class="h-8 text-left"
      data-cy="wallet-history-operation-type-table-data"
    >
      <span class="text-white text-xs">
        {{ transferType }}
      </span>
    </td>

    <td class="h-8 text-left cursor-pointer">
      <div class="flex items-center justify-start">
        <div v-if="transaction.token" class="w-6 h-6">
          <img
            :src="tokenLogo"
            :alt="transaction.token.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="wallet-history-asset-table-data"
          >
            {{ transaction.token.symbol }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-right font-mono">
      <VNumber
        xs
        :decimals="UI_DEFAULT_MIN_DISPLAY_DECIMALS"
        :number="amount"
        :rounding-mode="BIG_NUMBER_ROUND_HALF_UP_MODE"
        data-cy="wallet-history-amount-table-data"
      >
        <span slot="addon" class="text-xs text-gray-500">
          {{ transaction.token.symbol }}
        </span>
      </VNumber>
    </td>

    <td class="h-8 text-left font-mono">
      <VAddress
        xs
        :address="transaction.sender"
        data-cy="wallet-history-sender-table-data"
      >
        {{ formattedOrigin }}
      </VAddress>
    </td>

    <td class="h-8 text-left font-mono">
      <VAddress
        xs
        :address="transaction.receiver"
        data-cy="wallet-history-receiver-table-data"
      >
        {{ formattedDestination }}
      </VAddress>
    </td>

    <td class="text-right">
      <a
        :href="transaction.explorerLink"
        data-cy="wallet-history-explorer-link"
        target="_blank"
        class="text-primary-500 cursor-pointer pr-2 text-xs"
      >
        {{ $t('common.view') }}
      </a>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumberInBase,
  BigNumberInWei,
  formatWalletAddress
} from '@injectivelabs/utils'
import { format } from 'date-fns'
import {
  getTokenLogoWithVendorPathPrefix,
  UiBridgeTransactionWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  BIG_NUMBER_ROUND_HALF_UP_MODE,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import VAddress from '~/components/partials/activity/wallet-history/common/address.vue'

export default Vue.extend({
  components: {
    VAddress
  },

  props: {
    transaction: {
      required: true,
      type: Object as PropType<UiBridgeTransactionWithToken>
    }
  },

  data() {
    return {
      BIG_NUMBER_ROUND_HALF_UP_MODE,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS
    }
  },

  computed: {
    formattedOrigin(): string {
      const { transaction } = this

      return formatWalletAddress(transaction.sender)
    },

    formattedDestination(): string {
      const { transaction } = this

      return formatWalletAddress(transaction.receiver)
    },

    amount(): BigNumberInBase {
      const { transaction } = this

      if (!transaction.amount) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(transaction.amount).toBase(
        transaction.token.decimals
      )
    },

    transferType(): string {
      const { transaction } = this

      if (transaction.receiver.startsWith('axelar')) {
        return this.$t('walletHistory.axelarWithdrawalType')
      }

      if (transaction.receiver.startsWith('chihuahua')) {
        return this.$t('walletHistory.chihuahuaWithdrawalType')
      }

      if (transaction.receiver.startsWith('cosmos')) {
        return this.$t('walletHistory.cosmosWithdrawalType')
      }

      if (transaction.receiver.startsWith('juno')) {
        return this.$t('walletHistory.junoWithdrawalType')
      }

      if (transaction.receiver.startsWith('osmo')) {
        return this.$t('walletHistory.osmosisWithdrawalType')
      }

      if (transaction.receiver.startsWith('terra')) {
        return this.$t('walletHistory.terraWithdrawalType')
      }

      if (transaction.receiver.startsWith('evmos')) {
        return this.$t('walletHistory.evmosWithdrawalType')
      }

      if (
        transaction.sender.startsWith('inj') &&
        transaction.receiver.startsWith('inj')
      ) {
        return this.$t('walletHistory.INJTransferType')
      }

      return this.$t('walletHistory.ethWithdrawalType')
    },

    time(): string {
      const { transaction } = this

      if (!transaction.timestamp) {
        return ''
      }

      return format(transaction.timestamp, 'dd MMM HH:mm:ss')
    },

    tokenLogo(): string {
      const { transaction } = this

      return getTokenLogoWithVendorPathPrefix(transaction.token.logo)
    }
  }
})
</script>
