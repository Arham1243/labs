<script setup>
import { computed, ref, onMounted } from 'vue';
import { invoiceStatuses } from '@/config';
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';
import { PaginationOptions } from '@/config';
import InvoiceStatusTagLarge from '@/modules/accounting/components/invoices/InvoiceStatusTagLarge.vue';

import { useHelpers } from '@/composables';
const helpers = useHelpers();
const { t } = useI18n();
const invoicesStore = useInvoicesStore();
const pagination = new PaginationOptions();

const props = defineProps({
    invoice: { type: Object, required: true },
    invoiceId: { type: [String, Number], required: true }
});

const invoiceDetails = computed(() => props.invoice);
const invoiceItems = ref([]);
const totalRecords = ref();
const loading = ref(false);
const metaInfo = ref({
    onCurrentPage: 0,
    totalCount: 0
});

const displayedContact = computed(() => {
    if (invoiceDetails.value.billing_payment_contacts?.length > 0) {
        return invoiceDetails.value.billing_payment_contacts[0];
    }
    return invoiceDetails.value.primary_contact;
});

const getPaymentTerms = computed(() => {
    const payType = invoiceDetails?.value.billing_details?.payment_type;

    if (payType == 'cod') return t('invoice.invoice_details.prepaid');
    return invoiceDetails.billing_details?.payment_terms;
});

const getInvoiceItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const res = await invoicesStore.getInvoiceItems(
            props.invoiceId,
            params
        );
        updateTableData(res);
    } catch (error) {
    } finally {
        loading.value = false;
    }
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getInvoiceItems();
};

const updateTableData = (response) => {
    invoiceItems.value = response.data;
    totalRecords.value = response?.meta?.total || 0;
    metaInfo.value.totalCount = response?.meta?.total || 0;

    metaInfo.value.onCurrentPage = invoiceItems.value.length;
};

onMounted(() => {
    getInvoiceItems();
});
</script>

