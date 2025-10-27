<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import UserTable from '@/modules/administration/components/users/tables/UserTable.vue';
import Label from '@/components/common/Label.vue';

const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title
                    ><Label test-id="page-title">{{
                        t('users.title')
                    }}</Label></template
                >
            </Header>
        </div>
        <Card class="mt-7">
            <template #content>
                <UserTable />
            </template>
        </Card>
    </div>
</template>
