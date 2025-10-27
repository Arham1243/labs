<script setup>
import lodash from 'lodash';
import { ref, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const { bus } = useEventsBus();
const benefitStore = useBenefitStore();

provideEditState();

const id = ref(-1);
const stepperItems = ref([
    {
        label: 'Benefit Group Details',
        to: { name: 'New Benefit Group' }
    },
    {
        label: 'Add Benefits',
        to: { name: 'New Benefit Group Step 2' }
    },
    {
        label: 'Pricing',
        to: { name: 'New Benefit Group Step 3' }
    },
    {
        label: 'Documents',
        to: { name: 'New Benefit Group Step 4' }
    },
    {
        label: 'Review',
        to: { name: 'New Benefit Group Step 5' }
    }
]);

onBeforeMount(() => {
    getItem();
});

watch(
    () => [benefitStore.currentBenefitGroup],
    () => {
        if (benefitStore.currentBenefitGroup)
            id.value = benefitStore.currentBenefitGroup.id;
    }
);

watch(
    () => bus.value.get('reloadBenefitGroupDetails'),
    async () => {
        reloadItem();
    }
);

const reloadItem = async () => {
    const res = await benefitStore.getBenefitGroup(route.params.id);
    benefitStore.setCurrentBenefitGroup(res.data);
};

const getItem = async () => {
    if (benefitStore.currentBenefitGroup || route.params.id == '-1') {
        benefitStore.setCurrentBenefitGroup(null);
        return;
    }
    const res = await benefitStore.getBenefitGroup(route.params.id);
    benefitStore.setCurrentBenefitGroup(res.data);
};

const goBack = () => {
    router.push({ name: 'Benefit Groups' });
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div class="p-break-all">
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        benefitStore.currentBenefitGroup?.name
                                    ),
                                    {
                                        length: 80
                                    }
                                ) || $t('benefit_groups.create_btn_label')
                            }}
                        </div>
                        <StatusTag
                            v-if="benefitStore.currentBenefitGroup?.status"
                            class="ml-2 mr-2"
                            :status="benefitStore.currentBenefitGroup?.status"
                        />
                    </div>
                    <div
                        v-if="
                            benefitStore.currentBenefitGroup?.coverage &&
                            benefitStore.currentBenefitGroup?.max_amount
                        "
                        class="text-sm font-normal text-gray-700"
                    >
                        {{ benefitStore.currentBenefitGroup?.coverage + ' %' }}
                        {{ $t('common.to_a_maximum_of') }}
                        {{
                            helpers.moneyFormat(
                                benefitStore.currentBenefitGroup?.max_amount
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
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
            <router-view />
        </div>
    </div>
</template>
