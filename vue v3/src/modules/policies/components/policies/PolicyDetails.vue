<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useCommonStore } from '@/stores';
import { useUserStore } from '@/modules/administration/stores';
import { useToast } from 'primevue/usetoast';

import AuditTable from '@/components/common/AuditTable.vue';

const policiesStore = usePoliciesStore();
const commonStore = useCommonStore();
const { t } = useI18n();
const helpers = useHelpers();
const userStore = useUserStore();
const toast = useToast();

const props = defineProps({
    data: {
        type: Object,
        default: null
    }
});

const documents = [
    { id: 1, name: 'Policy Certificate' },
    { id: 2, name: 'Policy Summary' },
    { id: 3, name: 'Policy Wording' },
    { id: 4, name: 'Healthcare Access Card' },
    { id: 5, name: 'Visa Letter' }
];

const loading = ref(true);
const country = ref(null);
const documentActionMenu = ref();
const isShowingEmailDialog = ref(false);
const selectedDocumentsToSend = ref([]);
const users = ref([]);
const filteredUsers = ref([]);
const selectedUsers = ref([]);
const isDocViewerVisible = ref(false);
const docPreviewUrl = ref();

const item = computed(() => {
    return props.data || {};
});

const documentActionMenuItems = (document) => {
    return [
        {
            label: t('buttons.download'),
            icon: 'pi pi-cloud-download',
            command: () => {
                policiesStore
                    .generatePolicyDocument(
                        item.value.client_id,
                        item.value.id,
                        document.id
                    )
                    .then((data) => {
                        const pdfUrl = URL.createObjectURL(data);
                        createDownloadLink(
                            pdfUrl,
                            `${item.value.first_name} ${item.value.last_name}_${document.name}.pdf`
                        );

                        toast.add({
                            severity: 'success',
                            summary: t(
                                'policies.details.download_success_title'
                            ),
                            detail: t(
                                'policies.details.download_success_message'
                            ),
                            life: 5000
                        });
                    })
                    .catch((e) => {
                        toast.add({
                            severity: 'error',
                            summary: t('policies.details.download_error_title'),
                            detail: t(
                                'policies.details.download_error_message'
                            ),
                            life: 5000
                        });
                    });
            }
        },
        {
            label: t('policies.details.send_by_email'),
            icon: 'pi pi-send',
            command: () => {
                showEmailDialog([document]);
            }
        }
    ];
};

const showDocumentActionMenu = (event, index) => {
    documentActionMenu.value[index]?.toggle(event);
};

const destinationCountryName = computed(() => {
    return country.value?.name || '-';
});

const region = computed(() => {
    return country.value?.region?.name || '-';
});

const getCountry = async () => {
    try {
        const res = await commonStore.showCountry(
            item?.value?.destination_country_id,
            'region'
        );
        country.value = res.data;
    } catch (error) {
    } finally {
    }
};

const getUsers = async () => {
    try {
        loading.value = true;
        const payload = {
            includes: [{ relation: 'province' }, { relation: 'country' }],
            scopes: []
        };
        const res = await userStore.search(payload, { limit: 100 });
        users.value = res.data;
    } finally {
        loading.value = false;
    }
};

const showEmailDialog = (documents) => {
    isShowingEmailDialog.value = true;
    selectedUsers.value = [];
    selectedDocumentsToSend.value = documents;
};

const hideEmailDialog = () => {
    isShowingEmailDialog.value = false;
    selectedUsers.value = [];
    selectedDocumentsToSend.value = [];
};

const sendDocumentsEmail = () => {
    if (!selectedUsers.value?.length || !selectedDocumentsToSend.value?.length)
        return;

    policiesStore
        .sendDocumentEmail(item.value.client_id, item.value.id, {
            recipients: selectedUsers.value.map((user) => user.email),
            documentIds: selectedDocumentsToSend.value.map((doc) =>
                doc.id.toString()
            )
        })
        .then(() => {
            toast.add({
                severity: 'success',
                summary: t('policies.details.mail_success_title'),
                detail: t('policies.details.mail_success_message'),
                life: 5000
            });
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: t('policies.details.mail_error_title'),
                detail: t('policies.details.mail_error_message'),
                life: 5000
            });
        })
        .finally(hideEmailDialog);
};

