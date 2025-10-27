<script setup>
import { ref, watch, computed, useSlots, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { useGlobalStore } from '@/stores';

const props = defineProps({
    modelValue: {
        type: Array
    },
    optionLabel: {
        type: String,
        default: ''
    },
    localed: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        required: false
    },
    items: {
        type: Array,
        required: true
    },
    id: {
        type: String
    },
    tooltip: {
        type: Boolean,
        default: false
    },
    tooltipLength: {
        type: Number,
        default: 20
    },
    hasNextPage: {
        type: Boolean,
        default: false
    },
    shouldSetSelectedItemsOnMounted: {
        type: Boolean,
        default: false
    },
    shouldSetOptionsOnMounted: {
        type: Boolean,
        default: false
    },
    shouldFindSelectedItemsById: {
        type: Boolean,
        default: false
    },
    errorMessages: {
        type: [String, Array]
    }
});

const emit = defineEmits([
    'update:modelValue',
    'search',
    'search-cleared',
    'fetch-next-page'
]);

const i18n = useI18n();
const globalStore = useGlobalStore();
const slots = useSlots();
const slotNames = Object.keys(slots);

const selectedItems = ref([]);
const options = ref([]);

const computedPlaceholder = computed(
    () => props.placeholder ?? i18n.t('common.select')
);

const computedLabel = computed(() => {
    return props.localed
        ? `${props.optionLabel}.${i18n.locale.value}`
        : props.optionLabel;
});

const errors = computed(() => {
    if (props.errorMessages && Array.isArray(props.errorMessages))
        return props.errorMessages;
    else if (props.errorMessages && typeof props.errorMessages == 'string')
        return [props.errorMessages];
    else if (globalStore.errors && globalStore.errors[props.id])
        return globalStore.errors[props.id];
    else return [];
});

watch(
    () => props.modelValue,
    () => {
        setValue();
    }
);

watch(
    () => props.items,
    () => {
        options.value = props.items;
        selectedItems.value.map((selectedItem) => {
            const obj = props.shouldFindSelectedItemsById
                ? lodash.find(
                      options.value,
                      (optionItem) =>
                          String(optionItem.id) === String(selectedItem.id)
                  )
                : lodash.find(options.value, selectedItem);

            if (!obj) {
                options.value.push(selectedItem);
            }
        });
    }
);

const setValue = () => {
    selectedItems.value = props.modelValue;
};

const search = (event) => {
    handleSearch(event.value);
};

const changed = (event) => {
    emit('update:modelValue', event.value);
};

const handleSearch = lodash.debounce((value) => {
    emit('search', value);
}, 600);

onMounted(() => {
    if (
        props.shouldSetSelectedItemsOnMounted &&
        props.modelValue &&
        props.modelValue.length > 0
    ) {
        selectedItems.value = props.modelValue;
        options.value = props.items;
    }

    if (
        props.shouldSetOptionsOnMounted &&
        props.items &&
        props.items.length > 0
    ) {
        options.value = props.items;
    }
});
</script>

<template>
    <MultiSelect
        :id="id"
        filter
        :loading="loading"
        @filter="search"
        v-model="selectedItems"
        :options="options"
        @change="changed"
        display="chip"
        :optionLabel="computedLabel"
        :placeholder="computedPlaceholder"
        :disabled="disabled"
        class="w-full"
        v-bind="$attrs"
    >
        <template
            v-for="(name, index) of slotNames"
            :key="index"
            #[name]="slotProps"
        >
            <slot :name="name" v-bind="slotProps || {}" />
        </template>
        <template #option="{ option }">
            <div
                v-if="
                    props.tooltip && props.localed
                        ? option[optionLabel][i18n.locale.value].length >
                          props.tooltipLength
                        : option[optionLabel].length > props.tooltipLength
                "
                v-tooltip.top="
                    props.localed
                        ? option[optionLabel][i18n.locale.value]
                        : option[optionLabel]
                "
            >
                {{
                    lodash.truncate(
                        props.localed
                            ? option[props.optionLabel][i18n.locale.value]
                            : option[props.optionLabel],
                        {
                            length: props.tooltipLength
                        }
                    )
                }}
            </div>
            <div v-else style="text-overflow: ellipsis; max-width: 100px">
                {{
                    props.localed
                        ? option[optionLabel][i18n.locale.value]
                        : option[optionLabel]
                }}
            </div>
        </template>

        <template #footer>
            <div v-if="hasNextPage" class="p-3 text-center">
                <Button
                    :label="$t('common.load_more')"
                    class="p-button-outlined w-full"
                    @click="emit('fetch-next-page')"
                />
            </div>
        </template>
    </MultiSelect>
    <small
        v-for="(error, index) in errors"
        :key="index"
        class="p-error block"
        :class="{ 'mb-2': index == errors.length - 1 }"
        id="text-error"
    >
        {{ Array.isArray(error) ? error[0] : error }}
    </small>
</template>

<style lang="scss" scoped></style>
