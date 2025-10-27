<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Object,
        required: false
    },
    id: {
        type: String,
        required: false
    },
    label: {
        type: String,
        required: false
    },
    multiple: {
        type: Boolean,
        required: false
    },
    labelDataTestId: {
        type: String,
        required: false
    }
});
const emit = defineEmits(['update:modelValue']);

const i18n = useI18n();

const inputValues = computed({
    get() {
        return !props.modelValue ? {} : props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

const locales = computed(() => {
    return props.multiple ? i18n.availableLocales : [i18n.locale.value];
});

const getLabel = (localeKey) => {
    const getLanguageName = new Intl.DisplayNames(['en'], {
        type: 'language'
    });
    return props.multiple
        ? `${props.label} (${getLanguageName.of(localeKey)})`
        : props.label;
};

const inputFieldId = (locale) => {
    return props.multiple ? `${props.id}.${locale}` : props.id;
};
</script>

<template>
    <div
        v-for="(locale, index) in locales"
        :key="locale"
        class="field"
        :class="{ 'mb-0': locales.length == 1 || index == locales.length - 1 }"
    >
        <label
            :for="inputFieldId(locale)"
            class="w-full"
            :data-testid="labelDataTestId"
            >{{ getLabel(locale) }}
        </label>
        <InputField
            :id="inputFieldId(locale)"
            v-model="inputValues[locale]"
            v-bind="$attrs"
        />
    </div>
</template>
