<script setup>
import { ref, watch, onMounted } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import lodash from 'lodash';

import CodeGroupAccordionTab from '@/modules/plans/components/benefits/partials/CodeGroupAccordionTab.vue';
import IndividualServicesTable from '@/modules/plans/components/benefits/tables/IndividualServicesTable.vue';
import LimitDialog from '@/modules/plans/components/benefits/dialogs/LimitDialog.vue';

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
    }
});

const emits = defineEmits(['setGroupsLength', 'toggleRemoveAll']);

const benefitStore = useBenefitStore();
const helpers = useHelpers();
const { bus, emit } = useEventsBus();

const selectedItem = ref(null);
const loadingCodeSetGroups = ref(true);
const hasIndividualServices = ref(false);
const isLimitDialog = ref(false);
const isRemoveDialog = ref(false);
const isRemoveAllDialog = ref(false);
const isPurgeIndividualDialog = ref(false);
const isLoadingDuplicatedServicesDialog = ref(false);
const isDuplicatedServicesDialog = ref(false);
const codeSetGroups = ref([]);
const activeIndexes = ref([]);
const duplicatedServices = ref([]);

onMounted(() => {
    if (benefitStore.currentBenefit?.individual_service_codes_count) {
        hasIndividualServices.value = true;
    }
    getCodeServiceGroups();
});

watch(
    () => bus.value.get('reloadBenefitCodeGroups'),
    async () => {
        await getCodeServiceGroups();
    }
);

watch(
    () => bus.value.get('reloadCodeServices'),
    async () => {
        await getCodeServiceGroups();
    }
);

watch(
    () => benefitStore.currentBenefit?.individual_service_codes_count,
    (count) => {
        hasIndividualServices.value = count > 0;
        checkRemoveAllVisibility();
    },
    { immediate: true }
);

watch(
    () => codeSetGroups.value.length,
    () => {
        emits('setGroupsLength', codeSetGroups.value.length + 1);
        checkRemoveAllVisibility();
    },
    { immediate: true }
);

const getCodeServiceGroups = async () => {
    try {
        loadingCodeSetGroups.value = true;
        const res = await benefitStore.getBenefitCodeServicesGroups(props.id);
        codeSetGroups.value = res.data;
        checkRemoveAllVisibility();
    } finally {
        loadingCodeSetGroups.value = false;
    }
};

function checkRemoveAllVisibility() {
    emits(
        'toggleRemoveAll',
        codeSetGroups.value.length > 0 || hasIndividualServices.value
    );
}

const expandAll = () => {
    const list = Array.from(
        { length: codeSetGroups.value.length + 1 },
        (v, k) => k
    );
    activeIndexes.value = list;
};

const collapseAll = () => {
    activeIndexes.value = [];
};

const showLimitDialog = (item) => {
    selectedItem.value = item;
    isLimitDialog.value = true;
};

const showRemoveDialog = (codeSet) => {
    selectedItem.value = codeSet;
    isRemoveDialog.value = true;
};

const removeService = async () => {
    try {
        await benefitStore.deleteBenefitCodeGroups(props.id, {
            resources: [selectedItem.value.id]
        });

        codeSetGroups.value.splice(
            codeSetGroups.value.indexOf(selectedItem.value),
            1
        );

        getCodeServiceGroups();
        emit('reloadBenefit');
    } finally {
        //
    }
};

const showRemoveAllDialog = async () => {
    isRemoveAllDialog.value = true;
};

defineExpose({ showRemoveAllDialog });

const removeAllCodes = async () => {
    try {
        await benefitStore.purgeServiceCodes(props.id);

        getCodeServiceGroups();
        emit('reloadBenefitServices');
        emit('reloadBenefit');
    } finally {
        //
    }
};

const showPurgeIndividualDialog = async () => {
    isPurgeIndividualDialog.value = true;
};

const purgeIndividualServices = async () => {
    try {
        await benefitStore.purgeIndividualServices(props.id);

        emit('reloadBenefitServices');
        emit('reloadBenefit');
    } finally {
        //
    }
};

const showDuplicatedDialog = () => {
    isDuplicatedServicesDialog.value = true;
    getDuplicatedServices();
};

