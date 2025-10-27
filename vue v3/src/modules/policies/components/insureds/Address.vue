<script setup>
import lodash from 'lodash';
import {
    computed,
    ref,
    onBeforeMount,
    onMounted,
    onUnmounted,
    watch
} from 'vue';
import { useCommonStore } from '@/stores';

import { useInsuredsStore } from '@/modules/policies/stores/Insureds';
import useEventsBus from '@/composables/event-bus';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useEditState } from '@/modules/policies/composables/useEditState';
import { countriesCache } from '@/modules/policies/composables/helpers';
import { ability } from '@/plugins/ability';
import { PolicyModulePermission } from '@/config';

const ADDRESS_TEMPLATE = {
    address: null,
    address2: null,
    country_id: null,
    city: null,
    province_id: null,
    postal_code: null
};

const commonStore = useCommonStore();
const { emit } = useEventsBus();
const insuredsStore = useInsuredsStore();
const { t } = useI18n();
const toast = useToast();
const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    },
    componentId: {
        type: String,
        required: true
    }
});

const isEditing = ref(false);
const busy = ref(false);
const insured = ref({});
const insuredToUpdate = ref({});
const loadingCountries = ref(true);
const countries = ref([]);
const loadingProvinces = ref(false);
const provinces = ref([]);
const hasProvinces = ref(false);

const isEditDisabled = computed(() => {
    return (
        (activeEditComponent.value &&
            activeEditComponent.value !==
                insuredsStore.insuredSections.ADDRESS) ||
        !ability.can(PolicyModulePermission.INSUREDS.INSUREDS.UPDATE)
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(insured.value, insuredToUpdate.value);
});

const address = computed(() => {
    return insured.value?.address || '-';
});

const address2 = computed(() => {
    return insured.value?.address2 || '-';
});

const country = computed(() => {
    const countryId = insured.value?.country_id;
    const country = countries.value.find((c) => c.id === countryId);
    return country?.name || '-';
});

const city = computed(() => {
    return insured.value?.city || '-';
});

const province = computed(() => {
    const provinceId = insured.value?.province_id;
    const province = provinces.value.find((p) => p.id === provinceId);
    return province?.name || '-';
});

const postalCode = computed(() => {
    return insured.value?.postal_code || '-';
});

const handleEdit = () => {
    insuredToUpdate.value = lodash.cloneDeep(insured.value);
    isEditing.value = true;
    setActiveComponent(insuredsStore.insuredSections.ADDRESS);
};

const handleCancel = () => {
    getProvinces();
    if (!isNotChanged.value) {
        handleUnsavedChanges(() => {
            isEditing.value = false;
            clearActiveComponent();
        });
    } else {
        isEditing.value = false;
        clearActiveComponent();
    }
};

const save = async () => {
    busy.value = true;
    try {
        const data = insuredToUpdate.value || {};
        const payload = Object.keys(ADDRESS_TEMPLATE).reduce((obj, key) => {
            if (key in data) {
                obj[key] = data[key];
            }
            return obj;
        }, {});

        await insuredsStore.updateInsured(
            insured.value.client_id,
            insured.value.id,
            payload,
            'address'
        );

        emit('refresh');
        handleCancel();

        toast.add({
            severity: 'success',
            summary: t('insured_overview.insured_address.save_success_title'),
            detail: t('insured_overview.insured_address.save_success_message'),
            life: 5000
        });
    } catch (error) {
    } finally {
        busy.value = false;
    }
};

const getCountries = async (search) => {
    try {
        loadingCountries.value = true;
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });
        countries.value = res.data;
        countriesCache.set(res.data);
    } catch (error) {
    } finally {
        loadingCountries.value = false;
    }
};

const getProvinces = async (search = '') => {
    try {
        loadingProvinces.value = true;

        const res = await commonStore.searchProvinces(
            {
                filters: [
                    {
                        field: 'country_id',
                        operator: '=',
                        value: insuredToUpdate.value?.country_id
                    }
                ],
                search: {
                    value: search
                }
            },
            {}
        );
        provinces.value = res.data;

        if (
            insuredToUpdate.value.province_id &&
            provinces.value?.find(
                (province) => province.id === insuredToUpdate.value.province_id
            )
        ) {
            return;
        }

        insuredToUpdate.value.province_id = null;
    } catch (error) {
    } finally {
        loadingProvinces.value = false;
    }
};

