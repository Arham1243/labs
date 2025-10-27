<script setup>
import { useLayout } from '@/layout/composables/layout';
import AppMenu from './AppMenu.vue';

const { layoutState } = useLayout();

let timeout = null;

const version = import.meta.env.VITE_API_APP_VERSION || 'local';

function onMouseEnter() {
    if (!layoutState.anchored) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarActive = true;
    }
}

function onMouseLeave() {
    if (!layoutState.anchored) {
        if (!timeout) {
            timeout = setTimeout(() => (layoutState.sidebarActive = false), 300);
        }
    }
}

function onAnchorToggle() {
    layoutState.anchored = !layoutState.anchored;
}
</script>

<template>
    <div class="layout-sidebar" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <div class="sidebar-header">
            <router-link :to="{ name: 'Home' }" class="app-logo">
                <img
                    src="@/assets/images/new_logo_sidebar.png"
                    alt="Horus Logo"
                    class="h-[6rem] w-[16rem]"
                />
            </router-link>
            <button class="layout-sidebar-anchor z-20 mb-2" type="button" @click="onAnchorToggle"></button>
        </div>
        <div class="layout-menu-container">
            <AppMenu />
        </div>
        <div class="layout-sidebar-footer text-center mb-2 text-white">
            Horus Version - {{ version }}
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
