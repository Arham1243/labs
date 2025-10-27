<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useGlobalStore } from '@/stores';
import NonInsuranceProductDetailsForm from '@/modules/plans/components/non-insurance-product/forms/NonInsuranceProductDetailsForm.vue';
import { useI18n } from 'vue-i18n';
import { useClientStore } from '@/modules/clients/stores';
import { useSearchNonInsuranceProduct } from '@/modules/plans/composables/non-insurance-product/searchNonInsuranceProduct';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const emit = defineEmits(['showConfirmation']);

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const nonInsuranceProductStore = useNonInsuranceProductStore();
const clientStore = useClientStore();
const globalStore = useGlobalStore();

const showUnsavedData = ref(false);
const busy = ref(false);
const loading = ref(false);
const selectFromExisting = ref(false);
const selectedNonInsuranceProduct = ref(null);

let formData = reactive({
    name: { [useI18n().locale.value]: '' },
    description: {},
    type: {},
    plan_enabled: false,
    authorized: null,
    authorized_by_id: null,
    integration_id: null,
    status: 'draft'
});
onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    if (props.id === '-1' && !selectedNonInsuranceProduct.value?.id) return;

    loading.value = true;

    let nonInsuranceProductId =
        selectedNonInsuranceProduct.value?.id || props.id;

    const res = await nonInsuranceProductStore.getNonInsuranceProduct(
        nonInsuranceProductId,
        {
            include: 'authorized'
        }
    );

    processResponse(res.data);

    loading.value = false;
};

const handleBack = () => {
    showUnsavedData.value = true;
    emit('showConfirmation');
};

const openSelectFromExisting = function () {
    selectFromExisting.value = true;
    getNonInsuranceProducts();
};

const closeSelectFromExisting = function () {
    selectFromExisting.value = false;
    nonInsuranceProducts.value = [];
    selectedNonInsuranceProduct.value = null;
};

const {
    loadingNonInsuranceProducts,
    nonInsuranceProducts,
    getNonInsuranceProducts
} = useSearchNonInsuranceProduct();

const fetchSelectedNonInsuranceProduct = async () => {
    selectFromExisting.value = false;
    globalStore.showSuccess(
        t('notifications.existing_non_insurance_product_data_imported_header'),
        t('notifications.existing_plan_data_imported_details', {
            item: selectedNonInsuranceProduct.value?.name?.en
        })
    );

    await getItem();
};

const create = async () => {
    processPayload();
    const res = await nonInsuranceProductStore.createNonInsuranceProduct({
        ...formData,
        authorized_by_id: formData.authorized?.id || formData.authorized_by_id
    });

    if (route.query.businessUnitId) {
        await clientStore.attachNonInsuranceProductToBusinessUnit(
            route.query.businessUnitId,
            { non_insurance_products: [res.data.id] }
        );
    }
    await goNext(res.data.id);
};

const update = async () => {
    const res = await nonInsuranceProductStore.updateNonInsuranceProduct(
        props.id,
        {
            ...formData,
            authorized_by_id:
                formData.authorized?.id || formData.authorized_by_id
        }
    );
    await goNext(res.data.id);
};

const goNext = async (nonInsuranceProductId) => {
    const res = await nonInsuranceProductStore.getNonInsuranceProduct(
        nonInsuranceProductId,
        {
            include: 'authorized'
        }
    );
    nonInsuranceProductStore.setCurrentNonInsuranceProduct(res.data);
    router.push({
        name: 'New Non-Insurance Product Step 2',
        params: { id: res.data.id }
    });
};

const processResponse = (data) => {
    formData = {
        ...data,
        type: data.type ? data.type : '',
        authorized: data.authorized || null,
        authorized_by_id: data.authorized?.id || null
    };

    if (selectedNonInsuranceProduct.value?.id) {
        let nonInsuranceProductName = selectedNonInsuranceProduct.value?.name;

        formData.name = Object.keys(nonInsuranceProductName).reduce(
            (acc, key) => {
                acc[key] =
                    nonInsuranceProductName[key] + ' ' + t('common.copy');
                return acc;
            },
            {}
        );

        formData.integration_id = null;
    }
};

const processPayload = () => {
    formData.non_insurance_product_id = formData.non_insurance_product?.id;
    formData.name = formData.name;
    formData.description = formData.description;
    formData.type = formData.type?.type || formData.type;
    formData.authorized_by_id = formData.authorized?.id;

    if (selectedNonInsuranceProduct.value?.id) {
        formData.source_non_insurance_product_id =
            selectedNonInsuranceProduct.value.id;
    }
};

const save = async () => {
    try {
        processPayload();
        busy.value = true;
        props.id == -1 ? await create() : await update();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="p-fluid formgrid grid my-8">
            <div class="col-8 mx-auto">
                <Card>
                    <template #content>
                        <div class="flex justify-content-between">
                            <h5 class="mb-3" data-testid="details-title">
                                Non-Insurance Product Details
                            </h5>
                            <Button
                                v-if="props.id === '-1'"
                                :label="t('common.select_from_existing')"
                                class="p-button-outlined mr-2 w-fit custom-bold-button"
                                icon="pi pi-folder"
                                @click="openSelectFromExisting"
                                data-testid="select-from-existing-button"
                            />
                        </div>
                        <NonInsuranceProductDetailsForm
                            is-new
                            v-model="formData"
                        />
                    </template>
                </Card>
            </div>
        </div>
        <div class="grid my-8">
            <div class="col-8 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        label="Cancel"
                        class="p-button-outlined"
                        @click="handleBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
        <Dialog
            v-if="selectFromExisting"
            v-model:visible="selectFromExisting"
            modal
            :header="$t('common.select_from_existing')"
            :style="{ width: '480px' }"
        >
            <div>
                {{
                    $t(
                        'non_insurance_products.select_from_existing_non_insurance_product_body'
                    )
                }}
            </div>
            <div class="p-fluid grid mt-4">
                <div class="field col-12">
                    <label for="template" class="mr-3 my-3"
                        >{{ $t('non_insurance_products.title') }}
                    </label>
                    <ApiDropdown
                        id="template"
                        localed
                        option-label="name"
                        v-model="selectedNonInsuranceProduct"
                        @search="getNonInsuranceProducts"
                        :loading="loadingNonInsuranceProducts"
                        :items="nonInsuranceProducts"
                        data-testid="select-from-existing-non-insurance-product-dropdown"
                    />
                </div>
            </div>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button
                    type="button"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="closeSelectFromExisting"
                    data-testid="cancel-button"
                ></Button>
                <Button
                    type="button"
                    :disabled="!selectedNonInsuranceProduct"
                    :label="$t('buttons.continue')"
                    @click="fetchSelectedNonInsuranceProduct"
                    data-testid="continue-button"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
