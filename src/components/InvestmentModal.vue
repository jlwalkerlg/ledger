<script setup lang="ts">
import { type FeeType } from '@/models/fees'
import { type InterestRateType } from '@/models/interest-rates'
import { type Investment } from '@/models/investments'
import { addPercentage, getMonthlyInterestRatePercentage } from '@/utils/maths'
import uniqueId from 'lodash-es/uniqueId'
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
import FeeTypeSelect from './FeeTypeSelect.vue'
import InterestRateTypeSelect from './InterestRateTypeSelect.vue'

const defaults = {
  name: 'House',
  initialValue: 144444,
  purchaseFee: {
    type: 'percentage' as FeeType,
    percentage: 5,
    flat: 0,
  },
  monthlyContribution: 0,
  growthRate: {
    type: 'effective' as InterestRateType,
    yearlyPercentage: 3,
  },
  maintenanceCost: {
    yearlyPercentage: 1,
  },
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
const purchaseFee = ref({
  type: investment?.purchaseFee.type ?? defaults.purchaseFee.type,
  percentage:
    investment?.purchaseFee.type === 'percentage'
      ? investment.purchaseFee.value
      : defaults.purchaseFee.percentage,
  flat:
    investment?.purchaseFee.type === 'flat'
      ? investment.purchaseFee.value
      : defaults.purchaseFee.flat,
})
const monthlyContribution = ref(investment?.monthlyContribution ?? defaults.monthlyContribution)
const growthRate = ref({
  type: investment?.growthRate.type ?? defaults.growthRate.type,
  yearlyPercentage: investment?.growthRate.yearlyPercentage ?? defaults.growthRate.yearlyPercentage,
})
const maintenanceCost = ref({
  yearlyPercentage:
    investment?.maintenanceCost.yearlyPercentage ?? defaults.maintenanceCost.yearlyPercentage,
})
const cashOutFeePercentage = ref(investment?.cashOutFeePercentage ?? defaults.cashOutFeePercentage)

const initialPurchasePrice = computed(() =>
  purchaseFee.value.type === 'percentage'
    ? addPercentage(initialValue.value, purchaseFee.value.percentage)
    : initialValue.value + purchaseFee.value.flat,
)

const monthlyGrowthRatePercentage = computed(() =>
  getMonthlyInterestRatePercentage(growthRate.value.yearlyPercentage, growthRate.value.type),
)

const monthlyMaintenanceCostPercentage = computed(() =>
  getMonthlyInterestRatePercentage(maintenanceCost.value.yearlyPercentage, 'effective'),
)

const onCancel = () => {
  visible.value = false
}

const onSave = () => {
  emit('update:investment', {
    id: investment?.id ?? uniqueId(),
    name: name.value,
    initialValue: initialValue.value,
    purchaseFee: {
      type: purchaseFee.value.type,
      value:
        purchaseFee.value.type === 'percentage'
          ? purchaseFee.value.percentage
          : purchaseFee.value.flat,
    },
    monthlyContribution: monthlyContribution.value,
    growthRate: {
      type: growthRate.value.type,
      yearlyPercentage: growthRate.value.yearlyPercentage,
      monthlyPercentage: monthlyGrowthRatePercentage.value,
    },
    maintenanceCost: {
      yearlyPercentage: maintenanceCost.value.yearlyPercentage,
      monthlyPercentage: monthlyMaintenanceCostPercentage.value,
    },
    cashOutFeePercentage: cashOutFeePercentage.value,
  })
  visible.value = false
}

watch(visible, (visible) => {
  if (visible) {
    name.value = investment?.name ?? defaults.name
    initialValue.value = investment?.initialValue ?? defaults.initialValue
    purchaseFee.value.type = investment?.purchaseFee.type ?? defaults.purchaseFee.type
    purchaseFee.value.percentage =
      investment?.purchaseFee.type === 'percentage'
        ? investment.purchaseFee.value
        : defaults.purchaseFee.percentage
    purchaseFee.value.flat =
      investment?.purchaseFee.type === 'flat'
        ? investment.purchaseFee.value
        : defaults.purchaseFee.flat
    monthlyContribution.value = investment?.monthlyContribution ?? defaults.monthlyContribution
    growthRate.value.type = investment?.growthRate.type ?? defaults.growthRate.type
    growthRate.value.yearlyPercentage =
      investment?.growthRate.yearlyPercentage ?? defaults.growthRate.yearlyPercentage
    maintenanceCost.value.yearlyPercentage =
      investment?.maintenanceCost.yearlyPercentage ?? defaults.maintenanceCost.yearlyPercentage
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
          <InputText
            id="investment_name"
            v-model="name"
            placeholder="House"
            :pt="{ root: { autofocus: true } }"
          />
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
        <label for="purchase_fee_type">Purchase Fee Type</label>
        <InputGroup>
          <FeeTypeSelect v-model="purchaseFee.type" label-id="purchase_fee_type" />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Select the type of growth rate.
        </Message>
      </div>

      <div v-if="purchaseFee.type === 'percentage'" class="space-y-2">
        <label for="purchase_fee_percentage">Purchase Fee</label>
        <InputGroup>
          <InputNumber
            input-id="purchase_fee_percentage"
            v-model="purchaseFee.percentage"
            :min="0"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the fee associated with purchasing the investment as a percentage of the investment
          value.
        </Message>
      </div>

      <div v-if="purchaseFee.type === 'flat'" class="space-y-2">
        <label for="purchase_fee_flat">Purchase Fee</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="purchase_fee_flat"
            v-model="purchaseFee.flat"
            :min="0"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter the fee associated with purchasing the investment.
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
        <label for="monthly_contribution">Monthly Contribution</label>
        <InputGroup>
          <InputGroupAddon>£</InputGroupAddon>
          <InputNumber
            input-id="monthly_contribution"
            v-model="monthlyContribution"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
          />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter any additional contribution you'll invest into the investment on a monthly basis.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="growth_rate_type">Growth Rate Type</label>
        <InputGroup>
          <InterestRateTypeSelect v-model="growthRate.type" label-id="growth_rate_type" />
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Select the type of growth rate.
        </Message>
      </div>

      <div class="space-y-2">
        <label for="annual_growth_rate_percentage">Annual Growth Rate</label>
        <InputGroup>
          <InputNumber
            input-id="annual_growth_rate_percentage"
            v-model="growthRate.yearlyPercentage"
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
        <label for="annual_maintenance_cost_percentage">Annual Maintenance Cost</label>
        <InputGroup>
          <InputNumber
            input-id="annual_maintenance_cost_percentage"
            v-model="maintenanceCost.yearlyPercentage"
            :min="0"
            :max="100"
            :max-fraction-digits="2"
          />
          <InputGroupAddon>%</InputGroupAddon>
        </InputGroup>
        <Message size="small" severity="secondary" variant="simple">
          Enter any annual maintenance cost associated with holding the investment as a percentage
          of the investment. For example, for a property, this could be how much you expect to spend
          on repairs each year. This is expected to be an effective rate compounded monthly.
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
