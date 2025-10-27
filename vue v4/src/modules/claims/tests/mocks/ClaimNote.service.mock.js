import { vi } from 'vitest';
import * as ClaimNoteService from '@/modules/claims/services/ClaimNote.service';

const getClaimNotes = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        currentClaimNotes: currentClaimNotesMock,
        data: currentClaimNotesMock
    }));

export const currentClaimNotesMock = [
    {
        id: '1738683253933739396',
        user: {
            id: '1736526038729883552',
            name: ''
        },
        content: '<p>aaaaaaa</p>',
        is_pinned: 0,
        attachments: []
    },
    {
        id: '1738683253933738875',
        user: {
            id: '1736526038729883552',
            name: ''
        },
        content: '<p>bbbbbbbb</p>',
        is_pinned: 0,
        attachments: []
    }
];

export const useClaimNoteStoreMock = () => ({
    currentClaims: currentClaimNotesMock,
    getNotesBySubmissionId: getClaimNotes(),
    getNotesByExpenseId: getClaimNotes(),
    createClaimNote: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    })),
    updateClaimNote: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    })),
    deleteClaimNote: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    }))
});

export const userMock = {
    id: '1737477088384577800',
    name: 'John Max',
    first_name: 'John',
    last_name: 'Max',
    email: 'john@max.me',
    username: 'john@max.me'
};
