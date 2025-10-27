<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCommonStore, useGlobalStore } from '@/stores';
import {
    ruleTimeline,
    ruleSupply,
    minDurations,
    minRequirements,
    joinTypes
} from '@/config';
import { useRoute } from 'vue-router';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const commonStore = useCommonStore();
const emit = defineEmits(['update:modelValue']);
const route = useRoute();
const loading = ref(false);
const vendors = ref([]);
const formData = ref(props.modelValue);

onMounted(() => {
    formData.value.vendors.forEach((value) => {
        delete value.pivot;
    });
    loadVendors();
});

watch(formData, (value) => {
    emit('update:modelValue', value);
});

watch(
    () => formData.value.isTimeRequirement,
    (newValue) => {
        if (newValue) {
            formData.value.min_time_req = {
                operator: null,
                value: null,
                period: null
            };
        }
    }
);

const loadVendors = async () => {
    try {
        loading.value = true;
        const res = await commonStore.searchVendors({ limit: 100 });
        vendors.value = res.data;
    } finally {
        loading.value = false;
    }
};

const addRule = () => {
    if (formData.value.rules?.length > 0) {
        formData.value.rules[formData.value.rules.length - 1].join_type = 'and';
    }
    formData.value.rules?.push({
        value: null,
        timeline: null,
        supply: null,
        join_type: null,
        timeline_unit: null
    });
};

const removeRule = (index) => {
    formData.value.rules.splice(index, 1);
    if (formData.value.rules.length > 0) {
        formData.value.rules[formData.value.rules.length - 1].join_type = null;
    }
};

const globalStore = useGlobalStore();

const handleSelectBtnChange = (event, index) => {
    formData.value.rules[index].join_type =
        event.event.target.textContent?.toLowerCase();
};
</script>

