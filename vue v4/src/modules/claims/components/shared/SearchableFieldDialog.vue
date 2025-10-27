<script setup>
import { searchableFields } from '@/config';

const visible = defineModel('visible');

const props = defineProps({
    searchableType: { type: String }
});
const types = searchableFields[props.searchableType].map((search) => search);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('claims.searchable_fields')"
        :style="{ width: '40rem' }"
    >
        <p>
            <span data-testid="searchable_field_title">{{
                $t('claims.search_by')
            }}</span>
            <span v-for="(search, index) in types" :key="search">
                <span
                    v-if="search !== types[types.length - 1]"
                    :data-testid="`searchable_field_${index}`"
                >
                    {{ search }},
                </span>
                <span v-else :data-testid="`searchable_field_${index}`">{{
                    search
                }}</span>
            </span>
        </p>
    </Dialog>
</template>

<style scoped lang="scss"></style>
