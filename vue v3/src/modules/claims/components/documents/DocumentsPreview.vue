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
    <div class="flex flex-grow-1" />
    <div class="panel flex flex-grow-1 fixed">
        <!-- Panel Side -->
        <div
            class="panel-side fixed flex flex-column gap-5 bg-gray-900 text-white overflow-y-auto overflow-x-hidden flex-shrink-0 transition-all transition-duration-500 p-6"
            :class="showSidePanel ? 'w-14rem' : 'w-0 overflow-hidden'"
        >
            <div
                v-for="(doc, index) in documents"
                class="flex gap-3 flex-column cursor-pointer w-8rem"
                :key="doc.uuid"
                @click="onPageSelect(doc, index)"
            >
                <img
                    :src="doc.link"
                    class="max-w-full"
                    :class="{
                        'border-3 border-red-600': selected?.uuid === doc.uuid
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
            class="bg-gray-800 fixed flex-grow-1 relative transition-all transition-duration-500"
            :style="`margin-left:${showSidePanel ? 14 : 0}rem;`"
        >
            <div
                class="flex flex-row justify-content-between align-items-center justify-between items-center md:align-items-end mx-7 py-4 text-xl flex-wrap gap-3"
            >
                <div class="flex gap-2">
                    <Button
                        type="button"
                        icon="pi pi-arrow-up"
                        class="text-white border-1 border-white-alpha-30 px-4"
                        outlined
                        :disabled="page === 1"
                        @click="moveToPreviousPage"
                        data-testid="btn-prev-page"
                    />
                    <Button
                        type="button"
                        icon="pi pi-arrow-down"
                        class="text-white border-1 border-white-alpha-30 px-4"
                        outlined
                        :disabled="page === documents.length"
                        @click="moveToNextPage"
                        data-testid="btn-next-page"
                    />
                </div>

                <div class="text-white flex gap-3 align-items-center">
                    Page
                    <InputNumber
                        v-model="page"
                        :min="1"
                        :max="documents.length"
                        :pt="{
                            input: {
                                class: 'w-3rem bg-transparent text-xl text-white border-white-alpha-30'
                            }
                        }"
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
                        class="text-white border-1 border-white-alpha-30 px-4"
                        outlined
                        :disabled="zoom === sizes[0]"
                        @click="onZoom('out')"
                        data-testid="btn-zoom-out"
                    />

                    <Dropdown
                        v-model="zoom"
                        optionLabel="label"
                        optionValue="value"
                        :options="zoomOptions"
                        placeholder="100%"
                        class="w-full bg-transparent text-white border-white-alpha-30 hover:border-white hover:border-1 hover:border-white-alpha-30 hover:text-gray-800"
                        :pt="{
                            dropdownIcon: { class: 'text-white' },
                            input: { class: 'text-white' }
                        }"
                        data-testid="dropdown-zoom-options"
                    />

                    <Button
                        type="button"
                        icon="pi pi-plus"
                        class="p-button-sm text-white border-1 border-white-alpha-30 px-4"
                        outlined
                        :disabled="zoom === sizes[sizes.length - 1]"
                        @click="onZoom('in')"
                        data-testid="btn-zoom-in"
                    />
                </div>
            </div>
            <div class="pb-8 overflow-auto text-center panel-document-view">
                <div class="mx-7 overflow-x-auto">
                    <img
                        :src="selected?.link"
                        :style="'width:' + zoom + '%'"
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
                class="absolute top-50 text-white border-none border-noround-left bg-gray-900"
                @click="showSidePanel = !showSidePanel"
                data-testid="btn-collapse-panel-side"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.panel {
    width: calc(100vw - 512px);
    min-width: calc(100vw - 30% - 60px);
}
.panel-side {
    height: calc(100vh - 70px);
}
.panel-document-view {
    height: calc(100vh - 150px);
}
</style>
