<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';
import { useRouter, useRoute } from 'vue-router';
import useEventsBus from '@/composables/event-bus';

import InvoiceStatusTag from '@/modules/accounting/components/invoices/InvoiceStatusTag.vue';
import InvoiceDetails from '@/modules/accounting/components/invoices/InvoiceDetails.vue';
import VoidInvoiceDialog from '@/modules/accounting/components/dialogs/VoidInvoiceDialog.vue';
import { useHelpers } from '@/composables';

const { t } = useI18n();
const { emit } = useEventsBus();
const router = useRouter();
const route = useRoute();
const helpers = useHelpers();
const invoicesStore = useInvoicesStore();

const loading = ref(false);
const actionMenu = ref();
const showVoidInvoiceDialog = ref(false);
const invoiceDetails = ref({});
const invoiceItems = ref([]);
const invoiceId = route.params.id;

const actionMenuItems = computed(() => {
    return [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => ''
        },
        {
            label: t('buttons.resend'),
            icon: 'pi pi-reply',
            command: () => {}
        },
        {
            label: t('buttons.record_payment'),
            icon: 'pi pi-money-bill',
            command: () => {}
        },
        {
            label: t('invoice.invoice_details.action_buttons.void_invoice'),
            icon: 'pi pi-times',
            command: () => {
                showVoidInvoiceDialog.value = true;
            }
        },
        {
            separator: true
        },
        {
            label: t('buttons.export_as_pdf'),
            icon: 'pi pi-file-pdf',
            command: () => {}
        },
        {
            label: t('buttons.print'),
            icon: 'pi pi-print',
            command: () => {}
        }
    ];
});

const toggle = (event) => {
    actionMenu.value.toggle(event);
};

const goBack = () => {
    router.push({ name: 'Invoices' });
};

const getInvoiceDetails = async () => {
    try {
        loading.value = true;
        const res = await invoicesStore.getInvoiceDetails(invoiceId);
        invoiceDetails.value = res.data;
        emit(
            'updateDetailsBreadcrumb',
            invoiceDetails.value?.invoice?.invoice_number
        );
    } catch (error) {
    } finally {
        loading.value = false;
    }
};

const getInvoiceItems = async () => {
    try {
        loading.value = true;
        const params = {};
        const res = await invoicesStore.getInvoiceItems(invoiceId, params);
        invoiceItems.value = res.data;
    } catch (error) {
    } finally {
        loading.value = false;
    }
};

onBeforeMount(() => {
    getInvoiceDetails();
    getInvoiceItems();
});
</script>

<template>
    <Loader v-if="loading" />
    <div class="relative container" v-else>
        <Header @goBack="goBack">
            <template #title>
                <div>
                    <div class="flex flex-row gap-2">
                        <div class="p-break-word text-black">
                            {{
                                $t('invoice.invoice_details.title', {
                                    invoice_number:
                                        invoiceDetails.invoice?.invoice_number
                                })
                            }}
                        </div>

                        <div class="flex">
                            <InvoiceStatusTag
                                class="align-self-center"
                                :status="invoiceDetails.invoice?.invoice_status"
                            ></InvoiceStatusTag>
                        </div>
                    </div>
                    <p class="text-base font-light flex items-center mb-0">
                        <span class="pr-1">{{
                            $t('invoice.invoice_details.amount_due', {
                                amount: `${helpers.moneyFormat(invoiceDetails.invoice?.amount_due)}
                            ${invoiceDetails.invoice?.currency}`
                            })
                        }}</span>
                        <span class="px-2">•</span>

                        <span>{{
                            $t('invoice.invoice_details.due_at', {
                                date: helpers.formatDate(
                                    invoiceDetails.invoice?.due_date
                                )
                            })
                        }}</span>
                    </p>
                </div>
            </template>

            <template #actions>
                <Button
                    variant="outlined"
                    class="!w-auto mr-2"
                    :label="$t('invoice.invoice_details.view_history')"
                />

                <Button
                    type="button"
                    iconPos="right"
                    icon="pi pi-chevron-down"
                    :label="$t('invoice.invoice_details.actions')"
                    @click="toggle"
                    aria-haspopup="true"
                    aria-controls="overlay_menu"
                />
                <Menu
                    ref="actionMenu"
                    id="overlay_menu"
                    :model="actionMenuItems"
                    :popup="true"
                />
            </template>
        </Header>
        <VoidInvoiceDialog v-model="showVoidInvoiceDialog"></VoidInvoiceDialog>
        <InvoiceDetails
            v-if="invoiceDetails && invoiceItems"
            :invoice="invoiceDetails"
            :policies="invoiceItems"
            :invoiceId="invoiceId"
        >
        </InvoiceDetails>
    </div>
</template>

<style lang="scss"></style>
