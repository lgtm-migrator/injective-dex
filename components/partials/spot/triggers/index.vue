<template>
  <div v-if="market" class="h-full">
    <!-- mobile table -->
    <!-- <TableBody
      :show-empty="triggers.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <MobileTrade
        v-for="(trade, index) in filteredTrades"
        :key="`mobile-trade-history-${index}`"
        class="col-span-1"
        :trade="trade"
        @showTradeDetails="handleShowTradeDetails"
      />

      <EmptyList
        slot="empty"
        :message="$t('trade.emptyTriggers')"
        class="min-h-orders"
      />
    </TableBody> -->

    <TableWrapper class="hidden sm:block">
      <table v-if="triggers.length > 0" class="table">
        <TriggersTableHeader />
        <tbody>
          <tr
            is="Trigger"
            v-for="(trigger, index) in triggers"
            :key="`triggers-${index}`"
            :trigger="trigger"
          />
        </tbody>
      </table>
      <EmptyList v-else :message="$t('trade.emptyTriggers')" />
    </TableWrapper>

    <!-- <ModalMobileTradeDetails :trade="tradeDetails" /> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiSpotMarketWithToken,
  UiSpotOrderHistory
  // UiSpotTrade
} from '@injectivelabs/sdk-ui-ts'
// import MobileTrade from '~/components/partials/common/trade/mobile-trade.vue'
// import ModalMobileTradeDetails from '~/components/partials/modals/mobile-trade-details.vue'
import Trigger from '~/components/partials/common/spot/trigger.vue'
import TriggersTableHeader from '~/components/partials/common/spot/triggers-table-header.vue'
// import TableBody from '~/components/elements/table-body.vue'
// import { Modal } from '~/types'

export default Vue.extend({
  components: {
    Trigger,
    // MobileTrade,
    // ModalMobileTradeDetails,
    // TableBody,
    TriggersTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {}
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    triggers(): UiSpotOrderHistory[] {
      return this.$accessor.spot.subaccountConditionalOrders
    }
  }

  // methods: {
  //   handleShowTradeDetails(trade: UiSpotTrade) {
  //     this.$accessor.modal.openModal(Modal.MobileTradeDetails)
  //   }
  // }
})
</script>
