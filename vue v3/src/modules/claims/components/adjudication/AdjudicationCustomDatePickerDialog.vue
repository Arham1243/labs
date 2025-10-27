<script setup>
import { computed, ref } from 'vue';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';

const visible = defineModel('visible');
const globalStore = useGlobalStore();
const { t } = useI18n();
const errorMessage = ref(null);
const startDate = ref(null);
const endDate = ref(null);

const emit = defineEmits(['update:visible', 'update-date-range', 'cancel']);

const isValidDateRange = computed(() => {
    if (!startDate.value || startDate.value === 'Invalid date') {
        errorMessage.value = t('notifications.start_date_required');
        return false;
    }
    if (!endDate.value || endDate.value === 'Invalid date') {
        errorMessage.value = t('notifications.end_date_required');
        return false;
    }
    if (endDate.value < startDate.value) {
        errorMessage.value = t('notifications.end_date_after_start_date');
        return false;
    }
    errorMessage.value = '';
    return true;
});

const confirmDateRange = () => {
    if (!isValidDateRange.value) {
        // Show success notification
        globalStore.showError(t('notifications.error'), errorMessage.value);
        return;
    }

    emit('update-date-range', {
        startDate: startDate.value,
        endDate: endDate.value
    });
    emit('update:visible', false);
};
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        header="Custom Range"
        :style="{ width: '40rem' }"
        data-testid="adjudication-custom-date-picker-dialog"
    >
        <div class="p-fluid formgrid grid mt-4">
            <div class="field col-6">
                <label class="block mb-2 font-medium">Start Date</label>
                <DatePicker
                    v-model="startDate"
                    :placeholder="$t('claims.start_date')"
                    data-testid="start-date-picker"
                    class="w-full"
                />
            </div>

            <div class="field col-6">
                <label class="block mb-2 font-medium">End Date</label>
                <DatePicker
                    v-model="endDate"
                    :placeholder="$t('claims.end_date')"
                    data-testid="end-date-picker"
                    class="w-full"
                />
            </div>
        </div>
        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                @click="
                    () => {
                        startDate = null;
                        endDate = null;
                        visible = false;
                        $emit('cancel');
                    }
                "
                data-testid="btn-cancel"
                text
            />
            <Button
                :label="$t('buttons.confirm')"
                @click="confirmDateRange"
                data-testid="btn-confirm"
                class="ml-2"
            />
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
