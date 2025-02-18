<template>
  <Dropdown
    hide-bottom-border
    :selector-class="'bg-gray-900 px-4 rounded-lg h-[38px]'"
  >
    <template slot="title">
      <div class="flex items-center justify-between bg-gray-900 flex-grow">
        <slot name="label" />
        <span
          class="text-sm"
          :class="{ 'text-gray-200': value !== undefined }"
          data-cy="reusable-selected-value-text-content"
        >
          {{ selectedValue }}
        </span>
      </div>
    </template>

    <div class="text-center cursor-pointer">
      <SelectorItem
        v-for="(item, index) in list"
        :key="`type-selector-${index}`"
        :item="item"
        :data-cy="'reusable-selector-item-' + item.text + '-text-content'"
        @click="handleClick"
      >
        {{ item.text }}
      </SelectorItem>
    </div>
  </Dropdown>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TradeDirection } from '@injectivelabs/ts-types'
import { TransferType } from '@injectivelabs/sdk-ts'
import Dropdown from '~/components/elements/dropdown.vue'
import SelectorItem from '~/components/layout/selectors/selector-item.vue'
import { TradeSelectorType, TradeTypes } from '~/types/enums'
import { OrderTypeFilter } from '~/types'

export default Vue.extend({
  components: {
    Dropdown,
    SelectorItem
  },

  props: {
    type: {
      type: String as PropType<TradeSelectorType>,
      required: true
    },

    value: {
      type: [String, Object],
      default: undefined
    }
  },

  data() {
    return {
      placeholder: '',
      list: [] as {
        text: string
        value: string | OrderTypeFilter | undefined
      }[]
    }
  },

  computed: {
    selectedValue(): string {
      const { list, value: selected, placeholder } = this

      if (!selected) {
        return placeholder
      }

      const selectedValue = list.find(({ value }) => {
        if (typeof selected === 'object') {
          const v = value as OrderTypeFilter

          return (
            v.executionType === selected.executionType &&
            v.orderType === selected.orderType
          )
        }
        return value === selected
      })

      if (selectedValue) {
        return selectedValue.text
      }

      return this.$t('trade.all')
    }
  },

  mounted() {
    this.prePopulateSelectList()
  },

  methods: {
    handleClick({ value }: { value: string | OrderTypeFilter }) {
      this.$emit('click', value)
    },

    prePopulateSelectList() {
      if (this.type === TradeSelectorType.TypeAllSpot) {
        this.list = [
          {
            text: this.$t('trade.limit'),
            value: {
              executionType: 'limit',
              orderType: undefined
            }
          },
          {
            text: this.$t('trade.market'),
            value: {
              executionType: 'market',
              orderType: undefined
            }
          }
        ]
        this.placeholder = this.$t('trade.type')
      }

      if (this.type === TradeSelectorType.TypeAllDerivatives) {
        this.list = [
          {
            text: this.$t('trade.limit'),
            value: {
              executionType: 'limit',
              orderType: undefined
            }
          },
          {
            text: this.$t('trade.market'),
            value: {
              executionType: 'market',
              orderType: undefined
            }
          },
          {
            text: `${this.$t('trade.stopLoss')} ${this.$t('trade.limit')}`,
            value: {
              executionType: 'limit',
              orderType: 'stop_loss'
            }
          },
          {
            text: `${this.$t('trade.stopLoss')} ${this.$t('trade.market')}`,
            value: {
              executionType: 'market',
              orderType: 'stop_loss'
            }
          },
          {
            text: `${this.$t('trade.takeProfit')} ${this.$t('trade.limit')}`,
            value: {
              executionType: 'limit',
              orderType: 'take_profit'
            }
          },
          {
            text: `${this.$t('trade.takeProfit')} ${this.$t('trade.market')}`,
            value: {
              executionType: 'market',
              orderType: 'take_profit'
            }
          }
        ]
        this.placeholder = this.$t('trade.type')
      }

      if (this.type === TradeSelectorType.Type) {
        this.list = [
          {
            text: this.$t('trade.all'),
            value: undefined
          },
          {
            text: this.$t('trade.market'),
            value: TradeTypes.Market
          },
          {
            text: this.$t('trade.limit'),
            value: TradeTypes.Limit
          }
        ]
        this.placeholder = this.$t('trade.type')
      }

      if (this.type === TradeSelectorType.TransferType) {
        this.list = [
          {
            text: this.$t('trade.all'),
            value: undefined
          },
          {
            text: this.$t('walletHistory.transfers.deposit'),
            value: TransferType.Deposit
          },
          {
            text: this.$t('walletHistory.transfers.deposit'),
            value: TransferType.Withdraw
          }
        ]
        this.placeholder = this.$t('trade.type')
      }

      if (this.type === TradeSelectorType.Side) {
        this.list = [
          {
            text: this.$t('trade.all'),
            value: undefined
          },
          {
            text: this.$t('trade.buy'),
            value: TradeDirection.Buy
          },
          {
            text: this.$t('trade.sell'),
            value: TradeDirection.Sell
          }
        ]
        this.placeholder = this.$t('trade.side')
      }

      if (this.type === TradeSelectorType.PositionSide) {
        this.list = [
          {
            text: this.$t('trade.all'),
            value: undefined
          },
          {
            text: this.$t('trade.long'),
            value: TradeDirection.Long
          },
          {
            text: this.$t('trade.short'),
            value: TradeDirection.Short
          }
        ]
        this.placeholder = this.$t('trade.side')
      }
    }
  }
})
</script>
