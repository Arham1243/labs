import { ref, computed, watch } from 'vue';
import { useDocumentStore, useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import JSZip from 'jszip';

export function useDocumentManagement(props) {
    const documentStore = useDocumentStore();
    const globalStore = useGlobalStore();
    const i18n = useI18n();
    const { t } = i18n;
    const isLoading = ref(false);
    const tree = ref({});
    const all = ref({});
    const showFileViewerDialog = ref(false);
    const fileViewerData = ref(null);
    const downloadProgress = ref(0);
    const isDownloading = ref(false);
    const downloadStatus = ref('');

    const localeList = ref(
        i18n.availableLocales.map((locale) => {
            return {
                id: locale,
                name: t(locale)
            };
        })
    );

    const currentLocale = ref(localeList.value[0]);
    const expandedKeys = ref({});
    const selectedNode = ref(null);
    const selectedNodes = ref({});
    const showNewFolderDialog = ref(false);
    const showNewFileDialog = ref(false);
    const showRenameDocumentDialog = ref(false);
    const showMoveDocumentDialog = ref(false);
    const showBulkMoveDialog = ref(false);
    const deleteDialog = ref(false);
    const duplicateDialog = ref(false);
    const bulkDeleteDialog = ref(false);
    const bulkDownloadDialog = ref(false);
    const isLoadingMoveDocumentDialog = ref(false);
    const isLoadingBulkMoveDialog = ref(false);
    const isLoadingRenameDocumentDialog = ref(false);
    const menu = ref();
    const menuItems = ref([]);
    const bulkActionsMenu = ref(null);
    const pathToIdMap = ref({});

    const clearAllSelections = () => {
        selectedNodes.value = {};
    };

    const bulkActionsMenuItems = computed(() => {
        return [
            {
                label: t('buttons.download'),
                icon: 'pi pi-download',
                command: () => showBulkDownloadDialog()
            },
            {
                label: t('documents.move'),
                icon: 'pi pi-arrows-h',
                command: () => (showBulkMoveDialog.value = true)
            },
            {
                label: t('buttons.delete'),
                icon: 'pi pi-trash',
                command: () => showBulkDeleteDialog()
            }
        ];
    });

    const fetchDocuments = async () => {
        isLoading.value = true;
        try {
            const response = await documentStore.listDocuments(
                props.type,
                props.id,
                currentLocale.value.id
            );
            tree.value = response.data.tree;

            const newPathToIdMap = {};
            response.data.all.forEach((item) => {
                all.value = response.data.all;
                const buildMapFromTree = (nodes) => {
                    if (!nodes) return;
                    nodes.forEach((node) => {
                        if (node.key && node.id) {
                            newPathToIdMap[node.key] = node;
                        }
                        if (node.children) {
                            buildMapFromTree(node.children);
                        }
                    });
                };
                buildMapFromTree(tree.value.all);
                pathToIdMap.value = newPathToIdMap;
            });
        } catch (error) {
            globalStore.showError('Error', 'Failed to fetch documents');
        } finally {
            isLoading.value = false;
        }
    };

    const duplicateDocument = async () => {
        if (!selectedNode.value) return;
        let data = {
            locale: currentLocale.value.id,
            document_id: selectedNode.value.id
        };
        try {
            await documentStore.duplicateDocument(props.type, props.id, data);
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Error', 'Failed to duplicate document');
        }
    };

    const deleteDocument = async () => {
        if (!selectedNode.value) return;
        let data = {
            locale: currentLocale.value.id,
            document_id: selectedNode.value.id
        };
        try {
            await documentStore.deleteDocument(props.type, props.id, data);
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Error', 'Failed to delete document');
        }
    };

    const selectedDocumentsCount = computed(() => {
        return Object.values(selectedNodes.value).filter((node) => node.checked)
            .length;
    });

    const renameDocument = async (data) => {
        isLoadingRenameDocumentDialog.value = true;
        try {
            await documentStore.renameDocument(props.type, props.id, data);
            showRenameDocumentDialog.value = false;
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Error', 'Failed to rename document');
        } finally {
            isLoadingRenameDocumentDialog.value = false;
        }
    };

    const moveDocument = async (data) => {
        isLoadingMoveDocumentDialog.value = true;
        try {
            await documentStore.moveDocument(props.type, props.id, data);
            showMoveDocumentDialog.value = false;
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Error', 'Failed to move document');
        } finally {
            isLoadingMoveDocumentDialog.value = false;
        }
    };

    const moveBulk = async (data) => {
        isLoadingBulkMoveDialog.value = true;
        try {
            await documentStore.moveBulk(props.type, props.id, data);
            showMoveDocumentDialog.value = false;
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Error', 'Failed to move document');
        } finally {
            isLoadingBulkMoveDialog.value = false;
        }
    };

    const pushToTask = (tasks, path) => {
        tasks.push(
            new Promise((resolve) => {
                documentStore
                    .deleteDocument(props.type, props.id, {
                        locale: currentLocale.value.id,
                        path: path
                    })
                    .then(
                        () => {
                            resolve();
                        },
                        () => {
                            resolve();
                        }
                    );
            })
        );
    };

    const checkIsDir = (name) => {
        const arr = name.split('.');
        return arr.length === 1;
    };

    const checkParent = (folders, path) => {
        let haveParent = false;
        folders.forEach((folder) => {
            if (path.includes(folder)) {
                haveParent = true;
            }
        });
        return haveParent;
    };

    const bulkDelete = async () => {
        const selectedKeys = Object.keys(selectedNodes.value).filter(
            (key) => selectedNodes.value[key]?.checked
        );

        if (selectedKeys.length === 0) {
            globalStore.showError('Error', 'No items selected for deletion.');
            return;
        }

        const sortedKeys = [...selectedKeys].sort();
        const topLevelKeys = [];
        for (const key of sortedKeys) {
            const isChildOfSelectedParent = topLevelKeys.some(
                (parentKey) =>
                    key.startsWith(parentKey + '/') && key !== parentKey
            );
            if (!isChildOfSelectedParent) {
                topLevelKeys.push(key);
            }
        }
        const selectedIds = topLevelKeys
            .map((key) => pathToIdMap.value[key]?.id)
            .filter((id) => id);

        if (selectedIds.length === 0) {
            globalStore.showError(
                'Error',
                'Could not resolve any selected items to their IDs.'
            );
            return;
        }

        const data = {
            locale: currentLocale.value.id,
            document_ids: selectedIds
        };

        try {
            await documentStore.deleteMultiple(props.type, props.id, data);
            selectedNodes.value = {};
            await fetchDocuments();
        } catch (error) {
            globalStore.showError('Bulk delete failed:', error);
        } finally {
            bulkDeleteDialog.value = false;
        }
    };

    const bulkDownload = async () => {
        const selectedKeys = Object.entries(selectedNodes.value)
            .filter(([, value]) => value.checked)
            .map(([key]) => key);

        if (selectedKeys.length === 0) {
            globalStore.showError('Error', 'No items selected for download.');
            return;
        }

        // Don't convertb to ZIP single File, download directly
        if (selectedKeys.length === 1) {
            const singleKey = selectedKeys[0];
            const singleNode = findNodeInTree(tree.value.all, singleKey);

            if (singleNode && singleNode.data.size !== 'N/A') {
                selectedNode.value = singleNode;
                downLoadDocument();
                selectedNodes.value = {};
                return;
            }
        }

        isDownloading.value = true;
        downloadProgress.value = 0;
        downloadStatus.value = 'Preparing download...';

        try {
            const zip = new JSZip();
            const addedFiles = new Set();
            const totalItems = selectedKeys.length;
            let processedItems = 0;

            const firstNode = findNodeInTree(tree.value.all, selectedKeys[0]);
            const zipFileName = firstNode
                ? `${firstNode.data.name}.zip`
                : 'bulk_download.zip';

            const addFileToZip = async (filePath, downloadUrl, fileName) => {
                if (addedFiles.has(filePath)) {
                    return;
                }

                downloadStatus.value = `Downloading: ${fileName}`;
                const response = await fetch(downloadUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(filePath, blob);
                    addedFiles.add(filePath);
                }
            };

            for (const key of selectedKeys) {
                downloadStatus.value = `Processing: ${key}`;
                const node = findNodeInTree(tree.value.all, key);
                if (!node) {
                    processedItems++;
                    downloadProgress.value = Math.round(
                        (processedItems / totalItems) * 90
                    );
                    continue;
                }

                if (node.data.size === 'N/A') {
                    // Folder
                    zip.folder(key);

                    const addFolderContents = async (folderNode, basePath) => {
                        if (!folderNode.children) return;

                        for (const child of folderNode.children) {
                            const childPath = `${basePath}/${child.data.name}`;

                            if (child.data.size === 'N/A') {
                                zip.folder(childPath);
                                await addFolderContents(child, childPath);
                            } else if (child.data.info?.download_url) {
                                await addFileToZip(
                                    childPath,
                                    child.data.info.download_url,
                                    child.data.name
                                );
                            }
                        }
                    };

                    await addFolderContents(node, key);
                } else if (node.data.info?.download_url) {
                    // File
                    await addFileToZip(
                        key,
                        node.data.info.download_url,
                        node.data.name
                    );
                }

                processedItems++;
                downloadProgress.value = Math.round(
                    (processedItems / totalItems) * 90
                );
            }

            // Generate ZIP
            downloadStatus.value = 'Generating ZIP file...';
            downloadProgress.value = 95;

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 2 }
            });

            downloadProgress.value = 100;
            downloadStatus.value = 'Download ready!';

            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = zipFileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);

            globalStore.showSuccess(
                'Success',
                'Bulk download ZIP created successfully'
            );
        } catch (error) {
            globalStore.showError(
                'Error',
                'Failed to create bulk download ZIP'
            );
        } finally {
            setTimeout(() => {
                isDownloading.value = false;
                downloadProgress.value = 0;
                downloadStatus.value = '';
            }, 2000);
        }

        selectedNodes.value = {};
    };

    //HELPERS FOR DOWNLOAD

    const findNodeInTree = (nodes, targetKey) => {
        for (const node of nodes) {
            if (node.key === targetKey) return node;
            if (node.children) {
                const found = findNodeInTree(node.children, targetKey);
                if (found) return found;
            }
        }
        return null;
    };

    const onNodeSelect = (node) => {
        const entries = Object.entries(selectedNodes.value);
        let isAttached = false;

        entries.sort().forEach((item) => {
            if (item[0].includes('Attached Benefit Groups')) {
                delete selectedNodes.value['Attached Benefit Groups'];
                isAttached = true;
            }
            if (item[0].includes('Attached Benefits')) {
                delete selectedNodes.value[item[0]];
                isAttached = true;
            }
        });
        if (node.data.is_attached) {
            entries.sort().forEach((item) => {
                if (item[0].includes(node.key)) {
                    delete selectedNodes.value[item[0]];
                    isAttached = true;
                }
            });
        }
        if (isAttached) {
            globalStore.showError(
                'Cannot select.',
                'Cannot select attached documents'
            );
        }
    };

    //Using JSZip Lib to download a folder as a zip
    const downloadFolderAsZip = async () => {
        if (!selectedNode.value || selectedNode.value.data.size !== 'N/A') {
            globalStore.showError('Error', 'Selected node is not a folder');
            return;
        }

        // Initialize progress
        isDownloading.value = true;
        downloadProgress.value = 0;
        downloadStatus.value = `Preparing folder: ${selectedNode.value.data.name}`;

        try {
            const zip = new JSZip();
            const folderName = selectedNode.value.data.name;

            // Count total files for progress calculation
            const countFiles = (node) => {
                let count = 0;
                if (!node.children) return count;

                for (const child of node.children) {
                    if (child.data.size !== 'N/A') {
                        count++; // File
                    } else {
                        count += countFiles(child);
                    }
                }
                return count;
            };

            const totalFiles = countFiles(selectedNode.value);
            let processedFiles = 0;

            downloadStatus.value = `Processing folder: ${folderName} (${totalFiles} files)`;
            downloadProgress.value = 5;

            const addFolderToZip = async (node, currentPath = '') => {
                if (!node.children) return;

                const batchSize = 5;
                const children = [...node.children];

                for (let i = 0; i < children.length; i += batchSize) {
                    const batch = children.slice(i, i + batchSize);

                    const promises = batch.map(async (child) => {
                        const childPath = currentPath
                            ? `${currentPath}/${child.data.name}`
                            : child.data.name;

                        if (child.data.size !== 'N/A') {
                            // File
                            if (child?.data?.info?.download_url) {
                                downloadStatus.value = `Downloading: ${child.data.name}`;

                                const response = await fetch(
                                    child.data.info.download_url
                                );
                                if (!response.ok)
                                    throw new Error(
                                        `Failed to fetch ${childPath}`
                                    );

                                const blob = await response.blob();
                                zip.file(childPath, blob);

                                processedFiles++;
                                downloadProgress.value = Math.round(
                                    (processedFiles / totalFiles) * 90
                                );
                            }
                        } else {
                            // Folder
                            if (childPath) {
                                zip.folder(childPath);
                            }
                            await addFolderToZip(child, childPath);
                        }
                    });
                    await Promise.all(promises);
                }
            };

            await addFolderToZip(selectedNode.value);

            downloadStatus.value = `Generating ZIP: ${folderName}.zip`;
            downloadProgress.value = 95;

            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 2
                }
            });

            downloadProgress.value = 100;
            downloadStatus.value = 'Download ready!';

            // Trigger download
            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${folderName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);

            globalStore.showSuccess('Success', 'Folder downloaded as ZIP');
        } catch (error) {
            globalStore.showError('Error', 'Failed to create ZIP');
        } finally {
            // Reset progress after a short delay
            setTimeout(() => {
                isDownloading.value = false;
                downloadProgress.value = 0;
                downloadStatus.value = '';
            }, 1000);
        }
    };

    const showActions = (event, node) => {
        selectedNode.value = node;

        if (selectedNode.value.data.size !== 'N/A') {
            menuItems.value = [
                {
                    label: t('documents.download_file'),
                    icon: 'pi pi-download',
                    command: () => downLoadDocument()
                },
                {
                    label: t('documents.move'),
                    icon: 'pi pi-arrows-h',
                    command: () => {
                        showMoveDocumentDialog.value = true;
                    }
                },
                {
                    label: t('documents.rename'),
                    icon: 'pi pi-pencil',
                    command: () => {
                        showRenameDocumentDialog.value = true;
                    }
                },
                {
                    label: t('buttons.duplicate'),
                    icon: 'pi pi-copy',
                    command: () => showDuplicateDialog()
                },
                {
                    label: t('buttons.delete'),
                    icon: 'pi pi-trash',
                    command: () => showDeleteDialog()
                }
            ];
        } else {
            menuItems.value = [
                {
                    label: t('documents.download_folder'),
                    icon: 'pi pi-download',
                    command: () => downloadFolderAsZip()
                },
                {
                    label: t('buttons.duplicate'),
                    icon: 'pi pi-copy',
                    command: () => showDuplicateDialog()
                },
                {
                    label: t('documents.rename'),
                    icon: 'pi pi-pencil',
                    command: () => {
                        showRenameDocumentDialog.value = true;
                    }
                },
                {
                    label: t('buttons.delete'),
                    icon: 'pi pi-trash',
                    command: () => showDeleteDialog()
                }
            ];
        }
        menu.value.toggle(event);
        event.stopPropagation();
    };

    const showBulkActionsMenu = (event) => {
        bulkActionsMenu.value.toggle(event);
    };

    const showDeleteDialog = () => {
        deleteDialog.value = true;
    };

    const showDuplicateDialog = () => {
        duplicateDialog.value = true;
    };

    const showBulkDeleteDialog = () => {
        bulkDeleteDialog.value = true;
    };

    const showBulkDownloadDialog = () => {
        bulkDownloadDialog.value = true;
    };

    const confirmNewDocument = () => {
        fetchDocuments();
        showNewFolderDialog.value = false;
        showNewFileDialog.value = false;
    };

    const toggleNodeExpansion = (node) => {
        if (node.data.size === 'N/A') {
            expandedKeys.value[node.key] = !expandedKeys.value[node.key];
        } else {
            selectedNode.value = node;
        }
    };

    const openDocument = async () => {
        if (!selectedNode.value?.data?.info?.download_url) {
            globalStore.showError('Error', 'Download URL not available');
            return;
        }

        try {
            fileViewerData.value = {
                url: selectedNode.value.data.info.download_url,
                name: selectedNode.value.data.name,
                type: getFileExtension(
                    selectedNode.value.data.name
                ).toLowerCase(),
                size: selectedNode.value.data.size
            };

            showFileViewerDialog.value = true;
        } catch (error) {
            globalStore.showError('Error', 'Failed to open the document');
        }
    };

    const downLoadDocument = () => {
        if (!selectedNode.value?.data?.info?.download_url) {
            globalStore.showError('Error', 'Download URL not available');
            return;
        }

        fetch(selectedNode.value.data.info.download_url)
            .then((response) => response.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', selectedNode.value.data.name);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch((error) => {
                globalStore.showError('Error', 'Failed to download the file');
            });
    };

    const calculateFolderInfo = (node) => {
        const totalBytes = calculateTotalFileSize(node);

        if (totalBytes === 0) {
            return 'N/A';
        }

        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(totalBytes) / Math.log(1024));
        return `${(totalBytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    };

    const sizeToBytes = (sizeString) => {
        const units = {
            B: 1,
            KB: 1024,
            MB: 1024 * 1024,
            GB: 1024 * 1024 * 1024,
            TB: 1024 * 1024 * 1024 * 1024
        };

        const match = sizeString
            .toString()
            .match(/^([\d.]+)\s*([KMGTkmgt]?[Bb])/);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();

        for (const [fullUnit, multiplier] of Object.entries(units)) {
            if (fullUnit.includes(unit.charAt(0)) || unit === fullUnit) {
                return value * multiplier;
            }
        }

        return value;
    };

    const calculateTotalFileSize = (node) => {
        if (!node?.children) return 0;

        return node.children.reduce((totalBytes, child) => {
            if (!child?.data) return totalBytes;

            if (child.data.size === 'N/A') {
                return totalBytes + calculateTotalFileSize(child);
            }

            return totalBytes + sizeToBytes(child.data.size);
        }, 0);
    };

    const getIconForFileType = (filename) => {
        if (!filename) return 'pi pi-file';

        const extension = filename.split('.').pop().toLowerCase();

        switch (extension) {
            case 'pdf':
                return 'pi pi-file-pdf';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
                return 'pi pi-image';
            default:
                return 'pi pi-file';
        }
    };

    const getFileExtension = (filename) => {
        if (!filename) return '';
        return filename.split('.').pop().toUpperCase();
    };

    const truncateFileName = (name, length = 30) => {
        return lodash.truncate(name, { length });
    };

    const isAttachedNode = (node) => {
        return (
            node.data?.is_attached ||
            (node.key &&
                (node.key.includes('Attached Benefits') ||
                    node.key.includes('Attached Benefit Groups')))
        );
    };

    const handleCheckboxClick = (event, node) => {
        event.stopPropagation();
        const isCurrentlySelected =
            selectedNodes.value[node.key]?.checked === true;

        const toggleSelection = (currentNode, select) => {
            if (!currentNode) return;
            if (select && !isAttachedNode(currentNode)) {
                selectedNodes.value[currentNode.key] = { checked: true };
            } else if (!select) {
                delete selectedNodes.value[currentNode.key];
            }
            if (currentNode.children && currentNode.children.length > 0) {
                currentNode.children.forEach((child) =>
                    toggleSelection(child, select)
                );
            }
        };
        toggleSelection(node, !isCurrentlySelected);
    };

    return {
        isLoading,
        tree,
        all,
        localeList,
        currentLocale,
        expandedKeys,
        selectedNode,
        selectedNodes,
        menuItems,
        menu,
        bulkActionsMenu,
        showNewFolderDialog,
        showNewFileDialog,
        showRenameDocumentDialog,
        showMoveDocumentDialog,
        showBulkMoveDialog,
        deleteDialog,
        duplicateDialog,
        bulkDeleteDialog,
        selectedDocumentsCount,
        bulkDownloadDialog,
        isLoadingMoveDocumentDialog,
        isLoadingBulkMoveDialog,
        isLoadingRenameDocumentDialog,
        bulkActionsMenuItems,
        showFileViewerDialog,
        fileViewerData,
        downloadProgress,
        isDownloading,
        downloadStatus,
        clearAllSelections,
        handleCheckboxClick,
        isAttachedNode,
        fetchDocuments,
        duplicateDocument,
        deleteDocument,
        renameDocument,
        moveDocument,
        moveBulk,
        bulkDelete,
        bulkDownload,
        showActions,
        showBulkActionsMenu,
        showDeleteDialog,
        showDuplicateDialog,
        showBulkDeleteDialog,
        showBulkDownloadDialog,
        onNodeSelect,
        confirmNewDocument,
        toggleNodeExpansion,
        openDocument,
        downLoadDocument,
        downloadFolderAsZip,
        calculateFolderInfo,
        calculateTotalFileSize,
        getIconForFileType,
        getFileExtension,
        truncateFileName
    };
}
