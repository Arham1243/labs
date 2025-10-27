<script setup>
import { useRoute } from 'vue-router';
import { ref, computed, watch } from 'vue';
import useEventsBus from '@/composables/event-bus';

const { bus } = useEventsBus();
const route = useRoute();
const breadcrumbRoutes = ref([]);
const detailName = ref(null);
const breadcrumbHome = ref({ icon: 'pi pi-home', to: '/' });

const setBreadcrumbRoutes = () => {
    detailName.value = null;
    let routeNames = [];
    if (route.meta.breadcrumb) {
        routeNames = route.meta.breadcrumb;
    } else {
        routeNames = route.fullPath
            .split('/')
            .filter((item) => item !== '')
            .filter((item) => isNaN(Number(item)))
            .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
    }

    breadcrumbRoutes.value = routeNames.map((item) => {
        if (route.meta.back) {
            return {
                label: item,
                to: window.history?.state?.back
            };
        }
        return {
            label: item,
            to: route.meta.disableLinks ? false : { name: item }
        };
    });
};

const breadcrumbItems = computed(() => {
    const items = [...breadcrumbRoutes.value];
    if (detailName.value) {
        items.push({ label: detailName.value, url: 'javascript:void(0)' });
    }
    return items;
});

watch(
    route,
    () => {
        setBreadcrumbRoutes();
    },
    { immediate: true }
);
watch(
    () => bus.value.get('updateDetailsBreadcrumb'),
    (newValue) => {
        const newDetailName = newValue ? newValue[0] : null;
        if (detailName.value !== newDetailName) {
            detailName.value = newDetailName;
        }
    }
);
</script>

<template>
    <nav class="layout-breadcrumb">
        <Breadcrumb
            v-if="!route.path.includes('template')"
            :home="breadcrumbHome"
            :model="breadcrumbItems"
        >
            <template #separator>
                <i class="pi pi-chevron-right"></i>
            </template>
        </Breadcrumb>
    </nav>
</template>
