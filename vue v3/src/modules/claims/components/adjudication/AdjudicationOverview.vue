<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import {
    enum_fields,
    enum_operators
} from '@/modules/claims/utils/adjudication';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import ClaimTag from '@/modules/claims/components/shared/ClaimTag.vue';
import { useGeneralStore } from '@/modules/claims/stores/General';
import AdjudicationDetailsForm from '@/modules/claims/components/adjudication/AdjudicationDetailsForm.vue';
import AdjudicationRulesForm from '@/modules/claims/components/adjudication/AdjudicationRulesForm.vue';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { formatLabel } from '@/modules/claims/utils/helper';

const router = useRouter();
const helpers = useHelpers();
const { t } = useI18n();

const { currentAdjudicationQueue: queue } = useAdjudicationQueueStore();
const { searchPolicy } = useClaimPolicyStore();

const { plans, getPlans } = useGeneralStore();
getPlans();
const {
    mutate: getPolicy,
    data: policies,
    status: policyStatus
} = searchPolicy();
getPolicy();
const benefits = ref([]);

const details = ref([]);
const rules = ref([]);

const getNames = (field, value) => {
    let items = field === 'plan_id' ? plans?.value : benefits?.value;
    return Array.isArray(value)
        ? value.map(
              (item_id) => items?.filter((p) => p.id === item_id)[0]?.name
          )
        : value;
};

const setRulesData = () => {
    if (queue.value.conditions && plans?.value) {
        rules.value = [...queue.value.conditions]
            .reverse()
            .map(({ field, operator, value, conjunction }) => ({
                field: enum_fields[field],
                operator: enum_operators[operator],
                value:
                    field === 'plan_id' || field === 'benefit_id'
                        ? getNames(field, value)
                        : field === 'amount_claimed'
                          ? helpers.moneyFormat(value)
                          : value,
                conjunction: conjunction?.toLowerCase() || 'If'
            }));
    }
};

watch(
    () => queue,
    () => {
        if (queue.value) {
            details.value = [
                { label: 'Name', value: queue.value.name },
                { label: 'Description', value: queue.value.description ?? '-' },
                {
                    label: 'Effective Date',
                    value: helpers.formatDate(queue.value.start_at)
                },
                {
                    label: 'End Date',
                    value: helpers.formatDate(queue.value.end_at)
                },
                {
                    label: 'Audit Frequency',
                    value: `Every ${queue.value.audit_frequency} claim(s)`
                }
            ];
            setRulesData();
        }
    },
    { immediate: true, deep: true }
);

watch(
    () => plans,
    () => {
        if (queue.value) setRulesData();
    },
    { immediate: true, deep: true }
);

watch(
    () => policies,
    () => {
        if (policies.value?.length) {
            for (let i = 0; i < policies.value.length; i++) {
                let arr = policies.value[i].benefits.map((b) => ({
                    id: b.id,
                    name: b.name,
                    plan_id: policies.value[i].plan_id
                }));
                benefits.value = [...new Set([...benefits.value, ...arr])];
            }
            setRulesData();
        }
    },
    { deep: true, immediate: true }
);

const detailsForm = ref(null);
const showDetailsForm = ref(false);

watch(
    () => detailsForm?.value?.loading,
    () => {
        if (detailsForm?.value?.status === 'success')
            showDetailsForm.value = false;
    }
);

const rulesForm = ref(null);
const showRulesForm = ref(false);

watch(
    () => rulesForm?.value?.loading,
    () => {
        if (rulesForm?.value?.status === 'success') showRulesForm.value = false;
    }
);
</script>

