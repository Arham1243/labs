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
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <label for="category">{{ $t('common.category') }} *</label>
            <InputField
                id="category"
                variant="dropdown"
                v-model="formData.category"
                :disabled="busy || formData.id?.length > 0"
                :options="categories"
                optionLabel="name"
                :placeholder="$t('common.select')"
                data-testid="category"
            />
        </div>
        <div class="field col-6">
            <label for="effective_date"
                >{{ $t('common.effective_date') }} *</label
            >
            <DatePicker
                id="effective_date"
                v-model="formData.effective_date"
                data-testid="effective_date"
            />
        </div>
        <div class="field col-6">
            <label for="end_date">{{ $t('common.end_date') }}</label>
            <DatePicker
                id="end_date"
                v-model="formData.end_date"
                data-testid="end_date"
            />
        </div>
        <div class="field col-12">
            <label for="authorized_by_id"
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
            />
        </div>
    </div>
</template>
