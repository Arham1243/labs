<script setup>
import { ref, computed } from 'vue';
import { usePlanStore } from '@/modules/plans/stores/Plan';
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
    }
});

const emits = defineEmits(['confirm', 'update:modelValue']);

const planStore = usePlanStore();
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
        await planStore.updateBenefitGroups(props.id, props.item.id, {
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
        <div class="p-fluid grid mt-2">
            <div class="col-12">
                <div class="flex">
                    <InputSwitch v-model="isCoverage" />
                    <span class="ml-2"> {{ $t('common.coverage') }} % </span>
                </div>
            </div>
            <div v-if="isCoverage" class="col-12 py-0">
                <InputField
                    id="pivot.coverage"
                    variant="number"
                    addon-after="pi pi-percentage"
                    v-model="coverage"
                />
            </div>

            <div class="col-12">
                <div class="flex">
                    <InputSwitch v-model="isMax" />
                    <span class="ml-2">
                        {{ $t('common.to_a_maximum_of') }}
                    </span>
                </div>
            </div>
            <div v-if="isMax" class="col-12 py-0">
                <InputField
                    id="pivot.max_amount"
                    variant="number"
                    addon-before="pi pi-dollar"
                    addon-after=".00"
                    v-model="max_amount"
                />
            </div>
        </div>

        <template #footer>
            <Button
                :disabled="busy"
                text
                label="Cancel"
                data-testid="cancel-button"
                @click="dialog = false"
            />
            <Button
                :loading="busy"
                :disabled="busy"
                label="Save"
                data-testid="save-button"
                @click="confirm"
            />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped></style>