<template>
    <Card data-testid="invoice-details-card">
        <template #content>
            <div class="container p-0 m-0">
                <div class="flex flex-row justify-content-between">
                    <div class="flex flex-column">
                        <div class="flex flex-row">
                            <div class="flex flex-column">
                                <img
                                    src="@/assets/images/new_logo.png"
                                    class="app-logo-normal h-6rem w-16rem logo-margin"
                                />
                                <span class="color-grey pt-2">
                                    <span
                                        data-testid="label-office-address-1"
                                        >{{
                                            $t(
                                                'invoice.invoice_details.guardme_office_address.line1'
                                            )
                                        }}</span
                                    ><br />
                                    <span
                                        data-testid="label-office-address-2"
                                        >{{
                                            $t(
                                                'invoice.invoice_details.guardme_office_address.line2'
                                            )
                                        }}</span
                                    ><br />
                                    <span
                                        data-testid="label-office-address-3"
                                        >{{
                                            $t(
                                                'invoice.invoice_details.guardme_office_address.line3'
                                            )
                                        }}</span
                                    >
                                </span>
                            </div>
                            <div class="flex flex-column">
                                <InvoiceStatusTagLarge
                                    data-testid="status-badge"
                                    v-if="
                                        invoiceDetails?.invoice?.invoice_status
                                    "
                                    class="align-self-center"
                                    :status="
                                        invoiceDetails.invoice?.invoice_status
                                    "
                                >
                                </InvoiceStatusTagLarge>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-column" data-testid="invoice-summary">
                        <span
                            class="text-right text-3xl font-bold uppercase"
                            data-testid="invoice-title"
                            >{{ $t('invoice.invoice_details.invoice') }}</span
                        >
                        <table
                            class="table-fixed pt-4 text-md info-table"
                            data-testid="invoice-info-table"
                        >
                            <tbody>
                                <tr data-testid="po-number-row">
                                    <td
                                        class="font-bold p-right"
                                        data-testid="po-number-label"
                                    >
                                        {{ $t('invoice.invoice_details.po_#') }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="po-number-value"
                                    >
                                        {{
                                            invoiceDetails?.purchase_order_number
                                        }}
                                    </td>
                                </tr>
                                <tr data-testid="invoice-number-row">
                                    <td
                                        class="font-bold p-right"
                                        data-testid="invoice-number-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.invoice_#'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="invoice-number-value"
                                    >
                                        {{
                                            invoiceDetails.invoice
                                                ?.invoice_number
                                        }}
                                    </td>
                                </tr>
                                <tr data-testid="invoice-date-row">
                                    <td
                                        class="font-bold p-right"
                                        data-testid="invoice-date-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.invoice_date'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="invoice-date-value"
                                    >
                                        {{
                                            helpers.formatDate(
                                                invoiceDetails.invoice
                                                    ?.created_at
                                            )
                                        }}
                                    </td>
                                </tr>
                                <tr data-testid="payment-terms-row">
                                    <td
                                        class="font-bold p-right"
                                        data-testid="payment-terms-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_terms'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="payment-terms-value"
                                    >
                                        {{ getPaymentTerms }}
                                    </td>
                                </tr>
                                <tr data-testid="payment-due-date-row">
                                    <td
                                        class="font-bold p-right"
                                        data-testid="payment-due-date-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_due_date'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="payment-due-date-value"
                                    >
                                        {{
                                            helpers.formatDate(
                                                invoiceDetails.invoice?.due_date
                                            )
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr class="my-4 border-gray-300" />

                <div class="flex flex-row justify-content-between">
                    <div
                        class="flex flex-column"
                        data-testid="invoice-to-section"
                    >
                        <span
                            class="text-md font-bold"
                            data-testid="invoice-to-label"
                            >{{
                                $t('invoice.invoice_details.invoice_to')
                            }}</span
                        >
                        <span
                            class="color-grey pt-2 text-md"
                            data-testid="invoice-to-value"
                        >
                            {{
                                helpers.getLocaleValue(
                                    invoiceDetails.client?.name
                                )
                            }}<br />
                            {{
                                helpers.getLocaleValue(
                                    invoiceDetails.business_unit?.name
                                )
                            }}<br />
                            <span
                                v-if="invoiceDetails.billing_address?.address"
                            >
                                {{ invoiceDetails.billing_address?.address }}
                                <br />
                            </span>
                            <span
                                v-if="invoiceDetails.billing_address?.address2"
                            >
                                {{ invoiceDetails.billing_address?.address2 }}
                                <br />
                            </span>
                            <span v-if="invoiceDetails.billing_address?.city">
                                {{
                                    invoiceDetails.billing_address?.city + ', '
                                }}
                            </span>
                            <span
                                v-if="
                                    invoiceDetails.billing_address?.province
                                        ?.code
                                "
                            >
                                {{
                                    invoiceDetails.billing_address?.province
                                        ?.code + ' '
                                }}
                            </span>
                            <span
                                v-if="
                                    invoiceDetails.billing_address?.postal_code
                                "
                            >
                                {{
                                    invoiceDetails.billing_address
                                        ?.postal_code + ' '
                                }}
                            </span>
                            <span
                                v-if="
                                    invoiceDetails.billing_address?.country
                                        ?.name
                                "
                            >
                                {{
                                    invoiceDetails.billing_address?.country
                                        ?.name
                                }}
                            </span>
                        </span>
                    </div>
                    <div
                        class="flex flex-column"
                        data-testid="attention-to-section"
                    >
                        <span
                            class="text-md font-bold"
                            data-testid="attention-to-label"
                            >{{
                                $t('invoice.invoice_details.attention_to')
                            }}</span
                        >
                        <span
                            class="color-grey pt-2 text-md"
                            data-testid="attention-to-value"
                        >
                            {{ displayedContact?.first_name }}
                            {{ displayedContact?.last_name }}<br />
                            {{ displayedContact?.phone_number }}<br />
                            {{ displayedContact?.email }}
                        </span>
                    </div>
                    <div class="flex flex-column">
                        <table
                            class="table-fixed info-table text-md"
                            data-testid="invoice-summary-table"
                        >
                            <tbody>
                                <tr data-testid="group-row">
                                    <td
                                        class="font-bold p-right text-md"
                                        data-testid="group-label"
                                    >
                                        {{
                                            $t('invoice.invoice_details.group')
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="group-value"
                                    >
                                        {{ invoiceDetails?.group_name }}
                                    </td>
                                </tr>
                                <tr data-testid="total-policies-row">
                                    <td
                                        class="font-bold p-right text-md"
                                        data-testid="total-policies-label"
                                    >
                                        {{
                                            invoiceDetails.invoice
                                                ?.invoice_status ===
                                            invoiceStatuses.PAID.value
                                                ? $t(
                                                      'invoice.invoice_details.total_policies'
                                                  )
                                                : $t(
                                                      'invoice.invoice_details.total_enrollments'
                                                  )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="total-policies-value"
                                    >
                                        {{ totalRecords }}
                                    </td>
                                </tr>
                                <tr data-testid="total-term-row">
                                    <td
                                        class="font-bold p-right text-md"
                                        data-testid="total-term-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.total_term'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="total-term-value"
                                    >
                                        {{ invoiceDetails?.total_term }}
                                    </td>
                                </tr>
                                <tr data-testid="account-manager-row">
                                    <td
                                        class="font-bold p-right text-md"
                                        data-testid="account-manager-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.account_manager'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right"
                                        data-testid="account-manager-value"
                                    >
                                        {{
                                            invoiceDetails?.account_manager
                                                ?.name || '-'
                                        }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <BaseTable
                    :value="invoiceItems"
                    :page="pagination.page"
                    :rows="pagination.limit"
                    :loading="loading"
                    :total-records="totalRecords"
                    scrollable
                    class="pt-4"
                    @page="onPageChange"
                    data-testid="invoice-items-table"
                >
                    <template #loading>
                        <span data-testid="loading-data-table">
                            {{ $t('invoice.invoice_table.table_loading') }}
                        </span>
                    </template>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.description'
                            )
                        "
                        data-testid="description-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-bold text-md"
                                data-testid="description-name"
                            >
                                {{
                                    data.product?.last_name +
                                    ', ' +
                                    data.product?.first_name
                                }}
                            </span>
                            <br />
                            <span
                                class="font-thin text-sm color-grey"
                                data-testid="description-details"
                            >
                                <span v-if="data.product?.policy_number">
                                    {{ $t('invoice.invoice_details.policy_#') }}
                                    {{ data.product?.policy_number || '-' }}
                                </span>
                                <span
                                    v-if="
                                        data.product?.policy_number &&
                                        data.product?.student_number
                                    "
                                >
                                    •
                                </span>
                                <span v-if="data.product?.student_number">
                                    {{
                                        $t('invoice.invoice_details.student_#')
                                    }}
                                    {{ data.product?.student_number || '-' }}
                                </span>
                            </span>
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.status'
                            )
                        "
                        data-testid="status-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="status-value"
                                >{{ data.product?.status ?? '-' }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.start_date'
                            )
                        "
                        data-testid="start-date-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="start-date-value"
                                >{{
                                    helpers.formatDate(data.product?.start_date)
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.end_date'
                            )
                        "
                        data-testid="end-date-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="end-date-value"
                                >{{
                                    helpers.formatDate(data.product?.end_date)
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.er_date'
                            )
                        "
                        data-testid="er-date-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="er-date-value"
                                >{{
                                    helpers.formatDate(data.product?.er_date)
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.opt_out_date'
                            )
                        "
                        data-testid="opt-out-date-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="opt-out-date-value"
                                >{{
                                    helpers.formatDate(
                                        data.product?.optout_date
                                    )
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        field="term"
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.term'
                            )
                        "
                        data-testid="term-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="term-value"
                                >{{ data.product?.term }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        field="price"
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.price'
                            )
                        "
                        data-testid="price-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="price-value"
                                >{{
                                    helpers.moneyFormat(data.product?.price)
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.add_on'
                            )
                        "
                        data-testid="add-on-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="add-on-value"
                                >{{
                                    helpers.moneyFormat(data.product?.add_on)
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.membership'
                            )
                        "
                        data-testid="membership-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="membership-value"
                                >{{
                                    helpers.moneyFormat(
                                        data.product?.membership
                                    )
                                }}</span
                            >
                        </template>
                    </Column>
                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.tax'
                            )
                        "
                        data-testid="tax-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="tax-value"
                            >
                                {{ helpers.moneyFormat(data.product?.tax) }}
                            </span>
                        </template>
                    </Column>

                    <Column
                        :header="
                            $t(
                                'invoice.invoice_details.invoice_items_table.total'
                            )
                        "
                        data-testid="total-column"
                    >
                        <template #body="{ data }">
                            <span
                                class="font-medium text-md color-grey"
                                data-testid="total-value"
                                >{{
                                    helpers.moneyFormat(
                                        data.product?.sale_price
                                    )
                                }}</span
                            >
                        </template>
                    </Column>
                </BaseTable>

                <div
                    class="flex flex-row justify-content-between pt-4"
                    data-testid="payment-summary-section"
                >
                    <div
                        class="flex flex-column"
                        data-testid="cheque-payable-section"
                    >
                        <span
                            class="text-md font-bold color-grey"
                            data-testid="cheque-payable-label"
                            >{{
                                $t('invoice.invoice_details.cheque_payable')
                            }}</span
                        >
                        <span
                            class="color-grey pt-2 text-md"
                            data-testid="cheque-payable-address"
                        >
                            {{
                                $t(
                                    'invoice.invoice_details.cheque_payable_address.line1'
                                )
                            }}<br />
                            {{
                                $t(
                                    'invoice.invoice_details.cheque_payable_address.line2'
                                )
                            }}<br />
                            {{
                                $t(
                                    'invoice.invoice_details.cheque_payable_address.line3'
                                )
                            }}<br />
                            {{
                                $t(
                                    'invoice.invoice_details.cheque_payable_address.line4'
                                )
                            }}
                        </span>

                        <span
                            class="text-md font-bold color-grey pt-4"
                            data-testid="reference-title"
                            >{{
                                $t(
                                    'invoice.invoice_details.use_invoice_number_as_reference.title'
                                )
                            }}</span
                        >
                        <span
                            class="color-grey pt-2 text-md"
                            data-testid="reference-details"
                        >
                            {{
                                $t(
                                    'invoice.invoice_details.use_invoice_number_as_reference.line1'
                                )
                            }}
                            <br />
                            {{
                                $t(
                                    'invoice.invoice_details.use_invoice_number_as_reference.line2'
                                )
                            }}
                        </span>
                    </div>
                    <div
                        class="flex flex-column"
                        data-testid="payment-accept-section"
                    >
                        <span
                            class="text-md font-bold color-grey"
                            data-testid="payment-accept-title"
                            >{{
                                $t(
                                    'invoice.invoice_details.payment_accept.title'
                                )
                            }}</span
                        >
                        <div
                            class="color-grey pt-2 text-md"
                            data-testid="payment-accept-details"
                        >
                            <div
                                class="pb-1"
                                data-testid="payment-accept-line1"
                            >
                                •
                                {{
                                    $t(
                                        'invoice.invoice_details.payment_accept.line1'
                                    )
                                }}<br />
                            </div>
                            <div
                                class="pb-1"
                                data-testid="payment-accept-line2"
                            >
                                •
                                {{
                                    $t(
                                        'invoice.invoice_details.payment_accept.line2'
                                    )
                                }}<br />
                            </div>
                            <div
                                class="pb-1"
                                data-testid="payment-accept-line3"
                            >
                                •
                                {{
                                    $t(
                                        'invoice.invoice_details.payment_accept.line3'
                                    )
                                }}
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex flex-column"
                        data-testid="summary-table-section"
                    >
                        <table
                            class="summary-table"
                            data-testid="summary-table"
                        >
                            <tbody>
                                <tr data-testid="insurance-total-row">
                                    <td data-testid="insurance-total-label">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.insurance_total'
                                            )
                                        }}
                                    </td>
                                    <td data-testid="insurance-total-value">
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.insurance_total
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                                <tr data-testid="add-on-total-row">
                                    <td data-testid="add-on-total-label">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.add_on_total'
                                            )
                                        }}
                                    </td>
                                    <td data-testid="add-on-total-value">
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.add_on_total
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                                <tr data-testid="admin-fee-row">
                                    <td data-testid="admin-fee-label">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.admin_fee'
                                            )
                                        }}
                                    </td>
                                    <td data-testid="admin-fee-value">
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.admin_fee
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                                <tr data-testid="sales-tax-row">
                                    <td data-testid="sales-tax-label">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.sales_tax'
                                            )
                                        }}
                                    </td>
                                    <td data-testid="sales-tax-value">
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.sales_tax?.amount
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                                <tr data-testid="grand-total-row">
                                    <td data-testid="grand-total-label">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.grand_total'
                                            )
                                        }}
                                    </td>
                                    <td data-testid="grand-total-value">
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.grand_total
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                                <tr data-testid="payment-and-credits-row">
                                    <td>
                                        <span
                                            data-testid="payment-and-credits-label"
                                            >{{
                                                $t(
                                                    'invoice.invoice_details.payment_summary.payment_and_credits'
                                                )
                                            }}</span
                                        >
                                    </td>
                                    <td>
                                        <span
                                            data-testid="payment-and-credits-value"
                                        >
                                            {{
                                                helpers.moneyFormat(
                                                    invoiceDetails.charges
                                                        ?.payment_amount
                                                )
                                            }}
                                            {{
                                                invoiceDetails.invoice?.currency
                                            }}</span
                                        >
                                    </td>
                                </tr>
                                <tr
                                    data-testid="balance-due-row"
                                    v-if="
                                        invoiceDetails?.invoice
                                            ?.invoice_status !==
                                        invoiceStatuses.DRAFT.value
                                    "
                                >
                                    <td
                                        class="font-bold"
                                        data-testid="balance-due-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.balance_due'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="font-bold"
                                        data-testid="balance-due-value"
                                    >
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.balance_due
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <hr class="my-4 border-gray-300" />
                <div
                    class="flex flex-column justify-content-center footer-color text-center"
                    data-testid="footer-section"
                >
                    <span class="footer-color" data-testid="footer-line1">
                        {{
                            $t('invoice.invoice_details.footer.line1', {
                                email: 'accounting@guard.me'
                            })
                        }}
                    </span>

                    <span data-testid="footer-line2">
                        {{ $t('invoice.invoice_details.footer.line2') }}
                    </span>

                    <span data-testid="footer-line3">
                        {{ $t('invoice.invoice_details.footer.line3') }}
                    </span>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss">
