import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores';
import * as NoteService from '@/modules/claims/services/ClaimNote.service';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMutation, useResource } from '@/modules/claims/utils';

export const ClaimNoteStore = defineStore('NoteStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const notesTypes = ref([
        { id: 1, name: 'Note' },
        { id: 2, name: 'Document' },
        { id: 3, name: 'Communication' }
    ]);

    const isLoading = ref(false);
    const isError = ref(false);
    const error = ref(null);

    const currentNotes = ref();

    /**
     * Set loading status
     * @param status
     */
    const setLoading = (status = true) => {
        if (status) {
            isLoading.value = true;
            isError.value = false;
            error.value = null;
        } else {
            isLoading.value = false;
        }
    };

    /**
     * Get notes by submission id
     * @param tenantId
     * @param submissionId
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getNotesBySubmissionId = (
        tenantId,
        submissionId,
        refresh = false
    ) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await NoteService.getNotesBySubmissionId(
                    tenantId,
                    submissionId
                );
                return res.data;
            }),
            currentNotes,
            refresh
        );
    };

    /**
     * Get notes by expense id
     * @param tenantId
     * @param expenseId
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getNotesByExpenseId = (tenantId, expenseId, refresh) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await NoteService.getNotesByExpenseId(
                    tenantId,
                    expenseId
                );
                return res.data;
            }),
            currentNotes,
            refresh
        );
    };

    /**
     * Create claim notes
     * @payload { clientId, objectId, notes }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const createClaimNote = () => {
        let res = null;

        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const { clientId, objectId, notes, noteType } = payload;
                try {
                    switch (noteType) {
                        case 'submission':
                            res = await NoteService.createSubmissionNote(
                                clientId,
                                objectId,
                                notes
                            );
                            getNotesBySubmissionId(clientId, objectId, true);
                            break;

                        case 'expense':
                            res = await NoteService.createExpenseNote(
                                clientId,
                                objectId,
                                notes
                            );
                            getNotesByExpenseId(clientId, objectId, true);
                            break;
                    }

                    globalStore.showSuccess(
                        t('notifications.new_note'),
                        t('notifications.note_added')
                    );
                    return res.data;
                } catch (e) {
                    error.value = { field: {} };
                    if (!notes.type)
                        error.value.field.type = t(
                            'notifications.note_type_required'
                        );
                    if (!notes.content)
                        error.value.field.content = t(
                            'notifications.note_content_required'
                        );
                }
            });
        });
    };

    /**
     * Search claim notes
     * @param tenantId
     * @param objectId
     * @param payload
     * @param noteType
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const searchClaimNote = (
        tenantId,
        objectId,
        payload,
        noteType,
        refresh
    ) => {
        let res = null;

        return useResource(
            globalStore.actionWrapper(async () => {
                switch (noteType) {
                    case 'submission':
                        res = await NoteService.searchSubmissionNotes(
                            tenantId,
                            objectId,
                            payload
                        );
                        break;

                    case 'expense':
                        res = await NoteService.searchExpenseNotes(
                            tenantId,
                            objectId,
                            payload
                        );
                        break;
                }

                return res.data;
            }),
            currentNotes,
            refresh
        );
    };

    /**
     * Update claim note
     * @payload { tenantId, noteId, type, objectId, notes }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const updateClaimNote = () => {
        return useMutation(async (payload) => {
            return await globalStore.actionWrapper(async () => {
                const { tenantId, noteId, type, objectId, notes } = payload;

                const res = await NoteService.updateClaimNote(
                    tenantId,
                    noteId,
                    notes
                );

                globalStore.showSuccess(
                    t('notifications.update_note'),
                    t('notifications.note_updated')
                );

                if (type === 'submission') {
                    getNotesBySubmissionId(tenantId, objectId, true);
                } else {
                    getNotesByExpenseId(tenantId, objectId, true);
                }
                return res.data;
            });
        });
    };

    /**
     * Delete claim note
     * @payload { tenantId, noteId, type, objectId }
     * @returns Mutation elements - {loading, mutate, status}
     */
    const deleteClaimNote = () => {
        return useMutation(async (payload) => {
            return await globalStore.actionWrapper(async () => {
                const { tenantId, noteId, type, objectId } = payload;

                const res = await NoteService.deleteClaimNote(tenantId, noteId);

                globalStore.showSuccess(
                    t('notifications.delete_note'),
                    t('notifications.note_deleted')
                );

                if (type === 'submission') {
                    getNotesBySubmissionId(tenantId, objectId, true);
                } else {
                    getNotesByExpenseId(tenantId, objectId, true);
                }
                return res.data;
            });
        });
    };

    return {
        error,
        isLoading,
        notesTypes,
        currentNotes,

        getNotesBySubmissionId,
        getNotesByExpenseId,
        createClaimNote,
        searchClaimNote,
        updateClaimNote,
        deleteClaimNote
    };
});

export const useClaimNoteStore = () => {
    let store = ClaimNoteStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
