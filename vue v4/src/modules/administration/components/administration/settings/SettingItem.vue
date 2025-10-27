<script setup>
import { onMounted } from 'vue';
import { useSessionStore } from '@/stores';

const props = defineProps({
    setting: Object
});
const setting = props.setting;
const sessionStore = useSessionStore();

onMounted(() => {
    if (setting.key === 'country') {
        const { permissions } = sessionStore;

        if (permissions.includes('view countries')) return;
        if (permissions.includes('view regions')) {
            setting.key = 'country/region';
            return;
        }
        if (permissions.includes('view provinces')) {
            setting.key = 'country/province';
        }
    }
});
</script>

<template>
    <li class="setting list-none" v-bind="$attrs">
        <router-link
            :to="
                setting.key === 'adjudication-queue' && setting.route
                    ? setting.route
                    : `/administration/${setting.key}`
            "
            class="setting-item flex items-center"
        >
            <div class="setting-item__details flex items-center gap-6">
                <div
                    class="icon flex justify-center items-center"
                >
                    <i
                        :data-testid="`${setting.id_icon}`"
                        :class="setting.icon"
                    ></i>
                </div>
                <span
                    :data-testid="`${setting.id_title}`"
                    class="title font-bold"
                    >{{ setting.name }}</span
                >
            </div>
            <div
                :data-testid="`${setting.id_description}`"
                class="setting-item__desc"
            >
                {{ setting.description }}
            </div>
        </router-link>
    </li>
</template>

<style scoped>
.setting-item__details .icon i {
    color: #0a4d8d;
}

.setting-item__details .title {
    color: #14377d;
}

.setting-item__details .icon {
    width: 3.25rem;
    aspect-ratio: 1 / 1;
    background: #e6eef2;
    border-radius: 100%;
}

.setting-item__details .icon i {
    font-size: 1.2rem;
}

.setting-item__desc {
    color: #767676;
    opacity: 0.75;
    font-weight: 400;
}

.setting:not(:last-child) a {
    padding-bottom: 1rem;
}

.setting:not(:last-child) {
    margin-bottom: 0.55rem;
}

.setting-item__details {
    width: 27%;
}
</style>
