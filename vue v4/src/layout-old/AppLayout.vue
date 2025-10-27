<script setup>
import { computed, onBeforeMount, provide, ref, watch } from 'vue';
import AppTopbar from './AppTopbar.vue';
import AppSidebar from './AppSidebar.vue';
import AppProfileSidebar from '@/layout/AppProfileSidebar.vue';
import Forbidden from '@/views/errors/Forbidden.vue';
import AppBreadCrumb from './AppBreadcrumb.vue';
import { useLayout } from '@/layout/composables/layout';
import { useSessionStore, useGlobalStore } from '@/stores';

const { layoutConfig, layoutState, isSidebarActive } = useLayout();
const outsideClickListener = ref(null);
const sidebarRef = ref(null);
const topbarRef = ref(null);
const loading = ref(true);
const currentUser = ref(null);
const sessionStore = useSessionStore();
const globalStore = useGlobalStore();

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
    currentUser.value = sessionStore.user;

    loading.value = false;
});

provide('currentUser', currentUser);

const containerClass = computed(() => {
    return {
        'layout-light': layoutConfig.colorScheme.value === 'light',
        'layout-dim': layoutConfig.colorScheme.value === 'dim',
        'layout-dark': layoutConfig.colorScheme.value === 'dark',
        'layout-colorscheme-menu':
            layoutConfig.menuTheme.value === 'colorScheme',
        'layout-primarycolor-menu':
            layoutConfig.menuTheme.value === 'primaryColor',
        'layout-transparent-menu':
            layoutConfig.menuTheme.value === 'transparent',
        'layout-overlay': layoutConfig.menuMode.value === 'overlay',
        'layout-static': layoutConfig.menuMode.value === 'static',
        'layout-slim': layoutConfig.menuMode.value === 'slim',
        'layout-slim-plus': layoutConfig.menuMode.value === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode.value === 'horizontal',
        'layout-reveal': layoutConfig.menuMode.value === 'reveal',
        'layout-drawer': layoutConfig.menuMode.value === 'drawer',
        'layout-static-inactive':
            layoutState.staticMenuDesktopInactive.value &&
            layoutConfig.menuMode.value === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive.value,
        'layout-mobile-active': layoutState.staticMenuMobileActive.value,
        'p-input-filled': layoutConfig.inputStyle.value === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple.value,
        'layout-sidebar-active': layoutState.sidebarActive.value,
        'layout-sidebar-anchored': layoutState.anchored.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                layoutState.overlayMenuActive.value = false;
                layoutState.overlaySubmenuActive.value = false;
                layoutState.staticMenuMobileActive.value = false;
                layoutState.menuHoverActive.value = false;
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
    const sidebarEl = sidebarRef?.value.$el;
    const topbarEl = topbarRef?.value.$el.querySelector('.topbar-menubutton');

    return !(
        sidebarEl.isSameNode(event.target) ||
        sidebarEl.contains(event.target) ||
        topbarEl.isSameNode(event.target) ||
        topbarEl.contains(event.target)
    );
};
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
            <AppSidebar ref="sidebarRef" />
            <div class="layout-content-wrapper">
                <AppTopbar ref="topbarRef" />
                <AppBreadCrumb class="content-breadcrumb"></AppBreadCrumb>
                <div class="layout-content">
                    <router-view></router-view>
                </div>
            </div>
            <AppProfileSidebar />
        </div>
        <Toast></Toast>
        <div class="layout-mask"></div>
    </div>
</template>
