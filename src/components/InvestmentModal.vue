<script setup lang="ts">
import { type FeeType } from '@/models/fees'
import { type InterestRateType } from '@/models/interest-rates'
import { type Investment } from '@/models/investments'
import { addPercentage, getMonthlyInterestRatePercentage } from '@/utils/maths'
import uniqueId from 'lodash-es/uniqueId'
import { Button, Dialog, InputGroup, InputGroupAddon, InputNumber, InputText } from 'primevue'
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
  cashOutFee: {
    type: 'percentage' as FeeType,
    percentage: 5,
    flat: 0,
    growthRate: {
      type: 'effective' as InterestRateType,
      yearlyPercentage: 0,
    },
  },
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
const cashOutFee = ref({
  type: investment?.cashOutFee.type ?? defaults.cashOutFee.type,
  percentage:
    investment?.cashOutFee.type === 'percentage'
      ? investment.cashOutFee.value
      : defaults.cashOutFee.percentage,
  flat:
    investment?.cashOutFee.type === 'flat' ? investment.cashOutFee.value : defaults.cashOutFee.flat,
  growthRate: {
    type: investment?.cashOutFee.growthRate?.type ?? defaults.cashOutFee.growthRate.type,
    yearlyPercentage:
      investment?.cashOutFee.growthRate?.yearlyPercentage ??
      defaults.cashOutFee.growthRate.yearlyPercentage,
  },
})

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

const cashOutFeeMonthlyGrowthRatePercentage = computed(() =>
  getMonthlyInterestRatePercentage(
    cashOutFee.value.growthRate.yearlyPercentage,
    cashOutFee.value.growthRate.type,
  ),
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
    cashOutFee:
      cashOutFee.value.type === 'percentage'
        ? {
            type: cashOutFee.value.type,
            value: cashOutFee.value.percentage,
          }
        : {
            type: cashOutFee.value.type,
            value: cashOutFee.value.flat,
            growthRate: {
              type: cashOutFee.value.growthRate.type,
              yearlyPercentage: cashOutFee.value.growthRate.yearlyPercentage,
              monthlyPercentage: cashOutFeeMonthlyGrowthRatePercentage.value,
            },
          },
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
    cashOutFee.value.type = investment?.cashOutFee.type ?? defaults.cashOutFee.type
    cashOutFee.value.percentage =
      investment?.cashOutFee.type === 'percentage'
        ? investment.cashOutFee.value
        : defaults.cashOutFee.percentage
    cashOutFee.value.flat =
      investment?.cashOutFee.type === 'flat'
        ? investment.cashOutFee.value
        : defaults.cashOutFee.flat
    cashOutFee.value.growthRate.type =
      investment?.cashOutFee.growthRate?.type ?? defaults.cashOutFee.growthRate.type
    cashOutFee.value.growthRate.yearlyPercentage =
      investment?.cashOutFee.growthRate?.yearlyPercentage ??
      defaults.cashOutFee.growthRate.yearlyPercentage
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
    class="w-full max-w-[1000px]"
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
      </div>

      <div class="space-y-2">
        <label for="purchase_fee_type">Purchase Fee Type</label>
        <InputGroup>
          <FeeTypeSelect v-model="purchaseFee.type" label-id="purchase_fee_type" />
        </InputGroup>
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
      </div>

      <div class="space-y-2">
        <label for="growth_rate_type">Growth Rate Type</label>
        <InputGroup>
          <InterestRateTypeSelect v-model="growthRate.type" label-id="growth_rate_type" />
        </InputGroup>
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
      </div>

      <div class="space-y-2">
        <label for="cash_out_fee_type">Cash Out Fee Type</label>
        <InputGroup>
          <FeeTypeSelect v-model="cashOutFee.type" input-id="cash_out_fee_type" />
        </InputGroup>
      </div>

      <template v-if="cashOutFee.type === 'percentage'">
        <div class="space-y-2">
          <label for="cash_out_fee_percentage">Cash Out Fee</label>
          <InputGroup>
            <InputNumber
              input-id="cash_out_fee_percentage"
              v-model="cashOutFee.percentage"
              :min="0"
              :max="100"
              :max-fraction-digits="2"
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
        </div>
      </template>

      <template v-else>
        <div class="space-y-2">
          <label for="cash_out_fee_flat">Cash Out Fee</label>
          <InputGroup>
            <InputGroupAddon>£</InputGroupAddon>
            <InputNumber
              input-id="cash_out_fee_flat"
              v-model="cashOutFee.flat"
              :min-fraction-digits="2"
              :max-fraction-digits="2"
            />
          </InputGroup>
        </div>

        <div class="space-y-2">
          <label for="cash_out_fee_growth_rate_type">Cash Out Fee Growth Rate Type</label>
          <InputGroup>
            <InterestRateTypeSelect
              v-model="cashOutFee.growthRate.type"
              input-id="cash_out_fee_growth_rate_type"
            />
          </InputGroup>
        </div>

        <div class="space-y-2">
          <label for="cash_out_fee_annual_growth_rate_percentage">
            Cash Out Fee Annual Growth Rate
          </label>
          <InputGroup>
            <InputNumber
              input-id="cash_out_fee_annual_growth_rate_percentage"
              v-model="cashOutFee.growthRate.yearlyPercentage"
              :max="100"
              :max-fraction-digits="2"
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
        </div>

        <div class="space-y-2">
          <label for="cash_out_fee_monthly_growth_rate_percentage">
            Cash Out Fee Monthly Growth Rate
          </label>
          <InputGroup>
            <InputNumber
              input-id="cash_out_fee_monthly_growth_rate_percentage"
              :model-value="cashOutFeeMonthlyGrowthRatePercentage"
              disabled
              :max-fraction-digits="2"
            />
            <InputGroupAddon>%</InputGroupAddon>
          </InputGroup>
        </div>
      </template>

      <div class="flex items-center justify-end gap-4">
        <Button type="button" variant="outlined" @click="onCancel">Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  </Dialog>
</template>
