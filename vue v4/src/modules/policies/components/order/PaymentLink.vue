<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    paymentMethod: {
        type: Object,
        default: () => ({})
    }
});

const { t } = useI18n();
const paymentMethod = ref(props.paymentMethod);
</script>

<template>
    <div class="grid justify-content-center mt-4">
        <div :class="'col-9'">
            <Card>
                <template #title>
                    <h5>{{ $t('policies.payment.payment_link_details') }}</h5>
                    <span class="text-sm font-normal">
                        {{
                            $t('policies.payment.payment_link_description', {
                                amount: '1,364.00',
                                email: 'email@emailaddress.com'
                            })
                        }}
                    </span>
                    <hr />
                </template>
                <template #content>
                    <div class="grid mt-1">
                        <div class="col-12 grid">
                            <div class="col-8">
                                <InputText
                                    class="w-full"
                                    model-value="https://www.paymentlink.com"
                                    disabled
                                />
                            </div>
                            <div class="col-2">
                                <Button
                                    link
                                    :label="$t('policies.payment.copy_link')"
                                    icon="pi pi-copy"
                                />
                            </div>
                        </div>

                        <div class="col-12 pt-0 flex flex-column gap-2">
                            <label for="payment-message">{{
                                $t('policies.payment.message')
                            }}</label>
                            <Textarea id="payment-message" />
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style lang="scss"></style>