const getDuplicatedServices = async () => {
    try {
        isLoadingDuplicatedServicesDialog.value = true;
        const res = await benefitStore.getDuplicatedServices(props.id);
        duplicatedServices.value = res.data;
        emit('hasDuplicatedServices', duplicatedServices.value.length > 0);
    } finally {
        isLoadingDuplicatedServicesDialog.value = false;
    }
};
</script>
<template>
    <div class="my-3 flex justify-content-between align-items-center">
        <div
            class="text-md font-bold"
            v-if="benefitStore.currentBenefit?.total_attached_service_codes > 0"
        >
            {{ benefitStore.currentBenefit?.total_attached_service_codes }}
            {{ $t('benefits.services_included') }}
            <template
                v-if="benefitStore.currentBenefit?.duplicate_benefits > 0"
            >
                <span
                    class="text-red-500 cursor-pointer"
                    @click="showDuplicatedDialog"
                    >{{ benefitStore.currentBenefit?.duplicate_benefits }}
                    {{ $t('common.duplicated') }}</span
                >
            </template>
        </div>
        <div v-if="codeSetGroups.length == 0 && !hasIndividualServices">
            No services added
        </div>
        <div v-if="codeSetGroups.length > 0 || hasIndividualServices">
            <Button
                v-if="isNew"
                :label="$t('common.expand_all')"
                icon="pi pi-plus"
                class="p-button-text mx-3"
                @click="expandAll"
            />
            <Button
                v-if="isNew"
                :label="$t('common.collapse_all')"
                icon="pi pi-minus"
                class="p-button-text mx-3"
                @click="collapseAll"
            />
            <Button
                v-if="isNew"
                :label="$t('common.remove_all')"
                icon="pi pi-times"
                class="p-button-text p-button-danger mx-3"
                @click="showRemoveAllDialog"
            />
        </div>
    </div>
    <Accordion
        v-if="!loadingCodeSetGroups"
        :activeIndex="isNew ? activeIndexes : activeIndexesDetails"
        multiple
    >
        <AccordionTab v-for="(codeSet, index) in codeSetGroups" :key="index">
            <template #header>
                <span
                    class="flex justify-content-between align-items-center gap-2 w-full"
                >
                    <div class="ml-2 p-break-all">
                        <h5>
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(codeSet.name),
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
                                codeSet.pivot?.coverage ||
                                codeSet.pivot?.max_amount
                            "
                            class="font-light"
                        >
                            {{
                                codeSet.pivot?.coverage
                                    ? `${codeSet.pivot?.coverage}%`
                                    : '-'
                            }}
                            {{ $t('common.coverage_to_a_maximum_of') }}
                            {{
                                codeSet.pivot?.max_amount
                                    ? helpers.moneyFormat(
                                          codeSet.pivot?.max_amount
                                      )
                                    : '-'
                            }}
                        </span>
                        <template v-if="isEditable">
                            <Button
                                :label="
                                    codeSet.pivot?.coverage ||
                                    codeSet.pivot?.max_amount
                                        ? $t('common.edit_limit')
                                        : $t('common.add_limit')
                                "
                                size="small"
                                @click.stop="showLimitDialog(codeSet)"
                                class="p-button-outlined mx-3"
                            />
                            <Button
                                icon="pi pi-times"
                                size="small"
                                @click.stop="showRemoveDialog(codeSet)"
                                class="p-button-outlined"
                            />
                        </template>
                    </div>
                </span>
            </template>
            <div class="m-0">
                <CodeGroupAccordionTab
                    :code-set-group="codeSet"
                    :is-editable="isEditable"
                />
            </div>
        </AccordionTab>
        <AccordionTab v-if="hasIndividualServices">
            <template #header>
                <span
                    class="flex justify-content-between align-items-center gap-2 w-full"
                >
                    <div class="ml-2">
                        <h5>{{ $t('benefits.individual_services') }}</h5>
                    </div>
                    <div class="flex align-items-center" v-if="isEditable">
                        <Button
                            icon="pi pi-times"
                            size="small"
                            @click.stop="showPurgeIndividualDialog"
                            class="p-button-outlined"
                        />
                    </div>
                </span>
            </template>
            <div class="m-0">
                <IndividualServicesTable
                    :is-editable="isEditable"
                    :id="props.id"
                />
            </div>
        </AccordionTab>
    </Accordion>
    <LimitDialog
        v-if="isLimitDialog"
        v-model="isLimitDialog"
        :id="props.id"
        :item="selectedItem"
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
        v-model="isPurgeIndividualDialog"
        :header="$t('benefits.remove_all_individual_services_header')"
        :content="$t('benefits.remove_all_individual_services_content')"
        :confirm-button-text="$t('buttons.remove')"
        confirm-button-class="p-button-danger"
        @confirm="purgeIndividualServices"
    />
    <Confirmation
        v-model="isRemoveDialog"
        :header="$t('benefits.remove_service')"
        :content="
            $t('common.are_you_sure_delete', {
                name: helpers.getLocaleValue(selectedItem?.name)
            })
        "
        :confirm-button-text="$t('buttons.remove')"
        confirm-button-class="p-button-danger"
        @confirm="removeService"
    />
    <Confirmation
        v-model="isRemoveAllDialog"
        :header="$t('benefits.remove_services_header')"
        :content="$t('benefits.remove_services_content')"
        :confirm-button-text="$t('buttons.continue')"
        confirm-button-class="p-button-danger"
        @confirm="removeAllCodes"
    />
    <Dialog
        v-model:visible="isDuplicatedServicesDialog"
        modal
        :header="
            $t('services.count_duplicated_codes', {
                item: duplicatedServices.length
            })
        "
        :style="{ width: '480px' }"
        :closable="false"
    >
        <Loader v-if="isLoadingDuplicatedServicesDialog" />
        <ul v-else>
            <li v-for="(item, index) in duplicatedServices" :key="index">
                {{ item?.code ?? '' }}
            </li>
        </ul>
        <template #footer>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button
                    type="button"
                    :label="$t('buttons.close')"
                    class="p-button-outlined"
                    text
                    @click="isDuplicatedServicesDialog = false"
                ></Button>
            </div>
        </template>
    </Dialog>
</template>
