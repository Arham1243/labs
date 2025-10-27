<script setup>
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { PaginationOptions } from '@/config';
import { utils, writeFileXLSX } from 'xlsx';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import CellField from '@/modules/policies/components/order/CellField.vue';
import ProgressDialog from '@/modules/policies/components/order/ProgressDialog.vue';

const RECORDS_PER_BATCH_UPLOAD = 200;

const router = useRouter();
const policiesStore = usePoliciesStore();
const { fields, tableRows, exportTemplateHeaders, parseAllData } =
    useSmartTemplate();
const { t } = useI18n();
const toast = useToast();

const pagination = new PaginationOptions();

const systemFields = ref(Object.values(fields.value));
const selectedItems = ref([]);
const searchText = ref(null);
const progressLoader = ref(false);
const showDeleteConfirmation = ref(false);
const enrollmentsToDelete = ref([]);
const currentProgress = ref(0);
const sortedSystemFields = ref([]);

const startRecords = ref((pagination.page - 1) * pagination.limit);
const endRecords = ref(startRecords.value + pagination.limit);

const availableData = computed(() => {
    const filteredData = tableRows.value.filter(
        (obj) => Object.keys(obj).length > 3
    );

    filteredData.forEach((data) => {
        data.invalidDataCount =
            Object.values(data).filter((attribute) => {
                return attribute && attribute.isValid === false;
            }).length || 0;
    });

    return filteredData.sort((a, b) => b.invalidDataCount - a.invalidDataCount);
});

const filteredData = computed(() => {
    return availableData.value.filter((obj) =>
        Object.values(obj).some(
            (innerObj) =>
                typeof innerObj === 'object' &&
                innerObj !== null &&
                typeof innerObj.value === 'string' &&
                innerObj.value
                    .toLowerCase()
                    .includes(
                        searchText.value ? searchText.value.toLowerCase() : ''
                    )
        )
    );
});

const applicantsWithErrors = computed(() =>
    availableData.value.filter((enrollment) => enrollment.invalidDataCount > 0)
);

const totalInvalidDataCount = computed(() =>
    availableData.value.reduce(
        (n = 0, { invalidDataCount }) => n + invalidDataCount,
        0
    )
);

const percentage = computed(() =>
    Number.parseFloat(Math.min(currentProgress.value, 100)).toFixed(0)
);

const onPageChange = (event) => {
    pagination.updatePageParams(event);

    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    startRecords.value = start;
    endRecords.value = end;
};

const paginatedData = computed(() => {
    return filteredData.value.slice(startRecords.value, endRecords.value);
});

const back = (event) => {
    router.go(-1);
};

const importApplicants = () => {
    progressLoader.value = true;

    upload();
};

const reviewApplicants = (event) => {
    router.push({
        name: 'Review'
    });
};

