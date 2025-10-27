<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import helpers from '@/utils/helpers';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';

const route = useRoute();
const router = useRouter();

const search = ref('');

const { searchPolicy, setCurrentPolicy } = useClaimPolicyStore();
const { loading, data: policies, meta, mutate } = searchPolicy();

const searchAction = () => {
    router.push(`/claims/submissions/new/search?q=${search.value}`);
    mutate({ search: search.value });
};

watch(
    () => route.query,
    () => {
        if (route.query?.q) {
            search.value = route.query?.q;
            searchAction();
        }
    },
    { immediate: true, deep: true }
);

const onRowSelect = async ({ data }) => {
    await setCurrentPolicy(data);
    router.push(
        `/claims/submissions/new/?client_id=${data.client_id}&insured_id=${data.insured_id}&policy_id=${data.id}&q=${search.value}`
    );
};
</script>

<template>
    <div>
        <h3 data-testid="title-create-submission">
            {{ $t('midnight_sun.create_submission') }}
        </h3>

        <div class="card col-8 mt-4 mx-auto pt-6 pb-8 px-5">
            <h5 data-testid="title-policy-search">
                {{ $t('midnight_sun.search_title') }}
            </h5>
            <div class="flex mt-3 gap-4 align-items-start">
                <div class="search flex flex-column flex-grow-1">
                    <Search
                        v-model="search"
                        data-testid="input-search-policy"
                        :placeholder="$t('midnight_sun.search_content')"
                    />
                </div>
                <Button
                    :label="$t('common.search')"
                    class="w-8rem"
                    @click="searchAction"
                    data-testid="btn-search-policy"
                    :disabled="!search"
                    :loading="loading"
                />
            </div>

            <div class="mt-4">
                <DataTable
                    v-if="policies"
                    :value="policies"
                    :loading="loading"
                    @rowSelect="onRowSelect"
                    selectionMode="single"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]"
                    paginatorTemplate=" FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                >
                    <template #empty>
                        {{
                            $t('common.datatable_not_found', {
                                item: $t('policies.title').toLowerCase()
                            })
                        }}
                    </template>
                    <template #loading>
                        {{
                            $t('common.datatable_loading', {
                                item: $t('policies.title').toLowerCase()
                            })
                        }}
                    </template>

                    <Column :header="$t('common.status')">
                        <template #body="{ data, index }">
                            <ClaimStatusTag
                                :status="data.status"
                                :data-testid="'data-table-status-' + index"
                            />
                        </template>
                    </Column>

                    <Column :header="$t('common.name')">
                        <template #body="{ data, index }">
                            <span
                                :data-testid="'data-table-name-' + index"
                                v-html="`${data.first_name} ${data.last_name}`"
                            />
                        </template>
                    </Column>

                    <Column :header="$t('policies.policy_number')">
                        <template #body="{ data, index }">
                            <span
                                :data-testid="
                                    'data-table-policy_number-' + index
                                "
                                v-html="`${data.policy_number}`"
                            />
                        </template>
                    </Column>

                    <Column :header="$t('policies.date_of_birth')">
                        <template #body="{ data, index }">
                            <span
                                :data-testid="
                                    'data-table-date-of-birth-' + index
                                "
                                v-html="
                                    `${helpers.formatDate(data.date_of_birth)}`
                                "
                            />
                        </template>
                    </Column>

                    <Column :header="$t('auth.email')">
                        <template #body="{ data, index }">
                            <span
                                :data-testid="'data-table-email-' + index"
                                v-html="`${data.email}`"
                            />
                        </template>
                    </Column>

                    <Column>
                        <template #body="{ data, index }">
                            <i
                                :data-testid="'data-table-action-' + index"
                                class="pi pi-ellipsis-v"
                            />
                        </template>
                    </Column>
                </DataTable>

                <!-- Use this if meta is in the response and disable paginator above DataTable or use BaseTable-->
                <!-- <Paginator
                  v-if="meta"
                  :rows="10"
                  :first="meta.current_page-1"
                  :totalRecords="meta.total"
                  :rowsPerPageOptions="[1, 5, 10]"
                  template=" FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                  currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                  data-testid="paginator-actions"
              /> -->

                <pre v-if="0" v-text="meta" class="text-xs" />
                <pre v-if="0" v-text="policies" class="text-xs" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.search .p-inputtext {
    padding-bottom: 0.775rem !important;
    width: 100%;
}
</style>
