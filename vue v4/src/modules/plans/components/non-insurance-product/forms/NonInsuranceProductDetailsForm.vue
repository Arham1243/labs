<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useCommonStore } from '@/stores';

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

const loadingNonInsuranceProductType = ref(true);
const nonInsuranceProductType = ref([]);
const loadingUsers = ref(false);
const users = ref([]);
const formData = ref(props.modelValue);

watch(formData, (value) => {
    emit('update:modelValue', value);
});

onBeforeMount(() => {
    getUsers();
    getNonInsuranceProductType('');
});

const getNonInsuranceProductType = async () => {
    try {
        loadingNonInsuranceProductType.value = true;
        nonInsuranceProductType.value = [
            { type: 'FPI' },
            { type: 'Telehealth' }
        ];
    } catch (error) {
        nonInsuranceProductType.value = [];
    } finally {
        loadingNonInsuranceProductType.value = false;
    }
};

const getUsers = async (search) => {
    try {
        loadingUsers.value = true;
        const res = await commonStore.searchCompanyUsers(
            {
                scopes: search
                    ? [{ name: 'fullNameLike', parameters: [search] }]
                    : []
            },
            { limit: 100 }
        );
        users.value = res.data;
    } finally {
        loadingUsers.value = false;
    }
};
</script>

<template>
    <div class="grid grid-cols-12 mt-4">
        <div class="col-span-12">
            <LocaleField
                id="name"
                label="Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
                data-testid="name-input"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-12">
            <LocaleField
                id="description"
                label="Description"
                type="text"
                variant="textarea"
                autoResize
                :multiple="!isNew"
                v-model="formData.description"
                data-testid="description-input"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-12">
            <label for="description" class="mb-2">Non-Insurance Product Type *</label>
            <ApiDropdown
                id="type"
                option-label="type"
                option-value="type"
                v-model="formData.type"
                @search="getNonInsuranceProductType"
                :loading="loadingNonInsuranceProductType"
                :items="nonInsuranceProductType"
                data-testid="type-input"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-12">
            <div class="flex mb-4">
                <InputField
                    variant="switch"
                    v-model="formData.plan_enabled"
                    :false="false"
                    :true="true"
                    data-testid="plan-enabled-input"
                />
                <span class="ml-2 mt-1"
                    >{{ $t('non_insurance_products.input_switch_text') }}
                    <i
                        class="ml-2 pi pi-info-circle cursor-pointer"
                        v-tooltip.bottom="{
                            value: 'Lorem ipsum dolor',
                            pt: { text: 'bg-primary text-primary-contrast text-primary-contrast text-primary-contrast font-medium' }
                        }"
                    ></i
                ></span>
            </div>
        </div>
        <div class="col-span-12">
            <label for="authorized_by_id" class="mb-2"
                >{{ $t('common.authorized_by') }} *</label
            >
            <ApiDropdown
                id="authorized_by_id"
                option-label="name"
                v-model="formData.authorized"
                @search="getUsers"
                :loading="loadingUsers"
                :items="users"
                data-testid="authorized-by-input"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-12">
            <label for="authorized_by_id" class="mb-2">{{
                $t('non_insurance_products.integration_id')
            }}</label>
            <InputField
                data-testid="integration-id-input"
                id="integration_id"
                type="text"
                variant="text"
                v-model="formData.integration_id"
                class="w-full mb-4"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
