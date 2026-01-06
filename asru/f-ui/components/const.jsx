export const fileTypesAcceptedBUW = {
    acceptedDocumentType1: ['.xlsx'],
    acceptedDocumentType2: ['.xls'],
    acceptedDocumentType3: ['.xlsm']
};

export const fileTypesAcceptedBDA = {
    acceptedDocumentType1: ['.xlsx'],
    acceptedDocumentType2: ['.xls'],
};

export const PAGE_NAME = {
    HISTORY: 'history',
    UPLOAD_FILE: 'uploadFile',
    GENERATE: 'generate'
};

export const trainingDocumentUrl = 'https://s3api-core.uhc.com/renewal-xml-dev/Internal%20Sales_Census%20X-Formatter.docx'; // Replace with the actual path to your Word document

export const supportEmail = 'CenXFormatter_Support@ds.uhc.com';

export const OUTPUT_OPTIONS_WITH_DISABLED_BUW = [
    { value: 'BDA', label: 'BDA Report' },
    { value: 'BUW', label: 'BUW Report', isDisabled: true }
];

export const OUTPUT_OPTIONS = [
    { value: 'BDA', label: 'BDA Report' },
    { value: 'BUW', label: 'BUW Report' }
];

export const getOutputOptions = (isDisableBUWSelection) => {
    if (isDisableBUWSelection) {
        return OUTPUT_OPTIONS_WITH_DISABLED_BUW;
    }
    return OUTPUT_OPTIONS;
};

export const BDA = 'BDA';

export const BUW = 'BUW';

export const FILE_TYPE = {
    CONVERTED_FILE: 'Converted File',
    ORIGINAL_FILE: 'Original File'
};

export const CONVERT_STATUS = {
    COMPLETED: 'Completed',
    COMPLETED_WITH_ERRORS: 'Completed with errors',
    ERRORED_OUT: 'Errored Out'
};

export const ALLOWED_GROUPS = [
    'AZU_censusxformatter_Dev',
    'AZU_censusxformatter_stg',
    'AZU_censusxformatter_prod',
    'AZU_censusxformatter_admin_Dev',
    'AZU_censusxformatter_admin_stg',
    'AZU_censusxformatter_admin_prod'
];

export const ALLOWED_ROLES = ['InternalUser-CensusX-Formatter', 'InternalUser-Admin-CensusX-Formatter', 'InternalDevSupportTeamRole', 'InternalDevSupportTeam'];

export const defaultUserInfo = {
    email: "test@optum.com",
    preferredName: "Test",
    roles: [
        "InternalUser-BenefitExtractor",
        "InternalUser-BDA-CensusX-Formatter",
        "InternalUser-PlanX-Finder"
    ],
    name: "Test , test",
    msId: "dev01"
};

export const fileTypesAcceptedBDAText = "Drag your .xlsx or .xls file here"  ;
export const fileTypesAcceptedBUWText = "Drag your .xlsx or .xls or .xlsm file here"  ;