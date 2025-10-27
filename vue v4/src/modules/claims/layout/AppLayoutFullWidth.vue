<script setup>
import { computed, onBeforeMount, onBeforeUnmount, provide, ref, watch } from 'vue';
import AppProfileSidebar from '@/layout/AppProfileSidebar.vue';
import Forbidden from '@/views/errors/Forbidden.vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useLayout } from '@/layout/composables/layout';
import { useSessionStore, useGlobalStore, useCommonStore } from '@/stores';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const loading = ref(true);
const currentUser = ref(null);
const sessionStore = useSessionStore();
const globalStore = useGlobalStore();
const commonStore = useCommonStore();

const outsideClickListener = ref(null);

function bindOutsideClickListener() {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive = false;
                layoutState.overlaySubmenuActive = false;
                layoutState.staticMenuMobileActive = false;
                layoutState.menuHoverActive = false;
                layoutState.configSidebarVisible = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
}

function unbindOutsideClickListener() {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener.value);
        outsideClickListener.value = null;
    }
}

function isOutsideClicked(event) {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarButtonEl = document.querySelector('.topbar-menubutton');

    return !(sidebarEl?.isSameNode(event.target) || sidebarEl?.contains(event.target) || topbarButtonEl?.isSameNode(event.target) || topbarButtonEl?.contains(event.target));
}

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

onBeforeMount(async () => {
    if (!sessionStore.user) {
        await sessionStore.me();
    }
    if (!commonStore.generalSettings) {
        await commonStore.getGeneralSettings();
    }
    currentUser.value = sessionStore.user;
    loading.value = false;
});

provide('currentUser', currentUser);

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const containerClass = computed(() => {
    return {
        'layout-light': !layoutConfig.darkTheme,
        'layout-dark': layoutConfig.darkTheme,
        'layout-colorscheme-menu': layoutConfig.menuTheme === 'colorScheme',
        'layout-primarycolor-menu': layoutConfig.menuTheme === 'primaryColor',
        'layout-transparent-menu': layoutConfig.menuTheme === 'transparent',
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
    };
});
</script>

<template>
    <Forbidden v-if="globalStore.routeForbidden" />
    <div :class="['layout-container', { ...containerClass }]" v-else>
        <div
            class="w-screen h-screen flex justify-center items-center"
            v-if="loading"
        >
            <Loader />
        </div>
        <div v-else-if="!loading">
            <div>
                <div>
                    <router-view></router-view>
                </div>
            </div>
            <AppProfileSidebar />
            <AppConfig />
        </div>
        <Toast></Toast>
        <div class="layout-mask"></div>
    </div>
</template>

