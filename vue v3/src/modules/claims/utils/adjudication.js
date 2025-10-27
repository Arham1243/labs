export const enum_operators = {
    equal: 'Equal to',
    not_equal: 'Not equal to',
    greater: 'Greater than',
    less: 'Less than',
    in: 'Equal to',
    not_in: 'Not equal to'
    // contains: 'Contains'
};

// export const enum_fields = {
//     plan: 'Plan',
//     group: 'Service code group',
//     benefit: 'Benefit',
//     diagnosis: 'Diagnosis',
//     amount: 'Submission Amount'
// };

export const enum_fields = {
    plan_id: 'Plan',
    benefit_id: 'Benefit',
    amount_claimed: 'Submission Amount',
    source: 'Submission Source'
    // service_code_id: 'Service code group',
    // diagnosis: 'Diagnosis',
};

export const cfg_adjudication = [
    {
        title: 'Enter Details',
        path: 'details',
        btnLabel: 'Save & Continue',
        fields: [
            {
                label: 'Title',
                type: 'InputText',
                required: true,
                props: {
                    name: 'name'
                }
            },
            {
                label: 'Description',
                type: 'InputText',
                props: {
                    name: 'description'
                }
            },
            {
                label: 'Effective Date',
                type: 'Calendar',
                class: 'col-6',
                required: true,
                props: {
                    name: 'start_at',
                    minDate: new Date()
                }
            },
            {
                label: 'End Date',
                type: 'Calendar',
                class: 'col-6',
                props: {
                    name: 'end_at',
                    minDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            }
        ]
    },
    {
        title: 'Rules',
        path: 'rules',
        btnLabel: 'Continue',
        fields: [
            {
                type: 'Dropdown',
                class: 'col-4',
                required: true,
                props: {
                    name: 'field',
                    optionLabel: 'name',
                    optionValue: 'value',
                    placeholder: 'Select',
                    options: Object.entries(enum_fields).map(
                        ([key, value]) => ({
                            name: value,
                            value: key
                        })
                    )
                }
            },
            {
                type: 'Dropdown',
                class: 'col-3',
                required: true,
                props: {
                    name: 'operator',
                    optionLabel: 'name',
                    optionValue: 'value',
                    options: Object.entries(enum_operators).map(
                        ([key, value]) => ({
                            name: value,
                            value: key
                        })
                    )
                }
            },
            {
                type: 'MultiSelect',
                class: 'col-5',
                depends_on: 'field',
                depends_value: 'plan_id',
                props: {
                    name: 'value',
                    optionLabel: 'name',
                    optionValue: 'id',
                    maxSelectedLabels: 3,
                    filter: true,
                    options: []
                }
            },
            {
                type: 'InputNumber',
                class: 'col-5',
                depends_on: 'field',
                depends_value: 'amount_claimed',
                required: true,
                props: {
                    name: 'value',
                    prefix: '$ ',
                    min: 0,
                    maxFractionDigits: 2,
                    validate: 'costDecimal'
                }
            },
            {
                type: 'MultiSelect',
                class: 'col-5',
                depends_on: 'field',
                depends_value: 'benefit_id',
                required: true,
                props: {
                    name: 'value',
                    optionLabel: 'name',
                    optionValue: 'id',
                    maxSelectedLabels: 3,
                    filter: true,
                    options: []
                }
            },
            {
                type: 'MultiSelect',
                class: 'col-5',
                depends_on: 'field',
                depends_value: 'source',
                required: true,
                props: {
                    name: 'value',
                    optionLabel: 'name',
                    optionValue: 'id',
                    maxSelectedLabels: 3,
                    filter: true,
                    options: []
                }
            }
        ]
    },
    {
        title: 'Review',
        path: 'review',
        btnLabel: 'Publish',
        btnIcon: 'pi pi-check'
    }
];

export const cfg_adjudication_dialog = [
    {
        label: 'Reason',
        type: 'Textarea',
        required: true,
        props: {
            name: 'reason'
        },
        class: 'pt-0'
    }
];

export const createDialogConfig = (t) => {
    const auditedConfig = () => ({
        title: t('adjudication.confirm_assessment'),
        content: t('adjudication.confirm_assessment_content'),
        buttonText: t('buttons.confirm'),
        buttonStyle: 'primary',
        reason: false
    });

    return {
        active: (queue) => ({
            title: t('adjudication.active_adjudication_queue'),
            content: t('adjudication.active_adjudication_queue_content', {
                queueName: `<strong>${queue.name}</strong>`
            }),
            buttonText: t('adjudication.button_activate'),
            buttonStyle: 'success',
            reason: false
        }),
        inactive: (queue) => ({
            title: t('adjudication.inactive_adjudication_queue'),
            content: t('adjudication.inactive_adjudication_queue_content', {
                queueName: `<strong>${queue.name}</strong>`
            }),
            buttonText: t('adjudication.button_deactivate'),
            buttonStyle: 'danger',
            reason: true
        }),
        delete: (queue) => ({
            title: t('adjudication.delete_adjudication_queue'),
            content: t('adjudication.delete_adjudication_queue_content', {
                queueName: `<strong>${queue.name}</strong>`
            }),
            buttonText: t('buttons.delete'),
            buttonStyle: 'danger',
            reason: false
        }),
        audited_declined: auditedConfig,
        audited_completed: auditedConfig
    };
};

export const errorCounts = (stepIndex = 1, formData) => {
    if (stepIndex < 0 || stepIndex > 2) return;
    let fields = cfg_adjudication[stepIndex].fields;
    return fields.filter(
        (field) => field.required && formData[field.props.name] === ''
    );
};
