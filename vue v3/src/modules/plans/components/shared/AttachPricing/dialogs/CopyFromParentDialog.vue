<script setup>
import { onMounted, ref } from 'vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    copyDialog: {
        required: true,
        type: Boolean
    },
    id: {
        type: String,
        required: true
    },
    parent: {
        type: String,
        default: ''
    },
    store: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['closeDialog']);
const { emit } = useEventsBus();

const dialog = ref(props.copyDialog);
const loading = ref(true);
const processing = ref(false);
const overlapping = ref(null);

onMounted(() => {
    getItems();
});

const getItems = async () => {
    loading.value = true;
    const res = await props.store.overlapping(props.parent, props.id);
    loading.value = false;

    overlapping.value = res;
};

const copyPricing = async () => {
    processing.value = true;
    await props.store.copyPricingFromParent(props.parent, props.id);
    processing.value = false;

    emit('reloadPrices');
    emits('closeDialog');
};
</script>
<template>
    <div>
        <Dialog
            v-model:visible="dialog"
            modal
            closable
            @after-hide="emits('closeDialog')"
            :closeOnEscape="false"
            :header="$t('plans.copy_pricing_from_parent_warning_header')"
            :style="{ width: '500px' }"
        >
            <div>
                {{
                    $t('plans.copy_pricing_from_parent_warning_body', {
                        count: overlapping
                    })
                }}
            </div>
            <div class="flex justify-content-end gap-2 mt-5">
                <Button
                    type="button"
                    :disabled="processing"
                    :label="$t('buttons.cancel')"
                    class="p-button-outlined"
                    text
                    @click="emits('closeDialog')"
                    data-testid="close-button"
                ></Button>
                <Button
                    type="button"
                    :disabled="processing"
                    :loading="processing"
                    :label="$t('buttons.confirm')"
                    @click="copyPricing"
                    data-testid="copy-button"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
