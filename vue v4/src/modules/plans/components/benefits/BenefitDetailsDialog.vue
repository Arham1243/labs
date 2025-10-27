<script setup>
import { computed, ref } from 'vue';
import { onMounted } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import lodash from 'lodash';

import BenefitDetails from '@/modules/plans/components/benefits/BenefitDetails.vue';
import BenefitRestrictions from '@/modules/plans/components/benefits/BenefitRestrictions.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import BenefitServices from '@/modules/plans/components/benefits/BenefitServices.vue';
import { useRouter } from 'vue-router';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    id: {
        required: true,
        type: String
    }
});

const emit = defineEmits(['update:modelValue']);

const benefitStore = useBenefitStore();
const helpers = useHelpers();
const router = useRouter();

const benefit = ref({});
const isLoading = ref(true);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onMounted(() => {
    getItem();
});

const getItem = async () => {
    isLoading.value = true;
    const params = {
        include: 'category,underwriter,vendors',
        with_count: 'serviceCodes,serviceCodeGroupsServiceCodes'
    };
    const res = await benefitStore.getBenefit(props.id, params);
    benefitStore.setCurrentBenefit(res.data);
    benefit.value = res.data;
    isLoading.value = false;
};

const pushRoute = () => {
    const routeData = router.resolve({
        name: 'Benefit Details',
        params: { id: props.id }
    });
    window.open(routeData.href, '_blank');
    dialog.value = false;
};
</script>
<template>
    <div>
        <Dialog
            v-model:visible="dialog"
            modal
            :style="{ width: '90rem' }"
            :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        >
            <template #header>
                <div
                    class="flex w-full justify-between items-center h-10"
                >
                    <h4>
                        {{
                            lodash.truncate(
                                helpers.getLocaleValue(benefit.name),
                                {
                                    length: 80
                                }
                            ) ?? ''
                        }}
                    </h4>
                    <i
                        @click="pushRoute"
                        class="pi pi-external-link cursor-pointer mx-2"
                    ></i>
                </div>
            </template>
            <Loader v-if="isLoading" />
            <div v-else class="m-0">
                <form>
                    <input autofocus type="hidden" />
                </form>
                <Tabs :lazy="true" value="0">
                    <TabList>
                        <Tab value="0">Overview</Tab>
                        <Tab value="1">Services</Tab>
                        <Tab value="2">{{ $t('common.pricing') }}</Tab>
                        <Tab value="3">Documents</Tab>
                        <Tab value="4">Audit Log</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <div class="grid grid-cols-12 my-2">
                                <div class="col-span-8 mb-4">
                                    <Card class="shadow border border-gray-200">
                                        <template #content>
                                            <BenefitDetails
                                                is-hide
                                                :data="benefit"
                                                component-id="benefit-details"/>
                                        </template>
                                    </Card>
                                </div>
                                <div class="col-span-8">
                                    <Card class="shadow border border-gray-200">
                                        <template #content>
                                            <BenefitRestrictions
                                                is-hide
                                                :data="benefit"
                                                component-id="benefit-restriction"/>
                                        </template>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="1">
                            <div class="my-2">
                                <Card class="shadow border border-gray-200">
                                    <template #content>
                                        <BenefitServices
                                            :id="id"
                                            is-hide
                                            :title="
                                                $t(
                                                    'benefit_groups.benefit_services'
                                                )
                                            "
                                            component-id="benefit-services"/>
                                    </template>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel value="2">
                            <div class="my-2">
                                <Card class="shadow border border-gray-200">
                                    <template #content>
                                        <AttachPricingInit
                                            is-hide
                                            :id="id"
                                            :store="benefitStore"
                                            :title="$t('common.benefit_pricing')"
                                            :isBenefit="true"
                                            component-id="attach-pricing-init"/>
                                    </template>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel value="3">
                            <div class="my-2">
                                <Card class="shadow border border-gray-200">
                                    <template #content>
                                        <DocumentsTable
                                            is-hide
                                            type="benefits"
                                            :id="id"
                                            component-id="documents"/>
                                    </template>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel value="4">
                            <div class="my-2">
                                <Card class="shadow border border-gray-200">
                                    <template #content>
                                        <AuditTable entity="benefit" :entity_id="id" />
                                    </template>
                                </Card>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </Dialog>
    </div>
</template>
