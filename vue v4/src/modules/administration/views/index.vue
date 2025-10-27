<script setup>
import Homepage from '@/modules/administration/components/administration/Homepage.vue';
import { ref, computed, onMounted } from 'vue';
import { useAdministrationStore } from '@/modules/administration/stores/Administration';
import { useI18n } from 'vue-i18n';
import Label from '@/components/common/Label.vue';
import { useHelpers } from '@/composables';

const helpers = useHelpers();
const { t } = useI18n();

const searchValue = ref('');
const administrationStore = useAdministrationStore();

onMounted(async () => {
    await administrationStore.getSettings();
});

const filteredSettings = computed(() => {
    const allSettings = administrationStore.settings;
    const settings = helpers.filterByPermission(allSettings);

    if (!searchValue.value) return settings;

    return settings.filter((setting) => {
        const nameMatches =
            setting.name &&
            setting.name
                .toLowerCase()
                .includes(searchValue.value.toLowerCase());
        const descriptionMatches =
            setting.description &&
            setting.description
                .toLowerCase()
                .includes(searchValue.value.toLowerCase());
        return nameMatches || descriptionMatches;
    });
});
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label testId="page-title">
                    {{ t('administration.title') }}
                </Label>
            </template>
        </Header>

        <div class="p-inputgroup rounded-border my-6">
            <span class="p-inputgroup-addon">
                <i class="pi pi-search"></i>
            </span>
            <InputText
                data-testid="administration-search-textfield"
                v-model="searchValue"
                :placeholder="$t('common.search')"
            />
        </div>

        <div class="accordions-wrapper">
            <Homepage
                v-if="filteredSettings.length"
                :settings="filteredSettings"
            />
            <div v-else class="no-results flex items-center gap-2 mt-6">
                <i class="pi pi-exclamation-circle"></i>
                {{ t('administration.not_found') }}
            </div>
        </div>
    </div>
</template>

<style scoped>
span.p-inputgroup-addon {
    background: none;
    padding: 0 !important;
    min-width: auto;
    border: none;
}

input.p-inputtext.p-component {
    border: none;
    background: none;
    outline: none;
    box-shadow: none !important;
}

.p-inputgroup {
    padding: 0.23rem 0.75rem;
    background: #fff;
    width: 56%;
    border: 1px solid #ced4da;
    overflow: hidden;
    border-radius: 0.5rem;
}
</style>
