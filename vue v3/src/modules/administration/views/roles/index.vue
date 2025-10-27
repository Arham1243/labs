<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import RoleTable from '@/modules/administration/components/roles/tables/RoleTable.vue';
import { onMounted } from 'vue';
const { t } = useI18n();
const router = useRouter();
import Label from '@/components/common/Label.vue';

const goBack = () => {
    router.push({ name: 'Administration' });
};
onMounted(() => {
    sessionStorage.removeItem('previousRoute');
});
</script>

<template>
    <div>
        <div class="flex align-items-center gap-4">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                severity="secondary"
                outlined
                class="px-4 mb-2"
            />
            <Header hide-back>
                <template #title
                    ><Label test-id="page-title">{{
                        t('roles.title')
                    }}</Label></template
                >
            </Header>
        </div>
        <Card class="mt-4">
            <template #content>
                <RoleTable />
            </template>
        </Card>
    </div>
</template>
