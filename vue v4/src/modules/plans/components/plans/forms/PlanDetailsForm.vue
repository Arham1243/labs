<script setup>
import { computed, onMounted, ref } from 'vue';
import { useCommonStore } from '@/stores';
import { useRoute } from 'vue-router';
import { formatEndDateForDatepicker } from '@/modules/plans/utils/end_date_utils.js';

defineProps({
    isNew: {
        type: Boolean,
        default: false
    }
});

const route = useRoute();
const commonStore = useCommonStore();

const loadingUsers = ref(false);
const users = ref([]);
const formData = defineModel();

const endDateForDatepicker = computed({
    get() {
        return formatEndDateForDatepicker(formData.value?.end_date);
    },
    set(value) {
        formData.value = {
            ...formData.value,
            end_date: value
        };
    }
});

onMounted(() => {
    getUsers();
});

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
    } catch (error) {
    } finally {
        loadingUsers.value = false;
    }
};
</script>
<template>
    <div class="grid grid-cols-12 mt-4 gap-2">
        <div class="col-span-12">
            <LocaleField
                id="name"
                label="Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
                data-testid="name"
                class="w-full mb-4"
            />
        </div>
        <div class="col-span-6 mb-4 custom-select-button">
            <InputField
                variant="selectButton"
                id="bound"
                :disabled="!isNew || route.params.id !== '-1'"
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
                id="type"
                :disabled="!isNew || route.params.id !== '-1'"
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
        <div class="col-span-6 mr-4">
            <label for="effective_date" class="mb-2"
                >{{ $t('common.effective_date') }} *</label
            >
            <InputField
                variant="date"
                id="effective_date"
                v-model="formData.effective_date"
                class="w-full"
                data-testid="effective_date"
            />
        </div>
        <div class="col-span-6 mb-4">
            <label for="end_date" class="mb-2">{{ $t('common.end_date') }}</label>
            <InputField
                variant="date"
                id="end_date"
                v-model="endDateForDatepicker"
                class="w-full"
                data-testid="end_date"
            />
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
                class="w-full"
                data-testid="authorized_by_id"
            />
        </div>
    </div>
</template>
