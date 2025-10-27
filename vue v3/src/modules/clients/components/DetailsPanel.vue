<script setup>
import { onBeforeMount, ref } from 'vue';
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { enrollmentType, paymentTerms, invoiceFrequency } from '@/config';
import NotAvailableImage from '@/assets/images/image_not_available.png';

const props = defineProps({
    variant: {
        type: String,
        default: 'client'
    },
    data: {
        type: Object,
        required: true
    }
});

const helpers = useHelpers();
const item = ref({});
const detailPanel = ref(false);

onBeforeMount(() => {
    setItem();
});

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const showDetails = () => {
    detailPanel.value = true;
};
</script>
<template>
    <div>
        <div class="text-center">
            <img
                :src="item.logo ?? NotAvailableImage"
                class="w-full border-round-xl"
                style="border-radius: 20px; width: 100% !important"
                data-testid="logo-img"
            />
        </div>
        <div class="grid mt-2">
            <div
                data-testid="org-id-label"
                class="col-12 text-base text-gray-600 pb-0"
            >
                Org ID {{ item.id }}
            </div>
            <div
                class="col-12 text-base font-semibold py-1"
                v-tooltip.top="helpers.getLocaleValue(item.short_name)"
            >
                {{
                    lodash.truncate(helpers.getLocaleValue(item.short_name), {
                        length: 30
                    })
                }}
            </div>
            <div
                class="col-12 text-base font-semibold pb-0"
                data-testid="phone-label"
            >
                Phone
            </div>
            <div class="col-12 text-base text-gray-600 py-1">
                {{ item.phone_number }}
            </div>
            <div
                class="col-12 text-base font-semibold pb-0"
                data-testid="website-label"
            >
                Website
            </div>
            <div class="col-12 text-base text-gray-600 py-1">
                {{ item.website_url }}
            </div>
            <div
                data-testid="enrollment-type-label"
                class="col-12 text-base font-semibold pb-0"
            >
                Enrollment Type
            </div>
            <div class="col-12 text-base text-gray-600 py-1">
                {{
                    helpers.getDisplayValue(
                        item.enrollment_type,
                        enrollmentType
                    )
                }}
            </div>
            <div
                data-testid="access-for-billing-label"
                class="col-12 text-base font-semibold pb-0"
            >
                Access for Billing
            </div>
            <div class="col-12 text-base text-gray-600 py-1">
                {{ item.billing_detail ? 'Yes' : 'No' }}
            </div>
            <div
                data-testid="first-poc-label"
                class="col-12 text-base font-semibold pb-0"
            >
                First PoC
            </div>
            <div class="col-12 text-base text-gray-600 py-1">
                <!-- <div>
                    {{
                        `${getFirstPoC().first_name} ${getFirstPoC().last_name}`
                    }}
                </div>
                <div>{{ getFirstPoC().email }}</div>
                <div>{{ getFirstPoC().phone }}</div> -->
            </div>
            <div
                v-if="variant === 'businessUnit'"
                class="col-12 text-base font-semibold pb-0"
            >
                Account Manager
            </div>
            <div
                v-if="variant === 'businessUnit'"
                class="col-12 text-base text-gray-600 py-1"
            >
                {{ item.account_manager_user?.name }}
            </div>
        </div>
        <Button
            label="More Details"
            class="w-full p-button-outlined mt-2"
            @click="showDetails"
            data-testid="more-details-button"
        />
    </div>
    <Sidebar
        v-model:visible="detailPanel"
        position="right"
        class="w-full md:w-20rem lg:w-30rem"
    >
        <h4>{{ helpers.getLocaleValue(item.name) }}</h4>
        <TabView>
            <TabPanel header="Client Details">
                <div class="grid mt-2">
                    <div class="col-12 text-base font-semibold pb-0">
                        Org ID
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.id }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Short Name
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ helpers.getLocaleValue(item.short_name) }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Enrollment Type
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{
                            helpers.getDisplayValue(
                                item.enrollment_type,
                                enrollmentType
                            )
                        }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Access for Billing
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.billing_detail ? 'Yes' : 'No' }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Address
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <div v-if="variant === 'businessUnit'">
                            <div>{{ item.location_details.address ?? '' }}</div>
                            <div>
                                {{ item.location_details.address2 ?? '' }}
                            </div>
                            <div>
                                {{
                                    `${item.location_details.city ?? ''} ${
                                        item.location_details.country?.name ??
                                        ''
                                    }`
                                }}
                            </div>
                            <div>
                                {{ item.location_details.postal_code ?? '' }}
                            </div>
                        </div>
                        <div v-else>
                            <div>{{ item.address ?? '' }}</div>
                            <div>{{ item.address2 ?? '' }}</div>
                            <div>
                                {{
                                    `${item.city ?? ''} ${
                                        item.country?.name ?? ''
                                    }`
                                }}
                            </div>
                            <div>{{ item.postal_code ?? '' }}</div>
                        </div>
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">Phone</div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.phone_number }}
                    </div>
                    <!-- <div class="col-12 text-base font-semibold pb-0">
                        Account Manager
                    </div>
                    <div class="col-12 text-base text-gray-600 py-0">
                        {{ item.account_manager_user?.name }}
                    </div> -->
                    <div class="col-12 text-base font-semibold pb-0">
                        Website
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.website_url }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Owner Info
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                </div>
            </TabPanel>
            <TabPanel header="Billing" v-if="item.billing_detail">
                <div class="grid mt-2">
                    <div class="col-12 text-base font-semibold pb-0">
                        Invoice Frequency
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{
                            helpers.getDisplayValue(
                                item.billing_detail?.invoice_frequency,
                                invoiceFrequency
                            )
                        }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Payment Terms
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{
                            helpers.getDisplayValue(
                                item.billing_detail.payment_terms,
                                paymentTerms
                            )
                        }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Preferred Invoice Name
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.billing_detail.preferred_invoice_name }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Quickbooks ID
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        {{ item.billing_detail.quickbooks_id }}
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Address
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <div>{{ item.billing_detail.address ?? '' }}</div>
                        <div>{{ item.billing_detail.address2 ?? '' }}</div>
                        <div>
                            {{
                                `${item.billing_detail.city ?? ''} ${
                                    item.billing_detail.country?.name ?? ''
                                }`
                            }}
                        </div>
                        <div>{{ item.billing_detail.postal_code ?? '' }}</div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Contacts">
                <div class="grid mt-2">
                    <div class="col-12 text-base font-semibold pb-0">
                        First Point of Contact
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <!-- <div>{{ getFirstPoC().name }}</div>
                        <div>{{ getFirstPoC().email }}</div>
                        <div>{{ getFirstPoC().phone }}</div> -->
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Main Contact
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <!-- <div>{{ getMainContact().name }}</div>
                        <div>{{ getMainContact().email }}</div> -->
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Finance Contact
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <!-- <div>{{ getFinanceContact().name }}</div>
                        <div>{{ getFinanceContact().email }}</div> -->
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Profile">
                <Button
                    label="Download Fact Find"
                    class="p-button-outlined mt-2"
                    icon="pi pi-download"
                />
                <div class="grid mt-1">
                    <div class="col-12 text-base font-semibold pb-0">
                        What services do you offer to your clients?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        Educational Course Provider
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        How many students do you send abroad / receive each
                        year?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                    <div class="col-12 text-base font-semibold pb-0">
                        How many student weeks is the average trip duration?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Where do you send your students?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                    <div class="col-12 text-base font-semibold pb-0">
                        What are the most common Home Country’s of your
                        Students?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Do your students attend: Language School, University /
                        College, High-School, Cultural Trips, Internships,
                        Erasmus / Turing, Other
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                    <div class="col-12 text-base font-semibold pb-0">
                        What is your refund / cancellation policy? (Please
                        attach a copy)
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">
                        <div>-</div>
                        <Button
                            label="Policy"
                            class="p-button-outlined mt-2"
                            icon="pi pi-file"
                        />
                    </div>
                    <div class="col-12 text-base font-semibold pb-0">
                        Would you be interested in a policy that provides cover
                        to your staff on their business travel trips?
                    </div>
                    <div class="col-12 text-base text-gray-600 py-1">-</div>
                </div>
            </TabPanel>
        </TabView>
    </Sidebar>
</template>
