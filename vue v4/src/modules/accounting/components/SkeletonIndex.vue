<script setup>
import '../assets/styles/style.css';
import { useI18n } from 'vue-i18n';
import { useSkeletonStore } from '../stores/Skeleton';
import { onMounted } from 'vue';
const { t } = useI18n();

const store = useSkeletonStore();
onMounted(() => {
    store.logFunction();
});
</script>

<template>
    <div>
        <h1 class="test-b">{{ t('skeleton.title') }}</h1>
    </div>
</template>
<style lang="scss" scoped></style>
