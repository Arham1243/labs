<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useCommonStore, useGlobalStore } from '@/stores';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    serviceCode: {
        type: Object
    },
    serviceCodeSetId: {
        type: [String, Number],
        default: null
    }
});

const emit = defineEmits(['added', 'refresh', 'update:modelValue']);
const i18n = useI18n();
const locale = i18n.locale.value;
const codeSetStore = useCodeSetStore();
const commonStore = useCommonStore();
const globalStore = useGlobalStore();

const busy = ref(false);
const loading = ref(false);
const loadingTags = ref(false);
const serviceCodes = ref([]);
const tags = ref([]);
const selectedServiceCode = ref(null);
let formData = reactive({ code: '', description: { [locale]: '' }, tags: [] });

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});

onMounted(() => {
    formData.tags.forEach((value) => {
        delete value.id;
    });
    searchTags();
});

watch(
    () => [props.modelValue],
    () => {
        onShow();
    }
);

const searchTags = async (event) => {
    try {
        loadingTags.value = true;
        const query = event ? event.query : '';
        const payload = { search: { value: query } };
        const res = await commonStore.searchTags(payload);
        tags.value = res.data;
    } finally {
        loadingTags.value = false;
    }
};

const reset = () => {
    selectedServiceCode.value = null;
    formData.description = {
        [locale]: ''
    };
    formData.tags = [];
};

const onShow = () => {
    if (!props.modelValue) return;
    if (props.serviceCode) {
        formData = props.serviceCode;
        formData.tags = props.serviceCode.tags.map((tag) => tag.name);
    } else {
        formData.code = '';
        reset();
    }
};

const processPayload = (data) => {
    const toRet = {
        ...data,
        service_code_set_id: props.serviceCodeSetId
        // tags: data.tags.map((item) => item.name)
    };
    return toRet;
};

const addCustomTag = (event) => {
    if (event.key === 'Enter') {
        const existingOption = formData.tags.find(
            (option) => option === event.target.value
        );
        if (!existingOption) {
            formData.tags = [...formData.tags, event.target.value].filter(
                String
            );
            event.target.value = '';
        }
    }
};

const onTagSelect = (event) => {
    if (typeof event.value === 'object' && event.value !== null) {
        const tagName = event.value.name;
        const existingOption = formData.tags.find(
            (option) => option === tagName
        );

        if (existingOption) {
            formData.tags = formData.tags.filter(tag => typeof tag === 'string');
            return;
        }
        formData.tags = formData.tags.filter(tag => typeof tag === 'string');
        formData.tags = [...formData.tags, tagName];
    }
};

const onTagUnSelect = (event) => {
    formData.tags = formData.tags.filter((val) => val !== event.value);
};

const create = async () => {
    const payload = processPayload(formData);
    try {
        const res = await codeSetStore.createServiceCode(payload);
        emit('added', res.data);
        dialog.value = false;
    } catch (e) {
        console.log(e);
    }
};

const update = async () => {
    const payload = processPayload(formData);
    try {
        await codeSetStore.updateServiceCode(props.serviceCode.id, payload);
        emit('refresh');
        dialog.value = false;
    } catch (e) {
        console.log(e);
    }
};

const save = async () => {
    try {
        busy.value = true;
        props.serviceCode ? await update() : await create();
    } finally {
        busy.value = false;
    }
};
const clearErrors = () => {
    globalStore.clearErrors();
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        @update:visible="onShow"
        :style="{ width: '480px' }"
        :header="
            props.serviceCode
                ? $t('services.update_service_code')
                : $t('services.new_service_code')
        "
        @after-hide="clearErrors"
    >
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
                <label
                    for="code"
                    class="mb-2"
                    data-testid="code-label"
                    >{{ $t('common.code') }} *</label
                >
                <InputField
                    v-if="serviceCode"
                    id="code"
                    type="text"
                    variant="text"
                    class="w-full"
                    v-model="formData.code"
                    data-testid="input-code"
                />
                <InputField
                    v-else
                    id="code"
                    type="text"
                    variant="text"
                    class="w-full"
                    v-model="formData.code"
                    data-testid="input-code"
                />
            </div>
            <div class="col-span-12">
                <LocaleField
                    id="description"
                    :label="`${$t('common.description')} *`"
                    variant="textarea"
                    class="w-full"
                    rows="5"
                    v-model="formData.description"
                    autoResize
                    data-testid="input-description"
                />
            </div>
            <div class="col-span-12">
                <label
                    for="tags"
                    class="mb-2"
                    data-testid="tags-label">{{$t('common.tags') }}</label>
                <AutoComplete
                    v-model="formData.tags"
                    multiple
                    id="tags"
                    class="w-full"
                    :loading="loadingTags"
                    :placeholder="$t('services.select_tags')"
                    :suggestions="tags"
                    optionLabel="name"
                    @complete="searchTags"
                    @item-select="onTagSelect"
                    @keydown.enter="addCustomTag"
                    @item-unselect="onTagUnSelect"
                    :autoOptionFocus="false"
                    data-testid="autocomplete-tags"
                >
                    <template #chip="{ value, removeCallback }">
                        <div class="flex items-center p-2 bg-slate-200 rounded-full m-1">
                            <span class="px-1" v-tooltip.top="value">
                                {{
                                    lodash.truncate(value, {
                                        length: 20
                                    })
                                }}
                            </span>
                            <button
                                class="pi pi-times-circle ml-2 cursor-pointer"
                                @click="removeCallback"
                                type="button"
                                aria-label="Remove"
                            ></button>
                        </div>
                    </template>
                    <template #empty>
                        <div>
                            <p data-testid="empty-state-message">
                                No tags found
                            </p>
                        </div>
                    </template>
                </AutoComplete>
                <small
                    v-if="globalStore.errors && globalStore.errors['tags']"
                    class="p-error block mb-2"
                    id="text-error"
                    data-testid="validation-error"
                >
                    {{ globalStore.errors['tags'][0] }}
                </small>
            </div>
        </div>

        <template #footer>
            <div class="edit-cancel-button flex gap-2">
                <Button
                    :label="$t('buttons.cancel')"
                    text
                    autofocus
                    @click="dialog = false"
                    class="p-button-outlined"
                    data-testid="button-cancel"
                />
                <Button
                    :label="$t('buttons.save')"
                    icon="pi pi-check"
                    :loading="busy"
                    @click="save"
                    data-testid="button-save"
                />
            </div>
        </template>
    </Dialog>
</template>
