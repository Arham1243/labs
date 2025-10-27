<script setup>
import { onMounted, watch, ref } from 'vue';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import lodash from 'lodash';

import LimitDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/LimitDialog.vue';
import PlanBenefitsTable from '../tables/PlanBenefitsTable.vue';
import BenefitGroupAccordionTab from './BenefitGroupAccordionTab.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    isEditable: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    activeIndexesDetails: {
        type: Array
    },
    store: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['setBenefitLength']);

const helpers = useHelpers();
const { bus, emit } = useEventsBus();

const selectedItem = ref(null);
const loadingBenefits = ref(false);
const isLimitDialog = ref(false);
const isRemoveDialog = ref(false);
const isDuplicatedBenefitsDialog = ref(false);
const isLoadingDuplicatedBenefitsDialog = ref(false);
const isRemoveAllDialog = ref(false);
const isPurgeIndividualDialog = ref(false);
const hasIndividualBenefits = ref(false);
const benefitGroups = ref([]);
const activeIndexes = ref([]);
const duplicatedBenefits = ref([]);

onMounted(() => {
    getBenefitGroups();
    checkIndividualBenefits();
});

watch(
    () => bus.value.get('reloadPlanBenefitGroups'),
    async () => {
        await getBenefitGroups();
    }
);

watch(
    () => bus.value.get('setHasIndividualBenefits'),
    () => {
        setHasIndividualBenefits(true);
    }
);

const getBenefitGroups = async () => {
    try {
        loadingBenefits.value = true;
        const res = await props.store.getBenefitGroups(props.id);
        benefitGroups.value = res.data;
        emits('setBenefitLength', benefitGroups.value.length + 1);
    } finally {
        loadingBenefits.value = false;
    }
};

const showDuplicatedDialog = () => {
    isDuplicatedBenefitsDialog.value = true;

    getDuplicatedBenefits();
};

const getDuplicatedBenefits = async () => {
    try {
        isLoadingDuplicatedBenefitsDialog.value = true;
        const res = await props.store.getDuplicatedBenefits(props.id);
        duplicatedBenefits.value = res.data;
        emit('hasDuplicatedBenefits', duplicatedBenefits.value.length);
    } finally {
        isLoadingDuplicatedBenefitsDialog.value = false;
    }
};

const removeBenefitGroup = async () => {
    try {
        await props.store.deleteBenefitGroups(props.id, {
            resources: [selectedItem.value.id]
        });

        getBenefitGroups();
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
        emit('openSyncPricesDialog');
    } finally {
        //
    }
};

const checkIndividualBenefits = async () => {
    hasIndividualBenefits.value = false;
    const res = await props.store.getPlanBenefits(props.id, {}, {});

    if (res.meta.total > 0) {
        setHasIndividualBenefits(true);
    }
};

const purgeBenefits = async () => {
    try {
        hasIndividualBenefits.value = false;
        loadingBenefits.value = true;
        await props.store.purgeBenefits(props.id);

        getBenefitGroups();
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
        emit('openSyncPricesDialog');
    } finally {
        //
    }
};

const purgeIndividualBenefits = async () => {
    try {
        await props.store.purgeIndividualBenefits(props.id);

        emit('reloadPlanBenefits');
        emit('reloadPlanDetails');
        emit('reloadAssociatedPlanDetails');
        emit('openSyncPricesDialog');
    } finally {
        //
    }
};

const expandAll = () => {
    activeIndexes.value = Array.from(
        { length: benefitGroups.value.length + 1 },
        (v, k) => k
    );
};

const collapseAll = () => {
    activeIndexes.value = [];
};

const showLimitDialog = (item) => {
    selectedItem.value = item;
    isLimitDialog.value = true;
};

const showRemoveDialog = (benefitGroup) => {
    selectedItem.value = benefitGroup;
    isRemoveDialog.value = true;
};

const showRemoveAllDialog = async () => {
    isRemoveAllDialog.value = true;
};

const showPurgeIndividualDialog = async () => {
    isPurgeIndividualDialog.value = true;
};