watch(
    () => insuredToUpdate.value?.country_id,
    async () => {
        await getProvinces();
        hasProvinces.value = provinces.value.length > 0;
    }
);

onBeforeMount(() => {
    getCountries('');

    insured.value = lodash.cloneDeep(ADDRESS_TEMPLATE);

    if (props.insured) {
        insured.value = {
            ...insured.value,
            ...props.insured
        };
    }

    insuredToUpdate.value = lodash.cloneDeep(insured.value);

    getProvinces();
});

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2" data-testid="insured-address-title">
            {{ $t('insured_overview.insured_address.title') }}
        </h5>
        <div v-if="isEditing">
            <Button
                :label="$t('buttons.cancel')"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.save')"
                :loading="busy"
                :disabled="isNotChanged"
                @click="save"
                data-testid="save-button"
            />
        </div>
        <Button
            v-else
            :disabled="isEditDisabled"
            size="small"
            text
            class="px-2 py-1"
            data-testid="edit-button"
            icon="pi pi-pencil"
            label="Edit"
            @click="handleEdit"
        />
    </div>

    <div class="p-fluid formgrid grid mt-4" v-if="isEditing">
        <div class="field col-12">
            <label for="address" data-testid="address-label"
                >{{ $t('insured_overview.insured_address.address') }} *
            </label>
            <InputField
                id="address"
                variant="text"
                v-model="insuredToUpdate.address"
                data-testid="address-input"
            />
        </div>
        <div class="field col-12">
            <label for="address" data-testid="address2-label"
                >{{ $t('insured_overview.insured_address.address2') }}
            </label>
            <InputField
                id="address2"
                variant="text"
                v-model="insuredToUpdate.address2"
                data-testid="address2-input"
            />
        </div>
        <div class="field col-12">
            <label data-testid="country-label"
                >{{ $t('insured_overview.insured_address.country') }} *</label
            >
            <ApiDropdown
                id="country_id"
                :disabled="true"
                option-label="name"
                v-model="insuredToUpdate.country_id"
                @search="getCountries"
                @change="getProvinces"
                :loading="loadingCountries"
                :items="countries"
                option-value="id"
                data-testid="country-input"
            />
        </div>
        <div class="field col-12">
            <label data-testid="country-label">
                <span>{{
                    $t('insured_overview.insured_address.province')
                }}</span>
                <span v-if="hasProvinces"> *</span></label
            >
            <ApiDropdown
                v-if="hasProvinces"
                id="province_id"
                option-label="name"
                v-model="insuredToUpdate.province_id"
                @search="getProvinces"
                :loading="loadingProvinces"
                :items="provinces"
                option-value="id"
                data-testid="province-state-input"
            />
            <InputField
                v-else
                disabled
                id="province_id"
                variant="text"
                :model-value="
                    $t('insured_overview.insured_address.not_applicable')
                "
                data-testid="province-state-input"
            />
        </div>
        <div class="field col-12">
            <label for="city" data-testid="city-label"
                >{{ $t('insured_overview.insured_address.city') }} *</label
            >
            <InputField
                id="city"
                variant="text"
                v-model="insuredToUpdate.city"
                data-testid="city-input"
            />
        </div>
        <div class="field col-12">
            <label for="postal_code" data-testid="postal-code-label"
                >{{
                    $t('insured_overview.insured_address.postal_code')
                }}
                *</label
            >
            <InputField
                id="postal_code"
                variant="text"
                v-model="insuredToUpdate.postal_code"
                data-testid="postal-code-input"
            />
        </div>
    </div>

    <div class="grid mt-1" v-else>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="address-label"
        >
            {{ $t('insured_overview.insured_address.address') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="address">
            {{ address }}
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="address2-label"
        >
            {{ $t('insured_overview.insured_address.address2') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="address2">
            {{ address2 }}
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="country-label"
        >
            {{ $t('insured_overview.insured_address.country') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="country">
            {{ country }}
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="province-label"
        >
            {{ $t('insured_overview.insured_address.province') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="province">
            {{ province }}
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="city-label"
        >
            {{ $t('insured_overview.insured_address.city') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="city">
            {{ city }}
        </div>
        <div
            class="sm:col-6 md:col-4 text-sm font-semibold py-1"
            data-testid="postal-code-label"
        >
            {{ $t('insured_overview.insured_address.postal_code') }}
        </div>
        <div class="sm:col-6 md:col-8 text-sm py-1" data-testid="postal-code">
            {{ postalCode }}
        </div>
    </div>
</template>
