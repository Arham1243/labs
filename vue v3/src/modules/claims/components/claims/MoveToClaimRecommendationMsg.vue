<script setup>
import { ref } from 'vue';
import CreateNewClaimDialog from '@/modules/claims/components/claims/dialogs/CreateNewClaimDialog.vue';

const createNewClaimDialog = ref(false);
</script>

<template>
    <div class="flex flex-wrap pl-4 pr-4 bg-recommended mt-5">
        <div class="grid mt-0">
            <div class="col-8 align-content-center">
                <div class="flex align-items-center gap-2">
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
                <div class="flex mt-3">
                    <p data-testid="text-claim-recommendation-description">
                        The reason is Reference site about Lorem Ipsum, giving
                        information on its origins, as well as a random Lipsum
                        generator. The reason is Reference site about Lorem
                        Ipsum, giving information on its origins, as well as a
                        random Lipsum generator.
                    </p>
                </div>
            </div>
            <div class="col-4 pt-5">
                <div class="grid">
                    <div class="col-6">
                        <div
                            class="cursor-pointer text-center p-3 border-round-sm bg-green-500 font-bold text-white hover:bg-green-600"
                            data-testid="btn-accept-move"
                        >
                            <span>
                                <i class="pi pi-arrow-right" />
                                {{ $t('claims.accept_move') }}
                            </span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div
                            class="cursor-pointer text-center p-3 border-round-sm bg-red-500 font-bold text-white hover:bg-red-600"
                            data-testid="btn-decline-reassign"
                        >
                            <span>
                                <i class="pi pi-times" />
                                {{ $t('claims.decline_reassign') }}
                            </span>
                        </div>
                    </div>
                    <div class="col-12 pt-0">
                        <div
                            class="cursor-pointer text-center p-3 border-round-sm border-1 border-primary font-bold outline text-primary hover:bg-gray-100"
                            @click="createNewClaimDialog = true"
                            data-testid="btn-create-new-claim"
                        >
                            <span>
                                <i class="pi pi-plus" />
                                {{ $t('claims.create_new_claim') }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <CreateNewClaimDialog v-model:visible="createNewClaimDialog" />
</template>

<style scoped lang="scss"></style>
