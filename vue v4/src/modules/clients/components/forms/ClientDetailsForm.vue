<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { clientTypes } from '@/config';
import { useCommonStore, useSessionStore } from '@/stores';
import InputField from '@/components/common/InputField.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    }
});

const route = useRoute();
const commonStore = useCommonStore();
const sessionStore = useSessionStore();
const emit = defineEmits(['update:modelValue']);

const loadingClientSectors = ref(true);
const loadingAccountManagers = ref(true);
const clientSectors = ref([]);
const accountManagers = ref([]);
const languages = ref([]);
const loadingLanguages = ref(false);
const formData = ref(props.modelValue);

watch(formData, (value) => {
    emit('update:modelValue', value);
});

onBeforeMount(() => {
    getClientSectors('');
    getAccountManagers('');
    getLanguages('');

    if (props.variant === 'client' && route.params.id === '-1') {
        formData.value.preferred_language =
            sessionStore.settings.default_language;
    }
});

const getClientSectors = async (search) => {
    if (props.variant === 'businessUnit' || props.variant === 'holding') return;
    try {
        loadingClientSectors.value = true;
        const res = await commonStore.searchClientSectors(
            {
                search: {
                    value: search
                }
            },
            { limit: 100 }
        );
        clientSectors.value = res.data;
    } finally {
        loadingClientSectors.value = false;
    }
};

const getAccountManagers = async (search) => {
    if (props.variant === 'client') return;
    try {
        loadingAccountManagers.value = true;
        const res = await commonStore.searchCompanyUsers({
            scopes: search
                ? [{ name: 'fullNameLike', parameters: [search] }]
                : []
        });
        accountManagers.value = res.data;
    } finally {
        loadingAccountManagers.value = false;
    }
};

const getLanguages = async (search) => {
    try {
        loadingLanguages.value = true;
        const payload = {
            search: search ? { value: search } : undefined
        };
        const res = await commonStore.searchLanguages(payload);
        languages.value = res.data;
    } finally {
        loadingLanguages.value = false;
    }
};
</script>

<template>
    <div class="grid grid-cols-12 gap-4 mt-4 mb-4">
        <div class="col-span-12">
            <LocaleField
                id="name"
                label="Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
                data-testid="name-input"
                labelDataTestId="name-label"
                class="w-full"
            />
        </div>
        <div class="col-span-12">
            <LocaleField
                id="short_name"
                label="Short Name"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.short_name"
                data-testid="short-name-input"
                labelDataTestId="short-name-label"
                class="w-full"
            />
        </div>
        <div v-if="variant === 'client'" class="col-span-12">
            <label data-testid="client-sector-label" class="mb-2">Client Sector *</label>
            <ApiDropdown
                id="client_sector_id"
                option-label="name"
                v-model="formData.client_sector"
                @search="getClientSectors"
                :loading="loadingClientSectors"
                :items="clientSectors"
                data-testid="client-sector-dropdown"
                class="w-full"
            >
                <template #option="{ option }">
                    <span v-tooltip.top="option.name">
                        {{
                            option.name.length > 90
                                ? option.name.substring(0, 90) + '...'
                                : option.name
                        }}
                    </span>
                </template>
            </ApiDropdown>
        </div>
        <div v-if="variant !== 'holding'" class="col-span-6">
            <div v-if="variant === 'client'">
                    <label data-testid="type-label" class="mb-2">Type</label>
                    <InputField
                        id="type"
                        variant="select"
                        :options="clientTypes"
                        optionLabel="name"
                        optionValue="code"
                        placeholder="Select"
                        v-model="formData.type"
                        data-testid="type-dropdown"
                        class="w-full"
                    />
            </div>
            <div
                v-if="variant === 'businessUnit'"
                class="col-span-12 flex items-center gap-2"
            >
                <InputField
                    id="billing_access_status"
                    variant="switch"
                    binary
                    v-model="formData.billing_access_status"
                />
                <div>
                    Business unit users have access to billing
                </div>
            </div>
        </div>

        <div
            :class="variant === 'businessUnit' ? 'col-span-9' : 'col-span-12'"
        >
            <label for="phone_number" data-testid="phone-label" class="mb-2">Phone #</label>
            <InputField
                id="phone_number"
                variant="phone"
                v-model="formData.phone_number"
                :disabled="formData.is_phone_number_same_as_client"
                data-testid="phone-dropdown"
            />
        </div>
        <div
            v-if="variant === 'businessUnit'"
            class="flex items-end col-span-3"
        >
            <div class="flex items-center">
                <InputField
                    id="is_phone_number_same_as_client"
                    variant="checkbox"
                    binary
                    v-model="formData.is_phone_number_same_as_client"
                />
                <label for="is_phone_number_same_as_client" class="ml-2 mt-1"
                    >Same as Client</label
                >
            </div>
        </div>
        <div
            :class="variant === 'businessUnit' ? 'col-span-9' : 'col-span-12'"
        >
            <label data-testid="website-label" class="mb-2">Website</label>
            <InputField
                id="website_url"
                variant="text"
                v-model="formData.website_url"
                :disabled="formData.is_website_url_same_as_client"
                data-testid="website-input"
                class="w-full"
            />
        </div>
        <div
            v-if="variant === 'businessUnit'"
            class="flex items-end col-span-3"
        >
            <div class="flex items-center">
                <InputField
                    id="is_website_url_same_as_client"
                    variant="checkbox"
                    binary
                    v-model="formData.is_website_url_same_as_client"
                />
                <label for="is_website_url_same_as_client" class="ml-2 mt-1"
                    >Same as Client</label
                >
            </div>
        </div>
        <div v-if="variant === 'client'" class="col-span-12">
            <label data-testid="preferred-language-label" class="mb-2"
                >Preferred Language</label
            >
            <ApiDropdown
                :tooltipLength="50"
                data-testid="preferred-language-input"
                id="preferred_language"
                option-label="name"
                v-model="formData.preferred_language"
                @search="getLanguages"
                :loading="loadingLanguages"
                :items="languages"
                :tooltip="true"
                class="w-full"
            />
        </div>
        <div v-if="variant === 'businessUnit'" class="col-span-12">
            <label class="mb-2">Account Manager </label>
            <ApiDropdown
                id="account_manager_user_id"
                option-label="name"
                v-model="formData.account_manager_user"
                @search="getAccountManagers"
                :loading="loadingAccountManagers"
                :items="accountManagers"
                :disabled="formData.is_account_manager_user_id_same_as_client"
                class="w-full"
            />
        </div>
        <!-- <div
            v-if="variant === 'businessUnit'"
            class="flex items-center justify-center field col-span-3 mb-0 mt-2"
        >
            <div class="flex items-center">
                <InputField
                    id="is_account_manager_user_id_same_as_client"
                    variant="checkbox"
                    binary
                    v-model="formData.is_account_manager_user_id_same_as_client"
                />
                <label
                    for="is_account_manager_user_id_same_as_client"
                    class="ml-2 mt-1"
                    >Same as Client</label
                >
            </div>
        </div> -->
    </div>
</template>
