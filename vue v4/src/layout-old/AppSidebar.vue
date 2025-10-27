<script setup>
import AppMenu from './AppMenu.vue';
import { useLayout } from '@/layout/composables/layout';

const { layoutState } = useLayout();

let timeout = null;

const onMouseEnter = () => {
    if (!layoutState.anchored.value) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        layoutState.sidebarActive.value = true;
    }
};

const onMouseLeave = () => {
    if (!layoutState.anchored.value) {
        if (!timeout) {
            timeout = setTimeout(
                () => (layoutState.sidebarActive.value = false),
                300
            );
        }
    }
};

const anchor = () => {
    layoutState.anchored.value = !layoutState.anchored.value;
};

const version = import.meta.env.VITE_API_APP_VERSION || 'local';
</script>

<template>
    <div
        class="layout-sidebar"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <div class="sidebar-header">
            <router-link :to="{ name: 'Home' }" class="app-logo">
                <img
                    src="@/assets/images/new_logo_sidebar.png"
                    class="app-logo-normal h-24 w-64"
                />
            </router-link>
            <Button
                class="layout-sidebar-anchor z-20 mb-2"
                link
                @click="anchor()"
            ></Button>
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
