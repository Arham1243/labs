import { ref, provide, inject, computed } from 'vue';

const EDIT_STATE_KEY = Symbol('editState');
const globalNestedTabIdentifiers = new Set();

export function provideEditState() {
    const activeEditComponent = ref(null);
    const showUnsavedDialog = ref(false);
    const pendingAction = ref(null);
    const cancelEditCallbacks = ref(new Map());
    const forceSkipConfirmation = ref(false);
    const tabListeners = ref(new Map());

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

    const registerNestedTabGroup = (groupId) => {
        globalNestedTabIdentifiers.add(groupId);
    };

    const unregisterNestedTabGroup = (groupId) => {
        globalNestedTabIdentifiers.delete(groupId);
    };

    const isInsideNestedTabGroup = (element) => {
        if (!element) {
            return false;
        }

        let current = element;
        let depth = 0;

        while (current && current !== document.body) {
            depth++;

            if (
                current.hasAttribute &&
                current.hasAttribute('data-nested-tab')
            ) {
                const groupId = current.getAttribute('data-nested-tab');
                const isRegistered = globalNestedTabIdentifiers.has(groupId);

                if (isRegistered) {
                    return true;
                } else {
                    return false;
                }
            }

            current = current.parentElement;
        }
        return false;
    };

    const setupTabPrevention = (
        showExitEditDialogFn,
        setPendingTabIndexFn,
        setMenuTriggeredFn
    ) => {
        clearTabListeners();
        setTimeout(() => {
            const tabHeaders = document.querySelectorAll('.p-tab');

            tabHeaders.forEach((tab, index) => {
                const listener = (event) => {
                    // Check if this tab is inside a nested tab group
                    const isNested = isInsideNestedTabGroup(
                        event.currentTarget
                    );

                    if (isNested) {
                        return;
                    }

                    if (activeEditComponent.value) {
                        event.stopPropagation();
                        event.preventDefault();

                        setPendingTabIndexFn(index);
                        setMenuTriggeredFn(true);
                        showExitEditDialogFn(true);
                    }
                };
                tab.addEventListener('click', listener, true);
                tabListeners.value.set(tab, listener);
            });
        }, 100);
    };

    const clearTabListeners = () => {
        tabListeners.value.forEach((listener, element) => {
            element.removeEventListener('click', listener, true);
        });
        tabListeners.value.clear();
    };

    const setupNestedTabProtection = (nestedTabGroupId) => {
        registerNestedTabGroup(nestedTabGroupId);
        return () => {
            unregisterNestedTabGroup(nestedTabGroupId);
        };
    };

    const isAnyComponentEditing = computed(() => {
        return activeEditComponent.value !== null;
    });

    provide(EDIT_STATE_KEY, {
        activeEditComponent,
        showUnsavedDialog,
        setActiveComponent,
        clearActiveComponent,
        handleUnsavedChanges,
        confirmDiscard,
        cancelDiscard,
        registerCancelCallback,
        unregisterCancelCallback,
        triggerCancelEdit,
        setForceSkipConfirmation,
        isAnyComponentEditing,
        setupTabPrevention,
        clearTabListeners,
        setupNestedTabProtection,
        registerNestedTabGroup,
        unregisterNestedTabGroup
    });

    return {
        activeEditComponent,
        showUnsavedDialog,
        isAnyComponentEditing,
        setActiveComponent,
        clearActiveComponent,
        handleUnsavedChanges,
        confirmDiscard,
        cancelDiscard,
        registerCancelCallback,
        unregisterCancelCallback,
        triggerCancelEdit,
        setForceSkipConfirmation,
        setupTabPrevention,
        clearTabListeners,
        setupNestedTabProtection,
        registerNestedTabGroup,
        unregisterNestedTabGroup
    };
}

export function useEditState() {
    const editState = inject(EDIT_STATE_KEY);
    if (!editState) {
        throw new Error('Edit state not provided');
    }
    return editState;
}
