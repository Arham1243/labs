<script setup>
const props = defineProps({
    beneficiary: Object
});
</script>

<template>
    <OverlayPanel ref="opBeneficiary" :style="{ width: '450px' }">
        <div>
            <h5 data-testid="label-beneficiary-details">
                {{ $t('expenses.beneficiary_details') }}
            </h5>
            <div>
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
                    <div
                        class="col-span-5 font-semibold py-1"
                        data-testid="label-payment-method"
                    >
                        {{ $t('expenses.payment_method') }}
                    </div>
                    <div
                        class="col-span-7 py-1 p-break-word"
                        data-testid="text-payment-method"
                    >
                        -
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
                    <div
                        class="col-span-5 font-semibold py-1"
                        data-testid="label-beneficiary-type"
                    >
                        {{ $t('expenses.beneficiary_type') }}
                    </div>
                    <div
                        class="col-span-7 py-1 p-break-word"
                        data-testid="text-beneficiary-type"
                    >
                        Health Clinic
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 mt-2">
                    <div
                        class="col-span-5 font-semibold py-1"
                        data-testid="label-beneficiary"
                    >
                        {{ $t('expenses.beneficiary') }}
                    </div>
                    <div
                        class="col-span-7 py-1 p-break-word"
                        data-testid="text-beneficiary"
                    >
                        {{ props.name }}
                    </div>
                </div>
            </div>
        </div>
    </OverlayPanel>
</template>

<style scoped lang="scss"></style>
