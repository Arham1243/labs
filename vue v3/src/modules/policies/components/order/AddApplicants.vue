<script setup>
import { ref, watch, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useHelpers } from '@/composables';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';
import { PaginationOptions, SortFilterOptions } from '@/config';

import { useCommonStore } from '@/stores';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useGenders } from '@/modules/policies/composables/Genders.js';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ExcelIcon from '@/modules/policies/assets/icons/excel.png';

import EnrollmentSidebar from '@/modules/policies/components/order/EnrollmentSidebar.vue';
import EnrollmentMessage from '@/modules/policies/components/order/EnrollmentMessage.vue';
import PlanDetails from '@/modules/policies/components/order/PlanDetails.vue';
import PlansAccordion from '@/modules/policies/components/order/PlansAccordion.vue';
import HelpDialog from '@/modules/policies/components/order/HelpDialog.vue';
import { I18nT, useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

const WORKFLOW_BULK = 'bulk';
const WORKFLOW_INDIVIDUAL = 'individual';

const router = useRouter();
const commonStore = useCommonStore();
const planStore = usePlanStore();
const policiesStore = usePoliciesStore();
const helpers = useHelpers();
const {
    checkoutTime,
    selectedWorkflow,
    unmatchedSystemFieldsCount,
    setMetadata,
    parseFileData,
    prepareTableData,
    isFileEmpty,
    isSheetOver,
    parsingFileData
} = useSmartTemplate();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const toast = useToast();
const { t } = useI18n();

const emit = defineEmits(['close-workflow']);

const isLoading = ref(false);
const availableCountries = ref([]);
const selectedFile = ref(null);
const selectedEnrollment = ref(null);
const enrollments = ref([]);
const searchText = ref(null);
const planSwiper = ref(null);
const openEnrollmentSidebar = ref(false);
const openAvailablePlansDialog = ref(false);
const infoDialog = ref(false);
const enrollmentsLoading = ref(false);
const totalEnrollmentRecords = ref(0);
const plans = ref([]);
const policyTypes = ref([]);
const chooseFileCallback = ref(null);

const bulkWorkflowDisabled = computed(
    () =>
        enrollments.value.length > 0 &&
        selectedWorkflow.value?.method == WORKFLOW_INDIVIDUAL
);
const individualWorkflowDisabled = computed(
    () =>
        selectedFile.value != null &&
        selectedWorkflow.value?.method == WORKFLOW_BULK
);

const workflows = ref([
    {
        method: WORKFLOW_BULK,
        name: 'I will upload a file with my applicant information',
        icon: 'pi pi-file-import',
        disabled: bulkWorkflowDisabled
    },
    {
        method: WORKFLOW_INDIVIDUAL,
        name: 'I will add the applicants individually',
        icon: 'pi pi-user-plus',
        disabled: individualWorkflowDisabled
    }
]);

const isNextButtonDisabled = computed(
    () =>
        !selectedWorkflow.value ||
        (enrollments.value.length == 0 &&
            selectedWorkflow.value?.method == WORKFLOW_INDIVIDUAL) ||
        (selectedFile.value == null &&
            selectedWorkflow.value?.method == WORKFLOW_BULK) ||
        isFileEmpty.value ||
        isSheetOver.value ||
        parsingFileData.value
);

const isEnrollmentTemplateAvailable = computed(
    () => !!policiesStore.businessUnit?.enrollment_template_path
);

const getAllCountries = async (search) => {
    const res = await commonStore.searchCountries({});
    availableCountries.value = res.data;
};

const getPlans = async () => {
    try {
        isLoading.value = true;
        if (policiesStore.businessUnit?.id) {
            const res = await planStore.searchPlanByBusinessUnitUuids(
                {
                    business_unit_ids: [policiesStore.businessUnit.id]
                },
                { onlyActive: true }
            );
            plans.value = res.data;
        } else {
            plans.value = [];
        }
    } finally {
        isLoading.value = false;
    }
};

const createCart = async () => {
    try {
        await policiesStore.createCart({
            business_unit_id: policiesStore.businessUnit.id
        });
    } finally {
    }
};

const getEnrollments = async () => {
    try {
        enrollmentsLoading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await policiesStore.searchEnrollments(payload, params);
        enrollments.value = res.data;
        totalEnrollmentRecords.value = res.total;
    } finally {
        enrollmentsLoading.value = false;
    }
};

const getEnrollmentTypes = async (search) => {
    try {
        const res = await policiesStore.searchEnrollmentTypes({
            search: {
                value: search
            },
            filters: [
                {
                    field: 'status',
                    value: 'active'
                }
            ]
        });
        policyTypes.value = res.data;
    } finally {
    }

    return policyTypes.value;
};

const onSwiper = (swiper) => {
    planSwiper.value = swiper;
};

const viewPlansAsList = (event) => {
    openAvailablePlansDialog.value = true;
};

const previousPlanSlide = (event) => {
    planSwiper.value.slidePrev();
};

const nextPlanSlide = (event) => {
    planSwiper.value.slideNext();
};

const nextStep = (event) => {
    if (!enrollments.value.length) {
        if (unmatchedSystemFieldsCount.value == 0) {
            prepareTableData();
            router.push({
                name: 'Fix Format'
            });
            return;
        }

        router.push({
            name: 'Match Columns'
        });
        return;
    }

    router.push({
        name: 'Review'
    });
};

const cancel = (event) => {
    emit('close-workflow');
};

const selectWorkflow = (workflow) => {
    selectedWorkflow.value = workflow;
};

const selectFile = (event) => {
    selectedFile.value = event.files[0];
};

const removeFile = (event) => {
    selectedFile.value = null;
};

const showUploadInfo = (callback) => {
    chooseFileCallback.value = callback;
    infoDialog.value = true;
};

const downloadGuardMeTemplate = (event) => {
    if (isEnrollmentTemplateAvailable.value) {
        window.open(
            policiesStore.businessUnit?.enrollment_template_path,
            '_blank'
        );
    }
};

const addApplicants = (event) => {
    selectedEnrollment.value = null;
    openEnrollmentSidebar.value = true;
};

const closeEnrollmentSidebar = (event) => {
    selectedEnrollment.value = null;
    openEnrollmentSidebar.value = false;
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getEnrollments();
};

const enrollmentRowClicked = ({ data }) => {
    selectedEnrollment.value = data;
    openEnrollmentSidebar.value = true;
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getEnrollments();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getEnrollments();
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

const isSelectedWorkflow = (method) => {
    return selectedWorkflow.value?.method == method;
};

function getNameById(dataSource, id) {
    const item = dataSource.find((entry) => entry.id === id);
    return item ? item.name : null;
}

watch(selectedFile, (newValue) => {
    if (newValue) {
        parseFileData(newValue);
    }
});

watch(parsingFileData, (newValue) => {
    if (selectedFile.value && !newValue) {
        if (isFileEmpty.value) {
            return;
        }

        if (isSheetOver.value) {
            toast.add({
                severity: 'error',
                summary: t('policies.applicant.upload_error_title'),
                detail: t('policies.applicant.upload_error_message'),
                life: 5000
            });
        } else {
            toast.add({
                severity: 'success',
                summary: t('policies.applicant.upload_success_title'),
                detail: t('policies.applicant.upload_success_message'),
                life: 5000
            });
        }
    }
});

onBeforeMount(async () => {
    await getPlans();
    await getAllCountries();
    await getEnrollmentTypes();

    if (plans.value.length > 0) {
        const { genders } = await useGenders();

        setMetadata(
            plans.value.map((item) => ({
                ...item,
                name: item.name.en
            })),
            policyTypes.value,
            genders,
            availableCountries.value
        );

        if (!policiesStore.cart) {
            await createCart();
        }

        sortFilters.updateFilters('policy_batch_id', policiesStore.cart.id);
        getEnrollments();
    }
});
</script>

<template>
    <div class="mt-6" v-if="plans.length > 0">
        <div>
            <div class="flex align-items-center justify-content-between">
                <div class="font-semibold text-xl">
                    <span data-testid="plans-section-title">
                        {{
                            $t('policies.order.plan_overview', {
                                count: plans.length
                            })
                        }}
                    </span>
                </div>
                <div
                    v-if="plans.length > 2"
                    class="flex gap-1 align-items-center"
                >
                    <Button
                        data-testid="view-as-list-button"
                        type="button"
                        :label="$t('policies.order.view_as_list_button_label')"
                        class="p-button-outlined"
                        icon="pi pi-list"
                        text
                        @click="viewPlansAsList"
                    ></Button>

                    <div>
                        <Button
                            data-testid="previous-plan-slide-button"
                            @click="previousPlanSlide"
                            icon="pi pi-chevron-left"
                            class="p-button-rounded"
                            :disabled="!planSwiper?.activeIndex"
                        />

                        <Button
                            data-testid="next-plan-slide-button"
                            @click="nextPlanSlide"
                            icon="pi pi-chevron-right"
                            class="p-button-rounded ml-2"
                            :disabled="
                                planSwiper?.activeIndex >= plans.length / 2 - 1
                            "
                        />
                    </div>
                </div>
            </div>
            <swiper
                :modules="[Navigation, Pagination]"
                :slides-per-view="3"
                :space-between="20"
                @swiper="onSwiper"
                class="mt-4 plan-swiper"
            >
                <swiper-slide v-for="(plan, key) in plans" :key="`plan-${key}`">
                    <Card class="no-select h-full">
                        <template #title>
                            <span
                                :data-testid="`slide-plan-title-` + key"
                                class="text-base"
                                >{{ helpers.getLocaleValue(plan.name) }}</span
                            >
                        </template>
                        <template #content>
                            <PlanDetails
                                :plan="plan"
                                :testIdPrefix="'slide'"
                                :index="key"
                            />
                        </template>
                    </Card>
                </swiper-slide>
            </swiper>
        </div>

        <div class="font-semibold text-xl mt-6">
            <span data-testid="applicants-section-title">
                {{ $t('policies.order.start_adding_applicants') }}
            </span>
        </div>

        <div class="flex flex-wrap gap-3 mt-4">
            <SelectableIconButton
                v-for="(workflow, index) in workflows"
                :data-testid="`selectable-icon-button-${index}`"
                :index="index"
                :key="workflow.method"
                :item="workflow"
                :icon="workflow.icon"
                :label="workflow.name"
                :selected="workflow.method == selectedWorkflow?.method"
                :disabled="workflow.disabled"
                @click="selectWorkflow"
            />
        </div>

        <div class="mt-4" v-if="isSelectedWorkflow(WORKFLOW_BULK)">
            <div class="file-upload-container">
                <FileUpload
                    @select="selectFile($event)"
                    @remove="removeFile($event)"
                    @clear="removeFile($event)"
                    accept=".xls,.xlsx"
                    :maxFileSize="5000000"
                    :showUploadButton="false"
                    :fileLimit="1"
                >
                    <template
                        #header="{ files, chooseCallback, clearCallback }"
                    >
                        <Button
                            data-testid="file-upload-choose-button"
                            type="button"
                            :label="
                                $t(
                                    'policies.order.upload_container.choose_button_label'
                                )
                            "
                            icon="pi pi-plus"
                            @click="showUploadInfo(chooseCallback)"
                            :disabled="files.length"
                        ></Button>
                        <Button
                            data-testid="file-upload-cancel-button"
                            type="button"
                            :label="$t('buttons.cancel')"
                            icon="pi pi-times"
                            :disabled="!files.length"
                            @click="clearCallback"
                        ></Button>
                        <Button
                            v-if="isEnrollmentTemplateAvailable"
                            data-testid="file-upload-download-template-button"
                            :label="
                                $t(
                                    'policies.order.upload_container.download_guard_me_template_button_label'
                                )
                            "
                            class="p-button-outlined"
                            icon="pi pi-download"
                            @click="downloadGuardMeTemplate"
                        />
                    </template>

                    <template #empty>
                        <p>
                            <span
                                data-testid="file-upload-drag-and-drop-text"
                                >{{
                                    $t(
                                        'policies.order.upload_container.drag_and_drop_file'
                                    )
                                }}</span
                            >
                        </p>
                    </template>

                    <template #content="{ files, removeFileCallback }">
                        <EnrollmentMessage
                            v-if="selectedFile && isFileEmpty"
                            type="error"
                            icon="pi-times-circle"
                            closable
                            @close="removeFileCallback"
                        >
                            {{
                                $t(
                                    'policies.order.upload_container.empty_file_validation'
                                )
                            }}
                        </EnrollmentMessage>
                        <EnrollmentMessage
                            v-else-if="selectedFile && isSheetOver"
                            type="error"
                            icon="pi-times-circle"
                            closable
                            @close="removeFileCallback"
                        >
                            {{
                                $t(
                                    'policies.order.upload_container.applicant_limit_validation'
                                )
                            }}
                        </EnrollmentMessage>
                        <div
                            v-else-if="files.length"
                            class="p-fileupload-file"
                            v-for="(file, index) in files"
                            :key="index"
                        >
                            <img
                                :src="ExcelIcon"
                                alt="Excel Icon"
                                class="excel-icon"
                                height="40"
                            />
                            <div
                                class="p-fileupload-file-details uploaded-content-text text-sm ml-2"
                            >
                                <div class="p-fileupload-file-name">
                                    {{ file.name }}
                                </div>
                                <span class="p-fileupload-file-size">{{
                                    formatFileSize(file.size)
                                }}</span>
                            </div>
                            <div class="p-fileupload-file-actions">
                                <Button
                                    @click="removeFileCallback(index)"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    outlined
                                    class="px-4 py-2"
                                    data-testid="close-button"
                                />
                            </div>
                        </div>
                    </template>
                </FileUpload>
            </div>
        </div>

        <div class="mt-4" v-if="isSelectedWorkflow(WORKFLOW_INDIVIDUAL)">
            <BaseTable
                :value="enrollments"
                :loading="enrollmentsLoading"
                :page="pagination.page"
                :rows="pagination.limit"
                :total-records="totalEnrollmentRecords"
                @row-click="enrollmentRowClicked"
                @page="onPageChange"
                @sort="onSortChange"
                data-testid="enrollments-table"
            >
                <template #header>
                    <div
                        class="flex flex-wrap align-items-center justify-content-between"
                    >
                        <Button
                            data-testid="add-new-applicant-button"
                            type="button"
                            :label="
                                $t(
                                    'policies.order.individual_applicant_container.add_applicant_button_label'
                                )
                            "
                            icon="pi pi-plus"
                            @click="addApplicants"
                        ></Button>
                        <Search
                            v-model="searchText"
                            @search="search"
                            data-testid="applicant-search-input"
                        />
                    </div>
                </template>
                <template #empty>
                    <p>
                        <span :data-testid="'empty-data-table'">{{
                            $t(
                                'policies.order.individual_applicant_container.no_applicants_added'
                            )
                        }}</span>
                    </p>
                </template>
                <template #loading>
                    <span :data-testid="'loading-data-table'">
                        {{
                            $t(
                                'policies.order.individual_applicant_container.loading_applicants'
                            )
                        }}</span
                    >
                </template>
                <Column sortable field="applicant_type_id">
                    <template #header>
                        <span data-testid="type-header-data-table">{{
                            $t('policies.applicant.type')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span :data-testid="'type-data-table-' + index">
                            {{
                                getNameById(policyTypes, data.applicant_type_id)
                            }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="first_name">
                    <template #header>
                        <span data-testid="first-name-header-data-table">{{
                            $t('policies.applicant.first_name')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span :data-testid="'first-name-data-table-' + index">
                            {{ data.first_name }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="last_name">
                    <template #header>
                        <span data-testid="last-name-header-data-table">{{
                            $t('policies.applicant.last_name')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span :data-testid="'last-name-data-table-' + index">
                            {{ data.last_name }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="date_of_birth">
                    <template #header>
                        <span data-testid="date-of-birth-header-data-table">{{
                            $t('policies.applicant.date_of_birth')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span
                            :data-testid="'date-of-birth-data-table-' + index"
                        >
                            {{ helpers.formatDate(data.date_of_birth) }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="gender">
                    <template #header>
                        <span data-testid="gender-header-data-table">{{
                            $t('policies.applicant.gender')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span :data-testid="'gender-data-table-' + index">
                            {{ data?.gender?.name }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="passport_number">
                    <template #header>
                        <span data-testid="passport-header-data-table">{{
                            $t('policies.applicant.passport')
                        }}</span>
                    </template>
                    <template #body="{ data, index }">
                        <span :data-testid="'passport-data-table-' + index">
                            {{ data.passport_number }}
                        </span>
                    </template>
                </Column>

                <Column sortable field="destination_country_id">
                    <template #header>
                        <span
                            data-testid="destination-country-header-data-table"
                        >
                            {{
                                $t('policies.applicant.country_of_destination')
                            }}
                        </span>
                    </template>
                    <template #body="{ data, index }">
                        <span
                            :data-testid="
                                'destination-country-data-table-' + index
                            "
                        >
                            {{
                                getNameById(
                                    availableCountries,
                                    data.destination_country_id
                                )
                            }}
                        </span>
                    </template>
                </Column>
            </BaseTable>
        </div>

        <div class="mt-4">
            <EnrollmentMessage
                type="warning"
                icon="pi-clock"
                class="mt-4"
                :data-testid="'checkout-warning-message'"
            >
                {{
                    $t('policies.order.checkout_time', {
                        time: checkoutTime
                    })
                }}
            </EnrollmentMessage>
        </div>

        <div class="flex justify-content-end gap-2 mt-6">
            <Button
                :data-testid="'cancel-button'"
                type="button"
                :label="$t('buttons.cancel')"
                class="p-button-outlined"
                text
                @click="cancel"
            ></Button>
            <Button
                :data-testid="'continue-button'"
                type="button"
                :label="$t('buttons.continue')"
                icon="pi pi-chevron-right"
                iconPos="right"
                :disabled="isNextButtonDisabled"
                :loading="parsingFileData"
                @click="nextStep"
            ></Button>
        </div>

        <EnrollmentSidebar
            :is-open="openEnrollmentSidebar"
            :plans="plans"
            :enrollment="selectedEnrollment"
            @refresh="getEnrollments"
            @close="closeEnrollmentSidebar"
        />

        <Dialog
            data-testid="plan-list-dialog"
            v-if="openAvailablePlansDialog"
            v-model:visible="openAvailablePlansDialog"
            modal
            :header="
                $t('policies.order.available_plans_dialog_header', {
                    count: plans.length
                })
            "
            :style="{ width: '480px' }"
        >
            <PlansAccordion :items="plans" />
        </Dialog>

        <HelpDialog
            class="bulk-import-help"
            id="bulk-import-help-dialog"
            :title="$t('policies.order.bulk_import_help_dialog.title')"
            v-model="infoDialog"
            @continue="chooseFileCallback"
        >
            <div>
                {{ $t('policies.order.bulk_import_help_dialog.description') }}
            </div>
            <div>
                <ul>
                    <li>
                        {{ $t('policies.applicant.type') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.first_name') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.last_name') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.date_of_birth') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.gender') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.nationality') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.country_of_residence') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.country_of_destination') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.trip_start_date') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.trip_end_date') }}
                    </li>
                    <li>
                        {{ $t('policies.applicant.plan') }}
                    </li>
                </ul>
            </div>
            <div class="download-template-instructions">
                <div
                    class="flex align-items-center gap-2"
                    v-if="isEnrollmentTemplateAvailable"
                >
                    <i class="pi pi-download" />
                    <I18nT
                        keypath="policies.order.bulk_import_help_dialog.download_guard_me_template"
                        tag="div"
                    >
                        <template v-slot:download>
                            <u
                                ><a
                                    href=""
                                    @click.prevent="downloadGuardMeTemplate"
                                    >{{
                                        $t(
                                            'policies.order.bulk_import_help_dialog.download'
                                        )
                                    }}</a
                                ></u
                            >
                        </template>
                    </I18nT>
                </div>
                <div v-else>
                    {{
                        $t(
                            'policies.order.bulk_import_help_dialog.use_guard_me_template'
                        )
                    }}
                </div>
            </div>
        </HelpDialog>
    </div>
    <div class="mt-6 flex justify-content-center" v-else>
        <Loader v-if="isLoading" />
        <div v-else class="text-4xl font-bold">
            <span data-testid="no-active-plans-message">{{
                $t('policies.order.no_active_plans')
            }}</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.no-select {
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

::v-deep(.file-upload-container) {
    .uploaded-content-text {
        color: #495057;
    }

    .p-message-text {
        font-weight: 600 !important;
    }
}

.bulk-import-help {
    .download-template-instructions {
        background: #caf1d8;
        padding: 0.5rem;
        color: #0e4f26;
        border-radius: 6px;

        a {
            color: #0e4f26;
        }
    }
}

::v-deep(.plan-swiper) {
    .swiper-wrapper {
        align-items: stretch;

        .swiper-slide {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: auto;
        }
    }
}
</style>
