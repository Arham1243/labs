<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    cfg_adjudication,
    enum_fields,
    enum_operators
} from '@/modules/claims/utils/adjudication';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { cloneObj } from '@/modules/claims/utils/helper';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { useRoute } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';

const { t } = useI18n();
const route = useRoute();
const props = defineProps({
    queueId: { type: [String, Number], default: null }
});

const benefits = ref([]);

const { searchPolicy } = useClaimPolicyStore();
const {
    mutate: getPolicy,
    data: policies,
    status: policyStatus
} = searchPolicy();
getPolicy();
const { plans, getPlans } = useGeneralStore();
getPlans();
const { submissionSources, getSubmissionSources } = useSubmissionStore();
getSubmissionSources();

const {
    mutateAdjudicationQueue,
    getAdjudicationQueue,
    currentAdjudicationQueue,
    rulesData,
    setRulesData
} = useAdjudicationQueueStore();
const { mutate, loading, status } = mutateAdjudicationQueue();
getAdjudicationQueue(props.queueId);

const disable = ref(true);

const fields = ref(cfg_adjudication[1].fields);
let formData = ref(cloneObj(rulesData.value));

let conjunctions = ['AND', 'OR'];

const addCondition = () => {
    formData.value.push({
        ...fields.value.reduce(
            (items, f) => ({ ...items, [f.props.name]: null }),
            {}
        ),
        conjunction: 'AND'
    });
};

const removeActive = ref(false);
const remove = (index) => {
    removeActive.value = true;
    formData.value.splice(index, 1);
    setTimeout(() => {
        removeActive.value = false;
    }, 500);
};

// Updating form field with appropriate data
watch(
    () => currentAdjudicationQueue,
    () => {
        if (currentAdjudicationQueue?.value && props.queueId) {
            let que = cloneObj(currentAdjudicationQueue.value);
            if (que.conditions?.length)
                formData.value = cloneObj(que.conditions).reverse();
        }
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
            for (let i = 0; i < formData.value.length; i++) {
                let f = formData.value[i];
                if (f.field === 'benefit_id' && benefits.value) {
                    let index = fields.value.findIndex(
                        (ff) => ff.depends_value === 'benefit_id'
                    );
                    fields.value[index].props.options = [...benefits.value];
                }
            }
        }
    },
    { deep: true, immediate: true }
);

const setSubmitDisable = () => {
    disable.value = false;
    for (let i = 0; i < formData.value.length; i++) {
        let f = formData.value[i];
        for (const el in f) {
            if (!f[el] || (f[el] && f[el].length === 0)) {
                disable.value = true;
                return;
            }
        }
    }
};

watch(
    () => ({ ...cloneObj(formData.value) }),
    (to, from) => {
        // let selectedPlans = [];
        setRulesData(formData.value);

        setSubmitDisable();

        for (let i = 0; i < formData.value.length; i++) {
            let f = formData.value[i];
            if (f.field === 'plan_id' && plans.value) {
                let index = fields.value.findIndex(
                    (ff) => ff.depends_value === 'plan_id'
                );
                fields.value[index].props.options = plans.value;
                // Needed for Benefits - Temporarily not used
                // if (formData.value[i].value) selectedPlans = [ ...selectedPlans, ...formData.value[i].value ];
            }
            if (f.field === 'benefit_id' && benefits.value) {
                let index = fields.value.findIndex(
                    (ff) => ff.depends_value === 'benefit_id'
                );
                fields.value[index].props.options = [...benefits.value];

                // Checking based on selected Plans
                // fields.value[index].props.options = [...benefits.value].filter( (b) => selectedPlans.indexOf(b.plan_id) > -1 );
            }
            if (f.field === 'source' && submissionSources.value) {
                let index = fields.value.findIndex(
                    (ff) => ff.depends_value === 'source'
                );
                fields.value[index].props.options = [
                    ...submissionSources.value
                ];
            }
            if (
                from?.[i] &&
                to[i].field !== from[i].field &&
                !removeActive.value
            ) {
                formData.value[i].value = null;
            }
        }
    },
    { deep: true, immediate: true }
);

const submit = () => {
    let conditions = cloneObj(formData.value).reverse();
    delete conditions[conditions.length - 1].conjunction;
    mutate({
        payload: { conditions },
        queueId: props.queueId ?? route.query.id
    });
};

defineExpose({ submit, loading, status, disable });

//
// Handling Field dropdowns in Rules Form
let fieldOptions = Object.entries(enum_fields).map(([key, value]) => ({
    name: value,
    value: key
}));

let opOptions = Object.entries(enum_operators).map(([key, value]) => ({
    name: value,
    value: key
}));

const refine = (field, index) => {
    let updatedField = cloneObj(field);
    let f = formData.value[index];

    if (updatedField.props.name === 'field') {
        let uniqueFields = ['plan_id', 'benefit_id'];
        let selectedFields = formData.value
            .map((f) => f.field)
            .filter((f) => uniqueFields.indexOf(f) > -1);
        updatedField.props.options =
            uniqueFields.indexOf(f.field) < 0
                ? [...fieldOptions].filter(
                      (fld) => selectedFields.indexOf(fld.value) < 0
                  )
                : [...fieldOptions].filter(
                      (fld) =>
                          fld.value === f.field ||
                          selectedFields.indexOf(fld.value) < 0
                  );
    } else if (updatedField.props.name === 'operator') {
        updatedField.props.options =
            f.field === 'benefit_id'
                ? opOptions.slice(0, 2)
                : f.field === 'plan_id' || f.field === 'source'
                  ? opOptions.slice(4, 6)
                  : opOptions.slice(0, 4);
    }
    return updatedField;
};
</script>

<template>
    <div v-if="plans && policyStatus === 'success'">
        <template v-for="(item, index) in formData" :key="item">
            <div v-if="index" class="px-3 pt-2 pb-3 w-full">
                <Button
                    v-for="(conjunction, i) in conjunctions"
                    :label="conjunction.toLowerCase()"
                    class="capitalize"
                    :class="i ? 'border-noround-left' : 'border-noround-right'"
                    :outlined="
                        !formData[index].conjunction ||
                        formData[index].conjunction !== conjunction
                    "
                    @click="formData[index].conjunction = conjunction"
                    :data-testid="`btn-conjuction-${conjunction}+${index}`"
                />
            </div>

            <div class="flex w-full pr-2">
                <div class="flex flex-grow-1">
                    <template v-for="field in fields" :key="field.label">
                        <LabelField
                            v-if="
                                !field.depends_on ||
                                (field.depends_on &&
                                    field.depends_value ===
                                        formData[index].field)
                            "
                            :field="refine(field, index)"
                            v-model="formData[index][field.props.name]"
                        />
                    </template>
                </div>
                <Button
                    v-if="formData.length > 1"
                    outlined
                    rounded
                    class="text-red-500 border-red-500 mt-2"
                    icon="pi pi-trash"
                    @click="remove(index)"
                    data-testid="btn-trash-${index}`"
                />
            </div>
        </template>

        <div class="w-full py-2 px-2">
            <Button
                :label="t('adjudication.new_condition')"
                icon="pi pi-plus"
                text
                data-testid="btn-new-condition"
                @click="addCondition"
            />
        </div>
    </div>
</template>
