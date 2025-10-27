<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
    useClientUserStore,
    useBusinessUnitUserStore
} from '@/modules/clients/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import InfoSection from '@/modules/clients/components/forms/InfoSection.vue';

const props = defineProps({
    requests: {
        type: Array,
        required: true
    },
    selectedUser: {
        type: Object,
        required: true
    },
    entity: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['reloadUsers']);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const globalStore = useGlobalStore();
const clientUserStore = useClientUserStore();
const businessUnitUserStore = useBusinessUnitUserStore();
const stores = {
    client: clientUserStore,
    business_unit: businessUnitUserStore
};
const userStore = computed(() => stores[props.entity] || null);
const isReasonDialogVisible = ref(false);
const reasonDialogMode = ref(null);
const isVisible = ref(false);
const busy = ref(false);
const approveBusy = ref(false);
const selectedRequestId = ref(props.selectedUser?.id);
const formData = ref({
    reason: ''
});

const entityUserLabels = {
    client: t('clients.client_user'),
    business_unit: t('clients.business_unit_user')
};
const entityDetailsHeadings = {
    client: t('clients.client_details'),
    business_unit: t('clients.business_unit_user_details')
};

const sidebarHeading = computed(() => {
    const keyMap = {
        'pending approval': 'clients.approval_for_adding_user',
        'pending deletion': 'clients.approval_for_deleting_user'
    };

    const key = keyMap[selectedRequest.value?.status];
    return key ? t(key, { user: entityUserLabels[props.entity] }) : '';
});

const groupedRequests = computed(() => {
    const grouped = {};

    requests.value.forEach((request) => {
        if (!grouped[request.id]) {
            grouped[request.id] = {};
        }

        request.fields.forEach((field) => {
            if (!grouped[request.id][field.group]) {
                grouped[request.id][field.group] = [];
            }
            grouped[request.id][field.group].push(field);
        });
    });

    return grouped;
});

const mapRequestData = (data) => {
    return data.map((item) => {
        const declineReasons = [...(item.requests || [])]
            .filter((r) => r.reason)
            .reverse();
        return {
            id: item.id,
            status: item.status,
            fields: [
                {
                    field_name: t('clients.client_name'),
                    field_value: item.client_name || '-',
                    group: entityDetailsHeadings[props.entity]
                },
                {
                    field_name: t('clients.first_name'),
                    field_value: item.first_name || '-',
                    group: entityDetailsHeadings[props.entity]
                },
                {
                    field_name: t('clients.last_name'),
                    field_value: item.last_name || '-',
                    group: entityDetailsHeadings[props.entity]
                },
                {
                    field_name: t('clients.email'),
                    field_value: item.email || '-',
                    group: entityDetailsHeadings[props.entity]
                },
                {
                    field_name: t('clients.mobile_number'),
                    field_value:
                        helpers.formatPhoneNumber(item.phone_number) || '-',
                    group: entityDetailsHeadings[props.entity]
                },
                {
                    field_name: t('clients.address'),
                    field_value: item.address || '-',
                    group: t('clients.address_details')
                },
                {
                    field_name: t('clients.address_2'),
                    field_value: item.secondary_address || '-',
                    group: t('clients.address_details')
                },
                {
                    field_name: t('clients.country'),
                    field_value: item.country?.name || '-',
                    group: t('clients.address_details')
                },
                {
                    field_name: t('clients.province'),
                    field_value: item.province?.name || '-',
                    group: t('clients.address_details')
                },
                {
                    field_name: t('clients.city'),
                    field_value: item.city || '-',
                    group: t('clients.address_details')
                },
                {
                    field_name: t('clients.postal_code'),
                    field_value: item.postal_code || '-',
                    group: t('clients.address_details')
                },
                ...(item.business_unit_names &&
                item.business_unit_names.length > 0
                    ? item.business_unit_names.map((name) => ({
                          field_name: '',
                          field_value: name || '-',
                          group: t('clients.business_units_access')
                      }))
                    : []),
                {
                    field_name: t('clients.role'),
                    field_value: item.roles?.[0]?.name || '-',
                    group: t('clients.user_role')
                },
                ...(declineReasons.length > 0
                    ? declineReasons.flatMap((reason) => [
                          {
                              field_name: '',
                              field_type: 'date',
                              field_value: helpers.formatDate(
                                  reason.created_at
                              ),
                              group: t('clients.decline_reason')
                          },
                          {
                              field_name: '',
                              field_value: reason.reason,
                              group: t('clients.decline_reason')
                          }
                      ])
                    : [])
            ]
        };
    });
};

const requests = ref(mapRequestData(props.requests));
const selectedRequesIndex = ref(
    requests.value.findIndex(
        (request) => request.id === selectedRequestId.value
    )
);

const selectedRequest = computed(() => {
    return requests.value[selectedRequesIndex.value] || {};
});

const prevRequest = () => {
    if (selectedRequesIndex.value > 0) {
        selectedRequesIndex.value -= 1;
    }
};

const nextRequest = () => {
    if (selectedRequesIndex.value < requests.value.length - 1) {
        selectedRequesIndex.value += 1;
    }
};

const openSidebar = () => {
    isVisible.value = true;
};

const closeSidebar = () => {
    isVisible.value = false;
};

const openReasonDialog = (mode) => {
    reasonDialogMode.value = mode;
    if (reasonDialogMode.value !== 'approve') {
        isReasonDialogVisible.value = true;
    } else {
        saveDecision();
    }
};

const closeReasonDialog = () => {
    isReasonDialogVisible.value = false;
    resetForm();
};

const onShow = () => {
    resetForm();
};

const resetForm = () => {
    formData.value.reason = '';
    globalStore.clearErrors();
};

const saveDecision = async () => {
    try {
        const actionMap = {
            'pending approval': `${reasonDialogMode.value}-creation`,
            'pending deletion': `${reasonDialogMode.value}-deletion`
        };
        const modifiedFormData = {
            ...formData.value,
            action: actionMap[props.selectedUser?.status]
        };

        if (reasonDialogMode.value === 'approve') {
            approveBusy.value = true;
        } else {
            busy.value = true;
        }
        await userStore.value.saveDecision(
            selectedRequest.value.id,
            modifiedFormData
        );
        closeSidebar();
        closeReasonDialog();
        emit('reloadUsers');
        const params = new URLSearchParams(route.query);
        if (params.has('user_id') || params.has('type')) {
            params.delete('user_id');
            params.delete('type');
            router.replace({ query: Object.fromEntries(params.entries()) });
        }
    } catch (error) {
        console.log(error);
    } finally {
        if (reasonDialogMode.value === 'approve') {
            approveBusy.value = false;
        } else {
            busy.value = false;
        }
    }
};

defineExpose({ openSidebar });
</script>

<template>
    <Drawer
        v-model:visible="isVisible"
        position="right"
        class="approval-sidebar w-full sm:w-[30rem]"
        data-testid="approval-sidebar"
    >
        <template #header>
            <div data-testid="approval-sidebar-title" class="title font-bold">
                {{ sidebarHeading || '' }}
            </div>
        </template>
        <div class="flex items-center justify-between my-12">
            <div class="flex align-items-ceneter gap-12">
                <span
                    class="text-lg font-bold"
                    data-testid="approval-sidebar-index"
                >
                    {{
                        `${t('clients.approvals')} ${
                            selectedRequesIndex + 1
                        } / ${requests.length}`
                    }}
                </span>
                <StatusTag
                    style="font-size: 0.7rem"
                    :status="selectedRequest.status?.replace('-', ' ')"
                    :data-testid="'status-tag'"
                />
            </div>
            <div class="flex items-center" style="gap: 0.75rem">
                <Button
                    @click="prevRequest"
                    :disabled="selectedRequesIndex === 0"
                    icon="pi text-sm pi-chevron-left"
                    severity="secondary"
                    outlined
                    class="arrow-btn"
                    data-testid="prev-request-button"
                />
                <Button
                    @click="nextRequest"
                    :disabled="selectedRequesIndex === requests.length - 1"
                    icon="pi text-sm pi-chevron-right"
                    severity="secondary"
                    outlined
                    class="arrow-btn"
                    data-testid="next-request-button"
                />
            </div>
        </div>
        <div v-if="selectedRequest.fields?.length">
            <div
                v-for="(info, groupName) in groupedRequests[selectedRequest.id]"
                :key="groupName"
                data-testid="approval-sidebar-group"
            >
                <InfoSection :info="info" :group="groupName" />
            </div>
        </div>
        <div
            data-testid="approval-sidebar-footer"
            class="flex justify-between gap-12 pt-12"
        >
            <Button
                @click="openReasonDialog('approve')"
                :loading="approveBusy"
                iconPos="center"
                icon="pi pi-check"
                label="Approve"
                class="flex gap-1 justify-center border-surface-0 dark:border-surface-900 w-full"
                style="background: #22c55e"
                data-testid="approve-button"
            />
            <Button
                @click="openReasonDialog('decline')"
                iconPos="center"
                icon="pi pi-times"
                label="Decline"
                class="flex gap-1 justify-center border-surface-0 dark:border-surface-900 w-full"
                style="background: #ef4444"
                data-testid="decline-button"
            />
        </div>
    </Drawer>

    <Dialog
        data-testid="reason-dialog"
        v-model:visible="isReasonDialogVisible"
        @update:visible="onShow"
        :header="reasonDialogMode"
        :style="{ width: '35vw' }"
        modal
        :closable="false"
    >
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div
                    class="p-dialog-title capitalize"
                    data-testid="reason-dialog-title"
                >
                    {{ reasonDialogMode }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-confirm-header-close border-surface-0 dark:border-surface-900 p-button-outlined p-2 rounded-full"
                    data-testid="reason-dialog-close-button"
                    @click="closeReasonDialog"
                    aria-label="Close"
                />
            </div>
        </template>

        <div class="p-fluid formgrid grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12">
            <div class="field col-span-12 mb-12">
                <label
                    data-testid="reason-label"
                    class="block capitalize mb-2"
                    for="reason"
                    >{{ `${reasonDialogMode} ${t('clients.reason')}` }}</label
                >
                <InputField
                    id="reason"
                    data-testid="reason-textarea"
                    class="h-32 mt-2"
                    variant="textarea"
                    v-model="formData.reason"
                />
            </div>
        </div>
        <template #footer>
            <Button
                data-testid="cancel-button"
                text
                :label="$t('buttons.cancel')"
                class="no-underline"
                @click="closeReasonDialog"
            />
            <Button
                data-testid="confirm-button"
                :label="$t('buttons.confirm')"
                @click="saveDecision"
                :loading="busy"
            />
        </template>
    </Dialog>
</template>
<style>
.p-sidebar.approval-sidebar {
    background: #eff5f9 !important;
}
.approval-sidebar .p-sidebar-header-content {
    width: 100%;
}
.approval-sidebar .title {
    font-size: 1.25rem;
}
.approval-sidebar .p-sidebar-close {
    width: 2.15rem !important;
    height: 2.15rem !important;
    border-radius: 100% !important;
}
.arrow-btn {
    padding: 0.65rem 1.35rem !important;
}

.arrow-btn .pi {
    font-size: 0.95rem !important;
}
</style>
