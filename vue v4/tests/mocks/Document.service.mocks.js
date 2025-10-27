import { vi } from 'vitest';
import * as DocumentService from '@/services/Document.service';

export const listDocumentsMock = () =>
    vi.spyOn(DocumentService, 'listDocuments').mockResolvedValue({
        data: { data: { tree: {} }, meta: { path: '' } }
    });
