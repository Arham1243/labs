<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import helpers from '@/utils/helpers';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import useEventsBus from '@/composables/event-bus';
import { useRouter } from 'vue-router';

const props = defineProps({
    plan: {
        type: Object,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();
const { t } = useI18n();
const router = useRouter();
const planStore = useAssociatedPlanStore();
const { emit } = useEventsBus();

const busy = ref(false);
const deleteDialog = ref(false);
const loading = ref(false);
const statusUpdateDialog = ref(false);
const menu = ref();
const categories = ref({
    early_arrivals: t('common.early_arrivals'),
    gap: t('common.gap'),
    dependants: t('common.dependants'),
    recent_graduate: t('common.recent_graduate')
});

const isItemActive = computed(() => {
    return props.plan.status === 'active';
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
        ? t('common.make_item_inactive', { item: t('plans.title') })
        : t('common.make_item_active', { item: t('plans.title') });
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: t(`common.${props.plan.category}`) + ' type associated plan'
          })
        : t('common.are_you_sure_active', {
              item: t(`common.${props.plan.category}`) + ' type associated plan'
          });
});

const showMenu = (event) => {
    menu.value.toggle(event);
};

const goToView = () => {
    router.push({
        name: 'Associated Plan Details',
        params: { plan: props.id, id: props.plan.id }
    });
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await planStore.deletePlan(props.id, props.plan.id);

        emit('reloadPlans');
    } catch (error) {
        //
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...props.plan,
            status: props.plan.status === 'active' ? 'inactive' : 'active'
        };
        await planStore.updatePlanStatus(props.plan.id, payload);

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

onMounted(() => {
    initialize();
});
</script>

<template>
    <div
        class="py-4 bg-blue-50 border-b border-gray-300"
        @click.stop="goToView"
    >
        <div
            class="flex justify-between w-full items-center px-12"
        >
            <h5
                data-testid="category-title"
                class="flex items-center gap-2"
            >
                {{ categories[plan.category] }}
                <StatusTag :status="plan.status" />
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
        <div
            data-testid="effective-date-label"
            class="px-12"
            style="color: #495058"
        >
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
        :header="$t('plans.delete_associated_header')"
        :content="
            $t('plans.delete_content', {
                item: helpers.getLocaleValue(plan.name)
            })
        "
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
    />
</template>
