export const ruleTimeline = [
    { name: 'Days', code: 'day' },
    { name: 'Weeks', code: 'week' },
    { name: 'Months', code: 'month' },
    { name: 'Calendar Year', code: 'calendar_year' },
    { name: 'Plan Year', code: 'plan_year' }
];

export const ruleSupply = [
    { name: 'Dollars', code: 'dollars' },
    { name: 'Units', code: 'units' },
    { name: 'Visits', code: 'visits' },
    { name: 'Day Supply', code: 'day_supply' }
];

export const minDurations = [
    { name: 'Days', code: 'day' },
    { name: 'Weeks', code: 'week' },
    { name: 'Months', code: 'month' },
    { name: 'Quarters', code: 'quarter' },
    { name: 'Years', code: 'year' }
];

export const minRequirements = [
    { name: 'Less than equal to', code: 'lte' },
    { name: 'Less than', code: 'lt' },
    { name: 'Greater than equal to', code: 'gte' },
    { name: 'Greater than', code: 'gt' },
    { name: 'Equal ', code: 'e' }
];

export const joinTypes = [
    { name: 'And', code: 'and' },
    { name: 'Or', code: 'or' }
];

export const enrollmentType = [
    { name: 'File Transfer', code: 'file transfer' },
    { name: 'API', code: 'api' },
    { name: 'Online', code: 'online' }
];

export const clientTypes = [
    { name: 'Shared', code: 'shared' },
    { name: 'Silo', code: 'silo' }
];

export const paymentTypes = [
    { name: 'COD', code: 'cod' },
    { name: 'Pay Later', code: 'later' }
];

export const paymentTerms = [
    { name: '30 Days', code: '30-days' },
    { name: '15 Days', code: '15-days' }
];

export const invoiceFrequency = [
    { name: 'Weekly', code: 'weekly' },
    { name: 'Bi-Weekly', code: 'biweekly' },
    { name: 'Monthly', code: 'monthly' },
    { name: 'Bi-Monthly', code: 'bimonthly' },
    { name: 'Semester', code: 'semester' }
];

export const availableLocale = [
    { name: 'English', code: 'en' },
    { name: 'French', code: 'fr' }
];

export const unitTerms = [
    { id: 'daily', name: 'unit_terms.daily' },
    { id: 'flat_rate', name: 'unit_terms.flat_rate' },
    { id: 'monthly', name: 'unit_terms.monthly' },
    { id: 'two_months', name: 'unit_terms.two_months' },
    { id: 'four_months', name: 'unit_terms.four_months' },
    { id: 'six_months', name: 'unit_terms.six_months' },
    { id: 'yearly', name: 'unit_terms.yearly' },
    { id: 'flat_daily', name: 'unit_terms.flat_daily' },
    { id: 'flat_monthly', name: 'unit_terms.flat_monthly' },
    { id: 'weekly', name: 'unit_terms.weekly' }
];

export const unitTermsMapper = {
    daily: 'days',
    eight_months: 'months',
    flat_daily: 'days',
    flat_monthly: 'months',
    flat_rate: 'days',
    monthly: 'months',
    six_months: 'months',
    two_months: 'months',
    four_months: 'months',
    weekly: 'weeks',
    yearly: 'months'
};

export const contactSources = [
    { id: 'message_center', name: 'Message Centre' },
    { id: 'call', name: 'Call' },
    { id: 'email', name: 'E-mail' },
    { id: 'policy_holder', name: 'Policy Holder' },
    { id: '3rd_party', name: '3rd Party' },
    { id: 'other', name: 'Other' }
];

export const genders = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'other', name: 'Other' },
    {
        id: 'non_binary_or_non_conforming',
        name: 'Non-binary or Non-conforming'
    },
    { id: 'transgender', name: 'Transgender' },
    { id: 'prefer_not_to_respond', name: 'Prefer not to respond' }
];

export const orderStatus = {
    DRAFT: 'draft',
    PENDING: 'pending',
    CONFIRMED: 'confirmed'
};

