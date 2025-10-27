import { communicationSource, documentType, taskPriority } from '@/config';

export const activityDisplayMode = [
    { label: 'One-Column', value: 'one-column', icon: 'pi pi-list' },
    { label: 'Two-Column', value: 'two-column', icon: 'pi pi-inbox' }
];

export const activityTypes = [
    { label: 'All', value: 'All' },
    { label: 'Notes', value: 'Notes' },
    { label: 'Communications', value: 'Communications' },
    { label: 'Documents', value: 'Documents' },
    { label: 'Tasks', value: 'Tasks' }
];

export const createActivityPayload = (feedable, module, moduleId) => {
    const typeKey = `${feedable}able_type`;
    const typeId = `${feedable}able_id`;

    return {
        [typeKey]: module,
        [typeId]: moduleId
    };
};

export const createActivityDropdownOptions = (t) => ({
    note: () => [
        {
            label: t('documents.move'),
            icon: 'pi pi-arrow-right',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('activities.create_task_from_activity'),
            icon: 'pi pi-check-square',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => {
                /* empty */
            }
        }
    ],

    task: () => [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => {
                /* empty */
            }
        }
    ],

    communication: () => [
        {
            label: t('documents.move'),
            icon: 'pi pi-arrow-right',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('activities.create_task_from_activity'),
            icon: 'pi pi-check-square',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => {
                /* empty */
            }
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => {
                /* empty */
            }
        }
    ]
});

export const createActivityConfirmationDialog = (t) => ({
    delete: (title) => ({
        message: t('activities.are_you_sure_delete_activity', { name: title }),
        header: t('activities.delete_header', { name: title }),
        rejectClass: 'p-button-secondary p-button-link',
        rejectLabel: t('buttons.cancel'),
        acceptLabel: t('buttons.delete'),
        acceptClass: 'p-button-danger'
    })
});

export const createActivitiesDialogTitle = (t, helpers) => ({
    note: (module) => ({
        title: t('activities.new_note', {
            module: helpers.capitalizeWords(module)
        }),
        icon: 'pi pi-book',
        icon_background: '#d1f7d1',
        icon_color: '#22c55e'
    }),

    communication: (module) => ({
        title: t('activities.new_communication', {
            module: helpers.capitalizeWords(module)
        }),
        icon: 'pi pi-comments',
        icon_background: '#D0E1FD',
        icon_color: '#00205B'
    }),

    document: (module) => ({
        title: t('activities.new_document', {
            module: helpers.capitalizeWords(module)
        }),
        icon: 'pi pi-paperclip',
        icon_background: '#FFD0CE',
        icon_color: '#E56A54'
    }),

    task: (module) => ({
        title: t('activities.new_task', {
            module: helpers.capitalizeWords(module)
        }),
        icon: 'pi pi-check-square',
        icon_background: '#DADAFC',
        icon_color: '#7474C1'
    }),

    template: () => ({
        title: t('activities.new_template'),
        icon: 'pi pi-book',
        icon_background: '#d1f7d1',
        icon_color: '#22c55e'
    })
});

export const createActivitiesDialogContent = (
    t,
    { users, loadingUsers } = {}
) => ({
    note: () => [
        {
            label: t('common.template'),
            type: 'Dropdown',
            placeholder: t('activities.choose_template'),
            props: {
                name: 'template',
                optionLabel: 'name',
                optionValue: 'value',
                options: []
            },
            additional: {
                label: t('activities.add_new_template'),
                icon: 'pi pi-plus'
            }
        },
        {
            label: t('common.title'),
            type: 'InputText',
            required: true,
            props: {
                name: 'title'
            },
            hidden: false
        },
        {
            type: 'editor',
            props: {
                name: 'content',
                maxLength: 10,
                validate: 'richEditorText'
            }
        },
        {
            label: t('activities.attach_a_file'),
            type: 'file',
            props: {
                name: 'attachment'
            }
        }
    ],

    communication: () => [
        {
            label: t('common.template'),
            type: 'Dropdown',
            placeholder: t('activities.choose_template'),
            props: {
                name: 'template',
                optionLabel: 'name',
                optionValue: 'value',
                options: []
            },
            additional: {
                label: t('activities.add_new_template'),
                icon: 'pi pi-plus'
            }
        },
        {
            label: t('common.title'),
            type: 'InputText',
            required: true,
            props: {
                name: 'title'
            }
        },
        {
            label: t('activities.communication_source'),
            type: 'Dropdown',
            placeholder: t('activities.choose_communication_source'),
            required: true,
            props: {
                name: 'communication_source',
                optionLabel: 'name',
                optionValue: 'value',
                options: Object.entries(communicationSource).map(
                    ([key, value]) => ({
                        name: value,
                        value: key
                    })
                )
            }
        },
        {
            type: 'editor',
            props: {
                name: 'content',
                maxLength: 10,
                validate: 'richEditorText'
            }
        },
        {
            label: t('activities.attach_a_file'),
            type: 'file',
            props: {
                name: 'attachment'
            }
        }
    ],

    document: () => [
        {
            label: t('common.title'),
            type: 'InputText',
            required: true,
            props: {
                name: 'title'
            }
        },
        {
            type: 'editor',
            props: {
                name: 'content'
            }
        },
        {
            label: t('activities.attach_a_file'),
            type: 'file',
            props: {
                name: 'attachment'
            }
        },
        {
            label: t('activities.document_type'),
            type: 'Dropdown',
            required: true,
            props: {
                name: 'document_type',
                optionLabel: 'name',
                optionValue: 'value',
                options: Object.entries(documentType).map(([key, value]) => ({
                    name: value,
                    value: key
                }))
            }
        }
    ],

    task: () => [
        {
            label: t('common.template'),
            type: 'Dropdown',
            placeholder: t('activities.choose_template'),
            props: {
                name: 'template',
                optionLabel: 'name',
                optionValue: 'value',
                options: []
            },
            additional: {
                label: t('activities.add_new_template'),
                icon: 'pi pi-plus'
            }
        },
        {
            label: t('common.title'),
            type: 'InputText',
            required: true,
            props: {
                name: 'title'
            }
        },
        {
            type: 'editor',
            props: {
                name: 'content'
            }
        },
        {
            label: t('activities.assigned_to'),
            type: 'ApiDropdown',
            class: 'col-12',
            required: true,
            placeholder: t('activities.select_assigned_user'),
            props: {
                name: 'assigned_to_user_id',
                optionLabel: 'name',
                optionValue: 'id',
                items: users?.value || [],
                loading: loadingUsers?.value || false,
                class: 'w-full',
                fetchItems: async (searchTerm) => {
                    /* empty */
                }
            }
        },
        {
            label: t('activities.due_date'),
            type: 'Calendar',
            class: 'col-6 pr-2',
            required: true,
            props: {
                name: 'due_date',
                placeholder: t('activities.select_due_date'),
                minDate: new Date()
            }
        },
        {
            label: t('activities.priority'),
            type: 'Dropdown',
            class: 'col-6 pl-2',
            required: true,
            placeholder: t('activities.select_priority'),
            props: {
                name: 'priority',
                optionLabel: 'name',
                optionValue: 'value',
                options: Object.entries(taskPriority).map(([key, value]) => ({
                    name: t(value),
                    value: key
                }))
            }
        }
    ],

    template: () => [
        {
            label: t('common.title'),
            type: 'InputText',
            required: true,
            props: {
                name: 'title'
            }
        },
        {
            type: 'editor',
            props: {
                name: 'content',
                validate: 'richEditorText'
            }
        }
    ]
});