<template>
    <div class="flex gap-4 pt-4">
        <div class="card w-full p-4 mb-0">
            <div class="flex align-items-center justify-content-between">
                <h5
                    v-text="t('adjudication.auto_details')"
                    data-testid="text-details-title"
                />
                <Button
                    v-if="!showDetailsForm"
                    label="Edit"
                    icon="pi pi-pencil"
                    text
                    @click="showDetailsForm = true"
                    data-testid="btn-edit-details"
                />
                <div v-else class="flex gap-2">
                    <Button
                        label="Cancel"
                        text
                        @click="showDetailsForm = false"
                        data-testid="btn-cancel-details-update"
                    />
                    <Button
                        v-if="detailsForm"
                        label="Save"
                        icon="pi pi-check"
                        :loading="detailsForm.loading"
                        @click="detailsForm.submit()"
                        data-testid="btn-save-details"
                    />
                </div>
            </div>

            <div v-if="!showDetailsForm" class="line-height-4 mt-3">
                <div v-for="{ label, value } in details" class="flex">
                    <b
                        class="w-10rem"
                        :data-testid="`label-detail-${label
                            .toLowerCase()
                            .replace(' ', '_')}`"
                        v-text="label"
                    />
                    <span
                        v-if="value"
                        :data-testid="`text-detail-${label
                            .toLowerCase()
                            .replace(' ', '_')}`"
                        v-text="value"
                    />
                    <span
                        v-else
                        :data-testid="`text-detail-${label
                            .toLowerCase()
                            .replace(' ', '_')}`"
                    >
                        -
                    </span>
                </div>
            </div>

            <AdjudicationDetailsForm
                v-else
                ref="detailsForm"
                :queueId="queue.id"
                class="-mx-3"
            />
        </div>

        <div v-if="plans && policies" class="card w-full p-4">
            <div class="flex align-items-center justify-content-between">
                <h5
                    v-text="t('adjudication.rules_title')"
                    data-testid="text-rules-title"
                />
                <Button
                    v-if="!showRulesForm"
                    label="Edit"
                    icon="pi pi-pencil"
                    text
                    @click="
                        rules.length
                            ? (showRulesForm = true)
                            : router.push(
                                  `/claims/adjudication/new/rules?id=${queue.id}}`
                              )
                    "
                    data-testid="btn-edit-rules"
                />
                <div v-else class="flex gap-2">
                    <Button
                        label="Cancel"
                        text
                        @click="showRulesForm = false"
                        data-testid="btn-cancel-details-update"
                    />
                    <Button
                        v-if="rulesForm"
                        label="Save"
                        icon="pi pi-check"
                        :loading="rulesForm.loading"
                        @click="rulesForm.submit()"
                        :disabled="rulesForm?.disable ?? false"
                        data-testid="btn-save-rules"
                    />
                </div>
            </div>
            <div v-if="rules.length" class="">
                <template v-if="!showRulesForm">
                    <div
                        v-for="(
                            { field, value, operator, conjunction }, index
                        ) in rules"
                        class="flex align-items-center gap-2 border-gray-300 py-3 flex-wrap"
                        :class="{ 'border-bottom-1': index < rules.length - 1 }"
                    >
                        <span
                            v-text="conjunction"
                            :data-testid="`text-conjunction-${index}`"
                        />
                        <ClaimTag
                            v-if="field"
                            :value="field"
                            severity="secondary"
                            rounded
                            :data-testid="`text-field-${index}`"
                        />
                        <span
                            v-text="operator"
                            class="lowercase"
                            :data-testid="`text-operator-${index}`"
                        />
                        <template v-if="value">
                            <ClaimTag
                                v-for="(val, i) in Array.isArray(value)
                                    ? value
                                    : [value]"
                                :value="
                                    field === 'Submission Source'
                                        ? formatLabel(val)
                                        : val
                                "
                                :key="i"
                                severity="secondary"
                                rounded
                                class="white-space-nowrap"
                                :data-testid="`text-value-${index}-${i}`"
                            />
                        </template>
                    </div>
                </template>
                <AdjudicationRulesForm
                    v-else
                    ref="rulesForm"
                    :queueId="queue.id"
                    class="pt-3 -ml-3"
                />
            </div>
        </div>
    </div>
</template>
