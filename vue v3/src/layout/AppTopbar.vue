<script setup>
import useEventsBus from '@/composables/event-bus';
const { bus } = useEventsBus();

const visibleRight = ref(false);
const cartRef = ref(null);

watch(
    () => bus.value.get('showNotifications'),
    () => {
        visibleRight.value = true;
    }
);

function sendMessageToSW(serviceWorker) {
    if (!serviceWorker) {
        return;
    }
    serviceWorker.postMessage({
        type: 'SET_VERSION',
        version: import.meta.env.VITE_CACHE_VERSION || 'v1'
    });

    Notification.requestPermission().then(async (permission) => {
        if (permission === 'granted') {
            if (!(await getTokenRequest())) {
                setTimeout(async () => {
                    await getTokenRequest();
                }, 1500);
            }
        } else {
            console.warn('Notification permission denied');
        }
    });
}

const getTokenRequest = async () => {
    try {
        const token = await getToken(messaging);
        if (token) {
            await NotificationService.createToken({
                token,
                user_agent: navigator.userAgent,
                device: 'web'
            });
            return true;
        }
    } catch (error) {
        return false;
    }
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then(() => {
            return navigator.serviceWorker.ready;
        })
        .then((registration) => {
            checkAgain(registration);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_NOTIFICATION') {
            getAllNotifications();
            if (!JSON.parse(localStorage.getItem(userEmail.value + '_mute'))) {
                showNotification(event.data.payload);
            }
        }
    });

    const checkAgain = (registration) => {
        setTimeout(() => {
            if (registration.active) {
                sendMessageToSW(registration.active);
            } else {
                checkAgain(registration);
            }
        }, 1500);
    };
}

import AppBreadcrumb from './AppBreadcrumb.vue';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ability } from '@/plugins/ability';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useLayout } from '@/layout/composables/layout';
import { NotificationService } from '@/modules/administration/services';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { useSessionStore } from '@/stores';
import CartSidebar from '@/modules/policies/components/cart/CartSidebar.vue';

const { onMenuToggle, onProfileSidebarToggle } = useLayout();
const toast = useToast();
const { t } = useI18n();
const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const loading = ref(false);
const sessionStore = useSessionStore();
const userEmail = ref('');

onMounted(() => {
    bindOutsideClickListener();
    getAllNotifications();
    userEmail.value = sessionStore.user?.id;
    mute.value =
        JSON.parse(localStorage.getItem(userEmail.value + '_mute')) ?? false;
});

const notifications = ref([]);
const unreadNotificationsCount = ref(0);
const loadingNotification = ref(false);

const getAllNotifications = async () => {
    loadingNotification.value = true;
    const res = await NotificationService.getAllNotifications();
    notifications.value = res.data.data;
    unreadNotificationsCount.value = +res.data.unread_count;
    loadingNotification.value = false;
};

const mute = ref(false);
const setMute = () => {
    mute.value = !mute.value;
    localStorage.setItem(userEmail.value + '_mute', JSON.stringify(mute.value));
};

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(
        sidebarEl.isSameNode(event.target) ||
        sidebarEl.contains(event.target) ||
        topbarEl.isSameNode(event.target) ||
        topbarEl.contains(event.target)
    );
};

const showProfileSidebar = () => {
    onProfileSidebarToggle();
};

const readNotification = async (id) => {
    const res = await NotificationService.readNotification(id);
    if (res) getAllNotifications();
};

onMessage(messaging, (payload) => {
    getAllNotifications();
    if (!JSON.parse(localStorage.getItem(userEmail.value + '_mute'))) {
        showNotification(payload);
    }
});

const showNotification = (payload) => {
    const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/new_favicon.png'
    });

    notification.onclick = () => {
        window.focus();
    };
};

const readAllNotification = async () => {
    loading.value = true;
    const res = await NotificationService.readAllNotification();
    if (res) getAllNotifications();
    loading.value = false;
};

const clearAllNotification = async () => {
    loading.value = true;
    const res = await NotificationService.clearAllNotification();
    if (res) getAllNotifications();
    loading.value = false;
};

const deleteNotification = async (id) => {
    loading.value = true;
    const res = await NotificationService.deleteNotification(id);
    if (res) getAllNotifications();
    loading.value = false;
};

const handleNotificationClick = (notification) => {
    const link = notification?.data?.link;
    if (!link || !link.trim()) return;
    const isClientUsersLink =
        link.includes('/clients/') && link.includes('user_id=');
    if (isClientUsersLink && !ability.can('view client users')) {
        toast.add({
            severity: 'error',
            summary: t('notifications.oops'),
            detail: t('clients.this_action_is_unauthorized'),
            life: 3000
        });
        return;
    }
    visibleRight.value = false;
    window.location.href = link;
};
</script>

<template>
    <div class="layout-topbar">
        <div class="topbar-start">
            <Button
                type="button"
                class="topbar-menubutton p-link p-trigger"
                @click="onMenuToggle"
            >
                <i class="pi pi-bars"></i>
            </Button>

            <AppBreadcrumb class="topbar-breadcrumb"></AppBreadcrumb>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <!-- <li class="topbar-search">
    <span class="p-input-icon-left">
        <i class="pi pi-search"></i>
        <InputText type="text" placeholder="Search" class="w-12rem sm:w-full" />
    </span>
