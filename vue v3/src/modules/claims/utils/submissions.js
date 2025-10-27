export const cfg = {
    terms: {
        title: 'Terms',
        description:
            'Please review and agree to the following terms before proceeding',
        fields: [
            {
                description:
                    '<p>1. YOUR AGREEMENT</p><p>By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use this site.</p><p>PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time. Unless otherwise indicated, amendments will become effective immediately. Please review these Terms and Conditions periodically. Your continued use of the Site following the posting of changes and/or modifications will constitute your acceptance of the revised Terms and Conditions and the reasonableness of these standards for notice of changes. For your information, this page was last updated as of the date at the top of these terms and conditions.</p><p>2. PRIVACY</p><p>Please review our Privacy Policy, which also governs your visit to this Site, to understand our practices.</p><p>3. LINKED SITES</p><p>This Site may contain links to other independent third-party Web sites ("Linked Sites”). These Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under our control, and we are not responsible for and does not endorse the content of such Linked Sites, including any information or materials contained on such Linked Sites. You will need to make your own independent judgment regarding your interaction with these Linked Sites.</p><p>12. GENERAL</p><p>A. If any provision of these Terms and Conditions is held to be invalid or unenforceable, the provision shall be removed (or interpreted, if possible, in a manner as to be enforceable), and the remaining provisions shall be enforced. Headings are for reference purposes only and in no way define, limit, construe or describe the scope or extent of such section. Our failure to act with respect to a breach by you or others does not waive our right to act with respect to subsequent or similar breaches. These Terms and Conditions set forth the entire understanding and agreement between us with respect to the subject contained herein and supersede any other agreement, proposals and communications, written or oral, between our representatives and you with respect to the subject hereof, including any terms and conditions on any of customer\'s documents or purchase orders.</p><p>B. No Joint Venture, No Derogation of Rights. You agree that no joint venture, partnership, employment, or agency relationship exists between you and us as a result of these Terms and Conditions or your use of the Site. Our performance of these Terms and Conditions is subject to existing laws and legal process, and nothing contained herein is in derogation of our right to comply with governmental, court and law enforcement requests or requirements relating to your use of the Site or information provided to or gathered by us with respect to such use.</p>',
                label: 'I agree to the terms of the above declaration',
                type: 'Checkbox',
                name: 'claim_terms_agreement',
                value: true,
                validation_rules: { required: true }
            }
        ]
    },
    policy_holder_details: {
        title: 'Policy Holder Details',
        description:
            'Please confirm that the following policy holder contact details are correct',
        fields: [
            {
                label: 'Primary Email *',
                type: 'InputText',
                props: {
                    name: 'primary_email',
                    id: 'primary_email',
                    disabled: true
                }
            },
            {
                label: 'Secondary Email',
                type: 'InputText',
                props: {
                    name: 'secondary_email',
                    disabled: true
                }
            },
            {
                label: 'Phone #',
                type: 'InputField',
                props: {
                    name: 'phone_number',
                    variant: 'phone',
                    disabled: true
                }
            },
            // {
            //     label: 'Phone ##',
            //     type: 'InputMask',
            //     props: {
            //         name: 'phone_number',
            //         variant: 'phone',
            //         disabled: true,
            //         mask: "(999) 999-9999"
            //     }
            // },
            {
                label: 'Street Address Line 1',
                type: 'InputText',
                props: {
                    name: 'address'
                }
            },
            {
                label: 'Street Address Line 2',
                type: 'InputText',
                props: {
                    name: 'address_2'
                }
            },
            {
                label: 'City',
                type: 'InputText',
                class: 'col-6',
                props: {
                    name: 'city'
                }
            },
            {
                label: 'Postal / Zip Code',
                type: 'InputText',
                class: 'col-6',
                props: {
                    name: 'postal_code'
                }
            },
            {
                label: 'Country',
                type: 'ApiDropdown',
                class: 'col-6',
                props: {
                    name: 'country',
                    optionLabel: 'name',
                    items: []
                }
            },
            {
                label: 'Province',
                type: 'ApiDropdown',
                class: 'col-6',
                props: {
                    name: 'province',
                    optionLabel: 'name',
                    items: []
                }
            },
            {
                label: 'Are you submitting a claim for services provided in a hospital in British Columbia?',
                description: '',
                type: 'RadioGroup',
                props: {
                    name: 'bc_study_permit_confirm_hospital',
                    value: '0',
                    options: [
                        {
                            value: 'bc_study_permit_yes',
                            label: 'Yes'
                        },
                        {
                            value: 'bc_study_permit_no',
                            label: 'No'
                        }
                    ]
                }
            },
            {
                label: 'Does the policy holder have a study/work permit?',
                type: 'RadioGroup',
                props: {
                    name: 'bc_study_permit_confirm_permit',
                    value: '0',
                    options: [
                        {
                            value: 'bc_study_permit_confirm_permit_yes',
                            label: 'Yes'
                        },
                        {
                            value: 'bc_study_permit_confirm_permit_no',
                            label: 'No'
                        }
                    ]
                }
            },
            {
                label: 'Attach Study Permit',
                type: 'FileUpload',
                props: {
                    name: 'bc_student_study_permit',
                    id: 'bc_student_study_permit',
                    value: 'bc_student_study_permit'
                }
            }
        ]
    },
    claims_process: {
        title: 'Submit Claim Process',
        description: 'Submit a claim',
        claimSteps: [
            {
                title: 'Claim Type',
                description: 'Claim Type',
                path: 'type',
                fields: [
                    {
                        label: 'What type of claim are you submitting today?',
                        description: '',
                        type: 'RadioGroup',
                        props: {
                            name: 'claim_type',
                            value: '0',
                            options: [
                                {
                                    value: 'personal_medical_claim',
                                    label: 'Personal Medical Claim'
                                },
                                {
                                    value: 'work_related_injury',
                                    label: 'Work-Related Injury'
                                },
                                {
                                    value: 'car_accident',
                                    label: 'Car Accident'
                                },
                                {
                                    value: 'travel_benefits',
                                    label: 'Travel Benefits'
                                }
                            ]
                        },
                        condition: {
                            work_related_injury: {
                                title: 'Work-Related Injury',
                                fields: [
                                    {
                                        label: 'Have you submitted your claim to the Workers Compensation Board (WSIB/WCB/WorkSafe)?',
                                        type: 'RadioGroup',
                                        props: {
                                            name: 'work_related_injury_type',
                                            value: '0',
                                            options: [
                                                {
                                                    value: 'work_related_injury_yes',
                                                    label: 'Yes'
                                                },
                                                {
                                                    value: 'work_related_injury_no',
                                                    label: 'No'
                                                }
                                            ]
                                        },
                                        condition: {
                                            work_related_injury_yes: {
                                                description:
                                                    'Please upload the explanation of benefits (EOB) from the Workers Compensation Board',
                                                infoText:
                                                    'An explanation of benefits (EOB) is a statement that includes details about a medical insurance claim that explains what portion of the expenses has been paid and to whom. This is generated and sent once it has been fully adjudicated or processed',
                                                fields: [
                                                    {
                                                        label: '',
                                                        type: 'FileUpload',
                                                        props: {
                                                            name: 'work_related_injury_attachment',
                                                            id: 'work_related_injury_attachment',
                                                            value: 'work_related_injury_attachment'
                                                        }
                                                    }
                                                ]
                                            },
                                            work_related_injury_no: {
                                                description:
                                                    'Work-related injuries must be reported to your employer and submitted to the Workers Compensation Board (WSIB/WCB/WorkSafe) for assessment. Once the explanation of benefits is received, you can submit a claim for the remaining balance to guard.me for assessment.'
                                            }
                                        }
                                    }
                                ]
                            },
                            car_accident: {
                                title: 'Car Accident',
                                fields: [
                                    {
                                        label: 'Have you submitted your claim to the auto insurance company?',
                                        type: 'RadioGroup',
                                        props: {
                                            name: 'car_accident_type',
                                            value: '0',
                                            options: [
                                                {
                                                    value: 'car_accident_yes',
                                                    label: 'Yes'
                                                },
                                                {
                                                    value: 'car_accident_no',
                                                    label: 'No'
                                                }
                                            ]
                                        },
                                        condition: {
                                            car_accident_yes: {
                                                description:
                                                    'Please upload the explanation of benefits (EOB) received from the auto insurance company.',
                                                infoText:
                                                    'An explanation of benefits (EOB) is a statement that includes details about a medical insurance claim that explains what portion of the expenses has been paid and to whom. This is generated and sent once it has been fully adjudicated or processed.',
                                                fields: [
                                                    {
                                                        label: '',
                                                        type: 'FileUpload',
                                                        props: {
                                                            name: 'car_accident_attachment',
                                                            id: 'car_accident_attachment',
                                                            value: 'car_accident_attachment'
                                                        }
                                                    }
                                                ]
                                            },
                                            car_accident_no: {
                                                description:
                                                    'Motor vehicle accident injuries must be reported to the auto insurance company for assessment. Once the explanation of benefits is received, you can submit a claim for the remaining balance to guard.me for assessment.'
                                            }
                                        }
                                    }
                                ]
                            },
                            travel_benefits: {
                                title: 'Travel Benefits',
                                description:
                                    '<p>If your claim is related to a Travel Benefit please proceed as described.</p>' +
                                    '<p>Please download and fill the applicable form below:</p>' +
                                    '<p><a href="https://www.oldrepubliccanada.com/Claims/" target="_blank" rel="noopener noreferrer" alt="Link to Old Republic website"><u>Choose the reason you are filing a claim (oldrepubliccanada.com)</u></a> <br />' +
                                    'and submit with supporting documents to:</p>' +
                                    '<p>Mail: Old Republic Insurance Company of Canada<br />' +
                                    'Box 557, 100 King Street West<br />' +
                                    'Hamilton, ON L8N 3K9</p>' +
                                    '<p>Fax: 1-905-528-8338 or 1-888-551-1704</p>'
                            }
                        }
                    }
                ]
            },
            {
                title: 'Claim Detail',
                description: 'Indicate the type of service that was received',
                path: 'details',
                fields: [
                    {
                        label: 'Medical Service Type',
                        type: 'Dropdown',
                        required: true,
                        props: {
                            name: 'medical_service_type',
                            id: 'medical_service_type',
                            optionLabel: 'name',
                            placeholder: 'Select Service Type',
                            options: []
                        }
                    },
                    {
                        label: 'Service Code',
                        type: 'Dropdown',
                        props: {
                            name: 'service_code',
                            optionLabel: 'code',
                            placeholder: 'Select Service Code',
                            options: []
                        },
                        depends_on: 'medical_service_type'
                    },
                    {
                        label: 'Service Date',
                        type: 'Calendar',
                        required: true,
                        class: 'col-5',
                        props: {
                            name: 'service_date',
                            placeholder: 'Enter Service Date',
                            value: '2022-09-30',
                            maxDate: new Date(),
                            dateFormat: 'dd-M-yy'
                        }
                        // infoText:
                        //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
                    },
                    {
                        label: 'Total Cost',
                        type: 'InputNumber',
                        class: 'col-9',
                        required: true,
                        props: {
                            name: 'visit_cost',
                            value: '',
                            prefix: '$ ',
                            maxFractionDigits: 2,
                            validate: 'costDecimal'
                        }
                    },
                    {
                        label: 'Currency',
                        type: 'Dropdown',
                        class: 'col-3',
                        required: true,
                        props: {
                            name: 'receipt_currency',
                            optionLabel: 'name',
                            filter: true,
                            options: []
                            // value: 'CAD'
                        }
                    },
                    {
                        label: 'Additional Details',
                        type: 'Textarea',
                        required: true,
                        props: {
                            name: 'additional_details',
                            autoResize: true,
                            rows: '4',
                            maxLength: 150,
                            validate: 'descriptionText'
                        }
                    },
                    {
                        label: 'Attach invoice(s) and/or receipt(s)',
                        type: 'FileUpload',
                        // required: true,
                        props: {
                            name: 'service-receipt_attachment[]',
                            multiple: true,
                            accept: '.pdf,.jpg,.jpeg,.png,.gif',
                            url: ''
                            // maxSize: 5000000,
                            // maxFiles: 7,
                        }
                    },
                    {
                        label: 'Attach relevant medical records (if available)',
                        type: 'FileUpload',
                        props: {
                            name: 'service-medical_records_attachment[]',
                            multiple: true,
                            url: '',
                            accept: '.pdf,.jpg,.jpeg,.png,.gif'
                        }
                    },
                    {
                        label: 'Do you have any other insurance plan that covers this expense?',
                        type: 'RadioGroup',
                        required: true,
                        props: {
                            name: 'other_insurance_plan',
                            // value: '',
                            options: [
                                {
                                    value: 'other_insurance_plan_yes',
                                    label: 'Yes'
                                },
                                {
                                    value: 'other_insurance_plan_no',
                                    label: 'No'
                                }
                            ]
                        },
                        condition: {
                            other_insurance_plan_yes: {
                                fields: [
                                    {
                                        label: 'Secondary Insurance Provider',
                                        type: 'InputText',
                                        required: true,
                                        props: {
                                            name: 'secondary_insurance_provider',
                                            placeholder:
                                                'Enter Secondary Insurance',
                                            validate: 'clName'
                                        }
                                    },
                                    {
                                        label: 'Policy or Certificate Number',
                                        type: 'InputText',
                                        required: true,
                                        props: {
                                            name: 'policy_or_certificate_number',
                                            placeholder:
                                                'Enter Policy/Certificate Number'
                                        }
                                    },
                                    {
                                        label: 'Group Number',
                                        type: 'InputText',
                                        props: {
                                            name: 'group_number',
                                            placeholder: 'Enter Group Number'
                                        }
                                    },
                                    {
                                        label: 'Other Insurance Details',
                                        type: 'Textarea',
                                        infoText: '',
                                        props: {
                                            name: 'other_insurance_details',
                                            // value: '',
                                            autoResize: true,
                                            rows: '4',
                                            maxLength: 150,
                                            placeholder:
                                                'Enter Other Insurance Details.',
                                            validate: 'descriptionText'
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ]
            },
            {
                title: 'Select Payee',
                description: 'Has the service already been paid?',
                path: 'payee',
                fields: [
                    {
                        label: 'Has the service already been paid for?',
                        description: '',
                        type: 'RadioGroup',
                        required: true,
                        props: {
                            name: 'payee_select',
                            value: '0',
                            options: [
                                {
                                    value: 'payee_select_yes',
                                    label: 'Yes, the services have been paid to'
                                },
                                {
                                    value: 'payee_select_no',
                                    label: 'No, the service provider is awaiting payment.'
                                }
                            ]
                        },
                        condition: {
                            payee_select_yes: {
                                fields: [
                                    {
                                        label: 'Who paid for the service?',
                                        description: '',
                                        type: 'RadioGroup',
                                        props: {
                                            name: 'payee_select_who_type',
                                            value: '0',
                                            options: [
                                                {
                                                    value: 'policy_holder',
                                                    label: 'Me (Policy Holder)'
                                                },
                                                {
                                                    value: 'payee_select_other',
                                                    label: 'Someone else'
                                                }
                                            ]
                                        }
                                    }
                                ],
                                condition: {
                                    payee_select_other: {
                                        title: 'Contact Details for the Individual Being Reimbursed',
                                        fields: [
                                            {
                                                label: 'First Name',
                                                type: 'InputText',
                                                props: {
                                                    name: 'payee_other_first_name'
                                                }
                                            },
                                            {
                                                label: 'Last Name',
                                                type: 'InputText',
                                                props: {
                                                    name: 'payee_other_last_name'
                                                }
                                            },
                                            {
                                                label: 'Email',
                                                type: 'InputText',
                                                props: {
                                                    name: 'payee_other_email',
                                                    placeholder: 'Type Email',
                                                    readonly: false
                                                }
                                            },
                                            {
                                                label: 'Phone',
                                                type: 'InputField',
                                                props: {
                                                    name: 'payee_other_phone',
                                                    variant: 'phone',
                                                    placeholder:
                                                        'Type Phone Number'
                                                }
                                            },
                                            {
                                                label: 'Street Address Line 1',
                                                type: 'InputText',
                                                props: {
                                                    name: 'payee_other_street_address_line1',
                                                    placeholder:
                                                        'Street Address Line 1',
                                                    readonly: false
                                                }
                                            },
                                            {
                                                label: 'Street Address Line 2',
                                                type: 'InputText',
                                                props: {
                                                    name: 'payee_other_street_address_line2',
                                                    placeholder:
                                                        'Street Address Line 2',
                                                    readonly: false
                                                }
                                            },
                                            {
                                                label: 'City',
                                                type: 'InputText',
                                                class: 'col-6',
                                                props: {
                                                    name: 'payee_other_city',
                                                    placeholder: 'Enter City',
                                                    readonly: false
                                                }
                                            },
                                            {
                                                label: 'Postal / Zip Code',
                                                type: 'InputText',
                                                class: 'col-6',
                                                props: {
                                                    name: 'payee_other_postal_code',
                                                    placeholder:
                                                        'Enter Postal Code'
                                                }
                                            },
                                            {
                                                label: 'Country',
                                                type: 'ApiDropdown',
                                                class: 'col-6',
                                                props: {
                                                    name: 'payee_other_country',
                                                    optionLabel: 'name',
                                                    items: []
                                                }
                                            },
                                            {
                                                label: 'Province',
                                                type: 'ApiDropdown',
                                                class: 'col-6',
                                                props: {
                                                    name: 'payee_other_province',
                                                    optionLabel: 'name',
                                                    items: []
                                                }
                                            }
                                        ]
                                    }
                                }
                            },
                            payee_select_no: {
                                description:
                                    "If the service provider still requires payment, a cheque for the total cost will be sent to the address listed on the service provider's invoice."
                            }
                        }
                    }
                ]
            },
            {
                title: 'Payee Details',
                page_title: 'Payee Details',
                description: 'Select a reimbursement method',
                path: 'payee_details',
                fields: [
                    {
                        label: 'What type of claim are you submitting today?',
                        description: '',
                        type: 'RadioGroup',
                        props: {
                            name: 'payment_method_type',
                            value: '0',
                            options: [
                                {
                                    value: 'direct_deposit',
                                    label: 'Direct Deposit',
                                    info: ''
                                },
                                {
                                    value: 'cheque',
                                    label: 'Cheque'
                                },
                                {
                                    value: 'wire_transfer',
                                    label: 'Wire Transfer (For Addresses Outside of Canada)'
                                },
                                {
                                    value: 'claims_reimbursement_card',
                                    label: 'Claims Reimbursement Card',
                                    info: ''
                                }
                            ]
                        },
                        condition: {
                            direct_deposit: {
                                title: 'Contact Details for the Individual Being Reimbursed',
                                fields: [
                                    {
                                        label: 'Account Name',
                                        type: 'InputText',
                                        props: {
                                            name: 'dd_account_name'
                                        }
                                    },
                                    {
                                        label: 'Account Email',
                                        type: 'InputText',
                                        props: {
                                            name: 'dd_account_email',
                                            placeholder: 'Type Email'
                                        }
                                    },
                                    {
                                        label: 'Branch No.(5 digits)',
                                        type: 'InputText',
                                        infoText:
                                            "Lorem Ipsum is simply dummy text of the printing and          typesetting          industry. Lorem Ipsum has been the industry's standard dummy          text ever since the 1500s,",
                                        props: {
                                            name: 'dd_branch_no',
                                            maxLength: 5,
                                            minLength: 5
                                        },
                                        validation_rules: {
                                            required: true,
                                            format: 'number',
                                            maxlength: 5,
                                            minlength: 5
                                        }
                                    },
                                    {
                                        label: 'Institution No. (3 digits)',
                                        type: 'InputText',
                                        infoText:
                                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy          text ever since the 1500s,",
                                        props: {
                                            name: 'dd_institution_no',
                                            maxLength: 3,
                                            minLength: 3
                                        },
                                        validation_rules: {
                                            required: true,
                                            format: 'number',
                                            maxlength: 3,
                                            minlength: 3
                                        }
                                    },
                                    {
                                        label: 'Account No. (as shown on your cheque, 12 digits maximum) ',
                                        type: 'InputText',
                                        infoText:
                                            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy          text ever since the 1500s,",
                                        props: {
                                            name: 'dd_account_no'
                                        },
                                        validation_rules: {
                                            required: true,
                                            format: 'number'
                                        }
                                    },
                                    {
                                        label: 'Attach Void Cheque or Direct Deposit Form',
                                        type: 'FileUpload',
                                        props: {
                                            name: 'dd_void_cheque_attachment',
                                            maxFileSize: 4000000
                                        }
                                    }
                                ]
                            },

                            cheque: {
                                title: 'The cheque will be sent to the following address:',
                                description:
                                    'If you will <b>not</b> be living at this address within the next <b>4 weeks</b>, please select another payment method.'
                            },

                            wire_transfer: {
                                title: 'Account Holder Details',
                                fields: [
                                    {
                                        label: 'Account Holder Name',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_account_holder_name'
                                        }
                                    },
                                    {
                                        label: 'Account Holder Email',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_account_holder_email',
                                            placeholder: 'Type Email'
                                        }
                                    },
                                    {
                                        label: 'Tax ID Number (Mexico, Brazil, & Latin America)',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_tax_id_number',
                                            placeholder: 'Enter Email',
                                            minlength: 11,
                                            maxlength: 11
                                        }
                                    },
                                    {
                                        label: 'Account Holder Phone Number',
                                        type: 'InputField',
                                        props: {
                                            name: 'wt_account_holder_phone',
                                            variant: 'phone',
                                            placeholder: 'Enter Phone Number',
                                            mask: '(###) ###-####'
                                        }
                                    },
                                    {
                                        label: 'Street Address Line 1',
                                        type: 'InputText',
                                        // type: 'CanadaPostAutoComplete',
                                        props: {
                                            name: 'wt_street_address_line1',
                                            placeholder: 'Street Address Line 1'
                                        }
                                    },
                                    {
                                        label: 'Street Address Line 2',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_street_address_line2',
                                            placeholder: 'Street Address Line 2'
                                        }
                                    },
                                    {
                                        label: 'City',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_city',
                                            placeholder: 'Enter City'
                                        }
                                    },
                                    {
                                        label: 'Postal / Zip Code',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_postal_code',
                                            placeholder: 'Enter Postal Code'
                                        }
                                    },
                                    {
                                        label: 'Country',
                                        type: 'ApiDropdown',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_country',
                                            optionLabel: 'name',
                                            items: []
                                            // value: 'Canada'
                                        }
                                    },
                                    {
                                        label: 'Province',
                                        type: 'ApiDropdown',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_province',
                                            optionLabel: 'name',
                                            items: []
                                        }
                                    },
                                    // {
                                    //     label: 'Province',
                                    //     type: 'InputText',
                                    //     props: {
                                    //         name: 'wt_province_other_country',
                                    //         placeholder: 'Enter Province',
                                    //         value: '',
                                    //     }
                                    // },
                                    {
                                        label: 'Bank Name',
                                        description: '',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_bank_name'
                                        }
                                    },
                                    {
                                        label: 'Account Name',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_account_name'
                                        }
                                    },
                                    {
                                        label: 'Account Number',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_account_number',
                                            maxLength: 12,
                                            useGrouping: false
                                        },
                                        validation_rules: {
                                            required: true,
                                            format: 'number',
                                            maxlength: 12
                                        }
                                    },
                                    // {
                                    //     label: 'Province',
                                    //     type: 'InputText',
                                    //     props: {
                                    //         name: 'wt_bank_province_other_country',
                                    //         placeholder: 'Enter Province',
                                    //         value: '',
                                    //     }
                                    // },
                                    {
                                        label: 'Street Address',
                                        type: 'InputText',
                                        props: {
                                            name: 'wt_bank_street_address',
                                            placeholder: 'Bank Street Address'
                                        }
                                    },
                                    {
                                        label: 'Bank City',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_city',
                                            placeholder: 'Enter City'
                                        }
                                    },
                                    {
                                        label: 'Bank Postal / Zip Code',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_postal_code',
                                            placeholder: 'Enter Postal Code'
                                        }
                                    },
                                    {
                                        label: 'Country',
                                        type: 'ApiDropdown',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_country',
                                            optionLabel: 'name',
                                            items: []
                                            // value: 'Canada'
                                        }
                                    },
                                    {
                                        label: 'Province',
                                        type: 'ApiDropdown',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_province',
                                            optionLabel: 'name',
                                            items: []
                                            // value: 'Ontario'
                                        }
                                    },
                                    {
                                        label: 'SWIFT / Routing Number',
                                        type: 'InputText',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_routing_swift_code_number'
                                        }
                                        // validation_rules: {
                                        //     required: true,
                                        //     minlength: 9,
                                        //     maxlength: 11
                                        // }
                                    },
                                    {
                                        label: 'CLABE Number',
                                        type: 'InputNumber',
                                        class: 'col-6',
                                        props: {
                                            name: 'wt_bank_clabe_number'
                                        }
                                        // validation_rules: {
                                        //     required: false,
                                        //     format: 'clabeNumber'
                                        // }
                                    },
                                    {
                                        label: 'Please provide an official document from your bank confirming the details above',
                                        type: 'FileUpload',
                                        props: {
                                            name: 'dd_wire_transfer_cheque_attachment',
                                            maxFileSize: 4000000
                                        }
                                    }
                                ]
                            },

                            claims_reimbursement_card: {
                                title: 'Please review the following reimbursement card terms',
                                description:
                                    '<p>1. YOUR AGREEMENT</p><p>By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use this site.</p><p>PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time. Unless otherwise indicated, amendments will become effective immediately. Please review these Terms and Conditions periodically. Your continued use of the Site following the posting of changes and/or modifications will constitute your acceptance of the revised Terms and Conditions and the reasonableness of these standards for notice of changes. For your information, this page was last updated as of the date at the top of these terms and conditions.</p><p>2. PRIVACY</p><p>Please review our Privacy Policy, which also governs your visit to this Site, to understand our practices.</p><p>3. LINKED SITES</p><p>This Site may contain links to other independent third-party Web sites ("Linked Sites”). These Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under our control, and we are not responsible for and does not endorse the content of such Linked Sites, including any information or materials contained on such Linked Sites. You will need to make your own independent judgment regarding your interaction with these Linked Sites.</p><p>12. GENERAL</p><p>A. If any provision of these Terms and Conditions is held to be invalid or unenforceable, the provision shall be removed (or interpreted, if possible, in a manner as to be enforceable), and the remaining provisions shall be enforced. Headings are for reference purposes only and in no way define, limit, construe or describe the scope or extent of such section. Our failure to act with respect to a breach by you or others does not waive our right to act with respect to subsequent or similar breaches. These Terms and Conditions set forth the entire understanding and agreement between us with respect to the subject contained herein and supersede any other agreement, proposals and communications, written or oral, between our representatives and you with respect to the subject hereof, including any terms and conditions on any of customer\'s documents or purchase orders.</p><p>B. No Joint Venture, No Derogation of Rights. You agree that no joint venture, partnership, employment, or agency relationship exists between you and us as a result of these Terms and Conditions or your use of the Site. Our performance of these Terms and Conditions is subject to existing laws and legal process, and nothing contained herein is in derogation of our right to comply with governmental, court and law enforcement requests or requirements relating to your use of the Site or information provided to or gathered by us with respect to such use.</p>',
                                fields: [
                                    {
                                        label: 'I agree to the terms of the above declaration',
                                        type: 'Checkbox',
                                        labelStyle: 'flex-order-1',
                                        class: 'col-12 flex-row align-items-center',
                                        props: {
                                            value: 'false',
                                            name: 'prepaid_card_terms_agreement',
                                            inputId:
                                                'prepaid_card_terms_agreement',
                                            binary: true
                                        }
                                        // condition: {
                                        //     true: {
                                        //         title: 'The reimbursement card will be sent to the following address:',
                                        //         description:
                                        //             'If you will not be living at this address within the next 4 weeks, please select another payment method.'
                                        //     }
                                        // }
                                    }
                                ]
                            },
                            prepaid_card_terms_agreement: {
                                title: 'The reimbursement card will be sent to the following address:',
                                description:
                                    'If you will <b>not</b> be living at this address within the next <b>4 weeks</b>, please select another payment method.'
                            }
                        }
                    }
                ]
            },
            {
                title: 'Review & Submit',
                description: 'Review Your Claim',
                path: 'review',
                fields: [
                    {
                        title: 'Policy Holder Details',
                        description: 'Contact Details'
                    },
                    {
                        title: 'Claim Details',
                        description: 'Claim Information'
                    },
                    {
                        title: 'Payment Details',
                        description: 'Payment Information'
                    },
                    {
                        label: 'Add New Expense',
                        description:
                            'Please make sure the new expense you are recording is having the same Payee. Failing to do so might result in delays in processing of the claims.'
                    },
                    {
                        label: 'Edit Expense Line',
                        description:
                            'Please make sure the expense you are recording is having the same Payee as other expenses. Failing to do so might result in delays in processing of the claims.'
                    },
                    {
                        label: 'Modify Payment Details',
                        description:
                            'Please Note that you are modifying the payment details of the claim. This would impact all the expenses logged for the claim.'
                    }
                ]
            }
        ]
    },
    terms_final: {
        title: 'Terms',
        description:
            'Please review and agree to the following terms before proceeding',
        fields: [
            {
                description:
                    '<p>1. YOUR AGREEMENT</p><p>By using this Site, you agree to be bound by, and to comply with, these Terms and Conditions. If you do not agree to these Terms and Conditions, please do not use this site.</p><p>PLEASE NOTE: We reserve the right, at our sole discretion, to change, modify or otherwise alter these Terms and Conditions at any time. Unless otherwise indicated, amendments will become effective immediately. Please review these Terms and Conditions periodically. Your continued use of the Site following the posting of changes and/or modifications will constitute your acceptance of the revised Terms and Conditions and the reasonableness of these standards for notice of changes. For your information, this page was last updated as of the date at the top of these terms and conditions.</p><p>2. PRIVACY</p><p>Please review our Privacy Policy, which also governs your visit to this Site, to understand our practices.</p><p>3. LINKED SITES</p><p>This Site may contain links to other independent third-party Web sites ("Linked Sites”). These Linked Sites are provided solely as a convenience to our visitors. Such Linked Sites are not under our control, and we are not responsible for and does not endorse the content of such Linked Sites, including any information or materials contained on such Linked Sites. You will need to make your own independent judgment regarding your interaction with these Linked Sites.</p><p>12. GENERAL</p><p>A. If any provision of these Terms and Conditions is held to be invalid or unenforceable, the provision shall be removed (or interpreted, if possible, in a manner as to be enforceable), and the remaining provisions shall be enforced. Headings are for reference purposes only and in no way define, limit, construe or describe the scope or extent of such section. Our failure to act with respect to a breach by you or others does not waive our right to act with respect to subsequent or similar breaches. These Terms and Conditions set forth the entire understanding and agreement between us with respect to the subject contained herein and supersede any other agreement, proposals and communications, written or oral, between our representatives and you with respect to the subject hereof, including any terms and conditions on any of customer\'s documents or purchase orders.</p><p>B. No Joint Venture, No Derogation of Rights. You agree that no joint venture, partnership, employment, or agency relationship exists between you and us as a result of these Terms and Conditions or your use of the Site. Our performance of these Terms and Conditions is subject to existing laws and legal process, and nothing contained herein is in derogation of our right to comply with governmental, court and law enforcement requests or requirements relating to your use of the Site or information provided to or gathered by us with respect to such use.</p>',
                label: 'I agree to the terms of the above declaration',
                type: 'Checkbox',
                name: 'claim_terms_final_agreement',
                value: true,
                validation_rules: { required: true }
            }
        ]
    },
    canadaPostKey: 'FP19-MW26-TM36-NA94',
    maximum_expenses: 5
};

