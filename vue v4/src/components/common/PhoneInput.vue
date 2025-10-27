<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, null],
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);
const countryCode = ref('');
const phone = ref(props.modelValue || '');
const cursorPosition = ref(0);

onMounted(() => {
    nextTick(() => {
        parseNumber();
    });
});

watch(
    () => [props.modelValue],
    () => parseNumber()
);

const parseNumber = () => {
    if (props.modelValue) {
        const input = document.querySelector('.vti__input');
        if (input) {
            const currentPosition = input.selectionStart;
            if (currentPosition !== cursorPosition.value) {
                cursorPosition.value = currentPosition;
            }
        }

        const length = countryCode.value?.length + 1;
        const newPhone = props.modelValue.substring(length);

        if (phone.value !== newPhone) {
            phone.value = newPhone;

            nextTick(() => {
                const input = document.querySelector('.vti__input');
                if (input) {
                    input.setSelectionRange(
                        cursorPosition.value,
                        cursorPosition.value
                    );
                }
            });
        }
    } else {
        phone.value = '';
    }
};

const emitNumber = (number, phoneObject) => {
    countryCode.value = phoneObject.countryCallingCode;
    emit('update:modelValue', phoneObject.number ?? phone.value);
    parseNumber();
};
</script>
<template>
    <vue-tel-input
        v-model="phone"
        validCharactersOnly
        mode="international"
        :dropdownOptions="{
            above: true,
            showFlags: true,
            showSearchBox: true,
            showDialCodeInList: true,
            showDialCodeInSelection: true,
            preferredCountries: ['us', 'ca', 'gb', 'as']
        }"
        :inputOptions="{
            placeholder: $t('common.enter_phone_number'),
            maxlength: 15
        }"
        :invalidMsg="$t('common.phone_is_invalid')"
        @on-input="emitNumber"
    >
        <template #arrow-icon>
            <i class="pi pi-chevron-down"></i>
        </template>
    </vue-tel-input>
</template>

<style lang="scss">
.vue-tel-input.vue-tel-input {
    &:focus-within {
        box-shadow: none;
        border-color: none;
    }
    height: 36px;
    border: none;
}

.vti__dropdown-list.above {
    width: 435px;
}

.vti__dropdown-list.below {
    width: 435px;
}

.vti__dropdown {
    &:open {
        width: 100%;
    }
    &:focus {
        border-color: #14377d;
    }
    &:hover {
        border-color: #14377d;
        background-color: white;
    }
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    width: 25%;
}

.vti__input.vti__input {
    &:focus {
        border-color: #14377d;
    }
    &:hover {
        border-color: #14377d;
    }
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-left: 5px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
}

.vti__selection {
    justify-content: space-between;
}

.vti__country-code {
    font-size: 1rem !important;
    color: #000 !important;
}

.vue-tel-input.disabled .vti__dropdown {
    background-color: #e9ecef;
    pointer-events: none;
    opacity: 0.5;
}

.vue-tel-input.disabled .vti__input {
    background-color: #e9ecef;
    pointer-events: none;
    opacity: 0.5;
}
</style>
