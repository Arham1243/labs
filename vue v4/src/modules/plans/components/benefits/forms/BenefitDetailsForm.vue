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
    <div class="grid grid-cols-12 mt-4">
        <div class="col-span-12">
            <LocaleField
                id="name"
                label="Name *"
                type="text"
                class="w-full mb-4"
                variant="text"
                :multiple="!isNew"
                v-model="formData.name"
            />
        </div>
        <div class="col-span-12">
            <label class="mb-2">Benefit Code</label>
            <InputField
                id="code"
                label="Benefit Code"
                variant="text"
                class="w-full mb-4"
                v-model="formData.code"
            />
        </div>
        <div class="col-span-12 grid grid-cols-12 gap-4 mb-4">
            <div class="col-span-6">
                <label for="benefit_category_id" class="mb-2">Benefit Category *</label>
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
                    class="w-full max-w-full"
                />
            </div>
            <div class="col-span-6">
                <label for="description" class="mb-2">Underwriter *</label>
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
                    class="w-full max-w-full"
                />
            </div>
        </div>
        <div class="col-span-12 grid grid-cols-12 gap-4 mb-4">
            <div class="col-span-3 custom-number-input">
                <label class="mb-2">Coverage %</label>
                <InputField
                    id="coverage"
                    variant="number"
                    addon-after="pi pi-percentage"
                    class="w-full"
                    v-model="formData.coverage"
                />
            </div>
            <div class="col-span-3 custom-number-input">
                <label class="mb-2">To a maximum of</label>
                <InputField
                    id="max_amount"
                    variant="number"
                    addon-before="pi pi-dollar"
                    class="w-full"
                    v-model="formData.max_amount"
                />
            </div>
            <div class="col-span-3">
                <label class="mb-2">Effective Date *</label>
                <InputField
                    variant="date"
                    id="effective_date"
                    class="w-full"
                    v-model="formData.effective_date"
                />
            </div>
            <div class="col-span-3">
                <label class="mb-2">End Date</label>
                <InputField
                    variant="date"
                    id="end_date"
                    class="w-full"
                    v-model="formData.end_date"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
