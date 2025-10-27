<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import {
    minRequirements,
    minDurations,
    ruleSupply,
    ruleTimeline
} from '@/config';
import useCoverageRestrictionBus from '@/composables/coverage-restriction';
import BenefitRestrictionsForm from '@/modules/plans/components/benefits/forms/BenefitRestrictionsForm.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isHide: {
        type: Boolean,
        default: false
    },
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    }
});

const { t } = useI18n();
const helpers = useHelpers();
const benefitStore = useBenefitStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();
const emit = defineEmits(['reloadData']);

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const item = ref({});
const itemToUpdate = ref({});

onMounted(() => {
    setItem();
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const setItem = () => {
    if (props.data) processData(props.data);
};

const processData = (data) => {
    item.value = lodash.cloneDeep(data);
    item.value.is_individual = data.is_individual ? 1 : 0;
    item.value.bound = {
        name: t(`plans.${data.bound?.value || data.bound || ''}`),
        value: data.bound?.value || data.bound
    };

    item.value.type = {
        name: t(`plans.${data.type?.value || data.type || ''}`),
        value: data.type?.value || data.type
    };
    item.value.isTimeRequirement =
        data.min_time_req && Object.keys(data.min_time_req).length > 0;
    item.value.isIncludeSupply = data.rules.length > 0;
    item.value.is_reportable_to_vendors = data.is_reportable_to_vendors;
    itemToUpdate.value = lodash.cloneDeep(item.value);
};

const processPayload = () => {
    itemToUpdate.value.benefit_category_id =
        itemToUpdate.value.benefit_category.id;
    itemToUpdate.value.is_individual = !!itemToUpdate.value.is_individual;
    itemToUpdate.value.bound = itemToUpdate.value.bound?.value;
    itemToUpdate.value.type = itemToUpdate.value.type?.value;
    itemToUpdate.value.underwriter_id = itemToUpdate.value.underwriter.id;
    itemToUpdate.value.vendor_ids = itemToUpdate.value.is_reportable_to_vendors
        ? itemToUpdate.value.vendors?.map((item) => item.id)
        : [];
    itemToUpdate.value.min_time_req = itemToUpdate.value.isTimeRequirement
        ? itemToUpdate.value.min_time_req
        : null;
    itemToUpdate.value.rules = itemToUpdate.value.isIncludeSupply
        ? itemToUpdate.value.rules?.map((item) => ({
              ...item,
              benefit_category_id: itemToUpdate.value.benefit_category_id
          }))
        : [];
};

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    try {
        busy.value = true;
        processPayload();
        await benefitStore.updateBenefit(
            itemToUpdate.value.id,
            itemToUpdate.value
        );
        const params = { include: 'category,underwriter,vendors' };
        const res = await benefitStore.getBenefit(
            itemToUpdate.value.id,
            params
        );
        processData(res.data);
        isEditing.value = false;
        clearActiveComponent();
    } catch (e) {
        return;
    } finally {
        busy.value = false;
    }
    emit('reloadData');
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-between items-center mb-2 edit-cancel-button">
            <h5 class="mb-2">Benefit Restrictions & Reporting</h5>
            <div v-if="isEditing">
                <Button
                    label="Cancel"
                    class="p-button-outlined mr-2"
                    @click="handleCancel"
                />
                <Button
                    label="Save"
                    :loading="busy"
                    :disabled="isNotChanged"
                    @click="save"
                />
            </div>
            <div v-else>
                <Button
                    v-if="!isHide && $ability.can('update benefits')"
                    size="small"
                    text
                    class="px-2 py-1 p-button-outlined"
                    label="Edit"
                    icon="pi pi-pencil"
                    :disabled="isEditDisabled"
                    @click="handleEdit"
                />
            </div>
        </div>

        <BenefitRestrictionsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
        />

        <div v-else class="grid grid-cols-12 mt-1">
            <div class="col-span-4 text-sm font-semibold py-1">
                Can be used as Individual Benefit
            </div>
            <div class="col-span-8 text-sm py-1">
                {{ item.is_individual == 1 ? 'Yes' : 'No' }}
            </div>
            <template v-if="item.is_individual">
                <div class="col-span-4 text-sm font-semibold py-1">Inbound</div>
                <div class="col-span-8 text-sm py-1">
                    <template v-if="item.bound?.value == 'in'"
                        ><i class="pi pi-check"></i> Yes</template
                    >
                    <template v-else><i class="pi pi-times"></i> No</template>
                </div>
                <div class="col-span-4 text-sm font-semibold py-1">
                    International
                </div>
                <div class="col-span-8 text-sm py-1">
                    <template v-if="item.type?.value === 'domestic'"
                        ><i class="pi pi-times"></i> No</template
                    >
                    <template v-else><i class="pi pi-check"></i> Yes</template>
                </div>
            </template>
            <div class="col-span-4 text-sm font-semibold py-1">
                Supply Limit or Rules
            </div>
            <div class="col-span-8 text-sm py-1 flex flex-col gap-2">
                <div v-for="rule in item.rules" :key="rule.benefit_category_id">
                    <div class="font-semibold">
                        {{
                            `${rule.value} ${helpers.getDisplayValue(
                                rule.supply,
                                ruleSupply
                            )}`
                        }}
                        {{
                            `every ${
                                rule.timeline_unit
                            } ${helpers.getDisplayValue(
                                rule.timeline,
                                ruleTimeline
                            )}`
                        }}
                    </div>
                    <div class="mt-1">
                        {{ rule.description }}
                        {{ rule.join_type ? `(${rule.join_type})` : '' }}
                    </div>
                </div>
            </div>
            <div class="col-span-4 text-sm font-semibold py-1">
                Minimum time requirement until benefits kick in
            </div>
            <div class="col-span-8 text-sm py-1">
                {{
                    helpers.getDisplayValue(
                        item.min_time_req?.operator,
                        minRequirements
                    )
                }}
                {{ item.min_time_req?.value ?? 'None' }}
                {{
                    helpers.getDisplayValue(
                        item.min_time_req?.period,
                        minDurations
                    )
                }}
            </div>
            <div class="col-span-4 text-sm font-semibold py-1">Report to Vendor</div>
            <div class="col-span-8 text-sm py-1">
                {{
                    item.vendors?.length > 0
                        ? item.vendors?.map((item) => item.name).join(`, `)
                        : 'No'
                }}
            </div>
            <div class="col-span-4 text-sm font-semibold py-1">Note</div>
            <div class="col-span-8 text-sm py-1 p-break-all">
                {{ item.note }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
