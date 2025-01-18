<script setup lang="ts">
import type { Investment } from '@/models/investments'
import { aerToMonthly } from '@/utils/maths'
import {
  Button,
  Dialog,
  InputGroup,
  InputGroupAddon,
  InputNumber,
  InputText,
  Message,
} from 'primevue'
import { computed, ref, watch } from 'vue'

const defaults = {
  name: 'House',
  initialValue: 144444,
  purchaseFeePercentage: 5,
  annualGrowthRatePercentage: 3,
  annualMaintenanceCostPercentage: 1,
  cashOutFeePercentage: 5,
}

const { investment } = defineProps<{
  investment?: Investment
}>()

const emit = defineEmits<{
  (e: 'update:investment', value: Investment): void
}>()

const visible = defineModel<boolean>('visible')

const name = ref(investment?.name ?? defaults.name)
const initialValue = ref(investment?.initialValue ?? defaults.initialValue)
const purchaseFeePercentage = ref(
  investment?.purchaseFeePercentage ?? defaults.purchaseFeePercentage,
)
const annualGrowthRatePercentage = ref(
  investment?.annualGrowthRatePercentage ?? defaults.annualGrowthRatePercentage,
)
const annualMaintenanceCostPercentage = ref(
  investment?.annualMaintenanceCostPercentage ?? defaults.annualMaintenanceCostPercentage,
)
const cashOutFeePercentage = ref(investment?.cashOutFeePercentage ?? defaults.cashOutFeePercentage)

const initialPurchasePrice = computed(
  () => initialValue.value * (1 + purchaseFeePercentage.value / 100),
)

const monthlyGrowthRatePercentage = computed(() => aerToMonthly(annualGrowthRatePercentage.value))

const monthlyMaintenanceCostPercentage = computed(() =>
  aerToMonthly(annualMaintenanceCostPercentage.value),
)

const onCancel = () => {
  visible.value = false
}

const onSave = () => {
  emit('update:investment', {
    name: name.value,
    initialValue: initialValue.value,
    purchaseFeePercentage: purchaseFeePercentage.value,
    annualGrowthRatePercentage: annualGrowthRatePercentage.value,
    monthlyGrowthRatePercentage: monthlyGrowthRatePercentage.value,
    annualMaintenanceCostPercentage: annualMaintenanceCostPercentage.value,
    monthlyMaintenanceCostPercentage: monthlyMaintenanceCostPercentage.value,
    cashOutFeePercentage: cashOutFeePercentage.value,
  })
  visible.value = false
}

watch(visible, (visible) => {
  if (visible) {
    name.value = investment?.name ?? defaults.name
    initialValue.value = investment?.initialValue ?? defaults.initialValue
    purchaseFeePercentage.value =
      investment?.purchaseFeePercentage ?? defaults.purchaseFeePercentage
    annualGrowthRatePercentage.value =
      investment?.annualGrowthRatePercentage ?? defaults.annualGrowthRatePercentage
    annualMaintenanceCostPercentage.value =
      investment?.annualMaintenanceCostPercentage ?? defaults.annualMaintenanceCostPercentage
    cashOutFeePercentage.value = investment?.cashOutFeePercentage ?? defaults.cashOutFeePercentage
  }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="investment ? 'Edit Investment' : 'Add Investment'"
    :draggable="false"
    dismissableMask
  >
    <form class="space-y-4" @submit.prevent="onSave">
      <div class="space-y-2">
        <label for="investment_name">Name</label>
        <InputGroup>
          <InputText id="investment_name" v-model="name" placeholder="House" />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter a name for the investment.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="initial_value">Value</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="initial_value"
            v-model="initialValue"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the initial value of your investment.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="purchase_fee_percentage">Purchase Fee</label>
        <InputGroup>
          <InputNumber
            input-id="purchase_fee_percentage"
            v-model="purchaseFeePercentage"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the fee associated with purchasing the investment as a percentage of the investment
          value.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="initial_purchase_price">Purchase Price</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="initial_purchase_price"
            :model-value="initialPurchasePrice"
            disabled
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          This is the total amount that it cost to buy the investment, including its initial value
          and any purchase fee.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="annual_maintenance_cost_percentage"> Annual Maintenance Cost </label>
        <InputGroup>
          <InputNumber
            input-id="annual_maintenance_cost_percentage"
            v-model="annualMaintenanceCostPercentage"
            :min="0"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter any annual maintenance cost associated with holding the investment as a percentage
          of the investment. For example, for a property, this could be how much you expect to spend
          on repairs each year.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="monthly_maintenance_cost_percentage"> Monthly Maintenance Cost </label>
        <InputGroup>
          <InputNumber
            input-id="monthly_maintenance_cost_percentage"
            :model-value="monthlyMaintenanceCostPercentage"
            disabled
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          This is the cost of maintaining the investment each month as a percentage of the
          investment.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="annual_growth_rate_percentage">Annual Growth Rate</label>
        <InputGroup>
          <InputNumber
            input-id="annual_growth_rate_percentage"
            v-model="annualGrowthRatePercentage"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the expected annual growth rate of your investment.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="monthly_growth_rate_percentage">Monthly Growth Rate</label>
        <InputGroup>
          <InputNumber
            input-id="monthly_growth_rate_percentage"
            :model-value="monthlyGrowthRatePercentage"
            disabled
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          This is the expected monthly growth rate of your investment.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="cash_out_fee_percentage">Cash Out Fee</label>
        <InputGroup>
          <InputNumber
            input-id="cash_out_fee_percentage"
            v-model="cashOutFeePercentage"
            :min="0"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the fee associated with cashing out on the investment as a percentage of the
          investment value. For example, for a property, this could include solicitor fees.
        </Message>
      </div>

      <div class="flex items-center justify-end gap-4">
        <Button type="button" variant="outlined" @click="onCancel">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  </Dialog>
</template>
