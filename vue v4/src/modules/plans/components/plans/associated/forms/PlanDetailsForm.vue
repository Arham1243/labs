<script setup>
import { useI18n } from 'vue-i18n';
import { onMounted, ref, watch } from 'vue';
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

const emit = defineEmits(['update:modelValue']);

const commonStore = useCommonStore();
const { t } = useI18n();

const busy = ref(false);
const loadingUsers = ref(false);
const users = ref([]);
const formData = ref(props.modelValue);
const categories = ref([
    { name: t('common.early_arrivals'), code: 'early_arrivals' },
    { name: t('common.gap'), code: 'gap' },
    { name: t('common.dependants'), code: 'dependants' },
    { name: t('common.recent_graduate'), code: 'recent_graduate' }
]);

onMounted(() => {
    getUsers();
});

watch(formData, (value) => {
    emit('update:modelValue', value);
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
    } finally {
        loadingUsers.value = false;
    }
};
</script>
<template>
    <div class="grid grid-cols-12 gap-y-6">
        <div class="col-span-12">
            <label for="category" class="mb-2">{{ $t('common.category') }} *</label>
            <InputField
                id="category"
                variant="select"
                v-model="formData.category"
                :disabled="busy || formData.id?.length > 0"
                :options="categories"
                optionLabel="name"
                :placeholder="$t('common.select')"
                data-testid="category"
                class="w-full"
            />
        </div>
        <div class="col-span-12 grid grid-cols-12 gap-x-4">
            <div class="col-span-6">
                <label for="effective_date" class="mb-2"
                    >{{ $t('common.effective_date') }} *</label
                >
                <InputField
                    variant="date"
                    id="effective_date"
                    v-model="formData.effective_date"
                    data-testid="effective_date"
                    class="w-full"
                />
            </div>
            <div class="col-span-6">
                <label for="end_date" class="mb-2">{{ $t('common.end_date') }}</label>
                <InputField
                    variant="date"
                    id="end_date"
                    v-model="formData.end_date"
                    data-testid="end_date"
                    class="w-full"
                />
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
                data-testid="authorized_by_id"
                class="w-full"
            />
        </div>
    </div>
</template>
