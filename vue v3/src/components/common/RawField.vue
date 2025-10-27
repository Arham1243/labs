<script setup>
import PhoneInput from './PhoneInput.vue';
import lodash from 'lodash';

defineProps({
    variant: {
        type: String,
        required: true
    },
    errorMessages: {
        type: [String, Array]
    }
});
</script>
<template>
    <InputText
        v-if="variant == 'text'"
        v-bind="$attrs"
        @input="
            $attrs['onUpdate:modelValue'] &&
            $attrs['onUpdate:modelValue'](
                $event.target.value === '' ? null : $event.target.value
            )
        "
    />
    <Textarea
        v-else-if="variant == 'textarea'"
        v-bind="$attrs"
        @input="
            $attrs['onUpdate:modelValue'] &&
            $attrs['onUpdate:modelValue'](
                $event.target.value === '' ? null : $event.target.value
            )
        "
    />
    <AutoComplete v-else-if="variant == 'autocomplete'" v-bind="$attrs" />
    <Chips v-else-if="variant == 'chips'" v-bind="$attrs" />
    <Checkbox v-else-if="variant == 'checkbox'" v-bind="$attrs" />
    <RadioButton v-else-if="variant == 'radio'" v-bind="$attrs" />
    <InputNumber
        v-else-if="variant == 'number'"
        v-bind="$attrs"
        :maxFractionDigits="2"
        :max="999999999999999"
        @input="
            $attrs['onUpdate:modelValue'] &&
            $attrs['onUpdate:modelValue']($event.value)
        "
    />
    <Password v-else-if="variant == 'password'" v-bind="$attrs" />
    <MultiSelect v-else-if="variant == 'multiselect'" v-bind="$attrs" />
    <Dropdown v-else-if="variant == 'dropdown'" v-bind="$attrs">
        <template #option="{ option }" v-if="$attrs.tooltip">
            <div
                v-if="
                    option.value
                        ? option.value.length > ($attrs.tooltipLength ?? 20)
                        : option.name.length > ($attrs.tooltipLength ?? 20)
                "
                v-tooltip.top="option.value ?? option.name"
            >
                {{
                    lodash.truncate(option.name, {
                        length: $attrs.tooltipLength ?? 20
                    })
                }}
            </div>
        </template>
    </Dropdown>
    <SelectButton v-else-if="variant == 'selectButton'" v-bind="$attrs" />
    <InputSwitch v-else-if="variant == 'switch'" v-bind="$attrs" />
    <PhoneInput v-else-if="variant == 'phone'" v-bind="$attrs" />
    <div v-else-if="variant == 'date'">
        <span class="p-input-icon-left">
            <i class="pi pi-calendar" />
            <Calendar
                :placeholder="$t('common.select_date')"
                dateFormat="dd-M-yy"
                showButtonBar
                v-bind="$attrs"
                class="w-full"
            />
        </span>
    </div>
</template>

<style lang="scss" scoped></style>
