<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCartsStore } from '@/modules/policies/stores';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';
import useEventsBus from '@/composables/event-bus.js';

const { t } = useI18n();
const cartsStore = useCartsStore();
const helpers = useHelpers();
const router = useRouter();
const { bus } = useEventsBus();

const showSidebar = ref(false);
const items = ref([]);
const cartsTotal = ref(0);

const sidebarPassThroughOptions = {
    headerContent: { class: 'w-full' },
    closeButton: {
        'data-testid': 'carts-sidebar-close-button'
    }
};

const passThroughOptions = {
    panel: { class: 'mb-3' },
    headerContent: { class: 'bg-white' },
    headerAction: { class: 'text-lg text-black-alpha-70' },
    submenuIcon: { class: 'mr-3' },
    action: { class: 'pl-7' },
    label: { class: 'text-lg font-semibold', style: 'color: #14377D' },
    headerLabel: { class: 'p-break-all' }
};

const openSidebar = () => {
    showSidebar.value = true;
};

const closeSidebar = () => {
    showSidebar.value = false;
};

const getCarts = async () => {
    try {
        const payload = { filters: [] };
        const res = await cartsStore.searchCarts(payload, {
            include: 'items',
            limit: 1000
        });
        const _carts = res.data || [];
        cartsTotal.value = res.meta.total;

        const map = {};
        _carts.forEach((cart) => {
            const _items = cart.items || [];
            _items.forEach((item) => {
                if (!map[item.client_id]) {
                    map[item.client_id] = {};
                }

                if (!map[item.client_id]['items']) {
                    map[item.client_id]['items'] = {};
                }

                const bu = map[item.client_id]['items'];
                bu[item.business_unit_id] = {
                    key: item.business_unit_id,
                    label: helpers.getLocaleValue(item.business_unit.name),
                    command: () => {
                        router.push({
                            name: 'Carts',
                            query: {
                                client_id: item.client_id,
                                business_unit_id: item.business_unit_id
                            }
                        });
                        closeSidebar();
                    }
                };

                map[item.client_id] = {
                    key: item.client_id,
                    label: helpers.getLocaleValue(item.client.name),
                    items: bu
                };
            });
        });

        let _items = [];
        const _clients = Object.values(map) || [];
        _clients.forEach((client) => {
            const item = {
                ...client,
                items: Object.values(client.items) || []
            };

            _items.push(item);
        });

        items.value = _items;
    } catch (e) {
    } finally {
    }
};

defineExpose({ openSidebar, cartsTotal });

onMounted(() => {
    getCarts();
});

watch(
    () => bus.value.get('reloadCartSidebar'),
    () => {
        getCarts();
    }
);
</script>

<template>
    <Sidebar
        :visible="showSidebar"
        position="right"
        :dismissable="false"
        class="w-30rem enrollment-sidebar"
        :data-testid="'cart-sidebar'"
        :pt="sidebarPassThroughOptions"
        @update:visible="closeSidebar"
    >
        <template #header>
            <div
                class="inline-flex justify-content-between align-items-center w-full"
            >
                <h5 class="text-left mt-0">
                    <span data-testid="cart-sidebar-title">
                        {{ $t('carts.sidebar.title') }}
                    </span>
                </h5>
            </div>
        </template>

        <div data-testid="cart-sidebar-list-panel">
            <div
                v-if="items.length === 0"
                class="flex flex-column justify-content-center align-items-center p-4 text-center"
            >
                <i
                    class="pi pi-shopping-cart mb-3"
                    style="font-size: 3rem; color: #6c757d"
                ></i>
                <p class="text-600 m-0">
                    {{ t('carts.sidebar.empty_message') }}
                </p>
            </div>
            <PanelMenu
                v-else
                :model="items"
                class="w-full"
                :pt="passThroughOptions"
            />
        </div>
    </Sidebar>
</template>