.color-grey {
    color: #495057;
}

.info-table {
    width: 400px;
}

.payment-summary-table {
    background-color: #f8f9fa;
}

.payment-summary-table td {
    padding: 10px;
}

.info-table td {
    padding-bottom: 4px;
}

.p-right {
    padding-right: 8rem;
}

.column-title {
    color: black;
    font-size: 10px;
}

::v-deep(.p-datatable .p-datatable-thead > tr > th) {
    color: #000000;
    font-weight: bold;
}

.summary-table {
    width: 400px;
    background-color: #f8f9fa;
    border-collapse: collapse;
}

.summary-table td,
.summary-table th {
    border-bottom: 1px solid #dee2e6;
    padding: 15px;
    text-align: left;
}

.summary-table tr:last-child td {
    border-bottom: none;
}

.summary-table td:nth-child(2),
.summary-table th:nth-child(2) {
    text-align: right;
}

.footer-color {
    color: #6c757d;
}

.status-label {
    font-size: 30px;
    padding: 5px;
    font-weight: bolder;
    text-align: center;
    text-transform: uppercase;
    height: fit-content;
    border: 5px solid;
}

.draft-label {
    color: #8b8f94;
    border-color: #8b8f94;
}

.open-label {
    color: #4b6390;
    border-color: #4b6390;
}

.overdue-label {
    color: #b33a32;
    border-color: #b33a32;
}

.pending-label {
    color: #a08421;
    border-color: #a08421;
}

.partially_paid-label {
    color: #8b6e12;
    border-color: #8b6e12;
}

.paid-label {
    color: #16a34a;
    border-color: #16a34a;
}

.void-label {
    color: #d9342b;
    border-color: #d9342b;
}

.logo-margin {
    margin: -20px;
}
</style>
