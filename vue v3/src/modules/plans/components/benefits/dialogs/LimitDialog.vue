<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';
import { useGlobalStore } from '@/stores';

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
        type: Object
    },
    isBulk: {
        type: Boolean,
        default: false
    },
    isIndividual: {
        type: Boolean,
        default: false
    },
    resources: {
        type: Array
    },
    header: {
        type: String,
        default: 'Confirm'
    }
});

const emits = defineEmits(['reloadItems', 'update:modelValue']);

const benefitStore = useBenefitStore();
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
    if (props.isBulk) {
        if (props.isIndividual) {
            updateBenefitIndividualServicesBulk();
        } else {
            updateBenefitGroupBulk();
        }
    } else {
        updateBenefitGroup();
    }
};

const updateBenefitGroup = async () => {
    try {
        busy.value = true;
        await benefitStore.updateBenefitServiceCodeGroup(
            props.id,
            props.item.id,
            {
                pivot: {
                    coverage: isCoverage.value ? coverage.value : null,
                    max_amount: isMax.value ? max_amount.value : null
                }
            }
        );
        emit('reloadBenefitCodeGroups');
        dialog.value = false;
    } finally {
        busy.value = false;
    }
};

const updateBenefitGroupBulk = async () => {
    try {
        busy.value = true;
        await benefitStore.updateBenefitServiceCodeGroupBulk(props.id, {
            resources: [...props.resources.map((item) => item.id)],
            pivot: {
                coverage: isCoverage.value ? coverage.value : null,
                max_amount: isMax.value ? max_amount.value : null
            }
        });
        emit('reloadBenefitCodeGroups');
        emits('reloadItems');
        dialog.value = false;
    } finally {
        busy.value = false;
    }
};

const updateBenefitIndividualServicesBulk = async () => {
    try {
        busy.value = true;
        await benefitStore.updateBenefitIndividualServicesBulk(props.id, {
            resources: [...props.resources.map((item) => item.id)],
            pivot: {
                coverage: isCoverage.value ? coverage.value : null,
                max_amount: isMax.value ? max_amount.value : null
            }
        });
        emit('reloadBenefitCodeGroups');
        emits('reloadItems');
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

onUnmounted(() => {
    useGlobalStore().clearErrors();
});
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="header"
        :style="{ width: '480px' }"
        @after-hide="useGlobalStore().clearErrors()"
    >
        <div class="p-fluid grid mt-2">
            <div class="col-12">
                <div class="flex">
                    <InputSwitch v-model="isCoverage" />
                    <span class="ml-2"> {{ $t('common.coverage') }} % </span>
                </div>
            </div>
            <div v-if="isCoverage" class="col-6 py-0">
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
            <div v-if="isMax" class="col-6 py-0">
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
            <input type="hidden" autofocus />
            <Button
                :disabled="busy"
                text
                :label="$t('buttons.cancel')"
                @click="dialog = false"
            />
            <Button
                :loading="busy"
                :disabled="busy"
                :label="$t('buttons.save')"
                @click="confirm"
            />
        </template>
    </Dialog>
</template>
