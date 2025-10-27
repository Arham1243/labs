<script setup>
import { ref, computed } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emits = defineEmits(['update:modelValue', 'created']);

const benefitStore = useBenefitStore();
const { emit } = useEventsBus();

const busy = ref(false);
const formData = ref({
    name: { en: '', fr: '' }
});

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const confirm = async () => {
    try {
        busy.value = true;
        await benefitStore.createBenefitCategory(formData.value);
        dialog.value = false;
        emits('created');
        emit('reloadCategories');
    } catch (error) {
        //
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('benefits.new_benefit_category')"
        :style="{ width: '480px' }"
    >
        <div class="p-fluid grid">
            <div class="field col-12">
                <label>Category Name *</label>
                <LocaleField
                    id="name"
                    type="text"
                    variant="text"
                    v-model="formData.name"
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
