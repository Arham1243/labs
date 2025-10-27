<script setup>
import { useRouter } from 'vue-router';
import BenefitGroupsBenefits from '@/modules/plans/components/benefit-groups/BenefitGroupsBenefits.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();

const goBack = () => {
    router.push({ name: 'New Benefit Group' });
};

const goNext = () => {
    router.push({ name: 'New Benefit Group Step 3', params: { id: props.id } });
};
</script>

<template>
    <div class="mt-4">
        <Card>
            <template #content>
                <BenefitGroupsBenefits
                    is-new
                    :id="props.id"
                    component-id="benefit-groups-benefits"
                />
            </template>
        </Card>

        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        data-testid="button-back"
                        label="Back"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        @click="goBack"
                    />
                    <div>
                        <Button
                            data-testid="button-save-continue"
                            label="Save & Continue"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            @click="goNext"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
