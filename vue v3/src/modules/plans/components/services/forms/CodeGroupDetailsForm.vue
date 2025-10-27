<script setup>
import { watch, onMounted, ref } from 'vue';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    }
});

const codeSetStore = useCodeSetStore();
const emit = defineEmits(['update:modelValue']);

const codeSets = ref([]);
const loadingCodeSets = ref(false);
const formData = ref(props.modelValue);

watch(formData, (value) => {
    emit('update:modelValue', value);
});

onMounted(() => {
    getCodeSets(formData.value.service_code_set?.name?.en ?? null);
});

const getCodeSets = async (search) => {
    try {
        loadingCodeSets.value = true;
        const res = await codeSetStore.searchCodeSets(
            {
                search: {
                    value: search,
                    case_sensitive: false
                },
                filters: [
                    {
                        field: 'status',
                        operator: '=',
                        value: 'active'
                    }
                ]
            },
            { limit: 100 }
        );
        codeSets.value = res.data.map((item) => {
            return {
                id: item.id,
                name: item.name
            };
        });
    } finally {
        loadingCodeSets.value = false;
    }
};
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
                data-testid="name"
            />
        </div>
        <div class="field col-12">
            <LocaleField
                id="description"
                label="Description"
                type="text"
                variant="textarea"
                autoResize
                :multiple="!isNew"
                v-model="formData.description"
                data-testid="description"
            />
        </div>
        <div class="field col-12">
            <label for="description" data-testid="description-label"
                >Code Set *</label
            >
            <ApiDropdown
                :disabled="!!formData.id"
                localed
                id="service_code_set_id"
                option-label="name"
                v-model="formData.service_code_set"
                @search="getCodeSets"
                :loading="loadingCodeSets"
                :items="codeSets"
                data-testid="service-code-set-id"
                :tooltip="true"
                :tooltipLength="90"
            />
        </div>
        <div class="field col-6">
            <label data-testid="label-effective-date">Effective Date *</label>
            <DatePicker
                id="effective_date"
                v-model="formData.effective_date"
                data-testid="datepicker-effective-date"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
