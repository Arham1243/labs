<script setup>
import lodash from 'lodash';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useRoute, useRouter } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';

import BusinessUnitAssociatedPlan from '@/modules/clients/components/partials/BusinessUnitAssociatedPlan.vue';
import { useExpiration } from '@/composables/useExpiration.js';

const props = defineProps({
    plan: {
        type: Object,
        required: true
    }
});

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();
const emit = defineEmits(['reloadPlans']);
const { t } = useI18n();
const helpers = useHelpers();
const router = useRouter();
const route = useRoute();
const planStore = usePlanStore();
const isCollapse = ref(true);

const busy = ref(false);
const deleteDialog = ref(false);
const loading = ref(false);
const statusUpdateDialog = ref(false);
const menu = ref();

const buEndDate = computed(() => planStore.currentPlan?.end_date);
const { isAboutToExpire, expirationMessage } = useExpiration(buEndDate, 30);

const displayStatusTag = computed(() => {
    const currentDate = new Date();
    const effectiveDate = new Date(props.plan.effective_date);
    if (effectiveDate > currentDate) {
        return 'not-started';
    }
    if (props.plan.end_date) {
        const endDate = new Date(props.plan.end_date);
        if (endDate < currentDate) {
            return 'expired';
        }
    }
    return null;
});

const isItemActive = computed(() => {
    return props.plan.status == 'active';
});

const menuItems = computed(() => {
    return [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => goToView()
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', { item: t('plans.title_singular') })
        : t('common.make_item_active', { item: t('plans.title_singular') });
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(props.plan.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(props.plan.name)
          });
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const showMenu = (event) => {
    menu.value.toggle(event);
};

const goToView = () => {
    router.push({
        name: 'Plan Details',
        params: { id: props.plan.id }
    });
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await planStore.deletePlan(props.plan.id);
        emit('reloadPlans');
    } catch (error) {
        //
    } finally {
        loading.value = false;
    }
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...props.plan,
            status: props.plan.status == 'active' ? 'inactive' : 'active'
        };
        await planStore.updatePlanStatus(props.plan.id, payload);
        emit('reloadPlans');
    } catch (error) {
        //
    } finally {
        loading.value = false;
    }
};

const redirectToCreateAssociatedPlan = () => {
    router.push({
        name: 'New Associated Plan',
        params: {
            businessId: props.plan.id,
            plan: props.plan.id,
            id: '-1'
        }
    });
};

onMounted(() => {
    if (route.query.shouldExpandBusinessUnitPlan === 'true') {
        isCollapse.value = false;
    }
    initialize();
});
</script>
<template>
    <div
        v-if="isAboutToExpire"
        class="mb-4">
        <InputField
            variant="message"
            severity="error"
            icon="pi pi-exclamation-triangle"
            :closable="false"
        >
            <span class="font-bold">{{ expirationMessage }}</span>
        </InputField>
    </div>
    <div class="mb-4 cursor-pointer">
        <Card @click="goToView()">
            <template #title>
                <div
                    class="flex justify-between w-full items-center"
                >
                    <h5
                        data-testid="name-title"
                        class="flex items-center gap-2"
                    >
                        {{
                            lodash.truncate(helpers.getLocaleValue(plan.name), {
                                length: 50
                            })
                        }}
                        <StatusTag data-testid="status-tag" :status="plan.status" />
                        <StatusTag
                            v-if="displayStatusTag === 'not-started'"
                            data-testid="not-started-status-tag"
                            status="Not Started"
                        />
                        <StatusTag
                            v-if="displayStatusTag === 'expired'"
                            data-testid="expired-status-tag"
                            status="expired"
                        />
                    </h5>
                    <div class="edit-cancel-button">
                        <Button
                            label="Actions"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-text"
                            :loading="busy"
                            @click.stop="showMenu"
                            data-testid="actions-button"
                        />
                        <Menu
                            ref="menu"
                            id="overlay_menu"
                            :model="menuItems"
                            :popup="true"
                        />
                    </div>
                </div>
            </template>
            <template #subtitle>
                <div data-testid="plan-details-label" class="mb-1">
                    {{ $t('plans.' + plan.bound) }} •
                    {{ $t('plans.' + plan.type) }}
                    {{
                        plan.is_cancellations
                            ? ' • ' + $t('common.cancellations')
                            : ''
                    }}
                    {{ plan.is_extensions ? ' • ' + $t('common.extensions') : '' }}
                    {{
                        plan.is_early_returns
                            ? ' • ' + $t('common.early_returns')
                            : ''
                    }}
                    {{ plan.is_opt_out ? ' • ' + $t('common.opt_out') : '' }}
                    {{ plan.is_refundable ? ' • ' + $t('common.refundable') : '' }}
                    {{ plan.is_overlap ? ' • ' + $t('common.overlap') : '' }}
                </div>
                <div data-testid="effective-date-label">
                    {{ $t('common.effective_date') }}:
                    {{
                        formatValue(plan.effective_date, {
                            type: 'date',
                            format: 'long'
                        })
                    }}
                    • {{ $t('common.end_date') }}:
                    {{ formatEndDateDisplay(plan.end_date) }}
                </div>
            </template>
            <template #content>
                <div class="mb-4 edit-cancel-button">
                    <Button
                        :icon="
                        isCollapse
                            ? 'pi pi-chevron-right'
                            : 'pi pi-chevron-down'
                    "
                        iconPos="left"
                        :label="
                        isCollapse
                            ? $t('clients.view_associated_plans', {
                                  item: plan.associated_plans.length
                              })
                            : $t('clients.hide_associated_plans', {
                                  item: plan.associated_plans.length
                              })
                    "
                        text
                        @click.stop="
                        () => {
                            isCollapse = !isCollapse;
                        }
                    "
                        data-testid="view-associated-plans-label"
                    />
                    <Button
                        icon="pi pi-plus"
                        iconPos="left"
                        :label="$t('clients.create_associated_plan')"
                        text
                        @click="redirectToCreateAssociatedPlan"
                        @click.stop="() => {}"
                        data-testid="create-associated-plan-button"
                    />
                </div>
            </template>
            <template
                #footer
                v-if="!isCollapse && plan.associated_plans.length > 0"
            >
                <BusinessUnitAssociatedPlan
                    v-for="(item, i) in plan.associated_plans"
                    :key="i"
                    :plan="item"
                    :id="plan.id"
                />
            </template>
        </Card>
    </div>
    <Confirmation
        v-model="statusUpdateDialog"
        :header="statusDialogHeader"
        :content="statusDialogContent"
        :confirm-button-class="statusDialogButtonClass"
        :confirm-button-text="statusDialogButtonText"
        @confirm="updateStatus"
    />
    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="$t('plans.delete_header')"
        :content="
            $t('plans.delete_content', {
                item: helpers.getLocaleValue(plan.name)
            })
        "
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />
</template>
