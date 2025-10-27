<script setup>
import { watch, onBeforeMount, ref } from 'vue';
import { useCommonStore } from '@/stores';
import { usePaginatedDropdown } from '@/composables/usePaginatedDropdown.js';

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
const formData = ref(props.modelValue);

const {
    items: categories,
    loading: loadingCategories,
    hasNextPage: hasNextPageCategories,
    fetchInitialItems: fetchInitialCategories,
    fetchNextPage: fetchNextPageCategories,
    searchItems: searchCategories
} = usePaginatedDropdown(commonStore, commonStore.searchBenefitCategories);

const {
    items: underwriters,
    loading: loadingUnderwriters,
    hasNextPage: hasNextPageUnderwriters,
    fetchInitialItems: fetchInitialUnderwriters,
    fetchNextPage: fetchNextPageUnderwriters,
    searchItems: searchUnderwriters
} = usePaginatedDropdown(commonStore, commonStore.searchUnderwriters);

watch(formData, (value) => {
    emit('update:modelValue', value);
});

onBeforeMount(() => {
    fetchInitialCategories();
    fetchInitialUnderwriters();
});
</script>

<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <LocaleField
                id="name"
                label="Name *"
                type="text"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
            />
        </div>
        <div class="field col-12">
            <label>Benefit Code</label>
            <InputField
                id="code"
                label="Benefit Code"
                variant="text"
                v-model="formData.code"
            />
        </div>
        <div class="field col-6">
            <label for="benefit_category_id">Benefit Category *</label>
            <ApiDropdown
                localed
                tooltip
                :tooltipLength="60"
                id="benefit_category_id"
                option-label="name"
                v-model="formData.benefit_category"
                @search="searchCategories"
                @search-cleared="fetchInitialCategories"
                :loading="loadingCategories"
                :items="categories"
                :has-next-page="hasNextPageCategories"
                @fetch-next-page="fetchNextPageCategories"
            />
        </div>
        <div class="field col-6">
            <label for="description">Underwriter *</label>
            <ApiDropdown
                :tooltipLength="60"
                id="underwriter_id"
                option-label="name"
                v-model="formData.underwriter"
                @search="searchUnderwriters"
                @search-cleared="fetchInitialUnderwriters"
                :loading="loadingUnderwriters"
                :items="underwriters"
                :has-next-page="hasNextPageUnderwriters"
                @fetch-next-page="fetchNextPageUnderwriters"
            />
        </div>
        <div class="field col-3">
            <label>Coverage %</label>
            <InputField
                id="coverage"
                variant="number"
                addon-after="pi pi-percentage"
                v-model="formData.coverage"
            />
        </div>
        <div class="field col-3">
            <label>To a maximum of</label>
            <InputField
                id="max_amount"
                variant="number"
                addon-before="pi pi-dollar"
                v-model="formData.max_amount"
            />
        </div>
        <div class="field col-3">
            <label>Effective Date *</label>
            <DatePicker id="effective_date" v-model="formData.effective_date" />
        </div>
        <div class="field col-3">
            <label>End Date</label>
            <DatePicker id="end_date" v-model="formData.end_date" />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
