<template>
  <div
    class="group w-full border-t-4 cursor-pointer shadow-card text-gray-200 bg-helixGray-950"
    :class="{
      'border-primary-500 rounded-b-md': isSelected,
      'border-transparent rounded-b-md opacity-50 rounded-t-md hover:border-primary-500 hover:rounded-b-md hover:rounded-t-none hover:opacity-100':
        !isSelected,
      'px-4 py-5': lg,
      'p-3 lg:px-4 lg:py-5': !lg
    }"
    @click="$emit('selected', option)"
  >
    <div
      class="h-full flex flex-col"
      :class="{ 'min-w-2xs sm:min-w-full': lg }"
    >
      <slot name="subtitle"></slot>

      <div class="flex items-center h-full" :class="{ 'justify-between': lg }">
        <div v-if="status.isLoading()" class="mr-4">
          <span class="spinner text-primary-500" />
        </div>

        <div
          v-else
          class="rounded-full mr-4 flex items-center justify-center"
          :class="[
            lg ? 'min-w-12 w-12 h-12' : 'w-4 h-4 md:w-6 md:h-6',
            {
              'bg-primary-500': isSelected,
              'bg-gray-600 group-hover:bg-primary-850': !isSelected
            }
          ]"
        >
          <slot name="icon" />
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status } from '@injectivelabs/utils'

export default Vue.extend({
  model: {
    prop: 'value',
    event: 'selected'
  },

  props: {
    status: {
      required: false,
      type: Object as PropType<Status>,
      default: () => new Status()
    },

    value: {
      required: true,
      type: [String, Number]
    },

    option: {
      required: true,
      type: [String, Number]
    },

    lg: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isSelected(): boolean {
      return this.option === this.value
    }
  }
})
</script>
