<script setup>
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import useEventsBus from '@/composables/event-bus';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const planStore = usePlanStore();
const { bus } = useEventsBus();

const goBack = () => {
    if (bus.value.get('openSyncPricesDialog')) {
        bus.value.set('openSyncPricesDialog', null);
    }
    bus.value.set('backFromStep3', true);
    router.push({ name: 'New Plan Step 2', params: { id: props.id } });
};

const goNext = () => {
    const hasOptOut = planStore.currentPlan?.is_opt_out;
    if (hasOptOut) {
        router.push({
            name: 'New Plan Step 4 OptOut',
            params: { id: props.id }
        });
    } else {
        router.push({
            name: 'New Plan Step 4 Documents',
            params: { id: props.id }
        });
    }
};
</script>

<template>
    <div class="mt-12">
        <Card>
            <template #content>
                <AttachPricingInit
                    is-new
                    is-disabled-net-price
                    :isCopy="false"
                    :id="props.id"
                    :store="planStore"
                    :title="$t('plans.pricing_based_on_region_country')"
                    has-price-breakdown
                    can-recalculate-pricings
                    component-id="attach-pricing-init"
                    is-plan
                />
            </template>
        </Card>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12">
                <div
                    class="mt-12 flex justify-between items-center edit-cancel-button"
                >
                    <Button
                        :label="$t('buttons.back')"
                        icon="pi pi-chevron-left"
                        class="p-button-outlined"
                        data-testid="back-button"
                        @click="goBack"
                    />
                    <div>
                        <Button
                            :label="$t('buttons.save_continue')"
                            icon-pos="right"
                            icon="pi pi-chevron-right"
                            data-testid="save-continue-button"
                            @click="goNext"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
