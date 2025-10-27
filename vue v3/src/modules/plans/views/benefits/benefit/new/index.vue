<script setup>
import lodash from 'lodash';
import { ref, watch, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const benefitStore = useBenefitStore();
const { bus } = useEventsBus();

provideEditState();

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Benefit Details',
        to: { name: 'New Benefit', params: { id } }
    },
    {
        label: 'Select Services',
        to: { name: 'New Benefit Step 2', params: { id } }
    },
    {
        label: 'Pricing',
        to: { name: 'New Benefit Step 3', params: { id } }
    },
    {
        label: 'Documents',
        to: { name: 'New Benefit Step 4', params: { id } }
    },
    {
        label: 'Review',
        to: { name: 'New Benefit Step 5', params: { id } }
    }
]);

onBeforeMount(() => {
    getItem();
});

watch(
    () => [benefitStore.currentBenefit],
    () => {
        if (benefitStore.currentBenefit)
            id.value = benefitStore.currentBenefit.id;
    }
);

watch(
    () => bus.value.get('reloadBenefit'),
    async () => {
        await setBenefit();
    }
);

const getItem = async () => {
    if (benefitStore.currentBenefit || route.params.id == '-1') return;
    const params = {
        include: 'category,underwriter,vendors',
        with_count: 'serviceCodes,serviceCodeGroupsServiceCodes'
    };
    const res = await benefitStore.getBenefit(route.params.id, params);
    const item = {
        ...res.data,
        benefit_category_id: res.data.benefit_category?.id,
        underwriter_id: res.data.underwriter?.id
    };
    benefitStore.setCurrentBenefit(item);
};

const setBenefit = async () => {
    const params = {
        include: 'category,underwriter,vendors',
        with_count: 'serviceCodes,serviceCodeGroupsServiceCodes'
    };
    const res = await benefitStore.getBenefit(route.params.id, params);
    benefitStore.setCurrentBenefit(res.data);
};

const goBack = () => {
    router.push({ name: 'Benefits' });
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div
                            data-testid="index-title"
                            class="p-break-all"
                            style="word-break: break-all"
                        >
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        benefitStore.currentBenefit?.name
                                    ),
                                    {
                                        length: 100
                                    }
                                ) || $t('benefits.new_benefit')
                            }}
                        </div>
                        <StatusTag
                            v-if="benefitStore.currentBenefit?.status"
                            class="ml-2 mr-2"
                            :status="benefitStore.currentBenefit?.status"
                        />
                    </div>
                    <div
                        v-if="
                            benefitStore.currentBenefit?.coverage &&
                            benefitStore.currentBenefit?.max_amount
                        "
                        class="text-sm font-normal text-gray-700"
                    >
                        {{ benefitStore.currentBenefit?.coverage + ' %' }}
                        {{ $t('common.to_a_maximum_of') }}
                        {{
                            helpers.moneyFormat(
                                benefitStore.currentBenefit?.max_amount
                            )
                        }}
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    @click="goBack"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="px-4 py-2"
                    data-testid="back-button"
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
            <router-view />
        </div>
    </div>
</template>