const searchUsers = (event) => {
    setTimeout(() => {
        const query = event.query?.trim()?.toLowerCase();
        if (!query.length) {
            filteredUsers.value = [...users];
        } else {
            filteredUsers.value = users.value.filter((user) => {
                return user.email.toLowerCase().includes(query);
            });
        }
    }, 250);
};

const downloadZipPackage = () => {
    policiesStore
        .generatePolicyZipPackage(item.value.client_id, item.value.id, {
            documentIds: documents.map((doc) => doc.id.toString())
        })
        .then((data) => {
            const blob = new Blob([data], { type: 'application/zip' });
            const pdfUrl = URL.createObjectURL(blob);
            createDownloadLink(
                pdfUrl,
                `${item.value.first_name} ${
                    item.value.last_name
                }_${helpers.parseDate(Date.now())}.zip`
            );

            toast.add({
                severity: 'success',
                summary: t('policies.details.download_success_title'),
                detail: t('policies.details.download_success_message'),
                life: 5000
            });
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: t('policies.details.download_error_title'),
                detail: t('policies.details.download_error_message'),
                life: 5000
            });
        });
};

const previewDocument = (document) => {
    policiesStore
        .generatePolicyDocument(
            item.value.client_id,
            item.value.id,
            document.id
        )
        .then((data) => {
            docPreviewUrl.value = URL.createObjectURL(data);
            isDocViewerVisible.value = true;
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: t('policies.details.download_error_title'),
                detail: t('policies.details.download_error_message'),
                life: 5000
            });
        });
};

const createDownloadLink = (url, fileName) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

onBeforeMount(async () => {
    loading.value = true;

    await getCountry();
    await getUsers();

    loading.value = false;
});
</script>

