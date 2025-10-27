<script setup>
import AppMenuItem from './AppMenuItem.vue';

defineProps({
    model: {
        type: Array,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <Loader v-if="loading" />
            <div v-else>
                <AppMenuItem :item="item" root :index="i" />
            </div>
            <li class="menu-separator"></li>
        </template>
    </ul>
</template>
