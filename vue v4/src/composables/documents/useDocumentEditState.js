import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditState } from '@/modules/plans/composables/useEditState';

export function useDocumentEditState(props) {
    const {
        activeEditComponent,
        setActiveComponent,
        clearActiveComponent,
        handleUnsavedChanges,
        registerCancelCallback,
        unregisterCancelCallback
    } = useEditState();

    const isEditing = ref(false);

    const isEditDisabled = computed(() => {
        return (
            activeEditComponent.value &&
            activeEditComponent.value !== props.componentId
        );
    });

    onMounted(() => {
        registerCancelCallback(props.componentId, handleCancel);
    });

    onUnmounted(() => {
        unregisterCancelCallback(props.componentId);
    });

    const handleEdit = () => {
        isEditing.value = true;
        setActiveComponent(props.componentId);
    };

    const handleCancel = (skipConfirmation = false) => {
        if (props.isReview || skipConfirmation) {
            isEditing.value = false;
            clearActiveComponent();
        } else {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        }
    };

    return {
        isEditing,
        isEditDisabled,
        handleEdit,
        handleCancel
    };
}
