<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ManualPayment from '@/modules/policies/components/order/ManualPayment.vue';
import PaymentLink from '@/modules/policies/components/order/PaymentLink.vue';
import { useCartsStore } from '@/modules/policies/stores/index.js';
import { invoicePaymentOptions } from '@/config/index.js';
import { useHelpers } from '@/composables/index.js';

const iconMap = {
    [invoicePaymentOptions.BANK_TRANSFER.value]: 'pi-arrow-right-arrow-left',
    [invoicePaymentOptions.CHEQUE.value]: 'pi-wallet',
    [invoicePaymentOptions.PAYMENT_LINK.value]: 'pi-link'
};

const router = useRouter();
const { t } = useI18n();
const cartStore = useCartsStore();
const helpers = useHelpers();

const loading = ref(false);
const selectedPaymentMethod = ref(null);
const manualPaymentRef = ref(null);
const paymentMethods = ref([]);
const cartAmount = ref(0);

const isConfirmAndPayButtonDisabled = computed(() => {
    if (isManualPayment.value) {
        return !manualPaymentRef.value?.isReadyToConfirm;
    }

    return !selectedPaymentMethod.value;
});

const isManualPayment = computed(() => {
    return [
        invoicePaymentOptions.BANK_TRANSFER.value,
        invoicePaymentOptions.CHEQUE.value
    ].includes(selectedPaymentMethod.value?.method);
});

const selectPaymentMethod = (paymentMethod) => {
    selectedPaymentMethod.value = paymentMethod;
};

const back = (event) => {
    router.go(-1);
};

const confirmAndPay = async (event) => {
    if (isManualPayment.value) {
        const isSuccess = await manualPaymentRef.value?.checkoutCart();
        if (!isSuccess) {
            return;
        }
    }

    await router.push({
        name: 'Success'
    });
};

(() => {
    loading.value = true;
    cartStore
        .getCheckout()
        .then((billingDetails) => {
            const allowed = billingDetails?.data?.payment_methods || [];

            paymentMethods.value = [];
            allowed.forEach((paymentType) => {
                paymentMethods.value.push({
                    method: paymentType,
                    name: t(`policies.payment.methods.${paymentType}`),
                    icon: `pi ${iconMap[paymentType] || 'pi-dollar'}`,
                    disabled: false
                });
            });

            cartAmount.value = billingDetails?.data?.amount;
        })
        .finally(() => {
            loading.value = false;
        });
})();
</script>

<template>
    <div class="mt-6">
        <div v-if="!loading">
            <div class="font-semibold text-xl">
                {{ $t('policies.payment.title') }}
            </div>

            <div class="flex justify-center">
                <div class="grid grid-flow-col gap-4 mt-4 w-[50rem]">
                    <div
                        class="col-span-4"
                        v-for="paymentMethod in paymentMethods"
                        :key="paymentMethod.method"
                    >
                        <SelectableIconButton
                            avatarIcon
                            :item="paymentMethod"
                            :icon="paymentMethod.icon"
                            :label="paymentMethod.name"
                            labelClasses="text-xl"
                            :selected="
                                paymentMethod.method ===
                                selectedPaymentMethod?.method
                            "
                            :disabled="paymentMethod.disabled"
                            @click="selectPaymentMethod"
                        />
                    </div>
                </div>
            </div>

            <ManualPayment
                ref="manualPaymentRef"
                :paymentMethod="selectedPaymentMethod"
                :key="selectedPaymentMethod.name"
                v-if="isManualPayment"
            />

            <PaymentLink
                :paymentMethod="selectedPaymentMethod"
                :key="selectedPaymentMethod.name"
                v-if="
                    selectedPaymentMethod?.method ===
                    invoicePaymentOptions.PAYMENT_LINK.value
                "
            />

            <div class="flex justify-between mt-6">
                <Button
                    type="button"
                    :label="$t('buttons.back')"
                    icon="pi pi-chevron-left"
                    class="p-button-outlined"
                    @click="back"
                ></Button>
                <Button
                    type="button"
                    :label="
                        $t('policies.payment.comfirm_and_pay_button_label', {
                            amount: helpers.moneyFormat(cartAmount)
                        })
                    "
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    :disabled="isConfirmAndPayButtonDisabled"
                    @click="confirmAndPay"
                ></Button>
            </div>
        </div>
    </div>
</template>

<style lang="scss"></style>