export const CanadaPostScripts = () => {
    const script = document.createElement('script');
    script.src = `https://ws1.postescanada-canadapost.ca/js/addresscomplete-2.30.min.js?key=${cfg.canadaPostKey}`;
    script.async = true;
    document.head.appendChild(script);

    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = `https://ws1.postescanada-canadapost.ca/css/addresscomplete-2.30.min.css?key=${cfg.canadaPostKey}`;
    document.head.appendChild(style);
};

export const CanadaPost = (fieldList = [], formData, countries, provinces) => {
    let fields = [
        {
            element: fieldList[0],
            field: 'Line1',
            mode: [pca.fieldMode.DEFAULT]
        },
        { element: fieldList[1], field: 'Line2', mode: pca.fieldMode.POPULATE },
        { element: fieldList[2], field: 'City', mode: pca.fieldMode.POPULATE },
        {
            element: fieldList[3],
            field: 'PostalCode',
            mode: pca.fieldMode.POPULATE
        },
        {
            element: fieldList[4],
            field: 'ProvinceName',
            mode: pca.fieldMode.POPULATE
        },
        {
            element: fieldList[5],
            field: 'CountryName',
            mode: pca.fieldMode.COUNTRY
        }
    ];
    let options = { key: cfg.canadaPostKey };
    let control = new pca.Address(fields, options);

    control.listen('populate', function (address) {
        // console.log({ address });
        for (let i = 0; i < fields.length; i++) {
            if (fields[i].field === 'ProvinceName') {
                setTimeout(() => {
                    formData[fieldList[i]] = provinces.value.filter(
                        (province) =>
                            province.code === address.ProvinceCode &&
                            province.country?.id === address.CountryIso2
                    )?.[0];
                }, 200);
            } else if (fields[i].field === 'CountryName') {
                formData[fieldList[i]] = countries.value.filter(
                    (country) => country.id === address.CountryIso2
                )?.[0];
            } else {
                formData[fieldList[i]] = address[fields[i].field];
            }
        }
    });
};

