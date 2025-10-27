<script setup>
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => {}
    },
    method: {
        type: Function,
        required: true
    },
    optionLabel: {
        type: String,
        default: ''
    },
    localed: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: 'Search'
    },
    clearable: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue']);

const i18n = useI18n();

const items = ref([]);
const loading = ref(false);
const selectedItem = ref();

onMounted(() => {
    setValue();
});

watch(props.modelValue, () => {
    setValue();
});

const computedLabel = computed(() => {
    return props.localed
        ? `${props.optionLabel}.${i18n.locale.value}`
        : props.optionLabel;
});

const getIconAfter = computed(() => {
    // return loading.value
    //     ? 'pi pi-spin pi-spinner'
    //     : props.clearable && !!props.modelValue
    //     ? 'pi pi-times'
    //     : '';
    return '';
});

const setValue = () => {
    selectedItem.value = props.modelValue ? props.modelValue : null;
};

const search = async (event) => {
    if (!event.query) return;
    try {
        loading.value = true;
        const payload = { search: { value: event.query } };
        const res = await props.method(payload);
        items.value = res.data;
    } finally {
        loading.value = false;
    }
};

const ItemSelected = (event) => {
    emit('update:modelValue', event.value);
};

const clearInput = () => {
    selectedItem.value = null;
    nextTick(() => {
        emit('update:modelValue', null);
    });
};
</script>

<template>
    <div class="api-autocomplete">
        <InputField
            type="text"
            forceSelection
            v-bind="$attrs"
            :loading="loading"
            variant="autocomplete"
            v-model="selectedItem"
            :suggestions="items"
            :optionLabel="computedLabel"
            :placeholder="placeholder"
            :icon-after="getIconAfter"
            @complete="search"
            @iconAfterClick="clearInput"
            @item-select="ItemSelected"
        />
        <!-- <Button
            v-if="selectedItem && clearable && !loading"
            icon="pi pi-times"
            size="small"
            text
            rounded
            class="clear-btn"
            @click.stop="clearInput"
        /> -->
    </div>
</template>

<style lang="scss" scoped>
.api-autocomplete {
    position: relative;

    .clear-btn {
        position: absolute;
        right: 2px;
        top: 2px;
        box-shadow: none;
    }
}
</style>
