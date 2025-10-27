<script setup>
import { ref } from 'vue';
import CreateNewClaimDialog from '@/modules/claims/components/claims/dialogs/CreateNewClaimDialog.vue';

const createNewClaimDialog = ref(false);
</script>

<template>
    <div class="flex flex-wrap p-12 bg-recommended">
        <div class="grid grid-cols-5 gap-3 mt-0">
            <div class="pt-2 col-span-3 content-center">
                <div class="flex items-center gap-2">
                    <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        data-testid="icon-claim-recommendation"
                    >
                        <path
                            d="M15.834 8.00065L16.8757 5.70898L19.1673 4.66732L16.8757 3.62565L15.834 1.33398L14.7923 3.62565L12.5007 4.66732L14.7923 5.70898L15.834 8.00065ZM9.58398 8.41732L7.50065 3.83398L5.41732 8.41732L0.833984 10.5007L5.41732 12.584L7.50065 17.1673L9.58398 12.584L14.1673 10.5007L9.58398 8.41732ZM15.834 13.0007L14.7923 15.2923L12.5007 16.334L14.7923 17.3757L15.834 19.6673L16.8757 17.3757L19.1673 16.334L16.8757 15.2923L15.834 13.0007Z"
                            fill="#212121"
                        />
                    </svg>
                    <span
                        class="font-semibold"
                        data-testid="text-claim-recommendation"
                    >
                        {{ $t('claims.recommendation') }}:
                        {{ $t('claims.move_submission_to_claim') }}
                        <span class="cursor-pointer underline">1573818</span>
                    </span>
                    <Tag
                        data-testid="tag-accuracy"
                        value="99% ACCURACY"
                        class="p-tag-success"
                    />
                </div>
                <div class="flex mt-12">
                    <p data-testid="text-claim-recommendation-description">
                        The reason is Reference site about Lorem Ipsum, giving
                        information on its origins, as well as a random Lipsum
                        generator. The reason is Reference site about Lorem
                        Ipsum, giving information on its origins, as well as a
                        random Lipsum generator.
                    </p>
                </div>
            </div>
            <div class="pt-8 col-span-2">
                <div class="grid grid-cols-6 gap-3">
                    <div class="col-start-1 col-end-4">
                        <Button
                            :label="$t('claims.accept_move')"
                            severity="success"
                            icon="pi pi-arrow-right"
                            data-testid="btn-accept-move"
                            class="w-full"
                        />
                    </div>
                    <div class="col-span-3 col-end-7">
                        <Button
                            :label="$t('claims.decline_reassign')"
                            severity="danger"
                            icon="pi pi-times"
                            data-testid="btn-decline-reassign"
                            class="w-full"
                        />
                    </div>
                    <div class="col-start-1 col-end-7">
                        <Button
                            :label="$t('claims.create_new_claim')"
                            severity="contrast"
                            icon="pi pi-plus"
                            data-testid="btn-create-new-claim"
                            variant="outlined"
                            @click="createNewClaimDialog = true"
                            class="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <CreateNewClaimDialog v-model:visible="createNewClaimDialog" />
</template>

<style scoped lang="scss"></style>
