<script setup>
import { ref } from 'vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    openDialog: {
        required: true,
        type: Boolean
    },
    id: {
        type: String,
        required: true
    },
    store: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['closeDialog']);
const { emit } = useEventsBus();

const dialog = ref(props.openDialog);
const processing = ref(false);

const syncPrices = async () => {
    processing.value = true;
    await props.store.syncPrices(props.id);
    processing.value = false;

    emit('reloadPrices');
    emit('reloadBenefitGroupDetails');
    emit('reloadPlanDetails');
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
            :header="$t('common.sync_prices_warning_header')"
            :style="{ width: '500px' }"
        >
            <div>
                {{ $t('common.sync_prices_warning_body') }}
            </div>
            <div class="flex justify-end gap-2 mt-20">
                <Button
                    type="button"
                    :disabled="processing"
                    :label="$t('buttons.close')"
                    class="p-button-outlined"
                    text
                    @click="emits('closeDialog')"
                    data-testid="close-button"
                ></Button>
                <Button
                    type="button"
                    :disabled="processing"
                    :loading="processing"
                    :label="$t('buttons.sync')"
                    @click="syncPrices"
                    data-testid="sync-button"
                ></Button>
            </div>
        </Dialog>
    </div>
</template>
