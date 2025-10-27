<script setup>
import '../assets/styles/style.css';
import { useI18n } from 'vue-i18n';
import { useClaimsStore } from '../stores/Claim';
import { onMounted } from 'vue';
const { t } = useI18n();

const store = useClaimsStore();
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
