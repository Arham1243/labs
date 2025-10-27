<script setup>
import { ref, onBeforeMount, computed, watch } from 'vue';
import { useCommonStore } from '@/stores';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    }
});

const commonStore = useCommonStore();
const emit = defineEmits(['update:modelValue']);

const loadingCountries = ref(true);
const countries = ref([]);
const loadingProvinces = ref(false);
const provinces = ref([]);

const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onBeforeMount(() => {
    getCountries('');
});

const computedIds = computed(() => {
    return props.variant === 'client'
        ? {
              address: 'address',
              country: 'country_id',
              address2: 'address2',
              city: 'city',
              postal_code: 'postal_code',
              province: 'province_id'
          }
        : props.variant === 'businessUnit'
        ? {
              address: 'location_details.address',
              address2: 'location_details.address2',
              country: 'location_details.country_id',
              province: 'location_details.province_id',
              city: 'location_details.city',
              postal_code: 'location_details.postal_code'
          }
        : {};
});

const getCountries = async (search) => {
    try {
        loadingCountries.value = true;
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });
        countries.value = res.data;
    } finally {
        loadingCountries.value = false;
    }
};

const getProvinces = async (search) => {
    try {
        loadingProvinces.value = true;

        if (!formData.value.country?.id) return;

        const res = await commonStore.searchProvinces(
            {
                filters: [
                    {
                        field: 'country_id',
                        operator: '=',
                        value: formData.value.country.id
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
            formData.value.province?.id &&
            provinces.value?.find(
                (province) => province.id === formData.value.province.id
            )
        ) {
            return;
        }

        formData.value.province = { id: null, name: null };
    } finally {
        loadingProvinces.value = false;
    }
};

watch(
    () => formData.value.country?.id,
    () => getProvinces(),
    { immediate: true }
);
</script>

<template>
    <div class="grid grid-cols-12 gap-4 mt-4">
        <div class="col-span-12">
            <label for="address" data-testid="address-label" class="mb-2">Address</label>
            <InputField
                :id="computedIds.address"
                variant="text"
                v-model="formData.address"
                :disabled="disabled"
                data-testid="address-input"
                class="w-full"
            />
        </div>
        <div class="col-span-12">
            <label for="address" data-testid="address2-label" class="mb-2">Address 2</label>
            <InputField
                :id="computedIds.address2"
                variant="text"
                v-model="formData.address2"
                :disabled="disabled"
                data-testid="address2-input"
                class="w-full"
            />
        </div>
        <div class="col-span-6">
            <label data-testid="country-label" class="mb-2">Country</label>
            <ApiDropdown
                :id="computedIds.country"
                option-label="name"
                v-model="formData.country"
                @search="getCountries"
                @change="getProvinces"
                :loading="loadingCountries"
                :items="countries"
                :disabled="disabled"
                data-testid="country-input"
                class="w-full"
            />
        </div>
        <div class="field col-span-6">
            <label data-testid="country-label" class="mb-2">Province/State</label>
            <ApiDropdown
                :id="computedIds.province"
                option-label="name"
                v-model="formData.province"
                @search="getProvinces"
                :loading="loadingProvinces"
                :items="provinces"
                :disabled="disabled || !formData.country?.id"
                data-testid="province-state-input"
                class="w-full"
            />
        </div>
        <div class="field col-span-6">
            <label for="city" data-testid="city-label" class="mb-2">City</label>
            <InputField
                :id="computedIds.city"
                variant="text"
                v-model="formData.city"
                :disabled="disabled"
                data-testid="city-input"
                class="w-full"
            />
        </div>
        <div class="field col-span-6">
            <label for="postal_code" data-testid="postal-code-label" class="mb-2"
                >Postal/Zip Code</label
            >
            <InputField
                :id="computedIds.postal_code"
                variant="text"
                v-model="formData.postal_code"
                :disabled="disabled"
                data-testid="postal-code-input"
                class="w-full"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
