<script setup>
import { useRouter } from 'vue-router';
import BenefitServices from '@/modules/plans/components/benefits/BenefitServices.vue';
import { ref, watch } from 'vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();

const { bus } = useEventsBus();

const hasDuplicatedServiceCodes = ref(false);

const isHasDuplicatedServiceCodesDialog = ref(false);

watch(
    () => bus.value.get('hasDuplicatedServices'),
    (value) => {
        hasDuplicatedServiceCodes.value = value[0];
    }
);

const goBack = () => {
    router.push({ name: 'New Benefit' });
};

const goNext = () => {
    if (hasDuplicatedServiceCodes.value) {
        isHasDuplicatedServiceCodesDialog.value = true;
        return;
    }
    router.push({ name: 'New Benefit Step 3' });
};
</script>

<template>
    <div class="mt-12">
        <Card>
            <template #content>
                <BenefitServices
                    is-new
                    :id="props.id"
                    component-id="benefit-services"
                />
            </template>
        </Card>
    </div>

    <div class="grid grid-cols-12 my-20">
        <div class="col-span-12 col-start-1">
            <div class="mt-12 flex justify-between items-center edit-cancel-button">
                <Button
                    :label="$t('buttons.back')"
                    icon="pi pi-chevron-left"
                    class="p-button-outlined"
                    @click="goBack"
                    data-testid="back-button"
                />
                <div>
                    <Button
                        :label="$t('buttons.save_continue')"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        @click="goNext"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>
    </div>
    <Dialog
        v-model:visible="isHasDuplicatedServiceCodesDialog"
        modal
        :header="$t('benefits.duplicated_code_header')"
        :style="{ width: '480px' }"
    >
        <div>
            {{ $t('benefits.duplicated_code_content') }}
        </div>
        <div class="flex justify-end gap-2 mt-20">
            <Button
                type="button"
                :label="$t('buttons.close')"
                @click="isHasDuplicatedServiceCodesDialog = false"
            ></Button>
        </div>
    </Dialog>
</template>
