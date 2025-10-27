import { ref, provide, inject, computed } from 'vue';

const EDIT_STATE_KEY = Symbol('editState');

export function provideEditState() {
    const activeEditComponent = ref(null);
    const showUnsavedDialog = ref(false);
    const pendingAction = ref(null);
    const cancelEditCallbacks = ref(new Map());
    const forceSkipConfirmation = ref(false);

    const setActiveComponent = (componentId) => {
        activeEditComponent.value = componentId;
    };

    const clearActiveComponent = () => {
        activeEditComponent.value = null;
    };

    const setForceSkipConfirmation = (value) => {
        forceSkipConfirmation.value = value;
    };

    const handleUnsavedChanges = (action) => {
        if (forceSkipConfirmation.value) {
            action();
            forceSkipConfirmation.value = false;
            return;
        }
        showUnsavedDialog.value = true;
        pendingAction.value = action;
    };

    const confirmDiscard = () => {
        showUnsavedDialog.value = false;
        if (pendingAction.value) {
            pendingAction.value();
            pendingAction.value = null;
        }
        clearActiveComponent();
    };

    const cancelDiscard = () => {
        showUnsavedDialog.value = false;
        pendingAction.value = null;
    };

    const registerCancelCallback = (componentId, callback) => {
        cancelEditCallbacks.value.set(componentId, callback);
    };

    const unregisterCancelCallback = (componentId) => {
        cancelEditCallbacks.value.delete(componentId);
    };

    const triggerCancelEdit = (skipConfirmation = false) => {
        skipConfirmation = skipConfirmation || forceSkipConfirmation.value;
        if (
            activeEditComponent.value &&
            cancelEditCallbacks.value.has(activeEditComponent.value)
        ) {
            const callback = cancelEditCallbacks.value.get(
                activeEditComponent.value
            );
            callback(skipConfirmation);
            if (forceSkipConfirmation.value) {
                forceSkipConfirmation.value = false;
            }
            return true;
        }
        return false;
    };

    const isAnyComponentEditing = computed(() => {
        return activeEditComponent.value !== null;
    });

    const shouldUseLazy = computed(() => {
        return !isAnyComponentEditing.value;
    });

    provide(EDIT_STATE_KEY, {
        activeEditComponent,
        showUnsavedDialog,
        isAnyComponentEditing,
        shouldUseLazy,
        setActiveComponent,
        clearActiveComponent,
        handleUnsavedChanges,
        confirmDiscard,
        cancelDiscard,
        registerCancelCallback,
        unregisterCancelCallback,
        triggerCancelEdit,
        setForceSkipConfirmation
    });

    return {
        activeEditComponent,
        showUnsavedDialog,
        isAnyComponentEditing,
        shouldUseLazy,
        setActiveComponent,
        clearActiveComponent,
        handleUnsavedChanges,
        confirmDiscard,
        cancelDiscard,
        registerCancelCallback,
        unregisterCancelCallback,
        triggerCancelEdit,
        setForceSkipConfirmation
    };
}

export function useEditState() {
    const editState = inject(EDIT_STATE_KEY);
    if (!editState) {
        throw new Error('Edit state not provided');
    }
    return editState;
}