const setHasIndividualBenefits = (value) => {
    hasIndividualBenefits.value = value;
};
</script>
<template>
    <Loader v-if="loadingBenefits" />
    <div v-else>
        <div v-if="props.store.currentPlan?.total_attached_benefits === 0">
            No benefit added
        </div>
        <div class="my-3 flex justify-content-between align-items-center">
            <div
                class="text-md font-bold"
                v-if="props.store.currentPlan?.total_attached_benefits > 0"
            >
                {{ props.store.currentPlan?.total_attached_benefits }}
                {{
                    props.store.currentPlan?.total_attached_benefits === 1
                        ? $t('common.benefit')
                        : $t('common.benefits')
                }}
                {{ $t('common.included') }}
                <template
                    v-if="props.store.currentPlan?.duplicate_benefits > 0"
                >
                    <span
                        class="text-red-500 cursor-pointer"
                        @click="showDuplicatedDialog"
                        data-testid="duplicated-benefits"
                        >{{ props.store.currentPlan?.duplicate_benefits }}
                        {{ $t('common.duplicated') }}</span
                    >
                </template>
            </div>
            <div v-if="props.store.currentPlan?.total_attached_benefits > 0">
                <Button
                    v-if="isNew"
                    :label="$t('common.expand_all')"
                    icon="pi pi-plus"
                    class="p-button-text mx-3"
                    @click="expandAll"
                    data-testid="expand-all"
                />
                <Button
                    v-if="isNew"
                    :label="$t('common.collapse_all')"
                    icon="pi pi-minus"
                    class="p-button-text mx-3"
                    @click="collapseAll"
                    data-testid="collapse-all"
                />
                <Button
                    v-if="isNew"
                    label="Remove All"
                    icon="pi pi-times"
                    class="p-button-text p-button-danger ml-3"
                    @click="showRemoveAllDialog"
                    data-testid="remove-all"
                />
            </div>
        </div>
        <Accordion
            :activeIndex="isNew ? activeIndexes : activeIndexesDetails"
            multiple
        >
            <AccordionTab
                v-for="(benefitGroup, index) in benefitGroups"
                :key="index"
            >
                <template #header>
                    <span
                        class="flex justify-content-between align-items-center gap-2 w-full"
                    >
                        <div class="ml-2 p-break-all">
                            <h5>
                                {{
                                    lodash.truncate(
                                        helpers.getLocaleValue(
                                            benefitGroup.name
                                        ),
                                        {
                                            length: 80
                                        }
                                    )
                                }}
                            </h5>
                        </div>
                        <div class="flex align-items-center">
                            <span
                                v-if="
                                    benefitGroup.pivot?.coverage ||
                                    benefitGroup.pivot?.max_amount
                                "
                                class="font-light"
                                data-testid="coverage"
                            >
                                {{
                                    benefitGroup.pivot?.coverage
                                        ? `${benefitGroup.pivot?.coverage}%`
                                        : '-'
                                }}
                                {{ $t('common.coverage_to_a_maximum_of') }}
                                {{
                                    benefitGroup.pivot?.max_amount
                                        ? helpers.moneyFormat(
                                              benefitGroup.pivot?.max_amount
                                          )
                                        : '-'
                                }}
                            </span>
                            <template v-if="isEditable">
                                <Button
                                    :label="
                                        benefitGroup.pivot?.coverage ||
                                        benefitGroup.pivot?.max_amount
                                            ? $t('common.edit_limit')
                                            : $t('common.add_limit')
                                    "
                                    size="small"
                                    @click.stop="showLimitDialog(benefitGroup)"
                                    class="p-button-outlined mx-3"
                                    data-testid="edit-limit"
                                />
                                <Button
                                    icon="pi pi-times"
                                    size="small"
                                    @click.stop="showRemoveDialog(benefitGroup)"
                                    class="p-button-outlined"
                                    data-testid="remove"
                                />
                            </template>
                        </div>
                    </span>
                </template>
                <BenefitGroupAccordionTab
                    :is-editable="isEditable"
                    :benefit-group="benefitGroup"
                    :store="store"
                />
            </AccordionTab>
            <AccordionTab v-if="hasIndividualBenefits">
                <template #header>
                    <span
                        class="flex justify-content-between align-items-center gap-2 w-full"
                    >
                        <div class="ml-2">
                            <h5>{{ $t('common.individual_benefits') }}</h5>
                        </div>
                        <div class="flex align-items-center" v-if="isEditable">
                            <Button
                                icon="pi pi-times"
                                size="small"
                                @click.stop="showPurgeIndividualDialog"
                                class="p-button-outlined"
                                data-testid="remove-individual"
                            />
                        </div>
                    </span>
                </template>
                <div class="m-0">
                    <PlanBenefitsTable
                        :id="props.id"
                        :store="store"
                        :is-editable="isEditable"
                        @hasIndividualBenefits="setHasIndividualBenefits"
                    />
                </div>
            </AccordionTab>
        </Accordion>
    </div>

    <LimitDialog
        v-if="isLimitDialog"
        v-model="isLimitDialog"
        :id="props.id"
        :item="selectedItem"
        :store="store"
        :header="
            $t('common.apply_group_limit_to', {
                item: lodash.truncate(
                    helpers.getLocaleValue(selectedItem?.name),
                    {
                        length: 40
                    }
                )
            })
        "
    />
    <Confirmation
        v-model="isRemoveDialog"
        :header="$t('plans.remove_benefit_group_header')"
        :content="
            $t('plans.remove_benefit_group_content', {
                item: helpers.getLocaleValue(selectedItem?.name ?? '')
            })
        "
        :confirm-button-text="$t('buttons.remove')"
        confirm-button-class="p-button-danger"
        @confirm="removeBenefitGroup"
    />
    <Confirmation
        v-model="isRemoveAllDialog"
        :header="$t('plans.remove_benefit_header')"
        :content="$t('plans.remove_benefit_content')"
        :confirm-button-text="$t('buttons.continue')"
        confirm-button-class="p-button-danger"
        @confirm="purgeBenefits"
    />
    <Confirmation
        v-model="isPurgeIndividualDialog"
        :header="$t('plans.remove_individual_benefits_header')"
        :content="$t('plans.remove_individual_benefits_content')"
        :confirm-button-text="$t('buttons.continue')"
        confirm-button-class="p-button-danger"
        @confirm="purgeIndividualBenefits"
    />
    <Dialog
        v-model:visible="isDuplicatedBenefitsDialog"
        modal
        :header="
            $t('plans.count_duplicated_benefits', {
                item: duplicatedBenefits.length
            })
        "
        :closable="false"
        :style="{ width: '480px' }"
    >
        <Loader v-if="isLoadingDuplicatedBenefitsDialog" />
        <ul v-else>
            <li v-for="(item, index) in duplicatedBenefits" :key="index">
                {{ helpers.getLocaleValue(item?.name ?? '') }}
            </li>
        </ul>
        <template #footer>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button
                    type="button"
                    :label="$t('buttons.close')"
                    class="p-button-outlined"
                    text
                    @click="isDuplicatedBenefitsDialog = false"
                    data-testid="close-button"
                ></Button>
            </div>
        </template>
    </Dialog>
</template>