const upload = async () => {
    let enrollments = parseAllData(availableData.value);

    enrollments = enrollments.reduce((prev, curr) => prev.concat(curr), []);

    enrollments.forEach((enrollment, idx) => {
        enrollment.row_id = idx + 1;
    });

    const results = [];
    for (let i = 0; i < enrollments.length; i += RECORDS_PER_BATCH_UPLOAD) {
        const batch = enrollments.slice(i, i + RECORDS_PER_BATCH_UPLOAD);
        const result = await policiesStore.createEnrollments(batch);

        if (!(result instanceof Error)) {
            currentProgress.value += (100 / enrollments.length) * batch.length;
        }
        results.push(result);
        await sleep(10);
    }

    if (!results) return false;

    for (const i in results) {
        const item = results[i];
        if (item instanceof Error) {
            const message = item?.response?.data?.message;
            if (!message) continue;
            console.error(message);
            return false;
        }
    }

    toast.add({
        severity: 'success',
        summary: t('policies.fix_format.data_imported'),
        detail: t('policies.fix_format.applicants_imported_successfully', {
            count: enrollments.length
        }),
        life: 2000
    });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const deleteSelectedApplicants = (event) => {
    showDeleteConfirmation.value = true;
    enrollmentsToDelete.value = selectedItems.value;
};
const deleteApplicantsWithErrors = (event) => {
    showDeleteConfirmation.value = true;
    enrollmentsToDelete.value = applicantsWithErrors.value;
};
const removeApplicants = (applicants) => {
    showDeleteConfirmation.value = true;
    enrollmentsToDelete.value = applicants;
};
const dataToExport = (applicants) => {
    return applicants.map((applicant) => {
        return {
            plan: applicant.Plan?.value || '',
            first_name: applicant['First Name']?.value || '',
            last_name: applicant['Last Name']?.value || '',
            resident_country: applicant['Country of Residence']?.value || '',
            destination_country:
                applicant['Country of Destination']?.value || '',
            nationality: applicant['Nationality']?.value || '',
            type: applicant.Type?.value || '',
            email: applicant['Email Address']?.value || '',
            gender: applicant.Gender?.value || '',
            date_of_birth: applicant['Date of Birth']?.value || '',
            passport_number: applicant['Passport Number']?.value || '',
            student_number: applicant['Student Number']?.value || '',
            group_name: applicant['Group Name']?.value || '',
            start_date: applicant['Trip Start Date']?.value || '',
            end_date: applicant['Trip End Date']?.value || ''
        };
    });
};
const exportData = (data) => {
    const ws = utils.json_to_sheet(
        [exportTemplateHeaders.value, ...dataToExport(data)],
        {
            skipHeader: true
        }
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Data');
    writeFileXLSX(wb, 'Data.xlsx');
};
const exportApplicants = (applicants) => {
    exportData(applicants);
};
const downloadErrors = (event) => {
    exportData(applicantsWithErrors.value);
};
const confirmApplicantDeletion = (event) => {
    const idsToDelete = new Set(
        enrollmentsToDelete.value.map((row) => row._id)
    );

    tableRows.value = tableRows.value.filter(
        (row) => !idsToDelete.has(row._id)
    );

    showDeleteConfirmation.value = false;
    enrollmentsToDelete.value = [];
    selectedItems.value = [];

    toast.add({
        severity: 'success',
        summary: t('policies.fix_format.success'),
        detail: t('policies.fix_format.applicants_deleted_successfully'),
        life: 2000
    });
};

const initializeSortedSystemFields = () => {
    const systemFieldValues = Object.values(systemFields.value).slice();

    sortedSystemFields.value = systemFieldValues;

    updateInvalidDataCounts();

    sortedSystemFields.value.sort((a, b) => {
        return b.invalidDataCount - a.invalidDataCount;
    });
};

const updateInvalidDataCounts = () => {
    sortedSystemFields.value.forEach((header) => {
        header.invalidDataCount =
            availableData.value.filter((obj) => {
                return obj[header.value] && !obj[header.value].isValid;
            }).length || 0;
    });
};

watch(availableData, updateInvalidDataCounts, { deep: true, immediate: true });

onMounted(() => {
    nextTick(() => {
        initializeSortedSystemFields();

        if (totalInvalidDataCount.value == 0 && availableData.value.length) {
            importApplicants();
        }
    });
});
</script>

<template>
    <div class="mt-6">
        <div>
            <div class="font-semibold text-xl" data-testid="fix-format-title">
                {{ $t('policies.fix_format.title') }}
            </div>

            <div class="text-sm mt-6">
                {{ $t('policies.fix_format.description') }}
            </div>

            <div class="formatting-errors-table">
                <BaseTable
                    data-key="_id"
                    v-model:selection="selectedItems"
                    :value="paginatedData"
                    :page="pagination.page"
                    :rows="pagination.limit"
                    :total-records="filteredData.length"
                    @page="onPageChange"
                    class="border-radius-n-box-shadow mt-6"
                >
                    <template #header>
                        <div class="p-1">
                            <div>
                                <div
                                    class="flex font-weight-bold text-error items-center"
                                    v-if="totalInvalidDataCount"
                                >
                                    <i
                                        style="color: #b30000"
                                        class="mr-2 pi pi-exclamation-triangle"
                                    ></i>
                                    <span data-testid="invalid-data-count">
                                        {{
                                            $t(
                                                'policies.fix_format.items_to_fix',
                                                totalInvalidDataCount,
                                                {
                                                    count: totalInvalidDataCount
                                                }
                                            )
                                        }}
                                    </span>
                                </div>
                                <div
                                    class="flex font-weight-bold text-green"
                                    v-else
                                >
                                    <i
                                        style="color: #15803d"
                                        class="mr-2 pi pi-check-circle"
                                    ></i>
                                    <span data-testid="all-errors-fixed">
                                        {{
                                            $t(
                                                'policies.fix_format.all_errors_fixed'
                                            )
                                        }}
                                    </span>
                                </div>
                            </div>

                            <Divider />

                            <div>
                                <div
                                    class="flex flex-wrap items-center justify-between"
                                >
                                    <div class="flex gap-4">
                                        <Button
                                            data-testid="delete-selected-applicants-button"
                                            :label="
                                                $t(
                                                    'policies.fix_format.delete_selected_applicants_button_label'
                                                )
                                            "
                                            class="p-button-outlined"
                                            severity="danger"
                                            icon="pi pi-trash"
                                            :disabled="!selectedItems.length"
                                            @click="deleteSelectedApplicants"
                                        />
                                        <Button
                                            v-if="totalInvalidDataCount"
                                            data-testid="delete-applicants-with-errors-button"
                                            :label="
                                                $t(
                                                    'policies.fix_format.delete_applicants_w_errors_button_label'
                                                )
                                            "
                                            class="p-button-outlined"
                                            severity="danger"
                                            icon="pi pi-trash"
                                            @click="deleteApplicantsWithErrors"
                                        />
                                        <Button
                                            v-if="totalInvalidDataCount"
                                            data-testid="download-errors-button"
                                            :label="
                                                $t(
                                                    'policies.fix_format.download_errors_button_label'
                                                )
                                            "
                                            class="p-button-outlined"
                                            icon="pi pi-download"
                                            @click="downloadErrors"
                                        />
                                    </div>
                                    <div class="enrollment-search w-[16rem]">
                                        <Search v-model="searchText" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #empty>
                        <p>
                            {{ $t('policies.fix_format.no_data_available') }}
                        </p>
                    </template>
                    <Column
                        selectionMode="multiple"
                        headerStyle="width: 3rem"
                    ></Column>
                    <Column
                        v-for="systemField in sortedSystemFields"
                        :key="`header-${systemField.text}`"
                        :field="systemField.value"
                    >
                        <template #header="{ props }">
                            <div
                                class="flex items-center justify-center gap-2"
                            >
                                <span>{{ systemField.text }}</span>
                                <Badge
                                    v-if="systemField.invalidDataCount"
                                    :value="systemField.invalidDataCount"
                                    severity="danger"
                                ></Badge>
                            </div>
                        </template>
                        <template #body="{ data }">
                            <CellField
                                v-if="data[systemField.value]"
                                :row="data"
                                :field="systemField"
                                :item="data[systemField.value]"
                                @export="exportApplicants"
                                @delete="removeApplicants"
                            />
                        </template>
                    </Column>
                </BaseTable>
            </div>

            <div class="flex justify-between mt-6">
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
                    :disabled="!!totalInvalidDataCount || !availableData.length"
                    @click="importApplicants"
                ></Button>
            </div>
        </div>
        <ProgressDialog
            v-model="progressLoader"
            :progress="percentage"
            :title="$t('policies.fix_format.import_progress_dialog.title')"
            :description="
                $t('policies.fix_format.import_progress_dialog.description')
            "
            @done="reviewApplicants"
        />
        <Confirmation
            v-model="showDeleteConfirmation"
            :header="$t('policies.fix_format.delete_confirmation_dialog.title')"
            :content="
                $t('policies.fix_format.delete_confirmation_dialog.description')
            "
            confirm-button-class="p-button-danger"
            :confirmButtonText="
                $t(
                    'policies.fix_format.delete_confirmation_dialog.confirm_button_label'
                )
            "
            :cancelButtonText="$t('buttons.cancel')"
            cancelButtonTestid="delete-confirmation-dialog-cancel-button"
            closeButtonTestid="delete-confirmation-dialog-close-button"
            confirmButtonTestid="delete-confirmation-dialog-confirm-button"
            @confirm="confirmApplicantDeletion"
        />
    </div>
</template>

<style lang="scss" scoped>
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
    background-color: #f9dedc;
}

.green-bg {
    background-color: #c4eed0;
}

.white-bg {
    background-color: white;
}

.text-green {
    color: #006600;
}

.custom-pill {
    height: 20px;
    padding: 0 8px;
}

.light-gray-bg {
    background-color: #f2f5f8;
}

:deep(.formatting-errors-table) {
    td:has(div.text-error) {
        background-color: #ffe7e6 !important;
    }
}

:deep(.enrollment-search) {
    .search-input-wrapper {
        margin-bottom: 0;
    }
}
</style>