export const getIndex = (fields, key) =>
    fields.findIndex((f) => f.props.name === key);

//  For validations
export function validator(format, value) {
    let regex = /^$/; // "";
    let msg = '';

    switch (format) {
        case 'email':
            regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
            msg = 'Please use a valid email format';
            break;
        case 'policyNumber': //regex can be either "/(.*)-(.*)-([a-zA-Z]+$)/" (for scenario :- "4411-8607503-GMI")
            regex = /^[0-9]+[0-9A-Za-z-]+[A-Za-z]+$/; ///^[0-9]+[0-9A-Za-z-]+[A-Za-z]+$/
            msg = 'Policy Number can only contain letters and numbers';
            break;
        case 'number':
            regex = /^\d+$/;
            msg = 'Please use numbers only';
            break;
        case 'phoneNumb':
            regex = /^[0-9]{3}[0-9]{3}[0-9]{4,6}$/i;
            msg = 'Not a valid phone number';
            break;
        case 'clName':
            regex = /^([A-Z ]+[,.'-]?[ ]?|[a-z]+[,.'-]?)+$/;
            msg = 'Not a valid name format';
            // regex = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;  // for internation names
            break;
        case 'fileFormat':
            regex = /\.(jpg|png|gif|bmp|pdf)$/i;
            msg =
                'Not a valid file format. Please use .pdf,.jpg,.jpeg,.png,.gif';
            break;
        case 'alphaOnly':
            regex = /^([A-Z ]+[,.]?[ ]?|[a-z]+['-]?)+$/;
            msg = 'Please use alphabets only';
            break;
        case 'alphaNum':
            regex = /^([a-zA-Z0-9 _-]+)$/;
            msg = 'Please use alphabets or numbers';
            break;
        case 'costDecimal':
            regex = /^[0-9]\d{0,9}(\.\d{1,3})?%?$/;
            msg = 'Not a valid cost format';
            break;
        case 'descriptionText':
            // regex = /^([a-zA-Z0-9 _\-!@#$%^&*(){}~`'+=";:,.\[\]<>?\\/→↑↓←À-Žà-ž|\n\t]+)$/;  ///^a-zA-Z0-9,:;\-.?! \n\t<>=_{}\[]→↑↓←\/$#+%&*()@~`|'"À-Žà-ž/
            regex =
                /^([a-zA-Z0-9 _\-!@#$%^&*(){}~`'+=";:,.\[\]<>?\\/→↑↓←À-Žà-ž|\n\t]+.*[^\s].*)$|^(?!\s*$).+$/;
            msg = 'Not a valid description text';
            break;
        case 'postalCode':
            regex =
                /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
            msg = 'Not a valid Postal Code';
            break;
        case 'cityName':
            regex = /^[A-Za-z].*[a-zA-Z]+.*$/i;
            msg = 'Not a valid city name';
            break;
        case 'provinceName':
            regex = /^[A-Za-z].*[a-zA-Z]+.*$/i;
            msg = 'Not a valid province name';
            break;
        case 'clabeNumber':
            regex = /^[0-9]\d{17}$/i;
            msg = 'Not a valid CLABE Number';
            break;
    }
    return regex.test(value) ? '' : msg;
    // return {regex,msg};
}

// Handling Next Buttons Visibility by counting errors
const validateField = (value, validateRule, required) =>
    (required && !value) || (value && validator(validateRule, value)) ? 1 : 0;

export const errorCounts = (stepIndex = 1, subFormData, popup = false) => {
    if (stepIndex < 0 || stepIndex > 3) return;
    let fields = cfg.claims_process.claimSteps[stepIndex].fields;

    return subFormData
        ? fields.reduce((errorCount, field) => {
              const { required, condition } = field;
              const { name = '', validate = '' } = field.props;

              if (name.endsWith('[]')) return errorCount;

              let fieldValue = subFormData[name];

              if (stepIndex === 1 && !popup) {
                  if (name !== 'other_insurance_plan') {
                      fieldValue = subFormData?.expenses?.[0]?.[name];
                  } else if (fieldValue === 'other_insurance_plan_yes') {
                      const innerFields =
                          field.condition[fieldValue]?.fields || [];
                      errorCount += innerFields.reduce(
                          (innerErrorCount, innerField) => {
                              const innerName = innerField.props.name;
                              const innerValue = subFormData[innerName];
                              return (
                                  innerErrorCount +
                                  validateField(
                                      innerValue,
                                      innerField.props.validate || '',
                                      innerField.required
                                  )
                              );
                          },
                          0
                      );
                  }
              } else if (stepIndex === 1 && name === 'other_insurance_plan') {
                  return errorCount;
              }

              errorCount += validateField(fieldValue, validate, required);
              return errorCount;
          }, 0)
        : 1;
};
