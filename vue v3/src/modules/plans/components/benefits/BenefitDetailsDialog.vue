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
                    class="flex w-full justify-content-between align-items-center"
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
                        class="pi pi-external-link cursor-pointer mx-3"
                    ></i>
                </div>
            </template>
            <Loader v-if="isLoading" />
            <div v-else class="m-0">
                <form>
                    <input autofocus type="hidden" />
                </form>
                <TabView :lazy="true">
                    <TabPanel header="Overview">
                        <div class="grid my-2">
                            <div class="col-8">
                                <Card>
                                    <template #content>
                                        <BenefitDetails
                                            is-hide
                                            :data="benefit"
                                        />
                                    </template>
                                </Card>
                            </div>
                            <div class="col-8">
                                <Card>
                                    <template #content>
                                        <BenefitRestrictions
                                            is-hide
                                            :data="benefit"
                                        />
                                    </template>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header="Services">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <BenefitServices
                                        :id="id"
                                        is-hide
                                        :title="
                                            $t(
                                                'benefit_groups.benefit_services'
                                            )
                                        "
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel :header="$t('common.pricing')">
                        <Card class="mt-5">
                            <template #content>
                                <AttachPricingInit
                                    is-hide
                                    :id="id"
                                    :store="benefitStore"
                                    :title="$t('common.benefit_pricing')"
                                    :isBenefit="true"
                                />
                            </template>
                        </Card>
                    </TabPanel>
                    <TabPanel header="Documents">
                        <Card class="mt-5">
                            <template #content>
                                <DocumentsTable
                                    is-hide
                                    type="benefits"
                                    :id="id"
                                />
                            </template>
                        </Card>
                    </TabPanel>
                    <TabPanel header="Audit Log">
                        <Card class="mt-5">
                            <template #content>
                                <AuditTable entity="benefit" :entity_id="id" />
                            </template>
                        </Card>
                    </TabPanel>
                </TabView>
            </div>
        </Dialog>
    </div>
</template>