export const days = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
];
export const shortDateFormats = [
    { label: 'M/d/yyyy', value: 'M/d/yyyy', example: '3/27/2025' },
    { label: 'M/d/yy', value: 'M/d/yy', example: '3/27/25' },
    { label: 'MM/dd/yy', value: 'MM/dd/yy', example: '03/27/25' },
    { label: 'MM/dd/yyyy', value: 'MM/dd/yyyy', example: '03/27/2025' },
    { label: 'yy/MM/dd', value: 'yy/MM/dd', example: '25/03/27' },
    { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd', example: '2025-03-27' },
    { label: 'dd-MMM-yy', value: 'dd-MMM-yy', example: '27-Mar-25' }
];

export const longDateFormats = [
    {
        label: 'dddd, MMMM d,yyyy',
        value: 'dddd, MMMM d,yyyy',
        example: 'Thursday, March 27, 2025'
    },
    { label: 'MMMM d, yyyy', value: 'MMMM d, yyyy', example: 'March 27, 2025' },
    {
        label: 'dddd, d MMMM, yyyy',
        value: 'dddd, d MMMM, yyyy',
        example: 'Thursday, 27 March, 2025'
    },
    { label: 'd MMMM, yyyy', value: 'd MMMM, yyyy', example: '27 March, 2025' }
];

export const shortTimeFormats = [
    { label: 'h:mm tt', value: 'h:mm tt', example: '3:45 PM' },
    { label: 'hh:mm tt', value: 'hh:mm tt', example: '03:45 PM' },
    { label: 'H:mm', value: 'H:mm', example: '9:05' },
    { label: 'HH:mm', value: 'HH:mm', example: '09:05' }
];

export const longTimeFormats = [
    { label: 'h:mm:ss tt', value: 'h:mm:ss tt', example: '3:45:12 PM' },
    { label: 'hh:mm:ss tt', value: 'hh:mm:ss tt', example: '03:45:12 PM' },
    { label: 'H:mm:ss', value: 'H:mm:ss', example: '9:05:12' },
    { label: 'HH:mm:ss', value: 'HH:mm:ss', example: '09:05:12' }
];

export const exportOptions = [
    { label: 'CSV', icon: 'pi pi-file-import' },
    { label: 'Excel', icon: 'pi pi-file-excel' },
    { label: 'PDF', icon: 'pi pi-file-pdf' },
    { label: 'Print', icon: 'pi pi-print' }
];

export const searchableFields = {
    claims: ['Claim Received Date', 'Claim Reference Number', 'Claim Status'],
    expenses: [
        'Received Date',
        'Status',
        'Service Date',
        'Benefit',
        'Diagnosis'
    ],
    benefits: ['Benefit Name']
};

export const InsuredDependentRelations = {
    PARENT: 'parent',
    SIBLING: 'sibling',
    SPOUSE: 'spouse',
    CHILD: 'child'
};

export const planCategories = {
    early_arrivals: 'Early Arrivals',
    gap: 'Gap',
    dependants: 'Dependants',
    recent_graduate: 'Recent Graduate'
};

export const communicationSource = {
    email: 'Email',
    chat: 'Chat',
    phone: 'Phone',
    text: 'Text'
};

export const documentType = {
    agreement: 'Agreement',
    invoice: 'Invoice',
    medical_record: 'Medical Record'
};

export const taskPriority = {
    low: 'task_priority.low',
    normal: 'task_priority.normal',
    urgent: 'task_priority.urgent'
};

export const activityLevels = [
    { name: 'Level: All', id: 'All' },
    { name: 'Level: Business Unit', id: 'business-unit' },
    { name: 'Level: Insured', id: 'insured' },
    { name: 'Level: Plan', id: 'plan' },
    { name: 'Level: Policy', id: 'policy' },
    { name: 'Level: Claim', id: 'claim' },
    { name: 'Level: Submission', id: 'submission' },
    { name: 'Level: Expense', id: 'expense' }
];

export const BeneficiaryTypes = {
    SELF: { label: 'Self', value: 'insured' },
    EXTERNAL: { label: 'External', value: 'external' }
};

export const BeneficiaryPayOptionEnum = {
    CHEQUE: { label: 'Cheque', value: 'cheque' },
    DIRECT_DEPOSIT: { label: 'Direct Deposit', value: 'direct_deposit' },
    WIRE_TRANSFER: { label: 'Wire Transfer', value: 'wire_transfer' },
    CLAIM_REIMBURSEMENT: {
        label: 'Claim Reimbursement Card',
        value: 'claim_reimbursement'
    }
};

export const BeneficiaryPayOptions = Object.values(BeneficiaryPayOptionEnum);

export const PolicyModulePermission = {
    POLICIES: {
        VIEW: 'view policies',
        CREATE: 'create policies',
        UPDATE: 'update policies'
    },
    INSUREDS: {
        INSUREDS: {
            VIEW: 'view insureds',
            UPDATE: 'update insureds'
        },
        NON_INSURANCE_PRODUCTS: {
            VIEW: 'view insureds non-insurance products',
            CREATE: 'create insureds non-insurance products',
            UPDATE: 'update insureds non-insurance products',
            DELETE: 'delete insureds non-insurance products'
        },
        DEPENDENTS: {
            VIEW: 'view insureds dependents',
            CREATE: 'create insureds dependents',
            UPDATE: 'update insureds dependents',
            DELETE: 'delete insureds dependents'
        },
        BENEFICIARIES: {
            VIEW: 'view insureds beneficiaries',
            CREATE: 'create insureds beneficiaries',
            UPDATE: 'update insureds beneficiaries',
            DELETE: 'delete insureds beneficiaries'
        }
    }
};

export const invoiceStatuses = {
    DRAFT: { value: 'draft', display_name: 'Draft' },
    UNPAID: { value: 'unpaid', display_name: 'Unpaid' },
    OVERDUE: { value: 'overdue', display_name: 'Overdue' },
    PENDING: { value: 'pending', display_name: 'Pending' },
    PAID: { value: 'paid', display_name: 'Paid' },
    CANCELLED: { value: 'cancelled', display_name: 'Cancelled' },
    VOID: { value: 'void', display_name: 'Void' },
    PARTIAL_PYMT: { value: 'partial_pymt', display_name: 'Partial Pymt' }
};

export const invoicePaymentOptions = {
    BANK_TRANSFER: { value: 'bank_transfer', display_name: 'Bank Transfer' },
    CHEQUE: { value: 'cheque', display_name: 'Cheque' },
    CREDIT_CARD: { value: 'credit_card', display_name: 'Credit Card' },
    CREDIT_APPLIED: { value: 'credit_note', display_name: 'Credit Applied' },
    PAYPAL: { value: 'paypal', display_name: 'PayPal' },
    PAYMENT_LINK: { value: 'payment_link', display_name: 'Payment Link' }
};

export const activityDisplayModes = {
    one_column: 'one-column',
    two_column: 'two-column'
};

export const auditStatus = {
    audited_completed: 'audited_completed',
    audited_pending: 'audited_pending',
    audited_declined: 'audited_declined'
};

export const cancellationPeriodTypeOptions = [
    { name: 'Fixed Date', value: 'fixed_date' },
    { name: 'Opt Out Window', value: 'opt_out_window' }
];

export const cancellationPeriodUnitOptions = [
    { name: 'Days', value: 'days' },
    { name: 'Weeks', value: 'weeks' },
    { name: 'Months', value: 'months' },
    { name: 'Years', value: 'years' }
];

export const automaticCancellationConditions = [
    {
        name: 'Alternate Insurance Full Coverage',
        value: 'full_coverage',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        name: 'Alternate Insurance Partial Coverage',
        value: 'partial_coverage',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    },
    {
        name: 'Alternate Insurance Custom Date',
        value: 'custom_date',
        info: 'lorem ipsum lorem ipsum lorem ipsum.'
    }
];

export const smartFilterEntityTypes = {
    CLIENT: 'client_id',
    BUSINESS_UNIT: 'business_unit_id',
    HOLDING: 'holding_id',
    PLAN: 'plan_id',
    START_DATE: 'start_date'
};

export const communicationTemplateTypes = [
    { label: 'Email', value: 'email' },
    { label: 'Notification', value: 'notification' },
    { label: 'Message', value: 'message' }
];

export const communicationTemplateLangs = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
];

export const claimStatuses = {
    PENDING: { value: 'pending', display_name: 'Pending' },
    REVIEW: { value: 'review', display_name: 'Review' },
    COMPLETED: { value: 'completed', display_name: 'Completed' },
    APPROVED: { value: 'approved', display_name: 'Approved' },
    DECLINED: { value: 'declined', display_name: 'Declined' },
    RETURNED: { value: 'returned', display_name: 'Returned' }
};

export const submissionSources = {
    ADMIN_PORTAL: { value: 'admin_portal', display_name: 'Admin Portal' },
    BATCH_TRANSFER: { value: 'batch_transfer', display_name: 'Batch Transfer' },
    CLINIC_PORTAL: { value: 'clinic_portal', display_name: 'Clinic Portal' },
    WEB_SITE: { value: 'web_site', display_name: 'Web Site' },
    HIVE_EMAIL: { value: 'email', display_name: 'Email' },
    HIVE_MAIL: { value: 'mail', display_name: 'Mail' },
    HIVE_FAX: { value: 'fax', display_name: 'Fax' },
    MINOR_CLAIM: { value: 'minor_claim', display_name: 'Minor Claim' },
    MOBILE_APP: { value: 'mobile_app', display_name: 'Mobile App' }
};
