<script setup>
import { ref, watch, computed, onMounted, useAttrs } from 'vue';
import { getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { useGlobalStore } from '@/stores';

const props = defineProps({
    modelValue: {
        type: [Object, String],
        default: () => {}
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
        default: ''
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
    closedTooltip: {
        type: Boolean,
        default: false
    },
    hasNextPage: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'update:modelValue',
    'search',
    'change',
    'fetch-next-page',
    'search-cleared'
]);

const attrs = useAttrs();
const i18n = useI18n();
const globalStore = useGlobalStore();
const instance = getCurrentInstance();

const selectedItem = ref();
const prevSelectedItem = ref(
    props.items.find((option) => {
        const key = attrs['option-value'] || 'id';
        if (typeof props.modelValue === 'object' && props.modelValue !== null) {
            return option[key] === props.modelValue[key];
        }
        return option[key] === props.modelValue;
    })
);

const handleSearch = lodash.debounce((value) => {
    const hasSearchCleared = !!instance?.vnode?.props?.onSearchCleared;
    if (value === '') {
        if (hasSearchCleared) {
            emit('search-cleared');
        } else {
            emit('search', '');
        }
    } else {
        emit('search', value);
    }
}, 600);

const computedLabel = computed(() => {
    return props.localed
        ? `${props.optionLabel}.${i18n.locale.value}`
        : props.optionLabel;
});

const closedTooltipText = computed(() => {
    if (!props.closedTooltip || !props.modelValue) return '';

    const selected = props.items.find((option) => {
        const key = attrs['option-value'] || 'id';
        return typeof props.modelValue === 'object' && props.modelValue !== null
            ? option[key] === props.modelValue[key]
            : option[key] === props.modelValue;
    });

    return selected
        ? props.localed
            ? selected[props.optionLabel]?.[i18n.locale.value]
            : selected[props.optionLabel]
        : '';
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
    () => [props.items, props.modelValue],
    ([items, modelValue]) => {
        if (prevSelectedItem.value) return;

        const key = attrs['option-value'] || 'id';

        const matched = (items.length ? items : []).find((option) => {
            if (typeof modelValue === 'object' && modelValue !== null) {
                return option[key] === modelValue[key];
            }
            return option[key] === modelValue;
        });

        if (matched) prevSelectedItem.value = matched;
    },
    { immediate: true, deep: true }
);

watch(selectedItem, (newVal) => {
    const item = props.items.find(
        (option) => option[attrs['option-value'] || 'id'] === newVal
    );
    prevSelectedItem.value = item ? item[props.optionLabel] : null;
});

onMounted(() => {
    setValue();
});

const setValue = () => {
    selectedItem.value = props.modelValue ? props.modelValue : null;
};
const search = (event) => {
    handleSearch(event.value);
};

const changed = (event) => {
    emit('update:modelValue', event.value);
    emit('change');
};
</script>

<template>
    <div :is="closedTooltipText" v-tooltip.top="closedTooltipText">
        <Dropdown
            filter
            :loading="loading"
            @filter="search"
            v-model="selectedItem"
            :options="items"
            @change="changed"
            :optionLabel="computedLabel"
            :placeholder="placeholder || $t('common.select')"
            :disabled="disabled"
            v-bind="$attrs"
        >
            <template #value="slotProps">
                <div
                    v-if="slotProps.value"
                    class="flex align-items-center gap-3"
                >
                    <div id="api-dropdown-choice">
                        {{
                            props.localed
                                ? props.items.find((option) => {
                                      const key = attrs['option-value'] || 'id';
                                      return typeof props.modelValue ===
                                          'object' && props.modelValue !== null
                                          ? option[key] ===
                                                props.modelValue[key]
                                          : option[key] === props.modelValue;
                                  })?.[props.optionLabel]?.[
                                      i18n.locale.value
                                  ] || slotProps.placeholder
                                : ((typeof prevSelectedItem === 'object' &&
                                  prevSelectedItem !== null
                                      ? prevSelectedItem[props.optionLabel]
                                      : prevSelectedItem) ??
                                      props.items.find((option) => {
                                          const key =
                                              attrs['option-value'] || 'id';
                                          return typeof props.modelValue ===
                                              'object' &&
                                              props.modelValue !== null
                                              ? option[key] ===
                                                    props.modelValue[key]
                                              : option[key] ===
                                                    props.modelValue;
                                      })?.[props.optionLabel]) ||
                                  slotProps.placeholder
                        }}
                    </div>
                </div>
                <span v-else>
                    {{ slotProps.placeholder }}
                </span>
            </template>

            <template #option="{ option }">
                <slot name="option" :option="option">
                    <div
                        v-if="
                            props.tooltip && props.localed
                                ? option[optionLabel][i18n.locale.value]
                                      .length > props.tooltipLength
                                : option[optionLabel].length >
                                  props.tooltipLength
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
                                    ? option[props.optionLabel][
                                          i18n.locale.value
                                      ]
                                    : option[props.optionLabel],
                                {
                                    length: props.tooltipLength
                                }
                            )
                        }}
                    </div>
                    <div
                        v-else
                        style="text-overflow: ellipsis; max-width: 100px"
                    >
                        {{
                            props.localed
                                ? option[optionLabel][i18n.locale.value]
                                : option[optionLabel]
                        }}
                    </div>
                </slot>
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
        </Dropdown>
    </div>
    <small
        v-for="(error, index) in errors"
        :key="index"
        class="p-error block"
        :class="{ 'mb-2': index == errors.length - 1 }"
        id="text-error"
    >
        {{ error }}
    </small>
</template>
