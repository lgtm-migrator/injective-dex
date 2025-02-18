<template>
  <div class="h-full">
    <HocLoading :status="status">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-4 overflow-x-auto hide-scrollbar">
          <TabSelectorItem
            v-model="component"
            data-cy="activity-open-positions-link"
            :option="components.positions"
          >
            <div class="flex items-center gap-1">
              <span class="whitespace-nowrap">
                {{ $t('activity.openPositions') }}
              </span>

              <span data-cy="activity-open-positions-link-count">
                ({{ totalPositionsCount }})
              </span>
            </div>
          </TabSelectorItem>

          <div class="w-px h-4 bg-gray-500" />

          <TabSelectorItem
            v-model="component"
            data-cy="activity-funding-payments-link"
            :option="components.fundingPayments"
          >
            <div class="flex items-center gap-1">
              <span class="whitespace-nowrap">
                {{ $t('activity.fundingPayments') }}
              </span>
            </div>
          </TabSelectorItem>
        </div>

        <VCard md class="h-full mt-4 xs:mt-6 relative">
          <Positions v-show="component === components.positions" />
          <FundingPayments v-if="component === components.fundingPayments" />
        </VCard>
      </div>
    </HocLoading>
    <ModalAddMargin />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Positions from '~/components/partials/activity/positions/positions.vue'
import FundingPayments from '~/components/partials/activity/positions/funding-payments.vue'
import ModalAddMargin from '~/components/partials/modals/add-margin/index.vue'
import TabSelectorItem from '~/components/partials/activity/common/tab-selector-item.vue'

const components = {
  positions: 'positions',
  fundingPayments: 'funding-payments'
}

export default Vue.extend({
  components: {
    ModalAddMargin,
    Positions,
    FundingPayments,
    TabSelectorItem
  },

  data() {
    return {
      components,
      component: components.positions,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    totalPositionsCount(): number {
      return this.$accessor.positions.subaccountPositionsPagination.total
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.derivatives.init()])
      .then(() => {})
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    Promise.all([
      this.$accessor.positions.streamSubaccountPositions(),
      this.$accessor.derivatives.streamSubaccountOrders(),
      this.$accessor.derivatives.streamSubaccountOrderHistory()
    ])
      .then(() => {
        //
      })
      .catch(this.$onRejected)
  }
})
</script>