<template>
    <TabView lazy>
        <TabPanel :header="t('policies.details.title')">
            <Loader v-if="loading" />
            <div class="grid mt-3" v-else>
                <div class="col-6">
                    <Card class="mb-3">
                        <template #content>
                            <div>
                                <div
                                    class="flex justify-content-between align-items-center"
                                >
                                    <h5 class="mb-2">
                                        {{
                                            $t(
                                                'policies.order.enrollment_sidebar.policy_details'
                                            )
                                        }}
                                    </h5>
                                </div>
                                <div class="grid mt-1">
                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.applicant.country_of_destination'
                                            )
                                        }}
                                    </div>
                                    <div
                                        class="col-8 text-sm py-1 p-break-word"
                                    >
                                        {{ destinationCountryName }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('common.region') }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ region }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t('policies.policies_table.order')
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ item.order_number }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.issued_date') }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{
                                            helpers.formatDate(item.created_at)
                                        }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.policies_table.booking_date'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{
                                            helpers.formatDate(
                                                item.booking_date
                                            )
                                        }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.applicant.trip_start_date'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{
                                            helpers.formatDate(item.start_date)
                                        }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.applicant.trip_end_date'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ helpers.formatDate(item.end_date) }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t('policies.applicant.group_name')
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ item.group_name ?? '-' }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.policies_table.student'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ item.student_number ?? '-' }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.applicant.destination_address'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ item.address ?? '-' }}
                                    </div>

                                    <div
                                        class="col-4 text-sm py-1 font-semibold"
                                    >
                                        {{
                                            $t(
                                                'policies.details.assigned_group_leader'
                                            )
                                        }}
                                    </div>
                                    <div class="col-8 text-sm py-1">
                                        {{ '-' }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                    <Card v-if="false">
                        <template #content>
                            <div>
                                <div
                                    class="flex justify-content-between align-items-center"
                                >
                                    <h5 class="mb-2">
                                        {{ $t('policies.details.prices') }}
                                    </h5>
                                </div>
                                <div class="grid mt-1">
                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.policy_term') }}
                                    </div>
                                    <div
                                        class="col-9 text-sm py-1 p-break-word"
                                    >
                                        {{ '58 (D)' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.term_cost') }}
                                    </div>
                                    <div class="col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.net_premium') }}
                                    </div>
                                    <div class="col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.admin_fee') }}
                                    </div>
                                    <div class="sm:col-6 md:col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.dept_fee') }}
                                    </div>
                                    <div class="col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.insurer_fee') }}
                                    </div>
                                    <div class="col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div
                                        class="col-3 text-sm py-1 font-semibold"
                                    >
                                        {{ $t('policies.details.riders') }}
                                    </div>
                                    <div class="col-9 text-sm py-1">
                                        {{ '$120.00' }}
                                    </div>

                                    <div class="col-3 text-sm font-bold py-1">
                                        {{ $t('policies.details.grand_total') }}
                                    </div>
                                    <div class="col-9 text-sm font-bold py-1">
                                        {{ '$120.00' }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
                <div class="col-6">
                    <Card class="mb-3">
                        <template #content>
                            <div>
                                <div
                                    class="flex justify-content-between align-items-center"
                                >
                                    <h5 class="mb-2">
                                        {{ $t('policies.details.documents') }}
                                    </h5>
                                    <div>
                                        <Button
                                            size="small"
                                            text
                                            class="px-2 py-1"
                                            label="Send All"
                                            icon="pi pi-send"
                                            data-testid="send-all-document-button"
                                            @click="showEmailDialog(documents)"
                                        />

                                        <Button
                                            size="small"
                                            text
                                            class="px-2 py-1"
                                            label="Download All"
                                            icon="pi pi-download"
                                            data-testid="download-all-document-button"
                                            @click="downloadZipPackage"
                                        />
                                    </div>
                                </div>
                                <div class="mt-1">
                                    <div
                                        v-for="(document, index) in documents"
                                        :key="index"
                                        class="flex justify-content-between align-items-center py-1 mb-2"
                                    >
                                        <div class="">
                                            <i
                                                class="pi pi-file text-xl p-tag p-tag-success p-1"
                                            />
                                            <span
                                                class="text-sm ml-3 font-bold text-primary p-link"
                                                @click="
                                                    previewDocument(document)
                                                "
                                            >
                                                {{ document.name }}
                                            </span>
                                        </div>
                                        <div class="">
                                            <Button
                                                :label="
                                                    $t(
                                                        'policies.policies_table.actions_button_label'
                                                    )
                                                "
                                                text
                                                icon="pi pi-chevron-down"
                                                iconPos="right"
                                                size="small"
                                                @click="
                                                    showDocumentActionMenu(
                                                        $event,
                                                        index
                                                    )
                                                "
                                                :data-testid="
                                                    'document-actions-button-' +
                                                    index
                                                "
                                            />
                                            <Menu
                                                ref="documentActionMenu"
                                                :model="
                                                    documentActionMenuItems(
                                                        document
                                                    )
                                                "
                                                :popup="true"
                                                :data-testid="
                                                    'document-actions-menu-' +
                                                    index
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </TabPanel>
        <TabPanel :header="t('policies.details.audit_log')" lazy>
            <Card class="mt-5">
                <template #content>
                    <AuditTable
                        entity="policy"
                        :entity_id="item.id"
                        :client_id="item.client_id"
                    />
                </template>
            </Card>
        </TabPanel>
    </TabView>

    <Dialog
        modal
        v-model:visible="isShowingEmailDialog"
        class="w-4"
        :header="t('policies.details.send_email_dialog_title')"
    >
        <span class="p-text-primary block mb-5">
            {{
                $t('policies.details.send_email_dialog_description', {
                    docTypes: selectedDocumentsToSend
                        .map((doc) => doc.name)
                        .join(', ')
                })
            }}.
        </span>
        <div class="mb-3">
            <AutoComplete
                multiple
                class="block"
                min-length="3"
                option-label="email"
                v-model="selectedUsers"
                :suggestions="filteredUsers"
                @complete="searchUsers"
            />
        </div>
        <div class="flex justify-content-end gap-2">
            <Button
                type="button"
                text
                :label="$t('buttons.cancel')"
                @click="hideEmailDialog()"
            ></Button>
            <Button
                type="button"
                icon="pi pi-send"
                :disabled="!selectedUsers.length"
                :label="$t('policies.details.send')"
                @click="sendDocumentsEmail"
            ></Button>
        </div>
    </Dialog>

    <Dialog
        modal
        v-model:visible="isDocViewerVisible"
        class="w-10"
        :header="t('policies.details.doc_viewer_title')"
    >
        <span class="p-text-primary block mb-5">
            <iframe
                v-if="docPreviewUrl"
                :src="docPreviewUrl"
                class="w-12 h-screen"
            ></iframe>
        </span>
        <div class="flex justify-content-end gap-2">
            <Button
                type="button"
                :label="$t('buttons.cancel')"
                severity="secondary"
                @click="isDocViewerVisible = false"
            >
            </Button>
        </div>
    </Dialog>
</template>
