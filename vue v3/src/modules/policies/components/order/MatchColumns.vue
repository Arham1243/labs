<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';

const router = useRouter();
const {
    selectedSheetHeaders,
    previewRow,
    setSystemField,
    getFormattedValue,
    prepareTableData,
    fields
} = useSmartTemplate();

const showAllAttributes = ref(false);
const systemFields = ref(Object.values(fields.value));

const mappings = computed(() => {
    const fieldMappings = systemFields.value.filter((field) =>
        showAllAttributes.value
            ? true
            : !isMatched(field) || field.manuallyMatched
    );

    fieldMappings.sort((a, b) => {
        const getPriority = (field) => {
            if (field.headerIndex === null) return 0;
            if (field.headerIndex === -1) return 1;
            return 2;
        };

        const priorityA = getPriority(a);
        const priorityB = getPriority(b);

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return a.text.localeCompare(b.text, undefined, { sensitivity: 'base' });
    });

    return fieldMappings;
});

const unmatchedCount = computed(
    () => systemFields.value.filter((field) => !isMatched(field)).length
);

const formFields = computed(() => {
    const values = Object.values(selectedSheetHeaders.value).filter(
        (header) => header.original
    );

    values.push({
        index: -1,
        match: null,
        original: 'Ignore this field'
    });

    return values;
});

const isIgnored = (item) => {
    return item.headerIndex === -1;
};

const isMatched = (item) => {
    return (
        (item.headerIndex !== null && item.alreadyMatched) || isIgnored(item)
    );
};

const getDatasetKeyByIndex = (dataset, index = null) => {
    if (index == null) return null;

    const entries = Object.entries(dataset);

    if (index >= 0 && index < entries.length) {
        return entries[index][0];
    } else {
        return null;
    }
};

const getPreviewData = (index) => {
    if (index == null) return '';

    const key = getDatasetKeyByIndex(selectedSheetHeaders.value, index);
    return getFormattedValue(previewRow.value[key]);
};

const onSelectFieldMatch = (event, field) => {
    field.headerIndex = event.value;
    if (!field.alreadyMatched) {
        field.manuallyMatched = true;
    }

    const key = getDatasetKeyByIndex(
        selectedSheetHeaders.value,
        field.headerIndex
    );
    const header = selectedSheetHeaders.value[key];
    if (header) {
        header.match = field.value;

        setSystemField(header);
    }
};

const unsetManualMappingFlag = () =>
    systemFields.value.forEach((field) => delete field.manuallyMatched);

const nextStep = (event) => {
    prepareTableData();
    router.push({
        name: 'Fix Format'
    });
};

const back = (event) => {
    router.go(-1);
};

onBeforeMount(() => {
    systemFields.value
        .filter((field) => !isMatched(field))
        .forEach((field) => {
            field.headerIndex = -1;
            field.manuallyMatched = true;
        });
});
</script>

<template>
    <div class="mt-6">
        <div>
            <div
                class="font-semibold text-xl"
                data-testid="match-columns-title"
            >
                {{ $t('policies.match_columns.title') }}
            </div>

            <div class="text-sm mt-4">
                {{ $t('policies.match_columns.description') }}
            </div>

            <DataTable
                :rowClass="
                    (item) =>
                        isIgnored(item)
                            ? ''
                            : isMatched(item)
                              ? 'green-bg'
                              : 'red-bg'
                "
                :value="mappings"
                class="border-radius-n-box-shadow mt-4"
            >
                <template #header>
                    <div class="p-1">
                        <div
                            class="flex justify-content-between align-items-center"
                        >
                            <div
                                data-testid="unmatched-columns"
                                class="flex font-weight-bold text-error"
                                v-if="unmatchedCount"
                            >
                                <i
                                    color="#B30000"
                                    class="mr-2 pi pi-exclamation-triangle"
                                ></i>
                                <span>
                                    {{
                                        $t(
                                            'policies.match_columns.columns_to_match',
                                            {
                                                count: unmatchedCount
                                            }
                                        )
                                    }}
                                </span>
                            </div>
                            <div
                                class="flex font-weight-bold text-green"
                                data-testid="all-columns-matched"
                                v-else
                            >
                                <i
                                    color="#15803D"
                                    class="mr-2 pi pi-check-circle"
                                ></i>
                                <span>{{
                                    $t(
                                        'policies.match_columns.all_columns_matched'
                                    )
                                }}</span>
                            </div>
                            <div class="flex align-items-center gap-1">
                                <div class="mr-1">
                                    <InputSwitch
                                        v-model="showAllAttributes"
                                        @change="unsetManualMappingFlag"
                                    />
                                </div>
                                <div class="label-text">
                                    <span>{{
                                        $t(
                                            'policies.match_columns.show_all_toggle'
                                        )
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <Column
                    field="matched"
                    :header="$t('policies.match_columns.matched')"
                >
                    <template #body="{ data }">
                        <span class="ml-2">
                            <i
                                v-if="isIgnored(data)"
                                style="color: #00000099"
                                class="pi pi-minus-circle text-xl"
                            ></i>
                            <i
                                v-else-if="isMatched(data)"
                                style="color: #006600"
                                class="pi pi-check-circle text-xl"
                            ></i>
                            <i
                                v-else
                                style="color: #b30000"
                                class="pi pi-exclamation-triangle text-xl"
                            ></i>
                        </span>
                    </template>
                </Column>
                <Column
                    field="text"
                    :header="$t('policies.match_columns.required_information')"
                >
                    <template #body="{ data }">
                        <span>
                            {{ data?.text }}
                        </span>
                    </template>
                </Column>
                <Column
                    field="file_header"
                    :header="$t('policies.match_columns.column_name_from_file')"
                >
                    <template #body="{ data }">
                        <Dropdown
                            :modelValue="data.headerIndex"
                            :options="formFields"
                            optionLabel="original"
                            optionValue="index"
                            placeholder="Select"
                            class="w-full md:w-56"
                            @change="(event) => onSelectFieldMatch(event, data)"
                            showClear
                        />
                    </template>
                </Column>
                <Column
                    field="sample_data"
                    :header="$t('policies.match_columns.sample_of_enrolment')"
                >
                    <template #body="{ data }">
                        <span v-if="data.headerIndex == -1">
                            {{ $t('policies.match_columns.no_data_found') }}
                        </span>
                        <span v-else>{{
                            getPreviewData(data.headerIndex)
                        }}</span>
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-content-between mt-6">
                <Button
                    data-testid="back-button"
                    type="button"
                    :label="$t('buttons.back')"
                    class="p-button-outlined"
                    icon="pi pi-chevron-left"
                    text
                    @click="back"
                ></Button>
                <Button
                    data-testid="continue-button"
                    type="button"
                    :label="$t('buttons.continue')"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    :disabled="!!unmatchedCount"
                    @click="nextStep"
                ></Button>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.text-error {
    color: #b32b23;
}

.border-radius-n-box-shadow {
    border-radius: 8px;
    box-shadow:
        0px 2px 4px -1px rgba(0, 0, 0, 0.06),
        0px 2px 4px -2px rgba(0, 0, 0, 0.04),
        0px 0px 0px 1px rgba(0, 0, 0, 0.09) inset;
    overflow: hidden;
}

.red-bg {
    background-color: #f9dedc !important;
}

.green-bg {
    background-color: #c4eed0 !important;
}

.text-green {
    color: #006600 !important;
}
</style>
