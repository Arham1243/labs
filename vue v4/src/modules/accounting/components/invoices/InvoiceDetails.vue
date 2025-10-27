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
            <div class="p-0 m-0">
                <div class="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
                    <div class="lg:col-span-8 flex flex-col">
                        <div
                            class="flex flex-col sm:flex-row sm:items-start sm:gap-4"
                        >
                            <div class="flex flex-col">
                                <img
                                    src="@/assets/images/new_logo.png"
                                    class="h-20 w-auto sm:h-24 logo-margin"
                                    data-testid="comapny-logo"
                                />
                                <span
                                    class="text-gray-600 pt-3 text-base leading-tight"
                                >
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

                            <InvoiceStatusTagLarge
                                data-testid="status-badge"
                                v-if="invoiceDetails?.invoice?.invoice_status"
                                :status="invoiceDetails.invoice?.invoice_status"
                                class="mt-4 sm:mt-0"
                            />
                        </div>
                    </div>

                    <div
                        class="lg:col-span-4 flex flex-col w-full sm:w-auto"
                        data-testid="invoice-summary"
                    >
                        <h2
                            class="text-right text-2xl sm:text-3xl font-bold uppercase text-gray-900"
                            data-testid="invoice-title"
                        >
                            {{ $t('invoice.invoice_details.invoice') }}
                        </h2>

                        <table
                            class="w-full sm:w-auto mt-6 text-base border-separate border-spacing-y-1"
                            data-testid="invoice-info-table"
                        >
                            <tbody>
                                <tr data-testid="po-number-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-8"
                                        data-testid="po-number-label"
                                    >
                                        {{ $t('invoice.invoice_details.po_#') }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
                                        data-testid="po-number-value"
                                    >
                                        {{
                                            invoiceDetails?.purchase_order_number
                                        }}
                                    </td>
                                </tr>
                                <tr data-testid="invoice-number-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-8"
                                        data-testid="invoice-number-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.invoice_#'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
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
                                        class="font-semibold text-gray-900 pr-8"
                                        data-testid="invoice-date-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.invoice_date'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
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
                                        class="font-semibold text-gray-900 pr-8"
                                        data-testid="payment-terms-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_terms'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
                                        data-testid="payment-terms-value"
                                    >
                                        {{ getPaymentTerms }}
                                    </td>
                                </tr>
                                <tr data-testid="payment-due-date-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-8"
                                        data-testid="payment-due-date-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_due_date'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
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

                <hr class="my-10 border-gray-300" />

                <div class="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6">
                    <div class="lg:col-span-8 flex flex-col">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div
                                class="flex flex-col"
                                data-testid="invoice-to-section"
                            >
                                <h3
                                    class="text-base font-semibold text-gray-900"
                                    data-testid="invoice-to-label"
                                >
                                    {{
                                        $t('invoice.invoice_details.invoice_to')
                                    }}
                                </h3>
                                <div
                                    class="text-gray-700 pt-1 text-base leading-tight"
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
                                        v-if="
                                            invoiceDetails.billing_address
                                                ?.address
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.address
                                        }}<br
                                    /></span>
                                    <span
                                        v-if="
                                            invoiceDetails.billing_address
                                                ?.address2
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.address2
                                        }}<br
                                    /></span>
                                    <span
                                        v-if="
                                            invoiceDetails.billing_address?.city
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.city + ', '
                                        }}</span
                                    >
                                    <span
                                        v-if="
                                            invoiceDetails.billing_address
                                                ?.province?.code
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.province?.code + ' '
                                        }}</span
                                    >
                                    <span
                                        v-if="
                                            invoiceDetails.billing_address
                                                ?.postal_code
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.postal_code + ' '
                                        }}</span
                                    >
                                    <span
                                        v-if="
                                            invoiceDetails.billing_address
                                                ?.country?.name
                                        "
                                        >{{
                                            invoiceDetails.billing_address
                                                ?.country?.name
                                        }}</span
                                    >
                                </div>
                            </div>

                            <div
                                class="flex flex-col"
                                data-testid="attention-to-section"
                            >
                                <h3
                                    class="text-base font-semibold text-gray-900"
                                    data-testid="attention-to-label"
                                >
                                    {{
                                        $t(
                                            'invoice.invoice_details.attention_to'
                                        )
                                    }}
                                </h3>
                                <div
                                    class="text-gray-700 pt-1 text-base leading-tight"
                                    data-testid="attention-to-value"
                                >
                                    {{ displayedContact?.first_name }}
                                    {{ displayedContact?.last_name }}<br />
                                    {{ displayedContact?.phone_number }}<br />
                                    {{ displayedContact?.email }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-4 flex flex-col w-full sm:w-auto">
                        <table
                            class="table-fixed w-full text-base border-separate border-spacing-y-1"
                            data-testid="invoice-summary-table"
                        >
                            <tbody>
                                <tr data-testid="group-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-6"
                                        data-testid="group-label"
                                    >
                                        {{
                                            $t('invoice.invoice_details.group')
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
                                        data-testid="group-value"
                                    >
                                        {{ invoiceDetails?.group_name }}
                                    </td>
                                </tr>
                                <tr data-testid="total-policies-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-6"
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
                                        class="text-right text-gray-700"
                                        data-testid="total-policies-value"
                                    >
                                        {{ totalRecords }}
                                    </td>
                                </tr>
                                <tr data-testid="total-term-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-6"
                                        data-testid="total-term-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.total_term'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
                                        data-testid="total-term-value"
                                    >
                                        {{ invoiceDetails?.total_term }}
                                    </td>
                                </tr>
                                <tr data-testid="account-manager-row">
                                    <td
                                        class="font-semibold text-gray-900 pr-6"
                                        data-testid="account-manager-label"
                                    >
                                        >
                                        {{
                                            $t(
                                                'invoice.invoice_details.account_manager'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-right text-gray-700"
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
                    class="my-5"
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
                                class="text-gray-700 pt-1 text-sm leading-tight"
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
                    class="flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 mt-8"
                >
                    <div class="lg:col-span-8">
                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 gap-8"
                            data-testid="payment-summary-section"
                        >
                            <div
                                class="flex flex-col"
                                data-testid="cheque-payable-section"
                            >
                                <h3
                                    class="text-base font-semibold text-gray-900"
                                    data-testid="cheque-payable-label"
                                >
                                    {{
                                        $t(
                                            'invoice.invoice_details.cheque_payable'
                                        )
                                    }}
                                </h3>
                                <div
                                    class="text-gray-700 pt-1 text-base leading-tight"
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
                                </div>

                                <h3
                                    class="text-base font-semibold text-gray-900 mt-8"
                                    data-testid="reference-title"
                                >
                                    {{
                                        $t(
                                            'invoice.invoice_details.use_invoice_number_as_reference.title'
                                        )
                                    }}
                                </h3>
                                <div
                                    class="text-gray-700 pt-1 text-base leading-tight"
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
                                </div>
                            </div>

                            <div
                                class="flex flex-col"
                                data-testid="payment-accept-section"
                            >
                                <h3
                                    class="text-base font-semibold text-gray-900"
                                    data-testid="payment-accept-title"
                                >
                                    {{
                                        $t(
                                            'invoice.invoice_details.payment_accept.title'
                                        )
                                    }}
                                </h3>
                                <ul
                                    data-testid="payment-accept-details"
                                    class="text-gray-700 pt-1 text-base leading-tight space-y-1 list-disc list-inside"
                                >
                                    <li data-testid="payment-accept-line1">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_accept.line1'
                                            )
                                        }}
                                    </li>
                                    <li data-testid="payment-accept-line2">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_accept.line2'
                                            )
                                        }}
                                    </li>
                                    <li data-testid="payment-accept-line3">
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_accept.line3'
                                            )
                                        }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div
                        class="lg:col-span-4 mt-6 lg:mt-0"
                        data-testid="summary-table-section"
                    >
                        <table
                            class="summary-table w-full"
                            data-testid="summary-table"
                        >
                            <tbody>
                                <tr data-testid="insurance-total-row">
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="insurance-total-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.insurance_total'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="insurance-total-value"
                                    >
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
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="add-on-total-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.add_on_total'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="add-on-total-value"
                                    >
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
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="admin-fee-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.admin_fee'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="admin-fee-value"
                                    >
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
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="sales-tax-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.sales_tax'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="sales-tax-value"
                                    >
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
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="grand-total-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.grand_total'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="grand-total-value"
                                    >
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
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="payment-and-credits-label"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.payment_and_credits'
                                            )
                                        }}
                                    </td>
                                    <td
                                        class="text-gray-900 text-base"
                                        data-testid="payment-and-credits-value"
                                    >
                                        {{
                                            helpers.moneyFormat(
                                                invoiceDetails.charges
                                                    ?.payment_amount
                                            )
                                        }}
                                        {{ invoiceDetails.invoice?.currency }}
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
                                        data-testid="balance-due-label"
                                        class="font-bold text-gray-900 text-base"
                                    >
                                        {{
                                            $t(
                                                'invoice.invoice_details.payment_summary.balance_due'
                                            )
                                        }}
                                    </td>
                                    <td
                                        data-testid="balance-due-value"
                                        class="font-bold text-gray-900 text-base"
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

                <hr class="my-10 border-gray-300" />
                <div
                    class="text-center text-gray-600 text-base space-y-1"
                    data-testid="footer-section"
                >
                    <p class="mb-0" data-testid="footer-line1">
                        {{
                            $t('invoice.invoice_details.footer.line1', {
                                email: 'accounting@guard.me'
                            })
                        }}
                    </p>
                    <p data-testid="footer-line2">
                        {{ $t('invoice.invoice_details.footer.line2') }}
                    </p>
                    <p data-testid="footer-line3">
                        {{ $t('invoice.invoice_details.footer.line3') }}
                    </p>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss">
.summary-table {
    background-color: #f9fafb;
    border-collapse: collapse;
    font-size: 0.875rem;
}

.summary-table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 0.875rem;
    text-align: left;
}

.summary-table tr:last-child td {
    border-bottom: none;
}

.summary-table td:nth-child(2) {
    text-align: right;
}

.logo-margin {
    margin: -20px;
}
</style>
