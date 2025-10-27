<script setup>
import { ref, computed, watch } from 'vue';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    categoryId: {
        type: [String, Number],
        required: true
    },
    initialCategoryName: {
        type: Object,
        required: true
    }
});

const emits = defineEmits(['update:modelValue', 'updated']);

const benefitStore = useBenefitStore();
const { emit } = useEventsBus();

const busy = ref(false);
const formData = ref({
    name: { ...props.initialCategoryName }
});

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

watch(
    () => props.initialCategoryName,
    (newValue) => {
        formData.value.name = { ...newValue };
    },
    { immediate: true }
);

const confirm = async () => {
    try {
        busy.value = true;
        await benefitStore.updateBenefitCategory(
            props.categoryId,
            formData.value
        );
        dialog.value = false;
        emits('updated');
        emit('reloadCategories');
    } catch (error) {
        console.error('Error updating category:', error);
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('benefits.update_benefit_category')"
        :style="{ width: '480px' }"
    >
        <div class="grid grid-cols-12">
            <div class="field col-span-12">
                <label>Category Name *</label>
                <LocaleField
                    id="name"
                    type="text"
                    variant="text"
                    class="w-full"
                    v-model="formData.name"
                />
            </div>
        </div>
        <template #footer>
            <div class="edit-cancel-button">
                <input type="hidden" autofocus />
                <Button
                    :disabled="busy"
                    text
                    :label="$t('buttons.cancel')"
                    @click="dialog = false"
                    class="mr-2"
                />
                <Button
                    :loading="busy"
                    :disabled="busy"
                    :label="$t('buttons.save')"
                    @click="confirm"
                />
            </div>
        </template>
    </Dialog>
</template>