</li> -->
                <li class="topbar-profile">
                    <div
                        v-if="cartRef?.cartsTotal > 0"
                        class="relative"
                        style="top: 5px"
                    >
                        <i
                            data-testid="cart-icon"
                            class="pi pi-shopping-cart cursor-pointer text-2xl"
                            @click="cartRef.openSidebar()"
                        />
                        <Badge
                            :value="cartRef?.cartsTotal"
                            severity="danger"
                            class="badge-position"
                        />
                    </div>
                    <i
                        v-else
                        data-testid="cart-icon"
                        class="pi pi-shopping-cart cursor-pointer text-2xl"
                        @click="cartRef.openSidebar()"
                    />
                </li>

                <li class="topbar-profile">
                    <div
                        v-if="unreadNotificationsCount"
                        class="relative"
                        style="top: 5px"
                    >
                        <i
                            data-testid="notification-icon"
                            class="pi pi-bell cursor-pointer text-2xl"
                            @click="visibleRight = true"
                        />
                        <Badge
                            :value="unreadNotificationsCount"
                            severity="danger"
                            class="badge-position"
                        ></Badge>
                    </div>
                    <i
                        v-else
                        data-testid="notification-icon"
                        class="pi pi-bell cursor-pointer text-2xl"
                        @click="visibleRight = true"
                    />
                </li>
                <li class="topbar-profile">
                    <Button
                        data-testid="profile-icon"
                        type="button"
                        class="p-link"
                        @click="showProfileSidebar"
                        ><img
                            src="/demo/images/avatar/avatar.png"
                            alt="Profile"
                    /></Button>
                </li>
            </ul>
        </div>
        <Sidebar
            v-model:visible="visibleRight"
            position="right"
            class="w-full w-30rem"
            :showCloseIcon="false"
        >
            <template #header>
                <div class="flex justify-content-between">
                    <div
                        class="flex align-items-center gap-1"
                        :style="`position: relative; right: ${
                            unreadNotificationsCount ? '175px' : '190px'
                        }`"
                    >
                        <h4 data-testid="notification-header-sidebar">
                            Notifications
                        </h4>
                        <Badge
                            class="mt-1.5"
                            v-if="unreadNotificationsCount"
                            :value="unreadNotificationsCount"
                            severity="danger"
                        ></Badge>
                    </div>
                    <Button
                        text
                        rounded
                        @click="visibleRight = false"
                        style="
                            width: 2.25rem;
                            aspect-ratio: 1/1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        "
                    >
                        <i class="pi pi-times" style="color: #708090" />
                    </Button>
                </div>
            </template>
            <div
                class="flex flex-column justify-content-center align-items-center mt-8"
                v-if="!notifications.length"
            >
                <i
                    class="pi pi-bell mb-3"
                    style="font-size: 4rem; color: grey"
                ></i>
                <p>You are all caught up</p>
            </div>
            <div v-else>
                <div class="flex justify-content-between">
                    <div class="flex justify-content-start gap-1">
                        <Button
                            text
                            @click="readAllNotification"
                            label="Mark all as read"
                            :disabled="loading"
                        />
                        <Button
                            text
                            @click="clearAllNotification"
                            label="Clear all"
                            :disabled="loading"
                        />
                    </div>
                    <div class="flex align-items-center">
                        <InputSwitch
                            inputId="mute_switch"
                            v-model="mute"
                            @click="setMute"
                        />
                        <label for="mute_switch" class="ml-1">Mute</label>
                    </div>
                </div>

                <div class="space-y-2">
                    <div v-if="loadingNotification" class="text-center mt-8">
                        loading...
                    </div>
                    <div
                        v-for="notification in notifications"
                        :key="notification.id"
                        :class="`flex justify-between items-start p-3 rounded-md shadow m-2 ${
                            notification.read_at ? '' : 'bg-blue-50'
                        } ${notification?.data?.link ? 'cursor-pointer' : ''}`"
                        @click="handleNotificationClick(notification)"
                        v-else
                    >
                        <div class="flex-1">
                            <div class="flex justify-content-between">
                                <h5 class="font-semibold">
                                    {{ notification.data?.title }}
                                </h5>
                                <Button
                                    icon="pi pi-times"
                                    class="p-button-text p-button-sm text-gray-400 hover:text-gray-600"
                                    @click="deleteNotification(notification.id)"
                                    :disabled="loading"
                                />
                            </div>
                            <p class="text-gray-600 text-sm mt-1">
                                {{ notification.data?.message }}
                            </p>
                            <p class="text-gray-400 text-xs mt-2">
                                {{
                                    new Date(
                                        notification.created_at
                                    ).toUTCString()
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Sidebar>

        <CartSidebar ref="cartRef" />
    </div>
</template>

<style lang="scss">
.topbar-profile .badge-position {
    position: relative;
    top: -25px;
}
</style>
