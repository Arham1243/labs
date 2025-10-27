<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useGlobalStore } from '@/stores';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import { useSearchNonInsuranceProduct } from '@/modules/plans/composables/non-insurance-product/searchNonInsuranceProduct';
import { useClientStore } from '@/modules/clients/stores/Client';

const {
    loadingNonInsuranceProducts,
    nonInsuranceProducts,
    getNonInsuranceProducts
} = useSearchNonInsuranceProduct();

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    insuredId: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['update:modelValue', 'refresh']);

const { t } = useI18n();
const globalStore = useGlobalStore();
const insuredsStore = useInsuredsStore();
const clientStore = useClientStore();

const clients = ref([]);
const businessUnits = ref([]);
const selectedClient = ref(null);
const selectedBusinessUnit = ref(null);
const selectedNonInsuranceProduct = ref(null);
const startDate = ref(null);
const endDate = ref(null);
const loadingClients = ref(false);
const loadingBusinessUnits = ref(false);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const isFormValid = computed(() => {
    return (
        selectedClient.value &&
        selectedBusinessUnit.value &&
        selectedNonInsuranceProduct.value &&
        startDate.value &&
        endDate.value
    );
});

const closeAddNonInsuranceProductDialog = (event) => {
    dialog.value = false;
};

const resetAddNonInsuranceProductDialog = () => {
    nonInsuranceProducts.value = [];

    selectedClient.value = null;
    selectedBusinessUnit.value = null;
    selectedNonInsuranceProduct.value = null;
    startDate.value = null;
    endDate.value = null;
};

const addNonInsuranceProduct = (event) => {
    const payload = {
        business_unit_id: selectedBusinessUnit.value.id,
        non_insurance_product_id: selectedNonInsuranceProduct.value.id,
        start_date: startDate.value,
        end_date: endDate.value
    };

    insuredsStore
        .addNonInsuranceProduct(
            selectedClient.value.id,
            props.insuredId,
            payload
        )
        .then(() => {
            globalStore.showSuccess(
                t('notifications.success'),
                t(
                    'insured_overview.non_insurance_products.non_insurance_product_created_successfully'
                )
            );
            resetAddNonInsuranceProductDialog();
            closeAddNonInsuranceProductDialog();
            emit('refresh');
        });
};

const getClients = async (search) => {
    try {
        loadingClients.value = true;
        const res = await clientStore.searchClients(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        clients.value = res.data;
    } finally {
        loadingClients.value = false;
    }
};

const getBusinessUnits = async (search) => {
    try {
        loadingBusinessUnits.value = true;
        const res = await clientStore.searchBusinessUnits(
            {
                search: {
                    value: search
                },
                filters: [
                    {
                        field: 'client.id',
                        value: selectedClient?.value?.id
                    }
                ],
                includes: [
                    {
                        relation: 'billingDetail'
                    }
                ]
            },
            { limit: 100 }
        );
        businessUnits.value = res.data;
    } finally {
        loadingBusinessUnits.value = false;
    }
};

watch(
    () => props.modelValue,
    (newValue) => {
        if (newValue) {
            getClients();
            getNonInsuranceProducts();
        }
    }
);

watch(selectedClient, async (newValue) => {
    if (newValue) {
        selectedBusinessUnit.value = null;
        await getBusinessUnits();

        if (businessUnits.value.length == 1) {
            selectedBusinessUnit.value = businessUnits.value[0];
        }
    }
});

watch(dialog, (newValue) => {
    if (!newValue) {
        resetAddNonInsuranceProductDialog();
    }
});
</script>

<template>
    <div>
        <Dialog
            data-testid="add-non-insurance-product-dialog"
            :visible="dialog"
            modal
            :style="{ width: '480px' }"
            @update:visible="closeAddNonInsuranceProductDialog"
            :closable="false"
        >
            <template #header>
                <div
                    class="flex align-items-center justify-content-between w-full"
                >
                    <div
                        class="p-dialog-title"
                        data-testid="add-non-insurance-product-dialog"
                    >
                        {{
                            $t('insured_overview.non_insurance_products.title')
                        }}
                    </div>
                    <Button
                        icon="pi pi-times"
                        class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                        data-testid="add-non-insurance-product-dialog-close-button"
                        @click="closeAddNonInsuranceProductDialog"
                        aria-label="Close"
                    />
                </div>
            </template>
            <div class="p-fluid grid">
                <div class="field col-12">
                    <label
                        for="client"
                        class="mr-3 my-3"
                        data-testid="client-name-label"
                    >
                        {{
                            $t('insured_overview.non_insurance_products.client')
                        }}
                    </label>
                    <ApiDropdown
                        id="client"
                        localed
                        option-label="name"
                        v-model="selectedClient"
                        @search="getClients"
                        :loading="loadingClients"
                        :items="clients"
                        data-testid="client-name-input"
                    />
                </div>
                <div class="field col-12" v-show="selectedClient">
                    <label
                        for="business_unit"
                        class="mr-3"
                        data-testid="business-unit-label"
                    >
                        {{ $t('policies.order_dialog.business_unit') }}
                    </label>
                    <ApiDropdown
                        id="business_unit"
                        localed
                        option-label="name"
                        v-model="selectedBusinessUnit"
                        @search="getBusinessUnits"
                        :loading="loadingBusinessUnits"
                        :disabled="isBusinessUnitFieldDisabled"
                        :items="businessUnits"
                        data-testid="business-unit-input"
                    />
                </div>
                <div class="field col-12" v-if="selectedBusinessUnit">
                    <label
                        for="client"
                        class="mr-3 my-3"
                        data-testid="client-name-label"
                    >
                        {{
                            $t(
                                'insured_overview.non_insurance_products.select_non_insurance_product'
                            )
                        }}
                    </label>
                    <ApiDropdown
                        id="non_insurance_product"
                        localed
                        option-label="name"
                        v-model="selectedNonInsuranceProduct"
                        @search="getNonInsuranceProducts"
                        :loading="loadingNonInsuranceProducts"
                        :items="nonInsuranceProducts"
                        data-testid="non-insurance-product-input"
                    />
                </div>
                <template
                    v-if="selectedBusinessUnit && selectedNonInsuranceProduct"
                >
                    <div class="field col-6">
                        <label
                            for="start_date"
                            data-testid="start-date-label"
                            >{{
                                $t(
                                    'insured_overview.non_insurance_products.start_date'
                                )
                            }}</label
                        >
                        <DatePickerV2
                            id="start_date"
                            v-model="startDate"
                            data-testid="start-date"
                        />
                    </div>
                    <div class="field col-6">
                        <label for="end_date" data-testid="end-date-label">{{
                            $t(
                                'insured_overview.non_insurance_products.end_date'
                            )
                        }}</label>
                        <DatePickerV2
                            id="end_date"
                            v-model="endDate"
                            data-testid="end-date"
                        />
                    </div>
                </template>
            </div>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button
                    data-testid="cancel-button"
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="closeAddNonInsuranceProductDialog"
                ></Button>
                <Button
                    data-testid="continue-button"
                    type="button"
                    :disabled="!isFormValid"
                    :label="$t('buttons.continue')"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    @click="addNonInsuranceProduct"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
