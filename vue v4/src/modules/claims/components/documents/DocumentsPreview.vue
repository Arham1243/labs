<script setup>
import { ref, watch } from 'vue';
import { mock_data } from '@/modules/claims/services/Claim.service';

const documents = mock_data('documents');

const showSidePanel = ref(true);

const selected = ref(documents[0]);

const page = ref(1);
const onPageSelect = (doc, index) => {
    selected.value = doc;
    page.value = index + 1;
};

watch(
    () => page,
    () => {
        selected.value = documents[page.value - 1];
    },
    { deep: true }
);

const moveToPreviousPage = () => {
    if (page.value > 1) page.value = page.value - 1;
};

const moveToNextPage = () => {
    if (page.value < documents.length) page.value = page.value + 1;
};

const zoom = ref(100);
const sizes = [25, 50, 100, 150, 200];
const zoomOptions = sizes.map((value) => ({ label: value + '%', value }));

const onZoom = (action) => {
    let index = sizes.indexOf(zoom.value);
    let newIndex = action === 'in' ? index + 1 : index - 1;
    zoom.value =
        (index === 0 && action === 'out') ||
        (index === sizes.length - 1 && action === 'in')
            ? zoom.value
            : sizes[newIndex];
};
</script>

<template>
<!--    <div class="flex flex-grow-1" />-->
    <div class=" h-[calc(100vh-5.6rem)] flex relative z-1">
        <!-- Panel Side -->
        <div
            class="h-full flex flex-col flex-shrink-0 gap-8 bg-black/85 text-white overflow-y-auto overflow-x-hidden transition-all transition-duration-500 p-12"
            :class="showSidePanel ? 'w-[14rem]' : 'w-0 px-0 overflow-hidden'"
        >
            <div
                v-for="(doc, index) in documents"
                class="flex gap-3 flex-col cursor-pointer"
                :key="doc.uuid"
                @click="onPageSelect(doc, index)"
            >
                <img
                    :src="doc.link"
                    class="max-w-full"
                    :class="{
                        'border-4 border-red-600': selected?.uuid === doc.uuid
                    }"
                    :data-testid="'img-doc-thumbnail-' + index"
                />
                <div :data-testid="'text-doc-name-' + index">
                    {{ doc.name }}
                </div>
            </div>
        </div>

        <!-- Panel Main Document View -->
        <div
            class="h-full bg-black/70 grow transition-all transition-duration-500 overflow-hidden relative"
            :styleX="`margin-left:${showSidePanel ? 14 : 0}rem;`"
        >
            <div
                class="
                flex flex-row justify-between items-center md:items-end mx-16 pt-8 pb-8 text-xl flex-wrap gap-3
                [&_button]:!text-white [&_button]:border [&_button]:!border-white/30 [&_button:hover]:!border-white/70 [&_button]:!px-6 [&_button.p-button-outlined:hover]:!bg-transparent"
            >
                <div class="flex gap-2">
                    <Button
                        type="button"
                        icon="pi pi-arrow-up"
                        outlined
                        :disabled="page === 1"
                        @click="moveToPreviousPage"
                        data-testid="btn-prev-page"
                    />
                    <Button
                        type="button"
                        icon="pi pi-arrow-down"
                        outlined
                        :disabled="page === documents.length"
                        @click="moveToNextPage"
                        data-testid="btn-next-page"
                    />
                </div>

                <div class="text-white flex gap-3 items-center">
                    Page
                    <InputNumber
                        v-model="page"
                        :min="1"
                        :max="documents.length"
                        class="w-[3rem] bg-transparent text-xl [&_input]:!text-white [&_input]:!border-white/30"
                        data-testid="input-doc-page"
                    />
                    Of
                    <span data-testid="text-total-pages">
                        {{ documents.length }}
                    </span>
                </div>

                <div class="flex gap-2">
                    <Button
                        type="button"
                        icon="pi pi-minus"
                        outlined
                        :disabled="zoom === sizes[0]"
                        @click="onZoom('out')"
                        data-testid="btn-zoom-out"
                    />

                    <Select
                        v-model="zoom"
                        optionLabel="label"
                        optionValue="value"
                        :options="zoomOptions"
                        placeholder="100%"
                        class="w-full !bg-transparent !text-white [&_.p-select-label]:!text-white !border-white/30 hover:!border-white hover:border-1 hover:!border-white/30 hover:text-gray-800"
                        :pt="{
                            dropdownIcon: { class: 'text-white' },
                        }"
                        data-testid="dropdown-zoom-options"
                    />

                    <Button
                        type="button"
                        icon="pi pi-plus"
                        outlined
                        :disabled="zoom === sizes[sizes.length - 1]"
                        @click="onZoom('in')"
                        data-testid="btn-zoom-in"
                    />
                </div>
            </div>
            <div class="pb-8 overflow-auto text-center">
                <div class="h-[calc(100vh-15rem)] mx-16 overflow-x-auto">
                    <img
                        :src="selected?.link"
                        :style="'width:' + zoom + '%; max-width:' + zoom + '% !important'"
                        class="transition-all transition-duration-500"
                        data-testid="img-selected-doc"
                    />
                </div>
            </div>

            <Button
                type="button"
                :icon="
                    'pi ' +
                    (showSidePanel ? 'pi-chevron-left' : 'pi-chevron-right')
                "
                class="!absolute top-1/2 left-0 text-white !border-black/85 dark:border-black/85 !rounded-l-none !bg-black/55"
                @click="showSidePanel = !showSidePanel"
                data-testid="btn-collapse-panel-side"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
//.panel {
//    width: calc(100vw - 512px);
//    min-width: calc(100vw - 30% - 60px);
//}
//.panel-side {
//    height: calc(100vh - 70px);
//}
//.panel-document-view {
//    height: calc(100vh - 150px);
//}
</style>
