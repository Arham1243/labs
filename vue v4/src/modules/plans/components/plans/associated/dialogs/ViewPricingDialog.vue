<script setup>
import lodash from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    },
    item: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const associatedPlanStore = useAssociatedPlanStore();
const helpers = useHelpers();
const { t } = useI18n();

const loading = ref(false);
const items = ref([]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onMounted(() => {
    getItems();
});

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        params.limit = 500;
        const payload = {
            ...sortFilters.getSortFilters(),
            includes: [{ relation: 'priceRules' }]
        };
        const res = await associatedPlanStore.searchPlanPrices(
            props.id,
            payload,
            params
        );

        items.value = res.data;
    } finally {
        loading.value = false;
    }
};

const getCountryNamesFromRules = (item, ruleName) => {
    return item.rules
        ?.map((item) => item[ruleName]?.name || t('common.all_countries'))
        ?.join(', ');
};

const getFirstTwoCountryNamesFromRules = (item, ruleName) => {
    console.log(item);
    let names = item.rules
        ?.slice(0, 2)
        ?.map((item) => item[ruleName]?.name || t('common.all_countries'))
        ?.join(', ');
    item.rules?.length > 2 ? (names += '...') : '';
    return names || '-';
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Dependant Pricing"
        :style="{ width: '80rem' }"
        data-testid="pricing-dialog"
    >
        <Loader v-if="loading" />
        <div v-else>
            <div class="message-success p-3" data-testid="discount-message">
                <i class="pi pi-info-circle mr-2"></i>
                {{
                    item.percentage > 0
                        ? $t('plans.discount_applied', {
                              percentage: item.percentage,
                              condition: item.condition.name,
                              num_of_dependants: item.num_of_dependants
                          })
                        : $t('plans.no_discount_applied_yet')
                }}
            </div>
            <table
                class="w-full"
                :style="{ borderCollapse: 'collapse', tableLayout: 'auto' }"
                data-testid="pricing-table"
            >
                <thead class="bg-gray-200">
                    <tr style="border-bottom: 1pt solid #ddd">
                        <th class="text-left p-3">Unit Term</th>
                        <th class="text-left p-3">Origin</th>
                        <th class="text-left p-3">Destination</th>
                        <th class="text-left p-3">Residency</th>
                        <th class="text-left p-3">
                            {{ $t('common.effective_date') }}
                        </th>
                        <th class="text-left p-3">
                            {{ $t('common.end_date') }}
                        </th>
                        <th class="text-left p-3">Net Price</th>
                        <th class="text-left p-3">Sale Price</th>
                        <th class="text-left p-3">Dependant Price</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="price in items"
                        :key="price.id"
                        style="border-bottom: 1pt solid #eee"
                    >
                        <td class="p-3">
                            {{ $t(`unit_terms.${price.unit_term}`) }}
                        </td>
                        <td class="p-3">
                            {{
                                getFirstTwoCountryNamesFromRules(
                                    price,
                                    'origin_country_id'
                                )
                            }}
                        </td>
                        <td class="p-3">
                            {{
                                getFirstTwoCountryNamesFromRules(
                                    price,
                                    'destination_country_id'
                                )
                            }}
                        </td>
                        <td class="p-3">
                            {{
                                getFirstTwoCountryNamesFromRules(
                                    price,
                                    'residency_country_id'
                                )
                            }}
                        </td>
                        <td class="p-3">
                            {{ helpers.formatDate(price.effective_date) }}
                        </td>
                        <td class="p-3">
                            {{
                                price.end_date
                                    ? helpers.formatDate(price.end_date)
                                    : '-'
                            }}
                        </td>
                        <td class="p-3">
                            {{
                                price.net_price !== undefined
                                    ? helpers.moneyFormat(price.net_price)
                                    : '-'
                            }}
                        </td>
                        <td class="p-3">
                            {{
                                price.sale_price !== undefined
                                    ? helpers.moneyFormat(price.sale_price)
                                    : '-'
                            }}
                        </td>
                        <td class="p-3">
                            {{
                                item.percentage > 0
                                    ? helpers.moneyFormat(
                                          price.sale_price -
                                              (price.sale_price / 100) *
                                                  item.percentage
                                      )
                                    : '-'
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Dialog>
</template>