<template>
    <div class="grid grid-cols-12 gap-6 mt-3">
        <div class="col-span-12">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_individual"
                    :falseValue="0"
                    :trueValue="1"
                />
                <span class="ml-2"> Can be used as individual benefit </span>
            </div>
        </div>
        <template v-if="formData.is_individual">
            <div class="col-span-6 custom-select-button">
                <InputField
                    variant="selectButton"
                    unselectable
                    id="bound"
                    v-model="formData.bound"
                    :options="[
                        { name: 'Inbound', value: 'in' },
                        { name: 'Outbound', value: 'out' }
                    ]"
                    optionLabel="name"
                    aria-labelledby="basic"
                    data-testid="bound"
                />
            </div>
            <div class="col-span-6 custom-select-button">
                <InputField
                    variant="selectButton"
                    unselectable
                    id="type"
                    v-model="formData.type"
                    :options="[
                        { name: 'Domestic', value: 'domestic' },
                        { name: 'International', value: 'international' }
                    ]"
                    optionLabel="name"
                    aria-labelledby="basic"
                    data-testid="type"
                />
            </div>
        </template>
        <div class="col-span-12 mt-3">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.isIncludeSupply" />
                <span class="ml-2"> Include supply limits or rules </span>
            </div>

            <div v-if="formData.isIncludeSupply">
                <div v-for="(rule, index) in formData.rules" :key="index">
                    <div class="grid grid-cols-12 items-center mt-2 custom-card">
                        <div class="col-span-11">
                            <div class="flex items-center justify-between gap-4">
                                    <InputField
                                        :id="`rules.${index}.value`"
                                        variant="number"
                                        placeholder="90"
                                        v-model="rule.value"
                                    />

                                    <InputField
                                        variant="select"
                                        :options="ruleSupply"
                                        :id="`rules.${index}.supply`"
                                        optionLabel="name"
                                        optionValue="code"
                                        placeholder="Supply"
                                        v-model="rule.supply"
                                    />
                                    Every
                                    <InputField
                                        :id="`rules.${index}.timeline_unit`"
                                        variant="number"
                                        placeholder="#"
                                        v-model="rule.timeline_unit"
                                    />
                                    <InputField
                                        :options="ruleTimeline"
                                        :id="`rules.${index}.timeline`"
                                        variant="select"
                                        optionLabel="name"
                                        optionValue="code"
                                        placeholder="Duration"
                                        v-model="rule.timeline"
                                        class="w-1/3"
                                    />
                            </div>
                            <div>
                                <InputField
                                    :id="`rules.${index}.description`"
                                    class="w-full h-12 mt-2"
                                    variant="textarea"
                                    placeholder="Enter Description"
                                    v-model="rule.description"
                                />
                            </div>
                        </div>
                        <div class="col-span-1 flex justify-end">
                            <Button
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-outlined p-button-danger"
                                @click="removeRule(index)"
                            />
                        </div>
                    </div>
                    <div
                        :class="`col-${
                            route.name !== 'New Benefit Step 5' ? '3' : '4'
                        } mt-${
                            globalStore.errors &&
                            Object.keys(globalStore.errors).some((key) =>
                                key.startsWith('rules')
                            )
                                ? '7'
                                : '3'
                        } my-3`"
                        class="custom-select-button-xsm"
                    >
                        <SelectButton
                            v-if="index < formData.rules.length - 1"
                            v-model="rule.join_type"
                            :options="joinTypes"
                            optionLabel="name"
                            optionValue="code"
                            datakey="code"
                            :allowEmpty="false"
                            :unselectable="false"
                            :multiple="false"
                            @change="
                                (event) => handleSelectBtnChange(event, index)
                            "
                        />
                    </div>
                </div>
                <div class="edit-cancel-button">
                    <Button
                        label="New Limit"
                        icon="pi pi-plus"
                        class="p-button-text mt-4 p-button-outlined"
                        @click="addRule"
                    />
                </div>
            </div>
        </div>
        <div class="col-span-12 mt-3">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.isTimeRequirement" />
                <span class="ml-2">
                    Minimum time requirement until benefits kick in
                </span>
            </div>
            <div
                v-if="formData.isTimeRequirement"
                class="grid grid-cols-12 items-center gap-4 mt-4"
            >
                <div class="col-span-3">
                    <InputField
                        variant="select"
                        id="min_time_req.operator"
                        :options="minRequirements"
                        optionLabel="name"
                        optionValue="code"
                        placeholder="Requirement"
                        v-model="formData.min_time_req.operator"
                        class="w-full"
                    />
                </div>
                <div class="col-span-2">
                    <InputField
                        id="min_time_req.value"
                        variant="number"
                        placeholder="#"
                        v-model="formData.min_time_req.value"
                    />
                </div>
                <div class="col-span-3">
                    <InputField
                        variant="select"
                        id="min_time_req.period"
                        :options="minDurations"
                        optionLabel="name"
                        optionValue="code"
                        placeholder="Duration"
                        v-model="formData.min_time_req.period"
                        class="w-full"
                    />
                </div>
            </div>
        </div>

        <div class="col-span-12 mt-3">
            <div class="flex">
                <InputField
                    variant="switch"
                    v-model="formData.is_reportable_to_vendors" />
                <span class="ml-2"> Report to vendor </span>
            </div>
            <div
                v-if="formData.is_reportable_to_vendors"
                class="flex justify-between items-center gap-1 mt-4"
            >
                    <InputField
                        showClear
                        filter
                        id="vendors"
                        variant="multiselect"
                        display="chip"
                        v-model="formData.vendors"
                        :loading="loading"
                        :disabled="loading"
                        :options="vendors"
                        optionLabel="name"
                        placeholder="Vendors"
                        class="w-full"
                    />
            </div>
        </div>
        <div class="col-span-12 mt-3">
            <label>Note</label>
            <InputField
                id="note"
                variant="textarea"
                class="h-28 mt-2 w-full"
                v-model="formData.note"
            />
        </div>
    </div>
</template>
