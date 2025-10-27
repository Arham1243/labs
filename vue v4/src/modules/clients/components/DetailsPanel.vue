<script setup>
import { onBeforeMount, ref } from 'vue';
import lodash from 'lodash';
import { useHelpers } from '@/composables';
import { enrollmentType, paymentTerms, invoiceFrequency } from '@/config';
import NotAvailableImage from '@/assets/images/image_not_available.png';
import Drawer from 'primevue/drawer';
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

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
                class="w-full rounded-xl"
                style="border-radius: 20px; width: 100% !important"
                data-testid="logo-img"
            />
        </div>
        <div class="grid grid-cols-12 mt-2">
            <div
                data-testid="org-id-label"
                class="col-span-12 text-base text-gray-600"
            >
                Org ID {{ item.id }}
            </div>
            <div
                class="col-span-12 text-base font-semibold mb-4"
                v-tooltip.top="helpers.getLocaleValue(item.short_name)"
            >
                {{
                    lodash.truncate(helpers.getLocaleValue(item.short_name), {
                        length: 30
                    })
                }}
            </div>
            <div
                class="col-span-12 text-base font-semibold mb-4"
                data-testid="phone-label"
            >
                Phone
            </div>
            <div class="col-span-12 text-base text-gray-600">
                {{ item.phone_number }}
            </div>
            <div
                class="col-span-12 text-base font-semibold mb-4"
                data-testid="website-label"
            >
                Website
            </div>
            <div class="col-span-12 text-base text-gray-600">
                {{ item.website_url }}
            </div>
            <div
                data-testid="enrollment-type-label"
                class="col-span-12 text-base font-semibold mb-4"
            >
                Enrollment Type
            </div>
            <div class="col-span-12 text-base text-gray-600">
                {{
                    helpers.getDisplayValue(
                        item.enrollment_type,
                        enrollmentType
                    )
                }}
            </div>
            <div
                data-testid="access-for-billing-label"
                class="col-span-12 text-base font-semibold mb-4"
            >
                Access for Billing
            </div>
            <div class="col-span-12 text-base text-gray-600">
                {{ item.billing_detail ? 'Yes' : 'No' }}
            </div>
            <div
                data-testid="first-poc-label"
                class="col-span-12 text-base font-semibold mb-4"
            >
                First PoC
            </div>
            <div class="col-span-12 text-base text-gray-600">
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
                class="col-span-12 text-base font-semibold mb-4"
            >
                Account Manager
            </div>
            <div
                v-if="variant === 'businessUnit'"
                class="col-span-12 text-base text-gray-600"
            >
                {{ item.account_manager_user?.name }}
            </div>
        </div>
        <div class="edit-cancel-button my-3">
            <Button
                label="More Details"
                class="w-full p-button-outlined mt-2"
                @click="showDetails"
                data-testid="more-details-button"
            />
        </div>
    </div>
    <Drawer
        v-model:visible="detailPanel"
        position="right"
        class="!w-full md:!w-80 lg:!w-[30rem]"
    >
        <template #header>
            <div class="flex justify-center items-center"></div>
        </template>
        <h4>{{ helpers.getLocaleValue(item.name) }}</h4>
        <Tabs :value="0">
            <TabList>
                <Tab :value="0">Client Details</Tab>
                <Tab v-if="item.billing_detail" :value="1">Billing</Tab>
                <Tab :value="item.billing_detail ? 2 : 1">Contacts</Tab>
                <Tab :value="item.billing_detail ? 3 : 2">Profile</Tab>
            </TabList>
            <TabPanels>
                <TabPanel :value="0">
                    <div class="grid grid-cols-12 mt-2">
                        <div class="col-span-12 text-base font-semibold">
                            Org ID
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.id }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Short Name
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ helpers.getLocaleValue(item.short_name) }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Enrollment Type
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{
                                helpers.getDisplayValue(
                                    item.enrollment_type,
                                    enrollmentType
                                )
                            }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Access for Billing
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.billing_detail ? 'Yes' : 'No' }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Address
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
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
                        <div class="col-span-12 text-base font-semibold">Phone</div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.phone_number }}
                        </div>
                        <!-- <div class="col-span-12 text-base font-semibold">
                            Account Manager
                        </div>
                        <div class="col-span-12 text-base text-gray-600 py-0">
                            {{ item.account_manager_user?.name }}
                        </div> -->
                        <div class="col-span-12 text-base font-semibold">
                            Website
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.website_url }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Owner Info
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">-</div>
                    </div>
                </TabPanel>
                <TabPanel v-if="item.billing_detail" :value="1">
                    <div class="grid grid-cols-12 mt-2">
                        <div class="col-span-12 text-base font-semibold">
                            Invoice Frequency
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{
                                helpers.getDisplayValue(
                                    item.billing_detail?.invoice_frequency,
                                    invoiceFrequency
                                )
                            }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Payment Terms
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{
                                helpers.getDisplayValue(
                                    item.billing_detail.payment_terms,
                                    paymentTerms
                                )
                            }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Preferred Invoice Name
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.billing_detail.preferred_invoice_name }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Quickbooks ID
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            {{ item.billing_detail.quickbooks_id }}
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Address
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
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
                <TabPanel :value="item.billing_detail ? 2 : 1">
                    <div class="grid grid-cols-12 mt-2">
                        <div class="col-span-12 text-base font-semibold">
                            First Point of Contact
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            <!-- <div>{{ getFirstPoC().name }}</div>
                            <div>{{ getFirstPoC().email }}</div>
                            <div>{{ getFirstPoC().phone }}</div> -->
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Main Contact
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            <!-- <div>{{ getMainContact().name }}</div>
                            <div>{{ getMainContact().email }}</div> -->
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Finance Contact
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-2">
                            <!-- <div>{{ getFinanceContact().name }}</div>
                            <div>{{ getFinanceContact().email }}</div> -->
                        </div>
                    </div>
                </TabPanel>
                <TabPanel :value="item.billing_detail ? 3 : 2">
                    <div class="edit-cancel-button mb-4">
                        <Button
                            label="Download Fact Find"
                            class="p-button-outlined mt-2"
                            icon="pi pi-download"
                        />
                    </div>
                    <div class="grid grid-cols-12 mt-1">
                        <div class="col-span-12 text-base font-semibold">
                            What services do you offer to your clients?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">
                            Educational Course Provider
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            How many students do you send abroad / receive each
                            year?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                        <div class="col-span-12 text-base font-semibold">
                            How many student weeks is the average trip duration?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                        <div class="col-span-12 text-base font-semibold">
                            Where do you send your students?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                        <div class="col-span-12 text-base font-semibold">
                            What are the most common Home Country's of your
                            Students?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                        <div class="col-span-12 text-base font-semibold">
                            Do your students attend: Language School, University /
                            College, High-School, Cultural Trips, Internships,
                            Erasmus / Turing, Other
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                        <div class="col-span-12 text-base font-semibold">
                            What is your refund / cancellation policy? (Please
                            attach a copy)
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">
                            <div>-</div>
                            <div class="edit-cancel-button my-3">
                                <Button
                                    label="Policy"
                                    class="p-button-outlined mt-2"
                                    icon="pi pi-file"
                                />
                            </div>
                        </div>
                        <div class="col-span-12 text-base font-semibold">
                            Would you be interested in a policy that provides cover
                            to your staff on their business travel trips?
                        </div>
                        <div class="col-span-12 text-base text-gray-600 mb-3">-</div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </Drawer>
</template>
