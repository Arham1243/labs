<script setup>
import RadioGroup from './RadioGroup.vue';
import { watch, ref } from 'vue';
import { validator } from '@/modules/claims/utils/submissions';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    field: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    forceKey: Number
});

const { t } = useI18n();
let vModel = defineModel();
let vValidate = defineModel('validate');

// Event emitter for FileUpload specifically
const emit = defineEmits([
    'beforeSend',
    'removeUploadedFile',
    'onChanged',
    'additionalAction'
]);
const beforeSend = (event) => emit('beforeSend', event);
const removeUploadedFile = (event) => emit('removeUploadedFile', event);
const onChanged = (event) => emit('onChanged', event);

// Field validations
let error_message = ref('');

let special_comp = [
    'InputNumber',
    'Dropdown',
    'ApiDropdown',
    'Calendar',
    'FileUpload',
    'MultiSelect'
].indexOf(props.field.type);

const checker = () => {
    // console.log('field.type', props.field.type, vModel.value)
    let error = validator(props.field.props.validate, vModel.value);
    let val = special_comp > -1 ? vModel.value : vModel.value?.trim();

    if (props.field.required && !val)
        error_message.value = `${props.field.label || 'Field'} is required`;
    else if ((props.field.required || val) && error)
        error_message.value = error;
    else if (
        special_comp < 0 &&
        !vModel.value?.trim() &&
        vModel.value !== vModel.value?.trim() &&
        props.field.validate
    )
        error_message.value = 'Please enter valid data';
    else error_message.value = '';
};

if (vModel.value) checker();

const onUpload = () => {
    // upload file
    console.log('To Upload');
};

watch(
    () => vModel,
    () => checker(),
    { deep: true }
);

watch(
    () => vValidate.value,
    () => {
        vValidate.value ? checker() : '';
    },
    { immediate: true }
);
</script>

<template>
    <RadioGroup
        v-if="field.type === 'RadioGroup'"
        :label="field.label"
        :options="field.props.options"
        :name="field.props.name"
        :required="field.required ?? false"
        v-model="vModel"
    />
    <div
        v-else
        class="flex gap-2 py-2 mb-2"
        :class="
            (field.class ?? ' col-12') +
            (field.class?.includes('flex-row') ? '' : ' flex-column')
        "
    >
        <div
            v-if="field.additional"
            class="flex justify-content-between items-center"
        >
            <label
                for="template"
                data-testid="label-template"
                v-html="
                    field.label +
                    ' ' +
                    (field.required ? '<span class=text-red-500>*</span>' : '')
                "
            />
            <p
                class="text-primary cursor-pointer font-bold"
                @click="$emit('additionalAction')"
            >
                <i
                    v-if="field.additional.icon"
                    :class="field.additional.icon + ' mr-1'"
                ></i>
                {{ field.additional.label }}
            </p>
        </div>
        <div v-else>
            <label
                v-if="field.label"
                :for="field.props.name"
                :data-testid="'label-' + field.props.name"
                :class="field.labelStyle"
                v-html="
                    field.label +
                    ' ' +
                    (field.required ? '<span class=text-red-500>*</span>' : '')
                "
            />
        </div>
        <span
            v-if="field.type === 'Calendar'"
            class="p-input-icon-right"
            :class="{ field_error: !!error_message }"
            :data-testid="'input-' + field.props.name"
        >
            <i class="pi pi-calendar" />
            <Calendar
                v-bind="field.props"
                v-model="vModel"
                class="w-full z-2 relative bg-transparent"
                @blur="checker"
                showButtonBar
            />
        </span>
        <Editor
            v-else-if="field.type === 'editor'"
            v-model="vModel"
            editorStyle="height: 160px"
            :class="{ field_error: !!error_message }"
            :pt="{
                formats: { class: 'mr-1' },
                color: { class: 'hidden' },
                background: { class: 'hidden' },
                clean: { class: 'hidden' },
                select: { class: 'hidden' }
            }"
            :key="forceKey"
            data-testid="editor-note-details"
            @blur="checker"
            @load="
                ({ instance }) =>
                    instance.setContents(
                        instance.clipboard.convert({ html: vModel })
                    )
            "
            placeholder="Type here..."
        />
        <FileUpload
            v-else-if="field.type === 'file'"
            name="files[]"
            url=""
            :maxFileSize="1000000"
            @upload="onUpload"
            :class="{ field_error: !!error_message }"
            :pt="{
                buttonbar: {
                    class: 'p-3 bg-white border-round',
                    style: {
                        border: '1px solid #DDD'
                    }
                },
                content: { class: 'hidden' }
            }"
            data-testid="upload-attachment"
            @blur="checker"
        >
            <template #header="{ chooseCallback }">
                <a
                    class="flex gap-2 align-items-center text-color-secondary"
                    @click="chooseCallback()"
                >
                    <i class="pi pi-paperclip" />
                    {{ $t('activities.choose_file') }}
                </a>
            </template>
        </FileUpload>
        <component
            v-else
            :is="field.type"
            v-bind="field.props"
            v-model="vModel"
            :inputId="field.props.name"
            :class="{ field_error: !!error_message }"
            :data-testid="'input-' + field.props.name"
            @blur="checker"
            @beforeSend="beforeSend($event)"
            :placeholder="field.placeholder"
            @removeUploadedFile="
                removeUploadedFile({ ...$event, field: field.props.name })
            "
            @change="onChanged($event)"
            @search="field.props.fetchItems"
            :disabled="props.disabled"
        />
        <small
            v-if="error_message"
            class="text-red-500"
            v-text="error_message"
            :data-testid="'text-error-' + field.props.name"
        />
        <small
            v-else-if="
                field.type === 'Textarea' &&
                field.props?.maxLength &&
                vModel?.length
            "
            class="text-red-500"
            v-text="
                field.props.maxLength - vModel.length > 0
                    ? field.props.maxLength -
                      vModel.length +
                      ' characters remaining'
                    : ''
            "
            :data-testid="'text-error-' + field.props.name"
        />
    </div>
</template>
