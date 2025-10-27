<script setup>
import { ref, computed } from 'vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true
    },
    item: {
        type: Object,
        required: true
    },
    header: {
        type: String,
        default: 'Confirm'
    },
    store: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['confirm', 'update:modelValue']);

const { emit } = useEventsBus();

const isCoverage = ref(props.item && props.item.pivot?.coverage ? true : false);
const isMax = ref(props.item && props.item.pivot?.max_amount ? true : false);
const coverage = ref(
    props.item && props.item.pivot?.coverage ? props.item.pivot.coverage : null
);
const max_amount = ref(
    props.item && props.item.pivot?.max_amount
        ? props.item.pivot.max_amount
        : null
);
const busy = ref(false);

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);

        if (!value) {
            resetState();
        }
    }
});

const confirm = async () => {
    try {
        busy.value = true;
        await props.store.updateBenefitGroups(props.id, props.item.id, {
            pivot: {
                coverage: isCoverage.value ? coverage.value : null,
                max_amount: isMax.value ? max_amount.value : null
            }
        });
        emit('reloadPlanBenefitGroups');
        dialog.value = false;
    } finally {
        busy.value = false;
    }
};

const resetState = () => {
    isCoverage.value = false;
    isMax.value = false;
    coverage.value = null;
    max_amount.value = null;
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="header"
        :style="{ width: '480px' }"
    >
        <div class="p-fluid grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
            <div class="col-span-12">
                <div class="flex">
                    <InputField
                        variant="switch"
                        v-model="isCoverage"
                        data-testid="pivot.coverage"
                    />
                    <span class="ml-2"> {{ $t('common.coverage') }} % </span>
                </div>
            </div>
            <div v-if="isCoverage" class="col-span-12 py-0">
                <InputField
                    id="pivot.coverage"
                    variant="number"
                    addon-after="pi pi-percentage"
                    v-model="coverage"
                    data-testid="pivot.coverage"
                />
            </div>

            <div class="col-span-12">
                <div class="flex">
                    <InputField
                        variant="switch"
                        v-model="isMax"
                        data-testid="pivot.max_amount"
                    />
                    <span class="ml-2">
                        {{ $t('common.to_a_maximum_of') }}
                    </span>
                </div>
            </div>
            <div v-if="isMax" class="col-span-12 py-0">
                <InputField
                    id="pivot.max_amount"
                    variant="number"
                    addon-before="pi pi-dollar"
                    addon-after=".00"
                    v-model="max_amount"
                    data-testid="pivot.max_amount"
                />
            </div>
        </div>

        <template #footer>
            <Button
                :disabled="busy"
                text
                label="Cancel"
                @click="dialog = false"
                data-testid="cancel-button"
            />
            <Button
                :loading="busy"
                :disabled="busy"
                label="Save"
                @click="confirm"
                data-testid="save-button"
            />
        </template>
    </Dialog>
</template>
