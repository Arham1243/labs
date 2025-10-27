<script setup>
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { onMounted, reactive, ref, watch } from 'vue';
import useEventsBus from '@/composables/event-bus';
import { useCommonStore } from '@/stores';
import { usePaginatedDropdown } from '@/composables/usePaginatedDropdown.js';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { emit } = useEventsBus();
const emits = defineEmits(['setTotalBenefitIncluded']);
const benefitStore = useBenefitStore();
const commonStore = useCommonStore();
const busy = ref(false);
let formData = reactive({
    categories: [],
    benefits: []
});

const {
    items: categories,
    loading: loadingCategories,
    hasNextPage: hasNextPageCategories,
    fetchInitialItems: fetchInitialCategories,
    fetchNextPage: fetchNextPageCategories,
    searchItems: searchCategories
} = usePaginatedDropdown(commonStore, commonStore.searchBenefitCategories);

const {
    items: benefits,
    loading: loadingBenefits,
    hasNextPage: hasNextPageBenefits,
    fetchInitialItems: fetchInitialBenefits,
    fetchNextPage: fetchNextPageBenefits,
    searchItems: searchBenefits
} = usePaginatedDropdown(benefitStore, (payload) => {
    return benefitStore.getAllBenefitsByCategory({
        ...payload,
        filters: [
            {
                field: 'category.id',
                operator: 'in',
                value: formData.categories.map((item) => item.id)
            },
            {
                field: 'status',
                operator: '=',
                value: 'active'
            }
        ]
    });
});

watch(
    () => formData.categories,
    () => {
        formData.benefits = [];
        if (formData.categories.length > 0) {
            fetchInitialBenefits();
        } else {
            benefits.value = [];
        }
    },
    { deep: true }
);

onMounted(() => {
    fetchInitialCategories();
});

const syncBenefit = async () => {
    if (formData.benefits.length == 0) return;
    try {
        busy.value = true;
        await benefitStore.syncBenefitGroupWithBenefits(
            props.id,
            formData.benefits.map((item) => item.id)
        );
        emit('openSyncPricesDialog');
        emits('setTotalBenefitIncluded', formData.benefits.length);
        emit('reloadBenefits');
        resetData();
    } finally {
        busy.value = false;
    }
};

const resetData = () => {
    formData.benefits = [];
    formData.categories = [];
    benefits.value = [];
};
</script>
<template>
    <div class="p-fluid formgrid grid align-items-center mb-4">
        <div class="field col-3">
            <label for="category" data-testid="label-category">{{
                $t('common.category')
            }}</label>
            <ApiMultiselect
                data-testid="input-category"
                id="categories"
                localed
                option-label="name"
                :disabled="busy"
                :loading="loadingCategories"
                v-model="formData.categories"
                @search="searchCategories"
                @search-cleared="fetchInitialCategories"
                :items="categories"
                :has-next-page="hasNextPageCategories"
                @fetch-next-page="fetchNextPageCategories"
            />
        </div>
        <div class="field col-8">
            <label for="benefits" data-testid="label-benefits">{{
                $t('common.benefits')
            }}</label>
            <ApiMultiselect
                data-testid="input-benefits"
                id="benefits"
                localed
                option-label="name"
                :loading="loadingBenefits"
                :disabled="busy || formData.categories.length === 0"
                v-model="formData.benefits"
                @search="searchBenefits"
                @search-cleared="fetchInitialBenefits"
                :items="benefits"
                :has-next-page="hasNextPageBenefits"
                @fetch-next-page="fetchNextPageBenefits"
            />
        </div>
        <div class="col-1">
            <Button
                data-testid="button-sync"
                icon="pi pi-plus"
                :loading="busy"
                class="mt-2 p-button-rounded p-button-outlined"
                @click="syncBenefit"
            />
        </div>
    </div>
</template>
